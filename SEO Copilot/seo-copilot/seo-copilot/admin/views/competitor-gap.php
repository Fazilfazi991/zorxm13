<?php
if ( ! defined( 'WPINC' ) ) {
	die;
}

$gap = new SEO_Copilot_Competitor_Gap();
$history = $gap->get_history();
$recent_posts = get_posts([
	'post_type'      => 'any',
	'post_status'    => 'publish',
	'posts_per_page' => 20,
	'orderby'        => 'post_date',
	'order'          => 'DESC'
]);
?>

<div class="wrap seo-copilot-page">

	<!-- Page Header -->
	<div class="sc-page-header">
		<div class="sc-page-header-left">
			<div class="sc-page-icon">🏆</div>
			<div>
				<h1 class="sc-page-title"><?php esc_html_e( 'Competitor Gap Analyzer', 'seo-copilot' ); ?></h1>
				<p class="sc-page-subtitle"><?php esc_html_e( 'Find out exactly what your top-ranking competitors cover that you don\'t', 'seo-copilot' ); ?></p>
			</div>
		</div>
	</div>

	<!-- Tip Box -->
	<div class="sc-tip-box">
		<span class="sc-tip-icon">💡</span>
		<div class="sc-tip-text">
			<strong><?php esc_html_e( 'How to use', 'seo-copilot' ); ?></strong>
			<?php esc_html_e( 'Find a URL that outranks yours for your target keyword, paste it below, and SEO Copilot will scrape their content and generate a prioritized action list to close the gap.', 'seo-copilot' ); ?>
		</div>
	</div>

	<div style="display:flex; gap:20px;">
		
		<!-- New Analysis Form -->
		<div class="sc-card" style="flex:1;margin-bottom:0;">
			<div class="sc-card-header"><h3><?php esc_html_e( 'Run New Analysis', 'seo-copilot' ); ?></h3></div>
			<div class="sc-card-body">
			
			<div class="seo-copilot-field-group">
				<label style="display:block;font-weight:600;margin-bottom:5px;font-size:13px;"><?php esc_html_e( 'Source Post', 'seo-copilot' ); ?></label>
				<select id="gap-post-id" class="sc-form-control">
					<option value="">-- Select Post --</option>
					<?php foreach ( $recent_posts as $p ) : ?>
						<option value="<?php echo esc_attr( $p->ID ); ?>"><?php echo esc_html( $p->post_title ); ?></option>
					<?php endforeach; ?>
				</select>
			</div>

			<div class="seo-copilot-field-group">
				<label style="display:block;font-weight:600;margin-bottom:5px;font-size:13px;"><?php esc_html_e( 'Target Keyword', 'seo-copilot' ); ?></label>
				<input type="text" id="gap-keyword" class="sc-form-control" placeholder="e.g. best seo plugins">
			</div>

			<div class="seo-copilot-field-group">
				<label style="display:block;font-weight:600;margin-bottom:5px;font-size:13px;"><?php esc_html_e( 'Competitor URL', 'seo-copilot' ); ?></label>
				<input type="url" id="gap-url" class="sc-form-control" placeholder="https://competitor.com/their-post">
			</div>

			<button type="button" class="sc-btn sc-btn-primary" id="btn-run-gap-analysis" style="width:100%;justify-content:center;margin-top:8px;">
				<?php esc_html_e( 'Run AI Gap Analysis', 'seo-copilot' ); ?>
			</button>
			</div><!-- /.sc-card-body -->
		</div>

		<!-- View History -->
		<div class="sc-card" style="flex:2;margin-bottom:0;">
			<div class="sc-card-header"><h3><?php esc_html_e( 'Recent Gap Reports', 'seo-copilot' ); ?></h3></div>
			<div class="sc-card-body" style="padding:0;">
			
			<table class="sc-table">
				<thead>
					<tr>
						<th>Your Post</th>
						<th>Keyword</th>
						<th>Competitor URL</th>
						<th>Date</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $history ) ) : ?>
					<tr><td colspan="5" style="text-align:center;">No gap analyses run yet.</td></tr>
					<?php else: ?>
						<?php foreach ( $history as $row ) : ?>
						<tr>
							<td><strong><?php echo esc_html( $row->post_title ); ?></strong></td>
							<td><?php echo esc_html( $row->focus_keyword ); ?></td>
							<td><a href="<?php echo esc_url( $row->competitor_url ); ?>" target="_blank">View URL <span class="dashicons dashicons-external" style="font-size:12px;"></span></a></td>
							<td><?php echo esc_html( date( 'M j, Y', strtotime( $row->created_at ) ) ); ?></td>
							<td>
								<button class="button button-small btn-view-gap" data-json='<?php echo esc_attr( $row->analysis_data ); ?>'>View Report</button>
								<button class="button button-small btn-delete-gap" data-id="<?php echo esc_attr( $row->id ); ?>" style="color:#d63638;"><span class="dashicons dashicons-trash" style="margin-top:2px;"></span></button>
							</td>
						</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
			</div><!-- /.sc-card-body -->
		</div>
	</div>

	<!-- Results Modal -->
	<div id="seo-copilot-gap-modal" class="seo-copilot-modal" style="display:none;">
		<div class="seo-copilot-modal-content" style="max-width:900px; padding:20px; background:#fff; margin:5% auto; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); max-height:80vh; overflow-y:auto;">
			<span class="seo-copilot-close" id="close-gap-modal" style="float:right; cursor:pointer; font-size:20px;">&times;</span>
			<h2><span class="dashicons dashicons-chart-pie"></span> Gap Analysis Report</h2>
			
			<div style="display:flex; justify-content:space-between; margin-bottom:20px; background:#f0f0f1; padding:15px; border-radius:5px;">
				<div style="text-align:center; flex:1; border-right:1px solid #ccc;">
					<strong>Your Word Count</strong>
					<h3 id="gap-our-words" style="margin:5px 0 0 0; color:#005a9e;">0</h3>
				</div>
				<div style="text-align:center; flex:1;">
					<strong>Competitor Word Count</strong>
					<h3 id="gap-comp-words" style="margin:5px 0 0 0; color:#d63638;">0</h3>
				</div>
			</div>

			<div style="margin-bottom:20px;">
				<h3>Executive Summary</h3>
				<p id="gap-assessment" style="font-size:14px; line-height:1.6;"></p>
			</div>

			<div style="display:flex; gap:20px;">
				<div style="flex:1;">
					<h3 style="color:#d63638;"><span class="dashicons dashicons-warning"></span> Missing Topics</h3>
					<ul id="gap-missing-topics" style="list-style:disc; margin-left:20px;"></ul>
				</div>
				<div style="flex:1;">
					<h3 style="color:#008a20;"><span class="dashicons dashicons-yes-alt"></span> Recommended Actions</h3>
					<ul id="gap-action-items" style="list-style:decimal; margin-left:20px;"></ul>
				</div>
			</div>

			<div style="margin-top:20px;">
				<h3>Suggested Headings to Add</h3>
				<ul id="gap-missing-headings" style="list-style:disc; margin-left:20px; color:#555;"></ul>
			</div>
		</div>
	</div>
