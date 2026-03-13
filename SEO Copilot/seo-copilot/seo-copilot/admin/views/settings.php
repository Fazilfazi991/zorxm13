<?php
/**
 * Settings Page View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

// Get tier data
$settings_obj  = new SEO_Copilot_Settings();
$tier          = $settings_obj->get_license_tier();
$usage         = $settings_obj->get_usage_count();
$rate_limit    = $settings_obj->get_rate_limit();
$reset_date    = date( 'F 1, Y', strtotime( 'first day of next month' ) );

$tier_labels = [
	'free'   => 'FREE',
	'pro'    => 'PRO',
	'agency' => 'AGENCY',
];
$tier_colors = [
	'free'   => '#777',
	'pro'    => '#2271b1',
	'agency' => '#c8a000',
];

// Get Options for sidebar badges
$options            = get_option( SEO_Copilot_Settings::OPTION_NAME );
$is_claude_connected = ! empty( $options['claude_api_key'] );
$is_gemini_connected = ! empty( $options['gemini_api_key'] );
$is_gsc_connected   = ! empty( $options['gsc_property_url'] );
$active_provider    = isset( $options['ai_provider'] ) ? $options['ai_provider'] : 'claude';
?>

<div class="wrap seo-copilot-admin-wrap">
	<div class="seo-copilot-header">
		<h1>
			<span class="dashicons dashicons-chart-line"></span>
			<?php esc_html_e( 'SEO Copilot Settings', 'seo-copilot' ); ?>
			<span style="font-size:13px; font-weight:normal; padding:3px 10px; border-radius:20px; color:#fff; background:<?php echo esc_attr( $tier_colors[ $tier ] ?? '#777' ); ?>; margin-left: 10px; vertical-align: middle;">
				<?php echo esc_html( $tier_labels[ $tier ] ?? 'FREE' ); ?>
			</span>
		</h1>
		<p class="description"><?php esc_html_e( 'Configure your AI-powered SEO analysis tools and connect your data sources.', 'seo-copilot' ); ?></p>
	</div>

	<?php settings_errors( 'seo_copilot_messages' ); ?>
	<div id="seo-copilot-settings-saved-msg" style="display:none; color:#008a20; font-weight:bold; margin-bottom:10px;">
		&#10003; <?php esc_html_e( 'Settings saved', 'seo-copilot' ); ?>
	</div>

	<div class="seo-copilot-layout">
		<!-- Main Content Area -->
		<div class="seo-copilot-main">

			<!-- LICENSE SECTION -->
			<div class="seo-copilot-card" style="margin-bottom: 20px; border-left: 4px solid <?php echo esc_attr( $tier_colors[ $tier ] ?? '#777' ); ?>;" id="license">
				<h2 style="margin-top:0;"><?php esc_html_e( 'License & Plan', 'seo-copilot' ); ?></h2>
				<?php if ( 'free' === $tier ) : ?>
					<p>
						<strong><?php esc_html_e( "You are on the Free plan. Bring your own API keys below.", 'seo-copilot' ); ?></strong>
					</p>
					<a href="#" class="button button-primary">
						<?php esc_html_e( 'Upgrade to Pro &rarr;', 'seo-copilot' ); ?>
					</a>
				<?php else : ?>
					<p><span class="dashicons dashicons-yes-alt" style="color:#008a20;"></span> <strong><?php esc_html_e( 'AI Powered by SEO Copilot', 'seo-copilot' ); ?></strong></p>
					<p><?php printf( esc_html__( '%s AI calls/month included', 'seo-copilot' ), number_format_i18n( $rate_limit ) ); ?></p>
					<div style="background:#f0f0f1; border-radius:5px; height:10px; margin-bottom:8px;">
						<div style="background:<?php echo esc_attr( $tier_colors[ $tier ] ); ?>; width:<?php echo esc_attr( $rate_limit ? min( 100, round( ( $usage / $rate_limit ) * 100 ) ) : 0 ); ?>%; height:10px; border-radius:5px; transition:width 0.5s;"></div>
					</div>
					<p style="color:#555; font-size:13px;">
						<?php printf( esc_html__( '%1$s / %2$s calls used this month. Resets %3$s.', 'seo-copilot' ), $usage, number_format_i18n( $rate_limit ), $reset_date ); ?>
					</p>
				<?php endif; ?>
			</div>

			<form action="options.php" method="post" class="seo-copilot-form" id="seo-copilot-settings-form">
				<?php
				settings_fields( 'seo_copilot_option_group' );
				do_settings_sections( 'seo-copilot-settings-page' );
				?>
				<div style="display:flex; align-items:center; gap:15px; margin-top: 15px;">
					<?php submit_button( __( 'Save All Changes', 'seo-copilot' ), 'primary', 'submit', false ); ?>
					<span id="seo-settings-save-msg" style="display:none; color:#008a20; font-weight:bold;">&#10003; <?php esc_html_e( 'Saved!', 'seo-copilot' ); ?></span>
				</div>
			</form>

			<!-- FRONTEND BADGE AREA -->
			<?php $badge_settings = seo_copilot_frontend_badge()->get_badge_settings(); ?>
			<div class="seo-copilot-card sc-badge-settings-card" style="margin-top: 30px; border-left: 4px solid #10B981;">
				<h2 style="margin-top:0; color:#111827;">🛡️ <?php esc_html_e( 'Frontend SEO Badge', 'seo-copilot' ); ?></h2>
				<p class="description"><?php esc_html_e( 'Display a live SEO score badge on your site to build trust and show off your optimization efforts.', 'seo-copilot' ); ?></p>
				
				<div style="display: flex; gap: 30px; margin-top:20px;">
					<!-- Left: Controls -->
					<div style="flex: 1;">
						<table class="form-table">
							<tr>
								<th scope="row"><?php esc_html_e( 'Enable Badge', 'seo-copilot' ); ?></th>
								<td>
									<label class="seo-copilot-switch">
										<input type="checkbox" id="badge_enabled" <?php checked( $badge_settings['enabled'], 'yes' ); ?> value="yes" />
										<span class="seo-copilot-slider round"></span>
									</label>
								</td>
							</tr>
							<tbody id="badge_settings_wrap" style="<?php echo $badge_settings['enabled'] === 'yes' ? '' : 'display:none;'; ?>">
								<tr>
									<th scope="row"><?php esc_html_e( 'Badge Style', 'seo-copilot' ); ?></th>
									<td>
										<select id="badge_style" class="regular-text">
											<option value="pill" <?php selected( $badge_settings['style'], 'pill' ); ?>>Pill (Small)</option>
											<option value="card" <?php selected( $badge_settings['style'], 'card' ); ?>>Card (Detailed)</option>
											<option value="minimal" <?php selected( $badge_settings['style'], 'minimal' ); ?>>Minimal</option>
											<option value="icon-only" <?php selected( $badge_settings['style'], 'icon-only' ); ?>>Icon Only</option>
										</select>
									</td>
								</tr>
								<tr>
									<th scope="row"><?php esc_html_e( 'Position', 'seo-copilot' ); ?></th>
									<td>
										<select id="badge_position" class="regular-text">
											<option value="bottom-right" <?php selected( $badge_settings['position'], 'bottom-right' ); ?>>Bottom Right (Default)</option>
											<option value="bottom-left" <?php selected( $badge_settings['position'], 'bottom-left' ); ?>>Bottom Left</option>
											<option value="bottom-center" <?php selected( $badge_settings['position'], 'bottom-center' ); ?>>Bottom Center</option>
										</select>
									</td>
								</tr>
								<tr>
									<th scope="row"><?php esc_html_e( 'Custom Text', 'seo-copilot' ); ?></th>
									<td>
										<input type="text" id="badge_custom_text" class="regular-text" value="<?php echo esc_attr( $badge_settings['custom_text'] ); ?>" />
									</td>
								</tr>
								<tr>
									<th scope="row"><?php esc_html_e( 'Display Options', 'seo-copilot' ); ?></th>
									<td>
										<label style="display:block; margin-bottom:5px;">
											<input type="checkbox" id="badge_show_score" value="yes" <?php checked( $badge_settings['show_score'], 'yes' ); ?> /> Show Score
										</label>
										<label style="display:block;">
											<input type="checkbox" id="badge_show_on_mobile" value="yes" <?php checked( $badge_settings['show_on_mobile'], 'yes' ); ?> /> Show on Mobile
										</label>
									</td>
								</tr>
								<tr>
									<th scope="row"><?php esc_html_e( 'Display On', 'seo-copilot' ); ?></th>
									<td>
										<select id="badge_pages" class="regular-text">
											<option value="all" <?php selected( $badge_settings['pages'], 'all' ); ?>>All Pages</option>
											<option value="homepage" <?php selected( $badge_settings['pages'], 'homepage' ); ?>>Homepage Only</option>
											<option value="posts" <?php selected( $badge_settings['pages'], 'posts' ); ?>>Posts Only</option>
											<option value="pages" <?php selected( $badge_settings['pages'], 'pages' ); ?>>Pages Only</option>
										</select>
									</td>
								</tr>
								<tr>
									<th scope="row"><?php esc_html_e( 'Link To', 'seo-copilot' ); ?></th>
									<td>
										<select id="badge_link_to" class="regular-text">
											<option value="none" <?php selected( $badge_settings['link_to'], 'none' ); ?>>No Link</option>
											<option value="homepage" <?php selected( $badge_settings['link_to'], 'homepage' ); ?>>SEO Copilot Homepage</option>
											<option value="custom" <?php selected( $badge_settings['link_to'], 'custom' ); ?>>Custom URL</option>
										</select>
										<input type="url" id="badge_custom_url" class="regular-text" value="<?php echo esc_attr( $badge_settings['custom_url'] ); ?>" placeholder="https://..." style="margin-top:10px; width:100%; <?php echo $badge_settings['link_to'] === 'custom' ? '' : 'display:none;'; ?>" />
									</td>
								</tr>
							</tbody>
						</table>
						<button type="button" class="button button-primary" id="btn-save-badge-settings" style="margin-top:15px;"><?php esc_html_e( 'Save Badge Settings', 'seo-copilot' ); ?></button>
					</div>

					<!-- Right: Live Preview -->
					<div style="width: 300px; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative;">
						<div style="position:absolute; top:10px; left:10px; font-size:10px; font-weight:bold; color:#94a3b8; text-transform:uppercase;">Live Preview</div>
						<!-- Inline styles strictly to override fixed positioning for preview block -->
						<style>
							#badge-live-preview .seo-copilot-badge-wrap { position: static !important; transform: none !important; animation: none !important; }
						</style>
						<div id="badge-live-preview"></div>
					</div>
				</div>
			</div>

			<!-- DANGER ZONE -->
			<div class="seo-copilot-card" style="margin-top: 30px; border-left: 4px solid #d63638;">
				<h2 style="margin-top:0; color:#d63638;">⚠️ <?php esc_html_e( 'Danger Zone', 'seo-copilot' ); ?></h2>
				<table class="form-table">
					<tr>
						<th><?php esc_html_e( 'Reset All Data', 'seo-copilot' ); ?></th>
						<td>
							<button type="button" class="button" style="border-color:#d63638; color:#d63638;" id="btn-reset-data">
								<?php esc_html_e( 'Reset All Data', 'seo-copilot' ); ?>
							</button>
							<p class="description"><?php esc_html_e( 'Deletes all SEO scores, rank history, and analysis data. Does not deactivate the plugin.', 'seo-copilot' ); ?></p>
						</td>
					</tr>
					<tr>
						<th><?php esc_html_e( 'Clear AI Cache', 'seo-copilot' ); ?></th>
						<td>
							<button type="button" class="button button-secondary" id="btn-clear-cache">
								<?php esc_html_e( 'Clear AI Cache', 'seo-copilot' ); ?>
							</button>
							<span id="cache-clear-msg" style="margin-left:10px; color:#008a20; display:none;"></span>
							<p class="description"><?php esc_html_e( 'Removes all transients starting with seo_copilot_.', 'seo-copilot' ); ?></p>
						</td>
					</tr>
				</table>
			</div>

		</div>

		<!-- Sidebar Area -->
		<div class="seo-copilot-sidebar">
			<!-- Plan Card -->
			<div class="seo-copilot-box" style="border-top: 3px solid <?php echo esc_attr( $tier_colors[ $tier ] ?? '#777' ); ?>;">
				<h3 style="margin:0 0 10px;">
					<?php esc_html_e( 'Current Plan', 'seo-copilot' ); ?>
					<span style="float:right; padding:2px 8px; border-radius:12px; color:#fff; font-size:11px; background:<?php echo esc_attr( $tier_colors[ $tier ] ?? '#777' ); ?>;">
						<?php echo esc_html( strtoupper( $tier ) ); ?>
					</span>
				</h3>
				<?php if ( $rate_limit ) : ?>
					<div style="font-size:13px; color:#555;">
						<strong><?php echo esc_html( $usage ); ?></strong> / <?php echo esc_html( number_format_i18n( $rate_limit ) ); ?> <?php esc_html_e( 'AI Calls This Month', 'seo-copilot' ); ?>
						<div style="background:#f0f0f1; border-radius:5px; height:6px; margin: 8px 0;">
							<div style="background:<?php echo esc_attr( $tier_colors[ $tier ] ); ?>; width:<?php echo esc_attr( min( 100, round( ( $usage / $rate_limit ) * 100 ) ) ); ?>%; height:6px; border-radius:5px;"></div>
						</div>
						<small><?php printf( esc_html__( 'Resets on %s', 'seo-copilot' ), $reset_date ); ?></small>
					</div>
				<?php else : ?>
					<p style="font-size:13px; color:#555;"><?php esc_html_e( 'Using your own API key (BYOK). No call limits applied.', 'seo-copilot' ); ?></p>
				<?php endif; ?>
			</div>

			<!-- Connection Status Box -->
			<div class="seo-copilot-box">
				<h3><?php esc_html_e( 'Connection Status', 'seo-copilot' ); ?></h3>
				<ul class="seo-copilot-status-list">
					<li>
						<span class="status-name">
							<?php esc_html_e( 'Claude AI', 'seo-copilot' ); ?>
							<?php if ( 'claude' === $active_provider ) echo '<span class="description" style="font-size: 10px; margin-left: 4px;">(Active)</span>'; ?>
						</span>
						<?php if ( $is_claude_connected ) : ?>
							<span class="status-badge connected"><span class="dashicons dashicons-yes"></span> <?php esc_html_e( 'Connected', 'seo-copilot' ); ?></span>
						<?php else : ?>
							<span class="status-badge disconnected"><span class="dashicons dashicons-warning"></span> <?php esc_html_e( 'Not Connected', 'seo-copilot' ); ?></span>
						<?php endif; ?>
					</li>
					<li>
						<span class="status-name">
							<?php esc_html_e( 'Google Gemini', 'seo-copilot' ); ?>
							<?php if ( 'gemini' === $active_provider ) echo '<span class="description" style="font-size: 10px; margin-left: 4px;">(Active)</span>'; ?>
						</span>
						<?php if ( $is_gemini_connected ) : ?>
							<span class="status-badge connected"><span class="dashicons dashicons-yes"></span> <?php esc_html_e( 'Connected', 'seo-copilot' ); ?></span>
						<?php else : ?>
							<span class="status-badge disconnected"><span class="dashicons dashicons-warning"></span> <?php esc_html_e( 'Not Connected', 'seo-copilot' ); ?></span>
						<?php endif; ?>
					</li>
					<li>
						<span class="status-name"><?php esc_html_e( 'GSC Property', 'seo-copilot' ); ?></span>
						<?php if ( $is_gsc_connected ) : ?>
							<span class="status-badge connected"><span class="dashicons dashicons-yes"></span> <?php esc_html_e( 'Connected', 'seo-copilot' ); ?></span>
						<?php else : ?>
							<span class="status-badge disconnected"><span class="dashicons dashicons-warning"></span> <?php esc_html_e( 'Not Connected', 'seo-copilot' ); ?></span>
						<?php endif; ?>
					</li>
				</ul>
			</div>

			<!-- Plugin Info Box -->
			<div class="seo-copilot-box">
				<h3><?php esc_html_e( 'Plugin Information', 'seo-copilot' ); ?></h3>
				<ul class="seo-copilot-info-list">
					<li><strong><?php esc_html_e( 'Version:', 'seo-copilot' ); ?></strong> <?php echo esc_html( SEO_COPILOT_VERSION ); ?></li>
					<li><strong><?php esc_html_e( 'Author:', 'seo-copilot' ); ?></strong> SEO Copilot Team</li>
				</ul>
				<hr>
				<h4><?php esc_html_e( 'Quick Links', 'seo-copilot' ); ?></h4>
				<ul class="seo-copilot-links">
					<li><a href="#"><span class="dashicons dashicons-book"></span> <?php esc_html_e( 'Documentation', 'seo-copilot' ); ?></a></li>
					<li><a href="#"><span class="dashicons dashicons-sos"></span> <?php esc_html_e( 'Support Forum', 'seo-copilot' ); ?></a></li>
					<li><a href="#"><span class="dashicons dashicons-star-filled"></span> <?php esc_html_e( 'Leave a Review', 'seo-copilot' ); ?></a></li>
				</ul>
			</div>
		</div>
	</div>
</div>

<!-- Reset Confirmation Modal -->
<div id="seo-copilot-reset-modal" style="display:none; position:fixed; z-index:99999; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5);">
	<div style="background:#fff; max-width:450px; margin:15% auto; padding:25px; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
		<h2 style="margin-top:0; color:#d63638;">⚠️ <?php esc_html_e( 'Are you sure?', 'seo-copilot' ); ?></h2>
		<p><?php esc_html_e( 'This will delete all SEO scores, rank history, and analysis data. This action cannot be undone.', 'seo-copilot' ); ?></p>
		<div style="display:flex; gap:10px; margin-top:20px;">
			<button type="button" class="button button-primary" id="btn-confirm-reset" style="background:#d63638; border-color:#d63638;"><?php esc_html_e( 'Yes, Reset Everything', 'seo-copilot' ); ?></button>
			<button type="button" class="button" id="btn-cancel-reset"><?php esc_html_e( 'Cancel', 'seo-copilot' ); ?></button>
		</div>
	</div>
</div>

<script>
jQuery(document).ready(function($) {

	// Provider field toggle
	function toggleProviderFields() {
		var provider = $('#ai_provider').val();
		if ( provider === 'gemini' ) {
			$('#claude_api_key').closest('tr').hide();
			$('#claude_model').closest('tr').hide();
			$('#gemini_api_key').closest('tr').show();
			$('#gemini_model').closest('tr').show();
		} else {
			$('#gemini_api_key').closest('tr').hide();
			$('#gemini_model').closest('tr').hide();
			$('#claude_api_key').closest('tr').show();
			$('#claude_model').closest('tr').show();
		}
	}
	$('#ai_provider').on('change', toggleProviderFields);
	toggleProviderFields();

	// Live slider label
	$('#content_decay_threshold').on('input', function() {
		$('#threshold_output').text($(this).val());
	});

	// Danger Zone — Reset Data
	$('#btn-reset-data').on('click', function() {
		$('#seo-copilot-reset-modal').show();
	});
	$('#btn-cancel-reset').on('click', function() {
		$('#seo-copilot-reset-modal').hide();
	});
	$('#btn-confirm-reset').on('click', function() {
		var $btn = $(this);
		$btn.prop('disabled', true).text('<?php esc_js( 'Resetting...' ); ?>');
		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: { action: 'seo_copilot_reset_data', nonce: seoCopilotAdmin.nonce },
			success: function(res) {
				$('#seo-copilot-reset-modal').hide();
				if (res.success) {
					alert(res.data.message);
					location.reload();
				} else {
					alert('Error: ' + res.data);
					$btn.prop('disabled', false).text('<?php esc_js( 'Yes, Reset Everything' ); ?>');
				}
			}
		});
	});

	// Danger Zone — Clear Cache
	$('#btn-clear-cache').on('click', function() {
		var $btn = $(this);
		$btn.prop('disabled', true).text('Clearing...');
		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: { action: 'seo_copilot_clear_cache', nonce: seoCopilotAdmin.nonce },
			success: function(res) {
				$btn.prop('disabled', false).text('Clear AI Cache');
				if (res.success) {
					$('#cache-clear-msg').text(res.data.message).show().delay(4000).fadeOut();
				}
			}
		});
	});

	// Frontend Badge Logic
	function updateBadgePreview() {
		var style = $('#badge_style').val();
		var text = $('#badge_custom_text').val() || 'SEO Score';
		var showScore = $('#badge_show_score').is(':checked');
		var html = '';
		var score = 94; // Dummy high score for preview

		if ( style === 'pill' ) {
			html += '<div class="seo-copilot-badge-wrap">';
			html += '<a class="sc-badge-pill score-high" style="position:relative;">';
			html += '<span class="sc-badge-dot"></span>';
			html += '<span>' + text + (showScore ? ': ' + score : '') + '</span>';
			html += '</a></div>';
		} else if ( style === 'card' ) {
			html += '<div class="seo-copilot-badge-wrap">';
			html += '<a class="sc-badge-card score-high" style="position:relative;">';
			html += '<div class="sc-badge-label">' + text + '</div>';
			html += '<div class="sc-badge-score">';
			if (showScore) {
				html += score + '<span style="font-size:12px;color:#6B7280">/100</span>';
			} else {
				html += 'VERIFIED<span style="font-size:12px;color:#6B7280"> SITE</span>';
			}
			html += '</div>';
			if (showScore) {
				html += '<div class="sc-badge-bar"><div class="sc-badge-bar-fill" style="width:' + score + '%; background:#10B981;"></div></div>';
			}
			html += '<div class="sc-badge-powered">Powered by SEO Copilot</div>';
			html += '</a></div>';
		} else if ( style === 'minimal' ) {
			html += '<div class="seo-copilot-badge-wrap">';
			html += '<a class="sc-badge-minimal score-high" style="position:relative;">';
			if (showScore) {
				html += '<span style="color:#10B981;">●</span><span>' + score + '</span>';
			} else {
				html += '<span>' + text + '</span>';
			}
			html += '</a></div>';
		} else if ( style === 'icon-only' ) {
			var circumference = 126;
			var offset = circumference - (score / 100 * circumference);
			html += '<div class="seo-copilot-badge-wrap">';
			html += '<a class="sc-badge-icon score-high" style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:white; font-size:18px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 1px solid #e5e7eb;">';
			if (showScore) {
				html += '<svg viewBox="0 0 46 46" style="position:absolute; top:-4px; left:-4px; width:46px; height:46px; transform:rotate(-90deg);"><circle fill="none" class="ring-bg" stroke="transparent" stroke-width="3" cx="23" cy="23" r="20"/><circle fill="none" class="ring-fill" stroke="#10B981" stroke-width="3" stroke-dasharray="126" stroke-dashoffset="' + offset + '" cx="23" cy="23" r="20"/></svg>';
			}
			html += '🚀</a></div>';
		}

		$('#badge-live-preview').html(html);
	}

	$('#badge_enabled').on('change', function() {
		if ($(this).is(':checked')) {
			$('#badge_settings_wrap').slideDown();
		} else {
			$('#badge_settings_wrap').slideUp();
		}
	});

	$('#badge_link_to').on('change', function() {
		if ($(this).val() === 'custom') {
			$('#badge_custom_url').show();
		} else {
			$('#badge_custom_url').hide();
		}
	});

	$('#badge_style, #badge_custom_text, #badge_show_score, #badge_position').on('change keyup', updateBadgePreview);
	updateBadgePreview();

	$('#btn-save-badge-settings').on('click', function() {
		var $btn = $(this);
		$btn.prop('disabled', true).text('Saving...');
		var settings = {
			enabled: $('#badge_enabled').is(':checked') ? 'yes' : 'no',
			position: $('#badge_position').val(),
			style: $('#badge_style').val(),
			show_score: $('#badge_show_score').is(':checked') ? 'yes' : 'no',
			show_on_mobile: $('#badge_show_on_mobile').is(':checked') ? 'yes' : 'no',
			custom_text: $('#badge_custom_text').val(),
			link_to: $('#badge_link_to').val(),
			custom_url: $('#badge_custom_url').val(),
			pages: $('#badge_pages').val()
		};
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_save_badge_settings',
			nonce: seoCopilotAdmin.nonce,
			settings: settings
		}, function(res) {
			$btn.prop('disabled', false).text('Save Badge Settings');
			if (res.success) {
				$btn.text('Saved!').css('background', '#10B981').css('border-color', '#059669');
				setTimeout(function() {
					$btn.text('Save Badge Settings').css('background', '').css('border-color', '');
				}, 2000);
			} else {
				alert('Error: ' + res.data);
			}
		});
	});

});
</script>
