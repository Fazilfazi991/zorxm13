<?php
/**
 * Rank Tracker Core Logic
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Rank_Tracker' ) ) {

	/**
	 * Class SEO_Copilot_Rank_Tracker
	 */
	class SEO_Copilot_Rank_Tracker {

		// API Instances
		private $gsc_api  = null;
		private $dfs_api  = null;

		/**
		 * Constructor.
		 */
		public function __construct() {
			// Safely instantiate API classes only if they exist
			if ( class_exists( 'SEO_Copilot_GSC_API' ) ) {
				$this->gsc_api = new SEO_Copilot_GSC_API();
			}
			if ( class_exists( 'SEO_Copilot_DataForSEO_API' ) ) {
				$this->dfs_api = new SEO_Copilot_DataForSEO_API();
			}

			// Hook into Dashboard menus.
			add_action( 'current_screen', [ $this, 'init_view' ] );

			// WP Crons — only register if DataForSEO credentials present
			if ( $this->dfs_api && $this->dfs_api->is_connected() ) {
				add_action( 'seo_copilot_daily_rank_check', [ $this, 'cron_check_all_keywords' ] );
				if ( ! wp_next_scheduled( 'seo_copilot_daily_rank_check' ) ) {
					wp_schedule_event( strtotime( '03:00:00' ), 'daily', 'seo_copilot_daily_rank_check' );
				}
			}
			if ( $this->gsc_api && $this->gsc_api->is_connected() ) {
				add_action( 'seo_copilot_weekly_gsc_sync', [ $this->gsc_api, 'sync_all_posts' ] );
				if ( ! wp_next_scheduled( 'seo_copilot_weekly_gsc_sync' ) ) {
					wp_schedule_event( strtotime( 'last sunday 02:00:00' ), 'weekly', 'seo_copilot_weekly_gsc_sync' );
				}
			}

			// AJAX handlers — always register these
			add_action( 'wp_ajax_seo_copilot_add_keywords',          [ $this, 'ajax_add_keywords' ] );
			add_action( 'wp_ajax_seo_copilot_remove_keyword',         [ $this, 'ajax_remove_keyword' ] );
			add_action( 'wp_ajax_seo_copilot_check_all_rankings',     [ $this, 'ajax_check_all_rankings' ] );
			add_action( 'wp_ajax_seo_copilot_auto_discover_keywords', [ $this, 'ajax_auto_discover_keywords' ] );
		}

		/**
		 * Check if DataForSEO is connected.
		 */
		private function is_dfs_connected() {
			return $this->dfs_api && method_exists( $this->dfs_api, 'is_connected' ) && $this->dfs_api->is_connected();
		}

		/**
		 * Check if GSC is connected.
		 */
		private function is_gsc_connected() {
			return $this->gsc_api && method_exists( $this->gsc_api, 'is_connected' ) && $this->gsc_api->is_connected();
		}

		/**
		 * Initialize admin view hook.
		 */
		public function init_view() {
			$screen = get_current_screen();
			if ( ! $screen || 'seo-copilot_page_seo-copilot-rank-tracker' !== $screen->id ) {
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
					if ( 'seo-copilot-rank-tracker' === $item[2] ) {
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
			require_once SEO_COPILOT_PLUGIN_DIR . 'admin/views/rank-tracker.php';
		}


		// -------------------------------------------------------------------------
		// TRACKING LOGIC
		// -------------------------------------------------------------------------

		/**
		 * Add a tracked keyword to DB.
		 */
		public function add_keyword( $post_id, $keyword, $country_code = 'US', $language_code = 'en', $device = 'desktop', $source = 'manual' ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_tracked_keywords';
			
			// Prevent exact dupes
			$exists = $wpdb->get_var( $wpdb->prepare(
				"SELECT id FROM $table WHERE post_id = %d AND keyword = %s AND country_code = %s AND device = %s",
				$post_id, trim( $keyword ), $country_code, $device
			) );

			if ( $exists ) {
				return $exists; // Already tracking
			}

			$insert = $wpdb->insert(
				$table,
				[
					'post_id'       => $post_id,
					'keyword'       => trim( $keyword ),
					'country_code'  => $country_code,
					'language_code' => $language_code,
					'device'        => $device,
					'source'        => $source,
					'date_added'    => current_time( 'mysql' )
				]
			);

			if ( $insert ) {
				$keyword_id = $wpdb->insert_id;
				// Immediately check rank once
				$this->check_rank( $keyword_id );
				return $keyword_id;
			}
			return false;
		}

		/**
		 * Delete keyword from active tracking. We actually delete the tracked row here
		 * to stop checking, but leave the history intact in rank_history.
		 */
		public function remove_keyword( $keyword_id ) {
			global $wpdb;
			return $wpdb->delete(
				$wpdb->prefix . 'seo_copilot_tracked_keywords',
				[ 'id' => $keyword_id ],
				[ '%d' ]
			);
		}

		/**
		 * Check rank for a single keyword immediately.
		 */
		public function check_rank( $keyword_id ) {
			if ( ! $this->is_dfs_connected() ) return false;

			global $wpdb;
			$table_tracked = $wpdb->prefix . 'seo_copilot_tracked_keywords';
			$table_history = $wpdb->prefix . 'seo_copilot_rank_history';

			$kw_data = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_tracked WHERE id = %d", $keyword_id ) );
			if ( ! $kw_data ) return false;

			$post_url = get_permalink( $kw_data->post_id );
			if ( ! $post_url ) return false;

			// Fetch live rank
			$position = $this->dfs_api->get_serp_position(
				$kw_data->keyword,
				$kw_data->country_code,
				$post_url,
				$kw_data->device
			);

			// Fetch live volume
			$vol_data = $this->dfs_api->get_keyword_data( [ $kw_data->keyword ], $kw_data->country_code, $kw_data->language_code );
			$vol = 0; $cpc = 0; $comp = 0;
			if ( isset( $vol_data[ $kw_data->keyword ] ) ) {
				$vol  = $vol_data[ $kw_data->keyword ]['search_volume'];
				$cpc  = $vol_data[ $kw_data->keyword ]['cpc'];
				$comp = $vol_data[ $kw_data->keyword ]['competition'];
			}

			// Save to History (Even if position is null/not found, we log it as 0 or 101+)
			$wpdb->insert(
				$table_history,
				[
					'keyword_id'    => $keyword_id,
					'position'      => $position ?? 101, // 101 = Not in top 100
					'url'           => $post_url,
					'search_volume' => $vol,
					'cpc'           => $cpc,
					'competition'   => $comp,
					'recorded_date' => current_time( 'Y-m-d' ),
					'source'        => 'dataforseo'
				],
				[ '%d', '%d', '%s', '%d', '%f', '%f', '%s', '%s' ]
			);

			return $position;
		}

		/**
		 * Check ALL keywords. (Called by Cron usually, or AJAX trigger).
		 */
		public function check_all_keywords() {
			if ( ! $this->is_dfs_connected() ) return false;

			global $wpdb;
			$table_tracked = $wpdb->prefix . 'seo_copilot_tracked_keywords';
			
			$all_kws = $wpdb->get_results( "SELECT * FROM $table_tracked" );
			if ( empty( $all_kws ) ) return true;

			// Normally you'd want to queue to DataForSEO batch / task endpoints here,
			// but for <100 keywords the single check_rank loop will suffice natively via wp_remote_post
			
			$count = 0;
			foreach ( $all_kws as $kw ) {
				// Prevent checking the exact same keyword on the same calendar day twice
				$already_checked = $wpdb->get_var( $wpdb->prepare(
					"SELECT id FROM {$wpdb->prefix}seo_copilot_rank_history WHERE keyword_id = %d AND recorded_date = %s",
					$kw->id, current_time( 'Y-m-d' )
				) );
				
				if ( ! $already_checked ) {
					$this->check_rank( $kw->id );
					$count++;
				}
			}

			SEO_Copilot_Admin::log_activity( 0, 'rank_check', [ 'checked' => $count ] );
			
			// Fire the drops alert check
			do_action( 'seo_copilot_rank_alert_check' );

			return $count;
		}

		/**
		 * CRON Wrapper
		 */
		public function cron_check_all_keywords() {
			$this->check_all_keywords();
		}

		// -------------------------------------------------------------------------
		// DATA RETRIEVAL FOR UI
		// -------------------------------------------------------------------------

		/**
		 * Auto-discover Keywords for a post based on GSC.
		 */
		public function auto_discover_keywords( $post_id ) {
			if ( ! $this->is_gsc_connected() ) {
				return new \WP_Error( 'gsc_not_connected', __( 'Google Search Console is not connected.', 'seo-copilot' ) );
			}

			// Get Focus kw
			$focus = get_post_meta( $post_id, '_seo_copilot_focus_keyword', true );
			$suggestions = [];
			
			if ( ! empty( $focus ) ) {
				$suggestions[] = [ 'keyword' => strtolower( trim( $focus ) ), 'source' => 'focus_keyword' ];
			}

			// Get GSC words
			$gsc_data = $this->gsc_api->get_keywords_for_post( $post_id, 30 ); // Last 30 days
			if ( is_array( $gsc_data ) ) {
				$limit = 0;
				foreach ( $gsc_data as $row ) {
					if ( $limit > 4 ) break; // Top 5
					$kw = strtolower( trim( $row['keys'][0] ) );
					if ( $kw !== strtolower( trim( $focus ?? '' ) ) ) {
						$suggestions[] = [ 'keyword' => $kw, 'source' => 'gsc_clicks', 'clicks' => $row['clicks'] ];
						$limit++;
					}
				}
			}

			return $suggestions;
		}

		/**
		 * Get Sparkline trend for a keyword ID
		 */
		public function get_keyword_trend( $keyword_id, $days = 30 ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_rank_history';
			$start = date( 'Y-m-d', strtotime( "-{$days} days" ) );

			return $wpdb->get_results( $wpdb->prepare(
				"SELECT position, recorded_date FROM $table 
				 WHERE keyword_id = %d AND recorded_date >= %s 
				 ORDER BY recorded_date ASC",
				$keyword_id, $start
			), ARRAY_A );
		}

		/**
		 * Massive data array for central dashboard table.
		 */
		public function get_tracking_dashboard_data() {
			global $wpdb;
			$trk = $wpdb->prefix . 'seo_copilot_tracked_keywords';
			$his = $wpdb->prefix . 'seo_copilot_rank_history';

			// Pulls the latest history entry for every tracked keyword using a subquery
			$sql = "
				SELECT t.*, p.post_title, h.position as current_position, h.search_volume, h.recorded_date,
					(SELECT position FROM $his WHERE keyword_id = t.id AND recorded_date < h.recorded_date ORDER BY recorded_date DESC LIMIT 1) as previous_position
				FROM $trk t
				JOIN {$wpdb->posts} p ON t.post_id = p.ID
				LEFT JOIN $his h ON h.keyword_id = t.id AND h.recorded_date = (
					SELECT MAX(recorded_date) FROM $his WHERE keyword_id = t.id
				)
				ORDER BY t.id DESC
			";

			return $wpdb->get_results( $sql );
		}

		public function get_site_ranking_summary() {
			global $wpdb;
			$trk = $wpdb->prefix . 'seo_copilot_tracked_keywords';
			$his = $wpdb->prefix . 'seo_copilot_rank_history';

			$latest_ranks = $wpdb->get_results( "
				SELECT h.keyword_id, h.position 
				FROM $his h
				INNER JOIN (
					SELECT keyword_id, MAX(recorded_date) as max_date
					FROM $his
					GROUP BY keyword_id
				) as latest ON h.keyword_id = latest.keyword_id AND h.recorded_date = latest.max_date
			" );

			$summary = [
				'total'   => $wpdb->get_var( "SELECT COUNT(*) FROM $trk" ),
				'avg'     => 0,
				'top_3'   => 0,
				'top_10'  => 0,
				'biggest_mover' => null,
				'biggest_drop'  => null
			];

			$sum = 0; $count = 0;
			if ( $latest_ranks ) {
				foreach ( $latest_ranks as $r ) {
					$pos = intval( $r->position );
					if ( $pos > 0 && $pos <= 100 ) { // 101 is our 'Not Ranking' flag
						$sum += $pos;
						$count++;
						if ( $pos <= 3 ) $summary['top_3']++;
						if ( $pos <= 10 ) $summary['top_10']++;
					}
				}
				if ( $count > 0 ) $summary['avg'] = round( $sum / $count, 1 );
			}

			// Calculate Movers (Comparing latest vs 7 days ago approx for MVP)
			// Will build robust logic if needed, skipping for MVP UI speed.
			
			return $summary;
		}

		public function get_country_list() {
			return [
				'US' => 'United States 🇺🇸',
				'GB' => 'United Kingdom 🇬🇧',
				'CA' => 'Canada 🇨🇦',
				'AU' => 'Australia 🇦🇺',
				'IN' => 'India 🇮🇳',
				'DE' => 'Germany 🇩🇪',
				'FR' => 'France 🇫🇷',
				'ES' => 'Spain 🇪🇸',
				'IT' => 'Italy 🇮🇹',
				'BR' => 'Brazil 🇧🇷',
				'MX' => 'Mexico 🇲🇽',
				'NL' => 'Netherlands 🇳🇱',
				'SE' => 'Sweden 🇸🇪',
				'NO' => 'Norway 🇳🇴',
				'DK' => 'Denmark 🇩🇰',
				'FI' => 'Finland 🇫🇮',
				'PL' => 'Poland 🇵🇱',
				'JP' => 'Japan 🇯🇵',
				'KR' => 'South Korea 🇰🇷',
				'AE' => 'United Arab Emirates 🇦🇪',
				'SA' => 'Saudi Arabia 🇸🇦',
				'SG' => 'Singapore 🇸🇬',
				'ZA' => 'South Africa 🇿🇦',
				'NG' => 'Nigeria 🇳🇬',
				'EG' => 'Egypt 🇪🇬',
				'PK' => 'Pakistan 🇵🇰',
				'BD' => 'Bangladesh 🇧🇩',
				'PH' => 'Philippines 🇵🇭',
				'ID' => 'Indonesia 🇮🇩',
				'MY' => 'Malaysia 🇲🇾',
				'TH' => 'Thailand 🇹🇭',
				'VN' => 'Vietnam 🇻🇳',
				'AR' => 'Argentina 🇦🇷',
				'CO' => 'Colombia 🇨🇴',
				'CL' => 'Chile 🇨🇱',
				'PE' => 'Peru 🇵🇪',
				'PT' => 'Portugal 🇵🇹',
				'BE' => 'Belgium 🇧🇪',
				'CH' => 'Switzerland 🇨🇭',
				'AT' => 'Austria 🇦🇹',
				'IE' => 'Ireland 🇮🇪',
				'NZ' => 'New Zealand 🇳🇿',
				'HK' => 'Hong Kong 🇭🇰',
				'TW' => 'Taiwan 🇹🇼',
				'RU' => 'Russia 🇷🇺',
				'UA' => 'Ukraine 🇺🇦',
				'TR' => 'Turkey 🇹🇷',
				'IL' => 'Israel 🇮🇱',
				'GR' => 'Greece 🇬🇷',
				'CZ' => 'Czech Republic 🇨🇿',
				'HU' => 'Hungary 🇭🇺',
				'RO' => 'Romania 🇷🇴',
			];
		}


		// -------------------------------------------------------------------------
		// AJAX HANDLERS
		// -------------------------------------------------------------------------

		public function ajax_add_keywords() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$post_id  = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			$keywords = isset( $_POST['keywords'] ) ? array_map( 'sanitize_text_field', explode( ',', $_POST['keywords'] ) ) : [];
			$country  = isset( $_POST['country'] ) ? sanitize_text_field( $_POST['country'] ) : 'US';
			$device   = isset( $_POST['device'] ) ? sanitize_text_field( $_POST['device'] ) : 'desktop';
			
			if ( ! $post_id || empty( $keywords ) ) {
				wp_send_json_error( 'Missing data.' );
			}

			if ( ! $this->is_dfs_connected() ) {
				wp_send_json_error( 'DataForSEO is not connected in Settings.' );
			}

			$added = 0;
			foreach ( $keywords as $kw ) {
				if ( ! empty( $kw ) ) {
					$res = $this->add_keyword( $post_id, $kw, $country, 'en', $device, 'manual' );
					if ( $res ) $added++;
				}
			}

			wp_send_json_success( "$added keywords tracked and checked successfully." );
		}

		public function ajax_remove_keyword() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$id = isset( $_POST['keyword_id'] ) ? absint( $_POST['keyword_id'] ) : 0;
			if ( $id && $this->remove_keyword( $id ) ) {
				wp_send_json_success();
			}
			wp_send_json_error( 'Failed to remove.' );
		}

		public function ajax_check_all_rankings() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$count = $this->check_all_keywords();
			wp_send_json_success( sprintf( __( 'Checked %d keywords.', 'seo-copilot' ), $count ) );
		}

		public function ajax_auto_discover_keywords() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			if ( ! $post_id ) wp_send_json_error( 'Invalid Post' );

			$results = $this->auto_discover_keywords( $post_id );
			
			if ( is_wp_error( $results ) ) {
				wp_send_json_error( $results->get_error_message() );
			}

			wp_send_json_success( $results );
		}
	}
}

add_action( 'plugins_loaded', function() {
	new SEO_Copilot_Rank_Tracker();
});
