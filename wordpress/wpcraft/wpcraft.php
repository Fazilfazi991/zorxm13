<?php
/**
 * Plugin Name: WPCraft — AI Page Builder
 * Description: AI-powered page builder. 
 *   Generate and edit pages with AI.
 * Version: 2.0.0
 * Author: Zorx Digital
 * Author URI: https://zorx.co
 */

if (!defined('ABSPATH')) exit;

define('WPCRAFT_VERSION', time());
define('WPCRAFT_DEV_MODE', true);

define('WPCRAFT_DIR', plugin_dir_path(__FILE__));
define('WPCRAFT_URL', plugin_dir_url(__FILE__));

class WPCraft_V2 {

  private static $instance = null;

  public static function instance() {
    if (!self::$instance) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  public function __construct() {
    add_action('init', [$this, 'init']);
  }

  public function init() {
    // Load REST API
    require_once WPCRAFT_DIR . 'includes/api.php';
    require_once WPCRAFT_DIR . 'includes/renderer.php';
    
    // Add "Edit with WPCraft" button 
    // to admin bar
    add_action('admin_bar_menu', 
      [$this, 'admin_bar_button'], 100);
    
    // Add edit button on post list
    add_filter('page_row_actions', 
      [$this, 'page_row_action'], 10, 2);
    add_filter('post_row_actions',
      [$this, 'page_row_action'], 10, 2);
    
    // Handle editor page load via submenu string
    add_action('admin_menu', 
      [$this, 'register_editor_page']);
      
    // Handle true full-screen load prior to admin-header
    add_action('admin_init', 
      [$this, 'intercept_fullscreen_editor']);
    
    // Render page on frontend
    add_filter('the_content',
      [$this, 'render_wpcraft_page']);
    
    // Enqueue frontend styles
    add_action('wp_enqueue_scripts',
      [$this, 'enqueue_frontend']);
  }

  public function admin_bar_button($wp_admin_bar) {
    if (!current_user_can('edit_posts')) return;
    
    // Add main WPCraft menu item
    $wp_admin_bar->add_node([
      'id' => 'wpcraft',
      'title' => '✦ WPCraft',
      'href' => admin_url(
        'admin.php?page=wpcraft-editor'
      ),
    ]);
    
    // If on a singular page/post, 
    // add "Edit this page" option
    if (is_singular()) {
      $post_id = get_the_ID();
      $edit_url = admin_url(
        'admin.php?page=wpcraft-editor&post_id=' 
        . $post_id
      );
      $wp_admin_bar->add_node([
        'id' => 'wpcraft-edit-current',
        'parent' => 'wpcraft',
        'title' => '✦ Edit with WPCraft',
        'href' => $edit_url,
        'meta' => ['target' => '_blank']
      ]);
    }
    
    // Always show "All pages" option
    $wp_admin_bar->add_node([
      'id' => 'wpcraft-all-pages',
      'parent' => 'wpcraft',
      'title' => 'All Pages',
      'href' => admin_url(
        'admin.php?page=wpcraft-editor'
      ),
    ]);
    
    // Create new page option
    $wp_admin_bar->add_node([
      'id' => 'wpcraft-new',
      'parent' => 'wpcraft',
      'title' => '+ New Page',
      'href' => admin_url(
        'admin.php?page=wpcraft-editor&action=new'
      ),
    ]);
  }

  public function page_row_action($actions, $post) {
    if (!current_user_can('edit_post', $post->ID)) {
      return $actions;
    }
    $url = admin_url(
      'admin.php?page=wpcraft-editor&post_id=' . 
      $post->ID
    );
    $actions['wpcraft'] = 
      '<a href="' . $url . '" target="_blank">' .
      '✦ WPCraft</a>';
    return $actions;
  }

  public function register_editor_page() {
    add_menu_page(
      'WPCraft Editor',
      'WPCraft',
      'edit_posts',
      'wpcraft-editor',
      [$this, 'render_editor'],
      'dashicons-art',
      30
    );
    add_submenu_page(
      'wpcraft-editor',
      'Settings',
      'Settings', 
      'manage_options',
      'wpcraft-settings',
      [$this, 'render_settings']
    );
  }

  public function render_settings() {
    if (isset($_POST['wpcraft_email'])) {
      check_admin_referer('wpcraft_settings');
      
      $email = sanitize_email(
        $_POST['wpcraft_email']
      );
      $site_url = get_site_url();
      
      // Call activation endpoint
      $response = wp_remote_post(
        'https://zorxm13.vercel.app/api/license',
        [
          'timeout' => 15,
          'headers' => [
            'Content-Type' => 'application/json'
          ],
          'body' => json_encode([
            'action' => 'activate',
            'email' => $email,
            'site_url' => $site_url
          ])
        ]
      );
      
      if (!is_wp_error($response)) {
        $data = json_decode(
          wp_remote_retrieve_body($response), true
        );
        if (!empty($data['license_key'])) {
          update_option(
            'wpcraft_license_key', 
            $data['license_key']
          );
          update_option(
            'wpcraft_email', $email
          );
          update_option(
            'wpcraft_credits', $data['credits']
          );
          echo '<div class="notice notice-success">
            <p>✦ Activated! License key: <strong>' .
            esc_html($data['license_key']) .
            '</strong><br>Credits: ' .
            intval($data['credits']) .
            ' free generations.</p></div>';
        }
      }
    }
    
    $license = get_option('wpcraft_license_key', '');
    $email = get_option('wpcraft_email', '');
    $credits = get_option('wpcraft_credits', 0);
    ?>
    <div class="wrap">
      <h1>✦ WPCraft Settings</h1>
      
      <?php if ($license): ?>
      <div class="notice notice-info">
        <p>
          <strong>Status:</strong> Active<br>
          <strong>License:</strong> 
            <?php echo esc_html($license); ?><br>
          <strong>Credits remaining:</strong> 
            <?php echo intval($credits); ?>
          <?php if ($credits <= 0): ?>
            — <a href="https://zorxm13.vercel.app/pricing" 
                 target="_blank">
                 Upgrade for more →
               </a>
          <?php endif; ?>
        </p>
      </div>
      <?php endif; ?>

      <form method="post">
        <?php wp_nonce_field('wpcraft_settings'); ?>
        <table class="form-table">
          <tr>
            <th>Email address</th>
            <td>
              <input type="email"
                name="wpcraft_email"
                value="<?php echo esc_attr($email); ?>"
                class="regular-text"
                placeholder="your@email.com"
              />
              <p class="description">
                Enter your email to activate WPCraft.
                You get 3 free AI generations.
              </p>
            </td>
          </tr>
        </table>
        <?php submit_button(
          $license ? 'Refresh License' : 'Activate WPCraft'
        ); ?>
      </form>
    </div>
    <?php
  }

  public function intercept_fullscreen_editor() {
    if (isset($_GET['page']) && strpos($_GET['page'], 'wpcraft') === 0) {
      if ($_GET['page'] === 'wpcraft-editor' && !empty($_GET['post_id'])) {
        $this->render_editor();
      } else {
        // Inject CSS to hide WP Admin menu for settings and page selector
        add_action('admin_head', function() {
          echo '<style>
            #adminmenumain, #wpadminbar, #wpfooter { display: none !important; }
            #wpcontent { margin-left: 0 !important; padding: 40px !important; background: #fff !important; min-height: 100vh; }
            html.wp-toolbar { padding-top: 0 !important; }
            body { background: #fff !important; }
          </style>';
        });
      }
    }
  }

  public function render_editor() {
    // Handle "new page" action
    if (($_GET['action'] ?? '') === 'new') {
      $post_id = wp_insert_post([
        'post_title' => 'New Page',
        'post_status' => 'draft',
        'post_type' => 'page',
        'post_content' => ''
      ]);
      if ($post_id && !is_wp_error($post_id)) {
        wp_redirect(admin_url(
          'admin.php?page=wpcraft-editor&post_id=' 
          . $post_id
        ));
        exit;
      }
    }

    $post_id = intval($_GET['post_id'] ?? 0);
    
    if (!$post_id) {
      $this->render_page_selector();
      return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
      wp_die('Permission denied');
    }
    
    $post = get_post($post_id);
    if (!$post) wp_die('Page not found');
    
    // Create a fresh nonce
    $nonce = wp_create_nonce('wp_rest');
    $api_base = rest_url('wpcraft/v2/');
    
    // Load and convert existing data
    $existing_data = get_post_meta(
      $post_id, '_wpcraft_data', true
    );
    
    // Purge corrupted JSON metadata left over from the update_post_meta slashes bug
    if (is_string($existing_data) && !empty($existing_data)) {
      $test_decode = json_decode($existing_data, true);
      if (json_last_error() !== JSON_ERROR_NONE || empty($test_decode['sections'])) {
        $existing_data = '';
        delete_post_meta($post_id, '_wpcraft_data');
      }
    }
    
    // Legacy Elementor conversion removed. WPCraft is now strictly standalone.
    
    // Parse it back to array to ensure validity and allow safe JSON printing
    $page_data_obj = is_string($existing_data) 
      ? json_decode($existing_data ?: '{}', true) 
      : (is_array($existing_data) ? $existing_data : []);
      
    if (!$page_data_obj) {
      $page_data_obj = ['sections' => []];
    }
    
    $has_content = false;
    if (is_array($page_data_obj) && !empty($page_data_obj['sections'])) {
      $has_content = true;
    } elseif (is_object($page_data_obj) && !empty($page_data_obj->sections)) {
      $has_content = true;
    }
    
    // Must call these to set up WP properly
    // before outputting custom HTML
    remove_all_actions('wp_head');
    remove_all_actions('wp_footer');
    
    ?>
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" 
        content="width=device-width,initial-scale=1">
      <title>WPCraft — 
        <?php echo esc_html($post->post_title); ?>
      </title>
      <?php
      // This is critical — outputs the WP 
      // admin cookies and auth headers
      wp_enqueue_script('jquery');
      ?>
      <style>
        * { margin:0;padding:0;box-sizing:border-box; }
        html,body { 
          width:100%;height:100%;
          overflow:hidden;background:#111;
        }
        #wpcraft-editor { width:100%;height:100vh; }
      </style>
      
      <!-- Critical: config must be in head to bypass caching plugin deferrals -->
      <script data-cfasync="false" data-no-optimize="1">
        (function() {
          var cfg = {
            postId: <?php echo intval($post_id); ?>,
            postTitle: <?php echo wp_json_encode($post->post_title); ?>,
            nonce: <?php echo wp_json_encode($nonce); ?>,
            apiBase: <?php echo wp_json_encode($api_base); ?>,
            hasExistingContent: <?php echo $has_content ? 'true' : 'false'; ?>,
            siteUrl: <?php echo wp_json_encode(get_site_url()); ?>,
            adminUrl: <?php echo wp_json_encode(admin_url()); ?>,
            pageData: <?php echo wp_json_encode($page_data_obj); ?>
          };
          window.WPCRAFT_CONFIG = cfg;
        })();
      </script>
    </head>
    <body>
      <div id="wpcraft-editor"></div>
      
      <?php
      // Output jQuery (needed for WP REST auth)
      wp_print_scripts('jquery');
      
      // Cache-bust assets securely on load
      $version = defined('WPCRAFT_VERSION') ? WPCRAFT_VERSION : time();
      $js = WPCRAFT_URL . 'editor/assets/index.js?ver=' . $version;
      $css = WPCRAFT_URL . 'editor/assets/index.css?ver=' . $version;
      ?>
      
      <link rel="stylesheet" 
        href="<?php echo esc_url($css); ?>">
      <script type="module" 
        src="<?php echo esc_url($js); ?>">
      </script>
    </body>
    </html>
    <?php
    exit;
  }

  private function render_page_selector() {
    $pages = get_posts([
      'post_type' => ['page', 'post'],
      'posts_per_page' => 30,
      'post_status' => ['publish', 'draft'],
      'orderby' => 'modified',
      'order' => 'DESC'
    ]);
    
    $nonce = wp_create_nonce('wpcraft_new_page');
    ?>
    <div class="wrap" style="max-width:800px;">
      
      <div style="display:flex;align-items:center;
        justify-content:space-between;
        margin:24px 0 16px;">
        <h1 style="margin:0;">
          ✦ WPCraft Editor
        </h1>
        <form method="post" style="margin:0;">
          <?php wp_nonce_field(
            'wpcraft_new_page', 
            'wpcraft_nonce'
          ); ?>
          <input type="hidden" 
            name="wpcraft_action" 
            value="create_page">
          <input type="text" 
            name="page_title"
            placeholder="New page title..."
            style="padding:6px 12px;
              border:1px solid #ddd;
              border-radius:4px;
              margin-right:8px;
              font-size:14px;
              width:220px;">
          <button type="submit" 
            class="button button-primary"
            style="height:34px;">
            + Create New Page
          </button>
        </form>
      </div>

      <?php
      // Handle new page creation
      if (isset($_POST['wpcraft_action']) && 
          $_POST['wpcraft_action'] === 'create_page' &&
          wp_verify_nonce(
            $_POST['wpcraft_nonce'], 
            'wpcraft_new_page'
          )) {
        
        $title = sanitize_text_field(
          $_POST['page_title'] ?? 'Untitled Page'
        );
        if (empty($title)) $title = 'Untitled Page';
        
        $post_id = wp_insert_post([
          'post_title' => $title,
          'post_status' => 'draft',
          'post_type' => 'page',
          'post_content' => ''
        ]);
        
        if ($post_id && !is_wp_error($post_id)) {
          $editor_url = admin_url(
            'admin.php?page=wpcraft-editor&post_id=' 
            . $post_id
          );
          wp_redirect($editor_url);
          exit;
        }
      }
      ?>

      <?php if (empty($pages)): ?>
        <div style="text-align:center;
          padding:60px 20px;
          background:#f9f9f9;
          border-radius:8px;
          border:1px solid #e0e0e0;">
          <div style="font-size:32px;
            margin-bottom:12px;opacity:0.3;">
            ✦
          </div>
          <p style="color:#666;margin:0 0 16px;">
            No pages yet. Create your first page.
          </p>
        </div>
      <?php else: ?>
        <table class="wp-list-table widefat 
          fixed striped">
          <thead>
            <tr>
              <th style="width:40%">Page title</th>
              <th style="width:15%">Status</th>
              <th style="width:25%">
                Last modified
              </th>
              <th style="width:20%">Action</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($pages as $page): 
              $editor_url = admin_url(
                'admin.php?page=wpcraft-editor&post_id=' 
                . $page->ID
              );
              $has_wpcraft = get_post_meta(
                $page->ID, '_wpcraft_data', true
              );
              $badge = '';
              if ($has_wpcraft) {
                $badge = '<span style="background:#d4edda;color:#155724;font-size:10px;padding:1px 6px;border-radius:10px;margin-left:6px;">WPCraft</span>';
              }
            ?>
            <tr>
              <td>
                <strong>
                  <?php echo esc_html(
                    $page->post_title ?: 
                    '(No title)'
                  ); ?>
                </strong>
                <?php echo $badge; ?>
              </td>
              <td>
                <span style="text-transform:capitalize;">
                  <?php echo esc_html(
                    $page->post_status
                  ); ?>
                </span>
              </td>
              <td style="color:#666;font-size:13px;">
                <?php echo human_time_diff(
                  strtotime($page->post_modified),
                  current_time('timestamp')
                ) . ' ago'; ?>
              </td>
              <td>
                <a href="<?php echo esc_url(
                  $editor_url
                ); ?>"
                  class="button button-primary"
                  style="font-size:12px;
                    padding:2px 10px;
                    height:26px;
                    line-height:24px;">
                  ✦ Edit with WPCraft
                </a>
              </td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>

      <div style="margin-top:20px;padding:16px;
        background:#f0f7ff;border-radius:8px;
        border-left:4px solid #166534;">
        <p style="margin:0;font-size:13px;
          color:#444;">
          <strong>✦ WPCraft</strong> — 
          Pages marked "WPCraft" are fully 
          managed by WPCraft.
        </p>
      </div>
      
    </div>
    <?php
  }

  public function render_wpcraft_page($content) {
    if (!is_singular()) return $content;
    
    $post_id = get_the_ID();
    $wpcraft_data = get_post_meta(
      $post_id, '_wpcraft_data', true
    );
    
    if (!$wpcraft_data) return $content;
    
    $data = is_string($wpcraft_data) 
      ? json_decode($wpcraft_data, true) 
      : (is_array($wpcraft_data) ? $wpcraft_data : []);
      
    if (!$data || empty($data['sections'])) {
      return $content;
    }
    
    return wpcraft_render_page($data);
  }

  public function enqueue_frontend() {
    if (!is_singular()) return;
    $post_id = get_the_ID();
    $has_wpcraft = get_post_meta(
      $post_id, '_wpcraft_data', true
    );
    if (!$has_wpcraft) return;
    
    // Enqueue Google Fonts
    wp_enqueue_style(
      'wpcraft-fonts',
      'https://fonts.googleapis.com/css2?' .
      'family=Inter:wght@400;500;600;700&' .
      'family=DM+Sans:wght@400;500;600;700;800&' .
      'display=swap',
      [], null
    );
    
    // Inline reset styles
    wp_add_inline_style('wpcraft-fonts', '
      .wpcraft-page * { box-sizing: border-box; }
      .wpcraft-page img { max-width: 100%; }
      .wpcraft-page a { text-decoration: none; }
    ');
  }
}

WPCraft_V2::instance();
