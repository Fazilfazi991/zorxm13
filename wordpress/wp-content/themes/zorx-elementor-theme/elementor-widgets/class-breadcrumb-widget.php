<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Breadcrumb Widget.
 *
 * Elementor widget that displays the breadcrumb navigation.
 */
class Zorx_Breadcrumb_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_breadcrumb';
    }

    public function get_title()
    {
        return esc_html__('Breadcrumb', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-product-breadcrumbs';
    }

    public function get_categories()
    {
        return ['zorx-components'];
    }

    protected function register_controls()
    {

        $this->start_controls_section(
            'content_section',
            [
                'label' => esc_html__('Content', 'zorx-theme'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'alignment',
            [
                'label' => esc_html__('Alignment', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::CHOOSE,
                'options' => [
                    'left' => [
                        'title' => esc_html__('Left', 'zorx-theme'),
                        'icon' => 'eicon-text-align-left',
                    ],
                    'center' => [
                        'title' => esc_html__('Center', 'zorx-theme'),
                        'icon' => 'eicon-text-align-center',
                    ],
                    'right' => [
                        'title' => esc_html__('Right', 'zorx-theme'),
                        'icon' => 'eicon-text-align-right',
                    ],
                ],
                'default' => 'center',
                'selectors' => [
                    '{{WRAPPER}} .zorx-breadcrumb' => 'text-align: {{VALUE}};',
                ],
            ]
        );

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();

        if (is_front_page()) {
            return;
        }

        echo '<div class="zorx-breadcrumb text-sm text-muted-foreground py-4">';
        echo '<div class="">';
        echo '<a href="' . esc_url(home_url('/')) . '" class="hover:text-primary transition-colors">' . esc_html__('Home', 'zorx-theme') . '</a>';
        echo ' <span class="mx-2 text-muted-foreground/50">/</span> ';

        if (is_page() || is_single()) {
            the_title('<span class="text-primary font-medium">', '</span>');
        } elseif (is_archive()) {
            the_archive_title('<span class="text-primary font-medium">', '</span>');
        } elseif (is_search()) {
            echo '<span class="text-primary font-medium">' . esc_html__('Search Results', 'zorx-theme') . '</span>';
        } else {
            echo '<span class="text-primary font-medium">' . get_the_title() . '</span>';
        }

        echo '</div>';
        echo '</div>';
    }
}
