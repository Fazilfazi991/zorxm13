<?php
if ( ! defined( 'WPINC' ) ) {
	die;
}
?>

<div class="wrap seo-copilot-page">

	<!-- Page Header -->
	<div class="sc-page-header">
		<div class="sc-page-header-left">
			<div class="sc-page-icon">📖</div>
			<div>
				<h1 class="sc-page-title"><?php esc_html_e( 'Readability Coach', 'seo-copilot' ); ?></h1>
				<p class="sc-page-subtitle"><?php esc_html_e( 'Measure content clarity using the Flesch Reading Ease score', 'seo-copilot' ); ?></p>
			</div>
		</div>
		<div class="sc-page-header-right">
			<button class="sc-btn sc-btn-primary" id="seo-copilot-scan-readability">
				<span class="dashicons dashicons-search"></span>
				<?php esc_html_e( 'Scan Recent Posts', 'seo-copilot' ); ?>
			</button>
		</div>
	</div>

	<!-- Tip Box -->
	<div class="sc-tip-box">
		<span class="sc-tip-icon">💡</span>
		<div class="sc-tip-text">
			<strong><?php esc_html_e( 'Target Score 60+', 'seo-copilot' ); ?></strong>
			<?php esc_html_e( 'A Flesch score of 60-70 is ideal for web content (8th-9th grade level). Use shorter sentences, active voice, and plain words. Open any post metabox for real-time AI rewrite suggestions.', 'seo-copilot' ); ?>
		</div>
	</div>

	<div style="display:flex; gap:20px;">
		
		<div class="sc-card" style="flex:2;margin-bottom:0;">
			<div class="sc-card-header"><h3><?php esc_html_e( 'Site-Wide Readability Audit', 'seo-copilot' ); ?></h3></div>
			<div class="sc-card-body" style="padding:0;">
			
			<table class="sc-table">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Post Title', 'seo-copilot' ); ?></th>
						<th><?php esc_html_e( 'Flesch Score', 'seo-copilot' ); ?></th>
						<th><?php esc_html_e( 'Grade Level', 'seo-copilot' ); ?></th>
						<th><?php esc_html_e( 'Action', 'seo-copilot' ); ?></th>
					</tr>
				</thead>
				<tbody id="readability-table-body">
					<tr><td colspan="4" style="text-align:center;color:var(--sc-grey);padding:24px;"><?php esc_html_e( 'Click "Scan Recent Posts" to begin.', 'seo-copilot' ); ?></td></tr>
				</tbody>
			</table>
			</div><!-- /.sc-card-body -->
		</div>

		<div class="sc-card" style="flex:1;margin-bottom:0;">
			<div class="sc-card-header"><h3><?php esc_html_e( 'Score Reference', 'seo-copilot' ); ?></h3></div>
			<div class="sc-card-body">
				<ul style="margin:0;padding:0;list-style:none;font-size:13px;">
					<li style="padding:8px 0;border-bottom:1px solid var(--sc-border);"><span class="sc-badge sc-badge-success">90-100</span> &nbsp;<?php esc_html_e( 'Very Easy — 5th grade', 'seo-copilot' ); ?></li>
					<li style="padding:8px 0;border-bottom:1px solid var(--sc-border);"><span class="sc-badge sc-badge-success">80-89</span> &nbsp;<?php esc_html_e( 'Easy — 6th grade', 'seo-copilot' ); ?></li>
					<li style="padding:8px 0;border-bottom:1px solid var(--sc-border);"><span class="sc-badge sc-badge-success">70-79</span> &nbsp;<?php esc_html_e( 'Fairly Easy — 7th grade', 'seo-copilot' ); ?></li>
					<li style="padding:8px 0;border-bottom:1px solid var(--sc-border);background:rgba(99,102,241,0.05);"><strong><span class="sc-badge sc-badge-primary">60-69</span> &nbsp;<?php esc_html_e( 'Standard — Ideal for Web ✓', 'seo-copilot' ); ?></strong></li>
					<li style="padding:8px 0;border-bottom:1px solid var(--sc-border);"><span class="sc-badge sc-badge-warning">50-59</span> &nbsp;<?php esc_html_e( 'Fairly Difficult', 'seo-copilot' ); ?></li>
					<li style="padding:8px 0;border-bottom:1px solid var(--sc-border);"><span class="sc-badge sc-badge-danger">30-49</span> &nbsp;<?php esc_html_e( 'Difficult — College level', 'seo-copilot' ); ?></li>
					<li style="padding:8px 0;"><span class="sc-badge sc-badge-danger">0-29</span> &nbsp;<?php esc_html_e( 'Very Confusing', 'seo-copilot' ); ?></li>
				</ul>
			</div>
		</div>

	</div>
</div>

<script>
jQuery(document).ready(function($) {
	$('#seo-copilot-scan-readability').on('click', function() {
		let btn = $(this);
		let tbody = $('#readability-table-body');
		
		btn.prop('disabled', true).html('<span class="spinner is-active" style="float:none; margin:0 5px 0 0;"></span> Scanning...');
		tbody.html('<tr><td colspan="4" style="text-align:center;">Analyzing...</td></tr>');
		
		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_bulk_analyze',
				nonce: seoCopilotAdmin.nonce
			},
			success: function(res) {
				btn.prop('disabled', false).html('<span class="dashicons dashicons-search" style="margin-top:2px;"></span> Scan Recent Posts');
				
				if(res.success) {
					tbody.empty();
					let data = res.data;
					if(data.length === 0) {
						tbody.html('<tr><td colspan="4" style="text-align:center;">No posts found.</td></tr>');
						return;
					}
					
					data.forEach(function(p) {
						let color = p.score >= 60 ? '#008a20' : (p.score >= 40 ? '#d2a100' : '#d63638');
						let row = '<tr>';
						row += '<td><strong>' + p.title + '</strong></td>';
						var badge = p.score >= 60 ? 'sc-badge-success' : (p.score >= 40 ? 'sc-badge-warning' : 'sc-badge-danger');
						row += '<td><span class="sc-badge ' + badge + '">' + p.score + '</span></td>';
						row += '<td>' + p.grade + '</td>';
						row += '<td><a href="' + p.url + '" class="sc-btn sc-btn-outline sc-btn-sm" target="_blank">Edit &amp; Coach</a></td>';
						row += '</tr>';
						tbody.append(row);
					});
				} else {
					alert('Error: ' + res.data);
					tbody.html('<tr><td colspan="4" style="text-align:center;">Scan failed.</td></tr>');
				}
			},
			error: function() {
				alert('Server error.');
				btn.prop('disabled', false).html('<span class="dashicons dashicons-search" style="margin-top:2px;"></span> Scan Recent Posts');
				tbody.html('<tr><td colspan="4" style="text-align:center;">Server error occurred.</td></tr>');
			}
		});
	});
});
</script>
