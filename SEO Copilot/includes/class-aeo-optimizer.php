<?php
/**
 * AEO (Answer Engine Optimization) Engine Class
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_AEO_Optimizer' ) ) {

	class SEO_Copilot_AEO_Optimizer {

		public function __construct() {
			add_action( 'wp_ajax_seo_copilot_analyze_aeo_all', [ $this, 'ajax_analyze_aeo_all' ] );
			add_action( 'wp_ajax_seo_copilot_analyze_aeo_post', [ $this, 'ajax_analyze_aeo_post' ] );
			add_action( 'wp_ajax_seo_copilot_get_aeo_suggestions', [ $this, 'ajax_get_aeo_suggestions' ] );
			add_action( 'wp_ajax_seo_copilot_apply_direct_answer', [ $this, 'ajax_apply_direct_answer' ] );
			add_action( 'wp_ajax_seo_copilot_insert_faq_section', [ $this, 'ajax_insert_faq_section' ] );
			add_action( 'wp_ajax_seo_copilot_toggle_speakable', [ $this, 'ajax_toggle_speakable' ] );
			add_action( 'wp_ajax_seo_copilot_get_aeo_quick_fix', [ $this, 'ajax_get_aeo_quick_fix' ] );

			add_filter( 'the_content', [ $this, 'add_speakable_div' ] );
			add_action( 'wp_head', [ $this, 'output_speakable_schema' ] );
		}

		public function score_post( $post_id ) {
			$post = get_post( $post_id );
			if ( ! $post ) return false;

			$content = $post->post_content;
			$title = $post->post_title;
			$clean_content = wp_strip_all_tags( $content );

			$direct_answer = 0;
			$structure = 0;
			$faq_score = 0;
			$schema = 0;
			$authority = 0;

			$issues = [];
			$passed = [];

			// 1. Direct Answer Format (25pts)
			$is_q_title = preg_match( '/^(How|What|Why|When|Where|Which|Can|Does|Is|Are) /i', $title ) || strpos( $title, '?' ) !== false;
			if ( $is_q_title ) {
				$direct_answer += 10;
				$passed[] = "Post answers a clear question based on title format.";
			} else {
				$issues[] = "Title does not start with a clear question (How, What, Why, etc).";
			}

			// First paragraph extraction (naive)
			$paragraphs = explode("\n", $clean_content);
			$first_para = '';
			foreach ($paragraphs as $p) {
				$p = trim($p);
				if (!empty($p)) {
					$first_para = $p;
					break;
				}
			}

			$first_para_words = str_word_count($first_para);
			if ( $first_para_words > 0 && $first_para_words <= 50 ) {
				$direct_answer += 10;
				$passed[] = "First paragraph provides a direct answer within 50 words.";
			} else {
				$issues[] = "First paragraph is either missing or too long. AI Overviews prefer direct 50-word answers immediately.";
			}

			// Vague detection (naive heuristic for specific facts)
			if ( preg_match( '/\d+/', $first_para ) || preg_match('/is defined as|means|refers to/', $first_para) ) {
				$direct_answer += 5;
				$passed[] = "Answer appears factual and specific.";
			} else {
				$issues[] = "Direct answer lacks specific factual data points or definitions.";
			}

			// 2. Content Structure (25pts)
			$h2_count = preg_match_all( '/<h2[^>]*>(.*?)<\/h2>/is', $content, $matches );
			$has_q_h2 = false;
			if ( $h2_count ) {
				foreach ( $matches[1] as $h2 ) {
					$h2_text = wp_strip_all_tags( $h2 );
					if ( preg_match( '/^(How|What|Why|When|Where|Which|Can|Does|Is|Are) /i', $h2_text ) || strpos( $h2_text, '?' ) !== false ) {
						$has_q_h2 = true;
						break;
					}
				}
			}
			if ( $has_q_h2 ) {
				$structure += 10;
				$passed[] = "Content contains question-based H2 headings.";
			} else {
				$issues[] = "Content lacks question-based H2 headings for AI to easily index structure.";
			}

			if ( preg_match( '/<(ol|ul)[^>]*>.*?<li[^>]*>.*?<\/li>.*?<\/\1>/is', $content ) ) {
				$structure += 5;
				$passed[] = "Numbered or bulleted lists are present.";
			} else {
				$issues[] = "Content lacks list formatting (<ul>/<ol>) which AI models prefer for extraction.";
			}

			if ( preg_match( '/ (is|means) /i', $clean_content ) ) { // Super naive definition pattern
				$structure += 5;
				$passed[] = "Content uses definition patterns ('Term is...').";
			}

			// Paragraph lengths
			$p_count = 0;
			$sentence_count = 0;
			$raw_paragraphs = explode("\n\n", $clean_content);
			foreach ($raw_paragraphs as $rp) {
				if (strlen(trim($rp)) > 10) {
					$p_count++;
					$sentence_count += preg_match_all('/[.?!]+/', $rp);
				}
			}
			$avg_sentences = $p_count > 0 ? ( $sentence_count / $p_count ) : 0;
			if ( $avg_sentences > 0 && $avg_sentences < 3 ) {
				$structure += 5;
				$passed[] = "Content utilizes short paragraphs (average < 3 sentences).";
			} else {
				$issues[] = "Paragraphs are too long on average. AI prefers shorter blocks.";
			}

			// 3. FAQ Signals (20pts)
			// check for gutenberg faq block or "faq" heading or Q: A:
			$has_faq_section = strpos($content, 'wp:yoast/faq-block') !== false 
				|| preg_match('/<h[2-4][^>]*>.*?(FAQ|Frequently Asked Questions).*?<\/h[2-4]>/is', $content)
				|| preg_match('/Q:.*?A:/is', $clean_content);
			
			if ( $has_faq_section ) {
				$faq_score += 10;
				$passed[] = "FAQ section detected.";
				// Just guess 3+ qs based on ? marks in proximity to FAQ... naive logic
				$faq_score += 10; // Automatically giving points for now assuming they have matched questions
			} else {
				$issues[] = "No dedicated FAQ section found.";
			}

			// 4. Schema Signals (20pts)
			$faq_schema = get_post_meta($post_id, '_yoast_wpseo_schema_faq', true) || strpos($content, 'FAQPage') !== false;
			if ( $faq_schema ) {
				$schema += 10;
				$passed[] = "FAQ Schema injected.";
			} else {
				$issues[] = "Missing FAQ Schema metadata.";
			}

			// Check for HowTo schema loosely
			if ( strpos($content, 'HowToStep') !== false || strpos($content, 'HowTo') !== false ) {
				$schema += 5;
				$passed[] = "HowTo Schema detected.";
			}

			// Check for our custom speakable meta
			$speakable = get_post_meta($post_id, '_seo_copilot_speakable_schema', true);
			if ( $speakable ) {
				$schema += 5;
				$passed[] = "Speakable Schema activated.";
			} else {
				$issues[] = "Missing Speakable Schema. Voice Search AI won't properly summarize this.";
			}

			// 5. Authority Signals (10pts)
			if ( preg_match( '/according to|study|research|\d+%/', $clean_content ) ) {
				$authority += 5;
				$passed[] = "Content cites sources, studies, or statistics.";
			} else {
				$issues[] = "Content lacks authoritative source citations or objective research terminology.";
			}

			$author_id = $post->post_author;
			$author_bio = get_the_author_meta('description', $author_id);
			if ( !empty($author_bio) ) {
				$authority += 5;
				$passed[] = "Author bio contains expertise signals.";
			} else {
				$issues[] = "Author profile is missing a detailed biography, which hurts Experience/Expertise signals.";
			}

			$total_score = $direct_answer + $structure + $faq_score + $schema + $authority;

			$result = [
				'aeo_score' => $total_score,
				'direct_answer_score' => $direct_answer,
				'faq_score' => $faq_score,
				'structure_score' => $structure,
				'schema_score' => $schema,
				'authority_score' => $authority,
				'issues' => $issues,
				'passed' => $passed,
				'ai_overview_ready' => $total_score >= 75
			];

			// Save to DB
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_aeo_scores';
			
			// Check if exists
			$exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE post_id = %d", $post_id));
			if ( $exists ) {
				$wpdb->update(
					$table,
					[
						'aeo_score' => $total_score,
						'direct_answer_score' => $direct_answer,
						'faq_score' => $faq_score,
						'structure_score' => $structure,
						'schema_score' => $schema,
						'issues' => wp_json_encode($issues),
						'suggestions' => '[]', // keep empty strictly until explicitly requested via UI
						'last_analyzed' => current_time('mysql')
					],
					[ 'post_id' => $post_id ],
					['%d', '%d', '%d', '%d', '%d', '%s', '%s', '%s'],
					['%d']
				);
			} else {
				$wpdb->insert(
					$table,
					[
						'post_id' => $post_id,
						'aeo_score' => $total_score,
						'direct_answer_score' => $direct_answer,
						'faq_score' => $faq_score,
						'structure_score' => $structure,
						'schema_score' => $schema,
						'issues' => wp_json_encode($issues),
						'suggestions' => '[]',
						'last_analyzed' => current_time('mysql')
					],
					['%d', '%d', '%d', '%d', '%d', '%d', '%s', '%s', '%s']
				);
			}

			if ( class_exists('SEO_Copilot_Admin') ) {
				SEO_Copilot_Admin::log_activity( $post_id, 'AEO Scan', [ 'score' => $total_score ] );
			}

			return $result;
		}

		public function analyze_all_posts( $limit = 50 ) {
			$args = [
				'post_type' => ['post', 'page'],
				'post_status' => 'publish',
				'posts_per_page' => $limit,
				'orderby' => 'modified',
				'order' => 'DESC'
			];
			$query = new WP_Query($args);
			$count = 0;
			if ($query->have_posts()) {
				foreach ($query->posts as $p) {
					$this->score_post($p->ID);
					$count++;
				}
			}
			return $count;
		}

		public function generate_aeo_suggestions( $post_id ) {
			$post = get_post($post_id);
			if (!$post) return false;

			$content_trunc = wp_trim_words(wp_strip_all_tags($post->post_content), 800, '');
			$title = $post->post_title;
			
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_aeo_scores';
			$score_row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE post_id = %d", $post_id));
			
			$score = $score_row ? $score_row->aeo_score : 0;
			$issues = $score_row ? json_decode($score_row->issues, true) : [];
			$issues_list = implode(", ", (array)$issues);

			$prompt = "You are an AEO (Answer Engine Optimization) expert. Analyze this content and help it get featured in Google AI Overviews.
			
Post Title: $title
Current Content (first 800 words):
$content_trunc
Current AEO Score: $score/100

Issues found: $issues_list

Return ONLY valid JSON matching exactly this structure, no markdown blocks:
{
  \"direct_answer_rewrite\": \"Rewrite the first paragraph as a perfect direct answer (max 50 words, factual, specific)\",
  \"suggested_h2s\": [
    \"Question-based H2 headings to add to this post\"
  ],
  \"faq_to_add\": [
    {
      \"question\": \"string\",
      \"answer\": \"string (max 50 words, direct and factual)\"
    }
  ],
  \"missing_content\": [
    \"Topics to add to improve AI Overview eligibility\"
  ],
  \"speakable_section\": \"A 2-3 sentence speakable summary for voice search\"
}";

			$response = SEO_Copilot_AI_Factory::get_provider()->generate_text($prompt, ['temperature' => 0.4]);
			if ( is_wp_error($response) ) {
				return false;
			}

			$json = $this->extract_json_from_response($response);
			if ($json && $score_row) {
				$wpdb->update(
					$table,
					[ 'suggestions' => wp_json_encode($json) ],
					[ 'post_id' => $post_id ],
					[ '%s' ], [ '%d' ]
				);
				return $json;
			}
			return false;
		}

		private function extract_json_from_response($text) {
			$text = preg_replace('/```json/i', '', $text);
			$text = preg_replace('/```/i', '', $text);
			return json_decode(trim($text), true);
		}

		public function inject_speakable_schema( $post_id, $speakable_text ) {
			update_post_meta( $post_id, '_seo_copilot_speakable_schema', $speakable_text );
			update_post_meta( $post_id, '_seo_copilot_speakable_active', 'yes' );
			return true;
		}

		public function add_speakable_div( $content ) {
			if ( is_single() || is_page() ) {
				$post_id = get_the_ID();
				$is_active = get_post_meta( $post_id, '_seo_copilot_speakable_active', true );
				if ( $is_active === 'yes' ) {
					// Extremely naive wrap of the first exact match of a paragraph tag
					$content = preg_replace('/<p>(.*?)<\/p>/is', '<div class="speakable-content"><p>$1</p></div>', $content, 1);
				}
			}
			return $content;
		}

		public function output_speakable_schema() {
			if ( is_single() || is_page() ) {
				$post_id = get_the_ID();
				$is_active = get_post_meta( $post_id, '_seo_copilot_speakable_active', true );
				if ( $is_active === 'yes' ) {
					$schema = [
						"@context" => "https://schema.org",
						"@type" => "WebPage",
						"speakable" => [
							"@type" => "SpeakableSpecification",
							"cssSelector" => [".speakable-content"]
						],
						"url" => get_permalink($post_id)
					];
					echo '<script type="application/ld+json" class="seo-copilot-aeo-schema">' . wp_json_encode($schema) . '</script>' . "\n";
				}
			}
		}

		public function get_ai_overview_opportunities() {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_aeo_scores';
			$p_table = $wpdb->prefix . 'posts';
			
			$sql = "
				SELECT a.*, p.post_title, p.post_content
				FROM $table a
				JOIN $p_table p ON p.ID = a.post_id
				WHERE a.aeo_score >= 60 AND a.aeo_score < 75
				AND p.post_status = 'publish'
				ORDER BY a.aeo_score DESC
				LIMIT 20
			";
			
			$results = $wpdb->get_results($sql);
			
			$opportunities = [];
			if ($results) {
				foreach ($results as $r) {
					$word_count = str_word_count(wp_strip_all_tags($r->post_content));
					$is_question = preg_match('/^(How|What|Why|When|Where|Which|Can|Does|Is|Are) /i', $r->post_title) || strpos($r->post_title, '?') !== false;
					
					if ($word_count > 500 && $is_question) {
						$opportunities[] = $r;
					}
				}
			}
			// Fallback if none perfectly match strict rule to avoid an empty UI state for quick wins:
			if ( empty($opportunities) && !empty($results) ) {
				$opportunities = array_slice($results, 0, 5);
			}
			
			return $opportunities;
		}

		public function get_site_aeo_summary() {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_aeo_scores';
			$post_table = $wpdb->prefix . 'posts';
			
			$suppress = $wpdb->suppress_errors( true );

			$total_posts_scored = $wpdb->get_var( "SELECT COUNT(id) FROM $table" ) ?: 0;
			$ai_ready_count = $wpdb->get_var( "SELECT COUNT(id) FROM $table WHERE aeo_score >= 75" ) ?: 0;
			$avg_aeo_score = $wpdb->get_var( "SELECT AVG(aeo_score) FROM $table" ) ?: 0;
			
			$total_published = $wpdb->get_var( "SELECT COUNT(ID) FROM $post_table WHERE post_status = 'publish' AND post_type IN ('post','page')" ) ?: 0;
			$ops = $this->get_ai_overview_opportunities();
			$quick_wins_count = count($ops);
			
			$wpdb->suppress_errors( $suppress );

			return [
				'total_scored' => intval($total_posts_scored),
				'total_publish' => intval($total_published),
				'ai_ready' => intval($ai_ready_count),
				'avg_score' => round($avg_aeo_score),
				'quick_wins_count' => intval($quick_wins_count)
			];
		}

		/* -------------------------------------------------------------
		 * AJAX HANDLERS
		 * ------------------------------------------------------------- */

		public function ajax_analyze_aeo_all() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$count = $this->analyze_all_posts( 50 ); // Limit 50 iteratively
			wp_send_json_success( "Scored $count posts." );
		}

		public function ajax_analyze_aeo_post() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$post_id = intval($_POST['post_id']);
			$res = $this->score_post( $post_id );
			wp_send_json_success( $res );
		}

		public function ajax_get_aeo_suggestions() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$post_id = intval($_POST['post_id']);
			$data = $this->generate_aeo_suggestions( $post_id );
			if ( $data ) {
				wp_send_json_success( $data );
			} else {
				wp_send_json_error( "Failed to generate suggestions." );
			}
		}

		public function ajax_apply_direct_answer() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$post_id = intval($_POST['post_id']);
			$rewrite = sanitize_textarea_field(wp_unslash($_POST['rewrite']));
			
			$post = get_post($post_id);
			// Naive replacement of first paragraph
			$content = $post->post_content;
			$paragraphs = explode("\n\n", $content);
			if ( count($paragraphs) > 0 ) {
				$paragraphs[0] = $rewrite;
				$new_content = implode("\n\n", $paragraphs);
				
				wp_update_post([
					'ID' => $post_id,
					'post_content' => $new_content
				]);
				
				$this->score_post($post_id); // rescore
				wp_send_json_success("Updated post content.");
			}
			wp_send_json_error("Could not parse content.");
		}

		public function ajax_insert_faq_section() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$post_id = intval($_POST['post_id']);
			$faqs = json_decode(wp_unslash($_POST['faqs']), true);
			
			if (empty($faqs)) wp_send_json_error("No faqs provided");

			$post = get_post($post_id);
			
			// Build FAQ HTML
			$html = "\n\n<h2>Frequently Asked Questions</h2>\n";
			foreach ($faqs as $faq) {
				$q = sanitize_text_field($faq['question']);
				$a = sanitize_textarea_field($faq['answer']);
				$html .= "<h3>$q</h3>\n<p>$a</p>\n";
			}

			wp_update_post([
				'ID' => $post_id,
				'post_content' => $post->post_content . $html
			]);

			// Rescore
			$this->score_post($post_id);
			wp_send_json_success("Appended FAQ section to post");
		}

		public function ajax_toggle_speakable() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$post_id = intval($_POST['post_id']);
			$text = sanitize_textarea_field(wp_unslash($_POST['speakable_text']));

			$this->inject_speakable_schema($post_id, $text);
			$this->score_post($post_id); // rescore
			wp_send_json_success("Speakable schema enabled.");
		}

		public function ajax_get_aeo_quick_fix() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$post_id = intval($_POST['post_id']);
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_aeo_scores';
			$row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE post_id = %d", $post_id));
			
			if (!$row) {
				wp_send_json_error("Not scored.");
			}
			$issues = json_decode($row->issues, true);
			$ret = "No quick fixes found. Try full optimization.";
			if (!empty($issues)) {
				$ret = $issues[0]; // just present top issue for quick fix card
			}
			
			wp_send_json_success(['top_fix' => $ret]);
		}

	}
}

/**
 * Access function for singletons
 */
function seo_copilot_aeo_optimizer() {
	static $instance = null;
	if ( is_null( $instance ) ) {
		$instance = new SEO_Copilot_AEO_Optimizer();
	}
	return $instance;
}

// Hook it immediately
seo_copilot_aeo_optimizer();
