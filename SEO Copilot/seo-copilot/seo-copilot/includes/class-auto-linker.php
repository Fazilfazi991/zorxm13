<?php
/**
 * Auto Linker Class
 */
if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Auto_Linker' ) ) {
	class SEO_Copilot_Auto_Linker {
		
		private $map_table;
		private $links_table;

		public function __construct() {
			global $wpdb;
			$this->map_table = $wpdb->prefix . 'seo_copilot_keyword_map';
			$this->links_table = $wpdb->prefix . 'seo_copilot_auto_links';

			// AJAX Hooks
			add_action( 'wp_ajax_seo_copilot_build_map', [ $this, 'ajax_build_map' ] );
			add_action( 'wp_ajax_seo_copilot_scan_links', [ $this, 'ajax_scan_links' ] );
			add_action( 'wp_ajax_seo_copilot_apply_links', [ $this, 'ajax_apply_links' ] );
			add_action( 'wp_ajax_seo_copilot_get_orphans', [ $this, 'ajax_get_orphans' ] );
		}

		/**
		 * Rebuild the entire keyword map from published posts
		 */
		public function build_keyword_map() {
			global $wpdb;

			// Truncate existing map
			$wpdb->query( "TRUNCATE TABLE {$this->map_table}" );

			// Get all published posts
			$posts = get_posts( [
				'post_type'      => 'any',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'fields'         => 'ids'
			] );

			$count = 0;
			foreach ( $posts as $post_id ) {
				// 1. Try to get Focus Keyword from our own plugin meta
				$focus_kw = get_post_meta( $post_id, '_seo_copilot_focus_keyword', true );
				
				// 2. Try to get from Yoast if ours is missing
				if ( empty( $focus_kw ) ) {
					$focus_kw = get_post_meta( $post_id, '_yoast_wpseo_focuskw', true );
				}

				// 3. Try to get from RankMath if Yoast is missing
				if ( empty( $focus_kw ) ) {
					$focus_kw = get_post_meta( $post_id, 'rank_math_focus_keyword', true );
				}

				if ( ! empty( $focus_kw ) ) {
					// RankMath stores multiple keywords comma separated
					$kws = explode( ',', $focus_kw );
					foreach ( $kws as $kw ) {
						$kw = trim( $kw );
						if ( empty( $kw ) ) continue;

						$wpdb->insert( $this->map_table, [
							'post_id'      => $post_id,
							'keyword'      => strtolower( $kw ),
							'keyword_type' => 'focus',
							'post_url'     => get_permalink( $post_id ),
							'post_title'   => get_the_title( $post_id ),
							'created_at'   => current_time( 'mysql' )
						] );
						$count++;
					}
				}
			}

			return $count;
		}

		/**
		 * Scan a specific post for internal linking opportunities based on the map
		 */
		public function find_linking_opportunities( $post_id ) {
			global $wpdb;

			$post = get_post( $post_id );
			if ( ! $post ) return new \WP_Error( 'not_found', 'Post not found.' );

			$content = $post->post_content;
			$text_content = wp_strip_all_tags( $content );

			// Fetch all keywords from map EXCEPT this post's own keywords
			$map = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$this->map_table} WHERE post_id != %d", $post_id ) );

			$opportunities = [];

			foreach ( $map as $entry ) {
				$kw = $entry->keyword;
				
				// Simple NLP: Does the exact keyword exist in the text?
				// To avoid matching inside existing links, we do a basic str_ireplace check or regex
				// A more robust way is regex checking word boundaries and ensuring it's not inside an <a> tag.
				// For this module, we will just find the text and suggest it.
				
				$pattern = '/\b(' . preg_quote( $kw, '/' ) . ')\b/i';
				
				// Check if kw exists in text
				if ( preg_match( $pattern, $text_content, $matches, PREG_OFFSET_CAPTURE ) ) {
					
					// Make sure we haven't already linked to this URL in the content
					if ( strpos( $content, $entry->post_url ) === false ) {
						
						// Extract a ~80 char snippet for context
						$offset = $matches[0][1];
						$start = max( 0, $offset - 40 );
						$snippet = substr( $text_content, $start, 80 );
						$snippet = '...' . $snippet . '...';
						
						// Highlight the keyword in the snippet
						$snippet = preg_replace( $pattern, '<strong>$1</strong>', $snippet );

						$opportunities[] = [
							'keyword'     => $kw,
							'target_id'   => $entry->post_id,
							'target_url'  => $entry->post_url,
							'target_title'=> $entry->post_title,
							'snippet'     => $snippet
						];
					}
				}
			}

			return $opportunities;
		}

		/**
		 * Apply selected links to the post content
		 */
		public function apply_auto_links( $post_id, $links_to_apply ) {
			global $wpdb;
			
			$post = get_post( $post_id );
			if ( ! $post ) return false;

			$content = $post->post_content;
			$applied_count = 0;

			foreach ( $links_to_apply as $link ) {
				$kw = $link['keyword'];
				$url = $link['target_url'];
				$target_id = $link['target_id'];

				// Regex to replace ONLY the FIRST occurrence of the keyword outside of HTML tags
				// Negative lookahead to ensure we aren't inside an HTML tag
				$pattern = '/\b(' . preg_quote( $kw, '/' ) . ')\b(?=[^>]*<(?!(\/a|a)))/i';
				
				// Simpler approach for WordPress: fallback to preg_replace with limit 1
				// We create a temporary placeholder, replace the first text, then swap back.
				$replacement_anchor = '<a href="' . esc_url( $url ) . '" title="' . esc_attr( $link['target_title'] ) . '">$0</a>';
				
				// To do this safely avoiding inside <a> or heading tags:
				$new_content = preg_replace_callback( 
					'/(<a[^>]*>.*?<\/a>|<h[1-6][^>]*>.*?<\/h[1-6]>)|(\b' . preg_quote( $kw, '/' ) . '\b)/i', 
					function( $matches ) use ( $url, &$applied_count, $link ) {
						if ( ! empty( $matches[1] ) ) {
							return $matches[1]; // Return unmodified HTML block
						}
						// If we haven't applied this specific link yet in this iteration
						if ( $applied_count === 0 ) {
							$applied_count++;
							return '<a href="' . esc_url( $url ) . '" title="' . esc_attr( $link['target_title'] ) . '">' . $matches[2] . '</a>';
						}
						return $matches[2]; // Return unmodified if we already linked it once
					},
					$content, 
					1 // Only replace 1 occurrence total
				);

				if ( $new_content !== $content ) {
					$content = $new_content;
					
					// Log to DB
					$wpdb->insert( $this->links_table, [
						'source_post_id' => $post_id,
						'target_post_id' => $target_id,
						'keyword'        => $kw,
						'anchor_text'    => $kw,
						'inserted_at'    => current_time( 'mysql' )
					] );
				}
				$applied_count = 0; // reset for next link in the loop
			}

			// Update post
			wp_update_post( [
				'ID'           => $post_id,
				'post_content' => $content
			] );

			return true;
		}

		/**
		 * Find Orphan Posts (Posts with 0 incoming internal links from the map)
		 */
		public function get_orphan_posts() {
			global $wpdb;

			// Logic: Get all posts in the keyword map.
			// Then count how many times their target_post_id appears in the auto_links table.
			// For a true orphan check, we also need to check actual post content site-wide, 
			// but for this module, 0 auto-links AND 0 Yoast/Rankmath internal links if possible.
			// We'll approximate: posts present in keyword map minus posts present in auto_links target_post_id.
			
			$query = "SELECT m.post_id, m.post_title, m.post_url, m.keyword 
					  FROM {$this->map_table} m 
					  LEFT JOIN {$this->links_table} l ON m.post_id = l.target_post_id 
					  WHERE l.id IS NULL 
					  GROUP BY m.post_id 
					  ORDER BY m.created_at DESC";
					  
			return $wpdb->get_results( $query );
		}

		// --- AJAX HANDLERS ---

		public function ajax_build_map() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

			$count = $this->build_keyword_map();
			wp_send_json_success( [ 'message' => "Successfully indexed {$count} keywords." ] );
		}

		public function ajax_scan_links() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

			$post_id = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
			if ( ! $post_id ) wp_send_json_error( 'No post selected.' );

			$opportunities = $this->find_linking_opportunities( $post_id );
			if ( is_wp_error( $opportunities ) ) {
				wp_send_json_error( $opportunities->get_error_message() );
			}

			wp_send_json_success( $opportunities );
		}

		public function ajax_apply_links() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

			$post_id = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
			$links = isset( $_POST['links'] ) ? $_POST['links'] : []; // array of link objects

			if ( ! $post_id || empty( $links ) ) wp_send_json_error( 'Invalid data provided.' );

			// Sanitize links array
			$safe_links = [];
			foreach ( $links as $l ) {
				$safe_links[] = [
					'keyword'      => sanitize_text_field( $l['keyword'] ),
					'target_id'    => intval( $l['target_id'] ),
					'target_url'   => esc_url_raw( $l['target_url'] ),
					'target_title' => sanitize_text_field( $l['target_title'] )
				];
			}

			$result = $this->apply_auto_links( $post_id, $safe_links );
			
			if ( $result ) {
				wp_send_json_success( 'Links applied successfully.' );
			}
			wp_send_json_error( 'Failed to apply links.' );
		}

		public function ajax_get_orphans() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

			$orphans = $this->get_orphan_posts();
			wp_send_json_success( $orphans );
		}
	}
}
new SEO_Copilot_Auto_Linker();