</div>

<style>
.seo-copilot-modal { position: fixed; z-index: 99999; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5); }
</style>

<script>
jQuery(document).ready(function($) {

	// Modals
	$('#close-gap-modal').on('click', function() { $('#seo-copilot-gap-modal').hide(); });

	// Run Analysis
	$('#btn-run-gap-analysis').on('click', function() {
		let btn = $(this);
		let pid = $('#gap-post-id').val();
		let kw = $('#gap-keyword').val();
		let url = $('#gap-url').val();

		if(!pid || !kw || !url) {
			alert('Please fill out all fields.');
			return;
		}

		btn.prop('disabled', true).text('Scraping & Analyzing (Takes ~15s)...');

		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_analyze_gap',
				nonce: seoCopilotAdmin.nonce,
				post_id: pid,
				focus_keyword: kw,
				competitor_url: url
			},
			success: function(res) {
				if(res.success) {
					alert('Analysis complete!');
					location.reload();
				} else {
					alert('Error: ' + res.data);
					btn.prop('disabled', false).text('Run AI Gap Analysis');
				}
			},
			error: function() {
				alert('Server error.');
				btn.prop('disabled', false).text('Run AI Gap Analysis');
			}
		});
	});

	// View Report
	$('.btn-view-gap').on('click', function() {
		let data = JSON.parse($(this).attr('data-json'));
		
		$('#gap-our-words').text(data.our_words);
		$('#gap-comp-words').text(data.competitor_words);
		
		$('#gap-assessment').text(data.gap_analysis.overall_assessment);

		let topics = '';
		if(data.gap_analysis.missing_topics) {
			data.gap_analysis.missing_topics.forEach(t => topics += '<li>' + t + '</li>');
		}
		$('#gap-missing-topics').html(topics || '<li>None identified</li>');

		let actions = '';
		if(data.gap_analysis.action_items) {
			data.gap_analysis.action_items.forEach(a => actions += '<li>' + a + '</li>');
		}
		$('#gap-action-items').html(actions || '<li>None identified</li>');

		let headings = '';
		if(data.gap_analysis.missing_headings) {
			data.gap_analysis.missing_headings.forEach(h => headings += '<li><code>' + h + '</code></li>');
		}
		$('#gap-missing-headings').html(headings || '<li>None identified</li>');

		$('#seo-copilot-gap-modal').show();
	});

	// Delete
	$('.btn-delete-gap').on('click', function() {
		if(!confirm('Delete this report?')) return;
		let btn = $(this);
		let id = btn.attr('data-id');

		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_delete_gap',
				nonce: seoCopilotAdmin.nonce,
				id: id
			},
			success: function(res) {
				if(res.success) {
					btn.closest('tr').fadeOut();
				} else {
					alert('Error deleting.');
				}
			}
		});
	});

});
</script>
