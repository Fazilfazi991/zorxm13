<?php
/**
 * Content Decay Tracker Module
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Content_Decay' ) ) {

	/**
	 * Class SEO_Copilot_Content_Decay
	 */
	class SEO_Copilot_Content_Decay {

		/**
		 * Constructor.
		 */
		public function __construct() {
			// Hook into Dashboard menus.
			add_action( 'current_screen', [ $this, 'init_view' ] );

			// AJAX handlers
			add_action( 'wp_ajax_seo_copilot_get_decay_data', [ $this, 'ajax_get_decay_data' ] );
			add_action( 'wp_ajax_seo_copilot_get_revival_plan', [ $this, 'ajax_get_revival_plan' ] );
			add_action( 'wp_ajax_seo_copilot_mark_refreshed', [ $this, 'ajax_mark_refreshed' ] );
		}

		/**
		 * Initialize admin view hook.
		 */
		public function init_view() {
			$screen = get_current_screen();
			if ( ! $screen || 'seo-copilot_page_seo-copilot-content-decay' !== $screen->id ) {
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
					if ( 'seo-copilot-content-decay' === $item[2] ) {
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
			require_once SEO_COPILOT_PLUGIN_DIR . 'admin/views/decay.php';
		}

		// -------------------------------------------------------------------------
		// DECAY SCORING ENGINE
		// -------------------------------------------------------------------------

		/**
		 * Get all decay data in bulk.
		 */
		public function get_all_decay_data() {
			$options    = get_option( 'seo_copilot_settings', [] );
			$post_types = isset( $options['post_types'] ) ? $options['post_types'] : [ 'post', 'page' ];

			$args = [
				'post_type'      => $post_types,
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'fields'         => 'ids',
			];
			$query = new \WP_Query( $args );
			$results = [];

			foreach ( $query->posts as $post_id ) {
				$decay_info = $this->calculate_decay_score( $post_id );
				$results[] = $decay_info;
			}

			// Sort by decay risk descending
			usort( $results, function ( $a, $b ) {
				return $b['risk_score'] <=> $a['risk_score'];
			});

			return $results;
		}

		/**
		 * Calculate decay risk (0-100) for a specific post.
		 */
		public function calculate_decay_score( $post_id ) {
			$post = get_post( $post_id );
			$risk_score = 0;
			$factors = [];

			$options = get_option( 'seo_copilot_settings', [] );
			$min_words = isset( $options['min_word_count'] ) ? intval( $options['min_word_count'] ) : 300;

			// Signal 1: Post age / Since last updated
			$modified_time = get_post_modified_time( 'U', false, $post );
			$days_since_update = ( current_time( 'timestamp' ) - $modified_time ) / ( 60 * 60 * 24 );

			if ( $days_since_update > 365 ) {
				$risk_score += 40;
				$factors[] = sprintf( __( 'Not updated in %d months', 'seo-copilot' ), floor( $days_since_update / 30 ) );
			} elseif ( $days_since_update > 180 ) {
				$risk_score += 20;
				$factors[] = sprintf( __( 'Not updated in %d months', 'seo-copilot' ), floor( $days_since_update / 30 ) );
			}

			// Signal 2: Content deletion / Word count drop
			$content = wp_strip_all_tags( apply_filters( 'the_content', $post->post_content ) );
			$word_count = str_word_count( $content );
			if ( $word_count < $min_words ) {
				$risk_score += 20;
				$factors[] = __( 'Word count fell below minimum', 'seo-copilot' );
			}

			// Signal 3: No recent comments (assuming active comments matter for this metric)
			if ( post_type_supports( $post->post_type, 'comments' ) ) {
				$last_comment = get_comments( [ 'post_id' => $post->ID, 'number' => 1 ] );
				if ( ! empty( $last_comment ) ) {
					$c_time = strtotime( $last_comment[0]->comment_date );
					$c_days = ( current_time( 'timestamp' ) - $c_time ) / ( 60 * 60 * 24 );
					if ( $c_days > 90 ) {
						// $risk_score += 10;
						// Optional addition, ignored in strict scoring for now.
					}
				}
			}

			// Signal 4: Score Dropped historically
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_score_history';
			$history = $wpdb->get_results( $wpdb->prepare(
				"SELECT score FROM $table WHERE post_id = %d ORDER BY recorded_at DESC LIMIT 5",
				$post_id
			), ARRAY_A );

			$history_points = [];
			if ( ! empty( $history ) ) {
				foreach ( $history as $h ) {
					$history_points[] = intval( $h['score'] );
				}
				$history_points = array_reverse( $history_points ); // Chronological (oldest to newest)
				
				$current_score = get_post_meta( $post_id, '_seo_copilot_score', true );
				$current_score = intval( $current_score );

				if ( count( $history_points ) >= 1 ) {
					$oldest_score = $history_points[0];
					if ( $oldest_score - $current_score >= 10 ) {
						$risk_score += 30;
						$factors[] = sprintf( __( 'Score dropped by %d pts', 'seo-copilot' ), $oldest_score - $current_score );
					}
				}
				// Append current score to the end of sparkline data
				$history_points[] = $current_score;
			} else {
				$current_score = get_post_meta( $post_id, '_seo_copilot_score', true );
				$history_points[] = intval( $current_score ); // At least one point for the chart
			}

			// Normalize max 100
			$risk_score = min( 100, $risk_score );

			// Determine Risk Level string
			$level = 'healthy';
			if ( $risk_score >= 70 ) $level = 'high';
			elseif ( $risk_score >= 40 ) $level = 'medium';

			return [
				'post_id'    => $post_id,
				'post_title' => $post->post_title,
				'risk_score' => $risk_score,
				'level'      => $level,
				'factors'    => $factors,
				'sparkline'  => $history_points,
			];
		}

		// -------------------------------------------------------------------------
		// AJAX HANDLERS
		// -------------------------------------------------------------------------

		/**
		 * For dynamic data refresh in frontend if needed, though we will load inline initially.
		 */
		public function ajax_get_decay_data() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			wp_send_json_success( $this->get_all_decay_data() );
		}

		/**
		 * AI logic to generate revival plan
		 */
		public function ajax_get_revival_plan() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			$post = get_post( $post_id );
			if ( ! $post ) wp_send_json_error();

			$provider = SEO_Copilot_AI_Factory::get_provider();
			
			// We can hijack the 'analyze_decay' or standard method in provider
			// We pass the content and the "drop data" / factors
			$decay_data = $this->calculate_decay_score( $post->ID );
			$content  = apply_filters( 'the_content', $post->post_content );
			
			$result = $provider->analyze_decay( $content, $decay_data['factors'] );

			if ( is_wp_error( $result ) ) {
				wp_send_json_error( $result->get_error_message() );
			}

			wp_send_json_success( $result );
		}

		/**
		 * Mark as refreshed (touches modified date so factors clear out)
		 */
		public function ajax_mark_refreshed() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			$post = get_post( $post_id );
			if ( ! $post ) wp_send_json_error();

			// Update the post modified date
			wp_update_post( [
				'ID' => $post_id,
			] );

			// Empty score history since we revived it
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_score_history';
			$wpdb->delete( $table, [ 'post_id' => $post_id ], [ '%d' ] );

			wp_send_json_success( __( 'Post marked as refreshed and decay flags reset.', 'seo-copilot' ) );
		}
	}
}

add_action( 'plugins_loaded', function() {
	new SEO_Copilot_Content_Decay();
});
