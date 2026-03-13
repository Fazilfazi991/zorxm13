<?php
/**
 * Report Preview View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

$report_id = isset( $_GET['id'] ) ? intval( $_GET['id'] ) : 0;
if ( ! $report_id ) {
	echo '<div class="wrap"><h2>Report not found</h2></div>';
	return;
}

$reports_api = seo_copilot_client_reports();
$data        = $reports_api->generate_pdf_data( $report_id );

if ( ! $data ) {
	echo '<div class="wrap"><h2>Error loading report</h2></div>';
	return;
}

// Ensure defaults
$agency_color = $data['agency_color'] ?: '#4F46E5';
$sections     = $data['sections'] ?: [];
$rep          = $data['report_data'] ?: [];

?>

<style>
/* Report Specific Styling */
:root {
	--rep-accent: <?php echo esc_attr($agency_color); ?>;
}
.wrap.seo-copilot-report-wrap {
	max-width: 850px;
	margin: 20px auto;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	color: #1e293b;
}

.rep-page {
	background: #ffffff;
	border-radius: 8px;
	box-shadow: 0 10px 30px rgba(0,0,0,0.08);
	margin-bottom: 40px;
	padding: 60px;
	min-height: 1000px; /* A4 approx aspect ratio for screen preview */
	position: relative;
	overflow: hidden;
	box-sizing: border-box;
}

/* Cover Page */
.rep-cover {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: flex-start;
}
.rep-cover::after {
	content: '';
	position: absolute;
	bottom: 0; left: 0; right: 0;
	height: 12px;
	background: var(--rep-accent);
}

.rep-logo {
	max-height: 80px;
	max-width: 250px;
	margin-bottom: 80px;
}

.rep-title {
	font-size: 48px;
	font-weight: 800;
	letter-spacing: -1px;
	line-height: 1.1;
	margin: 0 0 24px 0;
	color: var(--rep-accent);
}

.rep-meta-block {
	margin-top: 60px;
	width: 100%;
	display: flex;
	justify-content: space-between;
}
.rep-meta-col h4 {
	text-transform: uppercase;
	font-size: 12px;
	letter-spacing: 1px;
	color: #64748b;
	margin: 0 0 8px 0;
}
.rep-meta-col p {
	font-size: 16px;
	margin: 0 0 4px 0;
	font-weight: 500;
}

/* Content Pages */
.rep-section-title {
	font-size: 28px;
	margin: 0 0 32px 0;
	padding-bottom: 16px;
	border-bottom: 2px solid #e2e8f0;
	color: var(--rep-accent);
}

.rep-text {
	font-size: 15px;
	line-height: 1.7;
	color: #334155;
	margin-bottom: 20px;
}

/* Data Tables */
.rep-table {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 32px;
}
.rep-table th {
	text-align: left;
	padding: 12px;
	background: #f8fafc;
	font-weight: 600;
	color: #475569;
	border-bottom: 2px solid var(--rep-accent);
}
.rep-table td {
	padding: 12px;
	border-bottom: 1px solid #e2e8f0;
	color: #334155;
}

/* Metric Cards */
.rep-metrics-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20px;
	margin-bottom: 40px;
}
.rep-metric-card {
	background: #f8fafc;
	border-left: 3px solid var(--rep-accent);
	padding: 20px;
	border-radius: 4px;
}
.rep-metric-label {
	font-size: 12px;
	text-transform: uppercase;
	color: #64748b;
	letter-spacing: 0.5px;
	margin-bottom: 8px;
}
.rep-metric-value {
	font-size: 28px;
	font-weight: 700;
	color: #0f172a;
}

