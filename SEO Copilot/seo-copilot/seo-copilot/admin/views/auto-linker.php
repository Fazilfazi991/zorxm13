<?php
if ( ! defined( 'WPINC' ) ) {
	die;
}

$linker = new SEO_Copilot_Auto_Linker();
$orphans = $linker->get_orphan_posts();

// Get recent posts to allow quick scanning
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
			<div class="sc-page-icon">🔗</div>
			<div>
				<h1 class="sc-page-title"><?php esc_html_e( 'Auto-Linking Engine', 'seo-copilot' ); ?></h1>
				<p class="sc-page-subtitle"><?php esc_html_e( 'Automatically find and inject internal links across your entire site', 'seo-copilot' ); ?></p>
			</div>
		</div>
		<div class="sc-page-header-right">
			<button class="sc-btn sc-btn-primary" id="seo-copilot-rebuild-map">
				<span class="dashicons dashicons-update-alt"></span>
				<?php esc_html_e( 'Rebuild Site Keyword Map', 'seo-copilot' ); ?>
			</button>
		</div>
	</div>

	<!-- Tip Box -->
	<div class="sc-tip-box">
		<span class="sc-tip-icon">💡</span>
		<div class="sc-tip-text">
			<strong><?php esc_html_e( 'How it works', 'seo-copilot' ); ?></strong>
			<?php esc_html_e( 'First, rebuild the keyword map to index all posts. Then select any post and click Scan Content — SEO Copilot will find every unlinked mention of your other posts\' focus keywords and let you inject links in one click.', 'seo-copilot' ); ?>
		</div>
	</div>

	<div style="display:flex; gap:20px;">
		
		<!-- Scan Posts for Opportunities -->
		<div class="sc-card" style="flex:2;margin-bottom:0;">
			<h2>Scan for Opportunities</h2>
			<p>Select a recent post below to scan it for internal linking opportunities based on your keyword map.</p>
			
			<table class="sc-table">
				<thead>
					<tr>
						<th>Post Title</th>
						<th>Published</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $recent_posts as $p ) : ?>
					<tr>
						<td><strong><a href="<?php echo get_edit_post_link( $p->ID ); ?>"><?php echo esc_html( $p->post_title ); ?></a></strong></td>
						<td><?php echo esc_html( get_the_date( '', $p->ID ) ); ?></td>
						<td>
							<button class="sc-btn sc-btn-outline sc-btn-sm btn-scan-post" data-id="<?php echo esc_attr( $p->ID ); ?>"><?php esc_html_e( 'Scan Content', 'seo-copilot' ); ?></button>
						</td>
					</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>

		<!-- Orphan Content -->
		<div class="sc-card" style="flex:1;margin-bottom:0;">
			<div class="sc-card-header">
				<h3><?php esc_html_e( 'Orphan Content', 'seo-copilot' ); ?></h3>
				<span class="sc-badge sc-badge-danger"><?php esc_html_e( 'No Internal Links', 'seo-copilot' ); ?></span>
			</div>
			
			<table class="sc-table">
				<thead>
					<tr>
						<th>Orphan Post</th>
						<th>Focus Keyword To Link To</th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $orphans ) ) : ?>
						<tr><td colspan="2" style="text-align:center;"><span class="sc-badge sc-badge-success"><?php esc_html_e( 'No orphans detected!', 'seo-copilot' ); ?></span></td></tr>
					<?php else: ?>
						<?php foreach ( array_slice( $orphans, 0, 15 ) as $orph ) : ?>
						<tr>
							<td><a href="<?php echo esc_url( $orph->post_url ); ?>" target="_blank"><?php echo esc_html( $orph->post_title ); ?></a></td>
							<td><span style="background:#f0f0f1; padding:3px 6px; border-radius:3px; font-size:11px;"><?php echo esc_html( $orph->keyword ); ?></span></td>
						</tr>
						<?php endforeach; ?>
						<?php if ( count( $orphans ) > 15 ) : ?>
							<tr><td colspan="2" style="text-align:center;"><em>+ <?php echo count( $orphans ) - 15; ?> more</em></td></tr>
						<?php endif; ?>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
	</div>

	<!-- Opportunities Modal -->
	<div id="seo-copilot-opps-modal" class="seo-copilot-modal" style="display:none;">
		<div class="seo-copilot-modal-content" style="max-width:800px; padding:20px; background:#fff; margin:5% auto; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
			<span class="seo-copilot-close" id="close-opps-modal" style="float:right; cursor:pointer; font-size:20px;">&times;</span>
			<h2>Linking Opportunities Found</h2>
			<div id="opps-results-container" style="max-height:60vh; overflow-y:auto; margin-top:20px;">
				<table class="wp-list-table widefat fixed striped" id="opps-table">
					<thead>
						<tr>
							<th style="width:30px;"><input type="checkbox" id="opps-select-all" checked></th>
							<th>Keyword Matched</th>
							<th>Target Post</th>
							<th>Context Snippet</th>
						</tr>
					</thead>
					<tbody id="opps-table-body">
						<!-- Populated via AJAX -->
					</tbody>
				</table>
			</div>
			
			<div style="margin-top:20px; text-align:right;">
				<input type="hidden" id="current_scan_post_id" value="">
				<button class="sc-btn sc-btn-primary" id="seo-copilot-apply-links"><?php esc_html_e( 'Inject Selected Links to Post', 'seo-copilot' ); ?></button>
			</div>
		</div>
	</div>

