<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Why Choose Widget.
 *
 * Elementor widget that displays the "Why Choose Us" section.
 */
class Zorx_Why_Choose_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_why_choose';
    }

    public function get_title()
    {
        return esc_html__('Why Choose Us Section', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-check-circle-o';
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
                'default' => esc_html__('Why ZORX', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'heading',
            [
                'label' => esc_html__('Heading', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Why Brands Choose ZORX', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'description',
            [
                'label' => esc_html__('Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('We\'re not just another digital marketing agency. We\'re your growth partners, committed to delivering measurable results that impact your bottom line.', 'zorx-theme'),
            ]
        );

        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'reason',
            [
                'label' => esc_html__('Reason', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Reason text', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'reasons',
            [
                'label' => esc_html__('Reasons List', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'default' => [
                    ['reason' => esc_html__('Local Dubai market knowledge', 'zorx-theme')],
                    ['reason' => esc_html__('Data-driven decision making', 'zorx-theme')],
                    ['reason' => esc_html__('Transparent pricing & reporting', 'zorx-theme')],
                    ['reason' => esc_html__('Customized strategies (not templates)', 'zorx-theme')],
                    ['reason' => esc_html__('Dedicated account managers', 'zorx-theme')],
                    ['reason' => esc_html__('Proven track record of success', 'zorx-theme')],
                ],
                'title_field' => '{{{ reason }}}',
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
                <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <!-- Left - Visual -->
                    <div class="relative">
                        <div class="aspect-square max-w-lg mx-auto">
                            <!-- Background decoration -->
                            <div class="absolute inset-0 bg-gradient-primary rounded-3xl rotate-3 opacity-10"></div>
                            <div class="absolute inset-0 bg-gradient-primary rounded-3xl -rotate-3 opacity-5"></div>

                            <!-- Main card -->
                            <div class="relative bg-card rounded-3xl p-8 shadow-card h-full flex flex-col justify-center">
                                <div class="space-y-6">
                                    <div class="flex items-center gap-4">
                                        <div class="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                                            <svg class="w-8 h-8 text-primary-foreground" fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="text-2xl font-bold text-foreground">100%</div>
                                            <div class="text-muted-foreground">Client Satisfaction</div>
                                        </div>
                                    </div>

                                    <div class="h-px bg-border"></div>

                                    <div class="grid grid-cols-2 gap-6">
                                        <div>
                                            <div class="text-3xl font-bold text-primary">50+</div>
                                            <div class="text-sm text-muted-foreground">UAE Clients</div>
                                        </div>
                                        <div>
                                            <div class="text-3xl font-bold text-primary">5+</div>
                                            <div class="text-sm text-muted-foreground">Years Experience</div>
                                        </div>
                                        <div>
                                            <div class="text-3xl font-bold text-primary">100+</div>
                                            <div class="text-sm text-muted-foreground">Campaigns</div>
                                        </div>
                                        <div>
                                            <div class="text-3xl font-bold text-primary">200%</div>
                                            <div class="text-sm text-muted-foreground">Avg. ROI</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right - Content -->
                    <div class="space-y-8">
                        <?php if (!empty($settings['badge_text'])): ?>
                            <div class="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground">
                                <?php echo esc_html($settings['badge_text']); ?>
                            </div>
                        <?php endif; ?>

                        <h2 class="heading-section text-foreground">
                            <?php echo esc_html($settings['heading']); ?>
                        </h2>

                        <p class="text-lg text-muted-foreground">
                            <?php echo esc_html($settings['description']); ?>
                        </p>

                        <div class="space-y-4">
                            <?php
                            if ($settings['reasons']):
                                foreach ($settings['reasons'] as $item):
                                    ?>
                                    <div class="flex items-center gap-4 group">
                                        <div
                                            class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                stroke-linejoin="round" class="w-4 h-4 text-primary">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <span class="text-foreground font-medium"><?php echo esc_html($item['reason']); ?></span>
                                    </div>
                                    <?php
                                endforeach;
                            endif;
                            ?>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <?php
    }
}
