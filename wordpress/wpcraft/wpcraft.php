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
    add_action('wp_enqueue_scripts', 
      [$this, 'enqueue_page_fonts']);
    add_action('wp_head', 
      [$this, 'inject_head_css'], 99);
    add_action('wpcraft_regenerate_css', 
      [$this, 'regenerate_post_css']);
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

    $elements = null;
    
    if (isset($data['elements']) && 
        is_array($data['elements'])) {
      $elements = $data['elements'];
    } elseif (isset($data['content']) && 
               is_array($data['content'])) {
      $elements = $data['content'];
    } elseif (is_array($data) && 
               isset($data[0]['elType'])) {
      $elements = $data;
    }

    if (!$elements || count($elements) === 0) {
      wp_send_json_error(
        'No page sections found in JSON'
      );
    }

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

    update_post_meta(
      $post_id,
      '_elementor_data',
      wp_slash(json_encode($elements))
    );

    update_post_meta(
      $post_id, 
      '_elementor_edit_mode', 
      'builder'
    );

    update_post_meta(
      $post_id,
      '_elementor_version',
      '3.0.0'
    );

    update_post_meta(
      $post_id,
      '_wp_page_template',
      'elementor_canvas'
    );

    if (class_exists('\Elementor\Plugin')) {
      \Elementor\Plugin::$instance
        ->files_manager->clear_cache();
      $css_file = new \Elementor\Core\Files\CSS\Post(
        $post_id
      );
      $css_file->update();
    }

    $all_css = wpcraft_build_page_css(
      $elements, $post_id
    );
    if (!empty($all_css)) {
      update_post_meta(
        $post_id, '_wpcraft_custom_css', $all_css
      );
    }

    $fonts = wpcraft_extract_fonts($elements);
    if (!empty($fonts)) {
      update_post_meta(
        $post_id, '_wpcraft_fonts',
        implode('|', array_unique($fonts))
      );
    }

    wp_schedule_single_event(
      time(), 
      'wpcraft_regenerate_css', 
      [$post_id]
    );

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

  public function enqueue_page_fonts() {
    if (!is_singular()) return;
    $post_id = get_the_ID();
    
    $fonts = get_post_meta(
      $post_id, '_wpcraft_fonts', true
    );
    if ($fonts) {
      $font_families = array_unique(
        explode('|', $fonts)
      );
      $font_query = implode('&family=',
        array_map('urlencode', $font_families)
      );
      wp_enqueue_style(
        'wpcraft-fonts-' . $post_id,
        'https://fonts.googleapis.com/css2?family=' .
        $font_query . '&display=swap',
        [], null
      );
    }
    
    $custom_css = get_post_meta(
      $post_id, '_wpcraft_custom_css', true
    );
    if ($custom_css) {
      wp_add_inline_style(
        'elementor-frontend', $custom_css
      );
    }
  }

  public function inject_head_css() {
    if (!is_singular()) return;
    $post_id = get_the_ID();
    
    $custom_css = get_post_meta(
      $post_id, '_wpcraft_custom_css', true
    );
    if ($custom_css) {
      echo '<style id="wpcraft-css-' . 
        esc_attr($post_id) . '">' .
        $custom_css . '</style>';
    }
    
    $fonts = get_post_meta(
      $post_id, '_wpcraft_fonts', true
    );
    if ($fonts) {
      $font_families = array_unique(
        explode('|', $fonts)
      );
      $query = implode('&family=',
        array_map('urlencode', $font_families)
      );
      echo '<link rel="preconnect" 
        href="https://fonts.googleapis.com">';
      echo '<link rel="stylesheet" href="' .
        esc_url(
          'https://fonts.googleapis.com/css2?family=' .
          $query . '&display=swap'
        ) . '">';
    }
  }

  public function regenerate_post_css($post_id) {
    if (class_exists('\Elementor\Plugin')) {
      $css_file = new \Elementor\Core\Files\CSS\Post(
        $post_id
      );
      $css_file->update();
    }
  }

  public function admin_page() {
    require_once WPCRAFT_DIR . 'admin-page.php';
  }
}

WPCraft::instance();

function wpcraft_build_page_css(
  $elements, $post_id, $depth = 0
) {
  $css = '';
  foreach ($elements as $element) {
    $id = $element['id'] ?? '';
    $settings = $element['settings'] ?? [];
    
    if (!empty($settings['_custom_css'])) {
      $raw_css = $settings['_custom_css'];
      if ($id) {
        $raw_css = str_replace(
          'selector',
          '.elementor-element-' . $id,
          $raw_css
        );
      }
      $css .= "\n" . $raw_css;
    }
    
    if (!empty($element['elements'])) {
      $css .= wpcraft_build_page_css(
        $element['elements'],
        $post_id,
        $depth + 1
      );
    }
  }
  return $css;
}

function wpcraft_extract_fonts($elements) {
  $fonts = [
    'Barlow:ital,wght@0,400;0,600;0,700;0,800',
    'Inter:wght@400;500;600'
  ];
  foreach ($elements as $element) {
    $settings = $element['settings'] ?? [];
    if (!empty($settings['typography_font_family'])) {
      $font = sanitize_text_field(
        $settings['typography_font_family']
      );
      $weight = $settings['typography_font_weight'] 
        ?? '400';
      if ($font && !in_array($font, ['', 'inherit'])) {
        $fonts[] = $font . ':wght@' . $weight;
      }
    }
    if (!empty($element['elements'])) {
      $child = wpcraft_extract_fonts(
        $element['elements']
      );
      $fonts = array_merge($fonts, $child);
    }
  }
  return array_unique($fonts);
}
