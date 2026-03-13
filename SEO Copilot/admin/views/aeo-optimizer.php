<?php
/**
 * AEO Optimizer Dashboard View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

$aeo = seo_copilot_aeo_optimizer();
$summary = $aeo->get_site_aeo_summary();
$quick_ops = $aeo->get_ai_overview_opportunities();

$total_scored = $summary['total_scored'];
$total_published = $summary['total_publish'];

$ai_ready_pct = $total_scored > 0 ? round(($summary['ai_ready'] / $total_scored) * 100) : 0;
$avg_score = $summary['avg_score'];
$not_optimized = $total_scored - $summary['ai_ready'] - $summary['quick_wins_count'];
$not_optimized_pct = $total_scored > 0 ? round(($not_optimized / $total_scored) * 100) : 0;

$ai_ready_color = $ai_ready_pct >= 20 ? '#10B981' : '#F59E0B'; // Green if > 20%
$not_opt_color = $not_optimized_pct > 50 ? '#EF4444' : '#F59E0B';

// General SEO score for comparison
global $wpdb;
$avg_seo = $wpdb->get_var("SELECT AVG(meta_value) FROM {$wpdb->postmeta} WHERE meta_key = '_seo_copilot_score' AND meta_value != ''");
$avg_seo = $avg_seo ? round($avg_seo) : 0;

?>

<div class="wrap seo-copilot-page">
    <div class="sc-page-header">
        <h1>
            <span class="emoji-icon">⚡</span>
            <?php esc_html_e( 'AEO — Answer Engine Optimizer', 'seo-copilot' ); ?>
        </h1>
        <p class="description"><?php esc_html_e( 'Optimize your content to appear in Google AI Overviews and answer engines', 'seo-copilot' ); ?></p>
    </div>

    <div class="sc-tip-box" style="margin-bottom: 30px;">
        <span class="dashicons dashicons-lightbulb" style="color:#d97706;"></span>
        <strong>⚡ <?php esc_html_e('Google AI Overviews now appear on over 40% of searches, pushing organic results down.', 'seo-copilot'); ?></strong>
        <?php esc_html_e('The sites that GET FEATURED in AI Overviews see 20-30% MORE clicks while everyone else loses traffic. This tool optimizes your content to become Google\'s source.', 'seo-copilot'); ?>
    </div>

    <!-- EXPLAINER (Shows if Avg Score < 50) -->
    <?php if ( $avg_score < 50 ) : ?>
    <div class="sc-card" style="margin-bottom: 30px; border-left: 4px solid #4F46E5;">
        <h3 style="margin-top:0; cursor:pointer;" id="aeo-explainer-toggle">
            <?php esc_html_e('What is Answer Engine Optimization? 🤔', 'seo-copilot'); ?>
            <span class="dashicons dashicons-arrow-down-alt2" style="float:right;"></span>
        </h3>
        <div id="aeo-explainer-content" style="display:none; margin-top:20px;">
            <p><strong>Your content is currently written for humans to read. AEO means also writing for AI to extract and cite.</strong></p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:15px;">
                <div style="background:#f8fafc; padding:15px; border-radius:8px;">
                    <h4 style="margin-top:0;">3 Key Principles</h4>
                    <ul style="list-style:disc; margin-left:20px;">
                        <li><strong>Direct answers:</strong> Stop using fluffy intros. Give the exact factual answer in the first 50 words.</li>
                        <li><strong>Question-based structure:</strong> AI models don't guess what "Section 1" means. Use exact questions as H2s.</li>
                        <li><strong>FAQ & Schema:</strong> Feed the AI structured data so it can quickly extract your answers.</li>
                    </ul>
                </div>
                <div style="background:#f0fdf4; padding:15px; border-radius:8px; border:1px solid #bbf7d0;">
                    <h4 style="margin-top:0; color:#166534;">The AI Overview Result</h4>
                    <p style="font-size:13px; color:#15803d;">When you follow these rules, Google's Gemini algorithm can confidently cite you as the primary source in the AI snapshot above normal rankings.</p>
                </div>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <!-- SECTION 1: HEALTH OVERVIEW -->
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:30px;">
        <div class="sc-stat-card" style="border-top: 3px solid <?php echo $ai_ready_color; ?>;">
            <div class="sc-stat-label">AI Overview Ready</div>
            <div class="sc-stat-value" style="color:<?php echo $ai_ready_color; ?>"><?php echo esc_html($summary['ai_ready']); ?></div>
            <div style="font-size:12px; color:#64748b; margin-top:5px;">Ready to be featured</div>
        </div>
        <div class="sc-stat-card">
            <div class="sc-stat-label">Average AEO Score</div>
            <div class="sc-stat-value"><?php echo esc_html($avg_score); ?>/100</div>
            <div style="font-size:12px; color:#64748b; margin-top:5px;">
                <?php echo ($avg_seo > 0) ? "Your SEO score is {$avg_seo} but AEO score is {$avg_score}" : "Across {$total_scored} analyzed posts"; ?>
            </div>
        </div>
        <div class="sc-stat-card" style="border-top: 3px solid #F59E0B;">
            <div class="sc-stat-label">Quick Opportunities</div>
            <div class="sc-stat-value" style="color:#F59E0B;"><?php echo esc_html($summary['quick_wins_count']); ?></div>
            <div style="font-size:12px; color:#64748b; margin-top:5px;">Small fixes = big gains</div>
        </div>
        <div class="sc-stat-card" style="border-top: 3px solid <?php echo $not_opt_color; ?>;">
            <div class="sc-stat-label">Not AEO Optimized</div>
            <div class="sc-stat-value" style="color:<?php echo $not_opt_color; ?>"><?php echo esc_html($not_optimized); ?></div>
            <div style="font-size:12px; color:#64748b; margin-top:5px;">Needs significant work</div>
        </div>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
        
        <!-- MAIN POST TABLE -->
        <div class="sc-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="margin:0;">Content AEO Analysis</h2>
                <button type="button" class="sc-btn sc-btn-primary" id="btn-run-aeo-analysis">Run Full Analysis</button>
            </div>
            
            <div id="aeo-analysis-progress" style="display:none; margin-bottom:20px;">
                <div class="sc-progress"><div class="sc-progress-bar bar-success shimmer" style="width:10%;"></div></div>
                <div style="text-align:center; font-size:12px; margin-top:5px;">Analyzing posts... Please wait.</div>
            </div>

            <div style="margin-bottom:15px;">
                <select id="aeo-filter">
                    <option value="all">All Posts</option>
                    <option value="ready">AI Overview Ready</option>
                    <option value="needs-work">Needs Work</option>
                    <option value="not-analyzed">Not Analyzed</option>
                </select>
                <input type="text" id="aeo-search" class="regular-text" placeholder="Search posts..." style="margin-left:10px;">
            </div>

            <table class="sc-table" style="width:100%; font-size:13px;" id="aeo-posts-table">
                <thead>
                    <tr>
                        <th style="width:30%;">Post Title</th>
                        <th>AEO Score</th>
                        <th>Direct Answer</th>
                        <th>FAQ</th>
                        <th>Schema</th>
                        <th>AI Ready</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $p_table = $wpdb->prefix . 'posts';
                    $s_table = $wpdb->prefix . 'seo_copilot_aeo_scores';
                    // Fetch recent 20 for initial load
                    $posts = $wpdb->get_results("
                        SELECT p.ID, p.post_title, s.* 
                        FROM $p_table p 
                        LEFT JOIN $s_table s ON s.post_id = p.ID 
                        WHERE p.post_status = 'publish' AND p.post_type IN ('post','page')
                        ORDER BY p.post_date DESC LIMIT 20
                    ");

                    if (!empty($posts)) {
                        foreach ($posts as $p) {
                            $has_score = !empty($p->aeo_score);
                            $score = $has_score ? intval($p->aeo_score) : 0;
                            
                            $score_class = 'sc-badge-danger';
                            if ($score >= 60) $score_class = 'sc-badge-warning';
                            if ($score >= 75) $score_class = 'sc-badge-success';

                            $ready = '➖';
                            if ($has_score) {
                                if ($score >= 75) $ready = '✅ Ready';
                                elseif ($score >= 60) $ready = '⚠️ Almost';
                                else $ready = '❌ Not Ready';
                            }
                            
                            echo '<tr class="aeo-row" data-id="'.esc_attr($p->ID).'" data-score="'.esc_attr($score).'">';
                            echo '<td><strong>' . esc_html($p->post_title) . '</strong></td>';
                            
                            if ( $has_score ) {
                                echo '<td><span class="sc-badge ' . $score_class . '">' . $score . '</span></td>';
                                
                                // Progress bars
                                $d_pct = ($p->direct_answer_score / 25) * 100;
                                $f_pct = ($p->faq_score / 20) * 100;
                                $s_pct = ($p->schema_score / 20) * 100;

                                echo '<td><div class="metric-bar" style="width:50px; height:6px; background:#e2e8f0; border-radius:3px; margin-bottom:3px;"><div style="width:'.$d_pct.'%; height:100%; background:#4F46E5; border-radius:3px;"></div></div>' . intval($p->direct_answer_score) . '/25</td>';
                                echo '<td><div class="metric-bar" style="width:50px; height:6px; background:#e2e8f0; border-radius:3px; margin-bottom:3px;"><div style="width:'.$f_pct.'%; height:100%; background:#10B981; border-radius:3px;"></div></div>' . intval($p->faq_score) . '/20</td>';
                                echo '<td><div class="metric-bar" style="width:50px; height:6px; background:#e2e8f0; border-radius:3px; margin-bottom:3px;"><div style="width:'.$s_pct.'%; height:100%; background:#F59E0B; border-radius:3px;"></div></div>' . intval($p->schema_score) . '/20</td>';
                                
                                echo '<td>' . $ready . '</td>';
                                echo '<td>
                                        <button type="button" class="sc-btn sc-btn-sm btn-reanalyze" data-id="'.esc_attr($p->ID).'">Analyze</button>
                                        <button type="button" class="sc-btn sc-btn-sm btn-optimize" data-id="'.esc_attr($p->ID).'" style="background:transparent; border:1px solid #4F46E5; color:#4F46E5;">✨ AI Optimize</button>
                                      </td>';
                            } else {
                                echo '<td>-</td><td>-</td><td>-</td><td>-</td><td>Not Analyzed</td>';
                                echo '<td><button type="button" class="sc-btn sc-btn-sm btn-reanalyze" data-id="'.esc_attr($p->ID).'">Analyze</button></td>';
                            }
                            echo '</tr>';
                        }
                    } else {
                        echo '<tr><td colspan="7">No posts found.</td></tr>';
                    }
                    ?>
                </tbody>
            </table>
        </div>

        <!-- QUICK WINS -->
        <div>
            <div class="sc-card">
                <h2 style="margin-top:0; font-size:16px;">Quick Wins List</h2>
                <p style="font-size:12px; color:#64748b;">Posts Almost Ready for AI Overviews (Score 60-74)</p>
                
                <?php if (empty($quick_ops)) : ?>
                    <p style="color:#64748b; text-align:center; padding: 20px 0;">No quick wins found right now.</p>
                <?php else : ?>
                    <?php foreach ($quick_ops as $op) : 
                        $issues = json_decode($op->issues, true);
                    ?>
                    <div style="border:1px solid #e2e8f0; padding:15px; border-radius:8px; margin-bottom:15px; background:#fff;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <strong><?php echo wp_trim_words($op->post_title, 8, '...'); ?></strong>
                            <span class="sc-badge sc-badge-warning"><?php echo esc_html($op->aeo_score); ?>/100</span>
                        </div>
                        <div style="font-size:12px; color:#475569; margin-bottom:15px;">
                            <strong>Missing just:</strong><br>
                            <?php 
                            if (!empty($issues)) {
                                $i=0;
                                foreach ($issues as $iss) {
                                    if ($i++ >= 2) break; // show max 2
                                    echo '<span style="color:#ef4444;">✗</span> ' . esc_html($iss) . '<br>';
                                }
                            } else {
                                echo 'Run AI optimization to find specific missed formats.';
                            }
                            ?>
                        </div>
                        <button type="button" class="sc-btn sc-btn-sm sc-btn-block btn-optimize" data-id="<?php echo esc_attr($op->post_id); ?>">Fix with AI &rarr;</button>
                    </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

    </div>

</div>

<!-- AI OPTIMIZATION MODAL -->
<div id="aeo-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.8); z-index:9999; align-items:center; justify-content:center;">
    <div style="background:#fff; width:800px; max-width:90%; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); display:flex; flex-direction:column; max-height:90vh;">
        
        <div style="padding:20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0;">✨ AEO Optimization: <span id="modal-post-title" style="font-weight:normal;"></span></h2>
            <button type="button" id="close-aeo-modal" style="background:none; border:none; font-size:24px; cursor:pointer; color:#94a3b8;">&times;</button>
        </div>
        
        <div style="padding:20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong>Current Score: <span id="modal-current-score" class="sc-badge sc-badge-warning">0/100</span></strong>
                <span id="modal-potential-score" style="color:#10B981; margin-left:10px; font-weight:bold;">→ Potential: 85+</span>
            </div>
            <div style="font-size:12px; color:#64748b;">These changes could get this post featured in AI Overviews</div>
        </div>

        <div id="modal-loader" style="padding:50px; text-align:center;">
            <div class="sc-progress" style="width:200px; margin:0 auto 15px;"><div class="sc-progress-bar bar-primary shimmer" style="width:100%;"></div></div>
            <strong>AI AI AI Model is generating strategic improvements...</strong>
        </div>

        <div id="modal-content-area" style="display:none; flex:1; overflow-y:auto; padding:20px;">
            <!-- Tab Nav -->
            <div style="display:flex; border-bottom:1px solid #e2e8f0; margin-bottom:20px;">
                <button type="button" class="aeo-tab-btn active" data-tab="tab-direct">Direct Answer</button>
                <button type="button" class="aeo-tab-btn" data-tab="tab-faq">FAQ to Add</button>
                <button type="button" class="aeo-tab-btn" data-tab="tab-h2">Suggested Headings</button>
                <button type="button" class="aeo-tab-btn" data-tab="tab-speakable">Speakable Summary</button>
            </div>

            <!-- Tab 1 -->
            <div id="tab-direct" class="aeo-tab-pane active" style="display:block;">
                <h3>Direct Answer Rewrite</h3>
                <p style="font-size:13px; color:#64748b;">AI models prefer exact, factual answers immediately in the first paragraph.</p>
                <div style="background:#f1f5f9; padding:15px; border-radius:6px; margin-bottom:15px; font-family:monospace; font-size:13px;" id="ai-direct-answer-text"></div>
                <button type="button" class="sc-btn sc-btn-primary" id="btn-apply-direct">Apply to First Paragraph</button>
                <span id="status-direct" style="margin-left:10px; color:#10B981; font-weight:bold; display:none;">Updated!</span>
            </div>

            <!-- Tab 2 -->
            <div id="tab-faq" class="aeo-tab-pane" style="display:none;">
                <h3>FAQ Section to Add</h3>
                <p style="font-size:13px; color:#64748b;">Injects perfectly formatted Q&A pairs + Schema to the bottom of your post.</p>
                <div id="ai-faq-list" style="margin-bottom:15px;"></div>
                <button type="button" class="sc-btn sc-btn-primary" id="btn-insert-faq">Insert FAQ into Post</button>
                <span id="status-faq" style="margin-left:10px; color:#10B981; font-weight:bold; display:none;">Inserted!</span>
            </div>

            <!-- Tab 3 -->
            <div id="tab-h2" class="aeo-tab-pane" style="display:none;">
                <h3>Suggested Question Headings</h3>
                <p style="font-size:13px; color:#64748b;">Add these topics manually in your WordPress editor to cover full AI search intent.</p>
                <ul id="ai-h2-list" style="list-style:disc; margin-left:20px; line-height:1.6; font-weight:bold; color:#1e293b;"></ul>
            </div>

            <!-- Tab 4 -->
            <div id="tab-speakable" class="aeo-tab-pane" style="display:none;">
                <h3>Voice Search Summary</h3>
                <p style="font-size:13px; color:#64748b;">A perfectly condensed 2 sentence summary for Google Assistant/Siri.</p>
                <div style="background:#f1f5f9; padding:15px; border-radius:6px; margin-bottom:15px; font-style:italic;" id="ai-speakable-text"></div>
                <button type="button" class="sc-btn sc-btn-primary" id="btn-enable-speakable">Enable Speakable Schema</button>
                <span id="status-speakable" style="margin-left:10px; color:#10B981; font-weight:bold; display:none;">Enabled!</span>
            </div>
        </div>
        
    </div>
</div>

<style>
.aeo-tab-btn { background:none; border:none; padding:10px 20px; font-weight:bold; color:#64748b; cursor:pointer; border-bottom:2px solid transparent; }
.aeo-tab-btn.active { color:#4F46E5; border-bottom:2px solid #4F46E5; }
</style>

<script>
jQuery(document).ready(function($) {

    var activePostId = null;
    var aiData = null;

    $('#aeo-explainer-toggle').on('click', function(){
        $('#aeo-explainer-content').slideToggle();
    });

    $('#btn-run-aeo-analysis').on('click', function(){
        var $btn = $(this);
        $btn.hide();
        $('#aeo-analysis-progress').slideDown();
        
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_analyze_aeo_all',
            nonce: seoCopilotAdmin.nonce
        }, function(res) {
            location.reload();
        });
    });

    $('.btn-reanalyze').on('click', function(){
        var $btn = $(this);
        var pid = $btn.data('id');
        $btn.prop('disabled', true).text('...');
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_analyze_aeo_post',
            nonce: seoCopilotAdmin.nonce,
            post_id: pid
        }, function(res) {
            location.reload(); // simple reload for immediate refresh
        });
    });

    $(document).on('click', '.btn-optimize', function(){
        activePostId = $(this).data('id');
        var tr = $(this).closest('tr');
        var score = tr.data('score') || $('.sc-badge-warning', $(this).parent().prev()).text().split('/')[0];
        if(!score) score = 0; // fallback logic
        
        $('#modal-post-title').text('Post ID ' + activePostId);
        $('#modal-current-score').text(score + '/100');
        
        $('#aeo-modal').css('display', 'flex');
        $('#modal-loader').show();
        $('#modal-content-area').hide();
        
        // Fetch AI
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_get_aeo_suggestions',
            nonce: seoCopilotAdmin.nonce,
            post_id: activePostId
        }, function(res) {
            $('#modal-loader').hide();
            if(res.success) {
                aiData = res.data;
                renderAIModal(aiData);
            } else {
                alert('Failed to generate suggestions.');
                $('#aeo-modal').hide();
            }
        });
    });

    $('#close-aeo-modal').on('click', function(){
        $('#aeo-modal').hide();
    });

    $('.aeo-tab-btn').on('click', function(){
        $('.aeo-tab-btn').removeClass('active');
        $(this).addClass('active');
        $('.aeo-tab-pane').hide();
        $('#' + $(this).data('tab')).show();
    });

    function renderAIModal(data) {
        $('#modal-content-area').show();
        
        if (data.direct_answer_rewrite) {
            $('#ai-direct-answer-text').text(data.direct_answer_rewrite);
        }
        
        if (data.faq_to_add && data.faq_to_add.length) {
            var fHtml = '';
            $.each(data.faq_to_add, function(i, f){
                fHtml += '<div style="margin-bottom:10px;"><strong style="display:block;">Q: '+f.question+'</strong><div style="font-size:13px; color:#475569;">A: '+f.answer+'</div></div>';
            });
            $('#ai-faq-list').html(fHtml);
        }

        if (data.suggested_h2s && data.suggested_h2s.length) {
            var hHtml = '';
            $.each(data.suggested_h2s, function(i, h){
                hHtml += '<li>'+h+'</li>';
            });
            $('#ai-h2-list').html(hHtml);
        }

        if (data.speakable_section) {
            $('#ai-speakable-text').text(data.speakable_section);
        }
    }

    // Modal Actions
    $('#btn-apply-direct').on('click', function(){
        if(!aiData || !aiData.direct_answer_rewrite) return;
        var btn = $(this);
        btn.prop('disabled', true);
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_apply_direct_answer',
            nonce: seoCopilotAdmin.nonce,
            post_id: activePostId,
            rewrite: aiData.direct_answer_rewrite
        }, function(res){
            if(res.success) {
                $('#status-direct').fadeIn();
            }
        });
    });

    $('#btn-insert-faq').on('click', function(){
        if(!aiData || !aiData.faq_to_add) return;
        var btn = $(this);
        btn.prop('disabled', true);
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_insert_faq_section',
            nonce: seoCopilotAdmin.nonce,
            post_id: activePostId,
            faqs: JSON.stringify(aiData.faq_to_add)
        }, function(res){
            if(res.success) {
                $('#status-faq').fadeIn();
            }
        });
    });

    $('#btn-enable-speakable').on('click', function(){
        if(!aiData || !aiData.speakable_section) return;
        var btn = $(this);
        btn.prop('disabled', true);
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_toggle_speakable',
            nonce: seoCopilotAdmin.nonce,
            post_id: activePostId,
            speakable_text: aiData.speakable_section
        }, function(res){
            if(res.success) {
                $('#status-speakable').fadeIn();
            }
        });
    });

});
</script>
