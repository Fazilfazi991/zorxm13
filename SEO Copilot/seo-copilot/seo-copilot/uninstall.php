<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package SEO_Copilot
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

// Drop custom tables created by the plugin
$table_scores   = $wpdb->prefix . 'seo_copilot_scores';
$table_keywords = $wpdb->prefix . 'seo_copilot_keywords';
$table_activity = $wpdb->prefix . 'seo_copilot_activity';
$table_conflicts   = $wpdb->prefix . 'seo_copilot_conflicts';
$table_score_history = $wpdb->prefix . 'seo_copilot_score_history';
$table_tracked_keywords = $wpdb->prefix . 'seo_copilot_tracked_keywords';
$table_rank_history = $wpdb->prefix . 'seo_copilot_rank_history';
$table_gsc_data = $wpdb->prefix . 'seo_copilot_gsc_data';
$table_briefs = $wpdb->prefix . 'seo_copilot_briefs';
$table_keyword_map = $wpdb->prefix . 'seo_copilot_keyword_map';
$table_auto_links = $wpdb->prefix . 'seo_copilot_auto_links';
$table_competitor_analyses = $wpdb->prefix . 'seo_copilot_competitor_analyses';

$wpdb->query( "DROP TABLE IF EXISTS {$table_scores}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_keywords}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_activity}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_conflicts}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_score_history}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_tracked_keywords}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_rank_history}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_gsc_data}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_briefs}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_keyword_map}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_auto_links}" );
$wpdb->query( "DROP TABLE IF EXISTS {$table_competitor_analyses}" );

// Delete plugin options and configurations
delete_option( 'seo_copilot_settings' );
