<?php
/**
 * Claude API Class
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Claude_API' ) ) {

	/**
	 * Class SEO_Copilot_Claude_API
	 */
	class SEO_Copilot_Claude_API implements SEO_Copilot_AI_Provider {

		/**
		 * API Endpoint.
		 */
		const ENDPOINT = 'https://api.anthropic.com/v1/messages';

		/**
		 * API Version.
		 */
		const API_VERSION = '2023-06-01';

		/**
		 * Get API Key.
		 *
		 * @return string
		 */
		private function get_api_key() {
			$options = get_option( 'seo_copilot_settings', [] );
			if ( empty( $options['claude_api_key'] ) ) {
				return '';
			}
			return $this->decrypt_data( $options['claude_api_key'] );
		}

		/**
		 * Get Model.
		 *
		 * @return string
		 */
		private function get_model() {
			$options = get_option( 'seo_copilot_settings', [] );
			return ! empty( $options['claude_model'] ) ? $options['claude_model'] : 'claude-3-5-sonnet-20241022';
		}

		/**
		 * Decrypt data using WP Salts.
		 * 
		 * @param string $data Encrypted data.
		 * @return string Decrypted data.
		 */
		private function decrypt_data( $data ) {
			if ( empty( $data ) ) {
				return '';
			}
			
			$key = defined( 'AUTH_KEY' ) ? AUTH_KEY : 'default-fallback-key-do-not-use-in-prod';
			$iv  = defined( 'NONCE_KEY' ) ? substr( NONCE_KEY, 0, 16 ) : str_repeat( '0', 16 );
			
			$decoded = base64_decode( $data );
			
			if ( function_exists( 'openssl_decrypt' ) && strpos( $decoded, '::SEO_COPILOT_FALLBACK_ENC::' ) === false ) {
				$decrypted = openssl_decrypt( $decoded, 'AES-256-CBC', $key, 0, $iv );
				if ( $decrypted !== false ) {
					return $decrypted;
				}
			}
			
			// Try fallback
			if ( strpos( $decoded, '::SEO_COPILOT_FALLBACK_ENC::' ) !== false ) {
				return str_replace( '::SEO_COPILOT_FALLBACK_ENC::', '', $decoded );
			}
			
			return '';
		}

		/**
		 * Make API Request with caching.
		 *
		 * @param string $system_prompt The system prompt.
		 * @param string $user_prompt   The user prompt.
		 * @param string $cache_key     Suffix for cache key.
		 * @return array|\WP_Error
		 */
		private function request( $system_prompt, $user_prompt, $cache_key ) {
			// Rate limit check (only applies to pro/agency tiers)
			$settings = new SEO_Copilot_Settings();
			$usage_check = $settings->increment_usage();
			if ( is_wp_error( $usage_check ) ) {
				return $usage_check;
			}

			$api_key = $this->get_api_key();
			if ( empty( $api_key ) ) {
				return new \WP_Error( 'missing_api_key', __( 'Claude API Key is not configured.', 'seo-copilot' ) );
			}

			$model = $this->get_model();
			
			// Setup full hash for transient
			$transient_key = 'seo_cop_claude_' . md5( $model . $system_prompt . $user_prompt . $cache_key );
			$cached = get_transient( $transient_key );
			
			if ( false !== $cached ) {
				return $cached;
			}

			$body = [
				'model'      => $model,
				'max_tokens' => 2000,
				'system'     => $system_prompt,
				'messages'   => [
					[
						'role'    => 'user',
						'content' => $user_prompt,
					],
				],
			];

			$args = [
				'method'  => 'POST',
				'timeout' => 45,
				'headers' => [
					'x-api-key'         => $api_key,
					'anthropic-version' => self::API_VERSION,
					'content-type'      => 'application/json',
				],
				'body'    => wp_json_encode( $body ),
			];

			$response = wp_remote_post( self::ENDPOINT, $args );

			if ( is_wp_error( $response ) ) {
				return new \WP_Error( 'api_error', $response->get_error_message() );
			}

			$response_code = wp_remote_retrieve_response_code( $response );
			$response_body = wp_remote_retrieve_body( $response );
			$data          = json_decode( $response_body, true );

			if ( 200 !== $response_code ) {
				$msg = isset( $data['error']['message'] ) ? $data['error']['message'] : __( 'Unknown Claude API Error.', 'seo-copilot' );
				return new \WP_Error( 'api_error', 'Claude Error: ' . $msg );
			}

			if ( ! isset( $data['content'][0]['text'] ) ) {
				return new \WP_Error( 'api_error', __( 'Unexpected response format from Claude.', 'seo-copilot' ) );
			}

			$text = $data['content'][0]['text'];
			
			// Attempt to extract JSON if encapsulated in markdown
			if ( preg_match( '/```json(.*?)```/s', $text, $matches ) ) {
				$text = trim( $matches[1] );
			} else {
				$text = trim( $text );
			}

			$json = json_decode( $text, true );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				return new \WP_Error( 'json_parse_error', __( 'Failed to parse JSON response from Claude.', 'seo-copilot' ) . ' Raw: ' . $text );
			}

			// Cache for 24 hours
			set_transient( $transient_key, $json, 24 * HOUR_IN_SECONDS );

			return $json;
		}

		public function generate_meta( $title, $content, $focus_keyword ) {
			$system = 'You are an expert SEO copywriter. Always return ONLY valid JSON without any markdown blocks or explanations.';
			$prompt = sprintf( SEO_COPILOT_PROMPT_GENERATE_META, $focus_keyword, $title, wp_strip_all_tags( $content ) );
			return $this->request( $system, $prompt, 'generate_meta' );
		}

		public function analyze_content( $content, $focus_keyword ) {
			$system = 'You are an expert SEO analyst. Always return ONLY valid JSON without any markdown blocks or explanations.';
			$prompt = sprintf( SEO_COPILOT_PROMPT_ANALYZE_CONTENT, $focus_keyword, wp_strip_all_tags( $content ) );
			return $this->request( $system, $prompt, 'analyze_content' );
		}

		public function generate_seo_brief( $keyword, $country_code, $target_data, $lsi_keywords, $competitor_intel ) {
			$system = 'You are an elite SEO Content Strategist. Always return ONLY valid JSON without any markdown blocks or explanations.';
			$prompt = sprintf( 
				SEO_COPILOT_PROMPT_GENERATE_BRIEF, 
				$keyword, 
				$country_code, 
				wp_json_encode( $target_data ), 
				wp_json_encode( $lsi_keywords ), 
				wp_json_encode( $competitor_intel ) 
			);
			return $this->request( $system, $prompt, 'generate_brief' );
		}

		public function suggest_internal_links( $content, $all_posts_titles ) {
			$system = 'You are an expert SEO strategist. Always return ONLY valid JSON without any markdown blocks or explanations.';
			$titles = is_array( $all_posts_titles ) ? implode( "\n", $all_posts_titles ) : $all_posts_titles;
			$prompt = sprintf( SEO_COPILOT_PROMPT_SUGGEST_LINKS, $titles, wp_strip_all_tags( $content ) );
			return $this->request( $system, $prompt, 'suggest_links' );
		}

		public function suggest_schema( $content, $post_type ) {
			$system = 'You are a Structured Data (JSON-LD) expert. Always return ONLY valid JSON without any markdown blocks or explanations.';
			$prompt = sprintf( SEO_COPILOT_PROMPT_SUGGEST_SCHEMA, $post_type, wp_strip_all_tags( $content ) );
			return $this->request( $system, $prompt, 'suggest_schema' );
		}

		public function analyze_decay( $content, $ranking_drop_data ) {
			$system = 'You are an expert Content Refresh Strategist. Always return ONLY valid JSON without any markdown blocks or explanations.';
			$data = is_array( $ranking_drop_data ) ? wp_json_encode( $ranking_drop_data ) : $ranking_drop_data;
			$prompt = sprintf( SEO_COPILOT_PROMPT_ANALYZE_DECAY, $data, wp_strip_all_tags( $content ) );
			return $this->request( $system, $prompt, 'analyze_decay' );
		}

		public function detect_cannibalization( $posts_array ) {
			$system = 'You are an expert SEO analyst. Always return ONLY valid JSON without any markdown blocks or explanations.';
			$data = is_array( $posts_array ) ? wp_json_encode( $posts_array ) : $posts_array;
			$prompt = sprintf( SEO_COPILOT_PROMPT_DETECT_CANNIBALIZATION, $data );
			return $this->request( $system, $prompt, 'detect_cannibalization' );
		}

		public function rewrite_text( $text ) {
			$system = 'You are an expert copywriter. Always return ONLY valid JSON without any markdown blocks or explanations.';
			$prompt = sprintf( SEO_COPILOT_PROMPT_REWRITE_TEXT, $text );
			return $this->request( $system, $prompt, 'rewrite_text' );
		}

		public function analyze_competitor_gap( $focus_keyword, $our_text, $comp_data_json ) {
			$system = 'You are an expert SEO analyst. Always return ONLY valid JSON without any markdown blocks or explanations.';
			$prompt = sprintf( SEO_COPILOT_PROMPT_ANALYZE_GAP, $focus_keyword, $our_text, $comp_data_json );
			return $this->request( $system, $prompt, 'analyze_gap' );
		}

		public function test_connection() {
			$api_key = $this->get_api_key();
			if ( empty( $api_key ) ) {
				return new \WP_Error( 'missing_api_key', __( 'Claude API Key is not configured.', 'seo-copilot' ) );
			}

			// Just make a minimal request to check auth
			$args = [
				'method'  => 'GET',
				'timeout' => 15,
				'headers' => [
					'x-api-key'         => $api_key,
					'anthropic-version' => self::API_VERSION,
				],
			];

			$response = wp_remote_request( 'https://api.anthropic.com/v1/models', $args );

			if ( is_wp_error( $response ) ) {
				return new \WP_Error( 'api_error', $response->get_error_message() );
			}

			$response_code = wp_remote_retrieve_response_code( $response );
			
			if ( 200 === $response_code ) {
				return true;
			}
			
			$body = json_decode( wp_remote_retrieve_body( $response ), true );
			$msg  = isset( $body['error']['message'] ) ? $body['error']['message'] : __( 'Connection failed with code ', 'seo-copilot' ) . $response_code;
			
			return new \WP_Error( 'api_error', $msg );
		}
	}
}
