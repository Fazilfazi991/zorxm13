<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX About Widget.
 *
 * Elementor widget that displays the about section.
 */
class Zorx_About_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_about';
    }

    public function get_title()
    {
        return esc_html__('About Section', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-info-box';
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
            'badge_text',
            [
                'label' => esc_html__('Badge Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('About Us', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'heading',
            [
                'label' => esc_html__('Heading', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Who We Are', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'description_1',
            [
                'label' => esc_html__('First Paragraph', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('ZORX is a Dubai-based digital marketing agency specializing in performance-focused marketing solutions. We combine creativity, analytics, and technology to deliver measurable results for brands across the UAE.', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'description_2',
            [
                'label' => esc_html__('Second Paragraph', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('With deep expertise in the Gulf market and a passion for digital innovation, we craft strategies that don\'t just look good—they drive real business growth. From startups to enterprises, we\'ve helped businesses across every industry achieve their digital ambitions.', 'zorx-theme'),
            ]
        );

        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'list_title',
            [
                'label' => esc_html__('Title', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Feature Name', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'list_icon',
            [
                'label' => esc_html__('Icon', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::ICONS,
                'default' => [
                    'value' => 'fas fa-check',
                    'library' => 'fa-solid',
                ],
            ]
        );

        $this->add_control(
            'highlights',
            [
                'label' => esc_html__('Highlights', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'default' => [
                    [
                        'list_title' => esc_html__('Dubai Market Experts', 'zorx-theme'),
                        'list_icon' => ['value' => 'fas fa-map-marker-alt', 'library' => 'fa-solid'],
                    ],
                    [
                        'list_title' => esc_html__('ROI-Focused Strategies', 'zorx-theme'),
                        'list_icon' => ['value' => 'fas fa-bullseye', 'library' => 'fa-solid'],
                    ],
                    [
                        'list_title' => esc_html__('Certified Specialists', 'zorx-theme'),
                        'list_icon' => ['value' => 'fas fa-users', 'library' => 'fa-solid'],
                    ],
                    [
                        'list_title' => esc_html__('Transparent Reporting', 'zorx-theme'),
                        'list_icon' => ['value' => 'fas fa-file-alt', 'library' => 'fa-solid'],
                    ],
                ],
                'title_field' => '{{{ list_title }}}',
            ]
        );

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        ?>
        <section id="about" class="p-6 md:p-24">
            <div class="max-w-7xl mx-auto">
                <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <!-- Left - Content -->
                    <div class="space-y-6">
                        <?php if (!empty($settings['badge_text'])): ?>
                            <div class="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground">
                                <?php echo esc_html($settings['badge_text']); ?>
                            </div>
                        <?php endif; ?>

                        <h2 class="heading-section text-foreground">
                            <?php echo esc_html($settings['heading']); ?>
                        </h2>

                        <p class="text-lg text-muted-foreground leading-relaxed">
                            <?php echo esc_html($settings['description_1']); ?>
                        </p>

                        <p class="text-muted-foreground leading-relaxed">
                            <?php echo esc_html($settings['description_2']); ?>
                        </p>
                    </div>

                    <!-- Right - Highlights Grid -->
                    <div class="grid grid-cols-2 gap-4">
                        <?php
                        if ($settings['highlights']):
                            foreach ($settings['highlights'] as $index => $item):
                                ?>
                                <div class="group p-6 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                                    style="animation-delay: <?php echo esc_attr($index * 0.1); ?>s">
                                    <div
                                        class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <?php \Elementor\Icons_Manager::render_icon($item['list_icon'], ['aria-hidden' => 'true', 'class' => 'w-6 h-6 text-primary']); ?>
                                    </div>
                                    <h3 class="font-semibold text-foreground"><?php echo esc_html($item['list_title']); ?></h3>
                                </div>
                                <?php
                            endforeach;
                        endif;
                        ?>
                    </div>
                </div>
            </div>
        </section>
        <?php
    }
}
