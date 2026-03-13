<?php
/**
 * Google Analytics 4 API Handler
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_GA4_API' ) ) {

	/**
	 * Class SEO_Copilot_GA4_API
	 */
	class SEO_Copilot_GA4_API {

		private $client_id = '';
		private $client_secret = ''; 
		private $redirect_uri = '';

		public function __construct() {
			$this->redirect_uri = admin_url( 'admin.php?page=seo-copilot-settings' );
			
			// Re-use same client ID/Secret for simplicity if they enabled GA4 scope.
			// Ideally Google Cloud project has both Search Console and Analytics APIs enabled.
			$options = get_option( 'seo_copilot_settings', [] );
			$this->client_id = isset( $options['gsc_client_id'] ) ? $options['gsc_client_id'] : '';
			$this->client_secret = isset( $options['gsc_client_secret'] ) ? $options['gsc_client_secret'] : '';
		}

		/**
		 * Build OAuth URL.
		 */
		public function get_auth_url() {
			if ( empty( $this->client_id ) ) return '';

			$state = wp_create_nonce( 'seo_copilot_ga4_oauth' );
			set_transient( 'seo_copilot_ga4_state', $state, HOUR_IN_SECONDS );

			return add_query_arg( [
				'client_id'     => $this->client_id,
				'redirect_uri'  => urlencode( $this->redirect_uri ),
				'response_type' => 'code',
				'scope'         => urlencode( 'https://www.googleapis.com/auth/analytics.readonly' ),
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
				return new \WP_Error( 'ga4_auth_error', $body['error_description'] ?? $body['error'] );
			}

			if ( isset( $body['access_token'] ) ) {
				update_option( 'seo_copilot_ga4_access_token', $this->encrypt( $body['access_token'] ) );
				if ( isset( $body['refresh_token'] ) ) {
					update_option( 'seo_copilot_ga4_refresh_token', $this->encrypt( $body['refresh_token'] ) );
				}
				update_option( 'seo_copilot_ga4_token_expiry', time() + $body['expires_in'] );
				
				return true;
			}

			return false;
		}

		/**
		 * Disconnect GA4
		 */
		public function disconnect() {
			delete_option( 'seo_copilot_ga4_access_token' );
			delete_option( 'seo_copilot_ga4_refresh_token' );
			delete_option( 'seo_copilot_ga4_token_expiry' );
			delete_option( 'seo_copilot_ga4_property_id' );
			delete_option( 'seo_copilot_ga4_property_name' );
		}

		/**
		 * Refresh token logic.
		 */
		public function refresh_token_if_needed() {
			$expiry = get_option( 'seo_copilot_ga4_token_expiry', 0 );
			
			// If expiring in next 5 mins
			if ( time() > ( $expiry - 300 ) ) {
				$refresh_token = $this->decrypt( get_option( 'seo_copilot_ga4_refresh_token', '' ) );
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
					update_option( 'seo_copilot_ga4_access_token', $this->encrypt( $body['access_token'] ) );
					update_option( 'seo_copilot_ga4_token_expiry', time() + $body['expires_in'] );
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
			$token = get_option( 'seo_copilot_ga4_access_token' );
			$prop  = get_option( 'seo_copilot_ga4_property_name' );
			return ! empty( $token ) && ! empty( $prop ) ? $prop : false;
		}

		/**
		 * Setup active property ID
		 */
		public function set_active_property( $property_id, $property_name ) {
			update_option( 'seo_copilot_ga4_property_id', sanitize_text_field( $property_id ) );
			update_option( 'seo_copilot_ga4_property_name', sanitize_text_field( $property_name ) );
		}

		/**
		 * List properties
		 */
		public function get_property_list() {
			if ( ! $this->refresh_token_if_needed() ) {
				return new \WP_Error( 'ga4_token_error', 'Failed to refresh token.' );
			}

			$token = $this->decrypt( get_option( 'seo_copilot_ga4_access_token' ) );
			$url = 'https://analyticsadmin.googleapis.com/v1alpha/properties';

			$response = wp_remote_get( $url, [
				'headers' => [ 'Authorization' => 'Bearer ' . $token ],
				'timeout' => 15
			] );

			if ( is_wp_error( $response ) ) return $response;
			$body = json_decode( wp_remote_retrieve_body( $response ), true );

			if ( isset( $body['properties'] ) ) {
				return $body['properties'];
			}

			return [];
		}

		/**
		 * Run GA4 Report
		 */
		private function run_report( $dimensions, $metrics, $days = 30, $order_by = [] ) {
			if ( ! $this->refresh_token_if_needed() ) return false;

			$property_id = str_replace( 'properties/', '', get_option( 'seo_copilot_ga4_property_id', '' ) );
			if ( empty( $property_id ) ) return false;

			$token = $this->decrypt( get_option( 'seo_copilot_ga4_access_token' ) );
			
			$body = [
				'dateRanges' => [ [ 'startDate' => $days . 'daysAgo', 'endDate' => 'yesterday' ] ],
				'dimensions' => $dimensions,
				'metrics'    => $metrics,
			];

			if ( ! empty( $order_by ) ) {
				$body['orderBys'] = $order_by;
			}

			$url = 'https://analyticsdata.googleapis.com/v1beta/properties/' . $property_id . ':runReport';

			$response = wp_remote_post( $url, [
				'headers' => [
					'Authorization' => 'Bearer ' . $token,
					'Content-Type'  => 'application/json'
				],
				'body'    => wp_json_encode( $body ),
				'timeout' => 30
			] );

			if ( is_wp_error( $response ) ) return false;
			return json_decode( wp_remote_retrieve_body( $response ), true );
		}

		/**
		 * Get general traffic overview items
		 */
		public function get_traffic_overview( $days = 30 ) {
			$metrics = [
				['name' => 'sessions'],
				['name' => 'totalUsers'],
				['name' => 'bounceRate'],
				['name' => 'averageSessionDuration'],
			];

			$report = $this->run_report( [], $metrics, $days );
			if ( ! $report || ! isset( $report['rows'][0] ) ) {
				return [ 'sessions' => 0, 'users' => 0, 'bounce' => 0, 'duration' => 0 ];
			}

			$vals = $report['rows'][0]['metricValues'];
			return [
				'sessions' => intval( $vals[0]['value'] ?? 0 ),
				'users'    => intval( $vals[1]['value'] ?? 0 ),
				'bounce'   => round( floatval( $vals[2]['value'] ?? 0 ) * 100, 1 ),
				'duration' => round( floatval( $vals[3]['value'] ?? 0 ), 0 )
			];
		}

		/**
		 * Top pages by sessions
		 */
		public function get_top_pages( $limit = 10, $days = 30 ) {
			$dimensions = [ ['name' => 'pagePath'] ];
			$metrics = [
				['name' => 'sessions'],
				['name' => 'bounceRate'],
				['name' => 'averageSessionDuration']
			];
			$order = [
				[
					'metric' => ['metricName' => 'sessions'],
					'desc' => true
				]
			];

			$report = $this->run_report( $dimensions, $metrics, $days, $order );
			if ( ! $report || empty( $report['rows'] ) ) return [];

			$pages = [];
			foreach ( array_slice( $report['rows'], 0, $limit ) as $row ) {
				$pages[] = [
					'path'     => $row['dimensionValues'][0]['value'],
					'sessions' => intval( $row['metricValues'][0]['value'] ),
					'bounce'   => round( floatval( $row['metricValues'][1]['value'] ) * 100, 1 ),
					'duration' => gmdate( "H:i:s", intval( $row['metricValues'][2]['value'] ) )
				];
			}

			return $pages;
		}

		/**
		 * Session Default Channel Grouping
		 */
		public function get_traffic_sources( $days = 30 ) {
			$dimensions = [ ['name' => 'sessionDefaultChannelGroup'] ];
			$metrics = [ ['name' => 'sessions'] ];
			$order = [ [ 'metric' => ['metricName' => 'sessions'], 'desc' => true ] ];

			$report = $this->run_report( $dimensions, $metrics, $days, $order );
			if ( ! $report || empty( $report['rows'] ) ) return [];

			$sources = [];
			$total = 0;
			foreach ( $report['rows'] as $row ) {
				$total += intval( $row['metricValues'][0]['value'] );
			}

			foreach ( $report['rows'] as $row ) {
				$val = intval( $row['metricValues'][0]['value'] );
				$sources[] = [
					'source'   => $row['dimensionValues'][0]['value'],
					'sessions' => $val,
					'percent'  => $total > 0 ? round( ($val / $total) * 100, 1 ) : 0
				];
			}

			return $sources;
		}

		/**
		 * Basic encryption for tokens
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
