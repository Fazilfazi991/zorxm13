<?php
/**
 * Site Audit Module
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Site_Audit' ) ) {

	/**
	 * Class SEO_Copilot_Site_Audit
	 */
	class SEO_Copilot_Site_Audit {

		/**
		 * Constructor.
		 */
		public function __construct() {
			// Hook into Dashboard menus.
			add_action( 'current_screen', [ $this, 'init_view' ] );

			// AJAX handlers
			add_action( 'wp_ajax_seo_copilot_run_batch_audit', [ $this, 'ajax_run_batch_audit' ] );
			add_action( 'wp_ajax_seo_copilot_get_ai_suggestions', [ $this, 'ajax_get_ai_suggestions' ] );
			add_action( 'wp_ajax_seo_copilot_export_audit_csv', [ $this, 'ajax_export_audit_csv' ] );
		}

		/**
		 * Initialize admin view hook.
		 */
		public function init_view() {
			$screen = get_current_screen();
			if ( ! $screen || 'seo-copilot_page_seo-copilot-site-audit' !== $screen->id ) {
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
					if ( 'seo-copilot-site-audit' === $item[2] ) {
						$item[4] = [ $this, 'render_view' ];
						break;
					}
				}
			}
		}

		/**
		 * Render Site Audit HTML.
		 */
		public function render_view() {
			require_once SEO_COPILOT_PLUGIN_DIR . 'admin/views/site-audit.php';
		}

		// -------------------------------------------------------------------------
		// SCORING ENGINE
		// -------------------------------------------------------------------------

		/**
		 * Complete Audit Runner for a single post.
		 * 
		 * @param int $post_id The post ID.
		 * @return array Result of the audit.
		 */
		public function audit_post( $post_id ) {
			$post = get_post( $post_id );
			if ( ! $post ) return false;

			$score = 0;
			$issues = [];
			
			$keyword = strtolower( trim( (string) get_post_meta( $post_id, '_seo_copilot_focus_keyword', true ) ) );
			$title = (string) get_post_meta( $post_id, '_seo_copilot_meta_title', true );
			$desc = (string) get_post_meta( $post_id, '_seo_copilot_meta_description', true );
			
			$content = apply_filters( 'the_content', $post->post_content );
			$content_stripped = wp_strip_all_tags( $content );
			$word_count = str_word_count( $content_stripped );

			// 1. TITLE CHECKS (20 pts)
			if ( ! empty( $title ) ) {
				$score += 5;
			} else {
				$issues[] = __( 'Critical: Meta title is missing.', 'seo-copilot' );
			}
			
			$title_len = mb_strlen( $title );
			if ( $title_len >= 30 && $title_len <= 60 ) {
				$score += 5;
			} else if ( ! empty( $title ) ) {
				$issues[] = __( 'Warning: Meta title is not between 30 and 60 characters.', 'seo-copilot' );
			}

			if ( ! empty( $keyword ) && ! empty( $title ) && stripos( $title, $keyword ) !== false ) {
				$score += 5;
			} else if ( ! empty( $keyword ) ) {
				$issues[] = __( 'Warning: Focus keyword is missing from the meta title.', 'seo-copilot' );
			}

			if ( ! empty( $title ) && $title !== $post->post_title ) {
				$score += 5;
			} else if ( ! empty( $title ) ) {
				$issues[] = __( 'Warning: Meta title is the exact same as the H1 post title.', 'seo-copilot' );
			}

			// 2. META DESCRIPTION CHECKS (15 pts)
			if ( ! empty( $desc ) ) {
				$score += 5;
			} else {
				$issues[] = __( 'Critical: Meta description is missing.', 'seo-copilot' );
			}

			$desc_len = mb_strlen( $desc );
			if ( $desc_len >= 120 && $desc_len <= 155 ) {
				$score += 5;
			} else if ( ! empty( $desc ) ) {
				$issues[] = __( 'Warning: Meta description is not between 120 and 155 characters.', 'seo-copilot' );
			}

			if ( ! empty( $keyword ) && ! empty( $desc ) && stripos( $desc, $keyword ) !== false ) {
				$score += 5;
			} else if ( ! empty( $keyword ) ) {
				$issues[] = __( 'Warning: Focus keyword is missing from the meta description.', 'seo-copilot' );
			}

			// 3. CONTENT CHECKS (30 pts)
			$options = get_option( 'seo_copilot_settings', [] );
			$min_words = isset( $options['min_word_count'] ) ? intval( $options['min_word_count'] ) : 300;
			
			if ( $word_count >= $min_words ) {
				$score += 5;
			} else {
				$issues[] = sprintf( __( 'Critical: Word count (%d) is below the minimum required (%d).', 'seo-copilot' ), $word_count, $min_words );
			}

			// First paragraph heuristic (first 50 words)
			$first_paragraph_words = implode( ' ', array_slice( explode( ' ', $content_stripped ), 0, 50 ) );
			if ( ! empty( $keyword ) && stripos( $first_paragraph_words, $keyword ) !== false ) {
				$score += 5;
			} else if ( ! empty( $keyword ) ) {
				$issues[] = __( 'Warning: Focus keyword not found in the first paragraph of the content.', 'seo-copilot' );
			}

			// Density
			if ( ! empty( $keyword ) && $word_count > 0 ) {
				$keyword_count = substr_count( strtolower( $content_stripped ), $keyword );
				$keyword_words = str_word_count( $keyword );
				$density = ( ( $keyword_count * $keyword_words ) / $word_count ) * 100;
				if ( $density >= 0.5 && $density <= 2.5 ) {
					$score += 5;
				} else {
					$issues[] = sprintf( __( 'Warning: Keyword density (%.2f%%) is outside the 0.5%% - 2.5%% range.', 'seo-copilot' ), $density );
				}
			}

			// H2 Check
			if ( preg_match( '/<h2[^>]*>.*?<\/h2>/is', $content ) ) {
				$score += 5;
			} else {
				$issues[] = __( 'Warning: Content does not contain at least one H2 tag.', 'seo-copilot' );
			}

			// H1 Check
			if ( ! preg_match( '/<h1[^>]*>.*?<\/h1>/is', $content ) ) {
				$score += 5;
			} else {
				$issues[] = __( 'Warning: Content contains an H1 tag inside the body. Only the post title should be H1.', 'seo-copilot' );
			}

			// Image Alt Text Check
			if ( preg_match_all( '/<img[^>]+>/is', $content, $images ) ) {
				$missing_alt = false;
				foreach ( $images[0] as $img ) {
					if ( stripos( $img, 'alt="' ) === false || preg_match( '/alt="\s*"/i', $img ) ) {
						$missing_alt = true;
						break;
					}
				}
				if ( ! $missing_alt ) {
					$score += 5;
				} else {
					$issues[] = __( 'Warning: One or more images are missing ALT text.', 'seo-copilot' );
				}
			} else {
				$score += 5; // Default pass if no images
			}

			// 4. LINK CHECKS (20 pts)
			$internal_links_count = 0;
			$broken_links = false;
			$home_url = home_url();

			if ( preg_match_all( '/<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>/is', $content, $links ) ) {
				foreach ( $links[1] as $href ) {
					if ( strpos( $href, $home_url ) === 0 || strpos( $href, '/' ) === 0 ) {
						$internal_links_count++;
						// Simulated broken link check for performance (real check requires HTTP request or DB matching)
						if ( trim( $href ) === '#' || trim( $href ) === '' || strpos( $href, 'javascript:' ) === 0 ) {
							$broken_links = true;
						}
					}
				}
			}

			if ( $internal_links_count >= 2 ) {
				$score += 10;
			} else {
				$issues[] = __( 'Warning: Less than 2 internal links found in the content.', 'seo-copilot' );
			}

			if ( ! $broken_links ) {
				$score += 10;
			} else {
				$issues[] = __( 'Critical: Broken or empty internal links were found.', 'seo-copilot' );
			}

			// 5. TECHNICAL CHECKS (15 pts)
			if ( ! empty( $keyword ) ) {
				$score += 5;
			} else {
				$issues[] = __( 'Critical: Missing focus keyword.', 'seo-copilot' );
			}

			if ( has_post_thumbnail( $post_id ) ) {
				$score += 5;
			} else {
				$issues[] = __( 'Warning: Missing featured image.', 'seo-copilot' );
			}

			$schema_injected = get_post_meta( $post_id, '_seo_copilot_schema_injected', true );
			if ( $schema_injected ) {
				$score += 5;
			} else {
				$issues[] = __( 'Warning: Schema markup is not injected.', 'seo-copilot' );
			}

			// Update Decay Logic: Log to score_history table BEFORE updating meta
			global $wpdb;
			$table_history = $wpdb->prefix . 'seo_copilot_score_history';
			$prev_score = get_post_meta( $post_id, '_seo_copilot_score', true );
			
			if ( $prev_score !== '' ) {
				$wpdb->insert(
					$table_history,
					[
						'post_id'      => $post_id,
						'score'        => intval( $prev_score ),
						'issues_count' => count( $issues ), // rough estimate
						'recorded_at'  => current_time( 'mysql' ),
					],
					[ '%d', '%d', '%d', '%s' ]
				);
			}

			// Update meta
			update_post_meta( $post_id, '_seo_copilot_score', $score );
			update_post_meta( $post_id, '_seo_copilot_issues', wp_json_encode( $issues ) );

			// Log to activity
			SEO_Copilot_Admin::log_activity( $post_id, 'audit', [ 'score' => $score, 'issues_count' => count( $issues ) ] );

			return [
				'score'  => $score,
				'issues' => $issues,
			];
		}

		// -------------------------------------------------------------------------
		// AJAX HANDLERS
		// -------------------------------------------------------------------------

		/**
		 * Run site audit in batches
		 */
		public function ajax_run_batch_audit() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$offset = isset( $_POST['offset'] ) ? absint( $_POST['offset'] ) : 0;
			$limit  = 10; // Process 10 posts per AJAX call

			$options    = get_option( 'seo_copilot_settings', [] );
			$post_types = isset( $options['post_types'] ) ? $options['post_types'] : [ 'post', 'page' ];

			$args = [
				'post_type'      => $post_types,
				'post_status'    => 'publish',
				'posts_per_page' => $limit,
				'offset'         => $offset,
				'fields'         => 'ids',
			];
			$query = new \WP_Query( $args );

			if ( ! $query->have_posts() ) {
				// Audit finished
				update_option( 'seo_copilot_last_audit_date', current_time( 'mysql' ) );
				wp_send_json_success( [ 'finished' => true ] );
			}

			foreach ( $query->posts as $post_id ) {
				$this->audit_post( $post_id );
			}

			wp_send_json_success( [
				'finished' => false,
				'next_offset' => $offset + $limit,
				'total' => $query->found_posts,
			] );
		}

		/**
		 * Export CSV format
		 */
		public function ajax_export_audit_csv() {
			// Similar logic to general export logic in class-admin.php. 
		}

		/**
		 * Ask AI for suggestions for a specific post.
		 */
		public function ajax_get_ai_suggestions() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			if ( ! $post_id ) wp_send_json_error();

			$post = get_post( $post_id );
			$keyword = get_post_meta( $post_id, '_seo_copilot_focus_keyword', true );
			if ( ! $keyword ) {
				wp_send_json_error( __( 'Post has no focus keyword set. Please set a keyword first before asking AI for suggestions.', 'seo-copilot' ) );
			}

			$provider = SEO_Copilot_AI_Factory::get_provider();
			$content  = apply_filters( 'the_content', $post->post_content );
			$result   = $provider->analyze_content( $content, $keyword );

			if ( is_wp_error( $result ) ) {
				wp_send_json_error( $result->get_error_message() );
			}

			wp_send_json_success( $result );
		}
	}
}

add_action( 'plugins_loaded', function() {
	new SEO_Copilot_Site_Audit();
});
