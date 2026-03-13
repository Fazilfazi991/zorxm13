<?php
/**
 * Rank Tracker View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

$tracker = new SEO_Copilot_Rank_Tracker();

// Safe: check credentials BEFORE creating API obj and making calls
$email = get_option( 'seo_copilot_settings', [] );
$dfs_email = isset( $email['dataforseo_email'] ) ? $email['dataforseo_email'] : '';
$is_configured = ! empty( $dfs_email );

$is_connected = false;
$balance      = '?';
$summary      = [];
$data         = [];
$countries    = $tracker->get_country_list();

if ( $is_configured && class_exists( 'SEO_Copilot_DataForSEO_API' ) ) {
	try {
		$dfs          = new SEO_Copilot_DataForSEO_API();
		$is_connected = $dfs->is_connected();
		if ( $is_connected ) {
			$b       = $dfs->get_account_balance();
			$balance = is_numeric( $b ) ? number_format( $b, 4 ) : '?';
		}
	} catch ( \Exception $e ) {
		$is_connected = false;
	}
}

if ( $is_connected ) {
	try {
		$summary = $tracker->get_site_ranking_summary();
		$data    = $tracker->get_tracking_dashboard_data();
	} catch ( \Exception $e ) {
		$summary = [];
		$data    = [];
	}
}

// Helper for SVG sparkline (last 7 data points approx)
if ( ! function_exists( 'seo_copilot_render_rank_sparkline' ) ) {
function seo_copilot_render_rank_sparkline( $points ) {
	if ( empty( $points ) || count( $points ) < 2 ) {
		return '<span style="font-size:10px;color:#6B7280;">No data</span>';
	}
	$points  = array_slice( $points, -7 );
	$count   = count( $points );
	$max_x   = 60;
	$max_y   = 20;
	$step_x  = $max_x / ( $count - 1 );
	$path_d  = '';
	for ( $i = 0; $i < $count; $i++ ) {
		$x   = $i * $step_x;
		$val = $points[ $i ];
		if ( $val > 100 ) $val = 100;
		$y   = ( ( $val - 1 ) / 99 ) * $max_y;
		if ( $i === 0 ) {
			$path_d .= "M {$x} {$y}";
		} else {
			$path_d .= " L {$x} {$y}";
		}
	}
	$stroke = '#9CA3AF';
	if ( end( $points ) < reset( $points ) ) $stroke = '#10B981';
	elseif ( end( $points ) > reset( $points ) ) $stroke = '#EF4444';
	return '<svg width="60" height="20" class="sparkline"><path d="' . $path_d . '" fill="none" stroke="' . $stroke . '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
}

if ( ! function_exists( 'get_position_class' ) ) {
function get_position_class( $pos ) {
	if ( ! $pos || $pos > 100 ) return 'sc-badge sc-badge-grey';
	if ( $pos <= 3  ) return 'sc-badge sc-badge-warning';
	if ( $pos <= 10 ) return 'sc-badge sc-badge-success';
	if ( $pos <= 20 ) return 'sc-badge sc-badge-primary';
	if ( $pos <= 50 ) return 'sc-badge sc-badge-warning';
	return 'sc-badge sc-badge-danger';
}
}

if ( ! function_exists( 'get_change_html' ) ) {
function get_change_html( $current, $prev ) {
	if ( ! $prev ) return '<span style="font-size:11px;color:#9CA3AF;">New</span>';
	if ( $current > 100 && $prev > 100 ) return '<span style="color:#9CA3AF;">—</span>';
	if ( $current > 100 && $prev <= 100 ) return '<span style="color:#EF4444;font-weight:700;">↓ Out</span>';
	if ( $current <= 100 && $prev > 100 ) return '<span style="color:#10B981;font-weight:700;">↑ In</span>';
	$diff = $prev - $current;
	if ( $diff > 0 ) return '<span style="color:#10B981;font-weight:700;">↑ ' . $diff . '</span>';
	if ( $diff < 0 ) return '<span style="color:#EF4444;font-weight:700;">↓ ' . abs( $diff ) . '</span>';
	return '<span style="color:#9CA3AF;">—</span>';
}
}
?>

<div class="wrap seo-copilot-page">

	<!-- Page Header -->
	<div class="sc-page-header">
		<div class="sc-page-header-left">
			<div class="sc-page-icon">📈</div>
			<div>
				<h1 class="sc-page-title"><?php esc_html_e( 'Rank Tracker', 'seo-copilot' ); ?></h1>
				<p class="sc-page-subtitle">
					<?php if ( $is_connected ) : ?>
						<span style="color:var(--sc-success);font-weight:600;">✓ <?php esc_html_e( 'Connected', 'seo-copilot' ); ?></span>
						&nbsp;·&nbsp; <?php esc_html_e( 'Balance:', 'seo-copilot' ); ?> <strong>$<?php echo esc_html( $balance ); ?></strong>
					<?php else : ?>
						<?php esc_html_e( 'Track your keyword positions across 24 countries, updated daily', 'seo-copilot' ); ?>
					<?php endif; ?>
				</p>
			</div>
		</div>
		<div class="sc-page-header-right">
			<button class="sc-btn sc-btn-primary" id="btn-check-all-ranks" <?php disabled( ! $is_connected ); ?>>
				<span class="dashicons dashicons-update"></span>
				<?php esc_html_e( 'Check All Ranks Now', 'seo-copilot' ); ?>
			</button>
		</div>
	</div>

	<?php if ( ! $is_configured || ! $is_connected ) : ?>
		<!-- Not Configured State -->
		<div class="sc-not-configured">
			<span class="sc-nc-icon">🔑</span>
			<h3><?php esc_html_e( 'Rank Tracker Not Configured', 'seo-copilot' ); ?></h3>
			<p><?php esc_html_e( 'Connect DataForSEO to start tracking your keyword rankings across 24 countries. Rankings are checked automatically every day at 3 AM.', 'seo-copilot' ); ?></p>
			<div class="sc-nc-actions">
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=seo-copilot-settings#dataforseo' ) ); ?>" class="sc-btn sc-btn-primary">
					<span class="dashicons dashicons-admin-network"></span>
					<?php esc_html_e( 'Configure DataForSEO →', 'seo-copilot' ); ?>
				</a>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=seo-copilot-settings#gsc' ) ); ?>" class="sc-btn sc-btn-outline">
					<span class="dashicons dashicons-google"></span>
					<?php esc_html_e( 'Configure GSC →', 'seo-copilot' ); ?>
				</a>
			</div>
		</div>
	<?php else : ?>

		<!-- Tip Box -->
		<div class="sc-tip-box">
			<span class="sc-tip-icon">💡</span>
			<div class="sc-tip-text">
				<strong><?php esc_html_e( 'Tip', 'seo-copilot' ); ?></strong>
				<?php esc_html_e( 'Add your focus keywords for each post and select your target countries. Rankings are checked automatically every day at 3 AM.', 'seo-copilot' ); ?>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="sc-stats-grid">
			<div class="sc-stat-card">
				<div class="sc-stat-label"><?php esc_html_e( 'Tracked Keywords', 'seo-copilot' ); ?></div>
				<div class="sc-stat-value"><?php echo number_format_i18n( $summary['total'] ?? 0 ); ?></div>
			</div>
			<div class="sc-stat-card sc-card-success">
				<div class="sc-stat-label"><?php esc_html_e( 'Avg Position', 'seo-copilot' ); ?></div>
				<div class="sc-stat-value"><?php echo esc_html( $summary['avg'] ?? 0 ); ?></div>
			</div>
			<div class="sc-stat-card sc-card-warning">
				<div class="sc-stat-label"><?php esc_html_e( 'Top 3 Rankings', 'seo-copilot' ); ?></div>
				<div class="sc-stat-value"><?php echo esc_html( $summary['top_3'] ?? 0 ); ?></div>
			</div>
			<div class="sc-stat-card sc-card-success">
				<div class="sc-stat-label"><?php esc_html_e( 'Top 10 Rankings', 'seo-copilot' ); ?></div>
				<div class="sc-stat-value"><?php echo esc_html( $summary['top_10'] ?? 0 ); ?></div>
			</div>
		</div>

		<!-- Main Layout Grid -->
		<div style="display: grid; grid-template-columns: 3fr 1fr; gap: 24px; align-items: start;">

			<!-- LEFT: Keywords Table -->
			<div class="sc-card" style="margin-bottom:0;">
				<div class="sc-card-header">
					<h3><?php esc_html_e( 'All Tracked Keywords', 'seo-copilot' ); ?></h3>
					<button type="button" class="sc-btn sc-btn-outline sc-btn-sm" id="btn-toggle-add-panel">
						<span class="dashicons dashicons-plus"></span> <?php esc_html_e( 'Add Keywords', 'seo-copilot' ); ?>
					</button>
				</div>

				<!-- Add Keywords Panel (Hidden by default) -->
				<div class="add-keywords-panel" id="add-keywords-panel" style="display:none; padding:20px; background:var(--sc-light); border-bottom:1px solid var(--sc-border);">
					<div style="display:flex; gap:16px; margin-bottom:12px;">
						<div style="flex:1;">
							<label style="display:block;font-size:13px;font-weight:600;margin-bottom:5px;color:var(--sc-dark);"><?php esc_html_e( 'Select Post', 'seo-copilot' ); ?></label>
							<select id="add-post-id" style="width:100%;padding:7px 12px;border:1px solid var(--sc-border);border-radius:6px;font-size:13px;">
								<option value=""></option>
								<?php
								$all_posts = get_posts( [ 'post_type' => [ 'post', 'page' ], 'numberposts' => -1, 'post_status' => 'publish' ] );
								foreach ( $all_posts as $p ) {
									echo '<option value="' . esc_attr( $p->ID ) . '">' . esc_html( $p->post_title ) . '</option>';
								}
								?>
							</select>
						</div>
						<div style="align-self:flex-end;">
							<button type="button" class="sc-btn sc-btn-outline sc-btn-sm" id="btn-auto-discover-kws">
								<span class="dashicons dashicons-google"></span> <?php esc_html_e( 'Discover from GSC', 'seo-copilot' ); ?>
							</button>
						</div>
					</div>

					<div style="margin-bottom:12px;">
						<label style="display:block;font-size:13px;font-weight:600;margin-bottom:5px;color:var(--sc-dark);"><?php esc_html_e( 'Keywords (comma separated)', 'seo-copilot' ); ?></label>
						<textarea id="add-keywords-list" class="sc-form-control" placeholder="ex: best running shoes, marathon training" style="height:60px;"></textarea>
					</div>

					<div style="display:flex; gap:16px; margin-bottom:16px;">
						<div style="flex:1;">
							<label style="display:block;font-size:13px;font-weight:600;margin-bottom:5px;color:var(--sc-dark);"><?php esc_html_e( 'Country', 'seo-copilot' ); ?></label>
							<select id="add-country-code" style="width:100%;padding:7px 12px;border:1px solid var(--sc-border);border-radius:6px;font-size:13px;">
								<?php foreach ( $countries as $code => $name ) : ?>
									<option value="<?php echo esc_attr( $code ); ?>"><?php echo esc_html( $name ); ?></option>
								<?php endforeach; ?>
							</select>
						</div>
						<div style="flex:1;">
							<label style="display:block;font-size:13px;font-weight:600;margin-bottom:5px;color:var(--sc-dark);"><?php esc_html_e( 'Device', 'seo-copilot' ); ?></label>
							<select id="add-device" style="width:100%;padding:7px 12px;border:1px solid var(--sc-border);border-radius:6px;font-size:13px;">
								<option value="desktop">Desktop</option>
								<option value="mobile">Mobile</option>
							</select>
						</div>
					</div>

					<button type="button" class="sc-btn sc-btn-primary" id="btn-submit-keywords">
						<span class="dashicons dashicons-plus-alt2"></span> <?php esc_html_e( 'Start Tracking', 'seo-copilot' ); ?>
					</button>
					<span class="spinner" id="add-kw-spinner" style="float:none; margin-top:2px;"></span>
				</div>

				<div class="sc-card-body" style="padding:0;">
					<table class="sc-table">
						<thead>
							<tr>
								<th width="35%"><?php esc_html_e( 'Keyword / Post', 'seo-copilot' ); ?></th>
								<th width="12%" style="text-align:center;"><?php esc_html_e( 'Position', 'seo-copilot' ); ?></th>
								<th width="10%" style="text-align:center;"><?php esc_html_e( 'Change', 'seo-copilot' ); ?></th>
								<th width="13%" style="text-align:right;"><?php esc_html_e( 'Volume', 'seo-copilot' ); ?></th>
								<th width="10%" style="text-align:center;"><?php esc_html_e( 'Loc', 'seo-copilot' ); ?></th>
								<th width="20%" style="text-align:right;"><?php esc_html_e( 'Actions', 'seo-copilot' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php if ( empty( $data ) ) : ?>
								<tr>
									<td colspan="6">
										<div class="sc-empty-state">
											<span class="sc-empty-icon">🎯</span>
											<h4><?php esc_html_e( 'No keywords tracked yet', 'seo-copilot' ); ?></h4>
											<p><?php esc_html_e( 'Click "Add Keywords" above to start tracking positions.', 'seo-copilot' ); ?></p>
										</div>
									</td>
								</tr>
							<?php else : ?>
								<?php foreach ( $data as $row ) :
									$pos         = $row->current_position ? intval( $row->current_position ) : 101;
									$display_pos = $pos > 100 ? '—' : $pos;
									$trend_raw   = $tracker->get_keyword_trend( $row->id, 30 );
									$trend_pts   = array_column( $trend_raw, 'position' );
									$flags = [ 'US'=>'🇺🇸','GB'=>'🇬🇧','CA'=>'🇨🇦','AU'=>'🇦🇺','IN'=>'🇮🇳','DE'=>'🇩🇪','FR'=>'🇫🇷','ES'=>'🇪🇸','IT'=>'🇮🇹','BR'=>'🇧🇷','MX'=>'🇲🇽','NL'=>'🇳🇱','SE'=>'🇸🇪','NO'=>'🇳🇴','DK'=>'🇩🇰','FI'=>'🇫🇮','PL'=>'🇵🇱','JP'=>'🇯🇵','KR'=>'🇰🇷','AE'=>'🇦🇪','SA'=>'🇸🇦','SG'=>'🇸🇬','ZA'=>'🇿🇦','NG'=>'🇳🇬','EG'=>'🇪🇬','PK'=>'🇵🇰','BD'=>'🇧🇩','PH'=>'🇵🇭','ID'=>'🇮🇩','MY'=>'🇲🇾','TH'=>'🇹🇭','VN'=>'🇻🇳','AR'=>'🇦🇷','CO'=>'🇨🇴','CL'=>'🇨🇱','PE'=>'🇵🇪','PT'=>'🇵🇹','BE'=>'🇧🇪','CH'=>'🇨🇭','AT'=>'🇦🇹','IE'=>'🇮🇪','NZ'=>'🇳🇿','HK'=>'🇭🇰','TW'=>'🇹🇼','RU'=>'🇷🇺','UA'=>'🇺🇦','TR'=>'🇹🇷','IL'=>'🇮🇱','GR'=>'🇬🇷','CZ'=>'🇨🇿','HU'=>'🇭🇺','RO'=>'🇷🇴' ];
								?>
									<tr id="kw-row-<?php echo esc_attr( $row->id ); ?>">
										<td>
											<div style="font-weight:700;font-size:13px;"><?php echo esc_html( $row->keyword ); ?></div>
											<div style="margin-top:2px;"><a href="<?php echo esc_url( get_edit_post_link( $row->post_id ) ); ?>" target="_blank" style="color:var(--sc-grey);font-size:11px;"><?php echo esc_html( $row->post_title ); ?></a></div>
										</td>
										<td style="text-align:center;">
											<span class="<?php echo esc_attr( get_position_class( $pos ) ); ?>"><?php echo esc_html( $display_pos ); ?></span>
											<div style="margin-top:4px;"><?php echo seo_copilot_render_rank_sparkline( $trend_pts ); ?></div>
										</td>
										<td style="text-align:center;"><?php echo get_change_html( $pos, $row->previous_position ); ?></td>
										<td style="text-align:right;">
											<strong><?php echo number_format_i18n( $row->search_volume ); ?></strong>
											<div style="width:100%;height:4px;background:var(--sc-border);border-radius:2px;margin-top:4px;overflow:hidden;">
												<div style="width:<?php echo min( 100, ( $row->search_volume / 10000 ) * 100 ); ?>%;height:100%;background:var(--sc-primary);opacity:0.5;"></div>
											</div>
										</td>
										<td style="text-align:center;font-size:16px;" title="<?php echo esc_attr( $row->country_code ); ?> / <?php echo esc_attr( $row->device ); ?>">
											<?php echo isset( $flags[ $row->country_code ] ) ? $flags[ $row->country_code ] : esc_html( $row->country_code ); ?>
											<span class="dashicons <?php echo $row->device === 'desktop' ? 'dashicons-desktop' : 'dashicons-smartphone'; ?>" style="font-size:12px;width:12px;height:12px;color:var(--sc-grey);margin-left:4px;"></span>
										</td>
										<td style="text-align:right;">
											<div style="display:flex;justify-content:flex-end;gap:6px;">
												<a href="https://google.com/search?q=<?php echo urlencode( $row->keyword ); ?>" target="_blank" class="sc-btn sc-btn-outline sc-btn-sm" title="Live SERP"><span class="dashicons dashicons-external" style="margin:0;"></span></a>
												<button type="button" class="sc-btn sc-btn-danger sc-btn-sm btn-remove-kw" data-id="<?php echo esc_attr( $row->id ); ?>" title="Remove"><span class="dashicons dashicons-trash" style="margin:0;"></span></button>
											</div>
										</td>
									</tr>
								<?php endforeach; ?>
							<?php endif; ?>
						</tbody>
					</table>
				</div>
			</div>

			<!-- RIGHT: Sidebar -->
			<div>
				<div class="sc-card">
					<div class="sc-card-header"><h3><?php esc_html_e( 'Biggest Movers (Weekly)', 'seo-copilot' ); ?></h3></div>
					<div class="sc-card-body">
						<div style="margin-bottom:20px;">
							<h4 style="color:var(--sc-success);margin:0 0 10px;font-size:13px;"><span class="dashicons dashicons-arrow-up-alt"></span> <?php esc_html_e( 'Top Climbers', 'seo-copilot' ); ?></h4>
							<ul style="margin:0;padding:0;list-style:none;font-size:12px;color:var(--sc-grey);">
								<li style="padding:6px 0;border-bottom:1px solid var(--sc-border);"><?php esc_html_e( 'Add keywords to track movers', 'seo-copilot' ); ?></li>
							</ul>
						</div>
						<div>
							<h4 style="color:var(--sc-danger);margin:0 0 10px;font-size:13px;"><span class="dashicons dashicons-arrow-down-alt"></span> <?php esc_html_e( 'Top Drops', 'seo-copilot' ); ?></h4>
							<ul style="margin:0;padding:0;list-style:none;font-size:12px;color:var(--sc-grey);">
								<li style="padding:6px 0;"><?php esc_html_e( 'No drops detected', 'seo-copilot' ); ?></li>
							</ul>
						</div>
					</div>
				</div>
			</div>

		</div>
	<?php endif; ?>

	<input type="hidden" id="seo_copilot_admin_nonce" value="<?php echo wp_create_nonce( 'seo_copilot_admin_nonce' ); ?>" />
</div>

<script>
jQuery(document).ready(function($) {
	var nonce = $('#seo_copilot_admin_nonce').val();

	// Toggle Add Panel
	$('#btn-toggle-add-panel').on('click', function(e) {
		e.preventDefault();
		$('#add-keywords-panel').slideToggle(200);
	});

	// Auto-Discover (GSC)
	$('#btn-auto-discover-kws').on('click', function(e) {
		e.preventDefault();
		var postId = $('#add-post-id').val();
		if (!postId) { alert('Please select a post first.'); return; }
		var $btn = $(this);
		$btn.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Fetching...');
		$.ajax({
			url: ajaxurl, type: 'POST',
			data: { action: 'seo_copilot_auto_discover_keywords', nonce: nonce, post_id: postId },
			success: function(res) {
				$btn.prop('disabled', false).html('<span class="dashicons dashicons-google"></span> Discover from GSC');
				if (res.success && res.data) {
					var list = [];
					res.data.forEach(function(item) { list.push(item.keyword); });
					if (list.length > 0) {
						var existing = $('#add-keywords-list').val();
						$('#add-keywords-list').val(existing ? existing + ', ' + list.join(', ') : list.join(', '));
					} else { alert("No new keywords found in Search Console for this post."); }
				} else { alert(res.data || 'Failed to connect to GSC.'); }
			},
			error: function() {
				$btn.prop('disabled', false).html('<span class="dashicons dashicons-google"></span> Discover from GSC');
				alert('Server error connecting to GSC API.');
			}
		});
	});

	// Submit Keywords
	$('#btn-submit-keywords').on('click', function(e) {
		e.preventDefault();
		var postId = $('#add-post-id').val();
		var kws    = $('#add-keywords-list').val();
		var country = $('#add-country-code').val();
		var device  = $('#add-device').val();
		if (!postId || !kws) { alert('Post ID and Keywords are required.'); return; }
		var $btn = $(this), $spin = $('#add-kw-spinner');
		$btn.prop('disabled', true);
		$spin.addClass('is-active');
		$.ajax({
			url: ajaxurl, type: 'POST',
			data: { action: 'seo_copilot_add_keywords', nonce: nonce, post_id: postId, keywords: kws, country: country, device: device },
			success: function(res) {
				$btn.prop('disabled', false); $spin.removeClass('is-active');
				if (res.success) { $('#add-keywords-list').val(''); alert('Success! Refreshing page...'); location.reload(); }
				else { alert(res.data || 'Save failed.'); }
			},
			error: function() { $btn.prop('disabled', false); $spin.removeClass('is-active'); alert('Server communication error.'); }
		});
	});

	// Remove Keyword
	$(document).on('click', '.btn-remove-kw', function(e) {
		e.preventDefault();
		if (!confirm('Are you sure you want to stop tracking this keyword?')) return;
		var $btn = $(this), id = $btn.data('id'), $row = $('#kw-row-' + id);
		$btn.prop('disabled', true);
		$.ajax({
			url: ajaxurl, type: 'POST',
			data: { action: 'seo_copilot_remove_keyword', nonce: nonce, keyword_id: id },
			success: function(res) {
				if (res.success) { $row.fadeOut(300, function() { $(this).remove(); }); }
				else { alert('Deletion failed.'); $btn.prop('disabled', false); }
			}
		});
	});

	// Check All Ranks
	$('#btn-check-all-ranks').on('click', function(e) {
		e.preventDefault();
		var $btn = $(this);
		$btn.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Checking...');
		$.ajax({
			url: ajaxurl, type: 'POST',
			data: { action: 'seo_copilot_check_all_rankings', nonce: nonce },
			success: function(res) {
				if (res.success) { alert(res.data); location.reload(); }
				else { alert('Check failed.'); $btn.prop('disabled', false).html('<span class="dashicons dashicons-update"></span> Check All Ranks Now'); }
			}
		});
	});
});
</script>
