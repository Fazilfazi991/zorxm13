<?php
/**
 * WooCommerce SEO View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'WooCommerce' ) ) {
	?>
	<div class="wrap seo-copilot-page">
		<div class="sc-empty-state sc-card" style="margin-top:40px; border-top: 4px solid var(--sc-primary);">
			<span class="sc-empty-icon">🛒</span>
			<h4>WooCommerce Not Detected</h4>
			<p>This module requires WooCommerce. Install and activate WooCommerce to unlock ecommerce SEO features.</p>
			<a href="<?php echo esc_url( admin_url('plugin-install.php?s=woocommerce&tab=search&type=term') ); ?>" class="sc-btn sc-btn-primary">Install WooCommerce &rarr;</a>
		</div>
	</div>
	<?php
	return;
}

$woo_seo = seo_copilot_woocommerce_seo();
$summary = get_option( 'seo_copilot_woo_summary', [
	'analyzed'     => 0,
	'avg_score'    => 0,
	'missing_meta' => 0,
	'no_images'    => 0,
	'last_run'     => null
] );

// Get published products
$products = wc_get_products([ 'limit' => 50, 'status' => 'publish' ]);

// Categories for filter
$cats = get_terms([ 'taxonomy' => 'product_cat', 'hide_empty' => false ]);

?>

<div class="wrap seo-copilot-page">
	
	<!-- Header -->
	<div class="sc-page-header">
		<div class="sc-header-left">
			<span class="sc-header-icon">🛒</span>
			<div>
				<h1 class="wp-heading-inline">WooCommerce SEO</h1>
				<p class="sc-header-subtitle">Optimize every product page to rank higher and convert better.</p>
			</div>
		</div>
		<div class="sc-header-right">
			<button id="sc-btn-analyze-store" class="sc-btn sc-btn-outline">Analyze All Products</button>
		</div>
	</div>

	<!-- Tip Box -->
	<div class="sc-tip-box" style="margin-bottom: 24px;">
		<span class="sc-tip-icon">💡</span>
		<div>
			<strong>Did you know?</strong> Product pages with complete SEO meta, rich descriptions, and proper schema markup get 3x more organic clicks. Use bulk AI optimization to fix your entire store in minutes.
		</div>
	</div>

	<!-- Section 1: Store SEO Health -->
	<div class="sc-stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
		
		<div class="sc-stat-card">
			<div class="sc-stat-title">Products Analyzed</div>
			<div class="sc-stat-value" id="woo-stat-analyzed">
				<?php echo esc_html( $summary['analyzed'] ); ?>
			</div>
			<div class="sc-progress-bar-container" style="height:4px; background:var(--sc-border); border-radius:2px; margin-top:8px; overflow:hidden;">
				<div class="sc-progress-bar" style="width: <?php echo $summary['analyzed'] > 0 ? '100%' : '0%'; ?>;"></div>
			</div>
		</div>

		<div class="sc-stat-card">
			<div class="sc-stat-title">Avg Product Score</div>
			<div class="sc-stat-value" id="woo-stat-score">
				<span class="sc-badge <?php echo $summary['avg_score'] >= 80 ? 'sc-badge-success' : ($summary['avg_score'] >= 50 ? 'sc-badge-warning' : 'sc-badge-danger'); ?>" style="font-size:16px; padding:4px 12px;">
					<?php echo esc_html( $summary['avg_score'] ); ?> / 100
				</span>
			</div>
		</div>

		<div class="sc-stat-card">
			<div class="sc-stat-title">Missing Meta</div>
			<div class="sc-stat-value" id="woo-stat-meta">
				<span class="<?php echo $summary['missing_meta'] > 0 ? 'sc-badge sc-badge-danger' : ''; ?>" style="font-size:16px;">
					<?php echo esc_html( $summary['missing_meta'] ); ?>
				</span>
			</div>
		</div>

		<div class="sc-stat-card">
			<div class="sc-stat-title">Missing Images</div>
			<div class="sc-stat-value" id="woo-stat-images">
				<span class="<?php echo $summary['no_images'] > 0 ? 'sc-badge sc-badge-warning' : ''; ?>" style="font-size:16px;">
					<?php echo esc_html( $summary['no_images'] ); ?>
				</span>
			</div>
		</div>

	</div>

	<!-- Section 2: Products Table -->
	<div class="sc-card sc-tabs-container">
		
		<div class="sc-card-header" style="display:flex; justify-content:space-between; align-items:center;">
			<h3 style="margin:0;">Products Needing Optimization</h3>
			<div style="display:flex; gap:8px;">
				<button id="sc-btn-bulk-optimize" class="sc-btn sc-btn-primary sc-btn-sm">AI Optimize Selected</button>
				<button id="sc-btn-bulk-schema" class="sc-btn sc-btn-outline sc-btn-sm">Generate All Schema</button>
			</div>
		</div>

		<!-- Filters -->
		<div class="sc-filters-bar" style="border-bottom: 1px solid var(--sc-border); border-radius:0; box-shadow:none;">
			<div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
				<div class="sc-form-group" style="margin:0;">
					<select id="woo-filter-category" class="sc-form-control sc-form-control-sm">
						<option value="all">All Categories</option>
						<?php foreach ( $cats as $c ) : ?>
							<option value="<?php echo esc_attr($c->term_id); ?>"><?php echo esc_html($c->name); ?></option>
						<?php endforeach; ?>
					</select>
				</div>
				<div class="sc-form-group" style="margin:0;">
					<select id="woo-filter-status" class="sc-form-control sc-form-control-sm">
						<option value="all">All Statuses</option>
						<option value="missing_meta">Missing Meta</option>
						<option value="no_images">No Images</option>
						<option value="low_score">Low Score (< 60)</option>
						<option value="no_sku">No SKU</option>
					</select>
				</div>
				<div class="sc-form-group" style="margin:0; flex-grow:1; display:flex; justify-content:flex-end;">
					<input type="text" id="woo-filter-search" class="sc-form-control sc-form-control-sm" placeholder="Search products..." style="max-width:200px;">
				</div>
			</div>
		</div>

		<div class="sc-card-body" style="padding:0;">
			<table class="sc-table" style="margin:0; width:100%;">
				<thead>
					<tr>
						<th style="width:1%"><input type="checkbox" id="woo-select-all"></th>
						<th style="width:30%">Product</th>
						<th>Price</th>
						<th>Score</th>
						<th>Meta Status</th>
						<th>Schema</th>
						<th style="text-align:right;">Actions</th>
					</tr>
				</thead>
				<tbody id="woo-products-body">
					<?php if ( empty( $products ) ) : ?>
						<tr><td colspan="7" style="text-align:center; padding:30px;">No published products found.</td></tr>
					<?php else : ?>
						<?php foreach ( $products as $p ) : 
							$id = $p->get_id();
							$score = get_post_meta( $id, '_seo_copilot_woo_score', true );
							$score_display = $score === '' ? '-' : $score;
							$score_class = 'sc-badge-grey';
							if ( $score !== '' ) {
								if ( $score >= 80 ) $score_class = 'sc-badge-success';
								elseif ( $score >= 50 ) $score_class = 'sc-badge-warning';
								else $score_class = 'sc-badge-danger';
							}

							$meta_t = get_post_meta( $id, '_seo_copilot_meta_title', true );
							$meta_d = get_post_meta( $id, '_seo_copilot_meta_description', true );
							$meta_status = '✓ Complete';
							$meta_color = '#008a20';
							if ( empty($meta_t) && empty($meta_d) ) {
								$meta_status = '✗ No meta';
								$meta_color = '#d63638';
							} elseif ( empty($meta_t) || empty($meta_d) ) {
								$meta_status = '⚠ Incomplete';
								$meta_color = '#db7300';
							}

							$schema = get_post_meta( $id, '_seo_copilot_woo_schema', true );
						?>
							<tr class="woo-product-row" data-id="<?php echo esc_attr($id); ?>">
								<td><input type="checkbox" class="woo-select-cb" value="<?php echo esc_attr($id); ?>"></td>
								<td>
									<strong><?php echo esc_html( $p->get_name() ); ?></strong>
									<div style="font-size:11px; color:#646970;"><?php echo esc_html( $p->get_sku() ); ?></div>
								</td>
								<td><?php echo wc_price( $p->get_price() ); ?></td>
								<td><span class="sc-badge <?php echo esc_attr($score_class); ?> woo-score-val"><?php echo esc_html($score_display); ?></span></td>
								<td><span style="color:<?php echo $meta_color; ?>; font-size:12px; font-weight:600;" class="woo-meta-status"><?php echo esc_html($meta_status); ?></span></td>
								<td><span style="color:<?php echo $schema ? '#008a20' : '#d63638'; ?>; font-size:18px;"><?php echo $schema ? '✓' : '✗'; ?></span></td>
								<td style="text-align:right;">
									<button class="sc-btn sc-btn-outline sc-btn-sm btn-woo-ai-opt" data-id="<?php echo esc_attr($id); ?>">AI Optimize</button>
									<a href="<?php echo esc_url( get_edit_post_link( $id ) ); ?>" target="_blank" class="sc-btn sc-btn-outline sc-btn-sm">Edit</a>
								</td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
	</div>

</div>

<script>
jQuery(document).ready(function($) {

	// Analyze entire store
	$('#sc-btn-analyze-store').on('click', function() {
		var btn = $(this);
		var originalText = btn.text();
		btn.text('Analyzing Store... Please wait').prop('disabled', true);
		
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_analyze_products',
			nonce: seoCopilotAdmin.nonce
		}, function(res) {
			if(res.success) {
				alert('Analysis complete! Mapped ' + res.data.analyzed + ' products.');
				location.reload();
			} else {
				alert('Error: ' + res.data);
				btn.text(originalText).prop('disabled', false);
			}
		});
	});

	// Single AI Optimize
	$(document).on('click', '.btn-woo-ai-opt', function() {
		var btn = $(this);
		var row = btn.closest('tr');
		var id = btn.data('id');

		btn.html('<span class="dashicons dashicons-update spin" style="margin-top:2px;"></span>').prop('disabled', true);

		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_optimize_product',
			nonce: seoCopilotAdmin.nonce,
			product_id: id
		}, function(res) {
			if(res.success) {
				btn.text('✓ Done').removeClass('sc-btn-outline').addClass('sc-btn-primary').prop('disabled', false);
				row.find('.woo-score-val').text(res.data.new_score).removeClass('sc-badge-danger sc-badge-grey').addClass('sc-badge-success');
				row.find('.woo-meta-status').text('✓ Complete').css('color', '#008a20');
				setTimeout(function() { btn.text('AI Optimize').removeClass('sc-btn-primary').addClass('sc-btn-outline'); }, 3000);
			} else {
				alert('Optimization failed: ' + res.data);
				btn.text('AI Optimize').prop('disabled', false);
			}
		});
	});

	// Bulk Schema Gen
	$('#sc-btn-bulk-schema').on('click', function() {
		var btn = $(this);
		btn.text('Generating...').prop('disabled', true);
		
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_generate_woo_schema',
			nonce: seoCopilotAdmin.nonce
		}, function(res) {
			if(res.success) {
				alert(res.data);
				location.reload();
			} else {
				alert('Generation failed');
				btn.text('Generate All Schema').prop('disabled', false);
			}
		});
	});

	// Select All toggle
	$('#woo-select-all').on('change', function() {
		$('.woo-select-cb').prop('checked', this.checked);
	});

});
</script>
