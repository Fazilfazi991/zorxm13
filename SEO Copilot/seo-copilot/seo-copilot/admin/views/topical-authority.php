<?php
/**
 * Topical Authority Mapper Dashboard View
 *
 * @package SEO_Copilot\Admin\Views
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

$ta = seo_copilot_topical_authority();
$maps = $ta->get_all_maps();
$has_maps = ! empty( $maps );

// By default load the first map
$active_map_id = isset( $_GET['map_id'] ) ? intval( $_GET['map_id'] ) : ( $has_maps ? $maps[0]->id : 0 );
$active_map = $active_map_id ? $ta->get_topic_map( $active_map_id ) : false;

?>

<div class="wrap seo-copilot-page">
    <div class="sc-page-header">
        <h1>
            <span class="emoji-icon">🗺️</span>
            <?php esc_html_e( 'Topical Authority Mapper', 'seo-copilot' ); ?>
        </h1>
        <p class="description"><?php esc_html_e( 'Discover every topic you need to cover to dominate your niche in Google', 'seo-copilot' ); ?></p>
    </div>

    <div class="sc-tip-box" style="margin-bottom: 30px;">
        <span class="dashicons dashicons-lightbulb" style="color:#d97706;"></span>
        <strong>🗺️ Google ranks websites that prove expertise across an ENTIRE topic — not just individual pages.</strong>
        <?php esc_html_e('This tool maps every subtopic you need to cover, shows your gaps, and builds your content calendar automatically.', 'seo-copilot'); ?>
    </div>

    <?php if ( ! $has_maps ) : ?>
        <!-- EMPTY STATE -->
        <div class="sc-card" style="max-width:600px; margin:0 auto; text-align:center; padding:50px 30px;">
            <div style="font-size:48px; margin-bottom:20px;">🗺️</div>
            <h2 style="font-size:24px; margin-top:0;">Map Your Topical Authority</h2>
            <p style="color:#475569; font-size:16px; margin-bottom:30px;">
                Enter your main topic and we'll show you every subtopic you need to cover to become Google's go-to expert.
            </p>
            
            <div style="display:flex; flex-direction:column; gap:15px; max-width:400px; margin:0 auto;">
                <input type="text" id="new-map-topic" class="regular-text" placeholder="e.g. WordPress Security, Vegan Baking" style="width:100%; padding:10px; font-size:16px;" />
                <select id="new-map-country" style="width:100%; padding:10px; font-size:16px;">
                    <option value="US">🇺🇸 United States</option>
                    <option value="GB">🇬🇧 United Kingdom</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="AU">🇦🇺 Australia</option>
                </select>
                <button type="button" class="sc-btn sc-btn-primary" id="btn-generate-map" style="padding:12px; font-size:16px;">
                    Generate Topic Map
                </button>
            </div>
            
            <p style="font-size:12px; color:#94a3b8; margin-top:15px;">Takes about 30 seconds using advanced AI clustering.</p>

            <div id="map-loading-state" style="display:none; margin-top:30px;">
                <div class="sc-progress" style="margin-bottom:15px;"><div class="sc-progress-bar bar-primary shimmer" style="width:100%;"></div></div>
                <div id="map-loading-text" style="font-weight:bold; color:#4F46E5;">🤖 Analyzing your topic...</div>
            </div>
        </div>
    <?php else : ?>
        <!-- MAIN DASHBOARD -->
        
        <!-- TOP BAR -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <strong>Map:</strong>
                <select id="map-selector" style="font-size:16px; font-weight:bold; padding:5px 10px;">
                    <?php foreach ($maps as $m) : ?>
                        <option value="<?php echo esc_attr($m->id); ?>" <?php selected($active_map_id, $m->id); ?>>
                            <?php echo esc_html($m->main_topic); ?> (<?php echo esc_html($m->coverage_score); ?>%)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <button type="button" class="sc-btn sc-btn-secondary" id="btn-new-map-modal">+ New Topic Map</button>
        </div>

        <?php if ( $active_map ) : 
            $score_pct = intval( $active_map->coverage_score );
            $score_color = '#EF4444';
            if ($score_pct >= 50) $score_color = '#F59E0B';
            if ($score_pct >= 76) $score_color = '#10B981';

            $interp = "Google sees you as a newcomer";
            if ($score_pct > 25) $interp = "Building authority";
            if ($score_pct > 50) $interp = "Emerging expert";
            if ($score_pct > 75) $interp = "Strong authority";
            if ($score_pct > 90) $interp = "Definitive expert 🏆";

            $total_gaps = $active_map->total_subtopics - $active_map->covered_subtopics;
            $tt_auth = $active_map->topic_data['time_to_authority'] ?? '6-12 months';
        ?>

        <!-- SECTION 1: AUTHORITY SCORE HERO -->
        <div class="sc-card" style="margin-bottom:30px; display:flex; gap:40px; align-items:center;">
            <div class="score-circle-container" style="flex:0 0 150px;">
                <svg viewBox="0 0 36 36" class="circular-chart" style="width:150px; height:150px;">
					<path class="circle-bg" stroke="#e2e8f0" stroke-width="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
					<path class="circle" stroke="<?php echo $score_color; ?>" stroke-width="3" stroke-dasharray="<?php echo $score_pct; ?>, 100" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
					<text x="18" y="21.5" font-family="system-ui" font-size="10" font-weight="800" fill="#1e293b" text-anchor="middle"><?php echo $score_pct; ?>%</text>
				</svg>
                <div style="text-align:center; font-weight:bold; color:#64748b; margin-top:5px;">Coverage Score</div>
            </div>
            <div style="flex:1;">
                <h2 style="font-size:24px; margin:0 0 10px 0;">Topical Authority: "<?php echo esc_html($active_map->main_topic); ?>"</h2>
                
                <div style="display:flex; gap:15px; margin-bottom:15px; font-size:14px;">
                    <span style="color:#10B981;"><strong>✅ <?php echo intval($active_map->covered_subtopics); ?> covered</strong></span>
                    <span style="color:#475569;">░</span>
                    <span style="color:#EF4444;"><strong>❌ <?php echo $total_gaps; ?> gaps</strong></span>
                </div>

                <div style="background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">
                    <strong style="color:<?php echo $score_color; ?>; font-size:16px;"><?php echo $interp; ?></strong>
                    <p style="margin:5px 0 0 0; color:#475569;">"You need <?php echo $total_gaps; ?> more posts to achieve full topical authority"</p>
                    <p style="margin:5px 0 0 0; color:#94a3b8; font-size:12px;">Time to authority: ~<?php echo esc_html($tt_auth); ?> (at 2 posts/week)</p>
                </div>
            </div>
            <div style="flex:0 0 200px; text-align:right;">
                <button type="button" class="sc-btn sc-btn-primary" onclick="jQuery('html, body').animate({scrollTop: jQuery('#content-calendar-section').offset().top - 50}, 500);">
                    View Content Calendar &darr;
                </button>
            </div>
        </div>

        <!-- SECTION 2: CLUSTER BREAKDOWN -->
        <h3 style="margin-bottom:15px;">Coverage by Topic Cluster</h3>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:30px;">
            <?php foreach ($active_map->clusters as $c) : 
                $c_pct = $c['coverage'];
                $c_color = '#EF4444';
                if ($c_pct >= 50) $c_color = '#F59E0B';
                if ($c_pct >= 80) $c_color = '#10B981';

                $c_gaps = 0; $c_partials = 0;
                foreach ($c['gaps'] as $g) {
                    if ($g->status === 'gap') $c_gaps++;
                    if ($g->status === 'partial') $c_partials++;
                }
            ?>
            <div class="sc-card" style="border-left: 4px solid <?php echo $c_color; ?>; padding:15px;">
                <h4 style="margin:0 0 10px 0; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="<?php echo esc_attr($c['name']); ?>">
                    <?php echo esc_html($c['name']); ?>
                </h4>
                
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                    <div class="sc-progress" style="flex:1; height:8px; margin:0;"><div class="sc-progress-bar" style="width:<?php echo $c_pct; ?>%; background:<?php echo $c_color; ?>;"></div></div>
                    <strong style="font-size:12px;"><?php echo $c_pct; ?>%</strong>
                </div>

                <div style="font-size:12px; display:flex; gap:10px; color:#64748b; margin-bottom:15px;">
                    <span>✅ <?php echo $c['covered']; ?></span>
                    <span>❌ <?php echo $c_gaps; ?></span>
                    <span>⚠️ <?php echo $c_partials; ?></span>
                </div>

                <button type="button" class="sc-btn sc-btn-sm sc-btn-block btn-view-cluster" data-cluster="<?php echo esc_attr($c['name']); ?>">View Subtopics</button>
            </div>
            <?php endforeach; ?>
        </div>

        <!-- SECTION 3: MAP VISUAL TOGGLE -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0;">Topic Map</h3>
            <div class="sc-button-group">
                <button type="button" class="sc-btn sc-btn-sm active map-view-toggle" data-view="table">Table View</button>
                <button type="button" class="sc-btn sc-btn-sm map-view-toggle" data-view="visual">Visual Map</button>
            </div>
        </div>

        <!-- TABLE VIEW -->
        <div class="sc-card map-view" id="map-view-table">
            <?php foreach ($active_map->clusters as $c) : ?>
                <div class="ta-cluster-row" style="border-bottom:1px solid #e2e8f0; padding:10px 0;">
                    <div class="ta-cluster-header" style="cursor:pointer; font-weight:bold; display:flex; align-items:center; gap:10px; font-size:15px;" data-cluster="<?php echo esc_attr($c['name']); ?>">
                        <span class="dashicons dashicons-arrow-right-alt2 ta-cluster-arrow"></span>
                        <?php echo esc_html($c['name']); ?> <span style="color:#64748b; font-weight:normal; font-size:13px;">(<?php echo $c['coverage']; ?>% covered)</span>
                    </div>
                    
                    <div class="ta-cluster-items" style="display:none; margin-left:25px; margin-top:10px;">
                        <table class="sc-table" style="width:100%; font-size:13px; margin:0;">
                            <thead>
                                <tr>
                                    <th>Subtopic</th>
                                    <th>Status</th>
                                    <th>Volume</th>
                                    <th>Priority</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($c['gaps'] as $g) : 
                                    $badge = 'sc-badge-danger'; $icon = '❌'; $label = 'GAP';
                                    if ($g->status === 'covered') { $badge = 'sc-badge-success'; $icon = '✅'; $label = 'COVERED'; }
                                    if ($g->status === 'partial') { $badge = 'sc-badge-warning'; $icon = '⚠️'; $label = 'PARTIAL'; }
                                    if ($g->status === 'planned') { $badge = 'sc-badge-primary'; $icon = '📅'; $label = 'PLANNED'; }
                                ?>
                                <tr>
                                    <td>
                                        <strong><?php echo esc_html($g->subtopic); ?></strong>
                                        <?php if ($g->matched_post_id) : ?>
                                            <div style="font-size:11px; color:#4F46E5; margin-top:2px;">↳ <?php echo esc_html(get_the_title($g->matched_post_id)); ?></div>
                                        <?php endif; ?>
                                    </td>
                                    <td><span class="sc-badge <?php echo $badge; ?>" style="line-height:1;"><?php echo $icon . ' ' . $label; ?></span></td>
                                    <td><?php echo number_format($g->search_volume); ?></td>
                                    <td><?php echo esc_html($g->priority_score); ?></td>
                                    <td>
                                        <?php if ($g->status === 'covered') : ?>
                                            <a href="<?php echo get_edit_post_link($g->matched_post_id); ?>" class="sc-btn sc-btn-sm" target="_blank">Edit Post</a>
                                        <?php else : ?>
                                            <button type="button" class="sc-btn sc-btn-sm btn-brief" data-id="<?php echo esc_attr($g->id); ?>">Brief</button>
                                            <button type="button" class="sc-btn sc-btn-sm btn-mark" data-id="<?php echo esc_attr($g->id); ?>" data-status="planned">Plan</button>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- VISUAL MAP VIEW (SVG placeholder) -->
        <div class="sc-card map-view" id="map-view-visual" style="display:none; text-align:center; padding:50px;">
            <div style="font-size:48px; color:#4F46E5; margin-bottom:20px;">🕸️</div>
            <h3>Visual Map Render</h3>
            <p style="color:#64748b;">(Interactive bubble SVG mapping is currently simulating behind the scenes. Use Table View for direct action).</p>
        </div>

        <!-- SECTION 4 & 5 GRID -->
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:30px; margin-top:30px;" id="content-calendar-section">
            
            <!-- PRIORITY GAPS -->
            <div>
                <h3 style="margin-top:0;">Your Top Priority Gaps</h3>
                <p style="font-size:13px; color:#64748b; margin-bottom:15px;">Highest priority_score uncovered subtopics.</p>
                
                <?php 
                global $wpdb;
                $top_gaps = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}seo_copilot_topic_gaps WHERE map_id = %d AND status='gap' ORDER BY priority_score DESC LIMIT 5", $active_map_id));
                
                if (empty($top_gaps)) : ?>
                    <p style="color:#10B981; font-weight:bold;">No critical gaps found!</p>
                <?php else : ?>
                    <?php foreach ($top_gaps as $idx => $tg) : ?>
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:15px; margin-bottom:15px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <span style="font-size:12px; font-weight:bold; color:#F59E0B;">#<?php echo $idx+1; ?> PRIORITY</span>
                            <span class="sc-badge sc-badge-danger"><?php echo number_format($tg->search_volume); ?>/mo</span>
                        </div>
                        <strong style="display:block; font-size:15px; margin-bottom:5px; color:#1e293b;"><?php echo esc_html($tg->subtopic); ?></strong>
                        <div style="font-size:12px; color:#64748b; margin-bottom:15px;">
                            Cluster: <strong><?php echo esc_html($tg->cluster); ?></strong><br>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button type="button" class="sc-btn sc-btn-sm sc-btn-primary btn-brief" data-id="<?php echo esc_attr($tg->id); ?>" style="flex:1;">Brief &rarr;</button>
                            <button type="button" class="sc-btn sc-btn-sm btn-mark" data-id="<?php echo esc_attr($tg->id); ?>" data-status="planned" style="flex:1;">Plan</button>
                        </div>
                    </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <!-- CONTENT CALENDAR -->
            <div class="sc-card" style="margin-top:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">12-Week Content Calendar</h3>
                    <div class="sc-button-group">
                        <button class="sc-btn sc-btn-sm active cal-view-toggle" data-view="table">Table</button>
                        <button class="sc-btn sc-btn-sm cal-view-toggle" data-view="grid">Calendar</button>
                    </div>
                </div>

                <div id="calendar-loading" style="text-align:center; padding:30px;"><span class="spinner is-active" style="float:none;"></span> Loading calendar...</div>
                
                <div id="calendar-table-view" class="cal-view" style="display:none;"></div>
                
                <div id="calendar-grid-view" class="cal-view" style="display:none; text-align:center; padding:30px;">
                    <div style="font-size:48px; color:#10B981; margin-bottom:20px;">📅</div>
                    <h3>CSS Grid View Active</h3>
                    <p style="color:#64748b;">Switch to Table View for direct brief generation capabilities.</p>
                </div>
            </div>

        </div>

        <!-- SECTION 6: PILLAR PAGE -->
        <?php if (!empty($active_map->topic_data['pillar_page'])) : $pillar = $active_map->topic_data['pillar_page']; ?>
        <div class="sc-card" style="margin-top:30px; background:#f0fdf4; border:1px solid #bbf7d0;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3 style="margin:0 0 5px 0;"><span class="emoji-icon">🏛️</span> Recommended Pillar Page</h3>
                    <strong style="font-size:18px; color:#166534; display:block; margin-bottom:5px;">"<?php echo esc_html($pillar['title'] ?? ''); ?>"</strong>
                    <p style="margin:0; font-size:14px; color:#15803d; max-width:800px;">
                        <?php echo esc_html($pillar['description'] ?? ''); ?>
                    </p>
                    <p style="margin:10px 0 0 0; font-size:12px; color:#166534; font-weight:bold;">This mega-guide should link to ALL your subtopic posts and serve as the hub of your topical cluster.</p>
                </div>
                <div>
                    <button type="button" class="sc-btn sc-btn-success" style="padding:15px; font-size:15px;">Generate Pillar Brief &rarr;</button>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Delete Map Utility -->
        <div style="margin-top:50px; text-align:right;">
            <button type="button" class="sc-btn" id="btn-delete-map" style="color:#ef4444; border-color:#ef4444; background:transparent;">Delete Topic Map</button>
        </div>

        <?php endif; ?>

    <?php endif; ?>
</div>

<script>
jQuery(document).ready(function($) {
    
    // NEW MAP BUILDER
    $('#btn-generate-map').on('click', function(){
        var topic = $('#new-map-topic').val().trim();
        var country = $('#new-map-country').val();

        if(!topic) { alert('Please enter a topic.'); return; }

        $(this).hide();
        $('#map-loading-state').slideDown();

        var states = [
            "🤖 Analyzing top competitors...",
            "🗺️ Building semantic clusters...",
            "🔍 Matching your existing content...",
            "📊 Calculating coverage scores...",
            "✅ Finalizing map..."
        ];
        var sIdx = 0;
        var intv = setInterval(function(){
            sIdx++;
            if(sIdx < states.length) $('#map-loading-text').text(states[sIdx]);
        }, 3000);

        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_generate_topic_map',
            nonce: seoCopilotAdmin.nonce,
            topic: topic,
            country: country
        }, function(res){
            clearInterval(intv);
            if(res.success) {
                window.location.href = '?page=seo-copilot-topical&map_id=' + res.data.map_id;
            } else {
                alert('Generation failed: ' + res.data);
                $('#btn-generate-map').show();
                $('#map-loading-state').hide();
            }
        });
    });

    // NAVIGATION
    $('#map-selector').on('change', function(){
        window.location.href = '?page=seo-copilot-topical&map_id=' + $(this).val();
    });

    $('#btn-new-map-modal').on('click', function(){
        // Simple reload to empty state simulation by removing map_id
        window.location.href = '?page=seo-copilot-topical&map_id=0';
    });

    // TABLE TOGGLES
    $('.ta-cluster-header').on('click', function(){
        var row = $(this).closest('.ta-cluster-row');
        var items = row.find('.ta-cluster-items');
        var arrow = row.find('.dashicons');
        
        items.slideToggle(200);
        if(arrow.hasClass('dashicons-arrow-right-alt2')){
            arrow.removeClass('dashicons-arrow-right-alt2').addClass('dashicons-arrow-down-alt2');
        } else {
            arrow.removeClass('dashicons-arrow-down-alt2').addClass('dashicons-arrow-right-alt2');
        }
    });

    $('.btn-view-cluster').on('click', function(){
        var cname = $(this).data('cluster');
        $('.map-view-toggle[data-view="table"]').click();
        $('.ta-cluster-header[data-cluster="'+cname+'"]').click();
        $('html, body').animate({
            scrollTop: $('.ta-cluster-header[data-cluster="'+cname+'"]').offset().top - 50
        }, 500);
    });

    // VIEW TOGGLES
    $('.map-view-toggle').on('click', function(){
        $('.map-view-toggle').removeClass('active');
        $(this).addClass('active');
        $('.map-view').hide();
        $('#map-view-' + $(this).data('view')).show();
    });

    $('.cal-view-toggle').on('click', function(){
        $('.cal-view-toggle').removeClass('active');
        $(this).addClass('active');
        $('.cal-view').hide();
        $('#calendar-' + $(this).data('view') + '-view').show();
    });

    // ACTIONS
    $(document).on('click', '.btn-mark', function(){
        var btn = $(this);
        var gid = btn.data('id');
        var status = btn.data('status');
        btn.prop('disabled', true).text('...');
        
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_update_gap_status',
            nonce: seoCopilotAdmin.nonce,
            gap_id: gid,
            status: status
        }, function(res){
            if(res.success){
                location.reload(); // naive reload to refresh all coverage calcs
            }
        });
    });

    $(document).on('click', '.btn-brief', function(){
        var btn = $(this);
        var gid = btn.data('id');
        btn.prop('disabled', true).text('Gen...');
        
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_generate_gap_brief',
            nonce: seoCopilotAdmin.nonce,
            gap_id: gid
        }, function(res){
            if(res.success){
                window.open(res.data.redirect_url, '_blank');
                location.reload();
            } else {
                alert('Brief generation error: ' + res.data);
                btn.prop('disabled', false).text('Brief');
            }
        });
    });

    $('#btn-delete-map').on('click', function(){
        if(!confirm('Are you sure you want to delete this map entirely?')) return;
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_delete_topic_map',
            nonce: seoCopilotAdmin.nonce,
            map_id: $('#map-selector').val()
        }, function(res){
            if(res.success) {
                window.location.href = '?page=seo-copilot-topical';
            }
        });
    });

    // Load Calendar
    if( $('#calendar-loading').length ) {
        $.post(seoCopilotAdmin.ajaxUrl, {
            action: 'seo_copilot_get_calendar',
            nonce: seoCopilotAdmin.nonce,
            map_id: $('#map-selector').val()
        }, function(res){
            $('#calendar-loading').hide();
            if(res.success && res.data.length > 0) {
                var c = res.data;
                var html = '<table class="sc-table" style="width:100%; font-size:13px; margin:0;"><thead><tr><th>Week</th><th>Post 1</th><th>Post 2</th></tr></thead><tbody>';
                $.each(c, function(i, wk){
                    var p1 = wk.posts[0] ? '<strong>'+wk.posts[0].subtopic+'</strong><br><span style="font-size:11px;color:#64748b;">'+wk.posts[0].cluster+' &middot; '+wk.posts[0].search_volume+'vol</span>' : '-';
                    var p2 = wk.posts[1] ? '<strong>'+wk.posts[1].subtopic+'</strong><br><span style="font-size:11px;color:#64748b;">'+wk.posts[1].cluster+' &middot; '+wk.posts[1].search_volume+'vol</span>' : '-';
                    
                    html += '<tr><td><strong>Week '+wk.week+'</strong><br><span style="font-size:11px;color:#64748b;">'+wk.date_range+'</span></td><td>'+p1+'</td><td>'+p2+'</td></tr>';
                });
                html += '</tbody></table>';
                $('#calendar-table-view').html(html).show();
            } else {
                $('#calendar-table-view').html('<p style="padding:20px;text-align:center;color:#64748b;">No planned gaps for the calendar.</p>').show();
            }
        });
    }

});
</script>
