<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Team Widget.
 *
 * Elementor widget that displays team members.
 */
class Zorx_Team_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_team';
    }

    public function get_title()
    {
        return esc_html__('Team Grid', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-person';
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
                'label' => esc_html__('Team Members', 'zorx-theme'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'badge_text',
            [
                'label' => esc_html__('Badge Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Our Team', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'heading',
            [
                'label' => esc_html__('Heading', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('Meet the Experts', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'description',
            [
                'label' => esc_html__('Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => esc_html__('Dedicated professionals committed to your success.', 'zorx-theme'),
            ]
        );

        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'member_name',
            [
                'label' => esc_html__('Name', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('John Doe', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'member_role',
            [
                'label' => esc_html__('Role', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => esc_html__('CEO & Founder', 'zorx-theme'),
            ]
        );

        $repeater->add_control(
            'member_image',
            [
                'label' => esc_html__('Photo', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::MEDIA,
                'default' => [
                    'url' => \Elementor\Utils::get_placeholder_image_src(),
                ],
            ]
        );

        $this->add_control(
            'team_members',
            [
                'label' => esc_html__('Members', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'default' => [
                    [
                        'member_name' => esc_html__('Sarah Ahmed', 'zorx-theme'),
                        'member_role' => esc_html__('CEO', 'zorx-theme'),
                    ],
                    [
                        'member_name' => esc_html__('Michael Chen', 'zorx-theme'),
                        'member_role' => esc_html__('Marketing Director', 'zorx-theme'),
                    ],
                    [
                        'member_name' => esc_html__('Emma Wilson', 'zorx-theme'),
                        'member_role' => esc_html__('Design Lead', 'zorx-theme'),
                    ],
                ],
                'title_field' => '{{{ member_name }}}',
            ]
        );

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        ?>
        <div class="p-6 md:p-24">
            <div class="max-w-7xl mx-auto">
                <div class="text-center max-w-3xl mx-auto mb-16">
                    <?php if (!empty($settings['badge_text'])): ?>
                        <div
                            class="inline-block px-4 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground mb-6">
                            <?php echo esc_html($settings['badge_text']); ?>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($settings['heading'])): ?>
                        <h2 class="heading-section text-foreground mb-4">
                            <?php echo wp_kses_post($settings['heading']); ?>
                        </h2>
                    <?php endif; ?>

                    <?php if (!empty($settings['description'])): ?>
                        <p class="text-lg text-muted-foreground">
                            <?php echo esc_html($settings['description']); ?>
                        </p>
                    <?php endif; ?>
                </div>

                <!-- Team Grid Container -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    <?php foreach ($settings['team_members'] as $index => $member): ?>
                        <div class="h-full">
                            <div
                                class="group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 h-full">
                                <div class="aspect-square overflow-hidden bg-gray-100">
                                    <?php if (!empty($member['member_image']['url'])): ?>
                                        <img src="<?php echo esc_url($member['member_image']['url']); ?>"
                                            alt="<?php echo esc_attr($member['member_name']); ?>"
                                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                                    <?php endif; ?>
                                </div>

                                <div class="p-6 text-center">
                                    <h3 class="text-xl font-bold text-foreground mb-1">
                                        <?php echo esc_html($member['member_name']); ?>
                                    </h3>
                                    <p class="text-primary font-medium text-sm"><?php echo esc_html($member['member_role']); ?>
                                    </p>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php
    }
}
