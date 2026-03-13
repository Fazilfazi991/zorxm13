<?php
/**
 * SEO Changelog Tracker
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Changelog' ) ) {

	class SEO_Copilot_Changelog {

		const RSS_FEEDS = [
			'https://feeds.feedburner.com/SearchEngineLand',
			'https://www.seroundtable.com/feed',
			'https://feeds.feedburner.com/blogspot/amDG' // Google Search Central
		];

		public function __construct() {
			// Cron Hooks
			add_action( 'seo_copilot_fetch_changelog', [ $this, 'fetch_latest_updates' ] );

			// AJAX Hooks
			add_action( 'wp_ajax_seo_copilot_refresh_changelog', [ $this, 'ajax_manual_refresh' ] );
			add_action( 'wp_ajax_seo_copilot_mark_update_read', [ $this, 'ajax_mark_update_read' ] );
			add_action( 'wp_ajax_seo_copilot_filter_updates', [ $this, 'ajax_filter_updates' ] );

			if ( ! wp_next_scheduled( 'seo_copilot_fetch_changelog' ) ) {
				wp_schedule_event( strtotime( '06:00:00' ), 'daily', 'seo_copilot_fetch_changelog' );
			}
		}

		/**
		 * Fetch latest updates from RSS
		 */
		public function fetch_latest_updates() {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_changelog';
			
			$new_count = 0;

			foreach ( self::RSS_FEEDS as $feed_url ) {
				$response = wp_remote_get( $feed_url, [ 'timeout' => 10 ] );
				if ( is_wp_error( $response ) ) {
					continue;
				}

				$body = wp_remote_retrieve_body( $response );
				if ( empty( $body ) ) {
					continue;
				}

				$xml = @simplexml_load_string( $body, 'SimpleXMLElement', LIBXML_NOCDATA );
				if ( ! $xml || ! isset( $xml->channel->item ) ) {
					continue;
				}

				$source_name = (string) $xml->channel->title;
				$items = $xml->channel->item;

				$count = 0;
				foreach ( $items as $item ) {
					if ( $count >= 20 ) break; // Only last 20 per feed

					$link = (string) $item->link;
					
					// Avoid duplicates by exact source URL match
					$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE source_url = %s", $link ) );
					if ( $exists ) {
						$count++;
						continue;
					}

					$title = (string) $item->title;
					$description = wp_strip_all_tags( (string) $item->description );
					if ( strlen( $description ) > 2000 ) {
						$description = substr( $description, 0, 2000 ) . '...';
					}

					$pubDate = (string) $item->pubDate;
					$published_date = date( 'Y-m-d H:i:s', strtotime( $pubDate ) );

					// Prepare update array to send to AI
					$update_data = [
						'title'       => $title,
						'description' => $description,
						'source'      => $source_name,
						'url'         => $link,
						'date'        => $published_date,
					];

					// Call AI for Impact Analysis
					$analysis = $this->analyze_update_impact( $update_data );

					if ( ! is_array( $analysis ) ) {
						// Fallback if AI fails
						$analysis = [
							'impact_level' => 'low',
							'category'     => 'industry',
							'affects_site' => 0,
							'action_items' => [],
							'summary'      => $description,
						];
					}

					$wpdb->insert(
						$table,
						[
							'title'          => $title,
							'summary'        => isset( $analysis['summary'] ) ? $analysis['summary'] : $description,
							'source_url'     => $link,
							'source_name'    => $source_name,
							'published_date' => $published_date,
							'impact_level'   => isset( $analysis['impact_level'] ) ? $analysis['impact_level'] : 'low',
							'category'       => isset( $analysis['category'] ) ? $analysis['category'] : 'industry',
							'ai_analysis'    => wp_json_encode( $analysis ),
							'affects_site'   => ! empty( $analysis['affects_site'] ) ? 1 : 0,
							'action_items'   => isset( $analysis['action_items'] ) ? wp_json_encode( $analysis['action_items'] ) : '[]',
							'is_read'        => 0,
							'created_at'     => current_time( 'mysql' ),
						]
					);

					$new_count++;
					$count++;
				}
			}

			return $new_count;
		}

		/**
		 * Analyze Update via AI Provider
		 */
		private function analyze_update_impact( $update ) {
			$provider = SEO_Copilot_AI_Factory::get_provider();
			if ( ! $provider ) {
				return false;
			}

			// Determine site context
			$settings = get_option( 'seo_copilot_settings', [] );
			$site_type = isset( $settings['site_type'] ) ? $settings['site_type'] : 'general blog/website';

			$prompt = "You are an expert SEO strategist. Analyze this recent SEO/Google update and output ONLY valid parsed JSON. No markdown ticks around it.

Update Context:
Title: {$update['title']}
Summary: {$update['description']}
Source: {$update['source']}
Date: {$update['date']}

The user's site type is: {$site_type}

Return exactly this JSON structure:
{
  \"impact_level\": \"critical|high|medium|low\",
  \"category\": \"algorithm|feature|industry|tool\",
  \"affects_site\": true|false,
  \"summary\": \"Plain English 2-sentence summary of what changed.\",
  \"what_changed\": \"String describing the core change.\",
  \"who_is_affected\": \"String describing who is affected.\",
  \"action_items\": [
    {
      \"priority\": \"high|medium|low\",
      \"action\": \"Actionable recommendation.\",
      \"feature\": \"Specify an internal generic feature like: Site Audit, Content Decay, Rank Tracker, Keyword Conflicts, Readability\"
    }
  ],
  \"urgency\": \"act now|this week|this month|monitor only\"
}";

			$response = $provider->generate_text( $prompt, 'json_object' );

			if ( is_wp_error( $response ) ) {
				return false;
			}

			// Clean JSON if the provider still returns markdown wrapper
			$cleaned_json = preg_replace( '/^```json\s*/', '', $response );
			$cleaned_json = preg_replace( '/\s*```$/', '', $cleaned_json );

			// Also remove `<json>` block wrapper if Gemini adds it
			if ( strpos( $cleaned_json, '<json>' ) === 0 ) {
				$cleaned_json = str_replace( ['<json>', '</json>'], '', $cleaned_json );
			}

			$data = json_decode( trim( $cleaned_json ), true );

			return $data;
		}

		/**
		 * Get Updates
		 */
		public function get_updates( $filters = [] ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_changelog';

			$where = ["1=1"];
			$params = [];

			if ( ! empty( $filters['is_read'] ) && $filters['is_read'] === 'unread' ) {
				$where[] = "is_read = 0";
			}
			if ( ! empty( $filters['affects_site'] ) && $filters['affects_site'] === 'yes' ) {
				$where[] = "affects_site = 1";
			}
			if ( ! empty( $filters['impact_level'] ) && $filters['impact_level'] !== 'all' ) {
				$where[] = "impact_level = %s";
				$params[] = $filters['impact_level'];
			}
			if ( ! empty( $filters['category'] ) && $filters['category'] !== 'all' ) {
				$where[] = "category = %s";
				$params[] = $filters['category'];
			}
			if ( ! empty( $filters['search'] ) ) {
				$where[] = "(title LIKE %s OR summary LIKE %s)";
				$search = '%' . $wpdb->esc_like( $filters['search'] ) . '%';
				$params[] = $search;
				$params[] = $search;
			}

			$where_sql = implode( ' AND ', $where );
			$sql = "SELECT * FROM $table WHERE $where_sql ORDER BY published_date DESC LIMIT 50";

			if ( ! empty( $params ) ) {
				$sql = $wpdb->prepare( $sql, $params );
			}

			return $wpdb->get_results( $sql );
		}

		/**
		 * Mark update as read
		 */
		public function mark_as_read( $id ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_changelog';
			return $wpdb->update( $table, [ 'is_read' => 1 ], [ 'id' => intval( $id ) ], [ '%d' ], [ '%d' ] );
		}

		/**
		 * Retrieve count of unread updates
		 */
		public function get_unread_count() {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_changelog';
			return (int) $wpdb->get_var( "SELECT COUNT(id) FROM $table WHERE is_read = 0" );
		}

		/**
		 * Get summary info for UI cards
		 */
		public function get_site_impact_summary() {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_changelog';

			$summary = [
				'critical_count' => 0,
				'updates_this_week' => 0,
				'attention_needed' => 0,
				'last_algorithm_update' => null,
			];

			// Critical this month
			$summary['critical_count'] = (int) $wpdb->get_var( "SELECT COUNT(id) FROM $table WHERE impact_level = 'critical' AND published_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)" );

			// Updates this week
			$summary['updates_this_week'] = (int) $wpdb->get_var( "SELECT COUNT(id) FROM $table WHERE published_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)" );

			// Attention Needed
			$summary['attention_needed'] = (int) $wpdb->get_var( "SELECT COUNT(id) FROM $table WHERE affects_site = 1 AND is_read = 0" );

			// Last algorithm update
			$last_algo = $wpdb->get_row( "SELECT title, published_date FROM $table WHERE category = 'algorithm' ORDER BY published_date DESC LIMIT 1" );
			if ( $last_algo ) {
				$summary['last_algorithm_update'] = [
					'title' => $last_algo->title,
					'date'  => date( 'M j, Y', strtotime( $last_algo->published_date ) )
				];
			}

			return $summary;
		}

		/**
		 * Manual refresh trigger from UI
		 */
		public function ajax_manual_refresh() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

			$new_count = $this->fetch_latest_updates();
			update_option( 'seo_copilot_changelog_last_fetch', current_time( 'mysql' ) );

			wp_send_json_success( [
				'message'   => $new_count > 0 ? "Fetched $new_count new updates." : "No new updates found.",
				'new_count' => $new_count
			] );
		}

		/**
		 * AJAX mark as read
		 */
		public function ajax_mark_update_read() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error();

			$id = isset( $_POST['update_id'] ) ? intval( $_POST['update_id'] ) : 0;
			if ( $id ) {
				$this->mark_as_read( $id );
				wp_send_json_success( [ 'unread_count' => $this->get_unread_count() ] );
			}
			wp_send_json_error( 'Invalid ID' );
		}

		/**
		 * AJAX Filter
		 */
		public function ajax_filter_updates() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die();
			}
			
			// We just load the view again but pass post variables and die.
			// However in our view file, we usually do full page loads for simplicity or output partials.
			// Let's return JSON of the rendered HTML for the updates feed.
			
			$filters = [
				'is_read'      => isset( $_POST['is_read'] ) ? sanitize_text_field( wp_unslash( $_POST['is_read'] ) ) : '',
				'impact_level' => isset( $_POST['impact_level'] ) ? sanitize_text_field( wp_unslash( $_POST['impact_level'] ) ) : 'all',
				'category'     => isset( $_POST['category'] ) ? sanitize_text_field( wp_unslash( $_POST['category'] ) ) : 'all',
				'affects_site' => isset( $_POST['affects_site'] ) ? sanitize_text_field( wp_unslash( $_POST['affects_site'] ) ) : '',
				'search'       => isset( $_POST['search'] ) ? sanitize_text_field( wp_unslash( $_POST['search'] ) ) : '',
			];

			$updates = $this->get_updates( $filters );
			
			ob_start();
			
			if ( empty( $updates ) ) {
				echo '<div class="sc-empty-state sc-card">';
				echo '<span class="sc-empty-icon">📡</span>';
				echo '<h4>' . esc_html__( 'No updates found', 'seo-copilot' ) . '</h4>';
				echo '<p>' . esc_html__( 'Try adjusting your filters or hit Refresh Now to check for updates.', 'seo-copilot' ) . '</p>';
				echo '</div>';
			} else {
				foreach ( $updates as $update ) {
					// Output HTML directly corresponding to the UI spec.
					// Note: Including the same HTML logic as the view here.
					$this->render_update_card( $update );
				}
			}
			
			$html = ob_get_clean();
			wp_send_json_success( [ 'html' => $html ] );
		}

		/**
		 * Helper to render card
		 */
		public function render_update_card( $update ) {
			$ai_data = json_decode( $update->ai_analysis, true );
			$action_items = json_decode( $update->action_items, true );
			$is_unread = $update->is_read == 0;
			
			$impact_class = 'impact-' . esc_attr( strtolower( $update->impact_level ) );
			$badge_impact = 'sc-badge-grey';
			if ( 'critical' === strtolower( $update->impact_level ) ) $badge_impact = 'sc-badge-danger';
			if ( 'high' === strtolower( $update->impact_level ) ) $badge_impact = 'sc-badge-warning';
			if ( 'medium' === strtolower( $update->impact_level ) ) $badge_impact = 'sc-badge-primary';
			
			$badge_cat = 'sc-badge-' . esc_attr( strtolower( $update->category ) );

			$urgency = isset( $ai_data['urgency'] ) ? strtolower( $ai_data['urgency'] ) : 'monitor only';
			$urgency_class = 'sc-urgency-monitor';
			if ( strpos( $urgency, 'act now' ) !== false ) $urgency_class = 'sc-urgency-now';
			else if ( strpos( $urgency, 'week' ) !== false ) $urgency_class = 'sc-urgency-week';
			else if ( strpos( $urgency, 'month' ) !== false ) $urgency_class = 'sc-urgency-month';

			?>
			<div class="sc-card sc-update-card <?php echo esc_attr( $impact_class ); ?> <?php echo $is_unread ? 'unread' : ''; ?>" style="margin-bottom: 20px; <?php echo ! $is_unread ? 'opacity: 0.85;' : ''; ?>" data-id="<?php echo esc_attr( $update->id ); ?>">
				<div class="sc-card-body">
					<div style="display:flex; justify-content:space-between; margin-bottom: 12px; font-size:12px;">
						<div>
							<span class="sc-badge <?php echo esc_attr( $badge_impact ); ?>" style="text-transform:uppercase; margin-right:6px;"><?php echo esc_html( $update->impact_level ); ?></span>
							<span class="sc-badge <?php echo esc_attr( $badge_cat ); ?>" style="text-transform:uppercase;"><?php echo esc_html( $update->category ); ?></span>
						</div>
						<div style="color:var(--sc-grey); font-weight:600;">
							📅 <?php echo date( 'M j, Y', strtotime( $update->published_date ) ); ?> &middot; <?php echo esc_html( $update->source_name ); ?>
						</div>
					</div>

					<h3 style="font-size: 18px; margin: 0 0 16px 0; color: var(--sc-dark);"><?php echo esc_html( $update->title ); ?></h3>
					
					<div style="background:var(--sc-light); padding:16px; border-radius: var(--sc-radius); margin-bottom:16px;">
						<strong>AI Summary:</strong> <?php echo esc_html( $update->summary ); ?>
						<?php if ( ! empty( $ai_data['what_changed'] ) ) : ?>
							<br><br><strong>What Changed:</strong> <?php echo esc_html( $ai_data['what_changed'] ); ?>
						<?php endif; ?>
					</div>

					<?php if ( $update->affects_site ) : ?>
						<div style="color:var(--sc-danger); font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:6px;">
							<span style="font-size:16px;">⚡</span> Affects Your Site: YES
						</div>
					<?php endif; ?>

					<?php if ( ! empty( $action_items ) && is_array( $action_items ) ) : ?>
						<h4 style="margin: 0 0 8px 0; font-size:13px; text-transform:uppercase; color:var(--sc-grey);">Action Items:</h4>
						<ul style="list-style:none; padding:0; margin:0 0 20px 0;">
							<?php foreach ( $action_items as $act ) : 
								$dot = '🟢';
								if ( strtolower( $act['priority'] ) === 'high' || strtolower( $act['priority'] ) === 'critical' ) $dot = '🔴';
								if ( strtolower( $act['priority'] ) === 'medium' ) $dot = '🟡';
							?>
								<li style="margin-bottom:8px; display:flex; gap:8px; font-size:13px; align-items:flex-start;">
									<span style="min-width:16px; margin-top:1px;"><?php echo $dot; ?></span>
									<div>
										<?php echo esc_html( $act['action'] ); ?>
										<?php if ( ! empty( $act['feature'] ) ) : ?>
											<div style="margin-top:4px;">
												<span class="sc-badge sc-badge-grey" style="font-size:11px;">→ Open <?php echo esc_html( $act['feature'] ); ?></span>
											</div>
										<?php endif; ?>
									</div>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>

					<div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--sc-border); padding-top: 16px; margin-top: 8px;">
						<div>
							<span class="<?php echo esc_attr( $urgency_class ); ?>">Urgency: <?php echo esc_html( $urgency ); ?></span>
						</div>
						<div style="display:flex; gap:12px;">
							<a href="<?php echo esc_url( $update->source_url ); ?>" target="_blank" class="sc-btn sc-btn-outline sc-btn-sm" style="color:var(--sc-primary);">Read Full Article →</a>
							<?php if ( $is_unread ) : ?>
								<button class="sc-btn sc-btn-primary sc-btn-sm btn-mark-read" data-id="<?php echo esc_attr( $update->id ); ?>">Mark Read ✓</button>
							<?php endif; ?>
						</div>
					</div>

				</div>
			</div>
			<?php
		}

	}
}

// Global accessor
function seo_copilot_changelog() {
	static $instance = null;
	if ( is_null( $instance ) ) {
		$instance = new SEO_Copilot_Changelog();
	}
	return $instance;
}

// Initialize
seo_copilot_changelog();
