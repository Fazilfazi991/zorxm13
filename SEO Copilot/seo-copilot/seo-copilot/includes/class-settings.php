<?php
/**
 * Settings Class for SEO Copilot
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Settings' ) ) {

	class SEO_Copilot_Settings {

		const OPTION_NAME = 'seo_copilot_settings';

		public function __construct() {
			add_action( 'admin_menu', [ $this, 'add_plugin_page' ] );
			add_action( 'admin_init', [ $this, 'page_init' ] );
			add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
			
			// OAuth / Redirect parsing on page load
			add_action( 'admin_init', [ $this, 'process_oauth_callbacks' ] );
			
			add_action( 'wp_ajax_seo_copilot_test_connection', [ $this, 'ajax_test_connection' ] );
			add_action( 'wp_ajax_seo_copilot_reset_data', [ $this, 'ajax_reset_data' ] );
			add_action( 'wp_ajax_seo_copilot_clear_cache', [ $this, 'ajax_clear_cache' ] );
			// GA4 Disconnect AJAX
			add_action( 'wp_ajax_seo_copilot_ga4_disconnect', [ $this, 'ajax_ga4_disconnect' ] );
		}

		public function ajax_ga4_disconnect() {
			if ( ! current_user_can( 'manage_options' ) ) return;
			check_admin_referer( 'seo_copilot_admin_nonce', 'nonce' );
			
			$ga4_api = new SEO_Copilot_GA4_API();
			$ga4_api->disconnect();

			wp_redirect( admin_url( 'admin.php?page=seo-copilot-settings' ) );
			exit;
		}

		public function get_license_tier() {
			return get_option( 'seo_copilot_license_tier', 'free' );
		}

		public function is_byok() {
			return $this->get_license_tier() === 'free';
		}

		public function get_api_key( $provider ) {
			// If free tier: return user's saved key.
			// If pro/agency: return built-in key stored as PHP constant (placeholder logic applied here).
			// Requirement: "for now just return user key regardless"
			$options = get_option( self::OPTION_NAME );
			$key     = '';
			if ( 'claude' === $provider && ! empty( $options['claude_api_key'] ) ) {
				$key = $this->decrypt_data( $options['claude_api_key'] );
			} elseif ( 'gemini' === $provider && ! empty( $options['gemini_api_key'] ) ) {
				$key = $this->decrypt_data( $options['gemini_api_key'] );
			}
			return $key;
		}

		public function get_rate_limit() {
			$tier = $this->get_license_tier();
			if ( 'pro' === $tier ) return 500;
			if ( 'agency' === $tier ) return 2000;
			return null;
		}

		public function get_usage_count() {
			$usage_data = get_option( 'seo_copilot_monthly_usage', [ 'count' => 0, 'month' => date('Y-m') ] );
			if ( $usage_data['month'] !== date('Y-m') ) {
				$usage_data = [ 'count' => 0, 'month' => date('Y-m') ];
				update_option( 'seo_copilot_monthly_usage', $usage_data );
			}
			return $usage_data['count'];
		}

		public function increment_usage() {
			$limit = $this->get_rate_limit();
			if ( null === $limit ) {
				return true; // Free tier (BYOK), no limit applied.
			}

			$usage_data = get_option( 'seo_copilot_monthly_usage', [ 'count' => 0, 'month' => date('Y-m') ] );
			
			if ( $usage_data['month'] !== date('Y-m') ) {
				$usage_data = [ 'count' => 0, 'month' => date('Y-m') ];
			}

			if ( $usage_data['count'] >= $limit ) {
				return new \WP_Error( 'rate_limit_exceeded', 'You have reached your monthly AI call limit.' );
			}

			$usage_data['count']++;
			update_option( 'seo_copilot_monthly_usage', $usage_data );

			return true;
		}

		public function enqueue_admin_assets( $hook ) {
			// Load on any page that contains 'seo-copilot' in the hook, plus the post editor
			$is_plugin_page = strpos( $hook, 'seo-copilot' ) !== false;
			$is_post_editor = in_array( $hook, [ 'post.php', 'post-new.php' ], true );

			if ( ! $is_plugin_page && ! $is_post_editor ) {
				return;
			}

			wp_enqueue_style( 'seo-copilot-admin', SEO_COPILOT_PLUGIN_URL . 'admin/css/admin.css', [], SEO_COPILOT_VERSION );
			wp_enqueue_script( 'seo-copilot-admin', SEO_COPILOT_PLUGIN_URL . 'admin/js/admin.js', [ 'jquery' ], SEO_COPILOT_VERSION, true );
			wp_localize_script( 'seo-copilot-admin', 'seoCopilotAdmin', [
				'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
				'nonce'     => wp_create_nonce( 'seo_copilot_admin_nonce' ),
				'pluginUrl' => SEO_COPILOT_PLUGIN_URL,
				'tier'      => get_option( 'seo_copilot_license_tier', 'free' ),
			] );
		}

		public function add_plugin_page() {
			// Top-level menu — points to Dashboard
			add_menu_page(
				__( 'SEO Copilot', 'seo-copilot' ),
				__( 'SEO Copilot', 'seo-copilot' ),
				'manage_options',
				'seo-copilot',
				[ $this, 'render_dashboard_page' ],
				'dashicons-chart-line',
				80
			);

			// Rename the auto-created duplicate first submenu item to 'Dashboard'
			add_submenu_page( 'seo-copilot', __( 'Dashboard', 'seo-copilot' ), __( 'Dashboard', 'seo-copilot' ), 'manage_options', 'seo-copilot', [ $this, 'render_dashboard_page' ] );
			add_submenu_page( 'seo-copilot', __( 'Site Audit', 'seo-copilot' ), __( 'Site Audit', 'seo-copilot' ), 'manage_options', 'seo-copilot-audit', [ $this, 'render_site_audit_page' ] );
			add_submenu_page( 'seo-copilot', __( 'Content Decay', 'seo-copilot' ), __( 'Content Decay', 'seo-copilot' ), 'manage_options', 'seo-copilot-decay', [ $this, 'render_decay_page' ] );
			add_submenu_page( 'seo-copilot', __( 'Keyword Conflicts', 'seo-copilot' ), __( 'Keyword Conflicts', 'seo-copilot' ), 'manage_options', 'seo-copilot-conflicts', [ $this, 'render_cannibalization_page' ] );
			add_submenu_page( 'seo-copilot', __( 'Rank Tracker', 'seo-copilot' ), __( 'Rank Tracker', 'seo-copilot' ), 'manage_options', 'seo-copilot-rank-tracker', [ $this, 'render_rank_tracker_page' ] );
			add_submenu_page( 'seo-copilot', __( 'SEO Briefs', 'seo-copilot' ), __( 'SEO Briefs', 'seo-copilot' ), 'manage_options', 'seo-copilot-briefs', [ $this, 'render_briefs_page' ] );
			add_submenu_page( 'seo-copilot', __( 'Auto-Linker', 'seo-copilot' ), __( 'Auto-Linker', 'seo-copilot' ), 'manage_options', 'seo-copilot-auto-linker', [ $this, 'render_auto_linker_page' ] );
			add_submenu_page( 'seo-copilot', __( 'Readability', 'seo-copilot' ), __( 'Readability', 'seo-copilot' ), 'manage_options', 'seo-copilot-readability', [ $this, 'render_readability_page' ] );
			add_submenu_page( 'seo-copilot', __( 'Competitor Gap', 'seo-copilot' ), __( 'Competitor Gap', 'seo-copilot' ), 'manage_options', 'seo-copilot-competitor-gap', [ $this, 'render_competitor_gap_page' ] );

			$unread = seo_copilot_changelog()->get_unread_count();
			$badge = $unread > 0 ? ' <span class="update-plugins count-' . esc_attr($unread) . '"><span class="plugin-count">' . esc_html($unread) . '</span></span>' : '';
			add_submenu_page( 'seo-copilot', __( 'SEO Updates', 'seo-copilot' ), __( 'SEO Updates', 'seo-copilot' ) . $badge, 'manage_options', 'seo-copilot-changelog', [ $this, 'render_changelog_page' ] );

			if ( class_exists( 'WooCommerce' ) ) {
				add_submenu_page( 'seo-copilot', __( 'WooCommerce SEO', 'seo-copilot' ), __( 'WooCommerce SEO', 'seo-copilot' ), 'manage_options', 'seo-copilot-woocommerce', [ $this, 'render_woocommerce_page' ] );
			}

			add_submenu_page( 'seo-copilot', __( 'Intelligence Hub', 'seo-copilot' ), '<span style="color:#4F46E5;font-weight:700;">🧠 Intelligence</span>', 'manage_options', 'seo-copilot-intelligence', [ $this, 'render_intelligence_page' ] );
			add_submenu_page( 'seo-copilot', __( 'LLM Visibility', 'seo-copilot' ), '<span style="color:#10B981;font-weight:700;">🤖 LLM Visibility</span>', 'manage_options', 'seo-copilot-llm-tracker', [ $this, 'render_llm_tracker_page' ] );
			add_submenu_page( 'seo-copilot', __( 'AEO Optimizer', 'seo-copilot' ), '⚡ AEO Optimizer', 'manage_options', 'seo-copilot-aeo', [ $this, 'render_aeo_page' ] );
			add_submenu_page( 'seo-copilot', __( 'Topical Authority', 'seo-copilot' ), '🗺️ Topical Authority', 'manage_options', 'seo-copilot-topical', [ $this, 'render_topical_authority_page' ] );
			add_submenu_page( 'seo-copilot', __( 'E-E-A-T Builder', 'seo-copilot' ), '🏆 E-E-A-T Builder', 'manage_options', 'seo-copilot-eeat', [ $this, 'render_eeat_page' ] );
			add_submenu_page( 'seo-copilot', __( 'Client Reports', 'seo-copilot' ), __( 'Client Reports', 'seo-copilot' ), 'manage_options', 'seo-copilot-reports', [ $this, 'render_client_reports_page' ] );

			add_submenu_page( 'seo-copilot', __( 'Settings', 'seo-copilot' ), __( 'Settings', 'seo-copilot' ), 'manage_options', 'seo-copilot-settings', [ $this, 'create_admin_page' ] );
		}

		 * Helper: load a view file safely.
		 */
		private function load_view( $file ) {
			$path = SEO_COPILOT_PLUGIN_DIR . 'admin/views/' . $file;
			if ( file_exists( $path ) ) {
				require_once $path;
			} else {
				echo '<div class="wrap"><h1>' . esc_html( $file ) . '</h1><p style="color:red;">View file not found: admin/views/' . esc_html( $file ) . '</p></div>';
			}
		}

		public function render_dashboard_page()      { $this->load_view( 'dashboard.php' ); }
		public function render_site_audit_page()     { $this->load_view( 'site-audit.php' ); }
		public function render_decay_page()          { $this->load_view( 'decay.php' ); }
		public function render_cannibalization_page(){ $this->load_view( 'cannibalization.php' ); }
		public function render_rank_tracker_page()   { $this->load_view( 'rank-tracker.php' ); }
		public function render_briefs_page()         { $this->load_view( 'seo-brief.php' ); }
		public function render_auto_linker_page()    { $this->load_view( 'auto-linker.php' ); }
		public function render_readability_page()    { $this->load_view( 'readability.php' ); }
		public function render_competitor_gap_page() { $this->load_view( 'competitor-gap.php' ); }
		public function render_changelog_page()      { $this->load_view( 'seo-changelog.php' ); }
		public function render_woocommerce_page()    { $this->load_view( 'woocommerce-seo.php' ); }
		public function render_intelligence_page()   { $this->load_view( 'intelligence-hub.php' ); }
		public function render_llm_tracker_page()    { $this->load_view( 'llm-tracker.php' ); }
		public function render_aeo_page()            { $this->load_view( 'aeo-optimizer.php' ); }
		public function render_topical_authority_page() { $this->load_view( 'topical-authority.php' ); }
		public function render_eeat_page()           { $this->load_view( 'eeat-builder.php' ); }
		public function render_client_reports_page() {
			if ( isset( $_GET['action'] ) && $_GET['action'] === 'view' && ! empty( $_GET['id'] ) ) {
				$this->load_view( 'report-preview.php' );
			} else {
				$this->load_view( 'client-reports.php' );
			}
		}

		// Legacy aliases kept so old code doesn't break
		public function render_seo_briefs()     { $this->render_briefs_page(); }
		public function render_auto_linker()    { $this->render_auto_linker_page(); }
		public function render_readability()    { $this->render_readability_page(); }
		public function render_competitor_gap() { $this->render_competitor_gap_page(); }

		public function create_admin_page() {
			$this->load_view( 'settings.php' );
		}

		public function page_init() {
			register_setting( 'seo_copilot_option_group', self::OPTION_NAME, [ 'sanitize_callback' => [ $this, 'sanitize' ] ] );

			// Section 1: AI Configuration
			add_settings_section( 'setting_section_id_ai', __( 'AI Configuration', 'seo-copilot' ), [ $this, 'print_section_info_ai' ], 'seo-copilot-settings-page' );

			add_settings_field( 'ai_provider', __( 'AI Provider', 'seo-copilot' ), [ $this, 'ai_provider_callback' ], 'seo-copilot-settings-page', 'setting_section_id_ai' );

			// Claude Fields
			add_settings_field( 'claude_api_key', __( 'Claude API Key', 'seo-copilot' ), [ $this, 'claude_api_key_callback' ], 'seo-copilot-settings-page', 'setting_section_id_ai' );
			add_settings_field( 'claude_model', __( 'Claude Model', 'seo-copilot' ), [ $this, 'claude_model_callback' ], 'seo-copilot-settings-page', 'setting_section_id_ai' );

			// Gemini Fields
			add_settings_field( 'gemini_api_key', __( 'Gemini API Key', 'seo-copilot' ), [ $this, 'gemini_api_key_callback' ], 'seo-copilot-settings-page', 'setting_section_id_ai' );
			add_settings_field( 'gemini_model', __( 'Gemini Model', 'seo-copilot' ), [ $this, 'gemini_model_callback' ], 'seo-copilot-settings-page', 'setting_section_id_ai' );

			add_settings_field( 'test_connection', '', [ $this, 'test_connection_callback' ], 'seo-copilot-settings-page', 'setting_section_id_ai' );

			// Section 2: Rank Tracking & APIs
			add_settings_section( 'setting_section_id_gsc', __( 'Rank Tracking & APIs', 'seo-copilot' ), [ $this, 'print_section_info_gsc' ], 'seo-copilot-settings-page' );
			add_settings_field( 'gsc_client_id', __( 'GSC Client ID', 'seo-copilot' ), [ $this, 'gsc_client_id_callback' ], 'seo-copilot-settings-page', 'setting_section_id_gsc' );
			add_settings_field( 'gsc_client_secret', __( 'GSC Client Secret', 'seo-copilot' ), [ $this, 'gsc_client_secret_callback' ], 'seo-copilot-settings-page', 'setting_section_id_gsc' );
			add_settings_field( 'gsc_property_url', __( 'GSC Property URL', 'seo-copilot' ), [ $this, 'gsc_property_url_callback' ], 'seo-copilot-settings-page', 'setting_section_id_gsc' );
			add_settings_field( 'gsc_connect_button', '', [ $this, 'gsc_connect_button_callback' ], 'seo-copilot-settings-page', 'setting_section_id_gsc' );
			
			add_settings_field( 'dataforseo_email', __( 'DataForSEO Email', 'seo-copilot' ), [ $this, 'dataforseo_email_callback' ], 'seo-copilot-settings-page', 'setting_section_id_gsc' );
			add_settings_field( 'dataforseo_password', __( 'DataForSEO Password', 'seo-copilot' ), [ $this, 'dataforseo_password_callback' ], 'seo-copilot-settings-page', 'setting_section_id_gsc' );
			
			// GA4 & LLM Tracker APIs
			add_settings_field( 'ga4_connect_button', __( 'Google Analytics 4', 'seo-copilot' ), [ $this, 'ga4_connect_button_callback' ], 'seo-copilot-settings-page', 'setting_section_id_gsc' );
			add_settings_field( 'llm_check_frequency', __( 'LLM Check Frequency', 'seo-copilot' ), [ $this, 'llm_check_frequency_callback' ], 'seo-copilot-settings-page', 'setting_section_id_gsc' );

			// Section 3: Analysis Preferences
			add_settings_section( 'setting_section_id_analysis', __( 'Analysis Preferences', 'seo-copilot' ), [ $this, 'print_section_info_analysis' ], 'seo-copilot-settings-page' );
			add_settings_field( 'post_types', __( 'Post Types to Analyze', 'seo-copilot' ), [ $this, 'post_types_callback' ], 'seo-copilot-settings-page', 'setting_section_id_analysis' );
			add_settings_field( 'auto_analyze', __( 'Auto-analyze on publish', 'seo-copilot' ), [ $this, 'auto_analyze_callback' ], 'seo-copilot-settings-page', 'setting_section_id_analysis' );
			add_settings_field( 'min_word_count', __( 'Minimum Word Count', 'seo-copilot' ), [ $this, 'min_word_count_callback' ], 'seo-copilot-settings-page', 'setting_section_id_analysis' );

			// Section 4: Alerts & Notifications
			add_settings_section( 'setting_section_id_alerts', __( 'Alerts & Notifications', 'seo-copilot' ), [ $this, 'print_section_info_alerts' ], 'seo-copilot-settings-page' );
			add_settings_field( 'email_alerts', __( 'Email Alerts', 'seo-copilot' ), [ $this, 'email_alerts_callback' ], 'seo-copilot-settings-page', 'setting_section_id_alerts' );
			add_settings_field( 'alert_email', __( 'Alert Email Address', 'seo-copilot' ), [ $this, 'alert_email_callback' ], 'seo-copilot-settings-page', 'setting_section_id_alerts' );
			add_settings_field( 'weekly_digest_day', __( 'Weekly Digest Day', 'seo-copilot' ), [ $this, 'weekly_digest_day_callback' ], 'seo-copilot-settings-page', 'setting_section_id_alerts' );
			add_settings_field( 'content_decay_threshold', __( 'Content Decay Threshold (%)', 'seo-copilot' ), [ $this, 'content_decay_threshold_callback' ], 'seo-copilot-settings-page', 'setting_section_id_alerts' );

			// Section 5: Agency & White Label
			add_settings_section( 'setting_section_id_agency', __( 'Agency & White Label', 'seo-copilot' ), [ $this, 'print_section_info_agency' ], 'seo-copilot-settings-page' );
			add_settings_field( 'agency_name', __( 'Agency Name', 'seo-copilot' ), [ $this, 'agency_name_callback' ], 'seo-copilot-settings-page', 'setting_section_id_agency' );
			add_settings_field( 'agency_logo', __( 'Agency Logo URL', 'seo-copilot' ), [ $this, 'agency_logo_callback' ], 'seo-copilot-settings-page', 'setting_section_id_agency' );
			add_settings_field( 'agency_color', __( 'Brand Color', 'seo-copilot' ), [ $this, 'agency_color_callback' ], 'seo-copilot-settings-page', 'setting_section_id_agency' );
			add_settings_field( 'agency_email', __( 'Agency Email', 'seo-copilot' ), [ $this, 'agency_email_callback' ], 'seo-copilot-settings-page', 'setting_section_id_agency' );
			add_settings_field( 'agency_website', __( 'Agency Website', 'seo-copilot' ), [ $this, 'agency_website_callback' ], 'seo-copilot-settings-page', 'setting_section_id_agency' );
			add_settings_field( 'white_label', __( 'Remove SEO Copilot Branding', 'seo-copilot' ), [ $this, 'white_label_callback' ], 'seo-copilot-settings-page', 'setting_section_id_agency' );
			add_settings_field( 'report_intro', __( 'Default Report Intro', 'seo-copilot' ), [ $this, 'report_intro_callback' ], 'seo-copilot-settings-page', 'setting_section_id_agency' );
		}

		public function process_oauth_callbacks() {
			if ( isset( $_GET['code'] ) && isset( $_GET['state'] ) && isset( $_GET['page'] ) && 'seo-copilot-settings' === $_GET['page'] ) {
				$state = sanitize_text_field( wp_unslash( $_GET['state'] ) );
				
				// Handle GSC
				if ( $state === get_transient( 'seo_copilot_gsc_state' ) ) {
					$api = new SEO_Copilot_GSC_API();
					$res = $api->handle_oauth_callback( sanitize_text_field( wp_unslash( $_GET['code'] ) ) );
					if ( is_wp_error( $res ) ) {
						add_settings_error( 'seo_copilot_messages', 'gsc_error', $res->get_error_message(), 'error' );
					} else {
						add_settings_error( 'seo_copilot_messages', 'gsc_success', __( 'Successfully connected to Google Search Console.', 'seo-copilot' ), 'success' );
					}
					delete_transient( 'seo_copilot_gsc_state' );
				}

				// Handle GA4
				if ( $state === get_transient( 'seo_copilot_ga4_state' ) ) {
					$api = new SEO_Copilot_GA4_API();
					$res = $api->handle_oauth_callback( sanitize_text_field( wp_unslash( $_GET['code'] ) ) );
					if ( is_wp_error( $res ) ) {
						add_settings_error( 'seo_copilot_messages', 'ga4_error', $res->get_error_message(), 'error' );
					} else {
					    // Automatically fetch and set the first property
					    $props = $api->get_property_list();
					    if (!is_wp_error($props) && !empty($props)) {
					        $api->set_active_property($props[0]['name'], $props[0]['displayName']);
					    }
						add_settings_error( 'seo_copilot_messages', 'ga4_success', __( 'Successfully connected to Google Analytics 4.', 'seo-copilot' ), 'success' );
					}
					delete_transient( 'seo_copilot_ga4_state' );
				}
			}
		}

		public function sanitize( $input ) {
			$new_input = [];
			$old_options = get_option( self::OPTION_NAME, [] );
			if ( ! is_array( $old_options ) ) $old_options = [];
			$new_input = array_merge( $old_options, $new_input );

			if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'seo-copilot-options' ) ) {
				add_settings_error( 'seo_copilot_messages', 'seo_copilot_message', __( 'Security check failed.', 'seo-copilot' ), 'error' );
				return $old_options;
			}

			if ( isset( $input['ai_provider'] ) ) {
				$new_input['ai_provider'] = in_array( $input['ai_provider'], ['claude', 'gemini'], true ) ? $input['ai_provider'] : 'claude';
			}

			// Claude
			if ( isset( $input['claude_api_key'] ) ) {
				$api_key = wp_unslash( $input['claude_api_key'] );
				if ( strpos( $api_key, '********' ) !== false ) {
					$new_input['claude_api_key'] = isset( $old_options['claude_api_key'] ) ? $old_options['claude_api_key'] : '';
				} else {
					$new_input['claude_api_key'] = $this->encrypt_data( sanitize_text_field( $api_key ) );
				}
			}
			if ( isset( $input['claude_model'] ) ) {
				$allowed_models = [ 'claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-haiku-4-5-20251001' ];
				$new_input['claude_model'] = in_array( $input['claude_model'], $allowed_models, true ) ? $input['claude_model'] : 'claude-sonnet-4-20250514';
			}

			// Gemini
			if ( isset( $input['gemini_api_key'] ) ) {
				$api_key = wp_unslash( $input['gemini_api_key'] );
				if ( strpos( $api_key, '********' ) !== false ) {
					$new_input['gemini_api_key'] = isset( $old_options['gemini_api_key'] ) ? $old_options['gemini_api_key'] : '';
				} else {
					$new_input['gemini_api_key'] = $this->encrypt_data( sanitize_text_field( $api_key ) );
				}
			}
			if ( isset( $input['gemini_model'] ) ) {
				$allowed_models = [ 'gemini-2.0-flash', 'gemini-2.0-pro' ];
				$new_input['gemini_model'] = in_array( $input['gemini_model'], $allowed_models, true ) ? $input['gemini_model'] : 'gemini-2.0-flash';
			}

			// External tracking APIs (Removed OpenAI/Perplexity, moving to AI Factory)

			if ( isset( $input['llm_check_frequency'] ) ) {
				$allowed_freqs = [ 'weekly', 'biweekly', 'monthly' ];
				$new_input['llm_check_frequency'] = in_array( $input['llm_check_frequency'], $allowed_freqs, true ) ? $input['llm_check_frequency'] : 'weekly';
			}

			$new_input['gsc_property_url'] = isset( $input['gsc_property_url'] ) ? esc_url_raw( $input['gsc_property_url'] ) : '';
			$new_input['post_types'] = ( isset( $input['post_types'] ) && is_array( $input['post_types'] ) ) ? array_map( 'sanitize_text_field', $input['post_types'] ) : [];
			$new_input['auto_analyze'] = isset( $input['auto_analyze'] ) ? 'yes' : 'no';
			$new_input['min_word_count'] = isset( $input['min_word_count'] ) ? absint( $input['min_word_count'] ) : 300;
			$new_input['email_alerts'] = isset( $input['email_alerts'] ) ? 'yes' : 'no';
			
			if ( isset( $input['alert_email'] ) ) {
				$email = sanitize_email( $input['alert_email'] );
				$new_input['alert_email'] = is_email( $email ) ? $email : get_option( 'admin_email' );
			}

			if ( isset( $input['weekly_digest_day'] ) ) {
				$allowed_days = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];
				$new_input['weekly_digest_day'] = in_array( $input['weekly_digest_day'], $allowed_days, true ) ? $input['weekly_digest_day'] : 'Monday';
			}

			if ( isset( $input['content_decay_threshold'] ) ) {
				$threshold = intval( $input['content_decay_threshold'] );
				$new_input['content_decay_threshold'] = ( $threshold >= 10 && $threshold <= 50 ) ? $threshold : 20;
			}

			// Agency Settings
			$new_input['agency_name'] = isset( $input['agency_name'] ) ? sanitize_text_field( $input['agency_name'] ) : '';
			$new_input['agency_logo'] = isset( $input['agency_logo'] ) ? esc_url_raw( $input['agency_logo'] ) : '';
			$new_input['agency_color'] = isset( $input['agency_color'] ) ? sanitize_hex_color( $input['agency_color'] ) : '#4F46E5';
			
			if ( isset( $input['agency_email'] ) ) {
				$email = sanitize_email( $input['agency_email'] );
				$new_input['agency_email'] = is_email( $email ) ? $email : '';
			} else {
				$new_input['agency_email'] = '';
			}

			$new_input['agency_website'] = isset( $input['agency_website'] ) ? esc_url_raw( $input['agency_website'] ) : '';
			$new_input['white_label']    = isset( $input['white_label'] ) ? 'yes' : 'no';
			$new_input['report_intro']   = isset( $input['report_intro'] ) ? sanitize_textarea_field( $input['report_intro'] ) : '';

			add_settings_error( 'seo_copilot_messages', 'seo_copilot_message', __( 'Settings Saved', 'seo-copilot' ), 'updated' );
			return $new_input;
		}

		public function print_section_info_ai() { 
			$tier = $this->get_license_tier();
			if ( 'free' === $tier ) {
				echo '<div class="notice notice-info inline" style="margin-top:10px;"><p>&#8505;&#65039; ' . esc_html__( "You're on the Free plan. Enter your own API keys from Anthropic and/or Google to use AI features.", 'seo-copilot' ) . '</p></div>';
				echo '<p><a href="https://console.anthropic.com" target="_blank">Get Claude API key &rarr;</a> | <a href="https://makersuite.google.com" target="_blank">Get Gemini API key &rarr;</a></p>';
			} else {
				echo '<div class="notice notice-success inline" style="margin-top:10px;"><p>&#9989; ' . esc_html__( "AI is configured and ready. No API key needed on your plan.", 'seo-copilot' ) . '</p></div>';
			}
		}
		public function print_section_info_gsc() { echo '<p>' . esc_html__( 'Connect your Google Search Console to import real keyword data.', 'seo-copilot' ) . '</p>'; }
		public function print_section_info_analysis() { echo '<p>' . esc_html__( 'Set your preferences for SEO analysis.', 'seo-copilot' ) . '</p>'; }
		public function print_section_info_alerts() { echo '<p>' . esc_html__( 'Manage notifications and content decay alerts.', 'seo-copilot' ) . '</p>'; }
		public function print_section_info_agency() { echo '<p>' . esc_html__( 'Configure your agency branding for client reports.', 'seo-copilot' ) . '</p>'; }

		public function ai_provider_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['ai_provider'] ) ? $options['ai_provider'] : 'claude';
			
			$providers = [
				'claude' => 'Claude (Anthropic)',
				'gemini' => 'Gemini (Google)',
			];
			
			echo '<select id="ai_provider" name="' . esc_attr( self::OPTION_NAME ) . '[ai_provider]"> ';
			foreach ( $providers as $key => $label ) {
				printf( '<option value="%s" %s>%s</option>', esc_attr( $key ), selected( $val, $key, false ), esc_html( $label ) );
			}
			echo '</select>';
			echo '<p class="description">' . esc_html__( 'Select which AI provider should power SEO Copilot features.', 'seo-copilot' ) . '</p>';
		}

		public function claude_api_key_callback() {
			if ( ! $this->is_byok() ) return;
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['claude_api_key'] ) && ! empty( $options['claude_api_key'] ) ? '********' : '';
			printf( '<input type="password" id="claude_api_key" name="%s[claude_api_key]" value="%s" class="regular-text" placeholder="sk-ant-api..." />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function claude_model_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['claude_model'] ) ? $options['claude_model'] : 'claude-sonnet-4-20250514';
			$models = [
				'claude-sonnet-4-20250514' => 'Claude Sonnet 4 — Recommended',
				'claude-opus-4-20250514'   => 'Claude Opus 4 — Most Powerful',
				'claude-haiku-4-5-20251001'   => 'Claude Haiku 4.5 — Fastest',
			];
			echo '<select id="claude_model" name="' . esc_attr( self::OPTION_NAME ) . '[claude_model]">';
			foreach ( $models as $key => $label ) {
				printf( '<option value="%s" %s>%s</option>', esc_attr( $key ), selected( $val, $key, false ), esc_html( $label ) );
			}
			echo '</select>';
		}

		public function gemini_api_key_callback() {
			if ( ! $this->is_byok() ) return;
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['gemini_api_key'] ) && ! empty( $options['gemini_api_key'] ) ? '********' : '';
			printf( '<input type="password" id="gemini_api_key" name="%s[gemini_api_key]" value="%s" class="regular-text" placeholder="AIzaSy..." />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function gemini_model_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['gemini_model'] ) ? $options['gemini_model'] : 'gemini-2.0-flash';
			$models = [
				'gemini-2.0-flash' => 'Gemini 2.0 Flash (Recommended)',
				'gemini-2.0-pro'   => 'Gemini 2.0 Pro',
			];
			echo '<select id="gemini_model" name="' . esc_attr( self::OPTION_NAME ) . '[gemini_model]">';
			foreach ( $models as $key => $label ) {
				printf( '<option value="%s" %s>%s</option>', esc_attr( $key ), selected( $val, $key, false ), esc_html( $label ) );
			}
			echo '</select>';
		}

		public function test_connection_callback() {
			echo '<button type="button" class="button button-secondary" id="seo-copilot-test-api">' . esc_html__( 'Test Connection for Selected Provider', 'seo-copilot' ) . '</button>';
			echo '<span id="seo-copilot-test-result" style="margin-left: 10px;"></span>';
		}

		public function gsc_client_id_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['gsc_client_id'] ) ? $options['gsc_client_id'] : '';
			printf( '<input type="text" id="gsc_client_id" name="%s[gsc_client_id]" value="%s" class="regular-text" />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function gsc_client_secret_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['gsc_client_secret'] ) ? $options['gsc_client_secret'] : '';
			printf( '<input type="password" id="gsc_client_secret" name="%s[gsc_client_secret]" value="%s" class="regular-text" />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function gsc_property_url_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['gsc_property_url'] ) ? $options['gsc_property_url'] : '';
			printf( '<input type="url" id="gsc_property_url" name="%s[gsc_property_url]" value="%s" class="regular-text" placeholder="https://example.com/" />', esc_attr( self::OPTION_NAME ), esc_url( $val ) );
		}
		
		public function gsc_connect_button_callback() {
			$options = get_option( self::OPTION_NAME );
			if ( ! empty( $options['gsc_client_id'] ) ) {
				$gsc_api = new SEO_Copilot_GSC_API();
				$connected = $gsc_api->is_connected();
				if ( $connected ) {
					echo '<span style="color:#008a20; font-weight:bold;"><span class="dashicons dashicons-yes-alt"></span> Connected (' . esc_html( $connected ) . ')</span>';
					echo '<a href="' . esc_url( $gsc_api->get_auth_url() ) . '" class="button button-small" style="margin-left: 12px;">Reconnect</a>';
				} else {
					echo '<a href="' . esc_url( $gsc_api->get_auth_url() ) . '" class="button button-primary"><span class="dashicons dashicons-google" style="margin-top:2px;"></span> Connect GSC Account</a>';
				}
			} else {
				echo '<button type="button" class="button button-secondary" disabled>' . esc_html__( 'Add Client Info First', 'seo-copilot' ) . '</button>';
				echo '<p class="description">' . esc_html__( 'Save your OAuth Client ID & Secret above to generate the connection button.', 'seo-copilot' ) . '</p>';
			}
		}

		public function dataforseo_email_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['dataforseo_email'] ) ? $options['dataforseo_email'] : '';
			printf( '<input type="email" id="dataforseo_email" name="%s[dataforseo_email]" value="%s" class="regular-text" />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function dataforseo_password_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = ! empty( $options['dataforseo_password'] ) ? '********' : '';
			printf( '<input type="password" id="dataforseo_password" name="%s[dataforseo_password]" value="%s" class="regular-text" placeholder="Leave blank to keep existing" />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function ga4_connect_button_callback() {
			$options = get_option( self::OPTION_NAME );
			$ga4_api = new SEO_Copilot_GA4_API();
			$connected = $ga4_api->is_connected();
			
			if ( $connected ) {
				echo '<p><span style="color:#008a20; font-weight:bold;"><span class="dashicons dashicons-yes-alt"></span> Connected (' . esc_html( $connected ) . ')</span></p>';
				echo '<p><a href="' . esc_url( admin_url('admin-ajax.php?action=seo_copilot_ga4_disconnect&nonce='.wp_create_nonce('seo_copilot_admin_nonce')) ) . '" class="button button-small" style="color:#bc0b0b;">Disconnect GA4</a></p>';
			} else {
			    if ( ! empty( $options['gsc_client_id'] ) ) {
				    echo '<a href="' . esc_url( $ga4_api->get_auth_url() ) . '" class="button button-primary"><span class="dashicons dashicons-analytics" style="margin-top:2px;"></span> Connect Google Analytics 4</a>';
				} else {
				    echo '<button type="button" class="button button-secondary" disabled>' . esc_html__( 'Add Client Info First', 'seo-copilot' ) . '</button>';
				    echo '<p class="description">' . esc_html__( 'Save your OAuth Client ID & Secret above to generate the connection button.', 'seo-copilot' ) . '</p>';
				}
			}
		}

		public function llm_check_frequency_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['llm_check_frequency'] ) ? $options['llm_check_frequency'] : 'weekly';
			$periods = [
				'weekly'   => 'Weekly',
				'biweekly' => 'Bi-Weekly',
				'monthly'  => 'Monthly'
			];
			echo '<select id="llm_check_frequency" name="' . esc_attr( self::OPTION_NAME ) . '[llm_check_frequency]">';
			foreach ( $periods as $key => $label ) {
				printf( '<option value="%s" %s>%s</option>', esc_attr( $key ), selected( $val, $key, false ), esc_html( $label ) );
			}
			echo '</select>';
			echo '<p class="description">How often SEO Copilot automatically runs LLM visibility tracking.</p>';
		}

		public function post_types_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['post_types'] ) ? $options['post_types'] : [ 'post', 'page' ];
			$post_types = get_post_types( [ 'public' => true ], 'objects' );
			$exclude = [ 'attachment', 'revision', 'nav_menu_item', 'wp_block', 'wp_template', 'wp_template_part', 'wp_navigation', 'wp_global_styles' ];
			foreach ( $post_types as $post_type ) {
				if ( in_array( $post_type->name, $exclude, true ) ) continue;
				$checked = in_array( $post_type->name, $val, true ) ? 'checked="checked"' : '';
				printf( '<label><input type="checkbox" name="%s[post_types][]" value="%s" %s /> %s</label><br>', esc_attr( self::OPTION_NAME ), esc_attr( $post_type->name ), $checked, esc_html( $post_type->label ) );
			}
		}

		public function auto_analyze_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['auto_analyze'] ) ? $options['auto_analyze'] : 'no';
			printf( '<label class="seo-copilot-switch"><input type="checkbox" id="auto_analyze" name="%s[auto_analyze]" value="yes" %s /><span class="seo-copilot-slider round"></span></label>', esc_attr( self::OPTION_NAME ), checked( $val, 'yes', false ) );
		}

		public function min_word_count_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['min_word_count'] ) ? $options['min_word_count'] : 300;
			printf( '<input type="number" id="min_word_count" name="%s[min_word_count]" value="%s" class="small-text" min="0" step="10" /> %s', esc_attr( self::OPTION_NAME ), esc_attr( $val ), esc_html__( 'words', 'seo-copilot' ) );
		}

		public function email_alerts_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['email_alerts'] ) ? $options['email_alerts'] : 'no';
			printf( '<label class="seo-copilot-switch"><input type="checkbox" id="email_alerts" name="%s[email_alerts]" value="yes" %s /><span class="seo-copilot-slider round"></span></label>', esc_attr( self::OPTION_NAME ), checked( $val, 'yes', false ) );
		}

		public function alert_email_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['alert_email'] ) && ! empty( $options['alert_email'] ) ? $options['alert_email'] : get_option( 'admin_email' );
			printf( '<input type="email" id="alert_email" name="%s[alert_email]" value="%s" class="regular-text" />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function weekly_digest_day_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['weekly_digest_day'] ) ? $options['weekly_digest_day'] : 'Monday';
			$days    = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];
			echo '<select id="weekly_digest_day" name="' . esc_attr( self::OPTION_NAME ) . '[weekly_digest_day]">';
			foreach ( $days as $day ) {
				printf( '<option value="%s" %s>%s</option>', esc_attr( $day ), selected( $val, $day, false ), esc_html( $day ) );
			}
			echo '</select>';
		}

		public function content_decay_threshold_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['content_decay_threshold'] ) ? $options['content_decay_threshold'] : 20;
			printf( '<div class="seo-copilot-slider-container"><input type="range" id="content_decay_threshold" name="%s[content_decay_threshold]" min="10" max="50" value="%s" class="seo-copilot-range-slider" oninput="document.getElementById(\'threshold_output\').value = this.value" /><output id="threshold_output">%s</output>%%</div><p class="description">%s</p>', esc_attr( self::OPTION_NAME ), esc_attr( $val ), esc_attr( $val ), esc_html__( 'Trigger an alert when traffic or rankings drop by this percentage.', 'seo-copilot' ) );
		}

		public function agency_name_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['agency_name'] ) ? $options['agency_name'] : '';
			printf( '<input type="text" id="agency_name" name="%s[agency_name]" value="%s" class="regular-text" placeholder="e.g. Acme Marketing" />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function agency_logo_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['agency_logo'] ) ? $options['agency_logo'] : '';
			printf( '<input type="url" id="agency_logo" name="%s[agency_logo]" value="%s" class="regular-text" placeholder="https://example.com/logo.png" />', esc_attr( self::OPTION_NAME ), esc_url( $val ) );
		}

		public function agency_color_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['agency_color'] ) ? $options['agency_color'] : '#4F46E5';
			printf( '<input type="color" id="agency_color" name="%s[agency_color]" value="%s" />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function agency_email_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['agency_email'] ) ? $options['agency_email'] : '';
			printf( '<input type="email" id="agency_email" name="%s[agency_email]" value="%s" class="regular-text" placeholder="hello@acme.com" />', esc_attr( self::OPTION_NAME ), esc_attr( $val ) );
		}

		public function agency_website_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['agency_website'] ) ? $options['agency_website'] : '';
			printf( '<input type="url" id="agency_website" name="%s[agency_website]" value="%s" class="regular-text" placeholder="https://acme.com" />', esc_attr( self::OPTION_NAME ), esc_url( $val ) );
		}

		public function white_label_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['white_label'] ) ? $options['white_label'] : 'no';
			printf( '<label class="seo-copilot-switch"><input type="checkbox" id="white_label" name="%s[white_label]" value="yes" %s /><span class="seo-copilot-slider round"></span></label>', esc_attr( self::OPTION_NAME ), checked( $val, 'yes', false ) );
			echo '<p class="description">' . esc_html__( 'Removes "Generated by SEO Copilot" from the footer of client reports. (Pro/Agency only)', 'seo-copilot' ) . '</p>';
		}

		public function report_intro_callback() {
			$options = get_option( self::OPTION_NAME );
			$val     = isset( $options['report_intro'] ) ? $options['report_intro'] : 'Here is your monthly SEO performance report summarizing key wins, technical health, and content visibility over the past period.';
			printf( '<textarea id="report_intro" name="%s[report_intro]" rows="4" class="large-text">%s</textarea>', esc_attr( self::OPTION_NAME ), esc_textarea( $val ) );
		}

		public function ajax_test_connection() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( [ 'message' => __( 'Permission denied.', 'seo-copilot' ) ] );
			}

			// Factory handles returning the correct initialized class based on saved options
			$ai_provider = SEO_Copilot_AI_Factory::get_provider();
			$status      = $ai_provider->test_connection();

			if ( is_wp_error( $status ) ) {
				wp_send_json_error( [ 'message' => $status->get_error_message() ] );
			}

			wp_send_json_success( [ 'message' => __( 'Connection successful!', 'seo-copilot' ) ] );
		}

		public function ajax_reset_data() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

			global $wpdb;
			$tables = [
				$wpdb->prefix . 'seo_copilot_scores',
				$wpdb->prefix . 'seo_copilot_keywords',
				$wpdb->prefix . 'seo_copilot_activity',
				$wpdb->prefix . 'seo_copilot_conflicts',
				$wpdb->prefix . 'seo_copilot_score_history',
				$wpdb->prefix . 'seo_copilot_tracked_keywords',
				$wpdb->prefix . 'seo_copilot_rank_history',
				$wpdb->prefix . 'seo_copilot_gsc_data',
				$wpdb->prefix . 'seo_copilot_briefs',
				$wpdb->prefix . 'seo_copilot_keyword_map',
				$wpdb->prefix . 'seo_copilot_auto_links',
				$wpdb->prefix . 'seo_copilot_competitor_analyses'
			];

			foreach ( $tables as $table ) {
				$wpdb->query( "TRUNCATE TABLE $table" );
			}

			wp_send_json_success( [ 'message' => 'All SEO Copilot data has been reset.' ] );
		}

		public function ajax_clear_cache() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

			global $wpdb;
			$cache_count = $wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_seo_copilot_%' OR option_name LIKE '_transient_timeout_seo_copilot_%'" );

			wp_send_json_success( [ 'message' => "Cache cleared — $cache_count transients removed." ] );
		}

		private function encrypt_data( $data ) {
			if ( empty( $data ) ) return '';
			$key = defined( 'AUTH_KEY' ) ? AUTH_KEY : 'default-fallback-key-do-not-use-in-prod';
			$iv  = defined( 'NONCE_KEY' ) ? substr( NONCE_KEY, 0, 16 ) : str_repeat( '0', 16 );
			if ( function_exists( 'openssl_encrypt' ) ) {
				$encrypted = openssl_encrypt( $data, 'AES-256-CBC', $key, 0, $iv );
				if ( $encrypted !== false ) return base64_encode( $encrypted );
			}
			return base64_encode( $data . '::SEO_COPILOT_FALLBACK_ENC::' );
		}

		public function decrypt_data( $data ) {
			if ( empty( $data ) ) return '';
			$key = defined( 'AUTH_KEY' ) ? AUTH_KEY : 'default-fallback-key-do-not-use-in-prod';
			$iv  = defined( 'NONCE_KEY' ) ? substr( NONCE_KEY, 0, 16 ) : str_repeat( '0', 16 );
			$decoded = base64_decode( $data );
			if ( function_exists( 'openssl_decrypt' ) && strpos( $decoded, '::SEO_COPILOT_FALLBACK_ENC::' ) === false ) {
				return openssl_decrypt( $decoded, 'AES-256-CBC', $key, 0, $iv );
			}
			return str_replace( '::SEO_COPILOT_FALLBACK_ENC::', '', $decoded );
		}
	}
}

new SEO_Copilot_Settings();
