<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Services Widget.
 *
 * Elementor widget that displays the services section.
 */
class Zorx_Services_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_services';
    }

    public function get_title()
    {
        return esc_html__('Services Section', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-gallery-grid';
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
                'default' => esc_html__('Our Services', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'heading',
            [
                'label' => esc_html__('Heading', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Our Digital Marketing Services', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'description',
            [
                'label' => esc_html__('Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('Comprehensive digital solutions designed to grow your business and maximize your online presence.', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'columns',
            [
                'label' => esc_html__('Columns (Desktop)', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => '3',
                'options' => [
                    '2' => esc_html__('2 Columns', 'zorx-theme'),
                    '3' => esc_html__('3 Columns', 'zorx-theme'),
                    '4' => esc_html__('4 Columns', 'zorx-theme'),
                ],
            ]
        );

        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'service_title',
            [
                'label' => esc_html__('Title', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Service Name', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'service_description',
            [
                'label' => esc_html__('Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('Service description goes here.', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'service_icon',
            [
                'label' => esc_html__('Icon', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::ICONS,
                'default' => [
                    'value' => 'fas fa-search',
                    'library' => 'fa-solid',
                ],
            ]
        );

        $repeater->add_control(
            'service_link',
            [
                'label' => esc_html__('Link', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::URL,
                'placeholder' => esc_html__('https://your-link.com', 'zorx-theme'),
                'default' => [
                    'url' => '#',
                ],
            ]
        );

        $this->add_control(
            'services',
            [
                'label' => esc_html__('Services List', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'default' => [
                    [
                        'service_title' => esc_html__('Search Engine Optimization (SEO)', 'zorx-theme'),
                        'service_description' => esc_html__('Improve rankings, visibility, and organic traffic with data-driven SEO strategies tailored for the UAE market.', 'zorx-theme'),
                        'service_icon' => ['value' => 'fas fa-search', 'library' => 'fa-solid'],
                    ],
                    [
                        'service_title' => esc_html__('Google Ads & PPC', 'zorx-theme'),
                        'service_description' => esc_html__('High-converting paid campaigns with measurable ROI. We optimize every dirham of your ad spend.', 'zorx-theme'),
                        'service_icon' => ['value' => 'fas fa-mouse-pointer', 'library' => 'fa-solid'],
                    ],
                    [
                        'service_title' => esc_html__('Social Media Marketing', 'zorx-theme'),
                        'service_description' => esc_html__('Grow your brand on Instagram, Facebook, LinkedIn & TikTok with engaging content and targeted campaigns.', 'zorx-theme'),
                        'service_icon' => ['value' => 'fas fa-share-alt', 'library' => 'fa-solid'],
                    ],
                ],
                'title_field' => '{{{ service_title }}}',
            ]
        );

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        ?>
        <section id="services" class="p-6 md:p-24">
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

                <div class="grid md:grid-cols-2 <?php echo esc_attr('lg:grid-cols-' . $settings['columns']); ?> gap-6">
                    <?php
                    if ($settings['services']):
                        foreach ($settings['services'] as $item):
                            ?>
                            <div
                                class="group relative p-8 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                <!-- Hover gradient overlay -->
                                <div
                                    class="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                                </div>

                                <div class="relative z-10">
                                    <div
                                        class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                        <?php \Elementor\Icons_Manager::render_icon($item['service_icon'], ['aria-hidden' => 'true', 'class' => 'w-7 h-7 text-primary']); ?>
                                    </div>

                                    <h3 class="text-xl font-bold text-foreground mb-3">
                                        <?php echo esc_html($item['service_title']); ?>
                                    </h3>

                                    <p class="text-muted-foreground leading-relaxed mb-6">
                                        <?php echo esc_html($item['service_description']); ?>
                                    </p>

                                    <a href="<?php echo esc_url($item['service_link']['url']); ?>"
                                        class="flex items-center text-primary font-medium group/link cursor-pointer no-underline">
                                        <?php esc_html_e('Learn more', 'zorx-theme'); ?>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1">
                                            <path d="M5 12h14" />
                                            <path d="m12 5 7 7-7 7" />
                                        </svg>
                                    </a>
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
