<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Hero Widget.
 *
 * Elementor widget that displays the hero section.
 */
class Zorx_Hero_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_hero';
    }

    public function get_title()
    {
        return esc_html__('Hero Section', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-banner';
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
                'default' => esc_html__('Trusted by UAE Businesses', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'heading',
            [
                'label' => esc_html__('Heading', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('Driving Digital Growth for Ambitious Brands in Dubai', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'description',
            [
                'label' => esc_html__('Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('We help businesses scale with data-driven digital marketing, performance ads, SEO, and creative strategies that convert.', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'btn_primary_text',
            [
                'label' => esc_html__('Primary Button Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Get a Free Strategy Call', 'zorx-theme'),
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
                'default' => esc_html__('View Our Services', 'zorx-theme'),
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

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        ?>
        <section class="relative min-h-[90vh] flex items-center p-6 md:p-24 overflow-hidden">
            <!-- Background decorative elements -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
                <div class="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div
                    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl">
                </div>
            </div>

            <div class="relative z-10 w-full max-w-7xl mx-auto">
                <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <!-- Left Content -->
                    <div class="space-y-8">
                        <?php if (!empty($settings['badge_text'])): ?>
                            <div
                                class="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm font-medium text-accent-foreground animate-fade-up">
                                <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                <?php echo esc_html($settings['badge_text']); ?>
                            </div>
                        <?php endif; ?>

                        <h1 class="heading-display text-foreground animate-fade-up delay-100 opacity-0"
                            style="animation-fill-mode: forwards;">
                            <?php echo wp_kses_post($settings['heading']); ?>
                        </h1>

                        <p class="text-lg md:text-xl text-muted-foreground max-w-xl animate-fade-up delay-200 opacity-0"
                            style="animation-fill-mode: forwards;">
                            <?php echo esc_html($settings['description']); ?>
                        </p>

                        <div class="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300 opacity-0"
                            style="animation-fill-mode: forwards;">
                            <?php if (!empty($settings['btn_primary_text'])): ?>
                                <a href="<?php echo esc_url($settings['btn_primary_link']['url']); ?>"
                                    class="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 py-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 group">
                                    <?php echo esc_html($settings['btn_primary_text']); ?>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1">
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                </a>
                            <?php endif; ?>

                            <?php if (!empty($settings['btn_secondary_text'])): ?>
                                <a href="<?php echo esc_url($settings['btn_secondary_link']['url']); ?>"
                                    class="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 py-2 group">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                        class="mr-2 h-4 w-4">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    <?php echo esc_html($settings['btn_secondary_text']); ?>
                                </a>
                            <?php endif; ?>
                        </div>

                        <!-- Client logos placeholder -->
                        <div class="pt-8 border-t border-border/50 animate-fade-up delay-400 opacity-0"
                            style="animation-fill-mode: forwards;">
                            <p class="text-sm text-muted-foreground mb-4">
                                <?php esc_html_e('Trusted by industry leaders', 'zorx-theme'); ?>
                            </p>
                            <div class="flex flex-wrap gap-8 items-center opacity-50">
                                <div class="h-8 w-24 bg-foreground/10 rounded"></div>
                                <div class="h-8 w-24 bg-foreground/10 rounded"></div>
                                <div class="h-8 w-24 bg-foreground/10 rounded"></div>
                                <div class="h-8 w-24 bg-foreground/10 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Visual -->
                    <div class="relative lg:h-[600px] animate-fade-up delay-200 opacity-0 hidden lg:block"
                        style="animation-fill-mode: forwards;">
                        <div class="relative h-full flex items-center justify-center">
                            <div class="relative w-full max-w-lg">
                                <!-- Main circle -->
                                <div class="aspect-square rounded-full bg-gradient-primary p-1 animate-float">
                                    <div class="w-full h-full rounded-full bg-background flex items-center justify-center">
                                        <div class="text-center p-8">
                                            <div class="text-6xl font-extrabold text-primary mb-2">200%</div>
                                            <div class="text-muted-foreground font-medium">Average ROI</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Floating cards -->
                                <div class="absolute -top-4 -right-4 bg-card rounded-xl shadow-card p-4 animate-float"
                                    style="animation-delay: 0.5s;">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="text-sm font-semibold">Traffic Up</div>
                                            <div class="text-xs text-primary">+156%</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-card p-4 animate-float"
                                    style="animation-delay: 1s;">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="text-sm font-semibold">Revenue</div>
                                            <div class="text-xs text-primary">+$250K</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="absolute top-1/2 -right-8 bg-card rounded-xl shadow-card p-4 animate-float"
                                    style="animation-delay: 1.5s;">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="text-sm font-semibold">Leads</div>
                                            <div class="text-xs text-primary">+89%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <?php
    }
}
