<?php
/**
 * Metabox Class
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Metabox' ) ) {

	/**
	 * Class SEO_Copilot_Metabox
	 */
	class SEO_Copilot_Metabox {

		/**
		 * Constructor.
		 */
		public function __construct() {
			// Admin Hooks
			add_action( 'add_meta_boxes', [ $this, 'add_meta_box' ] );
			add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
			add_action( 'save_post', [ $this, 'save_meta_box_data' ] );

			// AJAX Endpoints
			add_action( 'wp_ajax_seo_copilot_analyze', [ $this, 'ajax_analyze' ] );
			add_action( 'wp_ajax_seo_copilot_generate_meta', [ $this, 'ajax_generate_meta' ] );
			add_action( 'wp_ajax_seo_copilot_suggest_links', [ $this, 'ajax_suggest_links' ] );
			add_action( 'wp_ajax_seo_copilot_generate_schema', [ $this, 'ajax_generate_schema' ] );
			add_action( 'wp_ajax_seo_copilot_load_post_rankings', [ $this, 'ajax_load_post_rankings' ] );
			add_action( 'wp_ajax_seo_copilot_mb_add_keyword', [ $this, 'ajax_mb_add_keyword' ] );

			// Frontend Output Hooks
			add_filter( 'pre_get_document_title', [ $this, 'override_title' ], 999 );
			add_action( 'wp_head', [ $this, 'output_head_tags' ], 1 );
		}

		/**
		 * Enqueue assets only on the post screen where metabox is shown.
		 *
		 * @param string $hook Admin page hook.
		 */
		public function enqueue_assets( $hook ) {
			global $post;

			if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
				return;
			}

			// Only load if it's a selected post type
			$options    = get_option( 'seo_copilot_settings', [] );
			$post_types = isset( $options['post_types'] ) ? $options['post_types'] : [ 'post', 'page', 'product' ];

			if ( ! in_array( $post->post_type, $post_types, true ) ) {
				return;
			}

			wp_enqueue_style(
				'seo-copilot-metabox',
				SEO_COPILOT_PLUGIN_URL . 'admin/css/metabox.css',
				[],
				SEO_COPILOT_VERSION
			);

			wp_enqueue_script(
				'seo-copilot-metabox',
				SEO_COPILOT_PLUGIN_URL . 'admin/js/metabox.js',
				[ 'jquery' ],
				SEO_COPILOT_VERSION,
				true
			);

			wp_localize_script(
				'seo-copilot-metabox',
				'seoCopilotMetabox',
				[
					'ajaxUrl' => admin_url( 'admin-ajax.php' ),
					'nonce'   => wp_create_nonce( 'seo_copilot_metabox_nonce' ),
					'postId'  => $post->ID,
				]
			);
		}

		/**
		 * Add Meta Box to configured post types.
		 */
		public function add_meta_box() {
			$options    = get_option( 'seo_copilot_settings', [] );
			$post_types = isset( $options['post_types'] ) ? $options['post_types'] : [ 'post', 'page', 'product' ];

			foreach ( $post_types as $post_type ) {
				add_meta_box(
					'seo_copilot_metabox',
					__( 'SEO Copilot', 'seo-copilot' ),
					[ $this, 'render_meta_box' ],
					$post_type,
					'normal',
					'high'
				);
			}
		}

		/**
		 * Render Meta Box HTML.
		 *
		 * @param \WP_Post $post Current post object.
		 */
		public function render_meta_box( $post ) {
			wp_nonce_field( 'seo_copilot_save_meta', 'seo_copilot_metabox_nonce' );

			// Retrieve existing values
			$data = [
				'keyword'         => get_post_meta( $post->ID, '_seo_copilot_focus_keyword', true ),
				'title'           => get_post_meta( $post->ID, '_seo_copilot_meta_title', true ),
				'description'     => get_post_meta( $post->ID, '_seo_copilot_meta_description', true ),
				'score'           => get_post_meta( $post->ID, '_seo_copilot_score', true ),
				'issues'          => get_post_meta( $post->ID, '_seo_copilot_issues', true ),
				'schema'          => get_post_meta( $post->ID, '_seo_copilot_schema', true ),
				'schema_type'     => get_post_meta( $post->ID, '_seo_copilot_schema_type', true ),
				'schema_injected' => get_post_meta( $post->ID, '_seo_copilot_schema_injected', true ),
				// WooCommerce Specific
				'woo_score'       => get_post_meta( $post->ID, '_seo_copilot_woo_score', true ),
				'woo_issues'      => get_post_meta( $post->ID, '_seo_copilot_woo_issues', true ),
				'woo_schema'      => get_post_meta( $post->ID, '_seo_copilot_woo_schema', true ),
				'is_product'      => $post->post_type === 'product' && class_exists( 'WooCommerce' ),
			];

			// Load AEO data
			global $wpdb;
			$aeo_table = $wpdb->prefix . 'seo_copilot_aeo_scores';
			$aeo_row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $aeo_table WHERE post_id = %d", $post->ID), ARRAY_A);
			if ( $aeo_row ) {
				$data['aeo_score'] = $aeo_row['aeo_score'];
				$data['aeo_direct'] = $aeo_row['direct_answer_score'];
				$data['aeo_faq'] = $aeo_row['faq_score'];
				$data['aeo_schema_score'] = $aeo_row['schema_score'];
				$data['aeo_issues'] = $aeo_row['issues'];
			} else {
				$data['aeo_score'] = false;
				$data['aeo_issues'] = '[]';
			}

			// Load E-E-A-T data
			$eeat_table = $wpdb->prefix . 'seo_copilot_eeat_scores';
			$eeat_row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $eeat_table WHERE score_type = 'post' AND post_id = %d", $post->ID), ARRAY_A);
			if ( $eeat_row ) {
				$data['eeat_overall'] = $eeat_row['overall_score'];
				$data['eeat_exp'] = $eeat_row['experience_score'];
				$data['eeat_ext'] = $eeat_row['expertise_score'];
				$data['eeat_auth'] = $eeat_row['authority_score'];
				$data['eeat_trust'] = $eeat_row['trust_score'];
				$data['eeat_issues'] = $eeat_row['issues'];
			} else {
				$data['eeat_overall'] = false;
				$data['eeat_issues'] = '[]';
			}

			require_once SEO_COPILOT_PLUGIN_DIR . 'admin/views/metabox.php';
		}

		/**
		 * Save Meta Box Data.
		 *
		 * @param int $post_id Current post ID.
		 */
		public function save_meta_box_data( $post_id ) {
			// Check nonce
			if ( ! isset( $_POST['seo_copilot_metabox_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['seo_copilot_metabox_nonce'] ) ), 'seo_copilot_save_meta' ) ) {
				return;
			}

			// Ignore autosaves if we only want to save actual explicit saves, 
			// but requirement says "Auto-save meta fields when WordPress autosaves".
			// Let's just allow standard save logic to persist them during AJAX or Autosave
			if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
				// We still want to save, but check capabilities and nonce first
			}

			// Check permissions
			if ( isset( $_POST['post_type'] ) && 'page' === $_POST['post_type'] ) {
				if ( ! current_user_can( 'edit_page', $post_id ) ) {
					return;
				}
			} elseif ( ! current_user_can( 'edit_post', $post_id ) ) {
				return;
			}

			// Sanitize and save data
			$fields = [
				'_seo_copilot_focus_keyword'    => 'sanitize_text_field',
				'_seo_copilot_meta_title'       => 'sanitize_text_field',
				'_seo_copilot_meta_description' => 'sanitize_textarea_field',
				'_seo_copilot_score'            => 'absint',
				'_seo_copilot_schema_type'      => 'sanitize_text_field',
				'_seo_copilot_schema_injected'  => 'rest_sanitize_boolean', // Treat as boolean equivalent
				// Woo
				'_seo_copilot_woo_score'        => 'absint',
				'_seo_copilot_enable_schema'    => 'sanitize_text_field',
			];

			foreach ( $fields as $field => $sanitizer ) {
				if ( isset( $_POST[ $field ] ) ) {
					$val = call_user_func( $sanitizer, wp_unslash( $_POST[ $field ] ) );
					update_post_meta( $post_id, $field, $val );
				} else {
					// For checkboxes / toggles that might not be sent if false
					if ( '_seo_copilot_schema_injected' === $field ) {
					    delete_post_meta( $post_id, $field );
					}
				}
			}

			// For complex JSON elements: Issues & Schema string
			if ( isset( $_POST['_seo_copilot_issues'] ) ) {
				$issues = wp_unslash( $_POST['_seo_copilot_issues'] );
				$issues_decoded = json_decode( $issues, true );
				if ( json_last_error() === JSON_ERROR_NONE ) {
					update_post_meta( $post_id, '_seo_copilot_issues', wp_json_encode( $issues_decoded ) );
				}
			}

			if ( isset( $_POST['_seo_copilot_schema'] ) ) {
				$schema = wp_unslash( $_POST['_seo_copilot_schema'] );
				// Basic sanity check to ensure it's valid JSON
				if ( json_decode( $schema ) ) {
					update_post_meta( $post_id, '_seo_copilot_schema', $schema ); // Stored as a raw JSON string
				}
			}
		}

		/**
		 * Override Document Title.
		 *
		 * @param string $title Current title.
		 * @return string
		 */
		public function override_title( $title ) {
			if ( ! is_singular() ) {
				return $title;
			}

			$post_id = get_the_ID();
			$score   = get_post_meta( $post_id, '_seo_copilot_score', true );

			// Only output if analyzed
			if ( false === $score || '' === $score ) {
				return $title;
			}

			$custom_title = get_post_meta( $post_id, '_seo_copilot_meta_title', true );
			if ( ! empty( $custom_title ) ) {
				return esc_html( $custom_title );
			}

			return $title;
		}

		/**
		 * Output Meta Tags & Schema in Head.
		 */
		public function output_head_tags() {
			if ( ! is_singular() ) {
				return;
			}

			$post_id = get_the_ID();
			$score   = get_post_meta( $post_id, '_seo_copilot_score', true );

			// Only output if analyzed
			if ( false === $score || '' === $score ) {
				return;
			}

			$desc = get_post_meta( $post_id, '_seo_copilot_meta_description', true );
			if ( ! empty( $desc ) ) {
				echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
			}

			$injected = get_post_meta( $post_id, '_seo_copilot_schema_injected', true );
			if ( $injected ) {
				$schema = get_post_meta( $post_id, '_seo_copilot_schema', true );
				if ( ! empty( $schema ) ) {
					echo '<script type="application/ld+json">' . "\n";
					echo $schema . "\n"; // Raw JSON string already validated on save
					echo '</script>' . "\n";
				}
			}
		}

		/**
		 * AJAX: Analyze Content.
		 */
		public function ajax_analyze() {
			check_ajax_referer( 'seo_copilot_metabox_nonce', 'nonce' );

			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_send_json_error( __( 'Permission denied.', 'seo-copilot' ) );
			}

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			$keyword = isset( $_POST['keyword'] ) ? sanitize_text_field( wp_unslash( $_POST['keyword'] ) ) : '';

			if ( ! $post_id ) {
				wp_send_json_error( __( 'Missing Post ID.', 'seo-copilot' ) );
			}

			$post = get_post( $post_id );
			if ( ! $post ) {
				wp_send_json_error( __( 'Invalid Post.', 'seo-copilot' ) );
			}

			$provider = SEO_Copilot_AI_Factory::get_provider();
			$content  = apply_filters( 'the_content', $post->post_content );
			$result   = $provider->analyze_content( $content, $keyword );

			if ( is_wp_error( $result ) ) {
				wp_send_json_error( $result->get_error_message() );
			}

			wp_send_json_success( $result );
		}

		/**
		 * AJAX: Generate Meta.
		 */
		public function ajax_generate_meta() {
			check_ajax_referer( 'seo_copilot_metabox_nonce', 'nonce' );

			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_send_json_error( __( 'Permission denied.', 'seo-copilot' ) );
			}

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			$keyword = isset( $_POST['keyword'] ) ? sanitize_text_field( wp_unslash( $_POST['keyword'] ) ) : '';

			$post = get_post( $post_id );
			$provider = SEO_Copilot_AI_Factory::get_provider();
			$content  = apply_filters( 'the_content', $post->post_content );
			$result   = $provider->generate_meta( $post->post_title, $content, $keyword );

			if ( is_wp_error( $result ) ) {
				wp_send_json_error( $result->get_error_message() );
			}

			wp_send_json_success( $result );
		}

		/**
		 * AJAX: Suggest Links.
		 */
		public function ajax_suggest_links() {
			check_ajax_referer( 'seo_copilot_metabox_nonce', 'nonce' );

			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_send_json_error( __( 'Permission denied.', 'seo-copilot' ) );
			}

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			$post    = get_post( $post_id );
			
			// Get recent published posts for context (simplified)
			$recent_posts = get_posts( [ 'numberposts' => 20, 'post_type' => 'any', 'post_status' => 'publish', 'exclude' => [ $post_id ] ] );
			$titles = [];
			foreach ( $recent_posts as $rp ) {
				$titles[] = $rp->post_title . ' (ID: ' . $rp->ID . ')';
			}

			$provider = SEO_Copilot_AI_Factory::get_provider();
			$content  = apply_filters( 'the_content', $post->post_content );
			$result   = $provider->suggest_internal_links( $content, $titles );

			if ( is_wp_error( $result ) ) {
				wp_send_json_error( $result->get_error_message() );
			}

			wp_send_json_success( $result );
		}

		/**
		 * AJAX: Generate Schema.
		 */
		public function ajax_generate_schema() {
			check_ajax_referer( 'seo_copilot_metabox_nonce', 'nonce' );

			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_send_json_error( __( 'Permission denied.', 'seo-copilot' ) );
			}

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			$type    = isset( $_POST['schema_type'] ) ? sanitize_text_field( wp_unslash( $_POST['schema_type'] ) ) : 'Article';

			$post = get_post( $post_id );
			$provider = SEO_Copilot_AI_Factory::get_provider();
			$content  = apply_filters( 'the_content', $post->post_content );
			$result   = $provider->suggest_schema( $content, $type );

			if ( is_wp_error( $result ) ) {
				wp_send_json_error( $result->get_error_message() );
			}

			wp_send_json_success( $result );
		}

		/**
		 * AJAX: Load Rankings for a Single Post inside the Metabox
		 */
		public function ajax_load_post_rankings() {
			check_ajax_referer( 'seo_copilot_metabox_nonce', 'nonce' );
			if ( ! current_user_can( 'edit_posts' ) ) wp_send_json_error( __( 'Permission denied.', 'seo-copilot' ) );

			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			if ( ! $post_id ) wp_send_json_error( 'Invalid post' );

			global $wpdb;
			$trk = $wpdb->prefix . 'seo_copilot_tracked_keywords';
			$his = $wpdb->prefix . 'seo_copilot_rank_history';

			$sql = "
				SELECT t.*, h.position as current_position, h.search_volume, h.recorded_date,
					(SELECT position FROM $his WHERE keyword_id = t.id AND recorded_date < h.recorded_date ORDER BY recorded_date DESC LIMIT 1) as previous_position
				FROM $trk t
				LEFT JOIN $his h ON h.keyword_id = t.id AND h.recorded_date = (
					SELECT MAX(recorded_date) FROM $his WHERE keyword_id = t.id
				)
				WHERE t.post_id = %d
				ORDER BY t.id DESC
			";

			$data = $wpdb->get_results( $wpdb->prepare( $sql, $post_id ) );

			if ( empty( $data ) ) {
				wp_send_json_success( '<p class="description">No keywords currently tracked for this post. Add one above.</p>' );
			}

			ob_start();
			?>
			<table class="seo-copilot-table tracker-table" style="width:100%; font-size:13px; margin-top:12px;">
				<thead>
					<tr>
						<th style="padding:8px 0; border-bottom:1px solid #e2e4e7; text-align:left;"><?php esc_html_e( 'Keyword', 'seo-copilot' ); ?></th>
						<th style="padding:8px 0; border-bottom:1px solid #e2e4e7; text-align:center;"><?php esc_html_e( 'Position', 'seo-copilot' ); ?></th>
						<th style="padding:8px 0; border-bottom:1px solid #e2e4e7; text-align:center;"><?php esc_html_e( 'Vol', 'seo-copilot' ); ?></th>
						<th style="padding:8px 0; border-bottom:1px solid #e2e4e7; text-align:center;"><?php esc_html_e( 'Loc', 'seo-copilot' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach( $data as $row ) : 
						$pos = $row->current_position ? intval( $row->current_position ) : 101; 
						$display = $pos > 100 ? '-' : $pos;
						$bg = '#f0f0f1'; $c = '#8c8f94';
						if ( $pos <= 3 ) { $bg = '#fef8dd'; $c = '#dba617'; }
						elseif ( $pos <= 10 ) { $bg = '#e5f6e8'; $c = '#008a20'; }
						elseif ( $pos <= 20 ) { $bg = '#eef8fc'; $c = '#2271b1'; }
						elseif ( $pos <= 50 ) { $bg = '#fdf2d0'; $c = '#dba617'; }
						elseif ( $pos <= 100 ) { $bg = '#fcf0f1'; $c = '#d63638'; }
					?>
					<tr>
						<td style="padding:8px 0; border-bottom:1px solid #f0f0f1;"><strong><?php echo esc_html( $row->keyword ); ?></strong></td>
						<td style="padding:8px 0; border-bottom:1px solid #f0f0f1; text-align:center;">
							<span style="display:inline-block;px;padding:2px 8px;border-radius:4px;font-weight:bold;background:<?php echo $bg; ?>;color:<?php echo $c; ?>;"><?php echo esc_html( $display ); ?></span>
						</td>
						<td style="padding:8px 0; border-bottom:1px solid #f0f0f1; text-align:center;"><?php echo number_format_i18n( $row->search_volume ); ?></td>
						<td style="padding:8px 0; border-bottom:1px solid #f0f0f1; text-align:center;"><?php echo esc_html( $row->country_code ); ?></td>
					</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
			<p style="font-size:11px; margin-top:12px; text-align:right;">
				<a href="<?php echo esc_url( admin_url('admin.php?page=seo-copilot-rank-tracker') ); ?>" target="_blank">Manage all tracked keywords <span class="dashicons dashicons-external" style="font-size:11px; line-height:inherit;"></span></a>
			</p>
			<?php
			$html = ob_get_clean();
			wp_send_json_success( $html );
		}

		/**
		 * AJAX: Add keyword directly from Metabox
		 */
		public function ajax_mb_add_keyword() {
			check_ajax_referer( 'seo_copilot_metabox_nonce', 'nonce' );
			if ( ! current_user_can( 'edit_posts' ) ) wp_send_json_error( __( 'Permission denied.', 'seo-copilot' ) );

			$tracker = new SEO_Copilot_Rank_Tracker();
			
			// We basically proxy to the admin ajax method but safely re-check our own nonce.
			// Actually we can just call it natively.
			$post_id  = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
			$keywords = isset( $_POST['keyword'] ) ? sanitize_text_field( $_POST['keyword'] ) : ''; // Single for MB
			$country  = isset( $_POST['country'] ) ? sanitize_text_field( $_POST['country'] ) : 'US';
			$device   = isset( $_POST['device'] ) ? sanitize_text_field( $_POST['device'] ) : 'desktop';
			
			if ( ! $post_id || empty( $keywords ) ) {
				wp_send_json_error( 'Missing data.' );
			}

			// Natively call Tracker
			$res = $tracker->add_keyword( $post_id, $keywords, $country, 'en', $device, 'manual' );
			
			if ( $res ) {
				wp_send_json_success( "Tracked successfully." );
			}

			wp_send_json_error( 'Failed to add. Maybe not connected to DataForSEO?' );
		}
	}
}

new SEO_Copilot_Metabox();
