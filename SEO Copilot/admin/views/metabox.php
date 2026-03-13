<?php
/**
 * Metabox View HTML
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

// Variables available from render_meta_box():
// $data = ['keyword', 'title', 'description', 'score', 'issues', 'schema', 'schema_type', 'schema_injected'];

$score = $data['score'] !== '' ? intval( $data['score'] ) : false;
$issues_json = ! empty( $data['issues'] ) ? $data['issues'] : '[]';
$schema_injected = $data['schema_injected'] ? 'checked' : '';
?>
<div class="seo-copilot-metabox-wrapper">
	
	<!-- Tabs Navigation -->
	<div class="seo-copilot-tabs">
		<button type="button" class="seo-copilot-tab active" data-tab="optimize"><?php esc_html_e( 'Optimize', 'seo-copilot' ); ?></button>
		<button type="button" class="seo-copilot-tab" data-tab="preview"><?php esc_html_e( 'Preview', 'seo-copilot' ); ?></button>
		<button type="button" class="seo-copilot-tab" data-tab="links"><?php esc_html_e( 'Links', 'seo-copilot' ); ?></button>
		<button type="button" class="seo-copilot-tab" data-tab="readability"><?php esc_html_e( 'Readability', 'seo-copilot' ); ?></button>
		<button type="button" class="seo-copilot-tab" data-tab="schema"><?php esc_html_e( 'Schema', 'seo-copilot' ); ?></button>
		<button type="button" class="seo-copilot-tab" data-tab="rankings"><?php esc_html_e( 'Rankings', 'seo-copilot' ); ?></button>
		<button type="button" class="seo-copilot-tab" data-tab="aeo">⚡ AEO</button>
		<div class="seo-copilot-tab-slider"></div>
	</div>

	<!-- TAB 1: Optimize -->
	<div class="seo-copilot-tab-content active" id="tab-optimize">
		
		<!-- Focus Keyword -->
		<div class="seo-copilot-field-group">
			<label for="seo_copilot_focus_keyword"><strong><?php esc_html_e( 'Focus Keyword', 'seo-copilot' ); ?></strong></label>
			<div class="seo-copilot-keyword-wrapper">
				<input type="text" id="seo_copilot_focus_keyword" name="_seo_copilot_focus_keyword" value="<?php echo esc_attr( $data['keyword'] ); ?>" placeholder="<?php esc_attr_e( 'Enter your focus keyword', 'seo-copilot' ); ?>" />
				<button type="button" id="seo-copilot-analyze-btn" class="seo-copilot-btn primary">
					<span class="btn-text"><?php esc_html_e( 'Analyze', 'seo-copilot' ); ?></span>
					<span class="spinner"></span>
				</button>
			</div>
			<div class="seo-copilot-keyword-difficulty">
				<span class="difficulty-badge" id="seo-copilot-difficulty-badge"><?php esc_html_e( 'Difficulty: Unknown', 'seo-copilot' ); ?></span>
			</div>
		</div>

		<hr>

		<!-- SEO Score Widget -->
		<div class="seo-copilot-score-widget">
			<?php if ( ! empty( $data['is_product'] ) ) : 
				$woo_score = $data['woo_score'] !== '' ? intval( $data['woo_score'] ) : false;
			?>
				<!-- WOOCOMMERCE SCORE VIEWS -->
				<div class="score-circle-container">
					<svg viewBox="0 0 36 36" class="circular-chart">
						<path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
						<path class="circle" id="seo-copilot-woo-score-circle" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
						<text x="18" y="20.35" class="percentage" id="seo-copilot-woo-score-text"><?php echo $woo_score !== false ? esc_html( $woo_score ) : '&mdash;'; ?></text>
					</svg>
					<div class="score-label"><?php esc_html_e( 'WooCommerce Score', 'seo-copilot' ); ?></div>
				</div>
				<div class="score-stats" style="flex-direction:column; align-items:flex-start; gap:8px;">
					<button type="button" id="seo-copilot-woo-optimize-btn" class="sc-btn sc-btn-primary" style="width:100%;">
						<span class="dashicons dashicons-superhero"></span> <?php esc_html_e( 'AI Optimize Product', 'seo-copilot' ); ?>
					</button>
					<div style="font-size:12px; color:#646970;">Optimizes title, description, and keyword.</div>
				</div>
				<input type="hidden" name="_seo_copilot_woo_score" id="_seo_copilot_woo_score" value="<?php echo esc_attr( $data['woo_score'] ); ?>" />
				
			<?php else : ?>
				<!-- STANDARD PAGE SCORE -->
				<div class="score-circle-container">
					<svg viewBox="0 0 36 36" class="circular-chart">
						<path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
						<path class="circle" id="seo-copilot-score-circle" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
						<text x="18" y="20.35" class="percentage" id="seo-copilot-score-text"><?php echo $score !== false ? esc_html( $score ) : '&mdash;'; ?></text>
					</svg>
					<div class="score-label"><?php esc_html_e( 'SEO Score', 'seo-copilot' ); ?></div>
				</div>
				<div class="score-stats">
					<div class="stat-badge"><span class="dashicons dashicons-text"></span> <?php esc_html_e( 'Readability:', 'seo-copilot' ); ?> <strong id="stat-readability">&mdash;</strong></div>
					<div class="stat-badge"><span class="dashicons dashicons-admin-links"></span> <?php esc_html_e( 'Keywords:', 'seo-copilot' ); ?> <strong id="stat-keywords">&mdash;</strong></div>
					<div class="stat-badge"><span class="dashicons dashicons-admin-links"></span> <?php esc_html_e( 'Links:', 'seo-copilot' ); ?> <strong id="stat-links">&mdash;</strong></div>
				</div>
				<!-- Hidden Input for saving score -->
				<input type="hidden" name="_seo_copilot_score" id="_seo_copilot_score" value="<?php echo esc_attr( $data['score'] ); ?>" />
			<?php endif; ?>
		</div>

		<?php if ( ! empty( $data['eeat_overall'] ) ) : ?>
		<!-- E-E-A-T Signals -->
		<div class="seo-copilot-eeat-widget" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:15px; margin-top:20px;">
			<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
				<strong style="font-size:14px;">🏆 E-E-A-T Signals</strong>
				<?php 
				$eeat_color = '#EF4444';
				if ($data['eeat_overall'] >= 60) $eeat_color = '#F59E0B';
				if ($data['eeat_overall'] >= 80) $eeat_color = '#10B981';
				?>
				<span class="sc-badge" style="background:<?php echo $eeat_color; ?>; color:#fff; border:none;"><?php echo intval($data['eeat_overall']); ?>/100</span>
			</div>
			
			<div style="display:flex; gap:5px; margin-bottom:15px;">
				<div style="flex:1;">
					<div style="font-size:10px; color:#64748b; font-weight:bold;">EXP</div>
					<div class="sc-progress" style="height:4px; margin:2px 0;"><div class="sc-progress-bar" style="width:<?php echo esc_attr($data['eeat_exp']*4); ?>%; background:#4F46E5;"></div></div>
				</div>
				<div style="flex:1;">
					<div style="font-size:10px; color:#64748b; font-weight:bold;">EXT</div>
					<div class="sc-progress" style="height:4px; margin:2px 0;"><div class="sc-progress-bar" style="width:<?php echo esc_attr($data['eeat_ext']*4); ?>%; background:#4F46E5;"></div></div>
				</div>
				<div style="flex:1;">
					<div style="font-size:10px; color:#64748b; font-weight:bold;">AUT</div>
					<div class="sc-progress" style="height:4px; margin:2px 0;"><div class="sc-progress-bar" style="width:<?php echo esc_attr($data['eeat_auth']*4); ?>%; background:#4F46E5;"></div></div>
				</div>
				<div style="flex:1;">
					<div style="font-size:10px; color:#64748b; font-weight:bold;">TRU</div>
					<div class="sc-progress" style="height:4px; margin:2px 0;"><div class="sc-progress-bar" style="width:<?php echo esc_attr($data['eeat_trust']*4); ?>%; background:#4F46E5;"></div></div>
				</div>
			</div>

			<?php 
			$e_issues = json_decode($data['eeat_issues'], true);
			if ( !empty($e_issues) && is_array($e_issues) ) : 
			?>
				<div style="font-size:12px; color:#ef4444; margin-bottom:10px;">
					<span class="dashicons dashicons-warning" style="font-size:14px; width:14px; height:14px; line-height:14px; margin-top:1px;"></span>
					<strong style="color:#1e293b;">Top Issue:</strong> <?php echo esc_html($e_issues[0]['desc'] ?? $e_issues[0] ?? 'Requires attention.'); ?>
				</div>
			<?php endif; ?>

			<div style="text-align:right;">
				<a href="<?php echo admin_url('admin.php?page=seo-copilot-eeat'); ?>" target="_blank" style="text-decoration:none; font-size:12px; font-weight:bold;">Improve E-E-A-T &rarr;</a>
			</div>
		</div>
		<?php endif; ?>

		<hr>

		<!-- Meta Title -->
		<div class="seo-copilot-field-group">
			<label class="flex-label">
				<strong><?php esc_html_e( 'Meta Title', 'seo-copilot' ); ?></strong>
				<button type="button" class="seo-copilot-generate-btn" data-target="title">
					<span class="dashicons dashicons-superhero"></span> <?php esc_html_e( 'Generate with AI', 'seo-copilot' ); ?>
				</button>
			</label>
			<input type="text" id="seo_copilot_meta_title" name="_seo_copilot_meta_title" value="<?php echo esc_attr( $data['title'] ); ?>" class="widefat" />
			<div class="char-counter">
				<span id="title-char-count">0</span> / 60
			</div>
		</div>

		<!-- Meta Description -->
		<div class="seo-copilot-field-group">
			<label class="flex-label">
				<strong><?php esc_html_e( 'Meta Description', 'seo-copilot' ); ?></strong>
				<button type="button" class="seo-copilot-generate-btn" data-target="description">
					<span class="dashicons dashicons-superhero"></span> <?php esc_html_e( 'Generate with AI', 'seo-copilot' ); ?>
				</button>
			</label>
			<textarea id="seo_copilot_meta_description" name="_seo_copilot_meta_description" rows="3" class="widefat"><?php echo esc_textarea( $data['description'] ); ?></textarea>
			<div class="char-counter">
				<span id="desc-char-count">0</span> / 155
			</div>
		</div>

		<hr>

		<!-- Issues List -->
		<div class="seo-copilot-issues-container">
			<h3><?php esc_html_e( 'Analysis Results', 'seo-copilot' ); ?></h3>
			<div id="seo-copilot-issues-list">
				<!-- Populated via JS -->
				<p class="description"><?php esc_html_e( 'Enter a focus keyword and click Analyze to see your suggestions.', 'seo-copilot' ); ?></p>
			</div>
			<!-- Hidden Input for saving rules -->
			<input type="hidden" name="_seo_copilot_issues" id="_seo_copilot_issues" value="<?php echo esc_attr( $issues_json ); ?>" />
		</div>

	</div>

	<!-- TAB 2: Preview -->
	<div class="seo-copilot-tab-content" id="tab-preview">
		
		<div class="preview-actions">
			<button type="button" class="preview-toggle active" data-view="desktop"><span class="dashicons dashicons-desktop"></span> Desktop</button>
			<button type="button" class="preview-toggle" data-view="mobile"><span class="dashicons dashicons-smartphone"></span> Mobile</button>
		</div>

		<!-- Google SERP Preview -->
		<div class="seo-copilot-preview-card serp-preview desktop" id="seo-copilot-serp-preview">
			<h4><?php esc_html_e( 'Google Search Preview', 'seo-copilot' ); ?></h4>
			<div class="serp-mockup">
				<div class="serp-url-breadcrumb">
					<img src="<?php echo esc_url( get_site_icon_url( 16, SEO_COPILOT_PLUGIN_URL . 'admin/images/default-favicon.png' ) ); ?>" class="serp-favicon" alt="favicon" />
					<span class="serp-domain"><?php echo esc_html( wp_parse_url( home_url(), PHP_URL_HOST ) ); ?></span>
					<span class="serp-path"> &rsaquo; <?php echo esc_html( get_post_field( 'post_name', get_the_ID() ) ?: 'sample-post' ); ?></span>
				</div>
				<div class="serp-title" id="serp-title-preview"><?php echo esc_html( $data['title'] ?: get_the_title() ); ?></div>
				<div class="serp-description" id="serp-desc-preview"><?php echo esc_html( $data['description'] ?: 'Please provide a meta description by editing your snippet below.' ); ?></div>
			</div>
		</div>

		<!-- Social Preview placeholder -->
		<div class="seo-copilot-preview-card social-preview">
			<h4><?php esc_html_e( 'Social Media Preview', 'seo-copilot' ); ?></h4>
			<div class="social-mockup">
				<div class="social-image-placeholder"><span class="dashicons dashicons-format-image"></span></div>
				<div class="social-content">
					<div class="social-domain"><?php echo esc_html( wp_parse_url( home_url(), PHP_URL_HOST ) ); ?></div>
					<div class="social-title" id="social-title-preview"><?php echo esc_html( $data['title'] ?: get_the_title() ); ?></div>
					<div class="social-desc" id="social-desc-preview"><?php echo esc_html( $data['description'] ?: 'Please provide a meta description.' ); ?></div>
				</div>
			</div>
		</div>

	</div>

	<!-- TAB 3: Links -->
	<div class="seo-copilot-tab-content" id="tab-links">
		
		<!-- Internal Link Suggestions -->
		<div class="seo-copilot-links-section" style="margin-bottom: 24px;">
			<div class="flex-label">
				<h3><?php esc_html_e( 'Internal Link Suggestions', 'seo-copilot' ); ?></h3>
				<button type="button" id="seo-copilot-suggest-links-btn" class="seo-copilot-btn secondary">
					<?php esc_html_e( 'Find Suggestions', 'seo-copilot' ); ?>
					<span class="spinner"></span>
				</button>
			</div>
			<div id="seo-copilot-links-results">
				<p class="description"><?php esc_html_e( 'Click "Find Suggestions" to ask AI for contextual internal link opportunities within this article.', 'seo-copilot' ); ?></p>
			</div>
		</div>

		<hr>

		<!-- Outbound Links Checker -->
		<div class="seo-copilot-links-section" style="margin-top: 24px;">
			<h3><?php esc_html_e( 'Outbound Links Checker', 'seo-copilot' ); ?></h3>
			<div id="seo-copilot-outbound-links">
				<p class="description"><?php esc_html_e( 'Save the post to scan for outbound links.', 'seo-copilot' ); ?></p>
			</div>
		</div>

	</div>

	<!-- TAB 4: Rankings -->
	<div class="seo-copilot-tab-content" id="tab-rankings">
		
		<div class="seo-copilot-field-group" style="padding: 16px; background: #f8f9f9; border: 1px solid #e2e4e7; border-radius: 4px; margin-bottom: 24px;">
			<p style="margin-top:0;"><strong><?php esc_html_e( 'Track a new Keyword', 'seo-copilot' ); ?></strong></p>
			<div style="display:flex; gap:8px;">
				<input type="text" id="mb-add-keyword" placeholder="Enter keyword..." style="flex:2;" />
				<select id="mb-add-country" style="flex:1;">
					<option value="US">🇺🇸 US</option>
					<option value="GB">🇬🇧 GB</option>
					<option value="CA">🇨🇦 CA</option>
					<option value="AU">🇦🇺 AU</option>
				</select>
				<button type="button" class="seo-copilot-btn secondary" id="btn-mb-add-kw" data-post-id="<?php echo esc_attr( get_the_ID() ); ?>"><?php esc_html_e( 'Track', 'seo-copilot' ); ?></button>
			</div>
		</div>

		<div class="seo-copilot-mb-rankings-list" id="seo-copilot-mb-rankings-list">
			<p class="description"><span class="dashicons dashicons-update spin"></span> Loading rankings data...</p>
			<?php 
			// We will load the actual table via an AJAX call from the JS file 
			// to avoid blocking the initial editor load for slow DFS calls
			?>
		</div>

	</div>

	<!-- TAB: Readability -->
	<div class="seo-copilot-tab-content" id="tab-readability">
		<div class="seo-copilot-field-group">
			<label class="flex-label">
				<h3><?php esc_html_e( 'Readability Coach', 'seo-copilot' ); ?></h3>
				<button type="button" id="seo-copilot-analyze-readability-btn" class="seo-copilot-btn secondary">
					<?php esc_html_e( 'Scan Content', 'seo-copilot' ); ?>
					<span class="spinner"></span>
				</button>
			</label>
            <div style="margin-top:10px;">
                <p><strong>Flesch Score:</strong> <span id="mb-flesch-score">&mdash;</span> (<span id="mb-flesch-grade">&mdash;</span>)</p>
            </div>
		</div>

		<hr>

		<div class="seo-copilot-field-group">
			<h3><?php esc_html_e( 'Passive Voice & Complex Sentences', 'seo-copilot' ); ?></h3>
			<div id="seo-copilot-readability-issues">
				<p class="description">Click "Scan Content" above to find hard-to-read sentences.</p>
			</div>
		</div>
        
        <hr>

        <div class="seo-copilot-field-group" id="seo-copilot-ai-rewrite-box" style="display:none; background:#f0f0f1; padding:15px; border-radius:5px;">
            <h4>AI Rewrite Suggestion</h4>
            <p><strong>Original:</strong> <span id="rewrite-original" style="color:#d63638;font-style:italic;"></span></p>
            <p><strong>Suggestion:</strong> <span id="rewrite-suggestion" style="color:#008a20;font-weight:bold;"></span></p>
            <p><em>Why:</em> <span id="rewrite-explanation"></span></p>
            <button type="button" class="button button-small" id="close-rewrite-box">Close</button>
        </div>
	</div>

	<!-- TAB 5: Schema -->
	<div class="seo-copilot-tab-content" id="tab-schema">
		
		<div class="seo-copilot-field-group">
			<label for="_seo_copilot_schema_type"><strong><?php esc_html_e( 'Schema Type', 'seo-copilot' ); ?></strong></label>
			<?php
			$types = [ 'Article', 'FAQ', 'HowTo', 'Product', 'Review', 'Recipe', 'Event', 'Person' ];
			$current_type = $data['schema_type'] ?: 'Article';
			?>
			<div class="flex-label">
				<select id="_seo_copilot_schema_type" name="_seo_copilot_schema_type">
					<?php foreach ( $types as $type ) : ?>
						<option value="<?php echo esc_attr( $type ); ?>" <?php selected( $current_type, $type ); ?>><?php echo esc_html( $type ); ?></option>
					<?php endforeach; ?>
				</select>
				
				<button type="button" id="seo-copilot-generate-schema-btn" class="seo-copilot-btn primary">
					<span class="dashicons dashicons-superhero"></span> <?php esc_html_e( 'Generate Schema', 'seo-copilot' ); ?>
					<span class="spinner"></span>
				</button>
			</div>
		</div>

		<div class="seo-copilot-field-group">
			<label class="seo-copilot-switch-wrap">
				<label class="seo-copilot-switch">
					<input type="checkbox" name="_seo_copilot_schema_injected" id="_seo_copilot_schema_injected" value="1" <?php echo $schema_injected; ?> />
					<span class="seo-copilot-slider round"></span>
				</label>
				<strong><?php esc_html_e( 'Inject Schema into Page', 'seo-copilot' ); ?></strong>
				<span class="description" style="margin-left: 10px;"><?php esc_html_e( 'If enabled, we will output this JSON-LD directly into the page <head>.', 'seo-copilot' ); ?></span>
			</label>
		</div>

		<div class="seo-copilot-schema-preview">
			<div class="flex-label schema-preview-header">
				<strong><?php esc_html_e( 'Generated JSON-LD:', 'seo-copilot' ); ?></strong>
				<a href="https://search.google.com/test/rich-results" target="_blank" class="seo-copilot-btn secondary small"><?php esc_html_e( 'Test in Google', 'seo-copilot' ); ?> <span class="dashicons dashicons-external"></span></a>
			</div>
			<div class="schema-code-block-wrapper">
				<?php if ( ! empty( $data['is_product'] ) ) : ?>
					<textarea id="_seo_copilot_woo_schema" name="_seo_copilot_woo_schema" class="schema-textarea hidden"><?php echo esc_textarea( $data['woo_schema'] ); ?></textarea>
					<pre class="schema-code-render"><code id="schema-code-display"><?php echo !empty($data['woo_schema']) ? esc_html($data['woo_schema']) : '// No WooCommerce product schema generated yet. Use the main WooCommerce SEO page to generate bulk schema.'; ?></code></pre>
				<?php else : ?>
					<textarea id="_seo_copilot_schema" name="_seo_copilot_schema" class="schema-textarea hidden"><?php echo esc_textarea( $data['schema'] ); ?></textarea>
					<pre class="schema-code-render"><code id="schema-code-display"><?php echo !empty($data['schema']) ? esc_html($data['schema']) : '// No schema generated yet.'; ?></code></pre>
				<?php endif; ?>
			</div>
		</div>

	</div>

	<!-- TAB 6: AEO -->
	<div class="seo-copilot-tab-content" id="tab-aeo">
		
		<div class="seo-copilot-score-widget" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; display:flex; gap:20px; margin-bottom:20px;">
			<div class="score-circle-container" style="flex:0 0 100px;">
				<?php 
				$ae_score = $data['aeo_score'] !== false ? intval($data['aeo_score']) : false;
				$ae_color = '#EF4444';
				if ($ae_score >= 60) $ae_color = '#F59E0B';
				if ($ae_score >= 75) $ae_color = '#10B981';
				?>
				<svg viewBox="0 0 36 36" class="circular-chart" style="width:100px; height:100px;">
					<path class="circle-bg" stroke="#e2e8f0" stroke-width="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
					<path class="circle" stroke="<?php echo $ae_score !== false ? $ae_color : '#e2e8f0'; ?>" stroke-width="3" stroke-dasharray="<?php echo $ae_score !== false ? esc_attr($ae_score) : 0; ?>, 100" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
					<text x="18" y="21.5" font-family="system-ui" font-size="10" font-weight="800" fill="#1e293b" text-anchor="middle"><?php echo $ae_score !== false ? esc_html($ae_score) : '-'; ?></text>
				</svg>
			</div>
			<div style="flex:1;">
				<div style="display:flex; justify-content:space-between; align-items:center;">
					<h3 style="margin:0;">AEO Health Score</h3>
					<?php if ($ae_score !== false) : ?>
						<?php if ($ae_score >= 75) : ?><span class="sc-badge sc-badge-success">✅ AI Overview Ready</span>
						<?php elseif ($ae_score >= 60) : ?><span class="sc-badge sc-badge-warning">⚠️ Almost Ready</span>
						<?php else : ?><span class="sc-badge sc-badge-danger">❌ Not Ready</span>
						<?php endif; ?>
					<?php endif; ?>
				</div>
				<?php if ($ae_score !== false) : ?>
					<div style="margin-top:10px; font-size:12px; color:#475569; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
						<div><strong>Direct Answer:</strong> <?php echo intval($data['aeo_direct']); ?>/25</div>
						<div><strong>FAQ:</strong> <?php echo intval($data['aeo_faq']); ?>/20</div>
						<div><strong>Schema:</strong> <?php echo intval($data['aeo_schema_score']); ?>/20</div>
					</div>
				<?php else : ?>
					<p style="color:#64748b; font-size:13px; margin-top:10px;">Post has not been scored yet. Run analysis.</p>
				<?php endif; ?>
			</div>
		</div>

		<div style="margin-bottom:20px;">
			<button type="button" class="sc-btn sc-btn-primary sc-btn-block" id="mb-btn-aeo-optimize" style="padding:10px; font-size:14px;">✨ Optimize for AI Overviews</button>
		</div>

		<?php if ($ae_score !== false) : 
			$issues = json_decode($data['aeo_issues'], true);
		?>
		<div class="seo-copilot-issues-container">
			<h4 style="margin:0 0 10px 0;">Current AEO Issues</h4>
			<?php if (empty($issues)) : ?>
				<div style="color:#10B981; font-weight:bold;">No known AEO issues!</div>
			<?php else : ?>
				<ul style="list-style:disc; margin-left:20px; color:#ef4444; font-size:13px;">
					<?php foreach ($issues as $iss) : ?>
						<li><?php echo esc_html($iss); ?></li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		</div>
		<?php endif; ?>

	</div>

</div>

<!-- MB AEO Modal Logic -->
<script>
jQuery(document).ready(function($) {
	$('#mb-btn-aeo-optimize').on('click', function(e) {
		e.preventDefault();
		if ( confirm('This will open the AEO Optimizer dashboard to fix issues with AI. Save your post first if you have unsaved changes. Continue?') ) {
			window.open('<?php echo admin_url("admin.php?page=seo-copilot-aeo"); ?>', '_blank');
		}
	});
});
</script>

<script>
jQuery(document).ready(function($) {
    if ( $('#seo-copilot-woo-score-circle').length ) {
		// Update circular progress for WooCommerce score
        var wScore = parseInt($('#_seo_copilot_woo_score').val(), 10);
        if(!isNaN(wScore)){
            var dash = wScore + ', 100';
            $('#seo-copilot-woo-score-circle').attr('stroke-dasharray', dash);
			
			// Adjust color based on score (green >= 80, yellow >= 50, red < 50)
			var wColor = '#d63638'; // Red baseline
			if (wScore >= 80) wColor = '#008a20'; // Green
			else if (wScore >= 50) wColor = '#dba617'; // Yellow
			
			$('#seo-copilot-woo-score-circle').css({
				'stroke': wColor,
				'transition': 'stroke-dasharray 0.5s ease-out, stroke 0.5s ease-out'
			});
			$('#seo-copilot-woo-score-text').css('fill', wColor);
        }

		// AI Optimize Product
		$('#seo-copilot-woo-optimize-btn').on('click', function(e) {
			e.preventDefault();
			var btn = $(this);
			var ogText = btn.html();
			btn.html('<span class="dashicons dashicons-update spin"></span> Optimizing...').prop('disabled', true);

			$.post(seoCopilotMetabox.ajaxUrl, {
				action: 'seo_copilot_optimize_product',
				nonce: seoCopilotMetabox.nonce,
				product_id: seoCopilotMetabox.postId
			}, function(res) {
				if(res.success) {
					var data = res.data.data;
					if(data.meta_title) $('#seo_copilot_meta_title').val(data.meta_title).trigger('input');
					if(data.meta_description) $('#seo_copilot_meta_description').val(data.meta_description).trigger('input');
					if(data.focus_keyword) $('#seo_copilot_focus_keyword').val(data.focus_keyword);
					btn.html('<span class="dashicons dashicons-yes"></span> Optimized!').removeClass('sc-btn-primary').addClass('sc-btn-success');
					setTimeout(function(){ btn.html(ogText).removeClass('sc-btn-success').addClass('sc-btn-primary').prop('disabled', false); }, 3000);
				} else {
					alert('Optimization failed: ' + res.data);
					btn.html(ogText).prop('disabled', false);
				}
			});
		});
    }
});
</script>
