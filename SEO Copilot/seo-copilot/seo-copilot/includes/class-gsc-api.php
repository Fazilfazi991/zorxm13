<?php
/**
 * Google Search Console API Handler
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_GSC_API' ) ) {

	/**
	 * Class SEO_Copilot_GSC_API
	 */
	class SEO_Copilot_GSC_API {

		private $client_id = ''; // Assuming standard OAuth setup via settings or proxy
		private $client_secret = ''; 
		private $redirect_uri = '';

		public function __construct() {
			$this->redirect_uri = admin_url( 'admin.php?page=seo-copilot-settings' );
			
			// Note: For a real plugin distributed to users, you wouldn't hardcode credentials.
			// You'd either use a proxy server you own to hide the secret, or require the user 
			// to enter their own Google Cloud Console credentials in settings.
			// For this MVP, we will assume standard tokens.
			
			$options = get_option( 'seo_copilot_settings', [] );
			$this->client_id = isset( $options['gsc_client_id'] ) ? $options['gsc_client_id'] : '';
			$this->client_secret = isset( $options['gsc_client_secret'] ) ? $options['gsc_client_secret'] : '';
		}

		/**
		 * Build OAuth URL.
		 */
		public function get_auth_url() {
			if ( empty( $this->client_id ) ) return '';

			$state = wp_create_nonce( 'seo_copilot_gsc_oauth' );
			set_transient( 'seo_copilot_gsc_state', $state, HOUR_IN_SECONDS );

			return add_query_arg( [
				'client_id'     => $this->client_id,
				'redirect_uri'  => urlencode( $this->redirect_uri ),
				'response_type' => 'code',
				'scope'         => urlencode( 'https://www.googleapis.com/auth/webmasters.readonly' ),
				'access_type'   => 'offline',
				'prompt'        => 'consent',
				'state'         => $state
			], 'https://accounts.google.com/o/oauth2/v2/auth' );
		}

		/**
		 * Handle callback.
		 */
		public function handle_oauth_callback( $code ) {
			$response = wp_remote_post( 'https://oauth2.googleapis.com/token', [
				'body' => [
					'code'          => $code,
					'client_id'     => $this->client_id,
					'client_secret' => $this->client_secret,
					'redirect_uri'  => $this->redirect_uri,
					'grant_type'    => 'authorization_code'
				]
			] );

			if ( is_wp_error( $response ) ) {
				return $response;
			}

			$body = json_decode( wp_remote_retrieve_body( $response ), true );
			
			if ( isset( $body['error'] ) ) {
				return new \WP_Error( 'gsc_auth_error', $body['error_description'] ?? $body['error'] );
			}

			if ( isset( $body['access_token'] ) ) {
				update_option( 'seo_copilot_gsc_access_token', $this->encrypt( $body['access_token'] ) );
				if ( isset( $body['refresh_token'] ) ) {
					update_option( 'seo_copilot_gsc_refresh_token', $this->encrypt( $body['refresh_token'] ) );
				}
				update_option( 'seo_copilot_gsc_token_expiry', time() + $body['expires_in'] );
				
				// Verify site list to grab the property URL (automatically guessing first verified property matching host)
				$this->auto_set_property_url( $body['access_token'] );

				return true;
			}

			return false;
		}

		/**
		 * Auto-detect and set property URL after auth.
		 */
		private function auto_set_property_url( $access_token ) {
			$response = wp_remote_get( 'https://searchconsole.googleapis.com/webmasters/v3/sites', [
				'headers' => [ 'Authorization' => 'Bearer ' . $access_token ]
			] );

			if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
				$body = json_decode( wp_remote_retrieve_body( $response ), true );
				if ( ! empty( $body['siteEntry'] ) ) {
					$host = wp_parse_url( home_url(), PHP_URL_HOST );
					foreach ( $body['siteEntry'] as $site ) {
						if ( isset( $site['siteUrl'] ) && strpos( $site['siteUrl'], $host ) !== false ) {
							update_option( 'seo_copilot_gsc_property_url', $site['siteUrl'] );
							return;
						}
					}
					// Fallback to first
					update_option( 'seo_copilot_gsc_property_url', $body['siteEntry'][0]['siteUrl'] );
				}
			}
		}

		/**
		 * Refresh token logic.
		 */
		public function refresh_token_if_needed() {
			$expiry = get_option( 'seo_copilot_gsc_token_expiry', 0 );
			
			// If expiring in next 5 mins
			if ( time() > ( $expiry - 300 ) ) {
				$refresh_token = $this->decrypt( get_option( 'seo_copilot_gsc_refresh_token', '' ) );
				if ( ! $refresh_token ) return false;

				$response = wp_remote_post( 'https://oauth2.googleapis.com/token', [
					'body' => [
						'client_id'     => $this->client_id,
						'client_secret' => $this->client_secret,
						'refresh_token' => $refresh_token,
						'grant_type'    => 'refresh_token'
					]
				] );

				if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
					$body = json_decode( wp_remote_retrieve_body( $response ), true );
					update_option( 'seo_copilot_gsc_access_token', $this->encrypt( $body['access_token'] ) );
					update_option( 'seo_copilot_gsc_token_expiry', time() + $body['expires_in'] );
					return true;
				}
				return false;
			}
			return true;
		}

		/**
		 * Is connected?
		 */
		public function is_connected() {
			$token = get_option( 'seo_copilot_gsc_access_token' );
			$prop  = get_option( 'seo_copilot_gsc_property_url' );
			return ! empty( $token ) && ! empty( $prop ) ? $prop : false;
		}

		/**
		 * Core Analytics Fetcher.
		 */
		public function get_search_analytics( $start_date, $end_date, $dimensions = ['query', 'page', 'country'], $rowLimit = 5000, $filters = [] ) {
			if ( ! $this->refresh_token_if_needed() ) {
				return new \WP_Error( 'gsc_token_error', 'Failed to refresh token.' );
			}

			$property = get_option( 'seo_copilot_gsc_property_url' );
			$token = $this->decrypt( get_option( 'seo_copilot_gsc_access_token' ) );

			// Transient caching
			$cache_key = 'sec_gsc_' . md5( $property . $start_date . $end_date . wp_json_encode($dimensions) . wp_json_encode($filters) );
			$cached = get_transient( $cache_key );
			if ( false !== $cached ) {
				return $cached;
			}

			$body = [
				'startDate'  => $start_date,
				'endDate'    => $end_date,
				'dimensions' => $dimensions,
				'rowLimit'   => $rowLimit
			];

			if ( ! empty( $filters ) ) {
				$body['dimensionFilterGroups'] = [ [ 'filters' => $filters ] ];
			}

			$url = 'https://searchconsole.googleapis.com/webmasters/v3/sites/' . urlencode( $property ) . '/searchAnalytics/query';

			$response = wp_remote_post( $url, [
				'headers' => [
					'Authorization' => 'Bearer ' . $token,
					'Content-Type'  => 'application/json'
				],
				'body'    => wp_json_encode( $body ),
				'timeout' => 30
			] );

			if ( is_wp_error( $response ) ) return $response;

			$data = json_decode( wp_remote_retrieve_body( $response ), true );
			
			if ( isset( $data['rows'] ) ) {
				set_transient( $cache_key, $data['rows'], 6 * HOUR_IN_SECONDS );
				return $data['rows'];
			}

			return [];
		}

		/**
		 * Get Keywords for specific Post.
		 */
		public function get_keywords_for_post( $post_id, $days = 90 ) {
			$url = get_permalink( $post_id );
			$end = date( 'Y-m-d', strtotime( '-3 days' ) ); // GSC data delay
			$start = date( 'Y-m-d', strtotime( "-{$days} days" ) );

			$filters = [
				[
					'dimension'  => 'page',
					'operator'   => 'equals',
					'expression' => $url
				]
			];

			$rows = $this->get_search_analytics( $start, $end, ['query', 'country'], 20, $filters );
			
			if ( is_wp_error( $rows ) ) return $rows;

			// Bulk insert into DB cache
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_gsc_data';

			foreach ( $rows as $row ) {
				$wpdb->insert(
					$table,
					[
						'post_id'       => $post_id,
						'keyword'       => $row['keys'][0],
						'clicks'        => $row['clicks'],
						'impressions'   => $row['impressions'],
						'ctr'           => $row['ctr'],
						'position'      => $row['position'],
						'country'       => strtoupper( $row['keys'][1] ?? 'ZZ' ),
						'recorded_date' => current_time( 'Y-m-d' )
					],
					[ '%d', '%s', '%d', '%d', '%f', '%f', '%s', '%s' ]
				);
			}

			return $rows;
		}

		/**
		 * Get Top Keywords across the whole site (for LLM visibility checks).
		 * Needs to group by query and sum impressions/clicks.
		 */
		public function get_top_keywords( $limit = 20, $days = 90 ) {
			$end = date( 'Y-m-d', strtotime( '-3 days' ) ); 
			$start = date( 'Y-m-d', strtotime( "-{$days} days" ) );

			$rows = $this->get_search_analytics( $start, $end, ['query'], $limit );
			
			if ( is_wp_error( $rows ) ) return $rows;
			if ( empty( $rows ) ) return [];

			$keywords = [];
			foreach ( $rows as $row ) {
				$keywords[] = $row['keys'][0];
			}

			return array_slice($keywords, 0, $limit);
		}

		/**
		 * Get Top Pages across the whole site (for LLM visibility checks).
		 */
		public function get_top_pages( $limit = 10, $days = 90 ) {
			$end = date( 'Y-m-d', strtotime( '-3 days' ) ); 
			$start = date( 'Y-m-d', strtotime( "-{$days} days" ) );

			$rows = $this->get_search_analytics( $start, $end, ['page'], $limit );
			
			if ( is_wp_error( $rows ) ) return $rows;
			if ( empty( $rows ) ) return [];

			$pages = [];
			foreach ( $rows as $row ) {
				$pages[] = [
					'url'    => $row['keys'][0],
					'clicks' => $row['clicks']
				];
			}

			return array_slice($pages, 0, $limit);
		}

		/**
		 * Sync whole site (Weekly CRON usage).
		 */
		public function sync_all_posts( $limit = 5000 ) {
			$end = date( 'Y-m-d', strtotime( '-3 days' ) );
			$start = date( 'Y-m-d', strtotime( "-7 days" ) ); // Weekly chunks
			
			$rows = $this->get_search_analytics( $start, $end, ['page', 'query', 'country'], $limit );
			
			if ( is_wp_error( $rows ) ) return false;
			if ( empty( $rows ) ) return true;

			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_gsc_data';

			// Build a URL -> Post ID map for efficiency
			$url_map = [];

			foreach ( $rows as $row ) {
				$url = $row['keys'][0];
				$kw = $row['keys'][1];
				$country = strtoupper( $row['keys'][2] ?? 'ZZ' );

				if ( ! isset( $url_map[ $url ] ) ) {
					$post_id = url_to_postid( $url );
					$url_map[ $url ] = $post_id;
				}

				$post_id = $url_map[ $url ];

				if ( $post_id ) {
					$wpdb->insert(
						$table,
						[
							'post_id'       => $post_id,
							'keyword'       => $kw,
							'clicks'        => $row['clicks'],
							'impressions'   => $row['impressions'],
							'ctr'           => $row['ctr'],
							'position'      => $row['position'],
							'country'       => $country,
							'recorded_date' => current_time( 'Y-m-d' )
						]
					);
				}
			}

			SEO_Copilot_Admin::log_activity( 0, 'gsc_sync', [ 'rows_synced' => count( $rows ) ] );
			return true;
		}

		/**
		 * Basic encryption for tokens.
		 */
		private function encrypt( $string ) {
			if ( ! $string ) return '';
			$key = defined( 'AUTH_KEY' ) ? AUTH_KEY : 'backup_key_seo_copilot_123';
			$iv = substr( hash( 'sha256', defined( 'NONCE_KEY' ) ? NONCE_KEY : 'backup_iv_abc' ), 0, 16 );
			return openssl_encrypt( $string, 'AES-256-CBC', $key, 0, $iv );
		}

		private function decrypt( $string ) {
			if ( ! $string ) return '';
			$key = defined( 'AUTH_KEY' ) ? AUTH_KEY : 'backup_key_seo_copilot_123';
			$iv = substr( hash( 'sha256', defined( 'NONCE_KEY' ) ? NONCE_KEY : 'backup_iv_abc' ), 0, 16 );
			return openssl_decrypt( $string, 'AES-256-CBC', $key, 0, $iv );
		}
	}
}
