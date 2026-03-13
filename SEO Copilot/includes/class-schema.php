<?php
/**
 * Schema Generator Module
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Schema' ) ) {

	/**
	 * Class SEO_Copilot_Schema
	 */
	class SEO_Copilot_Schema {

		/**
		 * Constructor.
		 */
		public function __construct() {
			// Hook into Dashboard menus.
			add_action( 'current_screen', [ $this, 'init_view' ] );

			// Hook into front-end head to inject schema
			add_action( 'wp_head', [ $this, 'output_schema_for_post' ], 99 );

			// AJAX handlers
			add_action( 'wp_ajax_seo_copilot_generate_schema', [ $this, 'ajax_generate_schema' ] );
			add_action( 'wp_ajax_seo_copilot_save_schema', [ $this, 'ajax_save_schema' ] );
			add_action( 'wp_ajax_seo_copilot_validate_schema', [ $this, 'ajax_validate_schema' ] );
			add_action( 'wp_ajax_seo_copilot_bulk_generate_schema', [ $this, 'ajax_bulk_generate_schema' ] );
		}

		/**
		 * Initialize admin view hook.
		 */
		public function init_view() {
			$screen = get_current_screen();
			if ( ! $screen || 'seo-copilot_page_seo-copilot-schema' !== $screen->id ) {
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
					if ( 'seo-copilot-schema' === $item[2] ) {
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
			require_once SEO_COPILOT_PLUGIN_DIR . 'admin/views/schema.php';
		}


		// -------------------------------------------------------------------------
		// 1. AUTO-DETECTION ENGINE
		// -------------------------------------------------------------------------

		/**
		 * Detect schema type based on post data.
		 */
		public function detect_schema_type( $post_id ) {
			$post = get_post( $post_id );
			if ( ! $post ) return 'Article';

			$post_type = $post->post_type;
			$title = strtolower( $post->post_title );
			$content = strtolower( wp_strip_all_tags( apply_filters( 'the_content', $post->post_content ) ) );
			$raw_content = $post->post_content;

			// 1. Product (WooCommerce)
			if ( 'product' === $post_type && class_exists( 'WooCommerce' ) ) {
				return 'Product';
			}

			// 2. Recipe
			$recipe_keywords = [ 'recipe', 'ingredients', 'cook time', 'prep time', 'instructions', 'teaspoon', 'tablespoon' ];
			$recipe_hits = 0;
			foreach ( $recipe_keywords as $kw ) {
				if ( strpos( $title, $kw ) !== false || strpos( $content, $kw ) !== false ) {
					$recipe_hits++;
				}
			}
			if ( $recipe_hits >= 3 ) { // Need strong signal
				return 'Recipe';
			}

			// 3. FAQPage
			// Gutenberg FAQ block (Yoast style or generic WP blocks) or H2/H3 followed by standard paragraph
			if ( has_block( 'yoast-seo/faq-block', $post->post_content ) || strpos( $raw_content, 'wp-block-yoast-seo-faq-block' ) !== false ) {
				return 'FAQPage';
			}
			if ( preg_match_all( '/<h[23][^>]*>(.*?\?)<\/h[23]>/is', $raw_content, $matches ) && count( $matches[0] ) >= 3 ) {
				return 'FAQPage';
			}

			// 4. HowTo
			// Numbered list pattern, or steps
			$howto_hits = 0;
			if ( strpos( $content, 'step 1' ) !== false && strpos( $content, 'step 2' ) !== false ) {
				$howto_hits++;
			}
			if ( preg_match( '/<ol[^>]*>.*?<li>.*?<\/li>.*?<\/ol>/is', $raw_content ) ) {
				$howto_hits++;
			}
			if ( strpos( $title, 'how to' ) !== false ) {
				$howto_hits++;
			}
			if ( $howto_hits >= 2 ) {
				return 'HowTo';
			}

			// 5. Event
			if ( 'event' === $post_type || strpos( $title, 'event' ) !== false || strpos( $title, 'webinar' ) !== false ) {
				return 'Event';
			}

			// 6. Person
			if ( strpos( $title, 'about' ) !== false && strpos( $title, get_the_author_meta( 'display_name', $post->post_author ) ) !== false ) {
				return 'Person';
			}

			// 7. Review
			// Look for "review" in title + rating patterns like 4/5 or 4.5/5
			if ( strpos( $title, 'review' ) !== false && preg_match( '/[1-5](\.[0-9])?\/5/', $content ) ) {
				return 'Review';
			}

			// Default fallbacks
			if ( 'page' === $post_type ) {
				return 'WebPage';
			}

			return 'Article';
		}


		// -------------------------------------------------------------------------
		// 2. SCHEMA BUILDERS
		// -------------------------------------------------------------------------

		public function build_schema( $post_id, $type = '' ) {
			if ( empty( $type ) ) {
				$type = $this->detect_schema_type( $post_id );
			}

			$post = get_post( $post_id );
			$schema = [];

			switch ( $type ) {
				case 'Article':
					$schema = $this->build_article_schema( $post );
					break;
				case 'FAQPage':
					$schema = $this->build_faq_schema( $post );
					break;
				case 'HowTo':
					$schema = $this->build_howto_schema( $post );
					break;
				case 'Product':
					$schema = $this->build_product_schema( $post );
					break;
				case 'Recipe':
					$schema = $this->build_recipe_schema( $post );
					break;
				case 'Review':
					$schema = $this->build_review_schema( $post );
					break;
				case 'Event':
					$schema = $this->build_event_schema( $post );
					break;
				case 'Person':
					$schema = $this->build_person_schema( $post );
					break;
				case 'WebPage':
					$schema = $this->build_webpage_schema( $post );
					break;
				default:
					$schema = $this->build_article_schema( $post );
			}

			// Force a BreadcrumbList onto every schema (array structure)
			$breadcrumbs = $this->build_breadcrumb_schema( $post );
			
			// If not a graph structure, make it one
			if ( isset( $schema['@type'] ) ) {
				return [
					'@context' => 'https://schema.org',
					'@graph' => [ $schema, $breadcrumbs ]
				];
			}

			return $schema;
		}

		private function get_base_props( $post ) {
			$site_name = get_bloginfo( 'name' );
			$logo_id = get_theme_mod( 'custom_logo' );
			$logo_url = $logo_id ? wp_get_attachment_image_url( $logo_id, 'full' ) : '';

			$meta_desc = get_post_meta( $post->ID, '_seo_copilot_meta_description', true ) ?: wp_trim_words( wp_strip_all_tags( apply_filters( 'the_content', $post->post_content ) ), 25, '...' );
			$thumbnail_id = get_post_thumbnail_id( $post->ID );
			$thumbnail_url = $thumbnail_id ? wp_get_attachment_image_url( $thumbnail_id, 'full' ) : '';

			return [
				'headline'      => get_the_title( $post->ID ),
				'description'   => $meta_desc,
				'image'         => $thumbnail_url ? [ $thumbnail_url ] : [],
				'url'           => get_permalink( $post->ID ),
				'datePublished' => get_the_date( 'c', $post->ID ),
				'dateModified'  => get_the_modified_date( 'c', $post->ID ),
				'author'        => [
					'@type' => 'Person',
					'name'  => get_the_author_meta( 'display_name', $post->post_author ),
				],
				'publisher'     => [
					'@type' => 'Organization',
					'name'  => $site_name,
					'logo'  => empty( $logo_url ) ? [] : [
						'@type' => 'ImageObject',
						'url'   => $logo_url,
					],
				]
			];
		}

		private function build_article_schema( $post ) {
			$base = $this->get_base_props( $post );
			$keyword = get_post_meta( $post->ID, '_seo_copilot_focus_keyword', true );
			
			$schema = [
				'@type'            => 'Article',
				'mainEntityOfPage' => [
					'@type' => 'WebPage',
					'@id'   => $base['url']
				],
				'headline'         => $base['headline'],
				'description'      => $base['description'],
				'image'            => $base['image'],
				'author'           => $base['author'],
				'publisher'        => $base['publisher'],
				'datePublished'    => $base['datePublished'],
				'dateModified'     => $base['dateModified'],
			];

			if ( $keyword ) {
				$schema['keywords'] = $keyword;
			}
			$schema['wordCount'] = str_word_count( wp_strip_all_tags( apply_filters( 'the_content', $post->post_content ) ) );

			return $schema;
		}

		private function build_faq_schema( $post ) {
			$schema = [
				'@type'      => 'FAQPage',
				'mainEntity' => []
			];

			$content = apply_filters( 'the_content', $post->post_content );
			
			// Dumb extraction of H2/H3s followed by paragraphs
			if ( preg_match_all( '/<h[23][^>]*>(.*?\?)<\/h[23]>\s*(?:<p[^>]*>|<div[^>]*>)?(.*?)(?:<\/p>|<\/div>|<h[23])/is', $content, $matches, PREG_SET_ORDER ) ) {
				foreach ( $matches as $m ) {
					$q = wp_strip_all_tags( $m[1] );
					$a = wp_strip_all_tags( $m[2] );
					if ( ! empty( $q ) && ! empty( $a ) ) {
						$schema['mainEntity'][] = [
							'@type'      => 'Question',
							'name'       => trim( $q ),
							'acceptedAnswer' => [
								'@type' => 'Answer',
								'text'  => trim( $a )
							]
						];
					}
				}
			}

			// Fallback placeholder if none natively detected (AI will fix this)
			if ( empty( $schema['mainEntity'] ) ) {
				$schema['mainEntity'][] = [
					'@type'      => 'Question',
					'name'       => 'What is the frequency of...',
					'acceptedAnswer' => [
						'@type' => 'Answer',
						'text'  => 'Missing answer. Use AI Enhance.'
					]
				];
			}

			return $schema;
		}

		private function build_howto_schema( $post ) {
			$base = $this->get_base_props( $post );
			$schema = [
				'@type'       => 'HowTo',
				'name'        => $base['headline'],
				'description' => $base['description'],
				'step'        => [],
			];

			$content = apply_filters( 'the_content', $post->post_content );
			if ( preg_match( '/<ol[^>]*>(.*?)<\/ol>/is', $content, $list_match ) ) {
				if ( preg_match_all( '/<li[^>]*>(.*?)<\/li>/is', $list_match[1], $items ) ) {
					$i = 1;
					foreach ( $items[1] as $item ) {
						$schema['step'][] = [
							'@type' => 'HowToStep',
							'url'   => $base['url'] . '#step' . $i,
							'name'  => 'Step ' . $i,
							'text'  => trim( wp_strip_all_tags( $item ) )
						];
						$i++;
					}
				}
			}

			if ( empty( $schema['step'] ) ) {
				$schema['step'][] = [
					'@type' => 'HowToStep',
					'name'  => 'Step 1',
					'text'  => 'Missing step data. Use AI Enhance.'
				];
			}

			return $schema;
		}

		private function build_product_schema( $post ) {
			if ( ! class_exists( 'WooCommerce' ) ) return $this->build_article_schema( $post );
			
			$product = wc_get_product( $post->ID );
			if ( ! $product ) return $this->build_article_schema( $post );

			$base = $this->get_base_props( $post );
			$schema = [
				'@type'       => 'Product',
				'name'        => $product->get_name(),
				'description' => wp_strip_all_tags( $product->get_short_description() ) ?: $base['description'],
				'sku'         => $product->get_sku(),
				'offers'      => [
					'@type'         => 'Offer',
					'url'           => $base['url'],
					'priceCurrency' => get_woocommerce_currency(),
					'price'         => $product->get_price(),
					'availability'  => $product->is_in_stock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
					'itemCondition' => 'https://schema.org/NewCondition'
				]
			];

			if ( $base['image'] ) {
				$schema['image'] = $base['image'];
			}

			if ( $product->get_average_rating() > 0 ) {
				$schema['aggregateRating'] = [
					'@type'       => 'AggregateRating',
					'ratingValue' => $product->get_average_rating(),
					'reviewCount' => $product->get_review_count()
				];
			}

			return $schema;
		}

		private function build_recipe_schema( $post ) {
			$base = $this->get_base_props( $post );
			$schema = [
				'@type'              => 'Recipe',
				'name'               => $base['headline'],
				'description'        => $base['description'],
				'image'              => $base['image'],
				'author'             => $base['author'],
				'datePublished'      => $base['datePublished'],
				'prepTime'           => 'PT15M', // Default placeholder
				'cookTime'           => 'PT30M',
				'recipeYield'        => '4 servings',
				'recipeIngredient'   => [ 'Ingredient 1', 'Ingredient 2' ],
				'recipeInstructions' => [
					[ '@type' => 'HowToStep', 'text' => 'Step 1 Instructions' ],
					[ '@type' => 'HowToStep', 'text' => 'Step 2 Instructions' ]
				]
			];
			// The native extraction is extremely flaky for random blogs, so we'll rely on AI to enhance this block perfectly.
			return $schema;
		}

		private function build_review_schema( $post ) {
			$base = $this->get_base_props( $post );
			
			// Extract title as reviewer item (e.g. "iPhone 15 Review" -> "iPhone 15")
			$item_name = trim( str_ireplace( 'review', '', $base['headline'] ) );

			$schema = [
				'@type'        => 'Review',
				'author'       => $base['author'],
				'reviewBody'   => $base['description'],
				'datePublished'=> $base['datePublished'],
				'itemReviewed' => [
					'@type' => 'Thing',
					'name'  => $item_name
				],
				'reviewRating' => [
					'@type'       => 'Rating',
					'ratingValue' => '4', // Placeholder
					'bestRating'  => '5'
				]
			];
			return $schema;
		}

		private function build_event_schema( $post ) {
			$base = $this->get_base_props( $post );
			
			// Calculate placeholder dates
			$start = date( 'c', strtotime( '+1 week' ) );
			$end = date( 'c', strtotime( '+1 week 2 hours' ) );

			$schema = [
				'@type'       => 'Event',
				'name'        => $base['headline'],
				'startDate'   => $start,
				'endDate'     => $end,
				'eventAttendanceMode' => 'https://schema.org/OfflineEventAttendanceMode',
				'eventStatus' => 'https://schema.org/EventScheduled',
				'location'    => [
					'@type'   => 'Place',
					'name'    => 'Venue Name',
					'address' => [
						'@type'           => 'PostalAddress',
						'streetAddress'   => '123 Fake St',
						'addressLocality' => 'City',
						'postalCode'      => '12345',
						'addressCountry'  => 'US'
					]
				],
				'image'       => $base['image'],
				'description' => $base['description'],
				'organizer'   => clone (object) $base['publisher'], // reuse pub
			];
			return $schema;
		}

		private function build_person_schema( $post ) {
			$base = $this->get_base_props( $post );
			// Usually built for About Us pages
			$schema = [
				'@type'       => 'Person',
				'name'        => $base['author']['name'],
				'description' => $base['description'],
				'image'       => $base['image'],
				'url'         => $base['url'],
				'sameAs'      => []
			];
			return $schema;
		}

		private function build_webpage_schema( $post ) {
			$base = $this->get_base_props( $post );
			$schema = [
				'@type'       => 'WebPage',
				'name'        => $base['headline'],
				'description' => $base['description'],
				'url'         => $base['url'],
				'datePublished'=> $base['datePublished'],
				'dateModified'=> $base['dateModified'],
				'publisher'   => $base['publisher']
			];
			return $schema;
		}

		private function build_breadcrumb_schema( $post ) {
			$schema = [
				'@type'           => 'BreadcrumbList',
				'@id'             => get_permalink($post->ID) . '#breadcrumb',
				'itemListElement' => []
			];

			$schema['itemListElement'][] = [
				'@type'    => 'ListItem',
				'position' => 1,
				'item'     => [
					'@id'  => home_url(),
					'name' => 'Home'
				]
			];

			if ( 'post' === $post->post_type ) {
				$cats = get_the_category( $post->ID );
				if ( ! empty( $cats ) ) {
					$schema['itemListElement'][] = [
						'@type'    => 'ListItem',
						'position' => 2,
						'item'     => [
							'@id'  => get_category_link( $cats[0]->term_id ),
							'name' => $cats[0]->name
						]
					];
				}
			}

			// Current Post as final crumb
			$last_pos = count( $schema['itemListElement'] ) + 1;
			$schema['itemListElement'][] = [
				'@type'    => 'ListItem',
				'position' => $last_pos,
				'item'     => [
					'@id'  => get_permalink( $post->ID ),
					'name' => get_the_title( $post->ID )
				]
			];

			return $schema;
		}

		// -------------------------------------------------------------------------
		// 3. AI ENHANCEMENT
		// -------------------------------------------------------------------------
		
		public function enhance_with_ai( $post_id, $schema_array ) {
			$post = get_post( $post_id );
			$content = wp_strip_all_tags( apply_filters( 'the_content', $post->post_content ) );
			// Send first 1000 words to save tokens
			$content_snippet = implode( ' ', array_slice( explode( ' ', $content ), 0, 1000 ) );

			$provider = SEO_Copilot_AI_Factory::get_provider();
			$enhanced = $provider->suggest_schema( $content_snippet, $post->post_type );

			// If AI fails, return original
			if ( is_wp_error( $enhanced ) ) {
				return $schema_array;
			}

			// Validate if AI returned valid JSON-LD
			if ( is_array( $enhanced ) && isset( $enhanced['@type'] ) ) {
				return [
					'@context' => 'https://schema.org',
					'@graph' => [ $enhanced, $this->build_breadcrumb_schema( $post ) ]
				];
			}

			return $schema_array;
		}

		// -------------------------------------------------------------------------
		// 5. VALIDATION ENGINE
		// -------------------------------------------------------------------------

		public function validate_schema( $schema_array, $type = '' ) {
			if ( isset( $schema_array['@graph'] ) ) {
				$main_schema = $schema_array['@graph'][0];
			} else {
				$main_schema = $schema_array;
			}

			if ( empty( $type ) && isset( $main_schema['@type'] ) ) {
				$type = $main_schema['@type'];
			}

			$valid = true;
			$missing = [];
			$warnings = [];

			switch ( $type ) {
				case 'Article':
					if ( empty( $main_schema['headline'] ) ) { $valid = false; $missing[] = 'headline'; }
					if ( empty( $main_schema['author'] ) ) { $valid = false; $missing[] = 'author'; }
					if ( empty( $main_schema['datePublished'] ) ) { $valid = false; $missing[] = 'datePublished'; }
					break;
				case 'FAQPage':
					if ( empty( $main_schema['mainEntity'] ) ) { $valid = false; $missing[] = 'mainEntity (Q&A Pairs)'; }
					break;
				case 'HowTo':
					if ( empty( $main_schema['name'] ) ) { $valid = false; $missing[] = 'name'; }
					if ( empty( $main_schema['step'] ) ) { $valid = false; $missing[] = 'step'; }
					break;
				case 'Product':
					if ( empty( $main_schema['name'] ) ) { $valid = false; $missing[] = 'name'; }
					if ( empty( $main_schema['offers'] ) ) { $valid = false; $missing[] = 'offers'; }
					break;
				case 'Recipe':
					if ( empty( $main_schema['name'] ) ) { $valid = false; $missing[] = 'name'; }
					if ( empty( $main_schema['recipeIngredient'] ) ) { $valid = false; $missing[] = 'recipeIngredient'; }
					if ( empty( $main_schema['recipeInstructions'] ) ) { $valid = false; $missing[] = 'recipeInstructions'; }
					break;
				case 'Review':
					if ( empty( $main_schema['itemReviewed'] ) ) { $valid = false; $missing[] = 'itemReviewed'; }
					if ( empty( $main_schema['reviewRating'] ) ) { $valid = false; $missing[] = 'reviewRating'; }
					break;
			}

			return [
				'valid'          => $valid,
				'missing_fields' => $missing,
				'warnings'       => $warnings,
				'score'          => $valid ? 100 : 50
			];
		}


		// -------------------------------------------------------------------------
		// 6. HEAD INJECTION
		// -------------------------------------------------------------------------

		public function output_schema_for_post() {
			if ( ! is_singular() ) {
				return;
			}

			global $post;
			if ( ! $post ) {
				return;
			}

			$schema_injected = get_post_meta( $post->ID, '_seo_copilot_schema_injected', true );
			if ( ! $schema_injected ) {
				return;
			}

			$schema_json = get_post_meta( $post->ID, '_seo_copilot_schema', true );
			if ( ! empty( $schema_json ) ) {
				// Prevent double escaping since it's already structured JSON
				echo "<!-- SEO Copilot Schema -->\n";
				echo "<script type=\"application/ld+json\">\n";
				echo $schema_json . "\n";
				echo "</script>\n";
				echo "<!-- / SEO Copilot Schema -->\n";
			}
		}

		// -------------------------------------------------------------------------
		// 7. AJAX HANDLERS
		// -------------------------------------------------------------------------

		public function ajax_generate_schema() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			if ( ! $post_id ) wp_send_json_error( 'Invalid post ID' );

			$force_type = isset( $_POST['schema_type'] ) ? sanitize_text_field( $_POST['schema_type'] ) : '';
			$use_ai     = isset( $_POST['use_ai'] ) && '1' === $_POST['use_ai'];

			$type = $force_type ?: $this->detect_schema_type( $post_id );
			
			// Build basic schema
			$schema = $this->build_schema( $post_id, $type );

			// Enhance if requested
			if ( $use_ai ) {
				$schema = $this->enhance_with_ai( $post_id, $schema );
			}

			$json = wp_json_encode( $schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
			
			// Update meta (temporarily)
			update_post_meta( $post_id, '_seo_copilot_schema_type', $type );
			
			// Validate
			$validation = $this->validate_schema( $schema, $type );

			wp_send_json_success( [
				'json'       => $json,
				'type'       => $type,
				'validation' => $validation
			] );
		}

		public function ajax_save_schema() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			$json    = isset( $_POST['json'] ) ? wp_unslash( $_POST['json'] ) : ''; // phpcs:ignore
			$injected = isset( $_POST['injected'] ) && '1' === $_POST['injected'] ? '1' : '';

			if ( ! $post_id || empty( $json ) ) wp_send_json_error( 'Missing data' );

			// Verify valid JSON
			$parsed = json_decode( $json, true );
			if ( is_null( $parsed ) ) {
				wp_send_json_error( 'Invalid JSON format' );
			}

			update_post_meta( $post_id, '_seo_copilot_schema', wp_slash( $json ) ); // Re-slash for WP db func
			update_post_meta( $post_id, '_seo_copilot_schema_injected', $injected );

			wp_send_json_success( 'Saved successfully' );
		}

		public function ajax_validate_schema() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$json = isset( $_POST['json'] ) ? wp_unslash( $_POST['json'] ) : ''; // phpcs:ignore
			$parsed = json_decode( $json, true );
			if ( is_null( $parsed ) ) {
				wp_send_json_error( 'Invalid JSON format' );
			}

			$validation = $this->validate_schema( $parsed );
			wp_send_json_success( $validation );
		}

		public function ajax_bulk_generate_schema() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$offset = isset( $_POST['offset'] ) ? absint( $_POST['offset'] ) : 0;
			$limit  = 5; // Smaller batch since JSON generation is heavier

			$options    = get_option( 'seo_copilot_settings', [] );
			$post_types = isset( $options['post_types'] ) ? $options['post_types'] : [ 'post', 'page' ];

			$args = [
				'post_type'      => $post_types,
				'post_status'    => 'publish',
				'posts_per_page' => $limit,
				'offset'         => $offset,
				'fields'         => 'ids',
				'meta_query'     => [
					[
						'key'     => '_seo_copilot_schema',
						'compare' => 'NOT EXISTS'
					]
				]
			];
			$query = new \WP_Query( $args );

			if ( ! $query->have_posts() ) {
				wp_send_json_success( [ 'finished' => true ] );
			}

			foreach ( $query->posts as $post_id ) {
				$type = $this->detect_schema_type( $post_id );
				$schema = $this->build_schema( $post_id, $type ); 
				// No AI in bulk to save tokens
				$json = wp_json_encode( $schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
				
				update_post_meta( $post_id, '_seo_copilot_schema_type', $type );
				update_post_meta( $post_id, '_seo_copilot_schema', wp_slash( $json ) );
				// Do not auto-inject in bulk to allow manual review
			}

			wp_send_json_success( [
				'finished' => false,
				'next_offset' => $offset + $limit,
				'total' => $query->found_posts,
			] );
		}
	}
}

add_action( 'plugins_loaded', function() {
	new SEO_Copilot_Schema();
});
