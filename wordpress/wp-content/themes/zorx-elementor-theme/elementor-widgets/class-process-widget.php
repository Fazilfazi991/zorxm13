<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Process Widget.
 *
 * Elementor widget that displays the process steps.
 */
class Zorx_Process_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_process';
    }

    public function get_title()
    {
        return esc_html__('Process Steps', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-history';
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
                'default' => esc_html__('Our Process', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'heading',
            [
                'label' => esc_html__('Heading', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Our Proven Process', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'description',
            [
                'label' => esc_html__('Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('A systematic approach to digital success that has helped dozens of UAE businesses achieve their goals.', 'zorx-theme'),
            ]
        );

        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'step_number',
            [
                'label' => esc_html__('Step Number', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('01', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'step_title',
            [
                'label' => esc_html__('Step Title', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Step Name', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'step_description',
            [
                'label' => esc_html__('Step Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('Step description goes here.', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'step_icon',
            [
                'label' => esc_html__('Icon', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::ICONS,
                'default' => [
                    'value' => 'fas fa-lightbulb',
                    'library' => 'fa-solid',
                ],
            ]
        );

        $this->add_control(
            'steps',
            [
                'label' => esc_html__('Process Steps', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'default' => [
                    [
                        'step_number' => '01',
                        'step_title' => esc_html__('Discover', 'zorx-theme'),
                        'step_description' => esc_html__('We dive deep into understanding your business, goals, target audience, and competitive landscape.', 'zorx-theme'),
                        'step_icon' => ['value' => 'fas fa-lightbulb', 'library' => 'fa-solid'],
                    ],
                    [
                        'step_number' => '02',
                        'step_title' => esc_html__('Strategize', 'zorx-theme'),
                        'step_description' => esc_html__('We build a custom growth plan tailored to your unique needs and market opportunities.', 'zorx-theme'),
                        'step_icon' => ['value' => 'fas fa-bullseye', 'library' => 'fa-solid'],
                    ],
                    [
                        'step_number' => '03',
                        'step_title' => esc_html__('Execute', 'zorx-theme'),
                        'step_description' => esc_html__('We launch and optimize campaigns with precision, ensuring every element works towards your goals.', 'zorx-theme'),
                        'step_icon' => ['value' => 'fas fa-rocket', 'library' => 'fa-solid'],
                    ],
                    [
                        'step_number' => '04',
                        'step_title' => esc_html__('Scale', 'zorx-theme'),
                        'step_description' => esc_html__('We track, analyze, and continuously improve to maximize your ROI and drive sustainable growth.', 'zorx-theme'),
                        'step_icon' => ['value' => 'fas fa-chart-line', 'library' => 'fa-solid'],
                    ],
                ],
                'title_field' => '{{{ step_title }}}',
            ]
        );

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        ?>
        <section class="p-6 md:p-24">
            <div class="max-w-7xl mx-auto">
                <div class="text-center max-w-3xl mx-auto mb-16">
                    <?php if (!empty($settings['badge_text'])): ?>
                        <div
                            class="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-4">
                            <?php echo esc_html($settings['badge_text']); ?>
                        </div>
                    <?php endif; ?>

                    <h2 class="heading-section text-foreground mb-4">
                        <?php echo esc_html($settings['heading']); ?>
                    </h2>
                    <p class="text-lg text-muted-foreground">
                        <?php echo esc_html($settings['description']); ?>
                    </p>
                </div>

                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <?php
                    if ($settings['steps']):
                        $count = count($settings['steps']);
                        foreach ($settings['steps'] as $index => $item):
                            ?>
                            <div class="relative group">
                                <!-- Connector line -->
                                <?php if ($index < $count - 1): ?>
                                    <div class="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0">
                                        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
                                    </div>
                                <?php endif; ?>

                                <div
                                    class="relative bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 z-10">
                                    <div class="flex items-center gap-4 mb-4">
                                        <div class="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                                            <?php \Elementor\Icons_Manager::render_icon($item['step_icon'], ['aria-hidden' => 'true', 'class' => 'w-6 h-6 text-primary-foreground']); ?>
                                        </div>
                                        <span
                                            class="text-4xl font-extrabold text-primary/20"><?php echo esc_html($item['step_number']); ?></span>
                                    </div>

                                    <h3 class="text-xl font-bold text-foreground mb-2">
                                        <?php echo esc_html($item['step_title']); ?>
                                    </h3>

                                    <p class="text-muted-foreground">
                                        <?php echo esc_html($item['step_description']); ?>
                                    </p>
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
