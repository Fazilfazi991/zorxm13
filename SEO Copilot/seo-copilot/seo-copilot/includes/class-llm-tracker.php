<?php
/**
 * LLM Visibility Tracker
 *
 * @package SEO_Copilot
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

class SEO_Copilot_LLM_Tracker {

	private static $instance = null;

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'wp_ajax_seo_copilot_run_llm_check', [ $this, 'ajax_run_llm_check' ] );
		add_action( 'wp_ajax_seo_copilot_check_single_query', [ $this, 'ajax_check_single_query' ] );
		add_action( 'wp_ajax_seo_copilot_add_llm_query', [ $this, 'ajax_add_llm_query' ] );
		add_action( 'wp_ajax_seo_copilot_remove_llm_query', [ $this, 'ajax_remove_llm_query' ] );
		add_action( 'wp_ajax_seo_copilot_get_llm_suggestions', [ $this, 'ajax_get_llm_suggestions' ] );
		add_action( 'wp_ajax_seo_copilot_generate_queries', [ $this, 'ajax_generate_queries' ] );
		add_action( 'wp_ajax_seo_copilot_save_llm_location', [ $this, 'ajax_save_llm_location' ] );

		add_action( 'seo_copilot_llm_weekly_check', [ $this, 'run_visibility_checks' ] );
	}

	/**
	 * Get active queries to check against LLMs
	 */
	public function get_active_queries() {
		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_llm_queries';
		return $wpdb->get_results( "SELECT * FROM $table WHERE is_active = 1", ARRAY_A );
	}

	/**
	 * Get user location for LLM checks
	 */
	public function get_user_location() {
		$location = get_user_meta( get_current_user_id(), 'seo_copilot_llm_location', true );
		return empty( $location ) ? 'United States' : $location;
	}

	/**
	 * Generate default queries for site based on site info
	 */
	public function get_default_queries() {
		$gsc_api = new SEO_Copilot_GSC_API();
		$gsc_keywords = [];
		if ( $gsc_api->is_connected() ) {
			$gsc_keywords = $gsc_api->get_top_keywords( 10, 90 );
		}

		if ( ! empty( $gsc_keywords ) && ! is_wp_error( $gsc_keywords ) ) {
			return $gsc_keywords;
		}

		// Fallback to AI generation
		$site_url = get_site_url();
		$site_name = get_bloginfo( 'name' );
		$ai_provider = SEO_Copilot_AI_Factory::get_provider();

		$prompt = "Generate 5 common search queries that users might ask an AI (like ChatGPT) where they should realistically be recommended the website '$site_name' ($site_url). Provide only the questions, one per line.";
		
		$response = $ai_provider->generate_text($prompt);
		if ( is_wp_error( $response ) ) {
			return [
				"What are the best resources for " . $site_name . "?",
				"Which websites do you recommend for learning more about " . $site_name . "?",
				"What are the top tools for " . $site_name . "?",
			];
		}

		$lines = map_deep(explode("\n", trim($response)), 'trim');
		$lines = array_filter($lines, function($line) {
			return !empty($line) && strlen($line) > 5;
		});

		$queries = [];
		foreach ($lines as $line) {
			$line = preg_replace('/^[-*•\d\.]+\s*/', '', $line);
			$line = trim($line, '"\'');
			if (!empty($line)) {
				$queries[] = $line;
			}
		}

		return array_slice($queries, 0, 5);
	}

	/**
	 * Run simulation check using AI Factory
	 */
	public function check_llm_visibility( $query ) {
		$site_url = get_site_url();
		$site_name = get_bloginfo( 'name' );
		$location = $this->get_user_location();
		$ai_provider = SEO_Copilot_AI_Factory::get_provider();

		$prompt = "You are simulating how different AI models respond to user queries.

Query: '{$query}'
Location context: '{$location}'

Respond as if you are each of these AI assistants answering this question:

1. As ChatGPT: give a natural response
2. As Claude: give a natural response  
3. As Gemini: give a natural response
4. As Perplexity: give a natural response with sources

For each response, would you mention a site called '{$site_name}' (URL: {$site_url})?

Return ONLY raw JSON, exactly like this:
{
  \"chatgpt\": {
    \"response_preview\": \"first 200 chars\",
    \"mentioned\": true or false,
    \"context\": \"sentence where mentioned\",
    \"sentiment\": \"positive|neutral|negative\",
    \"reason_if_not\": \"why not mentioned\"
  },
  \"claude\": {
    \"response_preview\": \"first 200 chars\",
    \"mentioned\": true or false,
    \"context\": \"sentence where mentioned\",
    \"sentiment\": \"positive|neutral|negative\",
    \"reason_if_not\": \"why not mentioned\"
  },
  \"gemini\": {
    \"response_preview\": \"first 200 chars\",
    \"mentioned\": true or false,
    \"context\": \"sentence where mentioned\",
    \"sentiment\": \"positive|neutral|negative\",
    \"reason_if_not\": \"why not mentioned\"
  },
  \"perplexity\": {
    \"response_preview\": \"first 200 chars\",
    \"mentioned\": true or false,
    \"context\": \"sentence where mentioned\",
    \"sentiment\": \"positive|neutral|negative\",
    \"reason_if_not\": \"why not mentioned\"
  }
}";

		$response = $ai_provider->generate_text( $prompt );
		if ( is_wp_error( $response ) ) return $response;

		$response = preg_replace('/```json|```/', '', $response);
		$data = json_decode(trim($response), true);

		if ( ! is_array( $data ) ) {
			return new WP_Error( 'json_error', 'Failed to parse AI response into JSON.' );
		}

		return $data;
	}

	/**
	 * Run checks for queries
	 */
	public function run_visibility_checks( $query_id = null ) {
		global $wpdb;
		$table_checks = $wpdb->prefix . 'seo_copilot_llm_checks';

		$queries = [];
		if ( $query_id ) {
			$table_queries = $wpdb->prefix . 'seo_copilot_llm_queries';
			$q = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_queries WHERE id = %d", $query_id ), ARRAY_A );
			if ($q) $queries[] = $q;
		} else {
			$gsc_api = new SEO_Copilot_GSC_API();
			if ( $gsc_api->is_connected() ) {
				$gsc_kws = $gsc_api->get_top_keywords( 20, 90 );
				if ( ! is_wp_error( $gsc_kws ) && ! empty( $gsc_kws ) ) {
					// Use GSC instead of DB
					foreach ( $gsc_kws as $kw ) {
						$queries[] = [ 'query_text' => $kw, 'query_type' => 'keyword' ];
					}
				}
			}

			if ( empty($queries) ) {
				$queries = $this->get_active_queries();
			}
		}

		if ( empty( $queries ) ) return false;

		foreach ( $queries as $q ) {
			$query_text = $q['query_text'];
			$query_type = $q['query_type'];

			$results = $this->check_llm_visibility( $query_text );
			
			if ( ! is_wp_error( $results ) && is_array( $results ) ) {
				$providers = ['chatgpt' => 'openai', 'claude' => 'claude', 'gemini' => 'gemini', 'perplexity' => 'perplexity'];
				
				foreach ( $providers as $sim_key => $db_provider ) {
					if ( isset( $results[$sim_key] ) ) {
						$res = $results[$sim_key];
						$wpdb->insert(
							$table_checks,
							[
								'query_text' => $query_text,
								'query_type' => $query_type,
								'llm_provider' => $db_provider,
								'response_text' => isset($res['response_preview']) ? $res['response_preview'] : '',
								'mentioned' => (isset($res['mentioned']) && $res['mentioned']) ? 1 : 0,
								'mention_context' => isset($res['context']) ? $res['context'] : '',
								'mention_sentiment' => isset($res['sentiment']) ? $res['sentiment'] : 'neutral',
								'position_in_response' => 1,
								'checked_at' => current_time('mysql')
							]
						);
					}
				}
			}
		}

		return true;
	}

	/**
	 * Visibility Score calculation
	 */
	public function get_visibility_score() {
		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_llm_checks';

		// Get checks within last 7 days
		$checks = $wpdb->get_results( "SELECT mentioned FROM $table WHERE checked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)", ARRAY_A );
		if ( empty( $checks ) ) return 0;

		$mentions = 0;
		$total = count($checks);
		foreach ($checks as $c) {
			if ( intval($c['mentioned']) === 1 ) $mentions++;
		}

		return $total > 0 ? round( ($mentions / $total) * 100 ) : 0;
	}

	public function get_visibility_summary() {
		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_llm_checks';

		$summary = [
			'claude' => ['rate' => 0, 'total' => 0, 'mentions' => 0],
			'gemini' => ['rate' => 0, 'total' => 0, 'mentions' => 0],
			'openai' => ['rate' => 0, 'total' => 0, 'mentions' => 0],
			'perplexity' => ['rate' => 0, 'total' => 0, 'mentions' => 0],
		];

		$results = $wpdb->get_results( "SELECT llm_provider, mentioned FROM $table WHERE checked_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)", ARRAY_A );

		if ( $results ) {
			foreach ($results as $row) {
				$p = $row['llm_provider'];
				if (!isset($summary[$p])) continue;
				$summary[$p]['total']++;
				if ( intval($row['mentioned']) === 1 ) {
					$summary[$p]['mentions']++;
				}
			}

			foreach ($summary as $p => $data) {
				if ($data['total'] > 0) {
					$summary[$p]['rate'] = round( ($data['mentions'] / $data['total']) * 100 );
				}
			}
		}

		return $summary;
	}

	public function get_improvement_suggestions() {
		$rate = $this->get_visibility_score();
		if ($rate >= 75) {
			return ["message" => "Your visibility is excellent! Keep maintaining authority."];
		}

		$options = get_option('seo_copilot_settings', []);
		$ai_provider = SEO_Copilot_AI_Factory::get_provider();

		$site_name = get_bloginfo('name');
		
		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_llm_checks';
		$missed = $wpdb->get_col( "SELECT DISTINCT query_text FROM $table WHERE mentioned = 0 ORDER BY id DESC LIMIT 5" );
		
		$query_list = implode(', ', $missed);

		$prompt = "My website '$site_name' is not being recommended by AI models when people ask related queries.
Current mention rate: {$rate}%
Queries where my site was NOT mentioned: 
{$query_list}

What specific content or technical SEO steps should I take to become a source that AI models recommend? Return exactly as a raw JSON string like this:
{
  \"root_cause\": \"A brief explanation\",
  \"content_gaps\": [\"gap 1\", \"gap 2\"],
  \"quick_wins\": [
    {
      \"action\": \"string\",
      \"why\": \"string\", 
      \"effort\": \"low\",
      \"impact\": \"high\"
    }
  ],
  \"long_term_strategy\": \"string\"
}";

		$response = $ai_provider->generate_text($prompt);
		if ( is_wp_error( $response ) ) return false;

		$response = preg_replace('/```json|```/', '', $response);
		return json_decode(trim($response), true);
	}

	public function get_mention_history( $days = 30 ) {
		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_llm_checks';

		$results = $wpdb->get_results( $wpdb->prepare(
			"SELECT DATE(checked_at) as date, llm_provider, AVG(mentioned) * 100 as rate 
			 FROM $table 
			 WHERE checked_at >= DATE_SUB(NOW(), INTERVAL %d DAY)
			 GROUP BY DATE(checked_at), llm_provider
			 ORDER BY date ASC",
			$days
		), ARRAY_A );

		$history = [];
		foreach ($results as $r) {
			$date = $r['date'];
			$prov = $r['llm_provider'];
			if (!isset($history[$date])) $history[$date] = [];
			$history[$date][$prov] = round($r['rate']);
		}

		return $history;
	}


	// AJAX Methods

	public function ajax_run_llm_check() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

		$result = $this->run_visibility_checks();
		wp_send_json_success( ['message' => 'Check complete', 'success' => $result] );
	}

	public function ajax_check_single_query() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

		$query_id = isset($_POST['query_id']) ? intval($_POST['query_id']) : 0;
		if ( ! $query_id ) wp_send_json_error( 'Invalid ID' );

		$this->run_visibility_checks($query_id);
		wp_send_json_success( ['message' => 'Query checked!'] );
	}

	public function ajax_add_llm_query() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

		$query_text = isset($_POST['query_text']) ? sanitize_text_field(wp_unslash($_POST['query_text'])) : '';
		$query_type = isset($_POST['query_type']) ? sanitize_text_field($_POST['query_type']) : 'keyword';

		if ( empty($query_text) ) wp_send_json_error('Empty query');

		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_llm_queries';
		
		$wpdb->insert( $table, [
			'query_text' => $query_text,
			'query_type' => $query_type,
			'is_active' => 1,
			'created_at' => current_time('mysql')
		] );

		wp_send_json_success( ['message' => 'Query added', 'id' => $wpdb->insert_id] );
	}

	public function ajax_remove_llm_query() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

		$query_id = isset($_POST['query_id']) ? intval($_POST['query_id']) : 0;
		if ( ! $query_id ) wp_send_json_error( 'Invalid ID' );

		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_llm_queries';
		$wpdb->delete( $table, ['id' => $query_id] );

		wp_send_json_success( ['message' => 'Query removed'] );
	}

	public function ajax_get_llm_suggestions() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

		$sugg = $this->get_improvement_suggestions();
		if ( ! $sugg ) wp_send_json_error( 'Could not generate suggestions.' );

		wp_send_json_success( ['suggestions' => $sugg] );
	}

	public function ajax_generate_queries() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

		$queries = $this->get_default_queries();
		if ( empty($queries) ) wp_send_json_error( 'Could not generate queries.' );

		wp_send_json_success( ['queries' => $queries] );
	}

	public function ajax_save_llm_location() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

		$location = isset($_POST['location']) ? sanitize_text_field(wp_unslash($_POST['location'])) : 'United States';
		update_user_meta( get_current_user_id(), 'seo_copilot_llm_location', $location );

		wp_send_json_success( ['message' => 'Location saved'] );
	}
}

function seo_copilot_llm_tracker() {
	return SEO_Copilot_LLM_Tracker::get_instance();
}

seo_copilot_llm_tracker();
