<?php
/**
 * Competitor Gap Analyzer Class
 */
if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Competitor_Gap' ) ) {
	class SEO_Copilot_Competitor_Gap {

		private $table_name;

		public function __construct() {
			global $wpdb;
			$this->table_name = $wpdb->prefix . 'seo_copilot_competitor_analyses';

			add_action( 'wp_ajax_seo_copilot_analyze_gap', [ $this, 'ajax_analyze_gap' ] );
			add_action( 'wp_ajax_seo_copilot_get_gap_history', [ $this, 'ajax_get_gap_history' ] );
			add_action( 'wp_ajax_seo_copilot_delete_gap', [ $this, 'ajax_delete_gap' ] );
		}

		/**
		 * Scrape a URL for basic text content and heading structures.
		 */
		private function scrape_url( $url ) {
			$response = wp_remote_get( $url, [
				'timeout'    => 15,
				'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			] );

			if ( is_wp_error( $response ) ) return $response;
			
			$code = wp_remote_retrieve_response_code( $response );
			if ( 200 !== $code ) return new \WP_Error( 'http_error', "HTTP Error: $code" );

			$html = wp_remote_retrieve_body( $response );
			if ( empty( $html ) ) return new \WP_Error( 'empty_body', 'Scraped body is empty.' );

			// Suppress DOM warnings
			libxml_use_internal_errors( true );
			$dom = new \DOMDocument();
			$dom->loadHTML( $html );
			libxml_clear_errors();

			// Extract title
			$title = '';
			$title_nodes = $dom->getElementsByTagName( 'title' );
			if ( $title_nodes->length > 0 ) $title = $title_nodes->item( 0 )->nodeValue;

			// Remove scripts and styles
			$script_nodes = $dom->getElementsByTagName( 'script' );
			$style_nodes = $dom->getElementsByTagName( 'style' );
			
			$remove = [];
			foreach ( $script_nodes as $n ) $remove[] = $n;
			foreach ( $style_nodes as $n ) $remove[] = $n;
			foreach ( $remove as $n ) $n->parentNode->removeChild( $n );

			// Get main text content (rudimentary)
			$body = $dom->getElementsByTagName( 'body' )->item( 0 );
			$text = $body ? $body->textContent : $dom->textContent;
			$text = preg_replace( '/\s+/', ' ', trim( $text ) );

			// Get headings
			$headings = [];
			for ( $i = 1; $i <= 3; $i++ ) {
				$hnodes = $dom->getElementsByTagName( "h{$i}" );
				foreach ( $hnodes as $n ) {
					$h_text = trim( preg_replace( '/\s+/', ' ', $n->textContent ) );
					if ( ! empty( $h_text ) ) {
						$headings[] = "H{$i}: {$h_text}";
					}
				}
			}

			$word_count = str_word_count( $text );

			return [
				'title'      => $title,
				'word_count' => $word_count,
				'headings'   => $headings,
				'text'       => substr( $text, 0, 10000 ) // max 10k chars to save tokens
			];
		}

		public function analyze_gap( $post_id, $competitor_url, $focus_keyword ) {
			$post = get_post( $post_id );
			if ( ! $post ) return new \WP_Error( 'not_found', 'Source post not found.' );

			// Scrape Competitor
			$comp_data = $this->scrape_url( $competitor_url );
			if ( is_wp_error( $comp_data ) ) return $comp_data;

			// Prepare Our Data
			$our_text = wp_strip_all_tags( $post->post_content );
			$our_words = str_word_count( $our_text );

			// Call AI Provider to perform gap analysis
			$ai = SEO_Copilot_AI_Factory::get_provider();
			if ( is_wp_error( $ai ) ) return $ai;

			// We need a new prompt for this. Let's assume it's added to prompts.php
			$result = $ai->analyze_competitor_gap( $focus_keyword, $our_text, json_encode( $comp_data ) );

			if ( is_wp_error( $result ) ) return $result;

			$final_data = [
				'competitor_url'      => $competitor_url,
				'competitor_title'    => $comp_data['title'],
				'competitor_words'    => $comp_data['word_count'],
				'our_words'           => $our_words,
				'gap_analysis'        => $result 
			];

			// Save to DB
			global $wpdb;
			$wpdb->insert( $this->table_name, [
				'post_id'        => $post_id,
				'competitor_url' => esc_url_raw( $competitor_url ),
				'focus_keyword'  => sanitize_text_field( $focus_keyword ),
				'analysis_data'  => json_encode( $final_data ),
				'created_at'     => current_time( 'mysql' )
			] );

			$final_data['id'] = $wpdb->insert_id;

			return $final_data;
		}

		public function get_history() {
			global $wpdb;
			return $wpdb->get_results( "SELECT a.*, p.post_title FROM {$this->table_name} a JOIN {$wpdb->posts} p ON a.post_id = p.ID ORDER BY a.created_at DESC LIMIT 50" );
		}

		// --- AJAX HANDLERS ---

		public function ajax_analyze_gap() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'edit_posts' ) ) wp_send_json_error( 'Permission denied' );

			$post_id = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
			$url = isset( $_POST['competitor_url'] ) ? esc_url_raw( $_POST['competitor_url'] ) : '';
			$keyword = isset( $_POST['focus_keyword'] ) ? sanitize_text_field( $_POST['focus_keyword'] ) : '';

			if ( ! $post_id || ! $url || ! $keyword ) wp_send_json_error( 'Missing required parameters.' );

			$data = $this->analyze_gap( $post_id, $url, $keyword );
			if ( is_wp_error( $data ) ) wp_send_json_error( $data->get_error_message() );

			wp_send_json_success( $data );
		}

		public function ajax_get_gap_history() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'edit_posts' ) ) wp_send_json_error( 'Permission denied' );
			wp_send_json_success( $this->get_history() );
		}

		public function ajax_delete_gap() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'edit_posts' ) ) wp_send_json_error( 'Permission denied' );

			$id = isset( $_POST['id'] ) ? intval( $_POST['id'] ) : 0;
			if ( ! $id ) wp_send_json_error( 'Invalid ID.' );

			global $wpdb;
			$wpdb->delete( $this->table_name, [ 'id' => $id ] );
			wp_send_json_success( 'Deleted.' );
		}
	}
}
new SEO_Copilot_Competitor_Gap();
