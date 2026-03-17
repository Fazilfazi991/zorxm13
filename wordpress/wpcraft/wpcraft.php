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
        
        // Register REST API init
        add_action('rest_api_init', [$this, 'register_routes']);
        
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
        
        wp_localize_script(
            'wpcraft-elementor',
            'wpcraftData',
            [
                'postID' => get_the_ID(),
                'ajaxurl' => admin_url('admin-ajax.php'),
                'restUrl' => rest_url('wpcraft/v1/'),
                'nonce' => wp_create_nonce('wp_rest'),
                'siteUrl' => get_site_url(),
            ]
        );
    }
    
    public function register_routes() {
        // Endpoint to receive generated page data
        // and inject into Elementor localStorage
        register_rest_route('wpcraft/v1', '/inject', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_inject'],
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            }
        ]);
        
        // Endpoint to verify plugin is installed
        register_rest_route('wpcraft/v1', '/ping', [
            'methods' => 'GET',
            'callback' => function() {
                return rest_ensure_response([
                    'status' => 'ok',
                    'version' => WPCRAFT_VERSION,
                    'site' => get_site_url()
                ]);
            },
            'permission_callback' => '__return_true'
        ]);

        // REST endpoint to check for pending inject data
        register_rest_route('wpcraft/v1', '/check-inject', [
            'methods' => 'GET',
            'callback' => function($request) {
                $post_id = $request->get_param('post_id');
                $elements = get_transient(
                    'wpcraft_inject_' . $post_id
                );
                
                if ($elements) {
                    // Delete after reading (one-time use)
                    delete_transient('wpcraft_inject_' . $post_id);
                    return rest_ensure_response([
                        'status' => 'ok',
                        'elements' => $elements
                    ]);
                }
                
                return rest_ensure_response([
                    'status' => 'empty',
                    'elements' => []
                ]);
            },
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            }
        ]);
    }
    
    public function handle_inject($request) {
        $params = $request->get_json_params();
        $elements = $params['elements'] ?? [];
        $post_id = $params['post_id'] ?? 0;
        
        if (empty($elements) || empty($post_id)) {
            return new WP_Error(
                'missing_data', 
                'Missing elements or post_id', 
                ['status' => 400]
            );
        }
        
        // Store the elements in a transient
        // The editor JS will pick this up on next load
        set_transient(
            'wpcraft_inject_' . $post_id, 
            $elements, 
            300 // 5 minute expiry
        );
        
        return rest_ensure_response([
            'status' => 'ok',
            'message' => 'Page ready to inject',
            'post_id' => $post_id
        ]);
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
