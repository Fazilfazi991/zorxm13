<?php
/**
 * Cannibalization View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

global $wpdb;
$table = $wpdb->prefix . 'seo_copilot_conflicts';

// Safe check if table exists (in case viewing before activation ran)
$table_exists = $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table ) ) === $table;

$conflicts = [];
if ( $table_exists ) {
	$conflicts = $wpdb->get_results( "SELECT * FROM $table ORDER BY conflict_score DESC" );
}
$count = count( $conflicts );

$last_scan = get_option( 'seo_copilot_last_conflict_scan' );
$scan_date = $last_scan ? date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $last_scan ) ) : __( 'Never', 'seo-copilot' );

function seo_copilot_get_severity_class( $score ) {
	$score = intval( $score );
	if ( $score >= 90 ) return 'critical text-red';
	if ( $score >= 70 ) return 'high text-orange';
	if ( $score >= 50 ) return 'medium text-orange';
	return 'low text-default';
}

function seo_copilot_get_severity_label( $score ) {
	$score = intval( $score );
	if ( $score >= 90 ) return __( 'Critical', 'seo-copilot' );
	if ( $score >= 70 ) return __( 'High', 'seo-copilot' );
	if ( $score >= 50 ) return __( 'Medium', 'seo-copilot' );
	return __( 'Low', 'seo-copilot' );
}

?>

<div class="wrap seo-copilot-page">
	
	<!-- Page Header -->
	<div class="sc-page-header">
		<div class="sc-page-header-left">
			<div class="sc-page-icon">⚔️</div>
			<div>
				<h1 class="sc-page-title"><?php esc_html_e( 'Keyword Conflicts', 'seo-copilot' ); ?><?php if ( $count > 0 ) : ?> <span class="sc-badge sc-badge-danger" style="font-size:13px;vertical-align:middle;"><?php echo esc_html( $count ); ?></span><?php endif; ?></h1>
				<p class="sc-page-subtitle"><?php printf( esc_html__( 'Find posts competing against each other for the same keywords · Last scan: %s', 'seo-copilot' ), esc_html( $scan_date ) ); ?></p>
			</div>
		</div>
		<div class="sc-page-header-right">
			<button class="sc-btn sc-btn-primary" id="btn-scan-conflicts">
				<span class="dashicons dashicons-search"></span> <?php esc_html_e( 'Scan for Conflicts', 'seo-copilot' ); ?>
			</button>
		</div>
	</div>

	<!-- Conditional Tip Box -->
	<?php if ( $count > 0 ) : ?>
		<div class="sc-tip-box sc-tip-warning">
			<span class="sc-tip-icon">⚠️</span>
			<div class="sc-tip-text">
				<strong><?php esc_html_e( 'Action Required', 'seo-copilot' ); ?></strong>
				<?php esc_html_e( 'Keyword cannibalization splits your SEO authority. Use "Get AI Recommendation" to find out which post to keep, which to redirect, and which to rewrite.', 'seo-copilot' ); ?>
			</div>
		</div>
	<?php else : ?>
		<div class="sc-tip-box sc-tip-success">
			<span class="sc-tip-icon">✅</span>
			<div class="sc-tip-text">
				<strong><?php esc_html_e( 'No Conflicts Detected', 'seo-copilot' ); ?></strong>
				<?php esc_html_e( 'Great! Run a scan after publishing new content to make sure new posts don\'t compete with existing ones.', 'seo-copilot' ); ?>
			</div>
		</div>
	<?php endif; ?>

	<?php if ( $count > 0 ) : ?>
		
		<div class="seo-copilot-conflicts-list">
			
			<?php foreach ( $conflicts as $conflict ) : 
				$post_1 = get_post( $conflict->post_id_1 );
				$post_2 = get_post( $conflict->post_id_2 );
				if ( ! $post_1 || ! $post_2 ) continue;

				$s1 = get_post_meta( $post_1->ID, '_seo_copilot_score', true );
				$s2 = get_post_meta( $post_2->ID, '_seo_copilot_score', true );
				
				$kw1 = get_post_meta( $post_1->ID, '_seo_copilot_focus_keyword', true );
				$kw2 = get_post_meta( $post_2->ID, '_seo_copilot_focus_keyword', true );
				
				$existing_rec = json_decode( $conflict->recommendation, true );
			?>
				<div class="seo-copilot-card conflict-card" id="conflict-<?php echo esc_attr( $conflict->id ); ?>">
					
					<div class="conflict-header">
						<div class="conflict-severity <?php echo seo_copilot_get_severity_class( $conflict->conflict_score ); ?>">
							<?php echo seo_copilot_get_severity_label( $conflict->conflict_score ); ?> <?php esc_html_e( 'Conflict', 'seo-copilot' ); ?>
						</div>
						<div class="conflict-keyword">
							<?php esc_html_e( 'Keyword Overlap:', 'seo-copilot' ); ?> <strong><?php echo esc_html( $conflict->shared_keyword ); ?></strong>
						</div>
					</div>

					<div class="conflict-vs-layout">
						
						<!-- POST A -->
						<div class="conflict-side side-a">
							<div class="side-badge">Post A</div>
							<h3 class="side-title"><a href="<?php echo esc_url( get_edit_post_link( $post_1->ID ) ); ?>" target="_blank"><?php echo esc_html( $post_1->post_title ); ?></a></h3>
							<div class="side-meta">
								<span class="meta-item"><?php esc_html_e( 'Score:', 'seo-copilot' ); ?> <strong><?php echo $s1 ? intval( $s1 ) : '&mdash;'; ?></strong></span>
								<span class="meta-item"><?php esc_html_e( 'Keyword:', 'seo-copilot' ); ?> <strong><?php echo esc_html( $kw1 ?: 'N/A' ); ?></strong></span>
							</div>
							<a href="<?php echo esc_url( get_edit_post_link( $post_1->ID ) ); ?>" class="seo-copilot-btn secondary wide" target="_blank"><?php esc_html_e( 'Edit Post A', 'seo-copilot' ); ?></a>
						</div>

						<!-- VS DIVIDER -->
						<div class="conflict-divider">
							<div class="vs-circle">VS</div>
						</div>

						<!-- POST B -->
						<div class="conflict-side side-b">
							<div class="side-badge">Post B</div>
							<h3 class="side-title"><a href="<?php echo esc_url( get_edit_post_link( $post_2->ID ) ); ?>" target="_blank"><?php echo esc_html( $post_2->post_title ); ?></a></h3>
							<div class="side-meta">
								<span class="meta-item"><?php esc_html_e( 'Score:', 'seo-copilot' ); ?> <strong><?php echo $s2 ? intval( $s2 ) : '&mdash;'; ?></strong></span>
								<span class="meta-item"><?php esc_html_e( 'Keyword:', 'seo-copilot' ); ?> <strong><?php echo esc_html( $kw2 ?: 'N/A' ); ?></strong></span>
							</div>
							<a href="<?php echo esc_url( get_edit_post_link( $post_2->ID ) ); ?>" class="seo-copilot-btn secondary wide" target="_blank"><?php esc_html_e( 'Edit Post B', 'seo-copilot' ); ?></a>
						</div>

					</div>

					<!-- AI Panel -->
					<div class="conflict-ai-panel">
						<?php if ( $existing_rec ) : ?>
							<div class="ai-recommendation loaded">
								<h4><?php esc_html_e( 'AI Recommendation', 'seo-copilot' ); ?></h4>
								<div class="ai-rec-grid">
									<div><strong><?php esc_html_e( 'Recommended Action:', 'seo-copilot' ); ?></strong> <span style="text-transform:uppercase;color:#d63638;font-weight:bold;"><?php echo esc_html( $existing_rec['action'] ?? '' ); ?></span></div>
									<?php if(isset($existing_rec['winner'])) : ?>
										<div><strong><?php esc_html_e( 'Winner:', 'seo-copilot' ); ?></strong> <?php echo esc_html( get_the_title( $existing_rec['winner'] ) ); ?></div>
									<?php endif; ?>
								</div>
								<p style="margin-top:12px;"><strong><?php esc_html_e( 'Reasoning:', 'seo-copilot' ); ?></strong> <?php echo esc_html( $existing_rec['reason'] ?? '' ); ?></p>
								<?php if(isset($existing_rec['rewrite_suggestion'])) : ?>
									<p><strong><?php esc_html_e( 'Rewrite Hint:', 'seo-copilot' ); ?></strong> <?php echo esc_html( $existing_rec['rewrite_suggestion'] ); ?></p>
								<?php endif; ?>
							</div>
						<?php else : ?>
							<div class="ai-recommendation-target" id="ai-rec-<?php echo esc_attr( $conflict->id ); ?>">
								<button type="button" class="seo-copilot-btn secondary btn-get-ai-rec" data-id="<?php echo esc_attr( $conflict->id ); ?>">
									<span class="dashicons dashicons-superhero"></span> <?php esc_html_e( 'Get AI Recommendation', 'seo-copilot' ); ?>
								</button>
							</div>
						<?php endif; ?>
					</div>

					<!-- Actions Footer -->
					<div class="conflict-footer">
						<button type="button" class="seo-copilot-btn primary btn-resolve-conflict" data-id="<?php echo esc_attr( $conflict->id ); ?>">
							<span class="dashicons dashicons-yes"></span> <?php esc_html_e( 'Mark Resolved', 'seo-copilot' ); ?>
						</button>
					</div>

				</div>
			<?php endforeach; ?>

		</div>

	<?php else : ?>
		
		<div class="seo-copilot-card">
			<div class="empty-state">
				<div class="empty-icon" style="color:#008a20;"><span class="dashicons dashicons-yes-alt" style="font-size:60px;width:60px;height:60px;"></span></div>
				<h3><?php esc_html_e( 'No keywords conflicts detected.', 'seo-copilot' ); ?></h3>
				<p><?php esc_html_e( 'Your content strategy is solid. Posts are not competing against each other.', 'seo-copilot' ); ?></p>
			</div>
		</div>

	<?php endif; ?>

	<input type="hidden" id="seo_copilot_admin_nonce" value="<?php echo wp_create_nonce( 'seo_copilot_admin_nonce' ); ?>" />

</div>

<style>
/* Cannibalization View Specific Styles */
.conflict-card { padding: 0; display: flex; flex-direction: column; overflow: hidden; margin-bottom: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 12px; }
.conflict-header { background: #f8f9fA; padding: 16px 24px; border-bottom: 1px solid #e2e4e7; display: flex; justify-content: space-between; align-items: center; }
.conflict-severity { font-size: 13px; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; padding: 4px 10px; border-radius: 4px; border: 1px solid currentColor; }
.conflict-keyword { font-size: 14px; background: #fff; padding: 6px 12px; border-radius: 20px; border: 1px solid #dcdcde; }
.conflict-vs-layout { display: flex; background: #fff; position: relative; }
.conflict-side { flex: 1; padding: 32px 40px; }
.side-a { background: linear-gradient(90deg, #fff, #fdfdfd); }
.side-b { background: linear-gradient(270deg, #fff, #fdfdfd); }
.conflict-divider { width: 1px; background: #e2e4e7; position: relative; display: flex; align-items: center; justify-content: center; }
.vs-circle { position: absolute; background: #fff; border: 2px solid #e2e4e7; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #8c8f94; font-size: 14px; z-index: 2; }
.side-badge { font-size: 11px; font-weight: 700; color: #8c8f94; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.side-title { margin: 0 0 16px; font-size: 20px; line-height: 1.4; }
.side-title a { text-decoration: none; color: #1d2327; }
.side-title a:hover { color: #2271b1; }
.side-meta { display: flex; gap: 16px; margin-bottom: 24px; font-size: 13px; color: #646970; }
.conflict-ai-panel { background: #fdfdfd; padding: 24px; border-top: 1px dashed #e2e4e7; text-align: center; }
.ai-recommendation { background: #fff; border: 1px solid #e2e4e7; padding: 20px; border-radius: 8px; text-align: left; font-size: 14px; }
.ai-recommendation h4 { margin: 0 0 16px; font-size: 16px; display: flex; align-items: center; }
.ai-recommendation h4::before { content: "\f521"; font-family: dashicons; color: #8224e3; margin-right: 8px; }
.ai-rec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #fcfcfc; padding: 12px; border-radius: 6px; border: 1px solid #f0f0f1; }
.conflict-footer { background: #f0f0f1; padding: 16px 24px; display: flex; justify-content: flex-end; border-top: 1px solid #e2e4e7; }
.ai-loading-shimmer { width: 100%; height: 100px; background: linear-gradient(90deg, #f0f0f1 25%, #e2e4e7 50%, #f0f0f1 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite linear; border-radius: 8px; }
@media (max-width: 768px) {
	.conflict-vs-layout { flex-direction: column; }
	.conflict-divider { width: 100%; height: 1px; margin: 20px 0; }
}
</style>

<script>
jQuery(document).ready(function($) {

	// Scan 
	$('#btn-scan-conflicts').on('click', function(e) {
		e.preventDefault();
		var $btn = $(this);
		$btn.addClass('loading').prop('disabled', true);
		
		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'seo_copilot_scan_conflicts',
				nonce: $('#seo_copilot_admin_nonce').val()
			},
			success: function(res) {
				if(res.success) {
					alert(res.data.message);
					location.reload();
				} else {
					alert("Scan failed.");
					$btn.removeClass('loading').prop('disabled', false);
				}
			},
			error: function() {
				alert("Server error.");
				$btn.removeClass('loading').prop('disabled', false);
			}
		});
	});

	// AI Recommend
	$('.btn-get-ai-rec').on('click', function(e) {
		e.preventDefault();
		var $btn = $(this);
		var id = $btn.data('id');
		var $target = $('#ai-rec-' + id);
		
		$target.html('<div class="ai-loading-shimmer"></div>');

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'seo_copilot_get_conflict_recommendation',
				nonce: $('#seo_copilot_admin_nonce').val(),
				conflict_id: id
			},
			success: function(res) {
				if(res.success && res.data) {
					// Build UI from JSON
					var h = '<div class="ai-recommendation loaded">';
					h += '<h4>AI Recommendation</h4>';
					h += '<div class="ai-rec-grid">';
					h += '<div><strong>Recommended Action:</strong> <span style="text-transform:uppercase;color:#d63638;font-weight:bold;">' + (res.data.action || 'Unknown') + '</span></div>';
					if(res.data.winner) h += '<div><strong>Winner ID:</strong> ' + res.data.winner + '</div>';
					h += '</div>';
					h += '<p style="margin-top:12px;"><strong>Reasoning:</strong> ' + (res.data.reason || '') + '</p>';
					if(res.data.rewrite_suggestion) h += '<p><strong>Rewrite Hint:</strong> ' + res.data.rewrite_suggestion + '</p>';
					h += '</div>';
					$target.replaceWith(h);
				} else {
					$target.html('<div class="text-red">AI Failed: ' + (res.data || 'Unknown error') + '</div>');
				}
			},
			error: function() {
				$target.html('<div class="text-red">Server error connecting to AI.</div>');
			}
		});
	});

	// Resolve
	$('.btn-resolve-conflict').on('click', function(e) {
		e.preventDefault();
		if(!confirm("Are you sure you want to mark this conflict as resolved? It will be removed from this list.")) return;
		
		var $btn = $(this);
		var id = $btn.data('id');
		$btn.addClass('loading').prop('disabled', true);

		$.ajax({
			url: ajaxurl,
			type: 'POST',
			data: {
				action: 'seo_copilot_resolve_conflict',
				nonce: $('#seo_copilot_admin_nonce').val(),
				conflict_id: id
			},
			success: function(res) {
				if(res.success) {
					$('#conflict-' + id).slideUp(300, function() { $(this).remove(); });
				} else {
					alert("Failed to resolve.");
					$btn.removeClass('loading').prop('disabled', false);
				}
			},
			error: function() {
				alert("Server error.");
				$btn.removeClass('loading').prop('disabled', false);
			}
		});
	});

});
</script>
