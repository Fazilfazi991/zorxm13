<?php
/**
 * Plugin Name: WPCraft AI Page Builder
 * Description: Connect your WordPress site to WPCraft AI page generator
 * Version: 1.0.0
 * Author: Zorx
 * Author URI: https://zorx.co
 */

if (!defined('ABSPATH')) exit;

define('WPCRAFT_VERSION', '1.0.0');

class WPCraft {
    
    private static $_instance = null;
    
    public static function instance() {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }
    
    public function __construct() {
        add_action('plugins_loaded', [$this, 'init']);
    }
    
    public function init() {
        // Enqueue script inside Elementor editor only
        add_action(
            'elementor/frontend/after_enqueue_scripts', 
            [$this, 'enqueue_editor_script']
        );
        
        // Handle bridge connection
        add_action('template_redirect', [$this, 'handle_bridge']);
        
        // Admin menu
        add_action('admin_menu', [$this, 'admin_menu']);
        add_action(
            'admin_enqueue_scripts', 
            [$this, 'admin_enqueue']
        );
    }
    
    public function enqueue_editor_script() {
        if (empty($_GET['elementor-preview'])) return;
        
        wp_enqueue_script(
            'wpcraft-elementor',
            plugin_dir_url(__FILE__) . 'assets/wpcraft-elementor.js',
            ['jquery'],
            WPCRAFT_VERSION,
            true
        );
    }
    
    public function handle_bridge() {
        if (empty($_GET['wpcraft_bridge'])) return;
        if (empty($_GET['data'])) {
            echo '<script>window.close();</script>';
            exit;
        }
        
        $data = stripslashes($_GET['data']);
        // Sanitize - only allow valid JSON chars
        $data = preg_replace(
            '/[^\x20-\x7E]/', '', $data
        );
        
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>WPCraft - Connecting...</title>
            <style>
                body { 
                    font-family: sans-serif; 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background: #f0fdf4;
                    flex-direction: column;
                    gap: 12px;
                }
                .icon { font-size: 40px; }
                p { 
                    color: #166534; 
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0;
                }
                small { color: #6b7280; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="icon">✓</div>
            <p>Page ready to paste!</p>
            <small>You can close this window</small>
            <script>
                try {
                    var data = <?php echo json_encode($data); ?>;
                    var parsed = JSON.parse(data);
                    localStorage.setItem(
                        'elementor', 
                        JSON.stringify(parsed)
                    );
                } catch(e) {
                    document.querySelector('p').textContent = 
                        'Error: ' + e.message;
                }
                setTimeout(function() { 
                    window.close(); 
                }, 2000);
            </script>
        </body>
        </html>
        <?php
        exit;
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
            plugin_dir_url(__FILE__) . 'assets/admin.css',
            [],
            WPCRAFT_VERSION
        );
    }
    
    public function admin_page() {
        require_once __DIR__ . '/admin-page.php';
    }
}

WPCraft::instance();
