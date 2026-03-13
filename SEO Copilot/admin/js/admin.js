/**
 * Admin Javascript for SEO Copilot
 */
jQuery(document).ready(function ($) {

	// =============================================
	// GLOBAL: Rate Limit Error Banner
	// =============================================
	function seoCopilotHandleResponse(res) {
		if (!res.success && res.data && res.data.error_type === 'rate_limit') {
			// Check if we already dismissed this this session
			if (!sessionStorage.getItem('seo_copilot_rate_limit_dismissed')) {
				var upgradeUrl = res.data.upgrade_url || '#';
				var $banner = $('<div id="seo-copilot-rate-banner" style="background:#ff6f00; color:#fff; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:32px; z-index:9999; font-size:14px; border-radius:4px; margin-bottom:15px;">' +
					'<span>⚡ ' + (res.data.message || 'You\'ve used all your AI calls this month.') + ' <a href="' + upgradeUrl + '" style="color:#fff; font-weight:bold; text-decoration:underline; margin-left:8px;">Upgrade Now &rarr;</a></span>' +
					'<button type="button" id="dismiss-rate-banner" style="background:none; border:none; color:#fff; cursor:pointer; font-size:18px;">&times;</button>' +
					'</div>');
				$('.seo-copilot-admin-wrap, .seo-copilot-wrap, .wrap').first().prepend($banner);
				$('#dismiss-rate-banner').on('click', function () {
					$('#seo-copilot-rate-banner').slideUp();
					sessionStorage.setItem('seo_copilot_rate_limit_dismissed', '1');
				});
			}
			return true; // Was a rate limit error
		}
		return false;
	}
	// Make globally accessible
	window.seoCopilotHandleResponse = seoCopilotHandleResponse;

	// =============================================
	// SETTINGS: Test Connection Button Handler
	// =============================================
	$('#seo-copilot-test-api').on('click', function (e) {
		e.preventDefault();

		var $btn = $(this);
		var $result = $('#seo-copilot-test-result');

		$btn.prop('disabled', true).text('Testing...');
		$result.html('<span class="spinner is-active" style="float:none; margin:0 5px;"></span>').css('color', '');

		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_test_connection',
				nonce: seoCopilotAdmin.nonce
			},
			success: function (response) {
				if (response.success) {
					$result.css('color', '#008a20').html('<span class="dashicons dashicons-yes-alt"></span> ' + response.data.message);
				} else {
					$result.css('color', '#d63638').html('<span class="dashicons dashicons-warning"></span> ' + response.data.message);
				}
			},
			error: function () {
				$result.css('color', '#d63638').html('<span class="dashicons dashicons-warning"></span> Connection failed. Server error.');
			},
			complete: function () {
				$btn.prop('disabled', false).text('Test Connection');
			}
		});
	});

	// =============================================
	// DASHBOARD
	// =============================================
	if ( ! $('.seo-copilot-dashboard-wrap').length ) {
		return;
	}

	// 1. Run Full Audit CTA
	$('#btn-run-audit').on('click', function (e) {
		e.preventDefault();

		var $btn = $(this);
		$btn.addClass('loading').prop('disabled', true);
		$('#audit-progress-bar').slideDown(200);

		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: 'seo_copilot_run_audit',
				nonce: seoCopilotAdmin.nonce
			},
			success: function (res) {
				setTimeout(function () {
					$btn.removeClass('loading').prop('disabled', false);
					$('#audit-progress-bar').slideUp(200);
					if (res.success) {
						location.reload();
					} else {
						if (window.seoCopilotHandleResponse) seoCopilotHandleResponse(res);
						else alert('Audit failed to run.');
					}
				}, 1500);
			},
			error: function () {
				$btn.removeClass('loading').prop('disabled', false);
				$('#audit-progress-bar').slideUp(200);
				alert('Server error.');
			}
		});
	});

	// 2. Batch Analysis & Meta (Simulated background progress)
	$('.action-card .seo-copilot-btn').not('[type=submit]').on('click', function (e) {
		e.preventDefault();
		var $btn = $(this);
		var actionType = $btn.data('action'); // "analyze" or "meta"
		var $card = $btn.closest('.action-card');
		var $progress = $card.find('.action-progress');
		var $fill = $progress.find('.fill');
		var $text = $progress.find('.progress-text');

		$btn.hide();
		$progress.slideDown(200);

		var wpAction = actionType === 'analyze' ? 'seo_copilot_batch_analyze' : 'seo_copilot_batch_meta';

		$.ajax({
			url: seoCopilotAdmin.ajaxUrl,
			type: 'POST',
			data: {
				action: wpAction,
				nonce: seoCopilotAdmin.nonce
			},
			success: function (res) {
				if (res.success) {
					var pct = 0;
					var interval = setInterval(function () {
						pct += 10;
						if (pct > 100) pct = 100;
						$fill.css('width', pct + '%');
						$text.text( (actionType === 'analyze' ? 'Analyzing... ' : 'Generating... ') + pct + '%');
						if (pct >= 100) {
							clearInterval(interval);
							$progress.slideUp();
							$btn.text('Completed ✓').show();
							setTimeout(function () { location.reload(); }, 1000);
						}
					}, 400);
				} else {
					$progress.slideUp();
					$btn.show();
					if (window.seoCopilotHandleResponse) seoCopilotHandleResponse(res);
					else alert('Failed to start batch process.');
				}
			},
			error: function () {
				$progress.slideUp();
				$btn.show();
				alert('Server error.');
			}
		});
	});

});