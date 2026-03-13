<?php
/**
 * SEO Copilot Intelligence Hub View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

$hub = seo_copilot_intelligence_hub();
$is_onboarded = false; // We can check this now via PHP, but we'll use a variable to control the display
$profile = [];
if ( $hub->is_onboarded() ) {
	$is_onboarded = true;
	$profile = $hub->get_user_profile();
}

// Fetch featured content (3 max)
$featured = $hub->get_featured_content();

// Helper to determine badge color
function get_intel_badge_color( $type ) {
	$map = [
		'playbook'        => '--sc-intel-playbook',
		'tip'             => '--sc-intel-tip',
		'market_research' => '--sc-intel-research',
		'template'        => '--sc-intel-template',
		'case_study'      => '--sc-intel-case-study',
	];
	return isset($map[$type]) ? $map[$type] : '--sc-primary';
}

function get_intel_skill_color( $level ) {
	$map = [
		'beginner'     => '#008a20', // Green
		'intermediate' => '#dba617', // Yellow
		'advanced'     => '#d63638', // Red
		'all'          => '#646970', // Grey
	];
	return isset($map[$level]) ? $map[$level] : '#646970';
}

?>

<div class="wrap seo-copilot-page" style="position:relative; min-height:800px;">

	<?php if ( ! $is_onboarded ) : ?>
	
	<!-- ==========================================
	     ONBOARDING OVERLAY
	     ========================================== -->
	<div id="intel-onboarding-overlay" class="intel-onboarding-overlay">
		<div class="intel-onboarding-card">
			
			<div class="intel-step-indicator">
				<span class="step-dot active" data-step="1"></span>
				<span class="step-dot" data-step="2"></span>
				<span class="step-dot" data-step="3"></span>
				<span class="step-dot" data-step="4"></span>
				<span class="step-dot" data-step="5"></span>
			</div>

			<form id="intel-onboarding-form">
				<!-- Step 1: Welcome -->
				<div class="intel-step active" id="step-1">
					<div style="font-size:48px; margin-bottom:16px;">🧠</div>
					<h2 style="font-size:24px; color:var(--sc-dark); margin:0 0 16px 0;">Welcome to Intelligence Hub</h2>
					<p style="font-size:16px; color:var(--sc-grey); line-height:1.6; margin-bottom:32px;">
						Let's personalize your SEO feed in 60 seconds.<br>
						Tell us about your site and your goals, and we'll deliver AI-curated tips, playbooks, and research tailored exactly to your needs.
					</p>
					<button type="button" class="sc-btn sc-btn-primary intel-next" style="font-size:16px; padding:12px 24px;">Get Started &rarr;</button>
				</div>

				<!-- Step 2: Site Type -->
				<div class="intel-step" id="step-2" style="display:none;">
					<h2 style="font-size:24px; color:var(--sc-dark); margin:0 0 24px 0;">What type of site do you have?</h2>
					<div class="intel-options-grid">
						<label class="intel-option-card">
							<input type="radio" name="site_type" value="blog" checked>
							<div class="intel-card-content">
								<span class="icon">✍️</span><br><strong>Blog / Content</strong>
							</div>
						</label>
						<label class="intel-option-card">
							<input type="radio" name="site_type" value="ecommerce">
							<div class="intel-card-content">
								<span class="icon">🛒</span><br><strong>Ecommerce Store</strong>
							</div>
						</label>
						<label class="intel-option-card">
							<input type="radio" name="site_type" value="local">
							<div class="intel-card-content">
								<span class="icon">📍</span><br><strong>Local Business</strong>
							</div>
						</label>
						<label class="intel-option-card">
							<input type="radio" name="site_type" value="saas">
							<div class="intel-card-content">
								<span class="icon">💻</span><br><strong>SaaS / Software</strong>
							</div>
						</label>
						<label class="intel-option-card">
							<input type="radio" name="site_type" value="agency">
							<div class="intel-card-content">
								<span class="icon">🏢</span><br><strong>Agency</strong>
							</div>
						</label>
					</div>
					<div style="margin-top:32px; display:flex; justify-content:space-between;">
						<button type="button" class="sc-btn sc-btn-outline intel-prev">&larr; Back</button>
						<button type="button" class="sc-btn sc-btn-primary intel-next">Next Step &rarr;</button>
					</div>
				</div>

				<!-- Step 3: Niche -->
				<div class="intel-step" id="step-3" style="display:none;">
					<h2 style="font-size:24px; color:var(--sc-dark); margin:0 0 24px 0;">What's your niche?</h2>
					<input type="text" name="niche" class="sc-form-control" placeholder="e.g. Health & Fitness, Tech Reviews, Fashion..." style="font-size:16px; padding:12px; width:100%; max-width:400px; margin:0 auto; display:block;">
					
					<div style="margin-top:32px; display:flex; justify-content:space-between;">
						<button type="button" class="sc-btn sc-btn-outline intel-prev">&larr; Back</button>
						<div>
							<button type="button" class="sc-btn sc-btn-outline intel-next" style="margin-right:8px; border:none;">Skip</button>
							<button type="button" class="sc-btn sc-btn-primary intel-next">Next Step &rarr;</button>
						</div>
					</div>
				</div>

				<!-- Step 4: Experience -->
				<div class="intel-step" id="step-4" style="display:none;">
					<h2 style="font-size:24px; color:var(--sc-dark); margin:0 0 24px 0;">What's your SEO experience?</h2>
					<div class="intel-options-list" style="max-width:400px; margin:0 auto; text-align:left;">
						<label class="intel-list-card">
							<input type="radio" name="experience_level" value="beginner" checked>
							<div class="intel-card-content row-layout">
								<span class="icon">🌱</span>
								<div>
									<strong>Beginner</strong><br>
									<span style="font-size:12px; color:var(--sc-grey);">I'm just starting out</span>
								</div>
							</div>
						</label>
						<label class="intel-list-card">
							<input type="radio" name="experience_level" value="intermediate">
							<div class="intel-card-content row-layout">
								<span class="icon">📈</span>
								<div>
									<strong>Intermediate</strong><br>
									<span style="font-size:12px; color:var(--sc-grey);">I know the basics well</span>
								</div>
							</div>
						</label>
						<label class="intel-list-card">
							<input type="radio" name="experience_level" value="advanced">
							<div class="intel-card-content row-layout">
								<span class="icon">🚀</span>
								<div>
									<strong>Advanced</strong><br>
									<span style="font-size:12px; color:var(--sc-grey);">I live and breathe SEO</span>
								</div>
							</div>
						</label>
					</div>
					<div style="margin-top:32px; display:flex; justify-content:space-between;">
						<button type="button" class="sc-btn sc-btn-outline intel-prev">&larr; Back</button>
						<button type="button" class="sc-btn sc-btn-primary intel-next">Next Step &rarr;</button>
					</div>
				</div>

				<!-- Step 5: Goal -->
				<div class="intel-step" id="step-5" style="display:none;">
					<h2 style="font-size:24px; color:var(--sc-dark); margin:0 0 24px 0;">What's your #1 goal?</h2>
					<div class="intel-options-list" style="max-width:400px; margin:0 auto; text-align:left;">
						<label class="intel-list-card">
							<input type="radio" name="main_goal" value="traffic" checked>
							<div class="intel-card-content row-layout">
								<span class="icon">🚦</span>
								<div><strong>More organic traffic</strong></div>
							</div>
						</label>
						<label class="intel-list-card">
							<input type="radio" name="main_goal" value="conversions">
							<div class="intel-card-content row-layout">
								<span class="icon">💰</span>
								<div><strong>More sales/conversions</strong></div>
							</div>
						</label>
						<label class="intel-list-card">
							<input type="radio" name="main_goal" value="competitors">
							<div class="intel-card-content row-layout">
								<span class="icon">🏆</span>
								<div><strong>Beat my competitors</strong></div>
							</div>
						</label>
					</div>
					<div style="margin-top:32px; display:flex; justify-content:space-between;">
						<button type="button" class="sc-btn sc-btn-outline intel-prev">&larr; Back</button>
						<button type="submit" class="sc-btn sc-btn-primary" id="btn-finish-onboarding">Finish Setup &rarr;</button>
					</div>
				</div>
			</form>

		</div>
	</div>
	<?php endif; ?>

	<!-- ==========================================
	     MAIN HUB (Visible after onboarding)
	     ========================================== -->
	<div id="intel-main-hub" style="display: <?php echo $is_onboarded ? 'block' : 'none'; ?>;">
		
		<!-- Header -->
		<div class="sc-page-header" style="margin-bottom:0; border-bottom:none; padding-bottom:12px;">
			<div class="sc-header-left">
				<span class="sc-header-icon" style="background:#EEF2FF; color:#4F46E5;">🧠</span>
				<div>
					<h1 class="wp-heading-inline">Intelligence Hub</h1>
					<p class="sc-header-subtitle">Your personalized SEO knowledge feed — curated by AI.</p>
				</div>
			</div>
			<div class="sc-header-right">
				<button id="btn-generate-ai-tip" class="sc-btn sc-btn-outline" style="margin-right:8px;"><span class="dashicons dashicons-superhero"></span> Force AI Tip</button>
				<button id="btn-edit-preferences" class="sc-btn sc-btn-outline"><span class="dashicons dashicons-admin-generic"></span> Preferences</button>
			</div>
		</div>

		<!-- Personalization Bar -->
		<div class="intel-personalization-bar">
			Showing content for: 
			<span class="intel-pill"><?php echo esc_html( ucfirst( $profile['site_type'] ?? 'blog' ) ); ?></span>
			<span class="intel-pill"><?php echo esc_html( ucfirst( $profile['experience_level'] ?? 'beginner' ) ); ?></span>
			<span class="intel-pill">Goal: <?php echo esc_html( ucfirst( $profile['main_goal'] ?? 'traffic' ) ); ?></span>
		</div>

		<!-- AI Weekly Tip Highlight (If exists) -->
		<?php
		global $wpdb;
		$tip = $wpdb->get_row( "SELECT * FROM {$wpdb->prefix}seo_copilot_intelligence WHERE content_type='tip' AND is_featured=1 ORDER BY created_at DESC LIMIT 1" );
		if ( $tip ) : 
			// Check if action link
			$feat = $tip->action_feature;
			$target = '#';
			if($feat) {
				if($feat == 'post-editor') $target = admin_url('edit.php');
				else $target = admin_url('admin.php?page=' . $feat);
			}
		?>
		<div class="intel-weekly-tip">
			<div style="font-size:12px; font-weight:700; opacity:0.8; margin-bottom:8px; letter-spacing:1px;">✨ YOUR PERSONALIZED TIP THIS WEEK</div>
			<div style="font-size:16px; line-height:1.5; margin-bottom:16px;">
				"<?php echo esc_html($tip->summary); ?>"
			</div>
			<div style="display:flex; gap:12px;">
				<button class="sc-btn sc-btn-sm intel-btn-read-more" style="background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); color:white;" data-id="<?php echo esc_attr($tip->id); ?>">Read Strategy</button>
				<?php if($feat) : ?>
					<a href="<?php echo esc_url($target); ?>" class="sc-btn sc-btn-sm" style="background:white; color:#4F46E5; border:none;"><?php echo esc_html($tip->action_label); ?> &rarr;</a>
				<?php endif; ?>
			</div>
		</div>
		<?php endif; ?>

		<!-- Featured Cards -->
		<?php if ( ! empty($featured) ) : ?>
		<div class="intel-featured-grid" style="margin-bottom: 32px;">
			<?php foreach ( $featured as $f ) : 
				$color_var = get_intel_badge_color($f->content_type);
			?>
			<div class="intel-card intel-card-featured">
				<div class="intel-card-badge-row">
					<span class="sc-badge" style="background:var(<?php echo $color_var; ?>); color:white; text-transform:uppercase; font-size:11px;"><?php echo esc_html($f->content_type); ?></span>
					<span class="sc-badge" style="background:#fef3c7; color:#d97706; text-transform:uppercase; font-size:11px;">⭐ Featured</span>
				</div>
				<h3 class="intel-card-title"><?php echo esc_html($f->title); ?></h3>
				<p class="intel-card-summary"><?php echo esc_html($f->summary); ?></p>
				<div class="intel-card-actions">
					<button class="sc-btn sc-btn-primary sc-btn-sm intel-btn-read-more" data-id="<?php echo esc_attr($f->id); ?>">Read Now</button>
					<button class="intel-icon-btn intel-btn-bookmark" data-id="<?php echo esc_attr($f->id); ?>" title="Bookmark">🔖</button>
				</div>
			</div>
			<?php endforeach; ?>
		</div>
		<?php endif; ?>

		<!-- Tabs -->
		<div class="intel-tabs-wrapper">
			<ul class="intel-tabs">
				<li><a href="#" class="intel-tab active" data-type="all">All Content</a></li>
				<li><a href="#" class="intel-tab" data-type="playbook">Playbooks</a></li>
				<li><a href="#" class="intel-tab" data-type="tip">Quick Tips</a></li>
				<li><a href="#" class="intel-tab" data-type="market_research">Market Research</a></li>
				<li><a href="#" class="intel-tab" data-type="template">Templates</a></li>
				<li><a href="#" class="intel-tab" data-type="case_study">Case Studies</a></li>
				<li><a href="#" class="intel-tab intel-tab-bookmarks" data-type="bookmarks">🔖 Bookmarked</a></li>
			</ul>
		</div>

		<!-- Masonry Feed -->
		<div class="intel-masonry-feed" id="intel-feed-container">
			<div class="sc-empty-state sc-card" style="grid-column: 1 / -1; min-height:200px; display:flex; align-items:center; justify-content:center;">
				<div class="spinner is-active" style="float:none; margin:0;"></div>
			</div>
		</div>

	</div>

</div>

<!-- ==========================================
     RIGHT SIDE SLIDING DRAWER
     ========================================== -->
<div class="intel-drawer-overlay" id="intel-drawer-overlay" style="display:none;"></div>
<div class="intel-drawer" id="intel-drawer">
	<div class="intel-drawer-header">
		<div class="intel-drawer-badges" id="drawer-badges"></div>
		<button class="intel-drawer-close" id="drawer-close">&times;</button>
	</div>
	<div class="intel-drawer-body">
		<h1 id="drawer-title" style="margin: 0 0 16px 0; font-size: 28px; line-height: 1.3; color: var(--sc-dark);"></h1>
		<div style="display:flex; gap:16px; color:var(--sc-grey); font-size:13px; margin-bottom:24px; border-bottom:1px solid var(--sc-border); padding-bottom:16px;">
			<span>👁 <span id="drawer-views">0</span> views</span>
			<span>👍 <span id="drawer-helpful">0</span> found helpful</span>
			<span id="drawer-date"></span>
		</div>
		
		<div id="drawer-content" class="intel-rendered-content" style="font-size:15px; line-height:1.7; color:#3c434a;"></div>
		
		<div id="drawer-premium-lock" style="display:none; text-align:center; padding:40px 20px; background:#f8f9fa; border:1px solid #e2e4e7; border-radius:8px; margin-top:20px;">
			<div style="font-size:32px; margin-bottom:16px;">🔒</div>
			<h3 style="margin:0 0 8px 0;">Pro Content</h3>
			<p style="margin:0 0 16px 0; color:var(--sc-grey);">Upgrade to Pro to access full market research reports, advanced playbooks, and exclusive case studies.</p>
			<button class="sc-btn sc-btn-primary">Upgrade to Pro</button>
		</div>

		<div class="intel-drawer-actions" style="margin-top:40px; border-top:1px solid var(--sc-border); padding-top:24px; display:flex; justify-content:space-between; align-items:center;">
			<div style="display:flex; gap:12px;">
				<button class="sc-btn sc-btn-outline intel-btn-helpful-drawer" id="drawer-btn-helpful"><span class="icon">👍</span> Helpful</button>
				<button class="sc-btn sc-btn-outline intel-btn-bookmark-drawer" id="drawer-btn-bookmark"><span class="icon">🔖</span> Save</button>
			</div>
			<div id="drawer-action-link-container"></div>
		</div>
	</div>
</div>

<script>
jQuery(document).ready(function($) {

	// ------------------------------------------------------------------------
	// ONBOARDING WIZARD LOGIC
	// ------------------------------------------------------------------------
	var currentStep = 1;
	
	$('.intel-next').on('click', function() {
		if(currentStep < 5) {
			$('#step-' + currentStep).fadeOut(200, function() {
				currentStep++;
				$('#step-' + currentStep).fadeIn(200);
				$('.step-dot').removeClass('active');
				$('.step-dot[data-step="'+currentStep+'"]').addClass('active');
			});
		}
	});

	$('.intel-prev').on('click', function() {
		if(currentStep > 1) {
			$('#step-' + currentStep).fadeOut(200, function() {
				currentStep--;
				$('#step-' + currentStep).fadeIn(200);
				$('.step-dot').removeClass('active');
				$('.step-dot[data-step="'+currentStep+'"]').addClass('active');
			});
		}
	});

	// Selectable Cards Logic
	$('.intel-option-card').on('click', function() {
		$('.intel-option-card').removeClass('selected');
		$(this).addClass('selected');
		$(this).find('input').prop('checked', true);
	});
	$('.intel-list-card').on('click', function() {
		$(this).siblings().removeClass('selected');
		$(this).addClass('selected');
		$(this).find('input').prop('checked', true);
	});
	// Init initial selections
	$('.intel-option-card input:checked').parent().addClass('selected');
	$('.intel-list-card input:checked').parent().addClass('selected');

	$('#intel-onboarding-form').on('submit', function(e) {
		e.preventDefault();
		var btn = $('#btn-finish-onboarding');
		btn.text('Saving...').prop('disabled', true);

		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_save_onboarding',
			nonce: seoCopilotAdmin.nonce,
			site_type: $('input[name="site_type"]:checked').val(),
			niche: $('input[name="niche"]').val(),
			experience_level: $('input[name="experience_level"]:checked').val(),
			main_goal: $('input[name="main_goal"]:checked').val()
		}, function(res) {
			if(res.success) {
				location.reload(); // Reload to show hub
			} else {
				alert('Error saving preferences');
				btn.text('Finish Setup').prop('disabled', false);
			}
		});
	});

	$('#btn-edit-preferences').on('click', function() {
		$('#intel-main-hub').hide();
		$('#intel-onboarding-overlay').fadeIn();
		currentStep = 1;
		$('.intel-step').hide();
		$('#step-1').show();
		$('.step-dot').removeClass('active');
		$('.step-dot[data-step="1"]').addClass('active');
	});

	// ------------------------------------------------------------------------
	// FEED RENDERING
	// ------------------------------------------------------------------------
	
	const premiumStatus = 0; // Simulate free tier check

	function loadFeed(type) {
		var container = $('#intel-feed-container');
		container.html('<div class="sc-empty-state sc-card" style="grid-column: 1 / -1; min-height:200px; display:flex; align-items:center; justify-content:center;"><div class="spinner is-active" style="float:none; margin:0;"></div></div>');

		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_get_intel_feed',
			nonce: seoCopilotAdmin.nonce,
			feed_type: type
		}, function(res) {
			if(res.success) {
				renderCards(res.data, type);
			} else {
				container.html('<div class="sc-empty-state sc-card" style="grid-column: 1 / -1;">Error loading feed.</div>');
			}
		});
	}

	function renderCards(data, activeType) {
		var container = $('#intel-feed-container');
		container.empty();

		if (data.length === 0) {
			var msg = activeType === 'bookmarks' ? '🔖 No bookmarks yet. Save content to read later.' : '📭 No content in this category yet.';
			container.html('<div class="sc-empty-state sc-card" style="grid-column: 1 / -1; padding:40px;"><h4>'+msg+'</h4><p>Check back soon — new content is added weekly.</p></div>');
			return;
		}

		var html = '';
		$.each(data, function(i, item) {
			var isPro = item.is_premium == 1 && premiumStatus == 0;
			
			// Colors
			var typeColors = {
				'playbook': '--sc-intel-playbook',
				'tip': '--sc-intel-tip',
				'market_research': '--sc-intel-research',
				'template': '--sc-intel-template',
				'case_study': '--sc-intel-case-study',
			};
			var cColor = typeColors[item.content_type] || '--sc-primary';

			var skillMap = {
				'beginner': { color:'#008a20', text:'BEGINNER' },
				'intermediate': { color:'#dba617', text:'INTERMEDIATE' },
				'advanced': { color:'#d63638', text:'ADVANCED' },
				'all': { color:'#646970', text:'ALL LEVELS' }
			};
			var skill = skillMap[item.skill_level] || skillMap['all'];

			var bookMarkIcon = item.is_bookmarked ? '🔖 Saved' : '🔖 Save';
			var bookMarkClass = item.is_bookmarked ? 'active' : '';

			html += '<div class="intel-card">';
			html += '  <div class="intel-card-badge-row">';
			html += '    <div>';
			html += '      <span class="sc-badge" style="background:var('+cColor+'); color:white; text-transform:uppercase; font-size:10px; margin-right:4px;">'+item.content_type.replace('_',' ')+'</span>';
			html += '      <span class="sc-badge" style="background:transparent; border:1px solid '+skill.color+'; color:'+skill.color+'; font-size:10px;">'+skill.text+'</span>';
			if(item.is_premium == 1) html += ' <span class="sc-badge sc-badge-danger" style="font-size:10px;">🔒 PRO</span>';
			html += '    </div>';
			html += '  </div>';
			html += '  <h3 class="intel-card-title">'+item.title+'</h3>';

			if(isPro) {
				html += '  <p class="intel-card-summary" style="filter:blur(4px); user-select:none;">'+item.summary+item.summary+'</p>';
				html += '  <div style="position:absolute; top:40%; left:10%; right:10%; text-align:center; background:rgba(255,255,255,0.9); padding:16px; border-radius:8px; border:1px solid #e2e4e7; z-index:2;">';
				html += '    <h4 style="margin:0 0 8px 0;">🔒 Pro Exclusive</h4>';
				html += '    <a href="#" class="sc-btn sc-btn-primary sc-btn-sm" style="width:100%;">Upgrade</a>';
				html += '  </div>';
			} else {
				html += '  <p class="intel-card-summary">'+item.summary+'</p>';
			}

			html += '  <div class="intel-card-stats" style="color:var(--sc-grey); font-size:11px; margin-bottom:16px;">';
			html += '    <span style="margin-right:12px;">👁 '+item.view_count+' views</span>';
			html += '    <span><span class="intel-stat-helpful-'+item.id+'">👍 ' + item.helpful_count + '</span> helpful</span>';
			html += '  </div>';

			html += '  <div class="intel-card-actions" style="margin-top:auto; padding-top:16px; border-top:1px solid var(--sc-border); display:flex; justify-content:space-between;">';
			if(isPro) {
				html += '    <button class="sc-btn sc-btn-outline sc-btn-sm" disabled>Read More</button>';
			} else {
				html += '    <button class="sc-btn sc-btn-primary sc-btn-sm intel-btn-read-more" data-id="'+item.id+'">Read More</button>';
			}
			html += '    <div style="display:flex; gap:8px;">';
			html += '      <button class="intel-icon-btn intel-btn-bookmark '+bookMarkClass+'" data-id="'+item.id+'" title="Bookmark">'+bookMarkIcon+'</button>';
			html += '      <button class="intel-icon-btn intel-btn-helpful" data-id="'+item.id+'" title="Mark Helpful">👍</button>';
			html += '    </div>';
			html += '  </div>';

			html += '</div>';
		});

		container.html(html);
	}

	// Tabs
	$('.intel-tab').on('click', function(e) {
		e.preventDefault();
		$('.intel-tab').removeClass('active');
		$(this).addClass('active');
		var type = $(this).data('type');
		loadFeed(type);
	});

	// If onboarded, load initial feed
	if ($('#intel-main-hub').is(':visible')) {
		loadFeed('all');
	}

	// ------------------------------------------------------------------------
	// INTERACTIONS
	// ------------------------------------------------------------------------

	// Bookmark
	$(document).on('click', '.intel-btn-bookmark', function() {
		var btn = $(this);
		var id = btn.data('id');
		btn.css('opacity', 0.5);

		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_bookmark_intel',
			nonce: seoCopilotAdmin.nonce,
			intel_id: id
		}, function(res) {
			btn.css('opacity', 1);
			if(res.success) {
				if(res.data.is_bookmarked) {
					btn.addClass('active').html('🔖 Saved');
				} else {
					btn.removeClass('active').html('🔖 Save');
					// If we are currently on the bookmarks tab, remove card visually
					if($('.intel-tab[data-type="bookmarks"]').hasClass('active')) {
						btn.closest('.intel-card').fadeOut();
					}
				}
			}
		});
	});

	// Helpful
	$(document).on('click', '.intel-btn-helpful', function() {
		var btn = $(this);
		var id = btn.data('id');
		
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_mark_helpful',
			nonce: seoCopilotAdmin.nonce,
			intel_id: id
		}, function(res) {
			if(res.success) {
				btn.addClass('active').css('background', '#e5f6e8').css('color', '#008a20');
				$('.intel-stat-helpful-'+id).html('👍 ' + res.data.helpful_count);
			} else {
				alert(res.data); // e.g. "Already voted"
			}
		});
	});

	// Drawer Logic
	$(document).on('click', '.intel-btn-read-more', function() {
		var btn = $(this);
		var id = btn.data('id');
		
		var ogText = btn.text();
		btn.text('...').prop('disabled', true);

		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_get_intel_content',
			nonce: seoCopilotAdmin.nonce,
			intel_id: id
		}, function(res) {
			btn.text(ogText).prop('disabled', false);
			
			if(res.success) {
				var data = res.data;
				
				// Populate Drawer
				$('#drawer-title').text(data.title);
				
				// Basic Markdown to HTML parsing logic for simple displays
				var contentBody = data.content
					.replace(/\n\n/g, '</p><p>')
					.replace(/\n/g, '<br>')
					.replace(/## (.*?)<br>/g, '<h2 style="margin-top:24px; color:var(--sc-dark);">$1</h2>')
					.replace(/\*(.*?)\*/g, '<strong>$1</strong>')
					.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
				
				contentBody = '<p>' + contentBody + '</p>';
				$('#drawer-content').html(contentBody);

				$('#drawer-views').text(data.view_count);
				$('#drawer-helpful').text(data.helpful_count);
				
				// Badges
				var badgesHtml = '<span class="sc-badge" style="background:var('+getBadgeColor(data.content_type)+'); color:white; text-transform:uppercase;">'+data.content_type.replace('_',' ')+'</span>';
				$('#drawer-badges').html(badgesHtml);

				// Action Button
				if(data.action_feature && data.action_label) {
					var url = '#';
					if(data.action_feature == 'post-editor') url = seoCopilotAdmin.adminUrl + 'edit.php';
					else url = seoCopilotAdmin.adminUrl + 'admin.php?page=' + data.action_feature;

					$('#drawer-action-link-container').html('<a href="'+url+'" class="sc-btn sc-btn-primary">'+data.action_label+' &rarr;</a>');
				} else {
					$('#drawer-action-link-container').empty();
				}

				// Setup action buttons inside drawer passing the ID
				$('#drawer-btn-bookmark').off('click').on('click', function() {
					$('.intel-btn-bookmark[data-id="'+data.id+'"]').click(); 
					$(this).addClass('active').text('🔖 Saved').css('background','#f0f0f1');
				});
				$('#drawer-btn-helpful').off('click').on('click', function() {
					$('.intel-btn-helpful[data-id="'+data.id+'"]').click();
					$(this).addClass('active').css('background','#e5f6e8').css('color','#008a20');
				});

				// Show drawer
				$('#intel-drawer-overlay').fadeIn(200);
				$('#intel-drawer').addClass('open');
			}
		});
	});

	function getBadgeColor(type) {
		var colors = {
			'playbook': '--sc-intel-playbook',
			'tip': '--sc-intel-tip',
			'market_research': '--sc-intel-research',
			'template': '--sc-intel-template',
			'case_study': '--sc-intel-case-study',
		};
		return colors[type] || '--sc-primary';
	}

	// Close drawer
	$('#drawer-close, #intel-drawer-overlay').on('click', function() {
		$('#intel-drawer').removeClass('open');
		$('#intel-drawer-overlay').fadeOut(200);
	});

	// Force AI Tip Gen (Debugging/Demo)
	$('#btn-generate-ai-tip').on('click', function() {
		var btn = $(this);
		btn.text('Generating...').prop('disabled', true);
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_generate_weekly_tip',
			nonce: seoCopilotAdmin.nonce
		}, function(res) {
			alert(res.data);
			location.reload();
		});
	});

});
</script>
