<?php
/**
 * Elementor Setup & Widget Registration
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Register ZORX Widget Category
 */
function zorx_add_elementor_widget_categories($elements_manager)
{
    $elements_manager->add_category(
        'zorx-components',
        [
            'title' => esc_html__('ZORX Components', 'zorx-theme'),
            'icon' => 'fa fa-plug',
        ]
    );
}
add_action('elementor/elements/categories_registered', 'zorx_add_elementor_widget_categories');

/**
 * Register Widgets
 */
function zorx_register_elementor_widgets($widgets_manager)
{
    require_once(__DIR__ . '/../elementor-widgets/class-hero-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-about-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-services-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-why-choose-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-process-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-stats-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-testimonials-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-cta-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-breadcrumb-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-team-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-header-widget.php');
    require_once(__DIR__ . '/../elementor-widgets/class-footer-widget.php');

    $widgets_manager->register(new \Zorx_Hero_Widget());
    $widgets_manager->register(new \Zorx_About_Widget());
    $widgets_manager->register(new \Zorx_Services_Widget());
    $widgets_manager->register(new \Zorx_Why_Choose_Widget());
    $widgets_manager->register(new \Zorx_Process_Widget());
    $widgets_manager->register(new \Zorx_Stats_Widget());
    $widgets_manager->register(new \Zorx_Testimonials_Widget());
    $widgets_manager->register(new \Zorx_CTA_Widget());
    $widgets_manager->register(new \Zorx_Breadcrumb_Widget());
    $widgets_manager->register(new \Zorx_Team_Widget());
    $widgets_manager->register(new \Zorx_Header_Widget());
    $widgets_manager->register(new \Zorx_Footer_Widget());
}
add_action('elementor/widgets/register', 'zorx_register_elementor_widgets');

/**
 * Admin Notice if Elementor not active
 */
function zorx_elementor_missing_notice()
{
    if (!did_action('elementor/loaded')) {
        $message = sprintf(
            /* translators: 1: Plugin name 2: Elementor */
            esc_html__('"%1$s" requires "%2$s" to be installed and activated.', 'zorx-theme'),
            '<strong>' . esc_html__('ZORX Theme', 'zorx-theme') . '</strong>',
            '<strong>' . esc_html__('Elementor', 'zorx-theme') . '</strong>'
        );

        printf('<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message);
    }
}
add_action('admin_notices', 'zorx_elementor_missing_notice');
