<?php
/**
 * Cannibalization Module
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Cannibalization' ) ) {

	/**
	 * Class SEO_Copilot_Cannibalization
	 */
	class SEO_Copilot_Cannibalization {

		/**
		 * Constructor.
		 */
		public function __construct() {
			// Hook into Dashboard menus.
			add_action( 'current_screen', [ $this, 'init_view' ] );

			// AJAX handlers
			add_action( 'wp_ajax_seo_copilot_scan_conflicts', [ $this, 'ajax_scan_conflicts' ] );
			add_action( 'wp_ajax_seo_copilot_get_conflict_recommendation', [ $this, 'ajax_get_conflict_recommendation' ] );
			add_action( 'wp_ajax_seo_copilot_resolve_conflict', [ $this, 'ajax_resolve_conflict' ] );
		}

		/**
		 * Initialize admin view hook.
		 */
		public function init_view() {
			$screen = get_current_screen();
			if ( ! $screen || 'seo-copilot_page_seo-copilot-keyword-conflicts' !== $screen->id ) {
				return;
			}
			add_action( 'admin_menu', [ $this, 'override_callback' ], 90 );
		}

		/**
		 * Override submenu callback.
		 */
		public function override_callback() {
			global $submenu;
			if ( isset( $submenu['seo-copilot'] ) ) {
				foreach ( $submenu['seo-copilot'] as &$item ) {
					if ( 'seo-copilot-keyword-conflicts' === $item[2] ) {
						$item[4] = [ $this, 'render_view' ];
						break;
					}
				}
			}
		}

		/**
		 * Render View.
		 */
		public function render_view() {
			require_once SEO_COPILOT_PLUGIN_DIR . 'admin/views/cannibalization.php';
		}

		// -------------------------------------------------------------------------
		// DETECTION ENGINE
		// -------------------------------------------------------------------------

		/**
		 * Run detection for all keyword conflicts.
		 */
		public function detect_conflicts() {
			global $wpdb;

			// Clear existing conflicts table
			$table = $wpdb->prefix . 'seo_copilot_conflicts';
			$wpdb->query( "TRUNCATE TABLE $table" );
			
			// Get all posts with focus keywords (and exclude resolved ones)
			// For scale, pulling title, ID, and keyword into memory for N^2 comparison.
			// This works for smaller/medium sites.
			$options    = get_option( 'seo_copilot_settings', [] );
			$post_types = isset( $options['post_types'] ) ? $options['post_types'] : [ 'post', 'page' ];
			$in_types   = "'" . implode( "','", array_map( 'esc_sql', $post_types ) ) . "'";

			$sql = $wpdb->prepare(
				"
				SELECT p.ID, p.post_title, p.post_content, pm.meta_value as keyword
				FROM $wpdb->posts p
				JOIN $wpdb->postmeta pm ON p.ID = pm.post_id
				WHERE p.post_status = 'publish' 
				  AND p.post_type IN ({$in_types})
				  AND pm.meta_key = %s
				  AND pm.meta_value != ''
				  AND NOT EXISTS (
				  	SELECT 1 FROM $wpdb->postmeta pm2 
				  	WHERE pm2.post_id = p.ID 
				  	AND pm2.meta_key = '_seo_copilot_conflict_resolved' 
				  	AND pm2.meta_value = '1'
				  )
				",
				'_seo_copilot_focus_keyword'
			);

			$posts_data = $wpdb->get_results( $sql );
			if ( ! $posts_data ) return 0;

			$conflicts_found = 0;
			$count = count( $posts_data );

			for ( $i = 0; $i < $count; $i++ ) {
				for ( $j = $i + 1; $j < $count; $j++ ) {
					
					$post_a = $posts_data[$i];
					$post_b = $posts_data[$j];

					$ka = strtolower( trim( $post_a->keyword ) );
					$kb = strtolower( trim( $post_b->keyword ) );

					$score = 0;
					$shared_kw = '';

					// 1. Identical keywords
					if ( $ka === $kb ) {
						$score = 100;
						$shared_kw = $ka;
					} 
					// 2. Similar keywords (80-99%)
					else {
						similar_text( $ka, $kb, $percent );
						if ( $percent >= 80 ) {
							$score = 75;
							$shared_kw = $ka . ' / ' . $kb;
						}
					}

					// 3. Same keyword in both titles (if 1 & 2 failed)
					if ( $score === 0 ) {
						$ta = strtolower( $post_a->post_title );
						$tb = strtolower( $post_b->post_title );
						
						if ( strpos( $ta, $ka ) !== false && strpos( $tb, $ka ) !== false ) {
							$score = 60;
							$shared_kw = $ka;
						} elseif ( strpos( $ta, $kb ) !== false && strpos( $tb, $kb ) !== false ) {
							$score = 60;
							$shared_kw = $kb;
						}
					}

					// 4. Same keyword in first paragraph
					if ( $score === 0 ) {
						$ca_words = strtolower( implode( ' ', array_slice( explode( ' ', wp_strip_all_tags( $post_a->post_content ) ), 0, 50 ) ) );
						$cb_words = strtolower( implode( ' ', array_slice( explode( ' ', wp_strip_all_tags( $post_b->post_content ) ), 0, 50 ) ) );

						if ( strpos( $ca_words, $ka ) !== false && strpos( $cb_words, $ka ) !== false ) {
							$score = 40;
							$shared_kw = $ka;
						} elseif ( strpos( $ca_words, $kb ) !== false && strpos( $cb_words, $kb ) !== false ) {
							$score = 40;
							$shared_kw = $kb;
						}
					}

					if ( $score > 0 ) {
						// Record conflict
						$wpdb->insert(
							$table,
							[
								'post_id_1'      => $post_a->ID,
								'post_id_2'      => $post_b->ID,
								'shared_keyword' => $shared_kw,
								'conflict_score' => $score,
								'created_at'     => current_time( 'mysql' ),
							],
							[ '%d', '%d', '%s', '%d', '%s' ]
						);
						$conflicts_found++;
					}
				}
			}

			update_option( 'seo_copilot_last_conflict_scan', current_time( 'mysql' ) );
			return $conflicts_found;
		}

		// -------------------------------------------------------------------------
		// AJAX HANDLERS
		// -------------------------------------------------------------------------

		/**
		 * Scan Conflicts
		 */
		public function ajax_scan_conflicts() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$count = $this->detect_conflicts();
			
			wp_send_json_success( [
				'count'   => $count,
				'message' => sprintf( __( 'Scanned successfully. %d conflicts found.', 'seo-copilot' ), $count )
			] );
		}

		/**
		 * Ask AI what to do about a specific conflict
		 */
		public function ajax_get_conflict_recommendation() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$conflict_id = isset( $_POST['conflict_id'] ) ? absint( $_POST['conflict_id'] ) : 0;
			
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_conflicts';
			$conflict = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $conflict_id ) );

			if ( ! $conflict ) {
				wp_send_json_error( __( 'Conflict not found.', 'seo-copilot' ) );
			}

			$post_1 = get_post( $conflict->post_id_1 );
			$post_2 = get_post( $conflict->post_id_2 );

			$post_1_data = [
				'id'            => $post_1->ID,
				'title'         => $post_1->post_title,
				'excerpt'       => wp_trim_words( wp_strip_all_tags( $post_1->post_content ), 100 ),
				'focus_keyword' => get_post_meta( $post_1->ID, '_seo_copilot_focus_keyword', true ),
				'url'           => get_permalink( $post_1->ID )
			];

			$post_2_data = [
				'id'            => $post_2->ID,
				'title'         => $post_2->post_title,
				'excerpt'       => wp_trim_words( wp_strip_all_tags( $post_2->post_content ), 100 ),
				'focus_keyword' => get_post_meta( $post_2->ID, '_seo_copilot_focus_keyword', true ),
				'url'           => get_permalink( $post_2->ID )
			];

			$provider = SEO_Copilot_AI_Factory::get_provider();
			$result = $provider->detect_cannibalization( [ $post_1_data, $post_2_data ] );

			if ( is_wp_error( $result ) ) {
				wp_send_json_error( $result->get_error_message() );
			}

			// Store recommendation in DB
			$wpdb->update(
				$table,
				[ 'recommendation' => wp_json_encode( $result ) ],
				[ 'id' => $conflict_id ],
				[ '%s' ],
				[ '%d' ]
			);

			wp_send_json_success( $result );
		}

		/**
		 * Mark a conflict as resolved
		 */
		public function ajax_resolve_conflict() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$conflict_id = isset( $_POST['conflict_id'] ) ? absint( $_POST['conflict_id'] ) : 0;
			if ( ! $conflict_id ) wp_send_json_error();

			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_conflicts';
			// Delete the conflict manually from our feed
			$wpdb->delete( $table, [ 'id' => $conflict_id ], [ '%d' ] );

			wp_send_json_success();
		}

	}
}

add_action( 'plugins_loaded', function() {
	new SEO_Copilot_Cannibalization();
});
