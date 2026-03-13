<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Testimonials Widget.
 *
 * Elementor widget that displays the testimonials section.
 */
class Zorx_Testimonials_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_testimonials';
    }

    public function get_title()
    {
        return esc_html__('Testimonials Section', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-testimonial';
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
                'default' => esc_html__('Testimonials', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'heading',
            [
                'label' => esc_html__('Heading', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('What Our Clients Say', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'description',
            [
                'label' => esc_html__('Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('Don\'t just take our word for it—hear from the brands we\'ve helped grow.', 'zorx-theme'),
            ]
        );

        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'client_name',
            [
                'label' => esc_html__('Client Name', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Client Name', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'client_position',
            [
                'label' => esc_html__('Position', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('CEO, Company Name', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'testimonial_content',
            [
                'label' => esc_html__('Content', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('Testimonial content goes here.', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'rating',
            [
                'label' => esc_html__('Rating', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::NUMBER,
                'min' => 1,
                'max' => 5,
                'step' => 1,
                'default' => 5,
            ]
        );

        $this->add_control(
            'testimonials',
            [
                'label' => esc_html__('Testimonials List', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'default' => [
                    [
                        'client_name' => 'Ahmed Al-Rashid',
                        'client_position' => 'CEO, TechStart Dubai',
                        'testimonial_content' => 'ZORX helped us triple our leads within 3 months. Their data-driven approach and deep understanding of the Dubai market made all the difference. Highly recommended for any business looking to scale digitally.',
                        'rating' => 5,
                    ],
                    [
                        'client_name' => 'Sarah Mitchell',
                        'client_position' => 'Marketing Director, Luxe Properties',
                        'testimonial_content' => 'Working with ZORX transformed our online presence completely. Their SEO strategies got us ranking on the first page for all our key terms. The ROI has been incredible.',
                        'rating' => 5,
                    ],
                    [
                        'client_name' => 'Mohammed Hassan',
                        'client_position' => 'Founder, Emirates Fashion Co.',
                        'testimonial_content' => 'The team at ZORX doesn\'t just run campaigns—they become true partners in your growth. Their transparent reporting and strategic insights have been invaluable to our e-commerce business.',
                        'rating' => 5,
                    ],
                ],
                'title_field' => '{{{ client_name }}}',
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

                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php
                    if ($settings['testimonials']):
                        foreach ($settings['testimonials'] as $item):
                            // Calculate initials
                            $names = explode(' ', $item['client_name']);
                            $initials = '';
                            foreach ($names as $n) {
                                $initials .= $n[0];
                            }
                            ?>
                            <div
                                class="group p-8 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 relative">
                                <!-- Quote icon -->
                                <div class="absolute top-6 right-6 opacity-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        class="w-12 h-12 text-primary">
                                        <path
                                            d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                                        <path
                                            d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                                    </svg>
                                </div>

                                <!-- Rating -->
                                <div class="flex gap-1 mb-6">
                                    <?php for ($i = 0; $i < $item['rating']; $i++): ?>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="w-5 h-5 text-primary fill-primary">
                                            <polygon
                                                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    <?php endfor; ?>
                                </div>

                                <p class="text-foreground mb-6 leading-relaxed relative z-10">
                                    "<?php echo esc_html($item['testimonial_content']); ?>"
                                </p>

                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                                        <?php echo esc_html($initials); ?>
                                    </div>
                                    <div>
                                        <div class="font-semibold text-foreground"><?php echo esc_html($item['client_name']); ?></div>
                                        <div class="text-sm text-muted-foreground"><?php echo esc_html($item['client_position']); ?>
                                        </div>
                                    </div>
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
