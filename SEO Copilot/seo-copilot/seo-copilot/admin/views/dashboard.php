<?php
/**
 * Admin Dashboard View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

// Check user capabilities
if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

$admin = new SEO_Copilot_Admin();

// Fetch Data
$health_score     = $admin->get_site_health_score();
$coverage         = $admin->get_coverage_stats();
$critical_count   = $admin->get_critical_issues_count();
$quick_wins       = $admin->get_quick_wins_count();

$needing_attention = $admin->get_posts_needing_attention( 10 );
$top_performing    = $admin->get_top_performing_posts( 5 );
$recent_activity   = $admin->get_recent_activity( 10 );

$options        = get_option( 'seo_copilot_settings', [] );
$provider       = isset( $options['ai_provider'] ) ? $options['ai_provider'] : 'claude';
$api_calls      = isset( $options['api_calls_this_month'] ) ? $options['api_calls_this_month'] : 0;
$provider_label = 'claude' === $provider ? 'Claude AI' : 'Google Gemini';

$is_connected = false;
if ( 'claude' === $provider && ! empty( $options['claude_api_key'] ) ) $is_connected = true;
if ( 'gemini' === $provider && ! empty( $options['gemini_api_key'] ) ) $is_connected = true;

$last_audit = get_option( 'seo_copilot_last_audit' );
$audit_date = $last_audit ? date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $last_audit ) : __( 'Never', 'seo-copilot' );

// GA4 Data
$ga4_api = new SEO_Copilot_GA4_API();
$ga4_connected = $ga4_api->is_connected();
$traffic = [ 'sessions' => 0, 'users' => 0, 'bounce' => 0, 'duration' => 0 ];
if ( $ga4_connected ) {
	$traffic = $ga4_api->get_traffic_overview( 30 );
}

// Helpers for UI
function seo_copilot_get_score_badge( $score ) {
	$score = intval( $score );
	if ( ! $score ) return '<span class="seo-copilot-badge none">&mdash;</span>';
	$class = 'red';
	if ( $score >= 50 && $score < 80 ) $class = 'orange';
	if ( $score >= 80 ) $class = 'green';
	return '<span class="seo-copilot-badge ' . $class . '">' . $score . '</span>';
}
?>

<div class="wrap seo-copilot-page seo-copilot-dashboard-wrap">

	<!-- Page Header -->
	<div class="sc-page-header">
		<div class="sc-page-header-left">
			<div class="sc-page-icon">📊</div>
			<div>
				<h1 class="sc-page-title"><?php esc_html_e( 'SEO Copilot Dashboard', 'seo-copilot' ); ?></h1>
				<p class="sc-page-subtitle"><?php printf( esc_html__( 'Your site\'s complete SEO health overview. Last audit: %s', 'seo-copilot' ), esc_html( $audit_date ) ); ?></p>
			</div>
		</div>
		<div class="sc-page-header-right">
			<button class="sc-btn sc-btn-primary" id="btn-run-audit">
				<span class="dashicons dashicons-update"></span> <?php esc_html_e( 'Run Full Audit', 'seo-copilot' ); ?>
			</button>
		</div>
	</div>

	<!-- Tip box (show when no posts analyzed) -->
	<?php if ( $coverage['analyzed'] == 0 ) : ?>
	<div class="sc-tip-box">
		<span class="sc-tip-icon">💡</span>
		<div class="sc-tip-text">
			<strong><?php esc_html_e( 'Welcome to SEO Copilot!', 'seo-copilot' ); ?></strong>
			<?php esc_html_e( 'Start by clicking \'Run Full Audit\' to analyze all your posts and get your site\'s SEO health score.', 'seo-copilot' ); ?>
		</div>
	</div>
	<?php endif; ?>

	<!-- Hidden audit progress bar -->
	<div id="audit-progress-bar" style="display:none; background:var(--sc-primary-light); border-radius:8px; padding:12px 16px; margin-bottom:16px; font-size:13px; color:var(--sc-primary-dark);">
		<div style="background:var(--sc-border); border-radius:10px; height:8px; overflow:hidden; margin-top:8px;">
			<div id="audit-progress-fill" class="sc-progress-bar" style="width:0%;"></div>
		</div>
		<span id="audit-progress-text" style="display:block; margin-top:6px; font-size:12px;">Starting audit...</span>
	</div>

	<!-- Stats Grid -->
	<div class="sc-stats-grid">

		<div class="sc-stat-card">
			<div class="sc-stat-label"><?php esc_html_e( 'Site SEO Health', 'seo-copilot' ); ?></div>
			<div class="sc-stat-value"><?php echo esc_html( $health_score ); ?><span style="font-size:16px;font-weight:400;color:var(--sc-grey);">/100</span></div>
			<div class="sc-stat-sub">Overall site health score</div>
		</div>

		<div class="sc-stat-card sc-card-success">
			<div class="sc-stat-label"><?php esc_html_e( 'Posts Analyzed', 'seo-copilot' ); ?></div>
			<div class="sc-stat-value"><?php echo esc_html( $coverage['analyzed'] ); ?><span style="font-size:16px;font-weight:400;color:var(--sc-grey);"> / <?php echo esc_html( $coverage['total'] ); ?></span></div>
			<div class="sc-progress" style="margin-top:8px;"><div class="sc-progress-bar bar-success" style="width:<?php echo esc_attr( $coverage['percentage'] ); ?>%;"></div></div>
		</div>

		<div class="sc-stat-card sc-card-danger">
			<div class="sc-stat-label"><?php esc_html_e( 'Critical Issues', 'seo-copilot' ); ?></div>
			<div class="sc-stat-value"><?php echo esc_html( $critical_count ); ?></div>
			<div class="sc-stat-sub"><?php esc_html_e( 'Posts scoring below 50', 'seo-copilot' ); ?></div>
		</div>

		<div class="sc-stat-card sc-card-warning">
			<div class="sc-stat-label"><?php esc_html_e( 'Quick Wins Available', 'seo-copilot' ); ?></div>
			<div class="sc-stat-value"><?php echo esc_html( $quick_wins ); ?></div>
			<div class="sc-stat-sub"><?php esc_html_e( 'Posts scoring 60-79', 'seo-copilot' ); ?></div>
		</div>

	</div>

	<!-- Main Grid -->
	<div class="sc-two-col">
		
		<!-- LEFT COLUMN -->
		<div class="grid-left">
			
			<div class="sc-card">
				<div class="sc-card-header">
					<h3><?php esc_html_e( 'Posts Needing Attention', 'seo-copilot' ); ?></h3>
				</div>
				<div class="sc-card-body" style="padding:0;">
					<?php if ( $needing_attention->have_posts() ) : ?>
					<div class="sc-table-wrap">
					<table class="sc-table">
							<thead>
								<tr>
									<th><?php esc_html_e( 'Post Title', 'seo-copilot' ); ?></th>
									<th><?php esc_html_e( 'Score', 'seo-copilot' ); ?></th>
									<th><?php esc_html_e( 'Top Issue', 'seo-copilot' ); ?></th>
									<th><?php esc_html_e( 'Last Analyzed', 'seo-copilot' ); ?></th>
									<th><?php esc_html_e( 'Action', 'seo-copilot' ); ?></th>
								</tr>
							</thead>
							<tbody>
								<?php while ( $needing_attention->have_posts() ) : $needing_attention->the_post(); 
									$score = get_post_meta( get_the_ID(), '_seo_copilot_score', true );
									$issues_json = get_post_meta( get_the_ID(), '_seo_copilot_issues', true );
									$issues = json_decode( $issues_json, true );
									$top_issue = ( is_array( $issues ) && ! empty( $issues ) ) ? wp_trim_words( $issues[0], 5, '...' ) : '&mdash;';
									$date = get_the_modified_date( 'M j, Y' );
								?>
									<tr>
										<td><strong><a href="<?php echo esc_url( get_edit_post_link() ); ?>" target="_blank"><?php the_title(); ?></a></strong></td>
										<td><?php echo seo_copilot_get_score_badge( $score ); ?></td>
										<td><span class="issue-truncate"><?php echo esc_html( $top_issue ); ?></span></td>
										<td class="text-muted"><?php echo esc_html( $date ); ?></td>
										<td><a href="<?php echo esc_url( get_edit_post_link() ); ?>" class="seo-copilot-btn secondary small" target="_blank"><?php esc_html_e( 'Fix Now', 'seo-copilot' ); ?></a></td>
									</tr>
								<?php endwhile; wp_reset_postdata(); ?>
							</tbody>
						</table>
						<div class="table-footer">
							<a href="#" class="view-all-link"><?php esc_html_e( 'View all in Site Audit', 'seo-copilot' ); ?> &rarr;</a>
						</div>
					<?php else : ?>
						<div class="empty-state">
							<div class="empty-icon">🎉</div>
							<h3><?php esc_html_e( 'All posts are looking great!', 'seo-copilot' ); ?></h3>
							<p><?php esc_html_e( 'We couldn\'t find any posts requiring urgent attention.', 'seo-copilot' ); ?></p>
						</div>
					<?php endif; ?>
				</div>
			</div>

			<div class="sc-card">
				<div class="sc-card-header">
					<h3><?php esc_html_e( 'Recent Activity', 'seo-copilot' ); ?></h3>
				</div>
				<div class="sc-card-body">
					<?php if ( ! empty( $recent_activity ) ) : ?>
						<ul class="sc-timeline">
							<?php foreach ( $recent_activity as $act ) : 
								$post_title = get_the_title( $act->post_id );
								$data = json_decode( $act->event_data, true );
								$score = isset( $data['score'] ) ? intval( $data['score'] ) : '';
								$time_diff = human_time_diff( strtotime( $act->created_at ), current_time( 'timestamp' ) );
							?>
								<li>
								<div class="sc-timeline-dot dot-success"></div>
								<div>
										<strong><?php echo esc_html( $post_title ); ?></strong> <?php esc_html_e( 'was analyzed.', 'seo-copilot' ); ?>
										<?php if ( $score ) : ?>
											— <?php esc_html_e( 'Score:', 'seo-copilot' ); ?> <?php echo seo_copilot_get_score_badge( $score ); ?>
										<?php endif; ?>
										<div class="timeline-time"><?php echo esc_html( $time_diff ); ?> <?php esc_html_e( 'ago', 'seo-copilot' ); ?></div>
									</div>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php else : ?>
						<div class="empty-state small">
							<p><?php esc_html_e( 'No activity yet. Analyze a post to start seeing history here.', 'seo-copilot' ); ?></p>
						</div>
					<?php endif; ?>
				</div>
			</div>

		</div>

		<!-- RIGHT COLUMN -->
		<div class="grid-right">
			
			<!-- AI Provider Widget -->
			<div class="seo-copilot-card ai-provider-widget">
				<div class="card-header">
					<h2><?php esc_html_e( 'AI Provider Status', 'seo-copilot' ); ?></h2>
				</div>
				<div class="card-body">
					<div class="provider-info">
						<div class="provider-logo <?php echo esc_attr( $provider ); ?>"></div>
						<div>
							<strong><?php echo esc_html( $provider_label ); ?></strong>
							<div class="provider-status <?php echo $is_connected ? 'connected' : 'disconnected'; ?>">
								<span class="dashicons dashicons-<?php echo $is_connected ? 'yes' : 'warning'; ?>"></span> 
								<?php echo $is_connected ? esc_html__( 'Connected', 'seo-copilot' ) : esc_html__( 'Not Configured', 'seo-copilot' ); ?>
							</div>
						</div>
					</div>
					<hr class="minimal">
					<div class="api-usage">
						<span class="usage-label"><?php esc_html_e( 'API Calls This Month:', 'seo-copilot' ); ?></span>
						<span class="usage-count"><?php echo esc_html( number_format_i18n( $api_calls ) ); ?></span>
					</div>
					<div class="widget-footer">
						<a href="<?php echo esc_url( admin_url( 'admin.php?page=seo-copilot-settings' ) ); ?>"><?php esc_html_e( 'Configure', 'seo-copilot' ); ?> &rarr;</a>
					</div>
				</div>
			</div>

			<!-- GA4 Provider Widget -->
			<div class="seo-copilot-card">
				<div class="card-header">
					<h2><?php esc_html_e( 'Traffic Overview (30 Days)', 'seo-copilot' ); ?></h2>
				</div>
				<div class="card-body no-padding">
					<?php if ( $ga4_connected ) : ?>
						<ul class="seo-copilot-list striped">
							<li class="list-item performance-item">
								<div class="item-main"><strong>Sessions</strong></div>
								<div class="item-score" style="font-weight: bold;"><?php echo number_format($traffic['sessions']); ?></div>
							</li>
							<li class="list-item performance-item">
								<div class="item-main"><strong>Users</strong></div>
								<div class="item-score" style="font-weight: bold;"><?php echo number_format($traffic['users']); ?></div>
							</li>
							<li class="list-item performance-item">
								<div class="item-main"><strong>Bounce Rate</strong></div>
								<div class="item-score" style="font-weight: bold;"><?php echo $traffic['bounce']; ?>%</div>
							</li>
						</ul>
					<?php else : ?>
						<div class="empty-state small" style="padding-bottom:15px;">
							<p><?php esc_html_e( 'Connect GA4 for real traffic data.', 'seo-copilot' ); ?></p>
							<a href="<?php echo esc_url( admin_url( 'admin.php?page=seo-copilot-settings' ) ); ?>" class="button button-small">Connect GA4</a>
						</div>
					<?php endif; ?>
				</div>
			</div>

			<!-- Top Performers -->
			<div class="seo-copilot-card">
				<div class="card-header">
					<h2><?php esc_html_e( 'Top Performing Posts', 'seo-copilot' ); ?></h2>
				</div>
				<div class="card-body no-padding">
					<?php if ( $top_performing->have_posts() ) : ?>
						<ul class="seo-copilot-list striped">
							<?php while ( $top_performing->have_posts() ) : $top_performing->the_post(); 
								$score = get_post_meta( get_the_ID(), '_seo_copilot_score', true );
								$date = get_the_modified_date( 'M j, Y' );
							?>
								<li class="list-item performance-item">
									<div class="item-main">
										<strong><a href="<?php echo esc_url( get_edit_post_link() ); ?>" target="_blank"><?php echo wp_trim_words( get_the_title(), 5, '...' ); ?></a></strong>
										<span class="item-meta"><?php echo esc_html( $date ); ?></span>
									</div>
									<div class="item-score"><?php echo seo_copilot_get_score_badge( $score ); ?></div>
								</li>
							<?php endwhile; wp_reset_postdata(); ?>
						</ul>
					<?php else : ?>
						<div class="empty-state small"><p><?php esc_html_e( 'Analyze posts to see top performers.', 'seo-copilot' ); ?></p></div>
					<?php endif; ?>
				</div>
			</div>

			<!-- Keyword Conflicts -->
			<div class="seo-copilot-card widget-conflicts">
				<div class="card-header">
					<h2><?php esc_html_e( 'Keyword Conflicts', 'seo-copilot' ); ?></h2>
					<span class="seo-copilot-badge count">0</span>
				</div>
				<div class="card-body">
					<div class="success-state">
						<span class="dashicons dashicons-yes-alt"></span> <?php esc_html_e( 'No conflicts detected ✓', 'seo-copilot' ); ?>
					</div>
				</div>
			</div>

			<!-- Content Decay -->
			<div class="seo-copilot-card widget-decay">
				<div class="card-header">
					<h2><?php esc_html_e( 'Content Decay Alerts', 'seo-copilot' ); ?></h2>
					<span class="seo-copilot-badge count">0</span>
				</div>
				<div class="card-body">
					<div class="success-state">
						<span class="dashicons dashicons-yes-alt"></span> <?php esc_html_e( 'No decay detected ✓', 'seo-copilot' ); ?>
					</div>
				</div>
			</div>

		</div>

	</div>

	<!-- Bottom Actions Row -->
	<h2 class="section-title"><?php esc_html_e( 'Quick Actions', 'seo-copilot' ); ?></h2>
	<div class="seo-copilot-actions-row">
		
		<!-- Action 1 -->
		<div class="action-card" id="action-batch-analyze">
			<div class="action-icon bg-blue-light"><span class="dashicons dashicons-search"></span></div>
			<h3><?php esc_html_e( 'Analyze All Posts', 'seo-copilot' ); ?></h3>
			<p><?php esc_html_e( 'Run a bulk background analysis on all unanalyzed posts.', 'seo-copilot' ); ?></p>
			<button class="sc-btn sc-btn-primary sc-btn-block" style="margin-bottom:10px;" data-action="analyze"><?php esc_html_e( 'Analyze All Posts', 'seo-copilot' ); ?></button>
			<button class="sc-btn sc-btn-outline sc-btn-block" style="margin-bottom:10px;" data-action="meta"><?php esc_html_e( 'Generate Missing Meta (AI)', 'seo-copilot' ); ?></button>
			<div class="action-progress" style="display:none;">
				<div class="progress-bar"><div class="fill shimmer" style="width:0%"></div></div>
				<span class="progress-text">Analyzing...</span>
			</div>
		</div>

		<!-- Action 2 -->
		<div class="action-card" id="action-batch-meta">
			<div class="action-icon bg-purple-light"><span class="dashicons dashicons-superhero"></span></div>
			<h3><?php esc_html_e( 'Generate Missing Meta', 'seo-copilot' ); ?></h3>
			<p><?php esc_html_e( 'Use AI to auto-generate titles and descriptions for posts missing them.', 'seo-copilot' ); ?></p>
			<button class="seo-copilot-btn secondary wide" data-action="meta"><?php esc_html_e( 'Generate with AI', 'seo-copilot' ); ?></button>
			<div class="action-progress" style="display:none;">
				<div class="progress-bar"><div class="fill shimmer" style="width:0%"></div></div>
				<span class="progress-text">Generating...</span>
			</div>
		</div>

		<!-- Action 3 -->
		<div class="action-card" id="action-export-csv">
			<div class="action-icon bg-green-light"><span class="dashicons dashicons-download"></span></div>
			<h3><?php esc_html_e( 'Export SEO Report', 'seo-copilot' ); ?></h3>
			<p><?php esc_html_e( 'Download a complete CSV report of your site\'s SEO health and metrics.', 'seo-copilot' ); ?></p>
			<form action="<?php echo esc_url( admin_url('admin-ajax.php') ); ?>" method="POST" target="_blank">
				<input type="hidden" name="action" value="seo_copilot_export_csv">
				<input type="hidden" name="nonce" value="<?php echo wp_create_nonce('seo_copilot_admin_nonce'); ?>">
				<button type="submit" class="seo-copilot-btn secondary wide"><?php esc_html_e( 'Download CSV', 'seo-copilot' ); ?></button>
			</form>
		</div>

	</div>

</div>
