<?php
/**
 * Client Reports Admin View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

$reports_api = seo_copilot_client_reports();
$clients     = $reports_api->get_clients();
$reports     = $reports_api->get_reports();
$settings    = $reports_api->get_agency_settings();

$is_configured = ! empty( $settings['agency_name'] ) && ! empty( $settings['agency_logo'] );
?>

<div class="wrap seo-copilot-page" style="position:relative; min-height:800px;">

	<!-- PAGE HEADER -->
	<div class="sc-page-header">
		<div class="sc-header-left">
			<span class="sc-header-icon" style="background:#EEF2FF; color:#4F46E5;">📊</span>
			<div>
				<h1 class="wp-heading-inline">Client Reports</h1>
				<p class="sc-header-subtitle">Generate white-label SEO reports for your clients in minutes</p>
			</div>
		</div>
		<div class="sc-header-right">
			<button id="btn-new-client" class="sc-btn sc-btn-outline"><span class="dashicons dashicons-plus" style="margin-top:2px;"></span> New Client</button>
			<button id="btn-open-generator" class="sc-btn sc-btn-primary"><span class="dashicons dashicons-analytics" style="margin-top:2px;"></span> Generate Report</button>
		</div>
	</div>

	<!-- TIP BOX -->
	<div class="sc-tip-box" style="margin-bottom:24px;">
		<span class="sc-tip-icon">💡</span>
		<div class="sc-tip-content">
			<strong>White-label reporting:</strong> White-label reports let you present professional SEO results under your own agency brand. Set up your agency details in the main settings, add your clients, and generate monthly reports in one click.
		</div>
	</div>

	<!-- SECTION 1: AGENCY BRANDING SETUP -->
	<?php if ( ! $is_configured ) : ?>
	<div class="sc-card" style="border-left: 4px solid var(--sc-warning); margin-bottom: 32px; background: #fffbeb;">
		<div style="display:flex; justify-content:space-between; align-items:center;">
			<div>
				<h3 style="margin:0 0 8px 0; color:#d97706;">⚙️ Set up your agency branding</h3>
				<p style="margin:0; color:#b45309;">Add your logo and colors to white-label all client reports.</p>
			</div>
			<a href="<?php echo esc_url( admin_url( 'admin.php?page=seo-copilot-settings' ) ); ?>" class="sc-btn sc-btn-primary" style="background:#d97706; border-color:#d97706;">Configure Branding &rarr;</a>
		</div>
	</div>
	<?php endif; ?>

	<!-- SECTION 2: CLIENTS -->
	<h2 style="font-size:20px; font-weight:600; margin-bottom:16px; color:var(--sc-dark);">Your Clients</h2>
	<div class="sc-clients-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:24px; margin-bottom:40px;">
		
		<!-- Add New Client Card -->
		<div class="sc-card" id="card-new-client" style="display:flex; align-items:center; justify-content:center; cursor:pointer; min-height:180px; border:2px dashed var(--sc-border); background:transparent; transition:all 0.2s ease;">
			<div style="text-align:center; color:var(--sc-primary); font-weight:600; font-size:16px;">
				<span class="dashicons dashicons-plus-alt2" style="font-size:32px; width:32px; height:32px; display:block; margin:0 auto 12px auto;"></span>
				Add New Client
			</div>
		</div>

		<?php foreach ( $clients as $client ) : 
			// Count reports for this client
			$client_reports = array_filter($reports, function($r) use ($client) { return $r['client_id'] == $client['id']; });
			$report_count   = count($client_reports);
			
			$last_report = 'Never';
			if($report_count > 0) {
				$latest = reset($client_reports);
				$last_report = date('M Y', strtotime($latest['created_at']));
			}
			
			$bg_color = $client['brand_color'] ? $client['brand_color'] : '#4F46E5';
		?>
		<div class="sc-card sc-client-card" style="position:relative; overflow:hidden;" data-id="<?php echo esc_attr($client['id']); ?>">
			<div style="height:60px; background:<?php echo esc_attr($bg_color); ?>; margin:-24px -24px 20px -24px;"></div>
			
			<?php if ( $client['logo_url'] ) : ?>
				<div style="width:64px; height:64px; background:white; padding:4px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); position:absolute; top:28px; left:24px;">
					<img src="<?php echo esc_url($client['logo_url']); ?>" style="width:100%; height:100%; object-fit:contain; border-radius:4px;" />
				</div>
			<?php else : ?>
				<div style="width:64px; height:64px; background:white; border:1px solid var(--sc-border); color:<?php echo esc_attr($bg_color); ?>; font-size:24px; font-weight:700; display:flex; align-items:center; justify-content:center; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); position:absolute; top:28px; left:24px;">
					<?php echo esc_html( strtoupper( substr( $client['name'], 0, 1 ) ) ); ?>
				</div>
			<?php endif; ?>

			<div style="margin-top:48px;">
				<h3 style="margin:0 0 4px 0; font-size:18px; color:var(--sc-dark);"><?php echo esc_html($client['name']); ?></h3>
				<?php if($client['website_url']) : ?>
					<div style="color:var(--sc-grey); font-size:13px; margin-bottom:4px;"><a href="<?php echo esc_url($client['website_url']); ?>" target="_blank" style="text-decoration:none; color:inherit;">🔗 <?php echo esc_html( parse_url($client['website_url'], PHP_URL_HOST) ); ?></a></div>
				<?php endif; ?>
				<div style="color:var(--sc-grey); font-size:13px; margin-bottom:16px;">✉️ <?php echo esc_html($client['email']); ?></div>
				
				<div style="display:flex; justify-content:space-between; font-size:12px; color:var(--sc-grey); border-top:1px solid var(--sc-border); padding-top:12px; margin-bottom:16px;">
					<span>Reports: <strong><?php echo $report_count; ?></strong></span>
					<span>Last: <strong><?php echo esc_html($last_report); ?></strong></span>
				</div>

				<div style="display:flex; gap:8px;">
					<button class="sc-btn sc-btn-primary sc-btn-sm sc-btn-block btn-gen-client-report" data-id="<?php echo esc_attr($client['id']); ?>">Create Report</button>
					<button class="sc-btn sc-btn-outline sc-btn-sm btn-delete-client" data-id="<?php echo esc_attr($client['id']); ?>" style="color:var(--sc-danger); border-color:var(--sc-danger);" title="Delete"><span class="dashicons dashicons-trash" style="font-size:14px; margin-top:4px;"></span></button>
				</div>
			</div>
		</div>
		<?php endforeach; ?>
	</div>

	<!-- SECTION 3: REPORTS TABLE -->
	<div class="sc-card">
		<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
			<h2 style="font-size:20px; font-weight:600; margin:0; color:var(--sc-dark);">Recent Reports</h2>
		</div>

		<table class="sc-table" style="width:100%;">
			<thead>
				<tr>
					<th>Report Name</th>
					<th>Client</th>
					<th>Period</th>
					<th>Type</th>
					<th>Status</th>
					<th>Created</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<?php if ( empty( $reports ) ) : ?>
					<tr>
						<td colspan="7" style="text-align:center; padding:40px; color:var(--sc-grey);">
							No reports generated yet. Click "Generate Report" to create your first one.
						</td>
					</tr>
				<?php else : ?>
					<?php foreach ( $reports as $r ) : 
						$status_class = 'sc-badge';
						if ( $r['status'] == 'generated' ) $status_class = 'sc-badge sc-badge-primary';
						if ( $r['status'] == 'sent' ) $status_class = 'sc-badge sc-badge-success';
						
						$period = date('M j', strtotime($r['date_from'])) . ' - ' . date('M j, Y', strtotime($r['date_to']));
					?>
					<tr>
						<td><strong><?php echo esc_html($r['report_name']); ?></strong></td>
						<td><?php echo esc_html($r['client_name']); ?></td>
						<td><?php echo esc_html($period); ?></td>
						<td style="text-transform:capitalize;"><?php echo esc_html($r['report_type']); ?></td>
						<td><span class="<?php echo esc_attr($status_class); ?>"><?php echo esc_html( strtoupper($r['status']) ); ?></span></td>
						<td style="color:var(--sc-grey); font-size:12px;"><?php echo date('M j, Y', strtotime($r['created_at'])); ?></td>
						<td>
							<a href="<?php echo admin_url('admin.php?page=seo-copilot-reports&action=view&id='.$r['id']); ?>" class="button button-small" target="_blank">Preview / PDF</a>
							<button class="button button-small btn-send-report" data-id="<?php echo esc_attr($r['id']); ?>" data-email="<?php echo esc_attr($r['client_email']); ?>">Send Email</button>
							<button class="button button-small btn-delete-report" data-id="<?php echo esc_attr($r['id']); ?>" style="color:red;">Delete</button>
						</td>
					</tr>
					<?php endforeach; ?>
				<?php endif; ?>
			</tbody>
		</table>
	</div>

</div>

<!-- ==========================================
     MODALS
     ========================================== -->

<!-- Overlay -->
<div id="sc-modal-overlay" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:99900; backdrop-filter:blur(2px);"></div>

<!-- Client Form Modal -->
<div id="sc-client-modal" class="sc-card" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:100%; max-width:500px; z-index:99905; padding:32px;">
	<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
		<h2 style="margin:0; font-size:20px;">Add New Client</h2>
		<button class="sc-modal-close" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
	</div>

	<form id="form-client">
		<div style="margin-bottom:16px;">
			<label style="display:block; font-weight:600; margin-bottom:8px;">Client Name *</label>
			<input type="text" name="name" class="sc-form-control" style="width:100%;" required>
		</div>
		<div style="margin-bottom:16px;">
			<label style="display:block; font-weight:600; margin-bottom:8px;">Primary Email *</label>
			<input type="email" name="email" class="sc-form-control" style="width:100%;" required>
		</div>
		<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
			<div>
				<label style="display:block; font-weight:600; margin-bottom:8px;">Company</label>
				<input type="text" name="company" class="sc-form-control" style="width:100%;">
			</div>
			<div>
				<label style="display:block; font-weight:600; margin-bottom:8px;">Website URL</label>
				<input type="url" name="website_url" class="sc-form-control" style="width:100%;">
			</div>
		</div>
		<div style="display:grid; grid-template-columns:1fr 120px; gap:16px; margin-bottom:16px;">
			<div>
				<label style="display:block; font-weight:600; margin-bottom:8px;">Logo URL</label>
				<input type="url" name="logo_url" class="sc-form-control" style="width:100%;" placeholder="https://...">
			</div>
			<div>
				<label style="display:block; font-weight:600; margin-bottom:8px;">Brand Color</label>
				<input type="color" name="brand_color" value="#4F46E5" style="width:100%; height:36px; padding:2px; cursor:pointer;">
			</div>
		</div>
		<div style="margin-bottom:24px;">
			<label style="display:block; font-weight:600; margin-bottom:8px;">Notes</label>
			<textarea name="notes" class="sc-form-control" style="width:100%;" rows="3"></textarea>
		</div>

		<div style="display:flex; justify-content:flex-end; gap:12px;">
			<button type="button" class="sc-btn sc-btn-outline sc-modal-close">Cancel</button>
			<button type="submit" class="sc-btn sc-btn-primary" id="btn-save-client">Save Client</button>
		</div>
	</form>
</div>

<!-- Generate Report Wizard Modal -->
<div id="sc-generator-modal" class="sc-card" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:100%; max-width:600px; z-index:99905; padding:0; overflow:hidden; display:flex; flex-direction:column; max-height:90vh;">
	
	<!-- Generator Header -->
	<div style="background:#f8f9fa; padding:24px 32px; border-bottom:1px solid var(--sc-border); display:flex; justify-content:space-between; align-items:center;">
		<h2 style="margin:0; font-size:20px; display:flex; align-items:center; gap:12px;">
			<span style="font-size:24px; color:var(--sc-primary);">📊</span> Report Generator
		</h2>
		<button class="sc-modal-close" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
	</div>

	<!-- Steps indicator -->
	<div style="padding:16px 32px; background:white; border-bottom:1px solid var(--sc-border); display:flex; justify-content:space-between; text-transform:uppercase; font-size:12px; font-weight:700; color:var(--sc-grey);">
		<span class="gen-step-label active" data-step="1" style="color:var(--sc-primary);">1. Setup</span>
		<span class="gen-step-label" data-step="2">2. Sections</span>
		<span class="gen-step-label" data-step="3">3. Branding</span>
	</div>

	<!-- Generator Body (Scrollable) -->
	<div style="padding:32px; overflow-y:auto; flex:1;">
		<form id="form-generate-report">
			
			<!-- Step 1: Setup -->
			<div class="gen-step" id="gen-step-1">
				<div style="margin-bottom:20px;">
					<label style="display:block; font-weight:600; margin-bottom:8px;">Select Client *</label>
					<select name="gen_client_id" id="gen_client_id" class="sc-form-control" style="width:100%;" required>
						<option value="">-- Choose Client --</option>
						<?php foreach($clients as $c) : ?>
							<option value="<?php echo esc_attr($c['id']); ?>" data-name="<?php echo esc_attr($c['name']); ?>" data-color="<?php echo esc_attr($c['brand_color']); ?>"><?php echo esc_html($c['name']); ?></option>
						<?php endforeach; ?>
					</select>
				</div>
				<div style="margin-bottom:20px;">
					<label style="display:block; font-weight:600; margin-bottom:8px;">Report Name *</label>
					<input type="text" name="gen_report_name" id="gen_report_name" class="sc-form-control" style="width:100%;" required>
				</div>
				<div style="margin-bottom:20px;">
					<label style="display:block; font-weight:600; margin-bottom:8px;">Report Type</label>
					<select name="gen_report_type" id="gen_report_type" class="sc-form-control" style="width:100%;">
						<option value="monthly">Monthly Report</option>
						<option value="weekly">Weekly Report</option>
						<option value="custom">Custom Range</option>
						<option value="ondemand">On-Demand Audit</option>
					</select>
				</div>
				<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
					<div>
						<label style="display:block; font-weight:600; margin-bottom:8px;">Date From</label>
						<input type="date" name="gen_date_from" id="gen_date_from" class="sc-form-control" style="width:100%;" value="<?php echo date('Y-m-d', strtotime('-1 month')); ?>" required>
					</div>
					<div>
						<label style="display:block; font-weight:600; margin-bottom:8px;">Date To</label>
						<input type="date" name="gen_date_to" id="gen_date_to" class="sc-form-control" style="width:100%;" value="<?php echo date('Y-m-d'); ?>" required>
					</div>
				</div>
			</div>

			<!-- Step 2: Sections -->
			<div class="gen-step" id="gen-step-2" style="display:none;">
				<p style="margin-top:0; color:var(--sc-grey);">Select the modules to include in this report. AI summaries will be generated for the Executive Summary and Recommendations.</p>
				
				<div style="display:flex; flex-direction:column; gap:12px; margin-top:20px;">
					<label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--sc-border); border-radius:8px; cursor:pointer;" class="gen-section-toggle">
						<input type="checkbox" name="gen_sections[]" value="executive_summary" checked>
						<div>
							<strong>Executive Summary</strong><br>
							<span style="font-size:12px; color:var(--sc-grey);">AI-generated overview of performance and wins.</span>
						</div>
					</label>
					<label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--sc-border); border-radius:8px; cursor:pointer;" class="gen-section-toggle">
						<input type="checkbox" name="gen_sections[]" value="seo_health_score" checked>
						<div>
							<strong>SEO Health Score</strong><br>
							<span style="font-size:12px; color:var(--sc-grey);">Overall site score, trends, and top changes.</span>
						</div>
					</label>
					<label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--sc-border); border-radius:8px; cursor:pointer;" class="gen-section-toggle">
						<input type="checkbox" name="gen_sections[]" value="keyword_rankings" checked>
						<div>
							<strong>Keyword Rankings</strong><br>
							<span style="font-size:12px; color:var(--sc-grey);">Top moving keywords and general visibility metrics.</span>
						</div>
					</label>
					<label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--sc-border); border-radius:8px; cursor:pointer;" class="gen-section-toggle">
						<input type="checkbox" name="gen_sections[]" value="content_performance" checked>
						<div>
							<strong>Content Performance</strong><br>
							<span style="font-size:12px; color:var(--sc-grey);">Top performing URLs and optimization impacts.</span>
						</div>
					</label>
					<label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--sc-border); border-radius:8px; cursor:pointer;" class="gen-section-toggle">
						<input type="checkbox" name="gen_sections[]" value="technical_issues" checked>
						<div>
							<strong>Technical Issues</strong><br>
							<span style="font-size:12px; color:var(--sc-grey);">Audit findings, remaining 404s, and speed insights.</span>
						</div>
					</label>
					<label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--sc-border); border-radius:8px; cursor:pointer;" class="gen-section-toggle">
						<input type="checkbox" name="gen_sections[]" value="content_decay">
						<div>
							<strong>Content Decay Report</strong><br>
							<span style="font-size:12px; color:var(--sc-grey);">Pages at risk of losing traffic.</span>
						</div>
					</label>
					<label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--sc-border); border-radius:8px; cursor:pointer;" class="gen-section-toggle">
						<input type="checkbox" name="gen_sections[]" value="schema_coverage">
						<div>
							<strong>Schema Coverage</strong><br>
							<span style="font-size:12px; color:var(--sc-grey);">Rich snippet breakdown and opportunities.</span>
						</div>
					</label>
					<label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--sc-border); border-radius:8px; cursor:pointer;" class="gen-section-toggle">
						<input type="checkbox" name="gen_sections[]" value="recommendations" checked>
						<div>
							<strong>Top Recommendations</strong><br>
							<span style="font-size:12px; color:var(--sc-grey);">AI-generated priority list for the next reporting period.</span>
						</div>
					</label>
				</div>
			</div>

			<!-- Step 3: Branding -->
			<div class="gen-step" id="gen-step-3" style="display:none;">
				<div style="background:#f8f9fa; padding:16px; border-radius:8px; margin-bottom:24px;">
					<label class="seo-copilot-switch" style="display:flex; align-items:center; gap:12px;">
						<input type="checkbox" name="gen_white_label" id="gen_white_label" value="1" <?php echo ($settings['white_label'] === 'yes') ? 'checked' : ''; ?>>
						<span class="seo-copilot-slider round" style="position:relative; display:inline-block; width:44px; height:24px; top:auto;"></span>
						<strong style="font-size:15px;">Enable White-Labeling</strong>
					</label>
					<p style="margin:8px 0 0 56px; color:var(--sc-grey); font-size:13px;">Removes SEO Copilot branding and uses your agency configuration.</p>
				</div>
				
				<div id="gen-branding-fields" style="<?php echo ($settings['white_label'] === 'yes') ? '' : 'opacity:0.5; pointer-events:none;'; ?>">
					<div style="margin-bottom:20px;">
						<label style="display:block; font-weight:600; margin-bottom:8px;">Agency Name</label>
						<input type="text" name="gen_agency_name" class="sc-form-control" style="width:100%;" value="<?php echo esc_attr($settings['agency_name'] ?: 'Your Agency'); ?>">
					</div>
					<div style="display:grid; grid-template-columns:1fr 120px; gap:16px; margin-bottom:20px;">
						<div>
							<label style="display:block; font-weight:600; margin-bottom:8px;">Show Agency Logo</label>
							<label style="display:flex; align-items:center; gap:8px;">
								<input type="checkbox" name="gen_show_logo" value="1" checked> Yes
							</label>
						</div>
						<div>
							<label style="display:block; font-weight:600; margin-bottom:8px;">Client Color</label>
							<input type="color" name="gen_agency_color" id="gen_agency_color" value="<?php echo esc_attr($settings['agency_color'] ?: '#4F46E5'); ?>" style="width:100%; height:36px; padding:2px; cursor:pointer;">
						</div>
					</div>
					<?php if(!$is_configured) : ?>
						<p style="color:var(--sc-warning); font-size:12px;">⚠️ Note: You haven't fully configured your agency branding in settings. Defaults will be used.</p>
					<?php endif; ?>
				</div>
				
			</div>
		</form>

		<!-- Loading State -->
		<div id="gen-loading-state" style="display:none; text-align:center; padding:40px 0;">
			<div class="spinner is-active" style="float:none; margin:0 auto 20px auto; width:40px; height:40px;"></div>
			<div id="gen-loading-text" style="font-size:18px; font-weight:600; color:var(--sc-dark);">Collecting data from sources...</div>
			<p style="color:var(--sc-grey); font-size:14px; margin-top:8px;">This uses AI to generate summaries and may take 30-60 seconds.</p>
		</div>
	</div>

	<!-- Generator Footer Actions -->
	<div id="gen-footer-actions" style="background:#f8f9fa; padding:16px 32px; border-top:1px solid var(--sc-border); display:flex; justify-content:space-between; align-items:center;">
		<button type="button" class="sc-btn sc-btn-outline gen-prev-btn" style="visibility:hidden;">&larr; Back</button>
		<div style="display:flex; gap:12px;">
			<button type="button" class="sc-btn sc-btn-outline sc-modal-close">Cancel</button>
			<button type="button" class="sc-btn sc-btn-primary gen-next-btn">Next Step &rarr;</button>
			<button type="button" class="sc-btn sc-btn-primary gen-finish-btn" style="display:none;"><span class="dashicons dashicons-analytics" style="margin-top:2px;"></span> Build Report</button>
		</div>
	</div>
</div>

<script>
jQuery(document).ready(function($) {

	// HIDE MODALS INIT
	$('#sc-generator-modal').hide();

	// MODAL OPEN/CLOSE
	function openModal(id) {
		$('#sc-modal-overlay').fadeIn(200);
		$(id).fadeIn(200);
	}
	function closeModal() {
		$('#sc-modal-overlay, .sc-card[id$="-modal"]').fadeOut(200);
	}
	$('.sc-modal-close').on('click', function(e) {
		e.preventDefault();
		closeModal();
	});

	// CLIENT FORM
	$('#btn-new-client, #card-new-client').on('click', function() {
		$('#form-client')[0].reset();
		openModal('#sc-client-modal');
	});

	$('#form-client').on('submit', function(e) {
		e.preventDefault();
		var btn = $('#btn-save-client');
		btn.text('Saving...').prop('disabled', true);

		var formData = {};
		$.each($(this).serializeArray(), function() {
			formData[this.name] = this.value;
		});

		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_create_client',
			nonce: seoCopilotAdmin.nonce,
			client_data: formData
		}, function(res) {
			if(res.success) {
				location.reload();
			} else {
				alert('Error: ' + res.data);
				btn.text('Save Client').prop('disabled', false);
			}
		});
	});

	$('.btn-delete-client').on('click', function(e) {
		e.stopPropagation();
		if(!confirm('Are you sure you want to delete this client and all their reports?')) return;
		var btn = $(this);
		var id = btn.data('id');
		btn.prop('disabled', true);
		
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_delete_client',
			nonce: seoCopilotAdmin.nonce,
			client_id: id
		}, function(res) {
			if(res.success) {
				btn.closest('.sc-client-card').fadeOut();
			} else {
				alert('Error: ' + res.data);
				btn.prop('disabled', false);
			}
		});
	});

	// GENERATOR MULTI-STEP LOGIC
	var currentStep = 1;
	
	$('#btn-open-generator, .btn-gen-client-report').on('click', function() {
		// Reset
		currentStep = 1;
		$('.gen-step').hide();
		$('#gen-step-1').show();
		$('.gen-step-label').removeClass('active').css('color', 'var(--sc-grey)');
		$('.gen-step-label[data-step="1"]').addClass('active').css('color', 'var(--sc-primary)');
		
		$('.gen-prev-btn').css('visibility', 'hidden');
		$('.gen-next-btn').show();
		$('.gen-finish-btn').hide();
		$('#gen-loading-state').hide();
		$('#form-generate-report').show();
		$('#gen-footer-actions').show();

		// Auto select client if triggered from card
		var clientId = $(this).data('id');
		if(clientId) {
			$('#gen_client_id').val(clientId).trigger('change');
		}

		openModal('#sc-generator-modal');
	});

	// Auto-fill report name and sync brand color
	$('#gen_client_id').on('change', function() {
		var selected = $(this).find('option:selected');
		if(selected.val()) {
			var d = new Date();
			var month = d.toLocaleString('default', { month: 'long' });
			var textName = selected.data('name') + ' SEO Report — ' + month + ' ' + d.getFullYear();
			$('#gen_report_name').val(textName);
			
			var color = selected.data('color');
			if(color) $('#gen_agency_color').val(color);
		}
	});

	// Selectable section highlighting
	$('.gen-section-toggle input[type="checkbox"]').on('change', function() {
		if($(this).is(':checked')) {
			$(this).closest('label').css('background', '#f8f9fa').css('border-color', 'var(--sc-primary)');
		} else {
			$(this).closest('label').css('background', 'white').css('border-color', 'var(--sc-border)');
		}
	});
	$('.gen-section-toggle input[type="checkbox"]').trigger('change');

	// White label toggle
	$('#gen_white_label').on('change', function() {
		if($(this).is(':checked')) {
			$('#gen-branding-fields').css('opacity', '1').css('pointer-events', 'auto');
		} else {
			$('#gen-branding-fields').css('opacity', '0.5').css('pointer-events', 'none');
		}
	});

	// Next/Prev Buttons
	$('.gen-next-btn').on('click', function() {
		if(currentStep === 1) {
			// Validate Step 1
			if(!$('#gen_client_id').val()) { alert('Please select a client.'); return; }
			if(!$('#gen_report_name').val()) { alert('Please enter a report name.'); return; }
		}

		$('#gen-step-' + currentStep).hide();
		currentStep++;
		$('#gen-step-' + currentStep).show();
		
		updateStepUI();
	});

	$('.gen-prev-btn').on('click', function() {
		$('#gen-step-' + currentStep).hide();
		currentStep--;
		$('#gen-step-' + currentStep).show();
		
		updateStepUI();
	});

	function updateStepUI() {
		$('.gen-step-label').removeClass('active').css('color', 'var(--sc-grey)');
		$('.gen-step-label[data-step="'+currentStep+'"]').addClass('active').css('color', 'var(--sc-primary)');
		
		if(currentStep > 1) {
			$('.gen-prev-btn').css('visibility', 'visible');
		} else {
			$('.gen-prev-btn').css('visibility', 'hidden');
		}

		if(currentStep === 3) {
			$('.gen-next-btn').hide();
			$('.gen-finish-btn').show();
		} else {
			$('.gen-next-btn').show();
			$('.gen-finish-btn').hide();
		}
	}

	// FINISH BUTTON / AJAX CALL
	$('.gen-finish-btn').on('click', function() {
		// Prepare data
		var clientId   = $('#gen_client_id').val();
		var reportName = $('#gen_report_name').val();
		var reportType = $('#gen_report_type').val();
		var dateFrom   = $('#gen_date_from').val();
		var dateTo     = $('#gen_date_to').val();
		
		var sections = [];
		$('input[name="gen_sections[]"]:checked').each(function() {
			sections.push($(this).val());
		});

		var branding = {
			white_label: $('#gen_white_label').is(':checked') ? 1 : 0,
			agency_name: $('input[name="gen_agency_name"]').val(),
			show_logo: $('input[name="gen_show_logo"]').is(':checked') ? 1 : 0,
			agency_color: $('#gen_agency_color').val()
		};

		// Show Loader UI
		$('#form-generate-report').hide();
		$('#gen-footer-actions').hide();
		$('#gen-loading-state').show();

		// Loader text sequence
		var texts = [
			'Analyzing rank changes...',
			'Calculating technical health...',
			'Sending data to AI Provider...',
			'Writing executive summary...',
			'Compiling recommendations...',
			'Finalizing report...'
		];
		var i = 0;
		var timer = setInterval(function() {
			if(i < texts.length) {
				$('#gen-loading-text').fadeOut(200, function() {
					$(this).text(texts[i]).fadeIn(200);
					i++;
				});
			} else {
				clearInterval(timer);
			}
		}, 3000);

		// Execute AJAX Action
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_generate_report',
			nonce: seoCopilotAdmin.nonce,
			client_id: clientId,
			report_name: reportName,
			report_type: reportType,
			date_from: dateFrom,
			date_to: dateTo,
			sections: sections,
			branding: branding
		}, function(res) {
			clearInterval(timer);
			if(res.success) {
				$('#gen-loading-text').text('Report Generated Successfully!').css('color', '#008a20');
				// Open preview immediately
				var url = seoCopilotAdmin.adminUrl + 'admin.php?page=seo-copilot-reports&action=view&id=' + res.data.report_id;
				window.location.href = url; // Redirect to view
			} else {
				alert('Error: ' + res.data);
				closeModal();
			}
		}).fail(function() {
			clearInterval(timer);
			alert('AJAX request failed.');
			closeModal();
		});
	});

	// REPORT TABLE ACTIONS
	$('.btn-delete-report').on('click', function() {
		if(!confirm('Delete this report permanently?')) return;
		var btn = $(this);
		var id = btn.data('id');
		btn.text('...').prop('disabled', true);
		
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_delete_report',
			nonce: seoCopilotAdmin.nonce,
			report_id: id
		}, function(res) {
			if(res.success) {
				btn.closest('tr').fadeOut();
			} else {
				alert('Error deleting report');
				btn.text('Delete').prop('disabled', false);
			}
		});
	});

	$('.btn-send-report').on('click', function() {
		var btn = $(this);
		var email = btn.data('email');
		var promptMsg = prompt("Send report to email:", email);
		
		if(promptMsg) {
			btn.text('Sending...').prop('disabled', true);
			$.post(seoCopilotAdmin.ajaxUrl, {
				action: 'seo_copilot_send_report_email',
				nonce: seoCopilotAdmin.nonce,
				report_id: btn.data('id'),
				email: promptMsg
			}, function(res) {
				if(res.success) {
					btn.text('Sent!').css('color', '#008a20').prop('disabled', false);
				} else {
					alert('Error: ' + res.data);
					btn.text('Send Email').prop('disabled', false);
				}
			});
		}
	});

});
</script>
