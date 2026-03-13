<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Stats Widget.
 *
 * Elementor widget that displays the stats section.
 */
class Zorx_Stats_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_stats';
    }

    public function get_title()
    {
        return esc_html__('Stats Section', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-counter-circle';
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

        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'stat_value',
            [
                'label' => esc_html__('Value', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '200%+',
            ]
        );

        $repeater->add_control(
            'stat_label',
            [
                'label' => esc_html__('Label', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Stat Label', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'stats',
            [
                'label' => esc_html__('Stats List', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'default' => [
                    ['stat_value' => '200%+', 'stat_label' => esc_html__('Average ROI', 'zorx-theme')],
                    ['stat_value' => '100+', 'stat_label' => esc_html__('Successful Campaigns', 'zorx-theme')],
                    ['stat_value' => '50+', 'stat_label' => esc_html__('UAE Clients', 'zorx-theme')],
                    ['stat_value' => '5+', 'stat_label' => esc_html__('Years Experience', 'zorx-theme')],
                ],
                'title_field' => '{{{ stat_label }}}',
            ]
        );

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        ?>
        <section class="p-6 md:p-24 relative overflow-hidden">
            <!-- Decorative elements -->
            <div class="absolute inset-0">
                <div
                    class="absolute top-0 left-0 w-72 h-72 bg-primary-foreground/5 rounded-full -translate-x-1/2 -translate-y-1/2">
                </div>
                <div
                    class="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full translate-x-1/2 translate-y-1/2">
                </div>
            </div>

            <div class="relative z-10 max-w-7xl mx-auto">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    <?php
                    if ($settings['stats']):
                        foreach ($settings['stats'] as $item):
                            ?>
                            <div class="text-center">
                                <div class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-2">
                                    <?php echo esc_html($item['stat_value']); ?>
                                </div>
                                <div class="text-primary-foreground/80 font-medium">
                                    <?php echo esc_html($item['stat_label']); ?>
                                </div>
                            </div>
                            <?php
                        endforeach;
                    endif;
                    ?>
                </div>
            </div>
        </section>
        <?php
    }
}
