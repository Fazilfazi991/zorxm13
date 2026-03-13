<?php
/**
 * Plugin Name:       SEO Copilot
 * Plugin URI:        https://example.com/seo-copilot
 * Description:       An AI-powered SEO plugin for WordPress.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            SEO Copilot Team
 * Author URI:        https://example.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       seo-copilot
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot' ) ) {

	/**
	 * Main SEO_Copilot Class.
	 *
	 * Uses the Singleton pattern to ensure only one instance of the plugin is loaded.
	 */
	final class SEO_Copilot {

		/**
		 * Plugin Version.
		 *
		 * @var string
		 */
		const VERSION = '1.0.0';

		/**
		 * The single instance of the class.
		 *
		 * @var SEO_Copilot
		 */
		private static $instance = null;

		/**
		 * Main SEO_Copilot Instance.
		 *
		 * Ensures only one instance of SEO_Copilot is loaded or can be loaded.
		 *
		 * @return SEO_Copilot - Main instance.
		 */
		public static function instance() {
			if ( is_null( self::$instance ) ) {
				self::$instance = new self();
			}
			return self::$instance;
		}

		/**
		 * SEO_Copilot Constructor.
		 */
		private function __construct() {
			$this->define_constants();
			$this->includes();
			$this->init_hooks();
		}

		/**
		 * Define SEO Copilot Constants.
		 */
		private function define_constants() {
			$this->define( 'SEO_COPILOT_VERSION',     self::VERSION );
			$this->define( 'SEO_COPILOT_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
			$this->define( 'SEO_COPILOT_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );
			$this->define( 'SEO_COPILOT_PLUGIN_FILE', __FILE__ );
			// Shorter aliases used by some view files
			$this->define( 'SEO_COPILOT_PATH',        plugin_dir_path( __FILE__ ) );
			$this->define( 'SEO_COPILOT_URL',         plugin_dir_url( __FILE__ ) );
			$this->define( 'SEO_COPILOT_BASENAME',    plugin_basename( __FILE__ ) );
		}

		/**
		 * Define constant if not already set.
		 *
		 * @param string      $name  Constant name.
		 * @param string|bool $value Constant value.
		 */
		private function define( $name, $value ) {
			if ( ! defined( $name ) ) {
				define( $name, $value );
			}
		}

		/**
		 * Include required core files.
		 */
		private function includes() {
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-core.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-ai-provider.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/prompts.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-claude-api.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-gemini-api.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-gsc-api.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-ga4-api.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-ai-factory.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-analyzer.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-admin.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-metabox.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-settings.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-site-audit.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-schema.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-content-decay.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-cannibalization.php';

			// Phase 2 Modules
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-seo-brief.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-auto-linker.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-readability.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-competitor-gap.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-seo-changelog.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-woocommerce-seo.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-intelligence-hub.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-client-reports.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-frontend-badge.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-llm-tracker.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-aeo-optimizer.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-topical-authority.php';
			require_once SEO_COPILOT_PLUGIN_DIR . 'includes/class-eeat-builder.php';
		}

		/**
		 * Initialize hooks.
		 */
		private function init_hooks() {
			register_activation_hook( __FILE__, [ $this, 'activate' ] );
			register_deactivation_hook( __FILE__, [ $this, 'deactivate' ] );
		}

		/**
		 * Plugin activation handler.
		 */
		public function activate() {
			global $wpdb;

			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
			$charset_collate = $wpdb->get_charset_collate();

			// 1. Create {prefix}_seo_copilot_scores table
			$table_scores = $wpdb->prefix . 'seo_copilot_scores';
			$sql_scores   = "CREATE TABLE $table_scores (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id bigint(20) unsigned NOT NULL,
				score int(11) NOT NULL DEFAULT 0,
				issues longtext,
				last_analyzed datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY post_id (post_id)
			) $charset_collate;";
			dbDelta( $sql_scores );

			// 2. Create {prefix}_seo_copilot_keywords table
			$table_keywords = $wpdb->prefix . 'seo_copilot_keywords';
			$sql_keywords   = "CREATE TABLE $table_keywords (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id bigint(20) unsigned NOT NULL,
				keyword varchar(255) NOT NULL,
				search_volume int(11) DEFAULT 0,
				ranking_position int(11) DEFAULT 0,
				last_checked datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY post_id (post_id),
				KEY keyword (keyword(191))
			) $charset_collate;";
			dbDelta( $sql_keywords );

			// 3. Create {prefix}_seo_copilot_activity table for the dashboard feed
			$table_activity = $wpdb->prefix . 'seo_copilot_activity';
			$sql_activity   = "CREATE TABLE $table_activity (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id bigint(20) unsigned NOT NULL,
				event_type varchar(100) NOT NULL,
				event_data longtext,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY post_id (post_id),
				KEY event_type (event_type)
			) $charset_collate;";
			dbDelta( $sql_activity );

			// 5. Create {prefix}_seo_copilot_conflicts table for Cannibalization
			$table_conflicts = $wpdb->prefix . 'seo_copilot_conflicts';
			$sql_conflicts   = "CREATE TABLE $table_conflicts (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id_1 bigint(20) unsigned NOT NULL,
				post_id_2 bigint(20) unsigned NOT NULL,
				shared_keyword varchar(255) NOT NULL,
				conflict_score int(11) DEFAULT 0,
				recommendation longtext,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY post_id_1 (post_id_1),
				KEY post_id_2 (post_id_2)
			) $charset_collate;";
			dbDelta( $sql_conflicts );

			// 6. Create {prefix}_seo_copilot_score_history table for Content Decay Tracker
			$table_score_history = $wpdb->prefix . 'seo_copilot_score_history';
			$sql_score_history   = "CREATE TABLE $table_score_history (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id bigint(20) unsigned NOT NULL,
				score int(11) DEFAULT 0,
				issues_count int(11) DEFAULT 0,
				recorded_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY post_id (post_id)
			) $charset_collate;";
			dbDelta( $sql_score_history );

			// 7. Create {prefix}_seo_copilot_tracked_keywords table
			$table_tracked_keywords = $wpdb->prefix . 'seo_copilot_tracked_keywords';
			$sql_tracked_keywords   = "CREATE TABLE $table_tracked_keywords (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id bigint(20) unsigned NOT NULL,
				keyword varchar(255) NOT NULL,
				country_code varchar(10),
				language_code varchar(10),
				device varchar(10) DEFAULT 'desktop',
				source varchar(20) DEFAULT 'manual',
				date_added datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_post_id (post_id),
				KEY idx_keyword (keyword(191))
			) $charset_collate;";
			dbDelta( $sql_tracked_keywords );

			// 8. Create {prefix}_seo_copilot_rank_history table
			$table_rank_history = $wpdb->prefix . 'seo_copilot_rank_history';
			$sql_rank_history   = "CREATE TABLE $table_rank_history (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				keyword_id bigint(20) unsigned NOT NULL,
				position int(11),
				url varchar(500),
				search_volume int(11) DEFAULT 0,
				cpc decimal(10,2) DEFAULT 0.00,
				competition decimal(5,4) DEFAULT 0.0000,
				recorded_date date NOT NULL,
				source varchar(20),
				PRIMARY KEY  (id),
				KEY idx_keyword_id (keyword_id),
				KEY idx_recorded_date (recorded_date)
			) $charset_collate;";
			dbDelta( $sql_rank_history );

			// 9. Create {prefix}_seo_copilot_gsc_data table
			$table_gsc_data = $wpdb->prefix . 'seo_copilot_gsc_data';
			$sql_gsc_data   = "CREATE TABLE $table_gsc_data (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id bigint(20) unsigned NOT NULL,
				keyword varchar(255) NOT NULL,
				clicks int(11) DEFAULT 0,
				impressions int(11) DEFAULT 0,
				ctr decimal(5,4) DEFAULT 0.0000,
				position decimal(8,2) DEFAULT 0.00,
				country varchar(10),
				recorded_date date NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_post_id (post_id),
				KEY idx_recorded_date (recorded_date)
			) $charset_collate;";
			dbDelta( $sql_gsc_data );

			// 10. Create {prefix}_seo_copilot_briefs table
			$table_briefs = $wpdb->prefix . 'seo_copilot_briefs';
			$sql_briefs   = "CREATE TABLE $table_briefs (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				keyword varchar(255) NOT NULL,
				country_code varchar(10),
				brief_data longtext,
				post_id bigint(20) unsigned DEFAULT NULL,
				status varchar(50) DEFAULT 'draft',
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				updated_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_keyword (keyword(191)),
				KEY idx_post_id (post_id)
			) $charset_collate;";
			dbDelta( $sql_briefs );

			// 11. Create {prefix}_seo_copilot_keyword_map table
			$table_keyword_map = $wpdb->prefix . 'seo_copilot_keyword_map';
			$sql_keyword_map   = "CREATE TABLE $table_keyword_map (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id bigint(20) unsigned NOT NULL,
				keyword varchar(255) NOT NULL,
				keyword_type varchar(50) NOT NULL,
				post_url varchar(500) NOT NULL,
				post_title text NOT NULL,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_post_id (post_id),
				KEY idx_keyword (keyword(191))
			) $charset_collate;";
			dbDelta( $sql_keyword_map );

			// 12. Create {prefix}_seo_copilot_auto_links table
			$table_auto_links = $wpdb->prefix . 'seo_copilot_auto_links';
			$sql_auto_links   = "CREATE TABLE $table_auto_links (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				source_post_id bigint(20) unsigned NOT NULL,
				target_post_id bigint(20) unsigned NOT NULL,
				keyword varchar(255) NOT NULL,
				anchor_text text NOT NULL,
				inserted_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_source_post (source_post_id),
				KEY idx_target_post (target_post_id)
			) $charset_collate;";
			dbDelta( $sql_auto_links );

			// 13. Create {prefix}_seo_copilot_competitor_analyses table
			$table_competitor_analyses = $wpdb->prefix . 'seo_copilot_competitor_analyses';
			$sql_competitor_analyses   = "CREATE TABLE $table_competitor_analyses (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id bigint(20) unsigned NOT NULL,
				competitor_url varchar(500) NOT NULL,
				gap_data longtext,
				gap_score int(11) DEFAULT 0,
				analyzed_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_post_id (post_id)
			) $charset_collate;";
			dbDelta( $sql_competitor_analyses );

			// 14. Create {prefix}_seo_copilot_changelog table
			$table_changelog = $wpdb->prefix . 'seo_copilot_changelog';
			$sql_changelog   = "CREATE TABLE $table_changelog (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				title varchar(500) NOT NULL,
				summary text,
				source_url varchar(500) NOT NULL,
				source_name varchar(100),
				published_date datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				impact_level varchar(20),
				category varchar(50),
				ai_analysis text,
				affects_site tinyint(1) DEFAULT 0,
				action_items text,
				is_read tinyint(1) DEFAULT 0,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_source_url (source_url(191)),
				KEY idx_published_date (published_date)
			) $charset_collate;";
			dbDelta( $sql_changelog );

			// 15. Create Intelligence Hub Tables
			$table_intel = $wpdb->prefix . 'seo_copilot_intelligence';
			$sql_intel   = "CREATE TABLE $table_intel (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				content_type varchar(50),
				title varchar(500),
				content longtext,
				summary text,
				category varchar(100),
				site_types text,
				skill_level varchar(20),
				is_premium tinyint(1) DEFAULT 0,
				is_featured tinyint(1) DEFAULT 0,
				action_feature varchar(100),
				action_label varchar(100),
				view_count int DEFAULT 0,
				helpful_count int DEFAULT 0,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				updated_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id)
			) $charset_collate;";
			dbDelta( $sql_intel );

			$table_intel_bookmarks = $wpdb->prefix . 'seo_copilot_intel_bookmarks';
			$sql_intel_bookmarks   = "CREATE TABLE $table_intel_bookmarks (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				intel_id bigint(20) unsigned NOT NULL,
				user_id bigint(20) unsigned NOT NULL,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_user_id (user_id),
				KEY idx_intel_id (intel_id)
			) $charset_collate;";
			dbDelta( $sql_intel_bookmarks );

			$table_intel_onboard = $wpdb->prefix . 'seo_copilot_onboarding';
			$sql_intel_onboard   = "CREATE TABLE $table_intel_onboard (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				user_id bigint(20) unsigned NOT NULL,
				site_type varchar(50),
				niche varchar(100),
				experience_level varchar(20),
				main_goal varchar(50),
				biggest_challenge varchar(100),
				completed tinyint(1) DEFAULT 0,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_user_id (user_id)
			) $charset_collate;";
			dbDelta( $sql_intel_onboard );

			// If empty intel table, seed it
			if ( class_exists( 'SEO_Copilot_Intelligence_Hub' ) ) {
				seo_copilot_intelligence_hub()->seed_initial_content();
			}

			// Clients Table
			$table_clients = $wpdb->prefix . 'seo_copilot_clients';
			$sql_clients   = "CREATE TABLE $table_clients (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				name varchar(255) NOT NULL,
				email varchar(255) NOT NULL,
				company varchar(255),
				website_url varchar(500),
				logo_url varchar(500),
				brand_color varchar(7) DEFAULT '#4F46E5',
				notes text,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id)
			) $charset_collate;";
			dbDelta( $sql_clients );

			// Reports Table
			$table_reports = $wpdb->prefix . 'seo_copilot_reports';
			$sql_reports   = "CREATE TABLE $table_reports (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				client_id bigint(20) unsigned NOT NULL,
				report_name varchar(255) NOT NULL,
				report_type varchar(50) NOT NULL,
				date_from date NOT NULL,
				date_to date NOT NULL,
				sections text,
				report_data longtext,
				status varchar(20) NOT NULL,
				white_label tinyint(1) DEFAULT 1,
				agency_name varchar(255),
				agency_logo varchar(500),
				agency_color varchar(7),
				sent_at datetime,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_client_id (client_id)
			) $charset_collate;";
			dbDelta( $sql_reports );

			// LLM Tracker Tables
			$table_llm_checks = $wpdb->prefix . 'seo_copilot_llm_checks';
			$sql_llm_checks   = "CREATE TABLE $table_llm_checks (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				query_text varchar(500),
				query_type varchar(50),
				llm_provider varchar(50),
				response_text longtext,
				mentioned tinyint(1) DEFAULT 0,
				mention_context text,
				mention_sentiment varchar(20),
				position_in_response int(11),
				checked_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_provider (llm_provider),
				KEY idx_query_type (query_type)
			) $charset_collate;";
			dbDelta( $sql_llm_checks );

			$table_llm_queries = $wpdb->prefix . 'seo_copilot_llm_queries';
			$sql_llm_queries   = "CREATE TABLE $table_llm_queries (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				query_text varchar(500),
				query_type varchar(50),
				is_active tinyint(1) DEFAULT 1,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id)
			) $charset_collate;";
			dbDelta( $sql_llm_queries );

			// AEO Optimizer Table
			$table_aeo_scores = $wpdb->prefix . 'seo_copilot_aeo_scores';
			$sql_aeo_scores   = "CREATE TABLE $table_aeo_scores (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				post_id bigint(20) unsigned NOT NULL,
				aeo_score int(11) DEFAULT 0,
				direct_answer_score int(11) DEFAULT 0,
				faq_score int(11) DEFAULT 0,
				structure_score int(11) DEFAULT 0,
				schema_score int(11) DEFAULT 0,
				issues longtext,
				suggestions longtext,
				last_analyzed datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_post_id (post_id)
			) $charset_collate;";
			dbDelta( $sql_aeo_scores );

			// Topical Authority Tables
			$table_topic_maps = $wpdb->prefix . 'seo_copilot_topic_maps';
			$sql_topic_maps   = "CREATE TABLE $table_topic_maps (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				main_topic varchar(255),
				country_code varchar(10),
				topic_data longtext,
				coverage_score int(11) DEFAULT 0,
				total_subtopics int(11) DEFAULT 0,
				covered_subtopics int(11) DEFAULT 0,
				status varchar(20) DEFAULT 'active',
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				updated_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id)
			) $charset_collate;";
			dbDelta( $sql_topic_maps );

			$table_topic_gaps = $wpdb->prefix . 'seo_copilot_topic_gaps';
			$sql_topic_gaps   = "CREATE TABLE $table_topic_gaps (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				map_id bigint(20) unsigned NOT NULL,
				subtopic varchar(255),
				cluster varchar(100),
				search_volume int(11) DEFAULT 0,
				priority_score int(11) DEFAULT 0,
				status varchar(20) DEFAULT 'gap',
				matched_post_id bigint(20) unsigned DEFAULT NULL,
				brief_id bigint(20) unsigned DEFAULT NULL,
				created_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_map_id (map_id),
				KEY idx_status (status)
			) $charset_collate;";
			dbDelta( $sql_topic_gaps );

			// E-E-A-T Builder Table
			$table_eeat_scores = $wpdb->prefix . 'seo_copilot_eeat_scores';
			$sql_eeat_scores   = "CREATE TABLE $table_eeat_scores (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				score_type varchar(20),
				post_id bigint(20) unsigned DEFAULT NULL,
				experience_score int(11) DEFAULT 0,
				expertise_score int(11) DEFAULT 0,
				authority_score int(11) DEFAULT 0,
				trust_score int(11) DEFAULT 0,
				overall_score int(11) DEFAULT 0,
				issues longtext,
				suggestions longtext,
				last_analyzed datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
				PRIMARY KEY  (id),
				KEY idx_post_id (post_id),
				KEY idx_score_type (score_type)
			) $charset_collate;";
			dbDelta( $sql_eeat_scores );

			// 7. Save default plugin options to wp_options
			$default_options = [
				'db_version' => self::VERSION,
				'setup_time' => current_time( 'mysql' ),
				'api_calls_this_month' => 0,
				'api_calls_last_reset' => current_time( 'Y-m' ),
			];
			if ( false === get_option( 'seo_copilot_settings' ) ) {
				add_option( 'seo_copilot_settings', $default_options );
			}
		}

		/**
		 * Plugin deactivation handler.
		 */
		public function deactivate() {
			// Clear any scheduled cron jobs associated with the plugin
			$crons = _get_cron_array();
			if ( empty( $crons ) ) {
				return;
			}

			foreach ( $crons as $timestamp => $cronhooks ) {
				foreach ( $cronhooks as $hook => $keys ) {
					// Identify CRON jobs specifically related to SEO Copilot
					if ( strpos( $hook, 'seo_copilot' ) !== false ) {
						wp_clear_scheduled_hook( $hook );
					}
				}
			}
		}

		/**
		 * Cloning is forbidden.
		 */
		public function __clone() {
			_doing_it_wrong( __FUNCTION__, 'Cheating huh?', '1.0.0' );
		}

		/**
		 * Unserializing instances of this class is forbidden.
		 */
		public function __wakeup() {
			_doing_it_wrong( __FUNCTION__, 'Cheating huh?', '1.0.0' );
		}
	}
}

/**
 * Returns the main instance of SEO_Copilot.
 *
 * @since  1.0.0
 * @return SEO_Copilot
 */
function seo_copilot() {
	return SEO_Copilot::instance();
}

// Global for backwards compatibility.
$GLOBALS['seo_copilot'] = seo_copilot();
