<?php
/**
 * E-E-A-T Builder Admin Dashboard
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

$eeat = seo_copilot_eeat_builder();
$score = $eeat->get_score('site', 0);

// Basic baseline check on first load if missing
if ( ! $score ) {
	$score = $eeat->score_site();
}

$issues = is_array($score['issues']) ? $score['issues'] : json_decode($score['issues'], true);
if ( ! is_array($issues) ) $issues = [];

// Group issues by signal natively
$problems = [
	'experience' => [],
	'expertise' => [],
	'authority' => [],
	'trust' => []
];

foreach ($issues as $i) {
	if ( isset($problems[$i['signal']]) ) {
		$problems[$i['signal']][] = $i;
	}
}

$interp = "High risk — algorithm updates will hurt you";
if ( $score['overall_score'] > 40 ) $interp = "Average — room for improvement";
if ( $score['overall_score'] > 60 ) $interp = "Good — building authority";
if ( $score['overall_score'] > 80 ) $interp = "Strong — Google trusts you";

$authors = get_users(['who' => 'authors']);

?>

<div class="wrap seo-copilot-page">
    <div class="sc-page-header">
        <h1>
            <span class="emoji-icon">🏆</span>
            <?php esc_html_e( 'E-E-A-T Authority Builder', 'seo-copilot' ); ?>
        </h1>
        <p class="description"><?php esc_html_e( 'Build the trust signals Google uses to rank experts above everyone else', 'seo-copilot' ); ?></p>
    </div>

    <div class="sc-tip-box" style="margin-bottom: 30px;">
        <span class="dashicons dashicons-shield" style="color:#10B981;"></span>
        <strong>🏆 Google's E-E-A-T framework determines if YOUR site deserves to rank above competitors.</strong>
        <?php esc_html_e('Sites with strong E-E-A-T signals rank higher, recover faster from algorithm updates, and get featured in AI Overviews.', 'seo-copilot'); ?>
    </div>

	<!-- SECTION 1: E-E-A-T SCORE HERO -->
	<div class="sc-card" style="margin-bottom:30px;">
		<div style="display:flex; justify-content:space-between; align-items:center;">
			<div>
				<h2 style="font-size:20px; margin:0 0 10px 0;">Overall E-E-A-T Score</h2>
				<strong style="color:<?php echo $score['overall_score'] >= 80 ? '#10B981' : ($score['overall_score'] >= 60 ? '#F59E0B' : '#EF4444'); ?>; font-size:16px;">
					<?php echo $interp; ?>
				</strong>
			</div>
			<div style="text-align:right;">
				<button class="sc-btn sc-btn-secondary btn-analyze-eeat">Run Fresh Analysis</button>
				<button class="sc-btn sc-btn-primary btn-generate-eeat-plan">✨ Get AI Improvement Plan</button>
			</div>
		</div>

		<div class="sc-progress" style="height:12px; margin:20px 0;"><div class="sc-progress-bar bar-primary" style="width:<?php echo esc_attr($score['overall_score']); ?>%;"></div></div>

		<div style="display:flex; justify-content:space-between; gap:20px;">
			<!-- Exp -->
			<div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
				<div style="font-size:24px; font-weight:bold; color:#4F46E5; margin-bottom:5px;">E</div>
				<div style="font-size:32px; font-weight:900; color:#1e293b; margin-bottom:5px;"><?php echo esc_html($score['experience_score']*4); ?>%</div>
				<div style="font-size:13px; color:#64748b; text-transform:uppercase; font-weight:bold;">Experience</div>
			</div>
			<!-- Ext -->
			<div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
				<div style="font-size:24px; font-weight:bold; color:#4F46E5; margin-bottom:5px;">E</div>
				<div style="font-size:32px; font-weight:900; color:#1e293b; margin-bottom:5px;"><?php echo esc_html($score['expertise_score']*4); ?>%</div>
				<div style="font-size:13px; color:#64748b; text-transform:uppercase; font-weight:bold;">Expertise</div>
			</div>
			<!-- Auth -->
			<div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
				<div style="font-size:24px; font-weight:bold; color:#4F46E5; margin-bottom:5px;">A</div>
				<div style="font-size:32px; font-weight:900; color:#1e293b; margin-bottom:5px;"><?php echo esc_html($score['authority_score']*4); ?>%</div>
				<div style="font-size:13px; color:#64748b; text-transform:uppercase; font-weight:bold;">Authority</div>
			</div>
			<!-- Trust -->
			<div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
				<div style="font-size:24px; font-weight:bold; color:#4F46E5; margin-bottom:5px;">T</div>
				<div style="font-size:32px; font-weight:900; color:#1e293b; margin-bottom:5px;"><?php echo esc_html($score['trust_score']*4); ?>%</div>
				<div style="font-size:13px; color:#64748b; text-transform:uppercase; font-weight:bold;">Trust</div>
			</div>
		</div>

		<div id="eeat-plan-container" style="display:none; margin-top:30px; border-top:1px solid #e2e8f0; padding-top:30px;">
			<h3>Your AI Action Plan</h3>
			<div id="eeat-plan-content"></div>
		</div>
	</div>

	<!-- SECTION 2 & 3: GRIDS -->
	<div style="display:grid; grid-template-columns: 2fr 1fr; gap:30px;">
		
		<!-- SIGNAL BREAKDOWN -->
		<div>
			<h3 style="margin-top:0;">E-E-A-T Signal Breakdown</h3>
			
			<div class="sc-card" style="padding:0; margin-bottom:15px;">
				<div class="sc-dropdown-header" style="padding:15px; cursor:pointer; background:#f8fafc; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0;">
					<strong style="font-size:15px;">EXPERIENCE (<?php echo esc_html($score['experience_score']*4); ?>/100)</strong>
					<span class="dashicons dashicons-arrow-down-alt2"></span>
				</div>
				<div class="sc-dropdown-body" style="display:none; padding:15px;">
					<?php if(empty($problems['experience'])): ?>
						<div style="color:#10B981;">✅ All core experience signals passing correctly.</div>
					<?php else: ?>
						<ul style="list-style:none; margin:0; padding:0;">
							<?php foreach($problems['experience'] as $p): ?>
								<li style="margin-bottom:10px; color:#ef4444;"><span class="dashicons dashicons-no" style="font-size:16px;"></span> <?php echo esc_html($p['desc']); ?></li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</div>
			</div>

			<div class="sc-card" style="padding:0; margin-bottom:15px;">
				<div class="sc-dropdown-header" style="padding:15px; cursor:pointer; background:#f8fafc; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0;">
					<strong style="font-size:15px;">EXPERTISE (<?php echo esc_html($score['expertise_score']*4); ?>/100)</strong>
					<span class="dashicons dashicons-arrow-down-alt2"></span>
				</div>
				<div class="sc-dropdown-body" style="display:none; padding:15px;">
					<?php if(empty($problems['expertise'])): ?>
						<div style="color:#10B981;">✅ All core expertise signals passing correctly.</div>
					<?php else: ?>
						<ul style="list-style:none; margin:0; padding:0;">
							<?php foreach($problems['expertise'] as $p): ?>
								<li style="margin-bottom:10px; color:#ef4444;"><span class="dashicons dashicons-no" style="font-size:16px;"></span> <?php echo esc_html($p['desc']); ?></li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</div>
			</div>

			<div class="sc-card" style="padding:0; margin-bottom:15px;">
				<div class="sc-dropdown-header" style="padding:15px; cursor:pointer; background:#f8fafc; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0;">
					<strong style="font-size:15px;">AUTHORITY (<?php echo esc_html($score['authority_score']*4); ?>/100)</strong>
					<span class="dashicons dashicons-arrow-down-alt2"></span>
				</div>
				<div class="sc-dropdown-body" style="display:none; padding:15px;">
					<?php if(empty($problems['authority'])): ?>
						<div style="color:#10B981;">✅ All core authority signals passing correctly.</div>
					<?php else: ?>
						<ul style="list-style:none; margin:0; padding:0;">
							<?php foreach($problems['authority'] as $p): ?>
								<li style="margin-bottom:10px; color:#ef4444;"><span class="dashicons dashicons-no" style="font-size:16px;"></span> <?php echo esc_html($p['desc']); ?></li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</div>
			</div>

			<div class="sc-card" style="padding:0; margin-bottom:15px;">
				<div class="sc-dropdown-header" style="padding:15px; cursor:pointer; background:#f8fafc; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0;">
					<strong style="font-size:15px;">TRUST (<?php echo esc_html($score['trust_score']*4); ?>/100)</strong>
					<span class="dashicons dashicons-arrow-down-alt2"></span>
				</div>
				<div class="sc-dropdown-body" style="display:none; padding:15px;">
					<?php if(empty($problems['trust'])): ?>
						<div style="color:#10B981;">✅ All core trust signals passing correctly.</div>
					<?php else: ?>
						<ul style="list-style:none; margin:0; padding:0;">
							<?php foreach($problems['trust'] as $p): ?>
								<li style="margin-bottom:10px; color:#ef4444;"><span class="dashicons dashicons-no" style="font-size:16px;"></span> <?php echo esc_html($p['desc']); ?></li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</div>
			</div>
		</div>

		<!-- TRUST PAGES CHECKER -->
		<?php $tp = $eeat->check_trust_pages(); ?>
		<div>
			<h3 style="margin-top:0;">Essential Trust Pages</h3>
			<p style="font-size:13px; color:#64748b;">Missing foundational pages harm site trust.</p>

			<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
				
				<!-- Privacy -->
				<div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:15px;">
					<strong style="display:block; margin-bottom:10px;">Privacy Policy</strong>
					<?php if ( $tp['privacy'] ) : ?>
						<span style="color:#10B981; font-weight:bold; font-size:12px;">✅ Found <br><a href="<?php echo get_permalink($tp['privacy']->ID); ?>" target="_blank" style="font-weight:normal; text-decoration:none;">view page &rarr;</a></span>
					<?php else : ?>
						<span style="color:#ef4444; font-weight:bold; font-size:12px; display:block; margin-bottom:10px;">❌ Missing</span>
						<button class="sc-btn sc-btn-sm btn-create-trust" data-type="privacy">Create</button>
					<?php endif; ?>
				</div>

				<!-- Terms -->
				<div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:15px;">
					<strong style="display:block; margin-bottom:10px;">Terms of Service</strong>
					<?php if ( $tp['terms'] ) : ?>
						<span style="color:#10B981; font-weight:bold; font-size:12px;">✅ Found <br><a href="<?php echo get_permalink($tp['terms']->ID); ?>" target="_blank" style="font-weight:normal; text-decoration:none;">view page &rarr;</a></span>
					<?php else : ?>
						<span style="color:#ef4444; font-weight:bold; font-size:12px; display:block; margin-bottom:10px;">❌ Missing</span>
						<button class="sc-btn sc-btn-sm btn-create-trust" data-type="terms">Create</button>
					<?php endif; ?>
				</div>

				<!-- About -->
				<div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:15px;">
					<strong style="display:block; margin-bottom:10px;">About Page</strong>
					<?php if ( $tp['about'] ) : ?>
						<span style="color:#10B981; font-weight:bold; font-size:12px;">✅ Found <br><a href="<?php echo get_permalink($tp['about']->ID); ?>" target="_blank" style="font-weight:normal; text-decoration:none;">view page &rarr;</a></span>
					<?php else : ?>
						<span style="color:#ef4444; font-weight:bold; font-size:12px; display:block; margin-bottom:10px;">❌ Missing</span>
						<button class="sc-btn sc-btn-sm btn-create-trust" data-type="about">Create</button>
					<?php endif; ?>
				</div>

				<!-- Contact -->
				<div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:15px;">
					<strong style="display:block; margin-bottom:10px;">Contact Page</strong>
					<?php if ( $tp['contact'] ) : ?>
						<span style="color:#10B981; font-weight:bold; font-size:12px;">✅ Found <br><a href="<?php echo get_permalink($tp['contact']->ID); ?>" target="_blank" style="font-weight:normal; text-decoration:none;">view page &rarr;</a></span>
					<?php else : ?>
						<span style="color:#ef4444; font-weight:bold; font-size:12px; display:block; margin-bottom:10px;">❌ Missing</span>
						<button class="sc-btn sc-btn-sm btn-create-trust" data-type="contact">Create</button>
					<?php endif; ?>
				</div>

			</div>
		</div>
	</div>

	<!-- SECTION 4: AUTHOR BIOS -->
	<h3 style="margin-top:40px;">Author Authority Profiles</h3>
	<div class="sc-card">
		<table class="sc-table" style="width:100%; margin:0;">
			<thead>
				<tr>
					<th>Author</th>
					<th>Bio Snippet</th>
					<th>Credentials Found?</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<?php foreach($authors as $a): 
					$desc = get_user_meta($a->ID, 'description', true);
					$has_cred = preg_match('/\b(phd|certified|degree|expert|specialist|professional)\b/i', $desc);
				?>
				<tr>
					<td>
						<strong><?php echo esc_html($a->display_name); ?></strong><br>
						<span style="color:#64748b; font-size:12px;"><?php echo count_user_posts($a->ID); ?> posts published</span>
					</td>
					<td>
						<div style="font-size:13px; color:#475569; max-width:400px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
							<?php echo empty($desc) ? '<em>No bio configured.</em>' : esc_html($desc); ?>
						</div>
					</td>
					<td>
						<?php echo $has_cred ? '<span class="sc-badge sc-badge-success">YES</span>' : '<span class="sc-badge sc-badge-danger">NO</span>'; ?>
					</td>
					<td>
						<button class="sc-btn sc-btn-sm btn-improve-bio" data-id="<?php echo esc_attr($a->ID); ?>">Generate AI Bio</button>
					</td>
				</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>

	<!-- Modal AI BIO -->
	<div id="bio-editor-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99999;">
        <div style="background:#fff; width:500px; margin:100px auto; padding:30px; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
            <h3 style="margin-top:0;">📝 AI Authority Bio Generator</h3>
            <p>We've rewritten this bio to prioritize E-E-A-T signals.</p>
            <textarea id="ai-bio-content" class="large-text" rows="5" style="width:100%; margin-bottom:20px;"></textarea>
			<input type="hidden" id="ai-bio-author-id" value="" />
            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button type="button" class="sc-btn sc-btn-secondary" onclick="jQuery('#bio-editor-modal').hide();">Cancel</button>
                <button type="button" class="sc-btn sc-btn-primary" id="btn-save-ai-bio">Save to Profile</button>
            </div>
        </div>
    </div>

</div>

<script>
jQuery(document).ready(function($) {
	
	$('.sc-dropdown-header').on('click', function(){
		var body = $(this).next('.sc-dropdown-body');
		var arrow = $(this).find('.dashicons');
		
		body.slideToggle(200);
		if(arrow.hasClass('dashicons-arrow-down-alt2')){
			arrow.removeClass('dashicons-arrow-down-alt2').addClass('dashicons-arrow-up-alt2');
		} else {
			arrow.removeClass('dashicons-arrow-up-alt2').addClass('dashicons-arrow-down-alt2');
		}
	});

	$('.btn-analyze-eeat').on('click', function(){
		var btn = $(this);
		btn.prop('disabled', true).text('Analyzing...');
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_analyze_eeat',
			nonce: seoCopilotAdmin.nonce
		}, function(res){
			if(res.success) {
				location.reload();
			} else {
				alert('Analysis failed.');
				btn.prop('disabled', false).text('Run Fresh Analysis');
			}
		});
	});

	$('.btn-generate-eeat-plan').on('click', function(){
		var btn = $(this);
		btn.prop('disabled', true).text('Generating Plan... (Takes approx 15s)');
		
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_get_eeat_plan',
			nonce: seoCopilotAdmin.nonce
		}, function(res){
			btn.prop('disabled', false).text('✨ Get AI Improvement Plan');
			
			if(res.success && res.data.priority_fixes) {
				var html = '';
				$.each(res.data.priority_fixes, function(i, fix){
					html += '<div style="background:#fff; border-left:4px solid #4F46E5; border-radius:4px; padding:15px; margin-bottom:15px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">';
					html += '<div style="display:flex; justify-content:space-between; margin-bottom:5px;">';
					html += '<span style="font-size:11px; font-weight:bold; color:#4F46E5; text-transform:uppercase;">' + fix.signal + ' SIGNAL</span>';
					html += '<span class="sc-badge sc-badge-warning" style="font-size:10px;">IMPACT: ' + fix.impact.toUpperCase() + '</span>';
					html += '</div>';
					html += '<strong style="font-size:16px; display:block; margin-bottom:10px;">' + fix.issue + '</strong>';
					html += '<p style="margin:0 0 10px 0; font-size:14px; color:#475569;"><strong>Fix:</strong> ' + fix.fix + '</p>';
					html += '<div style="background:#f8fafc; padding:10px; font-style:italic; font-size:13px; color:#64748b; border-radius:4px;"><strong>Example:</strong> "' + fix.example + '"</div>';
					html += '</div>';
				});
				$('#eeat-plan-content').html(html);
				$('#eeat-plan-container').slideDown();
			} else {
				alert('Could not parse AI response.');
			}
		});
	});

	$('.btn-create-trust').on('click', function(){
		var btn = $(this);
		var type = btn.data('type');
		btn.prop('disabled', true).text('...');
		
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_create_trust_page',
			nonce: seoCopilotAdmin.nonce,
			page_type: type
		}, function(res){
			if(res.success){
				window.open(res.data.edit_url, '_blank');
				location.reload();
			} else {
				alert('Failed to create page draft.');
				btn.prop('disabled', false).text('Create');
			}
		});
	});

	$('.btn-improve-bio').on('click', function(){
		var btn = $(this);
		var id = btn.data('id');
		btn.prop('disabled', true).text('Gen...');
		
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_generate_author_bio',
			nonce: seoCopilotAdmin.nonce,
			author_id: id
		}, function(res){
			btn.prop('disabled', false).text('Generate AI Bio');
			if(res.success){
				$('#ai-bio-content').val(res.data.bio);
				$('#ai-bio-author-id').val(id);
				$('#bio-editor-modal').show();
			} else {
				alert('Failed to generate.');
			}
		});
	});

	$('#btn-save-ai-bio').on('click', function(){
		var txt = $('#ai-bio-content').val();
		var id = $('#ai-bio-author-id').val();
		var btn = $(this);
		btn.prop('disabled', true).text('Saving...');
		
		$.post(seoCopilotAdmin.ajaxUrl, {
			action: 'seo_copilot_apply_author_bio',
			nonce: seoCopilotAdmin.nonce,
			author_id: id,
			bio: txt
		}, function(res){
			if(res.success){
				location.reload();
			}
		});
	});

});
</script>
