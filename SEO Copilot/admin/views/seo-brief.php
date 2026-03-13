<?php
if ( ! defined( 'WPINC' ) ) {
	die;
}

$brief_api = new SEO_Copilot_SEO_Brief();
$briefs = $brief_api->get_briefs();
?>

<div class="wrap seo-copilot-page">

	<!-- Page Header -->
	<div class="sc-page-header">
		<div class="sc-page-header-left">
			<div class="sc-page-icon">📋</div>
			<div>
				<h1 class="sc-page-title"><?php esc_html_e( 'SEO Brief Generator', 'seo-copilot' ); ?></h1>
				<p class="sc-page-subtitle"><?php esc_html_e( 'Get a complete content battle plan before writing a single word', 'seo-copilot' ); ?></p>
			</div>
		</div>
		<div class="sc-page-header-right">
			<button class="sc-btn sc-btn-primary" id="seo-copilot-new-brief-btn">
				<span class="dashicons dashicons-plus-alt2"></span>
				<?php esc_html_e( 'Generate New Brief', 'seo-copilot' ); ?>
			</button>
		</div>
	</div>

	<!-- Tip Box -->
	<div class="sc-tip-box">
		<span class="sc-tip-icon">💡</span>
		<div class="sc-tip-text">
			<strong><?php esc_html_e( 'How to use', 'seo-copilot' ); ?></strong>
			<?php esc_html_e( 'A good SEO brief saves hours of research. Enter your target keyword, select your country, and get a complete outline based on what\'s actually ranking right now.', 'seo-copilot' ); ?>
		</div>
	</div>

	<!-- Generate Brief Modal -->
	<div id="seo-copilot-brief-modal" class="sc-modal-overlay">
		<div class="sc-modal">
			<div class="sc-modal-header">
				<h3><?php esc_html_e( 'Create New SEO Brief', 'seo-copilot' ); ?></h3>
				<button class="sc-modal-close" id="close-brief-modal">&times;</button>
			</div>
			<div class="sc-modal-body">
				<p style="font-size:13px;color:var(--sc-grey);margin-top:0;"><?php esc_html_e( 'Enter a target keyword to generate a complete outline and strategy based on real-time competitor data.', 'seo-copilot' ); ?></p>
				
				<div class="sc-form-group">
					<label for="new_brief_keyword"><?php esc_html_e( 'Focus Keyword', 'seo-copilot' ); ?></label>
					<input type="text" id="new_brief_keyword" class="sc-form-control" placeholder="e.g. best hiking boots 2024">
				</div>

				<div class="sc-form-group">
					<label for="new_brief_country"><?php esc_html_e( 'Target Country', 'seo-copilot' ); ?></label>
					<!-- Searchable Country Select -->
					<div class="sc-searchable-select">
						<input type="text" class="sc-search-input" id="brief-country-search" placeholder="🔍 <?php esc_attr_e( 'Search countries...', 'seo-copilot' ); ?>" autocomplete="off">
						<select id="new_brief_country" class="sc-form-control">
							<option value="US">United States</option>
							<option value="GB">United Kingdom</option>
							<option value="CA">Canada</option>
							<option value="AU">Australia</option>
							<option value="IN">India</option>
							<option value="DE">Germany</option>
							<option value="FR">France</option>
							<option value="ES">Spain</option>
							<option value="IT">Italy</option>
							<option value="BR">Brazil</option>
							<option value="MX">Mexico</option>
							<option value="NL">Netherlands</option>
							<option value="SE">Sweden</option>
							<option value="NO">Norway</option>
							<option value="DK">Denmark</option>
							<option value="FI">Finland</option>
							<option value="PL">Poland</option>
							<option value="JP">Japan</option>
							<option value="KR">South Korea</option>
							<option value="AE">United Arab Emirates</option>
							<option value="SA">Saudi Arabia</option>
							<option value="SG">Singapore</option>
							<option value="ZA">South Africa</option>
							<option value="NG">Nigeria</option>
							<option value="EG">Egypt</option>
							<option value="PK">Pakistan</option>
							<option value="BD">Bangladesh</option>
							<option value="PH">Philippines</option>
							<option value="ID">Indonesia</option>
							<option value="MY">Malaysia</option>
							<option value="TH">Thailand</option>
							<option value="VN">Vietnam</option>
							<option value="AR">Argentina</option>
							<option value="CO">Colombia</option>
							<option value="CL">Chile</option>
							<option value="PE">Peru</option>
							<option value="PT">Portugal</option>
							<option value="BE">Belgium</option>
							<option value="CH">Switzerland</option>
							<option value="AT">Austria</option>
							<option value="IE">Ireland</option>
							<option value="NZ">New Zealand</option>
							<option value="HK">Hong Kong</option>
							<option value="TW">Taiwan</option>
							<option value="RU">Russia</option>
							<option value="UA">Ukraine</option>
							<option value="TR">Turkey</option>
							<option value="IL">Israel</option>
							<option value="GR">Greece</option>
							<option value="CZ">Czech Republic</option>
							<option value="HU">Hungary</option>
							<option value="RO">Romania</option>
						</select>
					</div>
				</div>
			</div>
			<div class="sc-modal-footer">
				<span id="brief-generation-status" style="font-size:13px;color:var(--sc-grey);margin-right:auto;"></span>
				<button class="sc-btn sc-btn-primary" id="seo-copilot-generate-brief-submit">
					<?php esc_html_e( 'Generate Brief (~30s)', 'seo-copilot' ); ?>
					<span class="spinner" style="float:none; margin:0 0 0 5px;" id="brief-spinner"></span>
				</button>
			</div>
		</div>
	</div>

	<!-- Briefs List -->
	<div class="sc-card">
		<div class="sc-card-header">
			<h3><?php esc_html_e( 'Generated Briefs', 'seo-copilot' ); ?></h3>
		</div>
		<div class="sc-card-body" style="padding:0;">
			<table class="sc-table">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Keyword', 'seo-copilot' ); ?></th>
						<th><?php esc_html_e( 'Country', 'seo-copilot' ); ?></th>
						<th><?php esc_html_e( 'Status', 'seo-copilot' ); ?></th>
						<th><?php esc_html_e( 'Generated', 'seo-copilot' ); ?></th>
						<th><?php esc_html_e( 'Actions', 'seo-copilot' ); ?></th>
					</tr>
				</thead>
				<tbody id="briefs-table-body">
				<?php if ( empty( $briefs ) ) : ?>
					<tr id="no-briefs-row"><td colspan="5" style="text-align:center;">No briefs generated yet.</td></tr>
				<?php else: ?>
					<?php foreach ( $briefs as $brief ) : ?>
						<tr data-id="<?php echo esc_attr( $brief->id ); ?>">
							<td><strong><?php echo esc_html( $brief->keyword ); ?></strong></td>
							<td><?php echo esc_html( $brief->country_code ); ?></td>
							<td>
								<?php if ( 'assigned' === $brief->status ) : ?>
									<span style="background:#d1e7dd; color:#0f5132; padding:3px 8px; border-radius:12px; font-size:11px;">Assigned to Post</span>
								<?php else : ?>
									<span style="background:#fff3cd; color:#664d03; padding:3px 8px; border-radius:12px; font-size:11px;">Draft</span>
								<?php endif; ?>
							</td>
							<td><?php echo date_i18n( get_option( 'date_format' ), strtotime( $brief->created_at ) ); ?></td>
							<td>
								<button class="sc-btn sc-btn-outline sc-btn-sm action-view-brief" data-id="<?php echo esc_attr( $brief->id ); ?>" data-json="<?php echo esc_attr( $brief->brief_data ); ?>"><?php esc_html_e( 'View', 'seo-copilot' ); ?></button>
								<button class="sc-btn sc-btn-danger sc-btn-sm action-delete-brief" data-id="<?php echo esc_attr( $brief->id ); ?>"><?php esc_html_e( 'Delete', 'seo-copilot' ); ?></button>
							</td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
				</tbody>
			</table>
		</div>
	</div>

	<!-- Brief Viewer Modal -->
	<div id="seo-copilot-view-modal" class="seo-copilot-modal" style="display:none;">
		<div class="seo-copilot-modal-content" style="max-width:800px; padding:20px; background:#fff; margin:2% auto; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); max-height:85vh; overflow-y:auto;">
			<span class="seo-copilot-close" id="close-view-modal" style="float:right; cursor:pointer; font-size:20px;">&times;</span>
			<h2 id="view-brief-keyword">Brief Details</h2>
			
			<div style="background:#f8f9fa; padding:15px; border-radius:5px; margin-bottom:20px; border-left:4px solid #007cba;">
				<h3 style="margin-top:0;">Strategy Overview</h3>
				<p><strong>Meta Title:</strong> <span id="view-brief-title"></span></p>
				<p><strong>Meta Description:</strong> <span id="view-brief-desc"></span></p>
				<p><strong>Target Audience:</strong> <span id="view-brief-audience"></span></p>
				<p><strong>Search Intent:</strong> <span id="view-brief-intent"></span></p>
				<p><strong>Target Word Count:</strong> <span id="view-brief-words"></span> words</p>
			</div>

			<h3>Recommended Outline</h3>
			<ul id="view-brief-outline" style="list-style-type:none; padding:0;"></ul>

			<div style="display:flex; gap:20px;">
				<div style="flex:1;">
					<h3>Must Include Keywords</h3>
					<ul id="view-brief-keywords" style="background:#f1f1f1; padding:15px; border-radius:5px; list-style-position:inside;"></ul>
				</div>
				<div style="flex:1;">
					<h3>Questions to Answer</h3>
					<ul id="view-brief-questions" style="background:#f1f1f1; padding:15px; border-radius:5px; list-style-position:inside;"></ul>
				</div>
			</div>
			
			<div style="margin-top:20px;">
				<h3>Suggested Internal Links</h3>
				<ul id="view-brief-links"></ul>
			</div>

			<div style="margin-top:30px; border-top:1px solid #ddd; padding-top:20px; text-align:right;">
				<button class="button button-primary" id="btn-create-post">Create Draft Post from Brief</button>
			</div>
		</div>
	</div>