/* Badges */
.rep-badge-up { color: #059669; font-weight: 600; }
.rep-badge-down { color: #dc2626; font-weight: 600; }
.rep-badge {
	display: inline-block;
	padding: 4px 10px;
	border-radius: 12px;
	font-size: 11px;
	font-weight: 700;
	text-transform: uppercase;
}
.rep-badge.high { background: #fee2e2; color: #b91c1c; }
.rep-badge.medium { background: #fef3c7; color: #b45309; }
.rep-badge.low { background: #f1f5f9; color: #475569; }

/* Action Bar */
.rep-action-bar {
	position: fixed;
	bottom: 30px;
	left: 50%;
	transform: translateX(-50%);
	background: #1e293b;
	padding: 12px 24px;
	border-radius: 40px;
	box-shadow: 0 10px 25px rgba(0,0,0,0.2);
	display: flex;
	gap: 12px;
	z-index: 100000;
}
.rep-action-bar .button {
	margin: 0;
	padding: 8px 20px;
	height: auto;
	border-radius: 20px;
}

/* Print Styles */
@media print {
	#wpadminbar, #adminmenuwrap, #adminmenuback, #wpfooter, .rep-action-bar, .notice { display: none !important; }
	#wpcontent, #wpbody-content { margin: 0 !important; padding: 0 !important; }
	html, body, .wrap { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
	.rep-page { 
		box-shadow: none !important; 
		margin: 0 !important; 
		padding: 40px !important; 
		page-break-after: always; 
		min-height: auto;
	}
	* {
		-webkit-print-color-adjust: exact !important;
		print-color-adjust: exact !important;
	}
	/* Expand to fit A4 */
	@page { size: auto;  margin: 0mm; }
}

/* Footer (inside pages) */
.rep-footer {
	position: absolute;
	bottom: 30px;
	left: 60px;
	right: 60px;
	display: flex;
	justify-content: space-between;
	font-size: 11px;
	color: #94a3b8;
	border-top: 1px solid #f1f5f9;
	padding-top: 16px;
}
</style>

<div class="wrap seo-copilot-report-wrap">

	<!-- ACTION BAR -->
	<div class="rep-action-bar">
		<a href="<?php echo admin_url('admin.php?page=seo-copilot-reports'); ?>" class="button button-secondary" style="background:#334155; border:none; color:white;">&larr; Back to Reports</a>
		<button class="button button-primary" onclick="window.print();" style="background:#3b82f6; border:none; color:white;"><span class="dashicons dashicons-printer" style="margin-top:2px;"></span> Download PDF</button>
		<button class="button button-primary" id="btn-rep-send-email" style="background:#10b981; border:none; color:white;" data-id="<?php echo esc_attr($data['report_id']); ?>"><span class="dashicons dashicons-email" style="margin-top:2px;"></span> Send to Client</button>
	</div>

	<!-- ==============================================
		 PAGE 1: COVER PAGE
		 ============================================== -->
	<div class="rep-page rep-cover">
		<?php if ( $data['agency_logo'] ) : ?>
			<img src="<?php echo esc_url($data['agency_logo']); ?>" class="rep-logo" />
		<?php else : ?>
			<h2 style="font-size:32px; color:var(--rep-accent); margin-bottom:80px;"><?php echo esc_html($data['agency_name']); ?></h2>
		<?php endif; ?>

		<h1 class="rep-title"><?php echo esc_html($data['report_name']); ?></h1>
		<p style="font-size:24px; color:#64748b; margin:0;">
			Performance Overview
			<br>
			<strong><?php echo esc_html($data['date_from']); ?> — <?php echo esc_html($data['date_to']); ?></strong>
		</p>

		<div class="rep-meta-block">
			<div class="rep-meta-col">
				<h4>Prepared For</h4>
				<p><?php echo esc_html($data['client_name']); ?></p>
				<p style="color:#64748b;"><?php echo esc_html($data['client_website']); ?></p>
			</div>
			<div class="rep-meta-col" style="text-align:right;">
				<h4>Prepared By</h4>
				<p><?php echo esc_html($data['agency_name']); ?></p>
				<p style="color:#64748b;"><?php echo esc_html($data['agency_website']); ?></p>
				<p style="color:#64748b;"><?php echo esc_html($data['agency_email']); ?></p>
			</div>
		</div>
	</div>

	<!-- ==============================================
		 PAGE 2: EXECUTIVE SUMMARY & HEALTH
		 ============================================== -->
	<?php if ( in_array('executive_summary', $sections) || in_array('seo_health_score', $sections) ) : ?>
	<div class="rep-page">
		<h2 class="rep-section-title">Executive Summary</h2>
		
		<p class="rep-text" style="font-size:18px; color:var(--rep-accent); font-weight:600; margin-bottom:32px;">
			<?php echo esc_html($data['report_intro']); ?>
		</p>

		<?php if ( isset($rep['executive_summary']) ) : ?>
			<p class="rep-text"><?php echo esc_html($rep['executive_summary']['p1']); ?></p>
			<p class="rep-text"><?php echo esc_html($rep['executive_summary']['p2']); ?></p>
			<p class="rep-text"><?php echo esc_html($rep['executive_summary']['p3']); ?></p>
		<?php endif; ?>

		<?php if ( isset($rep['seo_health_score']) ) : $sh = $rep['seo_health_score']; ?>
			<h3 style="font-size:20px; color:#1e293b; margin:40px 0 20px 0;">Site Health Status</h3>
			<div class="rep-metrics-grid" style="grid-template-columns: 1fr 1fr;">
				<div class="rep-metric-card">
					<div class="rep-metric-label">Overall SEO Score</div>
					<div class="rep-metric-value"><?php echo esc_html($sh['current_score']); ?>/100</div>
					<div style="color:#059669; font-size:13px; font-weight:600; margin-top:4px;">&uarr; +<?php echo esc_html($sh['score_change']); ?> pts</div>
				</div>
				<div class="rep-metric-card">
					<div class="rep-metric-label">Trend</div>
					<!-- Pure CSS Sparkline concept for visual interest -->
					<div style="display:flex; align-items:flex-end; gap:4px; height:32px; margin-top:8px;">
						<?php foreach($sh['trend_data'] as $point) : $h = min(100, max(10, $point)); ?>
							<div style="width:12px; background:var(--rep-accent); height:<?php echo $h; ?>%; opacity:0.8; border-radius:2px 2px 0 0;"></div>
						<?php endforeach; ?>
					</div>
				</div>
			</div>

			<div style="display:grid; grid-template-columns:1fr 1fr; gap:32px;">
				<div>
					<h4 style="margin:0 0 12px 0; color:#059669;">Top Improvements</h4>
					<ul style="margin:0; padding-left:20px; color:#334155;">
						<?php foreach($sh['top_improvements'] as $task) : ?>
							<li style="margin-bottom:8px;"><?php echo esc_html($task); ?></li>
						<?php endforeach; ?>
					</ul>
				</div>
				<div>
					<h4 style="margin:0 0 12px 0; color:#dc2626;">Pending Issues</h4>
					<ul style="margin:0; padding-left:20px; color:#334155;">
						<?php foreach($sh['top_remaining_issues'] as $task) : ?>
							<li style="margin-bottom:8px;"><?php echo esc_html($task); ?></li>
						<?php endforeach; ?>
					</ul>
				</div>
			</div>
		<?php endif; ?>

		<!-- Footer -->
		<div class="rep-footer">
			<span><?php echo esc_html($data['agency_name']); ?></span>
			<?php if ( ! $data['white_label'] ) echo '<span>Generated by SEO Copilot</span>'; ?>
		</div>
	</div>
	<?php endif; ?>

	<!-- ==============================================
		 PAGE 3: KEYWORD RANKINGS
		 ============================================== -->
	<?php if ( in_array('keyword_rankings', $sections) && isset($rep['keyword_rankings']) ) : $kr = $rep['keyword_rankings']; ?>
	<div class="rep-page">
		<h2 class="rep-section-title">Keyword Rankings</h2>
		
		<div class="rep-metrics-grid">
			<div class="rep-metric-card">
				<div class="rep-metric-label">Tracked</div>
				<div class="rep-metric-value"><?php echo esc_html($kr['total_tracked']); ?></div>
			</div>
			<div class="rep-metric-card">
				<div class="rep-metric-label">Moved Up</div>
				<div class="rep-metric-value" style="color:#059669;"><?php echo esc_html($kr['moved_up']); ?></div>
			</div>
			<div class="rep-metric-card">
				<div class="rep-metric-label">Moved Down</div>
				<div class="rep-metric-value" style="color:#dc2626;"><?php echo esc_html($kr['moved_down']); ?></div>
			</div>
			<div class="rep-metric-card">
				<div class="rep-metric-label">New in Top 10</div>
				<div class="rep-metric-value" style="color:var(--rep-accent);"><?php echo esc_html($kr['new_in_top_10']); ?></div>
			</div>
		</div>

		<h3 style="font-size:20px; color:#1e293b; margin:0 0 16px 0;">Top Search Queries</h3>
		<table class="rep-table">
			<thead>
				<tr>
					<th>Keyword</th>
					<th>Position</th>
					<th>Change</th>
					<th>Volume</th>
				</tr>
			</thead>
			<tbody>
				<?php foreach($kr['top_keywords'] as $kw) : 
					$change_class = 'rep-badge-up';
					if ( strpos($kw['change'], '-') !== false ) $change_class = 'rep-badge-down';
					if ( $kw['change'] == '0' ) { $change_class = ''; $kw['change'] = '—'; }
				?>
				<tr>
					<td>
						<strong><?php echo esc_html($kw['keyword']); ?></strong>
						<div style="font-size:12px; color:#64748b;"><?php echo esc_html($kw['url']); ?></div>
					</td>
					<td style="font-size:18px; font-weight:700;">#<?php echo esc_html($kw['position']); ?></td>
					<td class="<?php echo esc_attr($change_class); ?>"><?php echo esc_html($kw['change']); ?></td>
					<td><?php echo esc_html($kw['volume']); ?></td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>

		<!-- Footer -->
		<div class="rep-footer">
			<span><?php echo esc_html($data['agency_name']); ?></span>
			<?php if ( ! $data['white_label'] ) echo '<span>Generated by SEO Copilot</span>'; ?>
		</div>
	</div>
	<?php endif; ?>

	<!-- ==============================================
		 PAGE 4: CONTENT & TECHNICAL
		 ============================================== -->
	<?php if ( in_array('content_performance', $sections) || in_array('technical_issues', $sections) ) : ?>
	<div class="rep-page">
		
		<?php if ( in_array('content_performance', $sections) && isset($rep['content_performance']) ) : $cp = $rep['content_performance']; ?>
			<h2 class="rep-section-title">Content Performance</h2>
			
			<div style="display:flex; gap:24px; margin-bottom:32px;">
				<div style="flex:1;">
					<p class="rep-text">This period, <strong><?php echo esc_html($cp['published_count']); ?></strong> new posts were published and <strong><?php echo esc_html($cp['optimized_count']); ?></strong> historical posts were optimized, leading to an average score improvement of <strong><?php echo esc_html($cp['avg_score_imp']); ?></strong>.</p>
				</div>
			</div>

			<table class="rep-table">
				<thead>
					<tr>
						<th>Top Performing Articles</th>
						<th>Score</th>
						<th>Est. Traffic</th>
					</tr>
				</thead>
				<tbody>
					<?php foreach($cp['top_posts'] as $post) : ?>
					<tr>
						<td><strong><?php echo esc_html($post['title']); ?></strong></td>
						<td><span class="rep-badge" style="background:#d1fae5; color:#065f46;"><?php echo esc_html($post['score']); ?>/100</span></td>
						<td><?php echo esc_html($post['traffic_est']); ?></td>
					</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>

		<?php if ( in_array('technical_issues', $sections) && isset($rep['technical_issues']) ) : $ti = $rep['technical_issues']; ?>
			<div style="margin-top:60px;"></div>
			<h2 class="rep-section-title">Technical Audit</h2>
			
			<div class="rep-metrics-grid" style="grid-template-columns: 1fr 1fr;">
				<div class="rep-metric-card">
					<div class="rep-metric-label">Critical Issues Fixed</div>
					<div class="rep-metric-value" style="color:#059669;"><?php echo esc_html($ti['critical_fixed']); ?></div>
				</div>
				<div class="rep-metric-card">
					<div class="rep-metric-label">Critical Issues Remaining</div>
					<div class="rep-metric-value" style="color:#dc2626;"><?php echo esc_html($ti['critical_rem']); ?></div>
				</div>
			</div>

			<table class="rep-table">
				<thead>
					<tr>
						<th>Audit Rule</th>
						<th>Count</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					<?php foreach($ti['audit_summary'] as $aud) : 
						$status_badge = $aud['status'] == 'Fixed' ? '<span class="rep-badge" style="background:#d1fae5; color:#065f46;">Fixed</span>' : '<span class="rep-badge" style="background:#fee2e2; color:#b91c1c;">Remaining</span>';
					?>
					<tr>
						<td><?php echo esc_html($aud['type']); ?></td>
						<td><?php echo esc_html($aud['count']); ?> found</td>
						<td><?php echo $status_badge; ?></td>
					</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>

		<!-- Footer -->
		<div class="rep-footer">
			<span><?php echo esc_html($data['agency_name']); ?></span>
			<?php if ( ! $data['white_label'] ) echo '<span>Generated by SEO Copilot</span>'; ?>
		</div>
	</div>
	<?php endif; ?>

	<!-- ==============================================
		 PAGE 5: RECOMMENDATIONS
		 ============================================== -->
	<?php if ( in_array('recommendations', $sections) && isset($rep['recommendations']) ) : $recs = $rep['recommendations']; ?>
	<div class="rep-page">
		<h2 class="rep-section-title">Action Plan</h2>
		<p class="rep-text">Based on our AI analysis of the site's current data, the following strategic priorities have been established for the next period.</p>

		<div style="display:flex; flex-direction:column; gap:24px; margin-top:32px;">
			<?php foreach($recs as $i => $rec) : 
				$badge_class = 'rep-badge ' . strtolower($rec['priority']);
			?>
			<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px; position:relative;">
				<div style="font-size:48px; position:absolute; right:24px; top:24px; opacity:0.05; font-weight:900;">0<?php echo ($i+1); ?></div>
				
				<div style="margin-bottom:12px;">
					<span class="<?php echo esc_attr($badge_class); ?>">Priority: <?php echo esc_html($rec['priority']); ?></span>
				</div>
				
				<h3 style="margin:0 0 12px 0; color:#0f172a; font-size:18px;"><?php echo esc_html($rec['action']); ?></h3>
				
				<div style="display:flex; gap:16px; margin-top:16px; font-size:14px; color:#475569;">
					<div style="flex:1;">
						<strong>Expected Impact:</strong><br>
						<?php echo esc_html($rec['impact']); ?>
					</div>
					<div>
						<strong>Effort:</strong><br>
						<?php echo esc_html($rec['effort']); ?>
					</div>
				</div>
			</div>
			<?php endforeach; ?>
		</div>

		<!-- Footer -->
		<div class="rep-footer">
			<span><?php echo esc_html($data['agency_name']); ?></span>
			<?php if ( ! $data['white_label'] ) echo '<span>Generated by SEO Copilot</span>'; ?>
		</div>
	</div>
	<?php endif; ?>

</div>

<script>
jQuery(document).ready(function($) {
	$('#btn-rep-send-email').on('click', function() {
		var email = prompt("Enter email address to send report:");
		if(email) {
			$(this).text('Sending...').prop('disabled', true);
			$.post(seoCopilotAdmin.ajaxUrl, {
				action: 'seo_copilot_send_report_email',
				nonce: seoCopilotAdmin.nonce,
				report_id: $(this).data('id'),
				email: email
			}, function(res) {
				if(res.success) {
					$('#btn-rep-send-email').text('Sent!').css('background', '#065f46').prop('disabled', false);
				} else {
					alert('Error: ' + res.data);
					$('#btn-rep-send-email').text('Send to Client').prop('disabled', false);
				}
			});
		}
	});
});
</script>
