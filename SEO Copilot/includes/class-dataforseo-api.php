<?php
/**
 * DataForSEO API Handler
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_DataForSEO_API' ) ) {

	/**
	 * Class SEO_Copilot_DataForSEO_API
	 */
	class SEO_Copilot_DataForSEO_API {

		private $email = '';
		private $password = '';
		private $base_url = 'https://api.dataforseo.com/v3/';

		public function __construct() {
			$options = get_option( 'seo_copilot_settings', [] );
			$this->email = isset( $options['dataforseo_email'] ) ? $options['dataforseo_email'] : '';
			
			$enc = isset( $options['dataforseo_password'] ) ? $options['dataforseo_password'] : '';
			$this->password = $this->decrypt( $enc );
		}

		private function get_auth_headers() {
			return [
				'Authorization' => 'Basic ' . base64_encode( $this->email . ':' . $this->password ),
				'Content-Type'  => 'application/json'
			];
		}

		public function is_connected() {
			return ! empty( $this->email ) && ! empty( $this->password );
		}

		/**
		 * GET /appendix/user_data (Balance)
		 */
		public function get_account_balance() {
			if ( ! $this->is_connected() ) return false;

			$response = wp_remote_get( $this->base_url . 'appendix/user_data', [
				'headers' => $this->get_auth_headers(),
				'timeout' => 15
			] );

			if ( is_wp_error( $response ) ) return $response;

			$body = json_decode( wp_remote_retrieve_body( $response ), true );
			if ( isset( $body['tasks'][0]['result'][0]['money']['current_balance'] ) ) {
				return $body['tasks'][0]['result'][0]['money']['current_balance'];
			}
			return false;
		}

		/**
		 * Live Search Volume Data.
		 */
		public function get_keyword_data( $keywords_array, $country_code = 'US', $language_code = 'en' ) {
			if ( ! $this->is_connected() ) return false;
			if ( empty( $keywords_array ) ) return [];

			$cache_key = 'sec_dfseo_vol_' . md5( implode( ',', $keywords_array ) . $country_code . $language_code );
			$cached = get_transient( $cache_key );
			if ( false !== $cached ) return $cached;

			$payload = [
				[
					'keywords'      => $keywords_array,
					'location_code' => $this->get_location_code( $country_code ),
					'language_code' => $language_code
				]
			];

			$response = wp_remote_post( $this->base_url . 'dataforseo_labs/google/search_volume/live', [
				'headers' => $this->get_auth_headers(),
				'body'    => wp_json_encode( $payload ),
				'timeout' => 30
			] );

			if ( is_wp_error( $response ) ) return $response;

			$body = json_decode( wp_remote_retrieve_body( $response ), true );
			$results = [];

			if ( isset( $body['tasks'][0]['result'] ) ) {
				foreach ( $body['tasks'][0]['result'] as $kw_data ) {
					$results[ $kw_data['keyword'] ] = [
						'search_volume' => $kw_data['search_volume'] ?? 0,
						'cpc'           => $kw_data['cpc'] ?? 0.00,
						'competition'   => $kw_data['competition'] ?? 0.00,
						'monthly'       => $kw_data['monthly_searches'] ?? []
					];
				}
				set_transient( $cache_key, $results, DAY_IN_SECONDS );
			}

			return $results;
		}

		/**
		 * Look up Single Keyword SERP ranking.
		 */
		public function get_serp_position( $keyword, $country_code, $target_url, $device = 'desktop' ) {
			if ( ! $this->is_connected() ) return false;

			$cache_key = 'sec_dfseo_serp_' . md5( $keyword . $country_code . $target_url . $device );
			$cached = get_transient( $cache_key );
			if ( false !== $cached ) return $cached;

			$payload = [
				[
					'keyword'       => $keyword,
					'location_code' => $this->get_location_code( $country_code ),
					'language_code' => 'en', // Defaulting en for now to simplify
					'device'        => $device,
					'os'            => 'desktop' === $device ? 'windows' : 'android',
					'depth'         => 100
				]
			];

			$response = wp_remote_post( $this->base_url . 'serp/google/organic/live/advanced', [
				'headers' => $this->get_auth_headers(),
				'body'    => wp_json_encode( $payload ),
				'timeout' => 45 // SERP live fetches can be slightly slower
			] );

			if ( is_wp_error( $response ) ) return $response;

			$body = json_decode( wp_remote_retrieve_body( $response ), true );
			$position = null;

			if ( isset( $body['tasks'][0]['result'][0]['items'] ) ) {
				$items = $body['tasks'][0]['result'][0]['items'];
				$host = wp_parse_url( $target_url, PHP_URL_HOST );
				$path = wp_parse_url( $target_url, PHP_URL_PATH );
				
				// Strip trailing slash from path for comparison
				if ( $path ) $path = rtrim( $path, '/' );

				foreach ( $items as $item ) {
					if ( 'organic' === $item['type'] && isset( $item['url'] ) ) {
						$res_host = wp_parse_url( $item['url'], PHP_URL_HOST );
						$res_path = wp_parse_url( $item['url'], PHP_URL_PATH );
						if ( $res_path ) $res_path = rtrim( $res_path, '/' );

						if ( $host === $res_host && $path === $res_path ) {
							$position = $item['rank_absolute'];
							break;
						}
					}
				}
			}

			// Cache strictly for 6 hours so we don't accidentally burn credits polling the same thing over and over manually
			set_transient( $cache_key, $position, 6 * HOUR_IN_SECONDS );
			return $position;
		}

		/**
		 * Get bulk ranking positions (queueing / Task mode in DataForSEO) - For efficiency
		 * 
		 * We use the task post + get methodology so we don't blow up timeout limits on 500+ keywords
		 */
		public function queue_bulk_positions( $keywords_array, $country_code = 'US', $device = 'desktop' ) {
			if ( ! $this->is_connected() ) return false;

			$payload = [];
			foreach ( $keywords_array as $kw_data ) {
				$payload[] = [
					'keyword'       => $kw_data['keyword'],
					'location_code' => $this->get_location_code( $country_code ),
					'language_code' => 'en',
					'device'        => $device,
					'depth'         => 100,
					'tag'           => $kw_data['id'] // Pass DB ID so we can match it later
				];
			}

			// Chunk payload max 100 per API request
			$chunks = array_chunk( $payload, 100 );
			$all_task_ids = [];

			foreach ( $chunks as $chunk ) {
				$response = wp_remote_post( $this->base_url . 'serp/google/organic/task_post', [
					'headers' => $this->get_auth_headers(),
					'body'    => wp_json_encode( $chunk ),
					'timeout' => 30
				] );
				
				if ( ! is_wp_error( $response ) ) {
					$body = json_decode( wp_remote_retrieve_body( $response ), true );
					if ( isset( $body['tasks'] ) ) {
						foreach ( $body['tasks'] as $task ) {
							if ( isset( $task['id'] ) ) {
								$all_task_ids[] = $task['id'];
							}
						}
					}
				}
		} // end foreach chunks

		return $all_task_ids;
	}

		/**
		 * Get Related Keywords for SEO Briefs (DataForSEO Labs)
		 */
		public function get_keyword_suggestions( $keyword, $country_code = 'US', $limit = 20 ) {
			if ( ! $this->is_connected() ) return [];

			$cache_key = 'sec_dfseo_lsi_' . md5( $keyword . $country_code . $limit );
			$cached = get_transient( $cache_key );
			if ( false !== $cached ) return $cached;

			$payload = [
				[
					'keyword'       => $keyword,
					'location_code' => $this->get_location_code( $country_code ),
					'language_code' => 'en',
					'limit'         => $limit
				]
			];

			$response = wp_remote_post( $this->base_url . 'dataforseo_labs/google/related_keywords/live', [
				'headers' => $this->get_auth_headers(),
				'body'    => wp_json_encode( $payload ),
				'timeout' => 30
			] );

			if ( is_wp_error( $response ) ) return [];

			$body = json_decode( wp_remote_retrieve_body( $response ), true );
			$results = [];

			if ( isset( $body['tasks'][0]['result'][0]['items'] ) ) {
				foreach ( $body['tasks'][0]['result'][0]['items'] as $item ) {
					if ( isset( $item['keyword_data']['keyword'] ) ) {
						$results[] = $item['keyword_data']['keyword'];
					}
				}
				set_transient( $cache_key, $results, 7 * DAY_IN_SECONDS );
			}

			return $results;
		}

		/**
		 * Get Top 10 Competitors for a Keyword
		 */
		public function get_competitors_for_keyword( $keyword, $country_code = 'US', $limit = 10 ) {
			if ( ! $this->is_connected() ) return [];

			$cache_key = 'sec_dfseo_comp_' . md5( $keyword . $country_code . $limit );
			$cached = get_transient( $cache_key );
			if ( false !== $cached ) return $cached;

			$payload = [
				[
					'keyword'       => $keyword,
					'location_code' => $this->get_location_code( $country_code ),
					'language_code' => 'en',
					'depth'         => $limit
				]
			];

			$response = wp_remote_post( $this->base_url . 'serp/google/organic/live/advanced', [
				'headers' => $this->get_auth_headers(),
				'body'    => wp_json_encode( $payload ),
				'timeout' => 30
			] );

			if ( is_wp_error( $response ) ) return [];

			$body = json_decode( wp_remote_retrieve_body( $response ), true );
			$results = [];

			if ( isset( $body['tasks'][0]['result'][0]['items'] ) ) {
				foreach ( $body['tasks'][0]['result'][0]['items'] as $item ) {
					if ( 'organic' === $item['type'] && isset( $item['url'] ) ) {
						$results[] = $item['url'];
					}
				}
				set_transient( $cache_key, $results, WEEK_IN_SECONDS );
			}

			return $results;
		}

		/**
		 * Mappings for typical DataForSEO location codes (USA = 2840, UK = 2826, etc)
		 */
		private function get_location_code( $country_string ) {
			$map = [
				'US' => 2840,
				'GB' => 2826,
				'CA' => 2124,
				'AU' => 2036,
				'IN' => 2356,
				'DE' => 2276,
				'FR' => 2250,
				'ES' => 2724,
				'IT' => 2380,
				'BR' => 2076,
				'MX' => 2484,
				'NL' => 2528,
				'SE' => 2752,
				'NO' => 2578,
				'DK' => 2208,
				'FI' => 2246,
				'PL' => 2616,
				'JP' => 2392,
				'KR' => 2410,
				'AE' => 2784,
				'SA' => 2682,
				'SG' => 2702,
				'ZA' => 2710,
				'NG' => 2566
			];
			$upper = strtoupper( $country_string );
			return isset( $map[ $upper ] ) ? $map[ $upper ] : 2840; // Default US
		}

		/**
		 * Encryption wrappers identical to GSC class
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
