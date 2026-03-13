<?php
/**
 * Admin Dashboard Class
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Admin' ) ) {

	/**
	 * Class SEO_Copilot_Admin
	 */
	class SEO_Copilot_Admin {

		/**
		 * Constructor.
		 */
		public function __construct() {
			// Hook into the Settings class submenu registration to hijack the Dashboard page output
			add_action( 'current_screen', [ $this, 'init_dashboard' ] );

			// AJAX handlers for dashboard actions
			add_action( 'wp_ajax_seo_copilot_run_audit', [ $this, 'ajax_run_audit' ] );
			add_action( 'wp_ajax_seo_copilot_batch_analyze', [ $this, 'ajax_batch_analyze' ] );
			add_action( 'wp_ajax_seo_copilot_batch_meta', [ $this, 'ajax_batch_meta' ] );
			add_action( 'wp_ajax_seo_copilot_export_csv', [ $this, 'ajax_export_csv' ] );
			add_action( 'wp_ajax_seo_copilot_get_dashboard_stats', [ $this, 'ajax_get_dashboard_stats' ] );

			// Hook into AI Factory to track API calls (would normally be in the factory/provider, done via action here for decoupled logic)
			add_action( 'seo_copilot_api_call_made', [ $this, 'increment_api_call_count' ] );
		}

		/**
		 * Initialize Dashboard Hooks when on the dashboard screen.
		 */
		public function init_dashboard() {
			$screen = get_current_screen();
			if ( ! $screen || 'toplevel_page_seo-copilot' !== $screen->id ) {
				return;
			}

			// Add action to render our dashboard instead of default settings
			// Note: The top-level menu 'seo-copilot' callback is in settings class. 
			// We can override the view or hook in. For simplicity, we'll let the settings class
			// do its thing for settings, but here we'll assume the top-level menu 'toplevel_page_seo-copilot' 
			// was meant for the dashboard.
			
			// Let's hook into admin_menu late to change the callback for the dashboard strictly.
			add_action( 'admin_menu', [ $this, 'override_dashboard_callback' ], 90 );
		}

		/**
		 * Override the top-level menu callback to render the dashboard view.
		 */
		public function override_dashboard_callback() {
			global $submenu;
			if ( isset( $submenu['seo-copilot'] ) ) {
				foreach ( $submenu['seo-copilot'] as &$item ) {
					// Find the Dashboard submenu item and override its callback
					if ( 'seo-copilot' === $item[2] ) {
						$item[4] = [ $this, 'render_dashboard' ];
						break;
					}
				}
			}
		}

		/**
		 * Render Dashboard HTML.
		 */
		public function render_dashboard() {
			require_once SEO_COPILOT_PLUGIN_DIR . 'admin/views/dashboard.php';
		}

		// -------------------------------------------------------------------------
		// DATA LAYER METHODS
		// -------------------------------------------------------------------------

		/**
		 * Get average Site Health Score.
		 */
		public function get_site_health_score() {
			global $wpdb;
			$score = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT AVG(meta_value) FROM $wpdb->postmeta WHERE meta_key = %s AND meta_value != ''",
					'_seo_copilot_score'
				)
			);
			return $score ? round( $score ) : 0;
		}

		/**
		 * Get coverage count (analyzed vs total).
		 */
		public function get_coverage_stats() {
			global $wpdb;
			
			$options    = get_option( 'seo_copilot_settings', [] );
			$post_types = isset( $options['post_types'] ) ? $options['post_types'] : [ 'post', 'page' ];
			$in_types   = "'" . implode( "','", array_map( 'esc_sql', $post_types ) ) . "'";

			$total = $wpdb->get_var( "SELECT COUNT(ID) FROM $wpdb->posts WHERE post_status = 'publish' AND post_type IN ($in_types)" );
			
			$analyzed = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(DISTINCT post_id) FROM $wpdb->postmeta pm JOIN $wpdb->posts p ON p.ID = pm.post_id WHERE pm.meta_key = %s AND p.post_status = 'publish' AND p.post_type IN ($in_types)",
					'_seo_copilot_score'
				)
			);

			$percentage = $total > 0 ? round( ( $analyzed / $total ) * 100 ) : 0;

			return [
				'total'      => intval( $total ),
				'analyzed'   => intval( $analyzed ),
				'unanalyzed' => max( 0, intval( $total ) - intval( $analyzed ) ),
				'percentage' => $percentage,
			];
		}

		/**
		 * Count critical issues.
		 */
		public function get_critical_issues_count() {
			global $wpdb;
			
			// For simplicity in this mockup: Parse all issues JSON and count occurrences containing 'Critical' 
			// In production, an indexed DB structure might be better.
			$issues_meta = $wpdb->get_col(
				$wpdb->prepare(
					"SELECT meta_value FROM $wpdb->postmeta WHERE meta_key = %s AND meta_value != ''",
					'_seo_copilot_issues'
				)
			);

			$count = 0;
			foreach ( $issues_meta as $json ) {
				$arr = json_decode( $json, true );
				if ( is_array( $arr ) ) {
					foreach ( $arr as $issue ) {
						if ( stripos( $issue, 'critical' ) !== false || stripos( $issue, 'not found' ) !== false || stripos( $issue, 'too short' ) !== false ) {
							$count++;
						}
					}
				}
			}
			return $count;
		}

		/**
		 * Count Quick Wins (Score 60-79).
		 */
		public function get_quick_wins_count() {
			global $wpdb;
			return $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(DISTINCT post_id) FROM $wpdb->postmeta WHERE meta_key = %s AND CAST(meta_value AS UNSIGNED) BETWEEN 60 AND 79",
					'_seo_copilot_score'
				)
			);
		}

		/**
		 * Get posts needing attention (lowest scores).
		 */
		public function get_posts_needing_attention( $limit = 10 ) {
			$args = [
				'post_type'      => 'any',
				'post_status'    => 'publish',
				'posts_per_page' => $limit,
				'meta_key'       => '_seo_copilot_score',
				'orderby'        => 'meta_value_num',
				'order'          => 'ASC',
			];
			return new \WP_Query( $args );
		}

		/**
		 * Get top performing posts (highest scores).
		 */
		public function get_top_performing_posts( $limit = 5 ) {
			$args = [
				'post_type'      => 'any',
				'post_status'    => 'publish',
				'posts_per_page' => $limit,
				'meta_key'       => '_seo_copilot_score',
				'orderby'        => 'meta_value_num',
				'order'          => 'DESC',
			];
			return new \WP_Query( $args );
		}

		/**
		 * Activity feed.
		 */
		public function get_recent_activity( $limit = 10 ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_activity';
			// Suppress errors initially in case table doesn't exist during dev
			$suppress = $wpdb->suppress_errors( true );
			$results = $wpdb->get_results( 
				$wpdb->prepare( "SELECT * FROM $table ORDER BY created_at DESC LIMIT %d", $limit )
			);
			$wpdb->suppress_errors( $suppress );
			return $results ? $results : [];
		}

		/**
		 * Log to Activity Table.
		 */
		public static function log_activity( $post_id, $event_type, $data ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_activity';
			
			$wpdb->insert(
				$table,
				[
					'post_id'    => $post_id,
					'event_type' => $event_type,
					'event_data' => wp_json_encode( $data ),
					'created_at' => current_time( 'mysql' ),
				],
				[ '%d', '%s', '%s', '%s' ]
			);
		}

		/**
		 * API tracker.
		 */
		public function increment_api_call_count() {
			$options = get_option( 'seo_copilot_settings', [] );
			$current_month = current_time( 'Y-m' );
			
			if ( ! isset( $options['api_calls_last_reset'] ) || $options['api_calls_last_reset'] !== $current_month ) {
				$options['api_calls_last_reset'] = $current_month;
				$options['api_calls_this_month'] = 0;
			}
			
			if ( ! isset( $options['api_calls_this_month'] ) ) {
				$options['api_calls_this_month'] = 0;
			}
			
			$options['api_calls_this_month']++;
			update_option( 'seo_copilot_settings', $options );
		}

		// -------------------------------------------------------------------------
		// AJAX HANDLERS
		// -------------------------------------------------------------------------

		/**
		 * Export CSV.
		 */
		public function ajax_export_csv() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( __( 'Permission denied.', 'seo-copilot' ) );
			}

			// Since it's an AJAX download, we return URL or stream directly. 
			// We'll stream directly for typical CSV exports.
			header( 'Content-Type: text/csv; charset=utf-8' );
			header( 'Content-Disposition: attachment; filename=seo-copilot-report-' . date( 'Y-m-d' ) . '.csv' );

			$output = fopen( 'php://output', 'w' );
			fputcsv( $output, [ 'Post ID', 'Title', 'URL', 'Score', 'Focus Keyword', 'Meta Title', 'Meta Description' ] );

			$args = [
				'post_type'      => 'any',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
			];
			$query = new \WP_Query( $args );

			if ( $query->have_posts() ) {
				while ( $query->have_posts() ) {
					$query->the_post();
					$id = get_the_ID();
					fputcsv( $output, [
						$id,
						get_the_title(),
						get_permalink(),
						get_post_meta( $id, '_seo_copilot_score', true ) ?: 'N/A',
						get_post_meta( $id, '_seo_copilot_focus_keyword', true ) ?: 'N/A',
						get_post_meta( $id, '_seo_copilot_meta_title', true ) ?: 'N/A',
						get_post_meta( $id, '_seo_copilot_meta_description', true ) ?: 'N/A',
					] );
				}
				wp_reset_postdata();
			}

			fclose( $output );
			exit();
		}

		/**
		 * Batch Analyze Trigger (Simulated background task for UI).
		 */
		public function ajax_batch_analyze() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			// In a real plugin, this schedules a CRON job. Here we just pretend it started.
			wp_send_json_success( [ 'message' => __( 'Batch analysis started in the background.', 'seo-copilot' ) ] );
		}

		/**
		 * Batch Meta Trigger.
		 */
		public function ajax_batch_meta() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			wp_send_json_success( [ 'message' => __( 'AI Meta Generation started in the background.', 'seo-copilot' ) ] );
		}

		/**
		 * Real-time stats payload.
		 */
		public function ajax_get_dashboard_stats() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$stats = [
				'score'    => $this->get_site_health_score(),
				'coverage' => $this->get_coverage_stats(),
				'critical' => $this->get_critical_issues_count(),
				'wins'     => $this->get_quick_wins_count(),
			];
			
			wp_send_json_success( $stats );
		}
		
		/**
		 * Mock Run Audit (Top button).
		 */
		public function ajax_run_audit() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();
			
			update_option( 'seo_copilot_last_audit', current_time( 'timestamp' ) );
			wp_send_json_success( [ 'message' => __( 'Audit complete.', 'seo-copilot' ) ] );
		}
	}
}

// Hook to ensure menus are built before trying to override them
add_action( 'plugins_loaded', function() {
	new SEO_Copilot_Admin();
});
