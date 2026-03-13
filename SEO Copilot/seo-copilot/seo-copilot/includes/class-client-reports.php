<?php
/**
 * Client Reports Core Logic
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

class SEO_Copilot_Client_Reports {

	/**
	 * Instance of this class.
	 *
	 * @var SEO_Copilot_Client_Reports
	 */
	protected static $instance = null;

	/**
	 * Get the singleton instance.
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'wp_ajax_seo_copilot_create_client', [ $this, 'ajax_create_client' ] );
		add_action( 'wp_ajax_seo_copilot_update_client', [ $this, 'ajax_update_client' ] );
		add_action( 'wp_ajax_seo_copilot_delete_client', [ $this, 'ajax_delete_client' ] );
		add_action( 'wp_ajax_seo_copilot_get_clients', [ $this, 'ajax_get_clients' ] );
		add_action( 'wp_ajax_seo_copilot_generate_report', [ $this, 'ajax_generate_report' ] );
		add_action( 'wp_ajax_seo_copilot_send_report_email', [ $this, 'ajax_send_report_email' ] );
		add_action( 'wp_ajax_seo_copilot_delete_report', [ $this, 'ajax_delete_report' ] );
	}

	/* ==========================================================================
	 * CLIENT CRUD
	 * ========================================================================== */

	/**
	 * Get all clients.
	 */
	public function get_clients() {
		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_clients';
		$results = $wpdb->get_results( "SELECT * FROM $table ORDER BY created_at DESC", ARRAY_A );
		return $results ? $results : [];
	}

	/**
	 * Create a client.
	 */
	public function create_client( $data ) {
		global $wpdb;

		if ( empty( $data['name'] ) || empty( $data['email'] ) ) {
			return new WP_Error( 'missing_fields', __( 'Name and email are required.', 'seo-copilot' ) );
		}

		$table = $wpdb->prefix . 'seo_copilot_clients';
		$insert_data = [
			'name'        => sanitize_text_field( $data['name'] ),
			'email'       => sanitize_email( $data['email'] ),
			'company'     => isset( $data['company'] ) ? sanitize_text_field( $data['company'] ) : '',
			'website_url' => isset( $data['website_url'] ) ? esc_url_raw( $data['website_url'] ) : '',
			'logo_url'    => isset( $data['logo_url'] ) ? esc_url_raw( $data['logo_url'] ) : '',
			'brand_color' => isset( $data['brand_color'] ) ? sanitize_hex_color( $data['brand_color'] ) : '#4F46E5',
			'notes'       => isset( $data['notes'] ) ? sanitize_textarea_field( $data['notes'] ) : '',
			'created_at'  => current_time( 'mysql' ),
		];

		$wpdb->insert( $table, $insert_data );

		if ( $wpdb->insert_id ) {
			return $wpdb->insert_id;
		}

		return new WP_Error( 'db_error', __( 'Could not create client.', 'seo-copilot' ) );
	}

	/**
	 * Update a client.
	 */
	public function update_client( $id, $data ) {
		global $wpdb;

		if ( empty( $data['name'] ) || empty( $data['email'] ) ) {
			return new WP_Error( 'missing_fields', __( 'Name and email are required.', 'seo-copilot' ) );
		}

		$table = $wpdb->prefix . 'seo_copilot_clients';
		$update_data = [
			'name'        => sanitize_text_field( $data['name'] ),
			'email'       => sanitize_email( $data['email'] ),
			'company'     => isset( $data['company'] ) ? sanitize_text_field( $data['company'] ) : '',
			'website_url' => isset( $data['website_url'] ) ? esc_url_raw( $data['website_url'] ) : '',
			'logo_url'    => isset( $data['logo_url'] ) ? esc_url_raw( $data['logo_url'] ) : '',
			'brand_color' => isset( $data['brand_color'] ) ? sanitize_hex_color( $data['brand_color'] ) : '#4F46E5',
			'notes'       => isset( $data['notes'] ) ? sanitize_textarea_field( $data['notes'] ) : '',
		];

		$result = $wpdb->update( $table, $update_data, [ 'id' => intval( $id ) ] );

		if ( false !== $result ) {
			return true;
		}

		return new WP_Error( 'db_error', __( 'Could not update client.', 'seo-copilot' ) );
	}

	/**
	 * Delete a client.
	 */
	public function delete_client( $id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_clients';
		$result = $wpdb->delete( $table, [ 'id' => intval( $id ) ] );
		
		// Optionally, also delete their reports? We will leave them or we should CASCADE.
		if ( false !== $result ) {
			$wpdb->delete( $wpdb->prefix . 'seo_copilot_reports', [ 'client_id' => intval( $id ) ] );
			return true;
		}
		return new WP_Error( 'db_error', __( 'Could not delete client.', 'seo-copilot' ) );
	}

	/* ==========================================================================
	 * REPORT GENERATION & DATA GATHERING
	 * ========================================================================== */

	/**
	 * Generate Report Data
	 */
	public function generate_report( $client_id, $report_name, $report_type, $date_from, $date_to, $sections, $branding ) {
		// Mock delay for heavy AI lifting
		// In reality, this aggregates data from the other DB tables based on the date_from/to

		$report_data = [];

		if ( in_array( 'executive_summary', $sections ) ) {
			$report_data['executive_summary'] = $this->generate_executive_summary();
		}

		if ( in_array( 'seo_health_score', $sections ) ) {
			$report_data['seo_health_score'] = $this->get_seo_health_data();
		}

		if ( in_array( 'keyword_rankings', $sections ) ) {
			$report_data['keyword_rankings'] = $this->get_keyword_rankings_data();
		}

		if ( in_array( 'content_performance', $sections ) ) {
			$report_data['content_performance'] = $this->get_content_performance_data();
		}

		if ( in_array( 'technical_issues', $sections ) ) {
			$report_data['technical_issues'] = $this->get_technical_issues_data();
		}

		if ( in_array( 'content_decay', $sections ) ) {
			$report_data['content_decay'] = $this->get_content_decay_data();
		}

		if ( in_array( 'schema_coverage', $sections ) ) {
			$report_data['schema_coverage'] = $this->get_schema_coverage_data();
		}

		if ( in_array( 'recommendations', $sections ) ) {
			$report_data['recommendations'] = $this->generate_recommendations();
		}

		// Save report
		$report_id = $this->save_report( $client_id, $report_name, $report_type, $date_from, $date_to, $sections, $report_data, $branding );

		return $report_id;
	}

	private function generate_executive_summary() {
		// Assume AI call generates this
		return [
			'p1' => "Overall, the site has seen steady growth this period. Core Web Vitals optimizations have successfully reduced load times by 24%, directly correlating with a minor bump in organic search visibility. Search engines are crawling the site more efficiently than before.",
			'p2' => "We achieved significant wins by resolving 15 critical keyword cannibalization conflicts that were suppressing top-tier service pages. Additionally, the new schema markup deployed across the blog section has led to a 12% increase in rich snippet appearances on the SERPs.",
			'p3' => "For the coming period, our top priorities will be refreshing decaying legacy content dropping in rankings, and addressing the remaining technical indexing gaps found in the site audit."
		];
	}

	private function get_seo_health_data() {
		// Mock data for display
		return [
			'current_score'        => rand(75, 92),
			'score_change'         => rand(1, 4),
			'trend_data'           => [65, 68, 70, 72, 75, 80, 85, 88],
			'top_improvements'     => ["Resolved 12 broken canonical tags", "Fixed 5 critical 404 errors", "Added metadata to 25 orphaned product pages"],
			'top_remaining_issues' => ["Missing alt tags on 40+ blog images", "3 pages loading slower than 3 seconds", "Duplicate H1 tags on archive pages"]
		];
	}

	private function get_keyword_rankings_data() {
		return [
			'total_tracked' => rand(50, 200),
			'moved_up'      => rand(5, 20),
			'moved_down'    => rand(1, 10),
			'new_in_top_10' => rand(1, 5),
			'top_keywords'  => [
				['keyword' => 'best seo services', 'position' => 3, 'change' => '+2', 'volume' => '1,400', 'url' => '/seo-services'],
				['keyword' => 'local marketing agency', 'position' => 5, 'change' => '+1', 'volume' => '900', 'url' => '/local-marketing'],
				['keyword' => 'ecommerce seo expert', 'position' => 8, 'change' => '-1', 'volume' => '1,200', 'url' => '/ecommerce-seo'],
				['keyword' => 'link building guide', 'position' => 2, 'change' => '0', 'volume' => '2,500', 'url' => '/blog/link-building-guide'],
				['keyword' => 'technical seo audit', 'position' => 11, 'change' => '+4', 'volume' => '1,800', 'url' => '/technical-audit'],
			]
		];
	}

	private function get_content_performance_data() {
		return [
			'published_count' => rand(2, 8),
			'optimized_count' => rand(5, 15),
			'avg_score_imp'   => '+18%',
			'top_posts'       => [
				['title' => 'The Ultimate Guide to Local SEO in 2026', 'score' => 95, 'imp' => '+25', 'traffic_est' => '450 visits'],
				['title' => 'Why Fast Hosting Matters', 'score' => 91, 'imp' => '+15', 'traffic_est' => '320 visits'],
				['title' => 'E-Commerce conversion strategies', 'score' => 88, 'imp' => '+10', 'traffic_est' => '290 visits'],
				['title' => 'Building Quality Backlinks', 'score' => 84, 'imp' => '+5', 'traffic_est' => '210 visits'],
				['title' => 'Q1 Marketing Trends', 'score' => 82, 'imp' => '+12', 'traffic_est' => '180 visits'],
			]
		];
	}

	private function get_technical_issues_data() {
		return [
			'critical_fixed' => rand(10, 30),
			'critical_rem'   => rand(2, 8),
			'audit_summary'  => [
				['type' => '404 Errors', 'count' => 3, 'status' => 'Remaining'],
				['type' => 'Empty Meta Descriptions', 'count' => 0, 'status' => 'Fixed'],
				['type' => 'Slow Pages', 'count' => 5, 'status' => 'Remaining'],
				['type' => 'Broken Internal Links', 'count' => 2, 'status' => 'Remaining'],
				['type' => 'Missing Canonical', 'count' => 0, 'status' => 'Fixed'],
			]
		];
	}

	private function get_content_decay_data() {
		return [
			'at_risk_count'    => rand(5, 12),
			'refreshed_count'  => rand(3, 10),
			'risk_improvement' => 'Down 15% vs last month - great progress on refreshing legacy content.'
		];
	}

	private function get_schema_coverage_data() {
		return [
			'coverage_percent' => rand(60, 95) . '%',
			'types_in_use' => ['Article', 'FAQPage', 'Product', 'Organization', 'LocalBusiness'],
			'opportunities' => 'Adding VideoObject schema to your YouTube embeds could drive 5-10% more video traffic from rich snippets.'
		];
	}

	private function generate_recommendations() {
		return [
			['priority' => 'High', 'action' => 'Fix Remaining 404s', 'impact' => 'Recover lost link equity and improve crawl budget.', 'effort' => 'Low'],
			['priority' => 'High', 'action' => 'Refresh Top Decaying Blog Posts', 'impact' => 'Regain top 3 positions for high-volume legacy articles.', 'effort' => 'Medium'],
			['priority' => 'Medium', 'action' => 'Implement FAQ Schema on Service Pages', 'impact' => 'Capture more real estate on SERPs via rich results.', 'effort' => 'Medium'],
			['priority' => 'Medium', 'action' => 'Consolidate Thin Category Pages', 'impact' => 'Resolve minor cannibalization issues and focus ranking power.', 'effort' => 'High'],
			['priority' => 'Low', 'action' => 'Optimize Image Alt Text', 'impact' => 'Minor improvements to image search traffic.', 'effort' => 'Low'],
		];
	}

	/* ==========================================================================
	 * REPORT CRUD
	 * ========================================================================== */

	public function save_report( $client_id, $report_name, $report_type, $date_from, $date_to, $sections, $report_data, $branding ) {
		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_reports';
		
		$settings = $this->get_agency_settings();

		$insert_data = [
			'client_id'   => intval( $client_id ),
			'report_name' => sanitize_text_field( $report_name ),
			'report_type' => sanitize_text_field( $report_type ),
			'date_from'   => sanitize_text_field( $date_from ),
			'date_to'     => sanitize_text_field( $date_to ),
			'sections'    => wp_json_encode( $sections ),
			'report_data' => wp_json_encode( $report_data ),
			'status'      => 'generated',
			'white_label' => ( '1' === $branding['white_label'] || true === $branding['white_label'] ) ? 1 : 0,
			'agency_name' => sanitize_text_field( $branding['agency_name'] ),
			'agency_logo' => isset($branding['show_logo']) && $branding['show_logo'] ? $settings['agency_logo'] : '',
			'agency_color'=> sanitize_hex_color( $branding['agency_color'] ),
			'created_at'  => current_time( 'mysql' ),
		];

		$wpdb->insert( $table, $insert_data );

		if ( $wpdb->insert_id ) {
			return $wpdb->insert_id;
		}

		return new WP_Error( 'db_error', __( 'Could not save report.', 'seo-copilot' ) );
	}

	public function get_reports( $client_id = null ) {
		global $wpdb;
		$reports_table = $wpdb->prefix . 'seo_copilot_reports';
		$clients_table = $wpdb->prefix . 'seo_copilot_clients';

		$query = "SELECT r.*, c.name as client_name, c.email as client_email FROM $reports_table r JOIN $clients_table c ON r.client_id = c.id";
		
		if ( $client_id ) {
			$query .= $wpdb->prepare( " WHERE r.client_id = %d", $client_id );
		}
		
		$query .= " ORDER BY r.created_at DESC";

		return $wpdb->get_results( $query, ARRAY_A );
	}

	public function get_report( $report_id ) {
		global $wpdb;
		$reports_table = $wpdb->prefix . 'seo_copilot_reports';
		$clients_table = $wpdb->prefix . 'seo_copilot_clients';

		$query = $wpdb->prepare( "SELECT r.*, c.name as client_name, c.email as client_email, c.website_url as client_website FROM $reports_table r JOIN $clients_table c ON r.client_id = c.id WHERE r.id = %d", $report_id );

		$report = $wpdb->get_row( $query, ARRAY_A );

		if ( $report ) {
			$report['sections']    = empty( $report['sections'] ) ? [] : json_decode( $report['sections'], true );
			$report['report_data'] = empty( $report['report_data'] ) ? [] : json_decode( $report['report_data'], true );
		}

		return $report;
	}

	public function delete_report( $report_id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'seo_copilot_reports';
		return $wpdb->delete( $table, [ 'id' => intval( $report_id ) ] );
	}

	/* ==========================================================================
	 * AGENCY & UTILS
	 * ========================================================================== */

	public function get_agency_settings() {
		$options = get_option( 'seo_copilot_settings', [] );
		return [
			'agency_name'    => isset($options['agency_name']) ? $options['agency_name'] : '',
			'agency_logo'    => isset($options['agency_logo']) ? $options['agency_logo'] : '',
			'agency_color'   => isset($options['agency_color']) ? $options['agency_color'] : '#4F46E5',
			'agency_email'   => isset($options['agency_email']) ? $options['agency_email'] : '',
			'agency_website' => isset($options['agency_website']) ? $options['agency_website'] : '',
			'white_label'    => isset($options['white_label']) ? $options['white_label'] : 'no',
			'report_intro'   => isset($options['report_intro']) ? $options['report_intro'] : 'Here is your monthly SEO performance report summarizing key wins, technical health, and content visibility over the past period.',
		];
	}

	public function generate_pdf_data( $report_id ) {
		$report = $this->get_report( $report_id );
		if ( ! $report ) {
			return false;
		}

		$settings = $this->get_agency_settings();

		// Compile simple structured array for view layer
		$data = [
			'report_id'      => $report['id'],
			'report_name'    => $report['report_name'],
			'date_from'      => date("M j, Y", strtotime($report['date_from'])),
			'date_to'        => date("M j, Y", strtotime($report['date_to'])),
			'client_name'    => $report['client_name'],
			'client_website' => $report['client_website'],
			
			'agency_name'    => $report['agency_name'],
			'agency_logo'    => $report['agency_logo'],
			'agency_color'   => $report['agency_color'],
			'agency_website' => $settings['agency_website'],
			'agency_email'   => $settings['agency_email'],
			
			'white_label'    => $report['white_label'],
			'report_intro'   => $settings['report_intro'],
			
			'sections'       => $report['sections'],
			'report_data'    => $report['report_data'],
		];

		return $data;
	}

	public function send_report_email( $report_id, $email ) {
		global $wpdb;
		$report = $this->get_report( $report_id );
		
		if( ! $report ) return new WP_Error( 'not_found', 'Report not found' );

		$settings = $this->get_agency_settings();
		$agency   = $report['agency_name'] ?: 'SEO Agency';
		$period   = date("M Y", strtotime($report['date_to']));

		$subject = "$agency SEO Report — $period";

		$url = admin_url( 'admin.php?page=seo-copilot-reports&action=view&id=' . $report_id );

		$message = "Hi " . esc_html( $report['client_name'] ) . ",\n\n";
		$message .= "Your latest SEO Performance Report covering the period up to $period is ready to view.\n\n";
		$message .= "You can view the full interactive report or download it as a PDF via the link below (requires admin access):\n";
		$message .= $url . "\n\n";
		$message .= "Best regards,\n" . esc_html( $agency );

		$headers = [ 'Content-Type: text/plain; charset=UTF-8' ];

		$sent = wp_mail( sanitize_email( $email ), $subject, $message, $headers );

		if ( $sent ) {
			$wpdb->update( 
				$wpdb->prefix . 'seo_copilot_reports', 
				[ 'status' => 'sent', 'sent_at' => current_time( 'mysql' ) ], 
				[ 'id' => intval( $report_id ) ]
			);
			return true;
		}

		return new WP_Error( 'mail_failed', 'Failed to send email.' );
	}

	/* ==========================================================================
	 * AJAX HANDLERS
	 * ========================================================================== */

	public function ajax_create_client() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

		$data = isset( $_POST['client_data'] ) ? $_POST['client_data'] : [];
		
		$result = $this->create_client( $data );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success( [ 'id' => $result ] );
	}

	public function ajax_update_client() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

		$id   = isset( $_POST['client_id'] ) ? intval( $_POST['client_id'] ) : 0;
		$data = isset( $_POST['client_data'] ) ? $_POST['client_data'] : [];

		if(!$id) wp_send_json_error( 'Invalid ID.' );
		
		$result = $this->update_client( $id, $data );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success();
	}

	public function ajax_delete_client() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

		$id = isset( $_POST['client_id'] ) ? intval( $_POST['client_id'] ) : 0;
		if(!$id) wp_send_json_error( 'Invalid ID.' );

		$result = $this->delete_client( $id );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success();
	}

	public function ajax_get_clients() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

		$clients = $this->get_clients();
		wp_send_json_success( $clients );
	}

	public function ajax_generate_report() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

		$client_id   = isset( $_POST['client_id'] ) ? intval( $_POST['client_id'] ) : 0;
		$report_name = isset( $_POST['report_name'] ) ? sanitize_text_field( $_POST['report_name'] ) : '';
		$report_type = isset( $_POST['report_type'] ) ? sanitize_text_field( $_POST['report_type'] ) : '';
		$date_from   = isset( $_POST['date_from'] ) ? sanitize_text_field( $_POST['date_from'] ) : '';
		$date_to     = isset( $_POST['date_to'] ) ? sanitize_text_field( $_POST['date_to'] ) : '';
		$sections    = isset( $_POST['sections'] ) && is_array( $_POST['sections'] ) ? array_map('sanitize_text_field', $_POST['sections']) : [];
		
		$branding    = isset( $_POST['branding'] ) ? $_POST['branding'] : [];

		if ( ! $client_id || empty( $report_name ) || empty( $date_from ) ) {
			wp_send_json_error( 'Missing required report fields.' );
		}

		$report_id = $this->generate_report( $client_id, $report_name, $report_type, $date_from, $date_to, $sections, $branding );

		if ( is_wp_error( $report_id ) ) {
			wp_send_json_error( $report_id->get_error_message() );
		}

		wp_send_json_success( [ 'report_id' => $report_id ] );
	}

	public function ajax_send_report_email() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

		$report_id = isset( $_POST['report_id'] ) ? intval( $_POST['report_id'] ) : 0;
		$email     = isset( $_POST['email'] ) ? sanitize_email( $_POST['email'] ) : '';

		if ( ! $report_id || ! is_email( $email ) ) {
			wp_send_json_error( 'Invalid report or email.' );
		}

		$result = $this->send_report_email( $report_id, $email );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success( 'Email sent successfully!' );
	}

	public function ajax_delete_report() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied.' );

		$report_id = isset( $_POST['report_id'] ) ? intval( $_POST['report_id'] ) : 0;
		if(!$report_id) wp_send_json_error( 'Invalid ID.' );

		$result = $this->delete_report( $report_id );

		if ( false === $result ) {
			wp_send_json_error( 'Could not delete report.' );
		}

		wp_send_json_success();
	}
}

/**
 * Helper function to retrieve class instance.
 */
function seo_copilot_client_reports() {
	return SEO_Copilot_Client_Reports::get_instance();
}

seo_copilot_client_reports();
