<?php
/**
 * Site Audit View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

$options    = get_option( 'seo_copilot_settings', [] );
$post_types = isset( $options['post_types'] ) ? $options['post_types'] : [ 'post', 'page' ];

// Handle filtering and sorting safely
$filter_type = isset( $_GET['filter_type'] ) ? sanitize_text_field( wp_unslash( $_GET['filter_type'] ) ) : 'all';
$filter_post_type = isset( $_GET['post_type'] ) ? sanitize_text_field( wp_unslash( $_GET['post_type'] ) ) : '';
$search = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';
$orderby = isset( $_GET['orderby'] ) ? sanitize_text_field( wp_unslash( $_GET['orderby'] ) ) : 'score';
$paged = isset( $_GET['paged'] ) ? max( 1, intval( $_GET['paged'] ) ) : 1;

$args = [
	'post_type'      => $filter_post_type ? [ $filter_post_type ] : $post_types,
	'post_status'    => 'publish',
	'posts_per_page' => 50,
	'paged'          => $paged,
];

if ( $search ) {
	$args['s'] = $search;
}

// Meta queries for filtering
if ( 'critical' === $filter_type ) {
	$args['meta_query'] = [
		[
			'key'     => '_seo_copilot_score',
			'value'   => 50,
			'compare' => '<',
			'type'    => 'NUMERIC',
		]
	];
} elseif ( 'needs_work' === $filter_type ) {
	$args['meta_query'] = [
		[
			'key'     => '_seo_copilot_score',
			'value'   => [ 50, 79 ],
			'compare' => 'BETWEEN',
			'type'    => 'NUMERIC',
		]
	];
} elseif ( 'good' === $filter_type ) {
	$args['meta_query'] = [
		[
			'key'     => '_seo_copilot_score',
			'value'   => 80,
			'compare' => '>=',
			'type'    => 'NUMERIC',
		]
	];
}

// Sorting logic
if ( 'title' === $orderby ) {
	$args['orderby'] = 'title';
	$args['order']   = 'ASC';
} elseif ( 'date' === $orderby ) {
	$args['orderby'] = 'date';
	$args['order']   = 'DESC';
} else {
	// Default: Score ASC
	$args['meta_key'] = '_seo_copilot_score';
	$args['orderby']  = 'meta_value_num';
	$args['order']    = 'ASC';
}

$query = new \WP_Query( $args );

$last_audit = get_option( 'seo_copilot_last_audit_date' );
$audit_date = $last_audit ? date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $last_audit ) ) : __( 'Never', 'seo-copilot' );

// Quick overview stats (Simulating total counts for UI mockup)
$total_posts = wp_count_posts( 'post' )->publish + wp_count_posts( 'page' )->publish;
$avg_score = ( new SEO_Copilot_Admin() )->get_site_health_score();
$critical_count = ( new SEO_Copilot_Admin() )->get_critical_issues_count();

function seo_copilot_get_score_badge( $score ) {
	$score = intval( $score );
	if ( ! $score ) return '<span class="seo-copilot-badge none">&mdash;</span>';
	$class = 'red';
	if ( $score >= 50 && $score < 80 ) $class = 'orange';
	if ( $score >= 80 ) $class = 'green';
	return '<span class="seo-copilot-badge ' . $class . '">' . $score . '</span>';
}
?>

<div class="wrap seo-copilot-page">
	
	<!-- Page Header -->
	<div class="sc-page-header">
		<div class="sc-page-header-left">
			<div class="sc-page-icon">🔍</div>
			<div>
				<h1 class="sc-page-title"><?php esc_html_e( 'Site Audit', 'seo-copilot' ); ?></h1>
				<p class="sc-page-subtitle"><?php printf( esc_html__( 'Scan every page on your site and get a detailed SEO health report · Last run: %s', 'seo-copilot' ), esc_html( $audit_date ) ); ?></p>
			</div>
		</div>
		<div class="sc-page-header-right">
			<button class="sc-btn sc-btn-primary" id="btn-run-batch-audit">
				<span class="dashicons dashicons-update"></span> <?php esc_html_e( 'Run New Audit', 'seo-copilot' ); ?>
			</button>
		</div>
	</div>

	<!-- Tip Box -->
	<div class="sc-tip-box">
		<span class="sc-tip-icon">💡</span>
		<div class="sc-tip-text">
			<strong><?php esc_html_e( 'Pro Tip', 'seo-copilot' ); ?></strong>
			<?php esc_html_e( 'Run a full audit first, then focus on posts with scores below 50. Fixing critical issues on your top-traffic pages delivers the fastest ranking improvements.', 'seo-copilot' ); ?>
		</div>
	</div>

	<!-- Audit Progress Bar -->
	<div id="audit-progress-bar" style="display:none; background:var(--sc-primary-light); border-radius:8px; padding:12px 16px; margin-bottom:16px; font-size:13px; color:var(--sc-primary-dark);">
		<div style="background:var(--sc-border); border-radius:10px; height:8px; overflow:hidden; margin-top:8px;">
			<div id="audit-progress-fill" class="sc-progress-bar" style="width:0%;"></div>
		</div>
		<span id="audit-progress-text" style="display:block; margin-top:6px; font-size:12px;">Analyzing... 0%</span>
	</div>

	<!-- Stats Grid -->
	<div class="sc-stats-grid">
		<div class="sc-stat-card">
			<div class="sc-stat-label"><?php esc_html_e( 'Total Posts', 'seo-copilot' ); ?></div>
			<div class="sc-stat-value"><?php echo esc_html( $total_posts ); ?></div>
		</div>
		<div class="sc-stat-card sc-card-success">
			<div class="sc-stat-label"><?php esc_html_e( 'Avg Health Score', 'seo-copilot' ); ?></div>
			<div class="sc-stat-value"><?php echo esc_html( $avg_score ); ?><span style="font-size:14px;font-weight:400;color:var(--sc-grey);">/100</span></div>
		</div>
		<div class="sc-stat-card sc-card-danger">
			<div class="sc-stat-label"><?php esc_html_e( 'Critical Issues', 'seo-copilot' ); ?></div>
			<div class="sc-stat-value"><?php echo esc_html( $critical_count ); ?></div>
		</div>
		<div class="sc-stat-card sc-card-success">
			<div class="sc-stat-label"><?php esc_html_e( 'Passing URLs', 'seo-copilot' ); ?></div>
			<div class="sc-stat-value"><?php echo esc_html( max( 0, $total_posts - $critical_count ) ); ?></div>
		</div>
	</div>

	<!-- Filters Bar -->
	<div class="sc-card" style="margin-bottom:16px;">
		<div class="sc-filters-bar">
			<form method="GET" style="display:flex;width:100%;justify-content:space-between;gap:8px;flex-wrap:wrap;">
				<input type="hidden" name="page" value="seo-copilot-site-audit">
				<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
					<select name="filter_type">
						<option value="all" <?php selected( $filter_type, 'all' ); ?>><?php esc_html_e( 'All Scores', 'seo-copilot' ); ?></option>
						<option value="critical" <?php selected( $filter_type, 'critical' ); ?>><?php esc_html_e( 'Critical (0-49)', 'seo-copilot' ); ?></option>
						<option value="needs_work" <?php selected( $filter_type, 'needs_work' ); ?>><?php esc_html_e( 'Needs Work (50-79)', 'seo-copilot' ); ?></option>
						<option value="good" <?php selected( $filter_type, 'good' ); ?>><?php esc_html_e( 'Good (80-100)', 'seo-copilot' ); ?></option>
					</select>
					<select name="post_type">
						<option value=""><?php esc_html_e( 'All Post Types', 'seo-copilot' ); ?></option>
						<?php foreach ( $post_types as $pt ) : ?>
							<option value="<?php echo esc_attr( $pt ); ?>" <?php selected( $filter_post_type, $pt ); ?>><?php echo esc_html( ucfirst( $pt ) ); ?></option>
						<?php endforeach; ?>
					</select>
					<select name="orderby">
						<option value="score" <?php selected( $orderby, 'score' ); ?>><?php esc_html_e( 'Score ↑', 'seo-copilot' ); ?></option>
						<option value="date" <?php selected( $orderby, 'date' ); ?>><?php esc_html_e( 'Date ↓', 'seo-copilot' ); ?></option>
						<option value="title" <?php selected( $orderby, 'title' ); ?>><?php esc_html_e( 'Title ↑', 'seo-copilot' ); ?></option>
					</select>
					<button type="submit" class="sc-btn sc-btn-outline sc-btn-sm"><?php esc_html_e( 'Apply', 'seo-copilot' ); ?></button>
				</div>
				<div style="display:flex;gap:8px;align-items:center;">
					<input type="search" name="s" value="<?php echo esc_attr( $search ); ?>" placeholder="<?php esc_attr_e( 'Search posts...', 'seo-copilot' ); ?>">
					<button type="submit" class="sc-btn sc-btn-primary sc-btn-sm"><?php esc_html_e( 'Search', 'seo-copilot' ); ?></button>
				</div>
			</form>
		</div>
	</div>

	<!-- Results Table -->
	<div class="sc-card" style="margin-bottom:0;">
		<div class="sc-card-body" style="padding:0;">
			<?php if ( $query->have_posts() ) : ?>
				<table class="sc-table">
					<thead>
						<tr>
							<th width="30%"><?php esc_html_e( 'Post Title / URL', 'seo-copilot' ); ?></th>
							<th width="10%"><?php esc_html_e( 'Score', 'seo-copilot' ); ?></th>
							<th width="15%"><?php esc_html_e( 'Focus Keyword', 'seo-copilot' ); ?></th>
							<th width="15%"><?php esc_html_e( 'Issues', 'seo-copilot' ); ?></th>
							<th width="10%"><?php esc_html_e( 'Analyzed', 'seo-copilot' ); ?></th>
							<th width="20%"><?php esc_html_e( 'Actions', 'seo-copilot' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php while ( $query->have_posts() ) : $query->the_post(); 
							$id = get_the_ID();
							$score = get_post_meta( $id, '_seo_copilot_score', true );
							$keyword = get_post_meta( $id, '_seo_copilot_focus_keyword', true );
							$issues_json = get_post_meta( $id, '_seo_copilot_issues', true );
							$issues = json_decode( $issues_json, true );
							$issues_count = is_array( $issues ) ? count( $issues ) : 0;
							$date = get_the_modified_date( 'M j, Y' );
						?>
							<tr class="audit-row" data-post-id="<?php echo esc_attr( $id ); ?>">
								<td>
									<strong><a href="<?php echo esc_url( get_edit_post_link() ); ?>" target="_blank"><?php the_title(); ?></a></strong>
									<div class="row-url" style="font-size:11px;color:#666;"><?php echo str_replace( home_url(), '', get_permalink() ); ?></div>
								</td>
								<td><?php echo seo_copilot_get_score_badge( $score ); ?></td>
								<td>
									<?php if ( $keyword ) : ?>
										<span class="seo-copilot-badge none"><?php echo esc_html( $keyword ); ?></span>
									<?php else : ?>
										<span style="color:#8c8f94;font-style:italic;">&mdash;</span>
									<?php endif; ?>
								</td>
								<td>
									<?php if ( $issues_count > 0 ) : ?>
										<span class="dashicons dashicons-warning text-orange" style="font-size:16px;width:16px;"></span> <?php echo $issues_count; ?> issues
									<?php else : ?>
										<span class="dashicons dashicons-yes text-green" style="font-size:16px;width:16px;"></span> Clean
									<?php endif; ?>
								</td>
								<td class="text-muted"><?php echo esc_html( $date ); ?></td>
								<td>
									<div class="row-actions">
										<button type="button" class="button toggle-details"><?php esc_html_e( 'Details', 'seo-copilot' ); ?> &darr;</button>
										<button type="button" class="button run-ai-suggestions" data-id="<?php echo esc_attr( $id ); ?>">
											<span class="dashicons dashicons-superhero"></span> AI fix
										</button>
										<a href="<?php echo esc_url( get_edit_post_link() ); ?>" class="button button-primary" target="_blank"><?php esc_html_e( 'Fix', 'seo-copilot' ); ?></a>
									</div>
								</td>
							</tr>
							<!-- Expanded row -->
							<tr class="audit-details-row" id="details-<?php echo esc_attr( $id ); ?>" style="display:none;">
								<td colspan="6">
									<div class="audit-details-content">
										<div class="issues-list">
											<strong><?php esc_html_e( 'Issue Breakdown:', 'seo-copilot' ); ?></strong>
											<?php if ( $issues_count > 0 ) : ?>
												<ul style="margin-top:8px;padding-left:16px;list-style:disc;">
													<?php foreach ( $issues as $issue ) : 
														$class = strpos( strtolower($issue), 'critical' ) !== false ? 'text-red' : 'text-orange';
													?>
														<li class="<?php echo $class; ?>"><?php echo esc_html( $issue ); ?></li>
													<?php endforeach; ?>
												</ul>
											<?php else : ?>
												<p class="text-green"><?php esc_html_e( 'Perfectly optimized! No issues detected.', 'seo-copilot' ); ?></p>
											<?php endif; ?>
										</div>
										<div class="ai-response-container" id="ai-response-<?php echo esc_attr( $id ); ?>"></div>
									</div>
								</td>
							</tr>
						<?php endwhile; wp_reset_postdata(); ?>
					</tbody>
				</table>

				<!-- Pagination -->
				<?php if ( $query->max_num_pages > 1 ) : ?>
					<div class="seo-copilot-pagination">
						<?php 
						echo paginate_links( [
							'base'      => add_query_arg( 'paged', '%#%' ),
							'format'    => '',
							'prev_text' => '&laquo; Prev',
							'next_text' => 'Next &raquo;',
							'total'     => $query->max_num_pages,
							'current'   => $paged
						] );
						?>
					</div>
				<?php endif; ?>

			<?php else : ?>
				<div class="sc-empty-state">
					<span class="sc-empty-icon">📂</span>
					<h4><?php esc_html_e( 'No posts found', 'seo-copilot' ); ?></h4>
					<p><?php esc_html_e( 'Run a new audit to analyze your posts, or adjust your filters.', 'seo-copilot' ); ?></p>
					<button class="sc-btn sc-btn-primary" id="btn-run-batch-audit-empty"><?php esc_html_e( 'Run New Audit', 'seo-copilot' ); ?></button>
				</div>
			<?php endif; ?>
		</div>
	</div>
	<script>document.getElementById('btn-run-batch-audit-empty') && document.getElementById('btn-run-batch-audit-empty').addEventListener('click', function(){ document.getElementById('btn-run-batch-audit') && document.getElementById('btn-run-batch-audit').click(); });</script>

	<!-- Nonce for JS -->
	<input type="hidden" id="seo_copilot_admin_nonce" value="<?php echo wp_create_nonce( 'seo_copilot_admin_nonce' ); ?>" />

</div>

<style>
.audit-details-row td { padding: 0 !important; border-bottom: 2px solid var(--sc-border) !important; background: var(--sc-light); }
.audit-details-content { padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.ai-response-container { background: var(--sc-white); border: 1px solid var(--sc-border); padding: 16px; border-radius: var(--sc-radius); font-size: 13px; }
.seo-copilot-pagination { padding: 16px 24px; border-top: 1px solid var(--sc-border); text-align: right; }
.seo-copilot-pagination .page-numbers { display: inline-block; padding: 6px 12px; border: 1px solid var(--sc-border); text-decoration: none; border-radius: var(--sc-radius); color: var(--sc-primary); font-weight: 500; font-size: 13px; margin-left: 4px; }
.seo-copilot-pagination .current { background: var(--sc-primary); color: #fff; border-color: var(--sc-primary); }
.ai-loading-shimmer { width: 100%; height: 60px; background: linear-gradient(90deg, var(--sc-border) 25%, var(--sc-light) 50%, var(--sc-border) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; border-radius: var(--sc-radius); }
@keyframes shimmer { to { background-position: -200% 0; } }
.row-actions { display: flex; gap: 6px; }
</style>

<script>
jQuery(document).ready(function($) {
	// Accordion for details
	$('.toggle-details').on('click', function() {
		var $btn = $(this);
		var $row = $btn.closest('tr').next('.audit-details-row');
		$row.fadeToggle(200);
	});

	// AI Suggestions fetcher
	$('.run-ai-suggestions').on('click', function() {
		var $btn = $(this);
		var postId = $btn.data('id');
		var $container = $('#ai-response-' + postId);
		var $row = $btn.closest('tr').next('.audit-details-row');

		$row.fadeIn(200);
		$container.html('<div class="ai-loading-shimmer"></div>');
		$btn.prop('disabled', true);

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'seo_copilot_get_ai_suggestions',
				nonce: $('#seo_copilot_admin_nonce').val(),
				post_id: postId
			},
			success: function(res) {
				$btn.prop('disabled', false);
				if (res.success && res.data) {
					// We assume res.data contains strings/arrays of suggestions. Just dumping it structured.
					var html = '<strong>AI Insights:</strong><br><br>';
					if (typeof res.data === 'string') {
						html += '<p>' + res.data.replace(/\n/g, '<br>') + '</p>';
					} else {
						html += '<pre>' + JSON.stringify(res.data, null, 2) + '</pre>';
					}
					$container.html(html);
				} else {
					$container.html('<div class="text-red">AI Failed: ' + (res.data || 'Unknown error.') + '</div>');
				}
			},
			error: function() {
				$btn.prop('disabled', false);
				$container.html('<div class="text-red">Server error connecting to AI.</div>');
			}
		});
	});

	// Batch Runner
	$('#btn-run-batch-audit').on('click', function(e) {
		e.preventDefault();
		var $btn = $(this);
		var $bar = $('#audit-progress-bar');
		var $fill = $('#audit-progress-fill');
		var $text = $('#audit-progress-text');
		var nonce = $('#seo_copilot_admin_nonce').val();

		$btn.prop('disabled', true).addClass('loading');
		$bar.slideDown(200);
		$text.show();

		function runBatch(offset) {
			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'seo_copilot_run_batch_audit',
					nonce: nonce,
					offset: offset
				},
				success: function(res) {
					if (res.success && res.data) {
						if (res.data.finished) {
							// Done!
							$fill.css('width', '100%');
							$text.text('Audit Complete! Refreshing...');
							setTimeout(function() {
								location.reload();
							}, 1500);
						} else {
							// Calculate percentage safely
							var total = res.data.total;
							var current = res.data.next_offset;
							var pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 100;
							
							$fill.css('width', pct + '%');
							$text.text('Analyzing ' + current + ' of ' + total + '... ' + pct + '%');

							runBatch(res.data.next_offset); // Recursive call for next batch
						}
					} else {
						alert("Batch audit failed or stopped.");
						$btn.prop('disabled', false).removeClass('loading');
						$bar.slideUp();
					}
				},
				error: function() {
					alert("Server error during batch processing.");
					$btn.prop('disabled', false).removeClass('loading');
					$bar.slideUp();
				}
			});
		}

		// Init audit loop
		runBatch(0);
	});
});
</script>
