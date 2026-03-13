<?php
/**
 * SEO Copilot Intelligence Hub
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Intelligence_Hub' ) ) {

	class SEO_Copilot_Intelligence_Hub {

		public function __construct() {
			// Cron Hooks
			add_action( 'seo_copilot_weekly_ai_tip', [ $this, 'generate_ai_tip' ] );

			if ( ! wp_next_scheduled( 'seo_copilot_weekly_ai_tip' ) ) {
				// Schedule for next Monday 7 AM
				$next_monday = strtotime( 'next monday 07:00:00' );
				wp_schedule_event( $next_monday, 'weekly', 'seo_copilot_weekly_ai_tip' );
			}

			// AJAX Hooks
			add_action( 'wp_ajax_seo_copilot_save_onboarding', [ $this, 'ajax_save_onboarding' ] );
			add_action( 'wp_ajax_seo_copilot_get_intel_feed', [ $this, 'ajax_get_intel_feed' ] );
			add_action( 'wp_ajax_seo_copilot_bookmark_intel', [ $this, 'ajax_bookmark_intel' ] );
			add_action( 'wp_ajax_seo_copilot_mark_helpful', [ $this, 'ajax_mark_helpful' ] );
			add_action( 'wp_ajax_seo_copilot_get_intel_content', [ $this, 'ajax_get_intel_content' ] );
			add_action( 'wp_ajax_seo_copilot_generate_weekly_tip', [ $this, 'ajax_generate_weekly_tip' ] );
		}

		/**
		 * Check if current user has completed onboarding
		 */
		public function is_onboarded() {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_onboarding';
			$user_id = get_current_user_id();
			
			$completed = $wpdb->get_var( $wpdb->prepare( "SELECT completed FROM $table WHERE user_id = %d", $user_id ) );
			return (bool) $completed;
		}

		/**
		 * Get User Onboarding Profile
		 */
		public function get_user_profile() {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_onboarding';
			$user_id = get_current_user_id();
			
			$profile = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE user_id = %d", $user_id ), ARRAY_A );
			
			if ( ! $profile ) {
				// Defaults if skipped
				return [
					'site_type' => 'blog',
					'experience_level' => 'intermediate',
					'main_goal' => 'More organic traffic'
				];
			}
			return $profile;
		}

		/**
		 * Save Onboarding Data
		 */
		public function save_onboarding( $data ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_onboarding';
			$user_id = get_current_user_id();

			$existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE user_id = %d", $user_id ) );

			$insert_data = [
				'user_id'           => $user_id,
				'site_type'         => sanitize_text_field( $data['site_type'] ),
				'niche'             => sanitize_text_field( $data['niche'] ),
				'experience_level'  => sanitize_text_field( $data['experience_level'] ),
				'main_goal'         => sanitize_text_field( $data['main_goal'] ),
				'biggest_challenge' => '',
				'completed'         => 1,
				'created_at'        => current_time( 'mysql' ),
			];

			if ( $existing ) {
				$wpdb->update( $table, $insert_data, [ 'id' => $existing ] );
			} else {
				$wpdb->insert( $table, $insert_data );
			}

			return true;
		}

		/**
		 * Get Featured Content
		 */
		public function get_featured_content() {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_intelligence';
			return $wpdb->get_results( "SELECT * FROM $table WHERE is_featured = 1 ORDER BY created_at DESC LIMIT 3" );
		}

		/**
		 * Get Personalized Feed
		 */
		public function get_personalized_feed( $limit = 20 ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_intelligence';
			$profile = $this->get_user_profile();

			$site_type = '%' . $wpdb->esc_like( $profile['site_type'] ) . '%';
			$level = $profile['experience_level'];

			$sql = $wpdb->prepare( "
				SELECT * FROM $table 
				WHERE (site_types LIKE %s OR site_types LIKE '%%all%%')
				AND (skill_level = %s OR skill_level = 'all')
				ORDER BY is_featured DESC, created_at DESC
				LIMIT %d
			", $site_type, $level, intval( $limit ) );

			return $wpdb->get_results( $sql );
		}

		/**
		 * Get Content by Type
		 */
		public function get_content_by_type( $type, $limit = 20 ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_intelligence';

			if ( $type === 'all' ) {
				return $this->get_personalized_feed( $limit );
			}

			$sql = $wpdb->prepare( "SELECT * FROM $table WHERE content_type = %s ORDER BY created_at DESC LIMIT %d", $type, intval( $limit ) );
			return $wpdb->get_results( $sql );
		}

		/**
		 * Get Bookmarks
		 */
		public function get_bookmarks( $user_id ) {
			global $wpdb;
			$t_intel = $wpdb->prefix . 'seo_copilot_intelligence';
			$t_book  = $wpdb->prefix . 'seo_copilot_intel_bookmarks';

			$sql = $wpdb->prepare( "
				SELECT i.* 
				FROM $t_intel i
				INNER JOIN $t_book b ON i.id = b.intel_id
				WHERE b.user_id = %d
				ORDER BY b.created_at DESC
			", $user_id );

			return $wpdb->get_results( $sql );
		}

		/**
		 * Bookmark Action
		 */
		public function bookmark_content( $intel_id ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_intel_bookmarks';
			$user_id = get_current_user_id();

			$existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE intel_id = %d AND user_id = %d", $intel_id, $user_id ) );

			if ( $existing ) {
				$wpdb->delete( $table, [ 'id' => $existing ] );
				return false; // removed
			} else {
				$wpdb->insert( $table, [
					'intel_id' => $intel_id,
					'user_id' => $user_id,
					'created_at' => current_time( 'mysql' )
				] );
				return true; // added
			}
		}

		/**
		 * Increment Views
		 */
		public function increment_views( $intel_id ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_intelligence';
			$wpdb->query( $wpdb->prepare( "UPDATE $table SET view_count = view_count + 1 WHERE id = %d", $intel_id ) );
		}

		/**
		 * Mark Helpful
		 */
		public function mark_helpful( $intel_id ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_intelligence';
			$user_id = get_current_user_id();
			$meta_key = '_seo_copilot_helped_' . $intel_id;

			if ( get_user_meta( $user_id, $meta_key, true ) ) {
				return false; // Already voted
			}

			$wpdb->query( $wpdb->prepare( "UPDATE $table SET helpful_count = helpful_count + 1 WHERE id = %d", $intel_id ) );
			update_user_meta( $user_id, $meta_key, 1 );

			return (int) $wpdb->get_var( $wpdb->prepare( "SELECT helpful_count FROM $table WHERE id = %d", $intel_id ) );
		}

		/**
		 * Seed Initial Content
		 */
		public function seed_initial_content() {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_intelligence';
			
			$exists = $wpdb->get_var( "SELECT COUNT(id) FROM $table" );
			if ( $exists > 0 ) return;

			$now = current_time( 'mysql' );
			$seeds = [];

			$seeds[] = [
				'content_type' => 'playbook',
				'title' => 'The Complete On-Page SEO Checklist for 2026',
				'category' => 'On-Page SEO',
				'site_types' => '["all"]',
				'skill_level' => 'beginner',
				'is_featured' => 1,
				'action_feature' => 'seo-copilot-site-audit',
				'action_label' => 'Run Site Audit',
				'content' => "A comprehensive checklist covering:\n1. Title tags and meta descriptions\n2. Heading structure (H1, H2s)\n3. Keyword placement\n4. Image optimization\n5. Internal linking\n6. Page speed\n7. Mobile optimization\n8. Schema markup\n9. E-E-A-T signals.",
				'summary' => 'Everything you need to optimize every page on your site for maximum rankings.',
				'is_premium' => 0
			];

			$seeds[] = [
				'content_type' => 'playbook',
				'title' => 'How to Rank in Google\'s AI Overviews (AEO Guide)',
				'category' => 'Answer Engine Optimization',
				'site_types' => '["all"]',
				'skill_level' => 'intermediate',
				'is_featured' => 1,
				'action_feature' => 'seo-copilot-site-audit',
				'action_label' => 'Analyze Your Content',
				'content' => "Guide on optimizing for AI Overviews:\n- Use direct answer formats\n- Add robust FAQ sections\n- Implement accurate structured data\n- Use question-based headings\n- Cite authoritative sources.",
				'summary' => 'Master Answer Engine Optimization to secure your spot in AI-generated search summaries.',
				'is_premium' => 0
			];

			$seeds[] = [
				'content_type' => 'tip',
				'title' => 'Quick Win: Add FAQ Schema to Double Your Click-Through Rate',
				'category' => 'Schema Markup',
				'site_types' => '["all"]',
				'skill_level' => 'beginner',
				'is_featured' => 0,
				'action_feature' => 'post-editor',
				'action_label' => 'Open Schema Manager',
				'content' => "FAQ schema shows expandable Q&As directly in Google results, dramatically improving CTR. To implement this:\n1. Open your post in the WP editor.\n2. Scroll down to the SEO Copilot schema tab.\n3. Select 'FAQ' and auto-generate the JSON-LD.\n4. Hit save.",
				'summary' => 'Take up more real estate on the SERPs by adding valid FAQ Schema.',
				'is_premium' => 0
			];

			$seeds[] = [
				'content_type' => 'playbook',
				'title' => 'The WooCommerce SEO Playbook: Rank Every Product Page',
				'category' => 'Ecommerce SEO',
				'site_types' => '["ecommerce"]',
				'skill_level' => 'intermediate',
				'is_featured' => 0,
				'action_feature' => 'seo-copilot-woocommerce',
				'action_label' => 'Open WooCommerce SEO',
				'content' => "Complete guide for WooCommerce:\n- Product title optimization\n- Category page silos\n- Product schema\n- Review schema (AggregateRating)\n- Internal linking for stores.",
				'summary' => 'Drive high-intent buyer traffic directly to your product pages.',
				'is_premium' => 0
			];

			$seeds[] = [
				'content_type' => 'tip',
				'title' => 'Your Content is Decaying Right Now — Here\'s How to Stop It',
				'category' => 'Content Strategy',
				'site_types' => '["blog","all"]',
				'skill_level' => 'beginner',
				'is_featured' => 0,
				'action_feature' => 'seo-copilot-decay',
				'action_label' => 'Check Content Decay',
				'content' => "Content loses rankings over time. To combat this:\n1. Identify posts dropping in impressions.\n2. Update facts, dates, and stats.\n3. Rewrite the introduction.\n4. Add new FAQs to capture new PAA boxes.",
				'summary' => 'Learn the refresh formula that recovers lost organic traffic.',
				'is_premium' => 0
			];

			$seeds[] = [
				'content_type' => 'market_research',
				'title' => 'SEO Trends Report: What\'s Working in 2026',
				'category' => 'Market Research',
				'site_types' => '["all"]',
				'skill_level' => 'all',
				'is_featured' => 1,
				'is_premium' => 1,  // Premium item!
				'action_feature' => '',
				'action_label' => '',
				'content' => "Overview of top ranking factors in 2026:\n1. E-E-A-T and Author authority.\n2. Deep topical authority clusters.\n3. Surviving the AI Overviews impact.\n4. Voice search growth.\n5. Training LLMs via direct citations.",
				'summary' => 'Exclusive data reporting on the metrics that matter most this year.',
			];

			$seeds[] = [
				'content_type' => 'template',
				'title' => 'Swipe: 10 Meta Title Formulas That Get Clicks',
				'category' => 'Copywriting',
				'site_types' => '["all"]',
				'skill_level' => 'beginner',
				'is_featured' => 0,
				'action_feature' => 'post-editor',
				'action_label' => 'Open Post Editor',
				'content' => "10 proven meta title formulas:\n1. [Number] + [Adjective] + [Keyword] + [Year]\n2. How to [Goal] Without [Pain Point]\n3. The Ultimate Guide to [Keyword]\n4. [Keyword]: What You Need to Know",
				'summary' => 'Copy and paste these proven title tag templates.',
				'is_premium' => 0
			];

			$seeds[] = [
				'content_type' => 'case_study',
				'title' => 'Case Study: From Page 4 to #1 Using Topical Authority',
				'category' => 'Case Studies',
				'site_types' => '["blog"]',
				'skill_level' => 'intermediate',
				'is_featured' => 0,
				'action_feature' => '',
				'action_label' => '',
				'content' => "How a blog dominated a niche:\nMonth 1: Mapped out 50 sub-topics.\nMonth 2: Published cluster content.\nMonth 3: Interlinked spoke pages to the hub.\nResult: Core pillar page moved from position 42 to position 1.",
				'summary' => 'See exactly how topical clustering forced Google to rank this site.',
				'is_premium' => 0
			];

			$seeds[] = [
				'content_type' => 'tip',
				'title' => 'The Internal Linking Strategy That Moved Rankings in 30 Days',
				'category' => 'Internal Linking',
				'site_types' => '["all"]',
				'skill_level' => 'beginner',
				'is_featured' => 0,
				'action_feature' => 'seo-copilot-auto-linker',
				'action_label' => 'Open Auto-Linker',
				'content' => "Use the Auto-Linker tool to implement hub-and-spoke models. Ensure anchor texts vary (exact match, partial match, natural flow). Avoid orphan pages.",
				'summary' => 'Pass PageRank effectively using diverse anchor text.',
				'is_premium' => 0
			];

			$seeds[] = [
				'content_type' => 'playbook',
				'title' => 'Local SEO Playbook: Dominate Your City',
				'category' => 'Local SEO',
				'site_types' => '["local"]',
				'skill_level' => 'beginner',
				'is_featured' => 0,
				'action_feature' => '',
				'action_label' => '',
				'content' => "Complete local SEO guide:\n1. Google Business Profile optimization\n2. Local business schema\n3. NAP consistency\n4. Local landing pages\n5. Generating regional reviews.",
				'summary' => 'Get your business into the Google Map Pack.',
				'is_premium' => 0
			];

			foreach ( $seeds as $seed ) {
				$seed['created_at'] = $now;
				$seed['updated_at'] = $now;
				$wpdb->insert( $table, $seed );
			}
		}

		/**
		 * Generate AI Tip Weekly
		 */
		public function generate_ai_tip() {
			$provider = SEO_Copilot_AI_Factory::get_provider();
			if ( ! $provider ) return false;

			$score = get_option('seo_copilot_site_score', 80);
			$count_issues = get_option('seo_copilot_audit_issues_count', 5);
			
			$prompt = "You are an expert SEO Copilot AI. Based on the site's data (Avg Score: {$score}, Critical Issues: {$count_issues}), generate a personalized SEO tip for this week.
Return ONLY valid JSON matching this structure:
{
  \"title\": \"string (max 60 chars)\",
  \"summary\": \"string (2 sentences)\",
  \"content\": \"string (detailed actionable tip, markdown supported)\",
  \"category\": \"string (e.g. Technical SEO, Content, Links)\",
  \"action_feature\": \"slug of feature to use e.g. seo-copilot-site-audit, post-editor, seo-copilot-auto-linker\",
  \"action_label\": \"Action button text\",
  \"urgency\": \"high|medium|low\"
}";

			$res = $provider->generate_text( $prompt, 'json_object' );
			if ( is_wp_error( $res ) ) return false;

			$cleaned = str_replace( ['```json', '```', '<json>', '</json>'], '', $res );
			$data = json_decode( trim( $cleaned ), true );
			if ( ! is_array( $data ) ) return false;

			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_intelligence';

			// First, un-feature any old tips if we want to rotate, or just insert new as featured
			$wpdb->query( "UPDATE $table SET is_featured = 0 WHERE content_type = 'tip' AND is_featured = 1" );

			$wpdb->insert( $table, [
				'content_type' => 'tip',
				'title' => sanitize_text_field( $data['title'] ),
				'content' => wp_kses_post( $data['content'] ),
				'summary' => sanitize_text_field( $data['summary'] ),
				'category' => sanitize_text_field( $data['category'] ),
				'site_types' => '["all"]',
				'skill_level' => 'all',
				'is_premium' => 0,
				'is_featured' => 1,
				'action_feature' => sanitize_text_field( $data['action_feature'] ),
				'action_label' => sanitize_text_field( $data['action_label'] ),
				'created_at' => current_time( 'mysql' ),
				'updated_at' => current_time( 'mysql' )
			] );

			return true;
		}

		// -------------------------------------------------------------------------
		// AJAX Handlers
		// -------------------------------------------------------------------------

		public function ajax_save_onboarding() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$data = [
				'site_type' => sanitize_text_field( $_POST['site_type'] ?? 'blog' ),
				'niche' => sanitize_text_field( $_POST['niche'] ?? '' ),
				'experience_level' => sanitize_text_field( $_POST['experience_level'] ?? 'beginner' ),
				'main_goal' => sanitize_text_field( $_POST['main_goal'] ?? 'traffic' )
			];

			$this->save_onboarding( $data );
			wp_send_json_success();
		}

		public function ajax_get_intel_feed() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$type = isset( $_POST['feed_type'] ) ? sanitize_text_field( $_POST['feed_type'] ) : 'all';
			
			if ( $type === 'bookmarks' ) {
				$feed = $this->get_bookmarks( get_current_user_id() );
			} else {
				$feed = $this->get_content_by_type( $type, 50 );
			}

			// We will just return the JSON and let jQuery render the cards
			// This is slightly simpler than full server-side HTML chunking for masonry
			
			// We need to flag if each item is bookmarked for the UI
			global $wpdb;
			$b_table = $wpdb->prefix . 'seo_copilot_intel_bookmarks';
			$user_id = get_current_user_id();
			$bookmarked_ids = $wpdb->get_col( $wpdb->prepare( "SELECT intel_id FROM $b_table WHERE user_id = %d", $user_id ) );

			$ret = [];
			foreach ( $feed as $item ) {
				$item->is_bookmarked = in_array( $item->id, $bookmarked_ids );
				$ret[] = $item;
			}

			wp_send_json_success( $ret );
		}

		public function ajax_bookmark_intel() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$id = isset( $_POST['intel_id'] ) ? intval( $_POST['intel_id'] ) : 0;
			$status = $this->bookmark_content( $id );
			wp_send_json_success( [ 'is_bookmarked' => $status ] );
		}

		public function ajax_mark_helpful() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$id = isset( $_POST['intel_id'] ) ? intval( $_POST['intel_id'] ) : 0;
			$count = $this->mark_helpful( $id );
			
			if ( $count === false ) {
				wp_send_json_error( 'Already voted' );
			}
			wp_send_json_success( [ 'helpful_count' => $count ] );
		}

		public function ajax_get_intel_content() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$id = isset( $_POST['intel_id'] ) ? intval( $_POST['intel_id'] ) : 0;
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_intelligence';
			$content = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );

			if ( $content ) {
				$this->increment_views( $id );
				wp_send_json_success( $content );
			}
			wp_send_json_error();
		}

		public function ajax_generate_weekly_tip() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$res = $this->generate_ai_tip();
			if ( $res ) {
				wp_send_json_success( 'Tip generated successfully.' );
			}
			wp_send_json_error( 'Failed to generate tip.' );
		}
	}
}

function seo_copilot_intelligence_hub() {
	static $instance = null;
	if ( is_null( $instance ) ) {
		$instance = new SEO_Copilot_Intelligence_Hub();
	}
	return $instance;
}

// Init
seo_copilot_intelligence_hub();
