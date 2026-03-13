<?php
/**
 * E-E-A-T Authority Builder Class
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_EEAT_Builder' ) ) {

	class SEO_Copilot_EEAT_Builder {

		public function __construct() {
			// AJAX Endpoints
			add_action( 'wp_ajax_seo_copilot_analyze_eeat', [ $this, 'ajax_analyze_eeat' ] );
			add_action( 'wp_ajax_seo_copilot_get_eeat_plan', [ $this, 'ajax_get_eeat_plan' ] );
			add_action( 'wp_ajax_seo_copilot_generate_author_bio', [ $this, 'ajax_generate_author_bio' ] );
			add_action( 'wp_ajax_seo_copilot_apply_author_bio', [ $this, 'ajax_apply_author_bio' ] );
			add_action( 'wp_ajax_seo_copilot_create_trust_page', [ $this, 'ajax_create_trust_page' ] );
			add_action( 'wp_ajax_seo_copilot_generate_eeat_schema', [ $this, 'ajax_generate_eeat_schema' ] );
		}

		/**
		 * Score the entire site's E-E-A-T baseline
		 */
		public function score_site() {
			global $wpdb;

			$issues = [];
			$exp_score = $ext_score = $auth_score = $trust_score = 0;

			// ---------------------------------------------------------
			// 1. EXPERIENCE SIGNALS (25 points)
			// ---------------------------------------------------------
			
			// A. Do posts have author bios? (Check random sample)
			$sample_posts = get_posts(['numberposts' => 5, 'post_type' => 'post']);
			$has_bios = false;
			$has_dates = true;
			$has_personal_lang = false;

			if ( ! empty($sample_posts) ) {
				foreach ($sample_posts as $p) {
					$content = $p->post_content;
					
					// Naive bio check - looking for common bio classes or themes
					if ( preg_match('/class=[\'"][^\'"]*(author-bio|biography)[^\'"]*[\'"]/i', $content) ) {
						$has_bios = true;
					}

					// Personal lang check
					if ( preg_match('/\b(I |my |we |our experience|in my testing)\b/i', $content) ) {
						$has_personal_lang = true;
					}

					// Date check (naive, assume if theme outputs it, but we can't tell easily from content alone)
					// We'll give it to them by default unless we detect explicit hiding
				}
			}

			if ( $has_bios ) {
				$exp_score += 5;
			} else {
				$issues[] = ['signal'=>'experience', 'type'=>'negative', 'desc'=>'Limited author bio boxes detected on posts'];
			}

			if ( $has_personal_lang ) {
				$exp_score += 5;
			} else {
				$issues[] = ['signal'=>'experience', 'type'=>'negative', 'desc'=>'Limited first-person "experience" language detected in content'];
			}

			$exp_score += 5; // Base 5 for publish dates (assumed by most WP themes)

			// Author bios mention real experience (Check users table)
			$authors = get_users(['who' => 'authors']);
			$good_bios = 0;
			$good_creds = 0;
			foreach ($authors as $user) {
				$desc = get_user_meta($user->ID, 'description', true);
				if ( preg_match('/\b(years|worked|founded|built|created|i have|my experience)\b/i', $desc) ) {
					$good_bios++;
				}
				if ( preg_match('/\b(phd|certified|degree|expert|specialist|professional)\b/i', $desc) ) {
					$good_creds++;
				}
			}

			if ( count($authors) > 0 ) {
				if ( ($good_bios / count($authors)) > 0.5 ) {
					$exp_score += 5;
				} else {
					$issues[] = ['signal'=>'experience', 'type'=>'negative', 'desc'=>'Author bios lack specific experience keywords'];
				}
			}

			// About Page
			$about_page = $this->find_page_by_slug('about');
			if ( $about_page ) {
				$exp_score += 5;
			} else {
				$issues[] = ['signal'=>'experience', 'type'=>'negative', 'desc'=>'No dedicated About page found'];
			}


			// ---------------------------------------------------------
			// 2. EXPERTISE SIGNALS (25 points)
			// ---------------------------------------------------------
			
			if ( count($authors) > 0 && ($good_creds / count($authors)) > 0.5 ) {
				$ext_score += 5;
			} else {
				$issues[] = ['signal'=>'expertise', 'type'=>'negative', 'desc'=>'No credentials (expert, certified, degree, etc.) mentioned in author bios'];
			}

			// External links check (naive via wpdb on wp_posts)
			$has_ext_links = $wpdb->get_var("SELECT ID FROM {$wpdb->posts} WHERE post_content LIKE '%href=\"http%' AND post_content NOT LIKE '%href=\"".home_url()."%' AND post_status='publish' LIMIT 1");
			if ( $has_ext_links ) {
				$ext_score += 5;
			} else {
				$issues[] = ['signal'=>'expertise', 'type'=>'negative', 'desc'=>'Site lacks external citations/links to authority sources'];
			}

			// Detailed author bios (>50 words)
			$long_bios = 0;
			foreach ($authors as $user) {
				$desc = get_user_meta($user->ID, 'description', true);
				if ( str_word_count(strip_tags($desc)) > 50 ) {
					$long_bios++;
				}
			}
			if ( count($authors) > 0 && ($long_bios / count($authors)) > 0.5 ) {
				$ext_score += 5;
			} else {
				$issues[] = ['signal'=>'expertise', 'type'=>'negative', 'desc'=>'Short author bios (< 50 words)'];
			}

			// Average word count > 1000
			$ext_score += 5; // Difficult to accurately measure without heavy parsing, assume average for now

			// Dedicated author pages
			// WP has author archives by default
			$ext_score += 5; 


			// ---------------------------------------------------------
			// 3. AUTHORITY SIGNALS (25 points)
			// ---------------------------------------------------------
			
			if ( $about_page ) {
				$auth_score += 5;
				if ( preg_match('/<img/i', $about_page->post_content) ) {
					$auth_score += 5;
				} else {
					$issues[] = ['signal'=>'authority', 'type'=>'negative', 'desc'=>'No team photos/faces on About page'];
				}
			}

			// Social links in header/footer (check options/theme mods loosely)
			$theme_mods = get_theme_mods();
			$has_social = false;
			if ( is_array($theme_mods) ) {
				$mod_str = json_encode($theme_mods);
				if ( preg_match('/(facebook|twitter|linkedin|instagram)\.com/i', $mod_str) ) {
					$has_social = true;
				}
			}
			if ( $has_social ) {
				$auth_score += 5;
			} else {
				$issues[] = ['signal'=>'authority', 'type'=>'negative', 'desc'=>'No social media profiles detected in theme settings'];
			}

			// Active > 1 year
			$oldest = $wpdb->get_var("SELECT post_date FROM {$wpdb->posts} WHERE post_status='publish' AND post_type='post' ORDER BY post_date ASC LIMIT 1");
			if ( $oldest && strtotime($oldest) < strtotime('-1 year') ) {
				$auth_score += 5;
			} else {
				$issues[] = ['signal'=>'authority', 'type'=>'negative', 'desc'=>'Site appears to be less than 1 year old'];
			}

			// Orig schema
			$schema_opt = get_option('seo_copilot_settings', []);
			if ( !empty($schema_opt['org_schema']) ) {
				$auth_score += 5;
			} else {
				$issues[] = ['signal'=>'authority', 'type'=>'negative', 'desc'=>'No Organization schema configured'];
			}


			// ---------------------------------------------------------
			// 4. TRUST SIGNALS (25 points)
			// ---------------------------------------------------------
			
			if ( $this->find_page_by_slug('privacy') ) {
				$trust_score += 5;
			} else {
				$issues[] = ['signal'=>'trust', 'type'=>'negative', 'desc'=>'Missing Privacy Policy page'];
			}

			if ( $this->find_page_by_slug('terms') || $this->find_page_by_slug('tos') ) {
				$trust_score += 5;
			} else {
				$issues[] = ['signal'=>'trust', 'type'=>'negative', 'desc'=>'Missing Terms of Service page'];
			}

			$contact_page = $this->find_page_by_slug('contact');
			if ( $contact_page ) {
				$trust_score += 5;
				if ( preg_match('/\[contact-form|wpforms|gform|ninja_forms/i', $contact_page->post_content) || preg_match('/@/i', $contact_page->post_content) ) {
					$trust_score += 5;
				} else {
					$issues[] = ['signal'=>'trust', 'type'=>'negative', 'desc'=>'Contact page lacks a form or email address'];
				}
			} else {
				$issues[] = ['signal'=>'trust', 'type'=>'negative', 'desc'=>'Missing Contact page'];
				$issues[] = ['signal'=>'trust', 'type'=>'negative', 'desc'=>'Missing contact form'];
			}

			if ( is_ssl() ) {
				$trust_score += 5;
			} else {
				$issues[] = ['signal'=>'trust', 'type'=>'negative', 'desc'=>'HTTPS is not enabled (Critical Trust Issue)'];
			}


			// Final calculation
			$overall = $exp_score + $ext_score + $auth_score + $trust_score;

			$data = [
				'experience' => min(25, $exp_score),
				'expertise'  => min(25, $ext_score),
				'authority'  => min(25, $auth_score),
				'trust'      => min(25, $trust_score),
				'overall'    => min(100, $overall),
				'issues'     => $issues
			];

			$this->save_score( 'site', 0, $data );

			return $data;
		}

		/**
		 * Score a specific post's E-E-A-T baseline
		 */
		public function score_post( $post_id ) {
			$post = get_post($post_id);
			if ( !$post ) return false;

			$issues = [];
			$exp_score = $ext_score = $auth_score = $trust_score = 0;
			$content = $post->post_content;
			$author_id = $post->post_author;
			$author_desc = get_user_meta($author_id, 'description', true);

			// EXP
			$exp_score += 5; // assumes byline
			if ( str_word_count(strip_tags($author_desc)) > 10 ) $exp_score += 10;
			else $issues[] = "Author bio is too short or missing.";

			if ( preg_match('/\b(I |my |we |our experience|in my testing)\b/i', $content) ) $exp_score += 10;
			else $issues[] = "No first-person or personal experience indicators found.";

			// EXT
			if ( preg_match('/href="http/i', $content) ) $ext_score += 20;
			else $issues[] = "No external citations to authority domains.";
			
			if ( str_word_count(strip_tags($content)) > 800 ) $ext_score += 5;
			else $issues[] = "Content is thin (< 800 words), limiting expertise display.";

			// AUTH
			if ( preg_match('/\b(phd|certified|degree|expert|specialist|professional)\b/i', $author_desc) ) $auth_score += 10;
			else $issues[] = "Author lacks stated professional credentials.";

			if ( strtotime($post->post_modified) > strtotime('-3 months') ) $auth_score += 10;
			else $issues[] = "Content has not been updated in over 3 months.";
			$auth_score += 5;

			// TRUST
			$trust_score += 25; // Assume base trust for individual posts if site is trusted

			$overall = $exp_score + $ext_score + $auth_score + $trust_score;
			
			$data = [
				'experience' => min(25, $exp_score),
				'expertise'  => min(25, $ext_score),
				'authority'  => min(25, $auth_score),
				'trust'      => min(25, $trust_score),
				'overall'    => min(100, $overall),
				'issues'     => $issues
			];

			$this->save_score( 'post', $post_id, $data );

			return $data;
		}

		private function save_score( $type, $post_id, $data ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_eeat_scores';

			$existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE score_type = %s AND post_id = %d", $type, $post_id));

			$db_data = [
				'score_type' => $type,
				'post_id' => $post_id,
				'experience_score' => $data['experience'],
				'expertise_score' => $data['expertise'],
				'authority_score' => $data['authority'],
				'trust_score' => $data['trust'],
				'overall_score' => $data['overall'],
				'issues' => wp_json_encode($data['issues']),
				'last_analyzed' => current_time('mysql')
			];

			if ( $existing ) {
				$wpdb->update($table, $db_data, ['id' => $existing]);
			} else {
				$wpdb->insert($table, $db_data);
			}
		}

		public function get_score( $type, $post_id = 0 ) {
			global $wpdb;
			return $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}seo_copilot_eeat_scores WHERE score_type = %s AND post_id = %d", $type, $post_id), ARRAY_A);
		}

		public function check_trust_pages() {
			return [
				'privacy' => $this->find_page_by_slug('privacy'),
				'terms'   => $this->find_page_by_slug('terms') ?: $this->find_page_by_slug('tos'),
				'about'   => $this->find_page_by_slug('about'),
				'contact' => $this->find_page_by_slug('contact'),
			];
		}

		private function find_page_by_slug( $fragment ) {
			global $wpdb;
			$like = '%' . $wpdb->esc_like( $fragment ) . '%';
			$post = $wpdb->get_row( $wpdb->prepare( "SELECT ID, post_content, post_name FROM {$wpdb->posts} WHERE post_type='page' AND post_status='publish' AND (post_name LIKE %s OR post_title LIKE %s) LIMIT 1", $like, $like ) );
			return $post;
		}

		public function generate_author_bio( $author_id ) {
			$user = get_userdata($author_id);
			if ( ! $user ) return false;

			$provider = SEO_Copilot_AI_Factory::get_provider();
			$prompt = "You are an SEO expert specializing in E-E-A-T. Rewrite the following author bio to maximize Google's Experience, Expertise, Authority, and Trust signals. Make it professional, engaging, and around 60 words.

Author: {$user->display_name}
Current Bio: " . get_user_meta($author_id, 'description', true) . "

Focus on adding authoritative tone, implying real-world experience, and using credential-focused language if appropriate. Do not use markdown, return only the rewritten text.";

			$response = $provider->generate_text( $prompt );
			return is_wp_error($response) ? false : trim($response);
		}

		public function generate_eeat_improvements() {
			$score = $this->get_score('site', 0);
			if ( !$score ) return false;

			$provider = SEO_Copilot_AI_Factory::get_provider();
			$issues_str = '';
			$issues = json_decode($score['issues'], true);
			if ( is_array($issues) ) {
				foreach ($issues as $iss) {
					$issues_str .= "- [{$iss['signal']}] {$iss['desc']}\n";
				}
			}

			$prompt = "You are a Google E-E-A-T expert. Analyze these E-E-A-T scores and provide specific actionable improvements based heavily on the issues provided.

Current Scores:
Experience: {$score['experience_score']}/25
Expertise: {$score['expertise_score']}/25
Authority: {$score['authority_score']}/25
Trust: {$score['trust_score']}/25
Overall: {$score['overall_score']}/100

Issues Found:
{$issues_str}

Return JSON strictly:
{
  \"priority_fixes\": [
    {
      \"signal\": \"experience|expertise|authority|trust\",
      \"issue\": \"string\",
      \"fix\": \"specific action to take\",
      \"effort\": \"low|medium|high\",
      \"impact\": \"low|medium|high\",
      \"example\": \"concrete example of what good looks like\"
    }
  ]
}";
			$response = $provider->generate_text( $prompt );
			if ( is_wp_error($response) ) return false;

			$text = preg_replace('/```json/i', '', $response);
			$text = preg_replace('/```/i', '', $text);
			return json_decode(trim($text), true);
		}

		/* -------------------------------------------------------------------------
		 * AJAX HANDLERS
		 * ------------------------------------------------------------------------- */

		public function ajax_analyze_eeat() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$res = $this->score_site();
			wp_send_json_success( $res );
		}

		public function ajax_get_eeat_plan() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$plan = $this->generate_eeat_improvements();
			if ( $plan ) {
				wp_send_json_success( $plan );
			} else {
				wp_send_json_error( 'Failed to generate plan.' );
			}
		}

		public function ajax_generate_author_bio() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$author_id = intval($_POST['author_id']);
			$new_bio = $this->generate_author_bio($author_id);

			if ( $new_bio ) {
				wp_send_json_success( ['bio' => $new_bio] );
			} else {
				wp_send_json_error( 'Generation failed.' );
			}
		}

		public function ajax_apply_author_bio() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$author_id = intval($_POST['author_id']);
			$bio = sanitize_textarea_field($_POST['bio']);

			update_user_meta( $author_id, 'description', $bio );
			wp_send_json_success();
		}

		public function ajax_create_trust_page() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$type = sanitize_text_field($_POST['page_type']); // privacy, terms, about
			
			$title = ucfirst($type);
			if ( $type === 'privacy' ) $title = 'Privacy Policy';
			if ( $type === 'terms' ) $title = 'Terms of Service';

			$post_id = wp_insert_post([
				'post_title' => $title,
				'post_status' => 'draft',
				'post_type' => 'page',
				'post_content' => "<!-- Initial draft generated by SEO Copilot E-E-A-T Builder -->\n\n[Please update with your specific details.]"
			]);

			if ( ! is_wp_error($post_id) ) {
				wp_send_json_success( ['edit_url' => get_edit_post_link($post_id, '')] );
			} else {
				wp_send_json_error();
			}
		}

		public function ajax_generate_eeat_schema() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$type = sanitize_text_field($_POST['schema_type']);

			// Mocking basic generation update to settings
			$opt = get_option('seo_copilot_settings', []);
			if ( $type === 'org' ) {
				$opt['org_schema'] = true;
				update_option('seo_copilot_settings', $opt);
				wp_send_json_success("Organization Schema enabled globally.");
			} else {
				wp_send_json_error("Not implemented schema type.");
			}
		}

	}
}

function seo_copilot_eeat_builder() {
	static $instance = null;
	if ( is_null($instance) ) {
		$instance = new SEO_Copilot_EEAT_Builder();
	}
	return $instance;
}

seo_copilot_eeat_builder();
