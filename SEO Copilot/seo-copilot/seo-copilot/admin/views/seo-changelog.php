<?php
/**
 * SEO Changelog View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

$changelog = seo_copilot_changelog();
$summary   = $changelog->get_site_impact_summary();

// Initial Load
$updates = $changelog->get_updates();
$last_fetch = get_option('seo_copilot_changelog_last_fetch');
$last_updated_str = $last_fetch ? date( 'M j, Y g:i A', strtotime($last_fetch) ) : 'Never';

?>

<div class="wrap seo-copilot-page">
	
	<!-- Page Header -->
	<div class="sc-page-header">
		<div class="sc-header-left">
			<span class="sc-header-icon">📡</span>
			<div>
				<h1 class="wp-heading-inline">SEO Updates &amp; Algorithm Tracker</h1>
				<p class="sc-header-subtitle">Stay ahead of Google updates and know exactly how they affect your site.</p>
			</div>
		</div>
		<div class="sc-header-right" style="display:flex; align-items:center; gap:12px;">
			<span style="font-size:12px; color:var(--sc-grey);">Last updated: <span id="last-updated-time"><?php echo esc_html( $last_updated_str ); ?></span></span>
			<button id="sc-refresh-changelog" class="sc-btn sc-btn-outline">Refresh Now</button>
		</div>
	</div>

	<!-- Tip Box -->
	<div class="sc-tip-box" style="margin-bottom: 24px;">
		<span class="sc-tip-icon">💡</span>
		<div>
			<strong>Pro Tip:</strong> SEO Copilot monitors Google algorithm updates and industry news daily. Each update is analyzed by AI to tell you exactly what changed and what YOU need to do about it.
		</div>
	</div>

	<!-- Impact Summary Bar -->
	<div class="sc-stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
		
		<div class="sc-stat-card" style="border-top: 4px solid var(--sc-danger);">
			<div class="sc-stat-title">Critical Updates (30 Days)</div>
			<div class="sc-stat-value"><?php echo esc_html( $summary['critical_count'] ); ?></div>
		</div>

		<div class="sc-stat-card" style="border-top: 4px solid var(--sc-primary);">
			<div class="sc-stat-title">Updates This Week</div>
			<div class="sc-stat-value"><?php echo esc_html( $summary['updates_this_week'] ); ?></div>
		</div>

		<div class="sc-stat-card" style="border-top: 4px solid var(--sc-warning);">
			<div class="sc-stat-title">Last Algorithm Update</div>
			<div class="sc-stat-value" style="font-size:18px;">
				<?php echo $summary['last_algorithm_update'] ? esc_html( $summary['last_algorithm_update']['date'] ) : 'N/A'; ?>
			</div>
			<?php if ( $summary['last_algorithm_update'] ) : ?>
				<div style="font-size:12px; color:var(--sc-grey); margin-top:4px;">
					<?php echo esc_html( $summary['last_algorithm_update']['title'] ); ?>
				</div>
			<?php endif; ?>
		</div>

		<div class="sc-stat-card" style="border-top: 4px solid var(--sc-dark);">
			<div class="sc-stat-title">Your Site Status</div>
			<div class="sc-stat-value text-<?php echo $summary['attention_needed'] > 0 ? 'danger' : 'success'; ?>" style="font-size:18px;">
				<?php if ( $summary['attention_needed'] > 0 ) : ?>
					<?php echo esc_html( $summary['attention_needed'] ); ?> updates need attention
				<?php else : ?>
					No action needed
				<?php endif; ?>
			</div>
			<div style="font-size:12px; color:var(--sc-grey); margin-top:4px;">Based on affects_site flag</div>
		</div>

	</div>

	<!-- Filter Bar -->
	<div class="sc-filters-bar sc-card">
		<div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
			
			<div class="sc-form-group" style="margin:0;">
				<select id="filter-is-read" class="sc-form-control">
					<option value="all">All Updates</option>
					<option value="unread" selected>Unread Only</option>
				</select>
			</div>

			<div class="sc-form-group" style="margin:0;">
				<select id="filter-impact" class="sc-form-control">
					<option value="all">Any Impact</option>
					<option value="critical">Critical</option>
					<option value="high">High</option>
					<option value="medium">Medium</option>
					<option value="low">Low</option>
				</select>
			</div>

			<div class="sc-form-group" style="margin:0;">
				<select id="filter-category" class="sc-form-control">
					<option value="all">Any Category</option>
					<option value="algorithm">Algorithm</option>
					<option value="feature">Feature</option>
					<option value="industry">Industry</option>
					<option value="tool">Tool</option>
				</select>
			</div>

			<div class="sc-form-group" style="margin:0;">
				<select id="filter-affects" class="sc-form-control">
					<option value="all">All Sites</option>
					<option value="yes">Affects My Site</option>
				</select>
			</div>

			<div class="sc-form-group" style="margin:0; flex-grow:1; display:flex; justify-content:flex-end;">
				<input type="text" id="filter-search" class="sc-form-control" placeholder="Search updates..." style="max-width:250px;">
			</div>

		</div>
	</div>

	<!-- Feed Container -->
	<div id="sc-updates-feed" style="margin-top:24px; max-width: 900px;">
		<?php if ( empty( $updates ) ) : ?>
			<div class="sc-empty-state sc-card">
				<span class="sc-empty-icon">📡</span>
				<h4>No updates fetched yet</h4>
				<p>Click "Refresh Now" to fetch the latest SEO news and algorithm updates from top industry sources.</p>
				<button class="sc-btn sc-btn-primary" onclick="jQuery('#sc-refresh-changelog').click();">Refresh Now</button>
			</div>
		<?php else : ?>
			<?php foreach ( $updates as $update ) {
				$changelog->render_update_card( $update );
			} ?>
		<?php endif; ?>
	</div>

</div>

<script>
jQuery(document).ready(function($) {

	function loadChangelog() {
		var feed = $('#sc-updates-feed');
		feed.css('opacity', '0.5');

		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_filter_updates',
			nonce: seoCopilotAdmin.nonce,
			is_read: $('#filter-is-read').val(),
			impact_level: $('#filter-impact').val(),
			category: $('#filter-category').val(),
			affects_site: $('#filter-affects').val(),
			search: $('#filter-search').val()
		}, function(res) {
			if(res.success) {
				feed.html(res.data.html);
			}
			feed.css('opacity', '1');
		});
	}

	// Filter Change
	$('#filter-is-read, #filter-impact, #filter-category, #filter-affects').on('change', function() {
		loadChangelog();
	});

	// Search text debounce
	var searchTimer;
	$('#filter-search').on('keyup', function() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(loadChangelog, 500);
	});

	// Mark Read
	$(document).on('click', '.btn-mark-read', function() {
		var btn = $(this);
		var card = btn.closest('.sc-update-card');
		var id = btn.data('id');

		btn.text('Saving...').prop('disabled', true);

		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_mark_update_read',
			nonce: seoCopilotAdmin.nonce,
			update_id: id
		}, function(res) {
			if(res.success) {
				card.removeClass('unread').css('opacity', '0.85');
				btn.remove();
				// The badge count in admin menu is updated on next page load, 
				// but we could manipulate the DOM here if we want immediate feedback.
			}
		});
	});

	// Refresh
	$('#sc-refresh-changelog').on('click', function() {
		var btn = $(this);
		var originalText = btn.text();
		btn.text('Fetching...').prop('disabled', true);
		$('#sc-updates-feed').css('opacity', '0.5');

		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_refresh_changelog',
			nonce: seoCopilotAdmin.nonce
		}, function(res) {
			if(res.success) {
				alert(res.data.message);
				location.reload(); // Reload to refresh headers/summaries
			} else {
				alert('Error fetching updates');
				btn.text(originalText).prop('disabled', false);
			}
		});
	});

});
</script>