</div>

<style>
.sc-searchable-select .sc-form-control { border-radius: 0 0 6px 6px; margin-top: 0; }
.outline-item { background: var(--sc-white); border: 1px solid var(--sc-border); padding: 10px 15px; margin-bottom: 8px; border-radius: var(--sc-radius); border-left: 3px solid var(--sc-border); }
.outline-item.h2 { margin-left: 20px; border-left-color: var(--sc-primary); }
.outline-item.h3 { margin-left: 40px; border-left-color: var(--sc-success); }
</style>

<script>
// Country search filter
document.getElementById('brief-country-search') && document.getElementById('brief-country-search').addEventListener('input', function() {
	var q = this.value.toLowerCase();
	var opts = document.getElementById('new_brief_country').options;
	for (var i = 0; i < opts.length; i++) {
		opts[i].style.display = opts[i].text.toLowerCase().indexOf(q) > -1 ? '' : 'none';
	}
});
</script>

<script>
jQuery(document).ready(function($) {
	// Modals — use is-open class for new sc-modal-overlay
	$('#seo-copilot-new-brief-btn').on('click', function() { $('#seo-copilot-brief-modal').addClass('is-open'); });
	$('#close-brief-modal').on('click', function() { $('#seo-copilot-brief-modal').removeClass('is-open'); });
	$('#seo-copilot-brief-modal').on('click', function(e) { if ($(e.target).is('#seo-copilot-brief-modal')) $(this).removeClass('is-open'); });
	$('#close-view-modal').on('click', function() { $('#seo-copilot-view-modal').hide(); });

	// Generate Brief
	$('#seo-copilot-generate-brief-submit').on('click', function() {
		let btn = $(this);
		let kw = $('#new_brief_keyword').val();
		let country = $('#new_brief_country').val();
		let spinner = $('#brief-spinner');
		let status = $('#brief-generation-status');

		if (!kw) { alert('Enter a keyword'); return; }

		btn.prop('disabled', true);
		spinner.addClass('is-active');
		status.text('Fetching data and calling AI... This may take up to a minute.');

		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_generate_brief',
				nonce: seoCopilotAdmin.nonce,
				keyword: kw,
				country: country
			},
			success: function(res) {
				if(res.success) {
					status.text('Brief generated! Saving to database...');
					
					// Save the brief
					$.ajax({
						url: seoCopilotAdmin.ajaxUrl,
						type: 'POST',
						data: {
							action: 'seo_copilot_save_brief',
							nonce: seoCopilotAdmin.nonce,
							keyword: kw,
							country: country,
							brief_data: JSON.stringify(res.data)
						},
						success: function(saveRes) {
							if(saveRes.success) {
								status.text('Brief saved successfully!');
								setTimeout(function(){ location.reload(); }, 1000);
							} else {
								alert('Failed to save brief.');
								btn.prop('disabled', false); spinner.removeClass('is-active');
							}
						}
					});
				} else {
					alert('Error: ' + res.data);
					btn.prop('disabled', false); spinner.removeClass('is-active'); status.text('');
				}
			},
			error: function() {
				alert('Server error generating brief.');
				btn.prop('disabled', false); spinner.removeClass('is-active'); status.text('');
			}
		});
	});

	// View Brief
	$('.action-view-brief').on('click', function() {
		let jsonStr = $(this).attr('data-json');
		let id = $(this).attr('data-id');
		let data = JSON.parse(jsonStr);
		
		$('#btn-create-post').attr('data-id', id);

		$('#view-brief-keyword').text('Strategy: ' + (data.recommended_title || 'Untitled'));
		$('#view-brief-title').text(data.recommended_title || '');
		$('#view-brief-desc').text(data.recommended_meta_description || '');
		$('#view-brief-audience').text(data.target_audience || '');
		$('#view-brief-intent').text(data.search_intent || '');
		$('#view-brief-words').text(data.recommended_word_count || 0);

		// Outline
		let outlineHtml = '';
		if(data.outline && data.outline.length > 0) {
			data.outline.forEach(item => {
				let cls = item.type.toLowerCase();
				outlineHtml += '<li class="outline-item ' + cls + '"><strong>' + item.type + ':</strong> ' + item.text + '<br><small style="color:#666;">' + (item.notes||'') + '</small></li>';
			});
		} else { outlineHtml = '<li>No outline provided.</li>'; }
		$('#view-brief-outline').html(outlineHtml);

		// Keywords
		let kwHtml = '';
		if(data.must_include_keywords && data.must_include_keywords.length > 0) {
			data.must_include_keywords.forEach(k => { kwHtml += '<li>' + k + '</li>'; });
		}
		$('#view-brief-keywords').html(kwHtml);

		// Questions
		let qHtml = '';
		if(data.questions_to_answer && data.questions_to_answer.length > 0) {
			data.questions_to_answer.forEach(q => { qHtml += '<li>' + q + '</li>'; });
		}
		$('#view-brief-questions').html(qHtml);

		// Internal Links
		let linkHtml = '';
		if(data.internal_links_to_include && data.internal_links_to_include.length > 0) {
			data.internal_links_to_include.forEach(l => {
				linkHtml += '<li><a href="' + l.url + '" target="_blank">' + l.title + '</a></li>';
			});
		} else { linkHtml = '<li>No suggestions found.</li>'; }
		$('#view-brief-links').html(linkHtml);

		$('#seo-copilot-view-modal').show();
	});

	// Create Post from Brief
	$('#btn-create-post').on('click', function() {
		let btn = $(this);
		let id = btn.attr('data-id');
		if(!id) return;
		
		btn.prop('disabled', true).text('Creating Draft...');
		
		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_create_post',
				nonce: seoCopilotAdmin.nonce,
				brief_id: id
			},
			success: function(res) {
				if(res.success) {
					window.location.href = res.data.edit_url;
				} else {
					alert('Error: ' + res.data);
					btn.prop('disabled', false).text('Create Draft Post from Brief');
				}
			},
			error: function() {
				alert('Server error.');
				btn.prop('disabled', false).text('Create Draft Post from Brief');
			}
		});
	});

	// Delete Brief
	$('.action-delete-brief').on('click', function() {
		if(!confirm('Are you sure you want to delete this brief?')) return;
		let id = $(this).attr('data-id');
		let row = $(this).closest('tr');
		
		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_delete_brief',
				nonce: seoCopilotAdmin.nonce,
				brief_id: id
			},
			success: function(res) {
				if(res.success) { row.fadeOut(300, function(){ $(this).remove(); }); }
			}
		});
	});
});
</script>