</div>

<style>
.seo-copilot-modal { position: fixed; z-index: 99999; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5); }
.opps-snippet strong { background: #fff3cd; color: #664d03; padding: 2px; }
</style>

<script>
jQuery(document).ready(function($) {
	
	// Modals
	$('#close-opps-modal').on('click', function() { $('#seo-copilot-opps-modal').hide(); });
	
	// Select All Checkbox
	$('#opps-select-all').on('change', function() {
		$('.opp-checkbox').prop('checked', $(this).prop('checked'));
	});

	// Rebuild Map
	$('#seo-copilot-rebuild-map').on('click', function() {
		let btn = $(this);
		if(!confirm('This will scan all published posts for their focus keywords and overwrite the current map. Continue?')) return;
		
		btn.prop('disabled', true).text('Rebuilding...');
		
		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_build_map',
				nonce: seoCopilotAdmin.nonce
			},
			success: function(res) {
				if(res.success) {
					alert(res.data.message);
					location.reload();
				} else {
					alert('Error: ' + res.data);
					btn.prop('disabled', false).text('Rebuild Site Keyword Map');
				}
			},
			error: function() {
				alert('Server error.');
				btn.prop('disabled', false).text('Rebuild Site Keyword Map');
			}
		});
	});

	// Scan Post
	$('.btn-scan-post').on('click', function() {
		let btn = $(this);
		let pid = btn.attr('data-id');
		
		btn.prop('disabled', true).text('Scanning...');
		
		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_scan_links',
				nonce: seoCopilotAdmin.nonce,
				post_id: pid
			},
			success: function(res) {
				btn.prop('disabled', false).text('Scan Content');
				if(res.success) {
					let opps = res.data;
					let tbody = $('#opps-table-body');
					tbody.empty();
					
					if(opps.length === 0) {
						tbody.append('<tr><td colspan="4" style="text-align:center;">No safe linking opportunities found in this content based on the current keyword map.</td></tr>');
						$('#seo-copilot-apply-links').hide();
					} else {
						$('#seo-copilot-apply-links').show();
						opps.forEach(function(opp, index){
							let row = '<tr>';
							row += '<td><input type="checkbox" class="opp-checkbox" checked value="'+index+'" data-json=\'' + JSON.stringify(opp).replace(/'/g, "&#39;") + '\'></td>';
							row += '<td><strong>' + opp.keyword + '</strong></td>';
							row += '<td>' + opp.target_title + '</td>';
							row += '<td class="opps-snippet"><em>' + opp.snippet + '</em></td>';
							row += '</tr>';
							tbody.append(row);
						});
					}
					
					$('#current_scan_post_id').val(pid);
					$('#seo-copilot-opps-modal').show();
				} else {
					alert('Error: ' + res.data);
				}
			},
			error: function() {
				alert('Server error.');
				btn.prop('disabled', false).text('Scan Content');
			}
		});
	});

	// Apply Links
	$('#seo-copilot-apply-links').on('click', function() {
		let btn = $(this);
		let pid = $('#current_scan_post_id').val();
		
		let selected_links = [];
		$('.opp-checkbox:checked').each(function() {
			selected_links.push( JSON.parse($(this).attr('data-json')) );
		});
		
		if(selected_links.length === 0) {
			alert('Please select at least one link to apply.');
			return;
		}
		
		btn.prop('disabled', true).text('Applying Links...');
		
		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_apply_links',
				nonce: seoCopilotAdmin.nonce,
				post_id: pid,
				links: selected_links
			},
			success: function(res) {
				if(res.success) {
					alert(res.data);
					$('#seo-copilot-opps-modal').hide();
					location.reload();
				} else {
					alert('Error: ' + res.data);
					btn.prop('disabled', false).text('Inject Selected Links to Post');
				}
			},
			error: function() {
				alert('Server error.');
				btn.prop('disabled', false).text('Inject Selected Links to Post');
			}
		});
	});
});
</script>
