<?php
/**
 * Plugin Name: WPCraft — AI Page Importer
 * Description: Paste AI-generated JSON to 
 *   instantly create Elementor pages
 * Version: 2.0.0
 * Author: Zorx Digital
 * Author URI: https://zorx.co
 * Elementor tested up to: 3.25.0
 */

if (!defined('ABSPATH')) exit;

define('WPCRAFT_VERSION', '2.0.0');
define('WPCRAFT_DIR', plugin_dir_path(__FILE__));
define('WPCRAFT_URL', plugin_dir_url(__FILE__));

class WPCraft {
  private static $instance = null;

  public static function instance() {
    if (!self::$instance) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  public function __construct() {
    add_action('admin_menu', [$this, 'admin_menu']);
    add_action('admin_enqueue_scripts', 
      [$this, 'admin_enqueue']);
    add_action('wp_ajax_wpcraft_create_page', 
      [$this, 'handle_create_page']);
  }

  public function admin_menu() {
    add_menu_page(
      'WPCraft',
      'WPCraft',
      'edit_posts',
      'wpcraft',
      [$this, 'admin_page'],
      'dashicons-art',
      30
    );
  }

  public function admin_enqueue($hook) {
    if ($hook !== 'toplevel_page_wpcraft') return;
    wp_enqueue_style(
      'wpcraft-admin',
      WPCRAFT_URL . 'assets/admin.css',
      [],
      WPCRAFT_VERSION
    );
    wp_enqueue_script(
      'wpcraft-admin',
      WPCRAFT_URL . 'assets/admin.js',
      ['jquery'],
      WPCRAFT_VERSION,
      true
    );
    wp_localize_script('wpcraft-admin', 'wpcraftData', [
      'ajaxurl' => admin_url('admin-ajax.php'),
      'nonce' => wp_create_nonce('wpcraft_nonce'),
    ]);
  }

  public function handle_create_page() {
    check_ajax_referer('wpcraft_nonce', 'nonce');
    
    if (!current_user_can('edit_posts')) {
      wp_send_json_error('Permission denied');
    }

    $json_input = stripslashes(
      $_POST['json_data'] ?? ''
    );
    $page_title = sanitize_text_field(
      $_POST['page_title'] ?? 'WPCraft Page'
    );
    $page_title = $page_title ?: 'WPCraft Page';

    if (empty($json_input)) {
      wp_send_json_error('No JSON provided');
    }

    $data = json_decode($json_input, true);
    
    if (!$data) {
      wp_send_json_error(
        'Invalid JSON — please check your input'
      );
    }

    // Extract elements array
    // Supports both formats:
    // { type: "elementor", elements: [...] }
    // { version: "0.4", content: [...] }
    $elements = null;
    
    if (isset($data['elements']) && 
        is_array($data['elements'])) {
      $elements = $data['elements'];
    } elseif (isset($data['content']) && 
               is_array($data['content'])) {
      $elements = $data['content'];
    } elseif (is_array($data) && 
               isset($data[0]['elType'])) {
      // Raw array of elements
      $elements = $data;
    }

    if (!$elements || count($elements) === 0) {
      wp_send_json_error(
        'No page sections found in JSON'
      );
    }

    // Create the WordPress page
    $post_id = wp_insert_post([
      'post_title' => $page_title,
      'post_status' => 'draft',
      'post_type' => 'page',
      'post_content' => '',
    ]);

    if (is_wp_error($post_id)) {
      wp_send_json_error(
        $post_id->get_error_message()
      );
    }

    // Save Elementor data to page
    update_post_meta(
      $post_id,
      '_elementor_data',
      wp_slash(json_encode($elements))
    );

    // Mark page as built with Elementor
    update_post_meta(
      $post_id,
      '_elementor_edit_mode',
      'builder'
    );

    // Set Elementor version
    update_post_meta(
      $post_id,
      '_elementor_version',
      '3.0.0'
    );

    // Clear Elementor cache
    if (class_exists('\Elementor\Plugin')) {
      \Elementor\Plugin::$instance
        ->files_manager->clear_cache();
    }

    $edit_url = admin_url(
      'post.php?post=' . $post_id . 
      '&action=elementor'
    );
    $view_url = get_permalink($post_id);

    wp_send_json_success([
      'post_id' => $post_id,
      'edit_url' => $edit_url,
      'view_url' => $view_url,
      'message' => 'Page created successfully!'
    ]);
  }

  public function admin_page() {
    require_once WPCRAFT_DIR . 'admin-page.php';
  }
}

WPCraft::instance();
