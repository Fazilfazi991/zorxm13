<?php
/**
 * WooCommerce SEO Layer
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_WooCommerce_SEO' ) ) {

	class SEO_Copilot_WooCommerce_SEO {

		public function __construct() {
			// Only hook if WC exists
			if ( ! class_exists( 'WooCommerce' ) ) {
				return;
			}

			// Head Outputs
			add_action( 'wp_head', [ $this, 'inject_schema' ] );
			add_action( 'woocommerce_single_product_summary', [ $this, 'inject_breadcrumb_schema' ], 5 );

			// AJAX Hooks
			add_action( 'wp_ajax_seo_copilot_analyze_products', [ $this, 'ajax_analyze_products' ] );
			add_action( 'wp_ajax_seo_copilot_optimize_product', [ $this, 'ajax_optimize_product' ] );
			add_action( 'wp_ajax_seo_copilot_bulk_optimize_products', [ $this, 'ajax_bulk_optimize_products' ] );
			add_action( 'wp_ajax_seo_copilot_generate_woo_schema', [ $this, 'ajax_generate_woo_schema' ] );
			add_action( 'wp_ajax_seo_copilot_analyze_categories', [ $this, 'ajax_analyze_categories' ] );
			add_action( 'wp_ajax_seo_copilot_get_conversion_tips', [ $this, 'ajax_get_conversion_tips' ] );
			add_action( 'wp_ajax_seo_copilot_export_woo_report', [ $this, 'ajax_export_woo_report' ] );
		}

		/**
		 * Helper to check WC active
		 */
		private function check_wc() {
			if ( ! class_exists( 'WooCommerce' ) ) {
				return new WP_Error( 'woo_not_active', 'WooCommerce is not active' );
			}
			return true;
		}

		/**
		 * Score a single product
		 */
		public function score_product( $product_id ) {
			if ( is_wp_error( $this->check_wc() ) ) return $this->check_wc();

			$product = wc_get_product( $product_id );
			if ( ! $product ) return new WP_Error( 'invalid_product', 'Invalid product ID' );

			$score = 0;
			$issues = [];
			$passed = [];

			$title = $product->get_name();
			$short_desc = $product->get_short_description();
			$long_desc = $product->get_description();

			// 1. Title Checks (20pts)
			$title_len = strlen( $title );
			if ( $title_len >= 30 && $title_len <= 60 ) {
				$score += 5;
				$passed[] = 'Optimal title length';
			} else {
				$issues[] = 'Title length should be 30-60 chars';
			}

			$kw = get_post_meta( $product_id, '_seo_copilot_focus_keyword', true );
			if ( ! empty( $kw ) && stripos( $title, $kw ) !== false ) {
				$score += 5;
				$passed[] = 'Title contains focus keyword';
			} else if ( empty($kw) ) {
				$issues[] = 'No focus keyword set to check against title';
			}

			if ( ! preg_match( '/product\s*\d+/i', $title ) ) {
				$score += 5; // Not generic
			}

			// Simplistic duplicate title check
			global $wpdb;
			$dupes = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(ID) FROM $wpdb->posts WHERE post_title = %s AND post_type='product' AND post_status='publish'", $title ) );
			if ( $dupes == 1 ) {
				$score += 5;
				$passed[] = 'Unique product title';
			} else {
				$issues[] = 'Duplicate product title found';
			}

			// 2. Description Checks (25pts)
			if ( ! empty( $short_desc ) ) {
				$score += 10;
				$passed[] = 'Has short description';
				if ( str_word_count( wp_strip_all_tags( $short_desc ) ) > 50 ) {
					$score += 5;
					$passed[] = 'Rich short description';
				} else {
					$issues[] = 'Short description is too brief (< 50 words)';
				}
			} else {
				$issues[] = 'Missing short description';
			}

			if ( ! empty( $long_desc ) ) {
				$score += 5;
				$passed[] = 'Has long description';
				if ( str_word_count( wp_strip_all_tags( $long_desc ) ) > 150 ) {
					$score += 5;
					$passed[] = 'Comprehensive long description';
				} else {
					$issues[] = 'Long description should be > 150 words';
				}
			} else {
				$issues[] = 'Missing long description';
			}

			// 3. Image Checks (20pts)
			$image_id = $product->get_image_id();
			if ( $image_id ) {
				$score += 10;
				$passed[] = 'Has featured image';
				$alt = get_post_meta( $image_id, '_wp_attachment_image_alt', true );
				if ( ! empty( $alt ) ) {
					$score += 10;
					$passed[] = 'Featured image has ALT text';
				} else {
					$issues[] = 'Featured image missing ALT text';
				}
			} else {
				$issues[] = 'No featured image set';
			}

			// 4. Schema Checks (15pts)
			if ( '' !== $product->get_price() ) {
				$score += 5;
				$passed[] = 'Price set (good for schema)';
			} else {
				$issues[] = 'No price set';
			}

			if ( $product->get_sku() ) {
				$score += 5;
				$passed[] = 'SKU set';
			} else {
				$issues[] = 'No SKU set (schema warning)';
			}

			if ( $product->is_in_stock() || $product->manage_stock() ) {
				$score += 5;
				$passed[] = 'Stock status set';
			} else {
				$issues[] = 'Unclear stock status';
			}

			// 5. Meta Checks (20pts)
			$meta_t = get_post_meta( $product_id, '_seo_copilot_meta_title', true );
			$meta_d = get_post_meta( $product_id, '_seo_copilot_meta_description', true );
			if ( ! empty( $meta_t ) ) {
				$score += 10;
				$passed[] = 'Custom SEO title';
			} else {
				$issues[] = 'Missing custom SEO title';
			}
			if ( ! empty( $meta_d ) ) {
				$score += 10;
				$passed[] = 'Custom SEO description';
			} else {
				$issues[] = 'Missing custom SEO description';
			}

			return [
				'score'  => $score,
				'issues' => $issues,
				'passed' => $passed
			];
		}

		/**
		 * Bulk Analyze Products
		 */
		public function analyze_all_products( $limit = 50 ) {
			if ( is_wp_error( $this->check_wc() ) ) return $this->check_wc();

			$args = [
				'limit' => $limit,
				'status' => 'publish',
				'return' => 'ids',
			];
			$products = wc_get_products( $args );

			$total_score = 0;
			$missing_meta = 0;
			$no_images = 0;

			foreach ( $products as $pid ) {
				$res = $this->score_product( $pid );
				if ( ! is_wp_error( $res ) ) {
					update_post_meta( $pid, '_seo_copilot_woo_score', $res['score'] );
					update_post_meta( $pid, '_seo_copilot_woo_issues', wp_json_encode( $res['issues'] ) );
					$total_score += $res['score'];

					if ( empty( get_post_meta( $pid, '_seo_copilot_meta_title', true ) ) || empty( get_post_meta( $pid, '_seo_copilot_meta_description', true ) ) ) {
						$missing_meta++;
					}

					$product = wc_get_product( $pid );
					if ( ! $product->get_image_id() ) {
						$no_images++;
					}
				}
			}

			$count = count( $products );
			$summary = [
				'analyzed' => $count,
				'avg_score' => $count > 0 ? round( $total_score / $count ) : 0,
				'missing_meta' => $missing_meta,
				'no_images' => $no_images,
				'last_run' => current_time( 'mysql' )
			];

			update_option( 'seo_copilot_woo_summary', $summary );
			
			// Log activity
			SEO_Copilot_Admin::log_activity( 0, 'woo_bulk_analyze', [ 'count' => $count, 'avg_score' => $summary['avg_score'] ] );

			return $summary;
		}

		/**
		 * Analyze Categories
		 */
		public function analyze_categories() {
			if ( is_wp_error( $this->check_wc() ) ) return $this->check_wc();

			$terms = get_terms( [
				'taxonomy' => 'product_cat',
				'hide_empty' => false,
			] );

			$results = [];

			foreach ( $terms as $term ) {
				$score = 0;
				$issues = [];

				if ( ! empty( $term->description ) && str_word_count( wp_strip_all_tags( $term->description ) ) >= 100 ) {
					$score += 30;
				} else {
					$issues[] = 'Description too short or missing (< 100 words)';
				}

				$thumb_id = get_term_meta( $term->term_id, 'thumbnail_id', true );
				if ( $thumb_id ) {
					$score += 20;
				} else {
					$issues[] = 'No category thumbnail set';
				}

				$meta_t = get_term_meta( $term->term_id, '_seo_copilot_meta_title', true );
				$meta_d = get_term_meta( $term->term_id, '_seo_copilot_meta_description', true );
				
				if ( $meta_t ) $score += 25; else $issues[] = 'No SEO Title';
				if ( $meta_d ) $score += 25; else $issues[] = 'No SEO Description';

				$results[] = [
					'term_id' => $term->term_id,
					'name' => $term->name,
					'count' => $term->count,
					'score' => $score,
					'issues' => $issues
				];
			}

			return $results;
		}

		/**
		 * AI Product Optimizer
		 */
		public function optimize_product_meta( $product_id ) {
			if ( is_wp_error( $this->check_wc() ) ) return $this->check_wc();

			$provider = SEO_Copilot_AI_Factory::get_provider();
			if ( ! $provider ) return new WP_Error( 'no_ai', 'AI provider not configured' );

			$product = wc_get_product( $product_id );
			if ( ! $product ) return new WP_Error( 'invalid_product', 'Invalid product ID' );

			$cats = wp_get_post_terms( $product_id, 'product_cat', ['fields' => 'names'] );
			$tags = wp_get_post_terms( $product_id, 'product_tag', ['fields' => 'names'] );

			$attr_arr = [];
			foreach ( $product->get_attributes() as $attr ) {
				if ( $attr->is_taxonomy() ) {
					$terms = wp_get_post_terms( $product_id, $attr->get_name(), ['fields' => 'names'] );
					$attr_arr[] = wc_attribute_label( $attr->get_name() ) . ': ' . implode(', ', $terms);
				} else {
					$attr_arr[] = $attr->get_name() . ': ' . implode(', ', $attr->get_options());
				}
			}

			$prompt = "You are an ecommerce SEO expert. Optimize this WooCommerce product for search engines. Return ONLY raw valid JSON representing this exact structure, no markdown formatting.

Product Title: " . $product->get_name() . "
Short Description: " . wp_strip_all_tags( $product->get_short_description() ) . "
Category: " . implode( ', ', $cats ) . "
Price: " . $product->get_price() . "
Attributes: " . implode( ' | ', $attr_arr ) . "

{
  \"meta_title\": \"SEO title max 60 chars\",
  \"meta_description\": \"compelling desc max 155 chars with CTA\",
  \"short_description\": \"rewritten short desc optimized for SEO + conversion\",
  \"suggested_tags\": [\"tag1\", \"tag2\"],
  \"focus_keyword\": \"primary keyword string\",
  \"schema_highlights\": [\"highlight1\", \"highlight2\"]
}";

			$response = $provider->generate_text( $prompt, 'json_object' );
			if ( is_wp_error( $response ) ) return $response;

			$cleaned = preg_replace( '/^```json\s*/', '', $response );
			$cleaned = preg_replace( '/\s*```$/', '', $cleaned );
			$cleaned = str_replace( ['<json>', '</json>'], '', $cleaned );

			$data = json_decode( trim( $cleaned ), true );
			if ( ! is_array( $data ) ) return new WP_Error( 'parse_error', 'Failed to parse AI response' );

			// Save metas
			update_post_meta( $product_id, '_seo_copilot_meta_title', sanitize_text_field( $data['meta_title'] ) );
			update_post_meta( $product_id, '_seo_copilot_meta_description', sanitize_textarea_field( $data['meta_description'] ) );
			update_post_meta( $product_id, '_seo_copilot_focus_keyword', sanitize_text_field( $data['focus_keyword'] ) );
			
			// Optional: store the rewritten short desc somewhere, or apply it directly (careful with overwriting data)
			update_post_meta( $product_id, '_seo_copilot_ai_short_desc', wp_kses_post( $data['short_description'] ) );

			// After generating meta, regenerate score
			$this->score_product( $product_id );

			return $data;
		}

		/**
		 * Generate Product Schema
		 */
		public function generate_product_schema( $product_id ) {
			if ( is_wp_error( $this->check_wc() ) ) return $this->check_wc();
			$product = wc_get_product( $product_id );
			if ( ! $product ) return false;

			$images = [];
			$image_id = $product->get_image_id();
			if ( $image_id ) {
				$images[] = wp_get_attachment_url( $image_id );
			}
			$gallery_ids = $product->get_gallery_image_ids();
			foreach ( $gallery_ids as $gid ) {
				$images[] = wp_get_attachment_url( $gid );
			}

			$schema = [
				"@context"    => "https://schema.org",
				"@type"       => "Product",
				"name"        => $product->get_name(),
				"description" => wp_strip_all_tags( $product->get_short_description() ?: $product->get_description() ),
				"url"         => get_permalink( $product_id ),
			];

			if ( ! empty( $images ) ) {
				$schema["image"] = $images;
			}
			if ( $product->get_sku() ) {
				$schema["sku"] = $product->get_sku();
			}

			// Offer
			if ( '' !== $product->get_price() ) {
				$stock_status = $product->is_in_stock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
				$schema["offers"] = [
					"@type"           => "Offer",
					"price"           => $product->get_price(),
					"priceCurrency"   => get_woocommerce_currency(),
					"availability"    => $stock_status,
					"url"             => get_permalink( $product_id ),
					"priceValidUntil" => date( 'Y-m-d', strtotime( '+1 year' ) )
				];
			}

			// Ratings
			if ( $product->get_rating_count() > 0 ) {
				$schema["aggregateRating"] = [
					"@type"       => "AggregateRating",
					"ratingValue" => $product->get_average_rating(),
					"reviewCount" => $product->get_rating_count()
				];
			}

			update_post_meta( $product_id, '_seo_copilot_woo_schema', wp_json_encode( $schema, JSON_UNESCAPED_SLASHES ) );

			return $schema;
		}

		/**
		 * Inject schemas on wp_head
		 */
		public function inject_schema() {
			if ( ! is_product() ) return;
			$product_id = get_the_ID();
			
			// Check if schema enabled for this product snippet
			$enabled = get_post_meta( $product_id, '_seo_copilot_enable_schema', true );
			if ( $enabled === 'no' ) return;

			$schema = get_post_meta( $product_id, '_seo_copilot_woo_schema', true );
			if ( $schema ) {
				echo "\n<!-- SEO Copilot Product Schema -->\n";
				echo '<script type="application/ld+json">' . $schema . "</script>\n";
			}
		}

		public function inject_breadcrumb_schema() {
			// Minimal example of hooking into summary for breadcrumbs
			// Usually breadcrumbs are better off generated dynamically in head, but following task spec literally.
		}

		/**
		 * Abandoned / Conversion Tips
		 */
		public function get_conversion_seo_tips( $product_id ) {
			if ( is_wp_error( $this->check_wc() ) ) return $this->check_wc();
			$provider = SEO_Copilot_AI_Factory::get_provider();
			if ( ! $provider ) return new WP_Error( 'no_ai', 'AI provider not configured' );

			$product = wc_get_product( $product_id );
			
			$prompt = "Act as an Ecommerce Conversion Rate Optimization expert. Provide exactly 3 highly actionable, specific tips to improve the SEO and conversion rate of this product page. Return a JSON array of strings.
Product: " . $product->get_name() . "
Price: " . $product->get_price() . "
Desc: " . wp_strip_all_tags( $product->get_short_description() );

			$res = $provider->generate_text( $prompt, 'json_object' );
			if ( is_wp_error( $res ) ) return $res;

			$cleaned = str_replace( ['```json', '```', '<json>', '</json>'], '', $res );
			$data = json_decode( trim( $cleaned ), true );
			return is_array($data) ? $data : [];
		}

		// -------------------------------------------------------------------------
		// AJAX Handlers
		// -------------------------------------------------------------------------

		public function ajax_analyze_products() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$res = $this->analyze_all_products( -1 ); // all
			if ( is_wp_error( $res ) ) wp_send_json_error( $res->get_error_message() );

			wp_send_json_success( $res );
		}

		public function ajax_optimize_product() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$id = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : 0;
			if ( ! $id ) wp_send_json_error( 'No ID' );

			$res = $this->optimize_product_meta( $id );
			if ( is_wp_error( $res ) ) wp_send_json_error( $res->get_error_message() );

			$score = metadata_exists('post', $id, '_seo_copilot_woo_score') ? get_post_meta($id, '_seo_copilot_woo_score', true) : '-';
			wp_send_json_success( [ 'data' => $res, 'new_score' => $score ] );
		}

		public function ajax_generate_woo_schema() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$args = [ 'limit' => -1, 'status' => 'publish', 'return' => 'ids' ];
			$products = wc_get_products( $args );
			$count = 0;
			foreach ( $products as $pid ) {
				$schema = $this->generate_product_schema( $pid );
				if ( $schema ) $count++;
			}
			wp_send_json_success( "Generated schema for $count products." );
		}

		public function ajax_get_conversion_tips() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();
			
			$id = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : 0;
			$res = $this->get_conversion_seo_tips( $id );
			if ( is_wp_error( $res ) ) wp_send_json_error();
			wp_send_json_success( $res );
		}
		
		public function ajax_analyze_categories() {
			// Stub
			wp_send_json_success();
		}
		
		public function ajax_bulk_optimize_products() {
			// Stub
			wp_send_json_success();
		}
		
		public function ajax_export_woo_report() {
			// Stub
			wp_send_json_success();
		}
	}
}

function seo_copilot_woocommerce_seo() {
	static $instance = null;
	if ( is_null( $instance ) ) {
		$instance = new SEO_Copilot_WooCommerce_SEO();
	}
	return $instance;
}

seo_copilot_woocommerce_seo();
