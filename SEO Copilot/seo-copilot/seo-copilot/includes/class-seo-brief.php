<?php
/**
 * SEO Brief Generator Class
 */
if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_SEO_Brief' ) ) {
	class SEO_Copilot_SEO_Brief {
		
		private $table_name;

		public function __construct() {
			global $wpdb;
			$this->table_name = $wpdb->prefix . 'seo_copilot_briefs';

			// AJAX Hooks
			add_action( 'wp_ajax_seo_copilot_generate_brief', [ $this, 'ajax_generate_brief' ] );
			add_action( 'wp_ajax_seo_copilot_save_brief', [ $this, 'ajax_save_brief' ] );
			add_action( 'wp_ajax_seo_copilot_assign_brief', [ $this, 'ajax_assign_brief' ] );
			add_action( 'wp_ajax_seo_copilot_delete_brief', [ $this, 'ajax_delete_brief' ] );
			add_action( 'wp_ajax_seo_copilot_get_briefs', [ $this, 'ajax_get_briefs' ] );
			add_action( 'wp_ajax_seo_copilot_create_post', [ $this, 'ajax_create_post' ] );
		}

		/**
		 * Generate Brief
		 * 
		 * @param string $keyword
		 * @param string $country_code
		 * @return array|\WP_Error
		 */
		public function generate_brief( $keyword, $country_code = 'US' ) {
			// Step 1 - Keyword Intelligence
			$dfseo = new SEO_Copilot_DataForSEO_API();
			
			$kw_data = $dfseo->get_keyword_data( [ $keyword ], $country_code );
			$target_data = isset( $kw_data[$keyword] ) ? $kw_data[$keyword] : [ 'search_volume' => 0, 'cpc' => 0, 'competition' => 0 ];
			
			$lsi_keywords = $dfseo->get_keyword_suggestions( $keyword, $country_code, 20 );
			$competitors  = $dfseo->get_competitors_for_keyword( $keyword, $country_code, 10 );
			
			// Step 2 - Competitor Analysis
			$competitor_intel = [];
			$urls_to_scrape = array_slice( $competitors, 0, 5 ); // Top 5

			foreach ( $urls_to_scrape as $url ) {
				$intel = $this->scrape_competitor( $url );
				if ( $intel ) {
					$competitor_intel[] = $intel;
				}
			}

			// Step 3 - AI Brief Generation
			$ai = SEO_Copilot_AI_Factory::get_provider();
			$brief_json = $ai->generate_seo_brief( $keyword, $country_code, $target_data, $lsi_keywords, $competitor_intel );

			if ( is_wp_error( $brief_json ) ) {
				return $brief_json;
			}

			// Step 4 - Internal Link Suggestions
			$internal_links = $this->suggest_internal_links( $keyword );
			if ( isset( $brief_json['internal_links_to_include'] ) ) {
				$brief_json['internal_links_to_include'] = $internal_links;
			}

			return $brief_json;
		}

		/**
		 * Scrape Competitor URL for Headings, Title, Word Count
		 */
		private function scrape_competitor( $url ) {
			$response = wp_remote_get( $url, [ 'timeout' => 15 ] );
			if ( is_wp_error( $response ) ) return false;

			$html = wp_remote_retrieve_body( $response );
			if ( empty( $html ) ) return false;

			// Basic extraction using regex for speed, or DOMDocument
			$doc = new DOMDocument();
			@$doc->loadHTML( mb_convert_encoding( $html, 'HTML-ENTITIES', 'UTF-8' ) );
			$xpath = new DOMXPath( $doc );

			$title = '';
			$title_nodes = $doc->getElementsByTagName( 'title' );
			if ( $title_nodes->length > 0 ) $title = $title_nodes->item(0)->nodeValue;

			$desc = '';
			$meta_desc = $xpath->query( '//meta[@name="description"]/@content' );
			if ( $meta_desc->length > 0 ) $desc = $meta_desc->item(0)->nodeValue;

			$h1 = [];
			foreach ( $doc->getElementsByTagName( 'h1' ) as $node ) {
				$h1[] = trim( $node->nodeValue );
			}

			$h2 = [];
			foreach ( $doc->getElementsByTagName( 'h2' ) as $node ) {
				$h2[] = trim( $node->nodeValue );
			}

			$h3 = [];
			foreach ( $doc->getElementsByTagName( 'h3' ) as $node ) {
				$h3[] = trim( $node->nodeValue );
			}

			// Word count estimate (strip tags from body)
			$body = $doc->getElementsByTagName( 'body' );
			$word_count = 0;
			if ( $body->length > 0 ) {
				$text = strip_tags( $body->item(0)->nodeValue );
				$word_count = str_word_count( $text );
			}

			// Internal links estimate
			$internal_links = 0;
			$host = wp_parse_url( $url, PHP_URL_HOST );
			foreach ( $doc->getElementsByTagName( 'a' ) as $link ) {
				$href = $link->getAttribute( 'href' );
				if ( strpos( $href, $host ) !== false || strpos( $href, '/' ) === 0 ) {
					$internal_links++;
				}
			}

			return [
				'url'            => $url,
				'title'          => $title,
				'description'    => $desc,
				'h1'             => $h1,
				'h2'             => $h2,
				'h3'             => $h3,
				'word_count'     => $word_count,
				'internal_links' => $internal_links
			];
		}

		/**
		 * Find related posts via WP_Query
		 */
		private function suggest_internal_links( $keyword ) {
			$args = [
				's'              => $keyword,
				'post_type'      => 'any',
				'post_status'    => 'publish',
				'posts_per_page' => 5,
				'orderby'        => 'relevance'
			];
			$query = new WP_Query( $args );
			$suggestions = [];

			if ( $query->have_posts() ) {
				foreach ( $query->posts as $p ) {
					$suggestions[] = [
						'post_id' => $p->ID,
						'title'   => $p->post_title,
						'url'     => get_permalink( $p->ID )
					];
				}
			}
			return $suggestions;
		}

		/**
		 * Save Brief to DB
		 */
		public function save_brief( $keyword, $country, $brief_data ) {
			global $wpdb;
			
			$data = [
				'keyword'      => $keyword,
				'country_code' => $country,
				'brief_data'   => wp_json_encode( $brief_data ),
				'created_at'   => current_time( 'mysql' ),
				'updated_at'   => current_time( 'mysql' ),
				'status'       => 'draft'
			];

			$format = [ '%s', '%s', '%s', '%s', '%s', '%s' ];

			$wpdb->insert( $this->table_name, $data, $format );
			return $wpdb->insert_id;
		}

		/**
		 * Assign brief to a WP post
		 */
		public function assign_to_post( $brief_id, $post_id ) {
			global $wpdb;
			return $wpdb->update( 
				$this->table_name, 
				[ 'post_id' => intval( $post_id ), 'status' => 'assigned', 'updated_at' => current_time( 'mysql' ) ], 
				[ 'id' => intval( $brief_id ) ], 
				[ '%d', '%s', '%s' ], 
				[ '%d' ] 
			);
		}

		/**
		 * Get Briefs
		 */
		public function get_briefs( $status = null ) {
			global $wpdb;
			if ( $status ) {
				return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$this->table_name} WHERE status = %s ORDER BY created_at DESC", $status ) );
			}
			return $wpdb->get_results( "SELECT * FROM {$this->table_name} ORDER BY created_at DESC" );
		}

		/**
		 * Delete Brief
		 */
		public function delete_brief( $brief_id ) {
			global $wpdb;
			return $wpdb->delete( $this->table_name, [ 'id' => intval( $brief_id ) ], [ '%d' ] );
		}

		// --- AJAX HANDLERS ---

		public function ajax_generate_brief() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

			$keyword = isset( $_POST['keyword'] ) ? sanitize_text_field( $_POST['keyword'] ) : '';
			$country = isset( $_POST['country'] ) ? sanitize_text_field( $_POST['country'] ) : 'US';

			if ( empty( $keyword ) ) wp_send_json_error( 'Missing keyword.' );

			$result = $this->generate_brief( $keyword, $country );
			if ( is_wp_error( $result ) ) {
				wp_send_json_error( $result->get_error_message() );
			}

			wp_send_json_success( $result );
		}

		public function ajax_save_brief() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

			$keyword = isset( $_POST['keyword'] ) ? sanitize_text_field( $_POST['keyword'] ) : '';
			$country = isset( $_POST['country'] ) ? sanitize_text_field( $_POST['country'] ) : 'US';
			$data    = isset( $_POST['brief_data'] ) ? wp_unslash( $_POST['brief_data'] ) : '';

			$decoded = json_decode( $data, true );
			if ( ! $decoded ) wp_send_json_error( 'Invalid JSON.' );

			$id = $this->save_brief( $keyword, $country, $decoded );
			if ( $id ) {
				wp_send_json_success( [ 'id' => $id, 'message' => 'Saved successfully.' ] );
			}
			wp_send_json_error( 'Database error.' );
		}

		public function ajax_assign_brief() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

			$brief_id = isset( $_POST['brief_id'] ) ? intval( $_POST['brief_id'] ) : 0;
			$post_id  = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;

			if ( $this->assign_to_post( $brief_id, $post_id ) ) {
				wp_send_json_success( 'Assigned.' );
			}
			wp_send_json_error( 'Database update failed.' );
		}

		public function ajax_delete_brief() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

			$brief_id = isset( $_POST['brief_id'] ) ? intval( $_POST['brief_id'] ) : 0;

			if ( $this->delete_brief( $brief_id ) ) {
				wp_send_json_success( 'Deleted.' );
			}
			wp_send_json_error( 'Delete failed.' );
		}

		public function ajax_get_briefs() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

			$briefs = $this->get_briefs();
			wp_send_json_success( $briefs );
		}

		public function ajax_create_post() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'edit_posts' ) ) wp_send_json_error( 'Permission denied.' );

			$brief_id = isset( $_POST['brief_id'] ) ? intval( $_POST['brief_id'] ) : 0;
			if ( ! $brief_id ) wp_send_json_error( 'Missing brief ID.' );

			global $wpdb;
			$brief = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->table_name} WHERE id = %d", $brief_id ) );

			if ( ! $brief ) wp_send_json_error( 'Brief not found.' );

			$data = json_decode( $brief->brief_data, true );
			$title = isset( $data['recommended_title'] ) ? sanitize_text_field( $data['recommended_title'] ) : 'Untitled Brief Post';
			
			// Build the content scaffolding from the outline
			$content = "<!-- SEO Copilot Brief Scaffold -->\n\n";
			if ( isset( $data['outline'] ) && is_array( $data['outline'] ) ) {
				foreach ( $data['outline'] as $item ) {
					$tag = strtolower( isset( $item['type'] ) ? $item['type'] : 'h2' );
					if ( ! in_array( $tag, [ 'h1', 'h2', 'h3' ] ) ) $tag = 'h2';
					
					$content .= "<{$tag}>" . sanitize_text_field( $item['text'] ) . "</{$tag}>\n";
					if ( ! empty( $item['notes'] ) ) {
						$content .= "<p><em>Brief Note: " . sanitize_text_field( $item['notes'] ) . "</em></p>\n\n";
					}
				}
			}

			$post_id = wp_insert_post( [
				'post_title'   => $title,
				'post_content' => $content,
				'post_status'  => 'draft',
				'post_type'    => 'post'
			] );

			if ( is_wp_error( $post_id ) ) {
				wp_send_json_error( $post_id->get_error_message() );
			}

			// Assign the brief to the new post
			$this->assign_to_post( $brief_id, $post_id );

			// Also save the focus keyword to post meta for the metabox to pick up later
			update_post_meta( $post_id, '_seo_copilot_focus_keyword', sanitize_text_field( $brief->keyword ) );

			wp_send_json_success( [
				'post_id'  => $post_id,
				'edit_url' => get_edit_post_link( $post_id, 'raw' )
			] );
		}
	}
}
new SEO_Copilot_SEO_Brief();
