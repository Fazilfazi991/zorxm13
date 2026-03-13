<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX CTA Widget.
 *
 * Elementor widget that displays the Call to Action section.
 */
class Zorx_CTA_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_cta';
    }

    public function get_title()
    {
        return esc_html__('CTA Section', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-call-to-action';
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
            'heading',
            [
                'label' => esc_html__('Heading', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Ready to Grow Your Business Online?', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'description',
            [
                'label' => esc_html__('Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('Let\'s build a digital strategy that delivers real results. Schedule a free consultation with our team and discover how we can accelerate your growth.', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'btn_primary_text',
            [
                'label' => esc_html__('Primary Button Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Book a Free Consultation', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'btn_primary_link',
            [
                'label' => esc_html__('Primary Button Link', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::URL,
                'placeholder' => esc_html__('https://your-link.com', 'zorx-theme'),
                'default' => [
                    'url' => '#',
                ],
            ]
        );

        $this->add_control(
            'btn_secondary_text',
            [
                'label' => esc_html__('Secondary Button Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Contact Us', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'btn_secondary_link',
            [
                'label' => esc_html__('Secondary Button Link', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::URL,
                'placeholder' => esc_html__('https://your-link.com', 'zorx-theme'),
                'default' => [
                    'url' => '#',
                ],
            ]
        );

        $this->add_control(
            'footer_text',
            [
                'label' => esc_html__('Footer Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('No commitment required • 30-minute strategy session • 100% free', 'zorx-theme'),
            ]
        );

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        ?>
        <section class="p-6 md:p-24 relative overflow-hidden">
            <!-- Background decoration -->
            <div class="absolute inset-0">
                <div
                    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl">
                </div>
            </div>

            <div class="relative z-10 max-w-7xl mx-auto">
                <div class="max-w-3xl mx-auto text-center">
                    <h2 class="heading-section text-foreground mb-6">
                        <?php echo esc_html($settings['heading']); ?>
                    </h2>

                    <p class="text-xl text-muted-foreground mb-10">
                        <?php echo esc_html($settings['description']); ?>
                    </p>

                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <?php if (!empty($settings['btn_primary_text'])): ?>
                            <a href="<?php echo esc_url($settings['btn_primary_link']['url']); ?>"
                                class="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 py-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 group">
                                <?php echo esc_html($settings['btn_primary_text']); ?>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </a>
                        <?php endif; ?>

                        <?php if (!empty($settings['btn_secondary_text'])): ?>
                            <a href="<?php echo esc_url($settings['btn_secondary_link']['url']); ?>"
                                class="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 py-2">
                                <?php echo esc_html($settings['btn_secondary_text']); ?>
                            </a>
                        <?php endif; ?>
                    </div>

                    <?php if (!empty($settings['footer_text'])): ?>
                        <p class="mt-6 text-sm text-muted-foreground">
                            <?php echo esc_html($settings['footer_text']); ?>
                        </p>
                    <?php endif; ?>
                </div>
            </div>
        </section>
        <?php
    }
}
