<?php
/**
 * Content Decay View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

$decay_instance = new SEO_Copilot_Content_Decay();
$posts_data = $decay_instance->get_all_decay_data();

$filter = isset( $_GET['filter_decay'] ) ? sanitize_text_field( wp_unslash( $_GET['filter_decay'] ) ) : 'all';

// Tally counts
$total = count( $posts_data );
$healthy_count = 0;
$at_risk_count = 0; // high & medium

$filtered_data = [];
foreach ( $posts_data as $pd ) {
	if ( $pd['risk_score'] >= 40 ) {
		$at_risk_count++;
		if ( 'all' === $filter || 'risk' === $filter ) {
			$filtered_data[] = $pd;
		}
	} else {
		$healthy_count++;
		if ( 'all' === $filter || 'healthy' === $filter ) {
			$filtered_data[] = $pd;
		}
	}
}

// Render SVG sparkline
function seo_copilot_render_sparkline( $points ) {
	if ( empty( $points ) || count( $points ) === 1 ) {
		return '<span class="text-muted" style="font-size:11px;">Not enough data</span>';
	}
	
	// Normalize to 5 points max
	$points = array_slice( $points, -5 );
	$count = count( $points );
	$max_x = 80;
	$max_y = 30; // height of sparkline
	
	$step_x = $max_x / ( $count - 1 );
	
	// We map 0-100 score to 0-$max_y height (inverted so 100 is top)
	$path_d = '';
	for ( $i = 0; $i < $count; $i++ ) {
		$x = $i * $step_x;
		// If score is 100, y=0. If score is 0, y=$max_y
		$y = $max_y - ( ( $points[$i] / 100 ) * $max_y );
		
		if ( $i === 0 ) {
			$path_d .= "M {$x} {$y}";
		} else {
			$path_d .= " L {$x} {$y}";
		}
	}

	$stroke = '#8c8f94'; // default
	// color based on trend: if last point is lower than first point
	if ( $points[ $count - 1 ] < $points[0] ) {
		$stroke = '#d63638'; // decaying
	} elseif ( $points[ $count - 1 ] > $points[0] ) {
		$stroke = '#008a20'; // improving
	}

	return '<svg width="80" height="30" class="sparkline"><path d="' . $path_d . '" fill="none" stroke="' . $stroke . '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

?>

<div class="wrap seo-copilot-page">
	
	<!-- Page Header -->
	<div class="sc-page-header">
		<div class="sc-page-header-left">
			<div class="sc-page-icon">📉</div>
			<div>
				<h1 class="sc-page-title"><?php esc_html_e( 'Content Decay Tracker', 'seo-copilot' ); ?></h1>
				<p class="sc-page-subtitle"><?php esc_html_e( 'Identify posts losing SEO value before they fall off Google', 'seo-copilot' ); ?></p>
			</div>
		</div>
		<div class="sc-page-header-right">
			<form method="GET" style="display:inline-block;">
				<input type="hidden" name="page" value="seo-copilot-content-decay">
				<select name="filter_decay" onchange="this.form.submit()" style="padding:7px 12px;border:1px solid var(--sc-border);border-radius:6px;font-size:13px;">
					<option value="all" <?php selected( $filter, 'all' ); ?>><?php esc_html_e( 'Show all posts', 'seo-copilot' ); ?></option>
					<option value="risk" <?php selected( $filter, 'risk' ); ?>><?php esc_html_e( 'At Risk Only', 'seo-copilot' ); ?></option>
					<option value="healthy" <?php selected( $filter, 'healthy' ); ?>><?php esc_html_e( 'Healthy Only', 'seo-copilot' ); ?></option>
				</select>
			</form>
		</div>
	</div>

	<!-- Tip Box -->
	<div class="sc-tip-box sc-tip-warning">
		<span class="sc-tip-icon">💡</span>
		<div class="sc-tip-text">
			<strong><?php esc_html_e( 'Watch for Decay', 'seo-copilot' ); ?></strong>
			<?php esc_html_e( 'Content older than 6 months without updates is at risk of losing rankings. Use "AI Revival Plan" to get specific recommendations to refresh each post.', 'seo-copilot' ); ?>
		</div>
	</div>

	<!-- Legend -->
	<div class="decay-legend">
		<span class="legend-item"><span class="legend-dot red"></span> <?php esc_html_e( 'High Risk (70-100)', 'seo-copilot' ); ?></span>
		<span class="legend-item"><span class="legend-dot orange"></span> <?php esc_html_e( 'Medium Risk (40-69)', 'seo-copilot' ); ?></span>
		<span class="legend-item"><span class="legend-dot green"></span> <?php esc_html_e( 'Healthy (0-39)', 'seo-copilot' ); ?></span>
	</div>

	<?php if ( ! empty( $filtered_data ) ) : ?>
		
	<div class="sc-card" style="margin-bottom:0;">
		<div class="sc-card-body" style="padding:0;">
			<table class="sc-table">
					<thead>
						<tr>
							<th width="35%"><?php esc_html_e( 'Post Title', 'seo-copilot' ); ?></th>
							<th width="15%"><?php esc_html_e( 'Risk Level', 'seo-copilot' ); ?></th>
							<th width="25%"><?php esc_html_e( 'Decay Signals', 'seo-copilot' ); ?></th>
							<th width="10%"><?php esc_html_e( 'History', 'seo-copilot' ); ?></th>
							<th width="15%"><?php esc_html_e( 'Actions', 'seo-copilot' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $filtered_data as $pd ) : 
							$id = $pd['post_id'];
							$lvl = $pd['level'];
							$badge_class = 'sc-badge-success';
							$label = __( 'Healthy', 'seo-copilot' );
							if ( 'high' === $lvl ) { $badge_class = 'sc-badge-danger'; $label = __( 'High Risk', 'seo-copilot' ); }
							elseif ( 'medium' === $lvl ) { $badge_class = 'sc-badge-warning'; $label = __( 'Medium Risk', 'seo-copilot' ); }
						?>
							<tr id="decay-row-<?php echo esc_attr( $id ); ?>">
								<td>
									<strong><a href="<?php echo esc_url( get_edit_post_link( $id ) ); ?>" target="_blank"><?php echo esc_html( $pd['post_title'] ); ?></a></strong>
								</td>
								<td>
									<span class="sc-badge <?php echo esc_attr( $badge_class ); ?>"><?php echo esc_html( $label ); ?> (<?php echo intval( $pd['risk_score'] ); ?>)</span>
								</td>
								<td>
									<?php if ( ! empty( $pd['factors'] ) ) : ?>
										<div class="decay-signals-stack">
											<?php foreach ( $pd['factors'] as $factor ) : ?>
												<span class="decay-signal-tag"><span class="dashicons dashicons-warning"></span> <?php echo esc_html( $factor ); ?></span>
											<?php endforeach; ?>
										</div>
									<?php else : ?>
										<span class="text-muted"><?php esc_html_e( 'None detected', 'seo-copilot' ); ?></span>
									<?php endif; ?>
								</td>
								<td>
									<?php echo seo_copilot_render_sparkline( $pd['sparkline'] ); ?>
								</td>
								<td>
									<?php if ( 'healthy' !== $lvl ) : ?>
										<div style="display:flex; gap:6px; flex-direction:column;">
											<button class="seo-copilot-btn secondary small btn-get-revival" data-id="<?php echo esc_attr( $id ); ?>">
												<span class="dashicons dashicons-superhero"></span> <?php esc_html_e( 'AI Revival Plan', 'seo-copilot' ); ?>
											</button>
											<button class="seo-copilot-btn primary small btn-mark-refreshed" data-id="<?php echo esc_attr( $id ); ?>">
												<span class="dashicons dashicons-update"></span> <?php esc_html_e( 'Mark Refreshed', 'seo-copilot' ); ?>
											</button>
										</div>
									<?php else : ?>
										<span class="text-green"><span class="dashicons dashicons-yes"></span></span>
									<?php endif; ?>
								</td>
							</tr>
							<tr class="decay-details-row" id="revival-<?php echo esc_attr( $id ); ?>" style="display:none;">
								<td colspan="5">
									<div class="revival-container" id="revival-content-<?php echo esc_attr( $id ); ?>"></div>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</div>
		</div>

	<?php else : ?>
		
		<div class="sc-card">
			<div class="sc-empty-state">
				<div class="empty-icon" style="color:#008a20;"><span class="dashicons dashicons-yes-alt" style="font-size:60px;width:60px;height:60px;"></span></div>
				<h3>
					<?php 
					if ( 'risk' === $filter ) {
						esc_html_e( 'No posts at risk!', 'seo-copilot' ); 
					} else {
						esc_html_e( 'No posts found.', 'seo-copilot' );
					}
					?>
				</h3>
				<p><?php esc_html_e( 'Your content is fresh and fully optimized.', 'seo-copilot' ); ?></p>
			</div>
		</div>

	<?php endif; ?>

	<input type="hidden" id="seo_copilot_admin_nonce" value="<?php echo wp_create_nonce( 'seo_copilot_admin_nonce' ); ?>" />

</div>

<style>
/* Decay View Specific Styles */
.decay-legend { margin-bottom: 24px; display: flex; gap: 24px; padding: 0 8px; }
.legend-item { display: inline-flex; align-items: center; font-size: 13px; font-weight: 600; color: #3c434a; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
.legend-dot.red { background: #d63638; }
.legend-dot.orange { background: #dba617; }
.legend-dot.green { background: #008a20; }
.decay-signals-stack { display: flex; flex-direction: column; gap: 4px; }
.decay-signal-tag { display: inline-flex; align-items: center; background: #fdf2d0; color: #dba617; border: 1px solid #f9dc8e; font-size: 11px; padding: 2px 6px; border-radius: 4px; width: fit-content; }
.decay-signal-tag .dashicons { font-size: 12px; width: 12px; height: 12px; margin-right: 4px; }
.decay-details-row td { padding: 0 !important; background: #fdfdfd; border-bottom: 2px solid #e2e4e7 !important; }
.revival-container { padding: 24px; border-left: 4px solid #8224e3; }
.ai-loading-shimmer { width: 100%; height: 80px; background: linear-gradient(90deg, #f0f0f1 25%, #e2e4e7 50%, #f0f0f1 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; border-radius: 4px; }
.sparkline { display: block; overflow: visible; }
.seo-copilot-btn.small { padding: 4px 8px; font-size: 11px; }
.seo-copilot-btn.small .dashicons { font-size: 12px; width: 12px; height: 12px; }
</style>

<script>
jQuery(document).ready(function($) {

	// Get AI Revival Plan
	$('.btn-get-revival').on('click', function(e) {
		e.preventDefault();
		var $btn = $(this);
		var id = $btn.data('id');
		var $row = $('#revival-' + id);
		var $container = $('#revival-content-' + id);
		
		$row.fadeIn(200);
		$container.html('<div class="ai-loading-shimmer"></div>');
		$btn.prop('disabled', true);

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'seo_copilot_get_revival_plan',
				nonce: $('#seo_copilot_admin_nonce').val(),
				post_id: id
			},
			success: function(res) {
				$btn.prop('disabled', false);
				if(res.success && res.data) {
					var h = '<h4><span class="dashicons dashicons-superhero" style="color:#8224e3;"></span> AI Revival Plan</h4>';
					// In a real app the JSON structure from the AI would be exactly matched here.
					// based on prompt { priority_fixes: [], content_to_add: string, estimated_impact: string }
					if (res.data.priority_fixes && res.data.priority_fixes.length > 0) {
						h += '<strong>Priority Fixes:</strong><ul style="list-style:disc; margin-left:18px;">';
						res.data.priority_fixes.forEach(function(f) { h += '<li>' + f + '</li>'; });
						h += '</ul><br>';
					}
					if (res.data.content_to_add) {
						h += '<strong>Recommended Additions:</strong><p>' + res.data.content_to_add + '</p><br>';
					}
					if (res.data.estimated_impact) {
						h += '<strong>Estimated Impact:</strong> ' + res.data.estimated_impact;
					}
					if (!res.data.priority_fixes && !res.data.content_to_add) {
						// fallback string parsing
						h += '<p>' + JSON.stringify(res.data) + '</p>';
					}
					$container.html(h);
				} else {
					$container.html('<div class="text-red">AI Failed: ' + (res.data || 'Unknown error') + '</div>');
				}
			},
			error: function() {
				$btn.prop('disabled', false);
				$container.html('<div class="text-red">Server error connecting to AI.</div>');
			}
		});
	});

	// Mark Refreshed
	$('.btn-mark-refreshed').on('click', function(e) {
		e.preventDefault();
		if(!confirm("Did you update the content? This will reset the decay flags and history for this post.")) return;
		
		var $btn = $(this);
		var id = $btn.data('id');
		$btn.addClass('loading').prop('disabled', true);

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'seo_copilot_mark_refreshed',
				nonce: $('#seo_copilot_admin_nonce').val(),
				post_id: id
			},
			success: function(res) {
				if(res.success) {
					// update visual immediately or reload
					$('#decay-row-' + id).find('.seo-copilot-badge').removeClass('red orange').addClass('green').text("Healthy (0)");
					$('#decay-row-' + id).find('.decay-signals-stack').html('<span class="text-muted">Cleared</span>');
					$('#decay-row-' + id).find('.sparkline').remove();
					$('#revival-' + id).hide();
					$btn.remove();
					$('.btn-get-revival[data-id="'+id+'"]').remove();
				} else {
					alert("Failed to refresh.");
					$btn.removeClass('loading').prop('disabled', false);
				}
			},
			error: function() {
				alert("Server error.");
				$btn.removeClass('loading').prop('disabled', false);
			}
		});
	});

});
</script>
