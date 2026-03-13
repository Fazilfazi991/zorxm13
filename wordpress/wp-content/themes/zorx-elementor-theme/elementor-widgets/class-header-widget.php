<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Header Widget.
 *
 * Elementor widget that simulates the main site navigation header.
 */
class Zorx_Header_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_header';
    }

    public function get_title()
    {
        return esc_html__('Global Header', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-header';
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
                'label' => esc_html__('Navigation Content', 'zorx-theme'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'logo_image',
            [
                'label' => esc_html__('Logo', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::MEDIA,
                'default' => [
                    'url' => '',
                ],
            ]
        );

        $this->add_control(
            'logo_text',
            [
                'label' => esc_html__('Logo Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'ZORX',
                'description' => esc_html__('Displayed if no image is selected.', 'zorx-theme'),
            ]
        );

        // Get all navigation menus
        $menus = wp_get_nav_menus();
        $menu_options = ['' => esc_html__('Select specific menu...', 'zorx-theme')];
        foreach ($menus as $menu) {
            $menu_options[$menu->term_id] = $menu->name;
        }

        $this->add_control(
            'menu_id',
            [
                'label' => esc_html__('Select Menu', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'options' => $menu_options,
                'default' => '',
                'description' => esc_html__('If empty, uses the "Primary" menu location.', 'zorx-theme'),
            ]
        );

        $this->add_control(
            'show_cta',
            [
                'label' => esc_html__('Show CTA Button', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'cta_text',
            [
                'label' => esc_html__('Button Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'Get Started',
                'condition' => ['show_cta' => 'yes'],
            ]
        );

        $this->add_control(
            'cta_link',
            [
                'label' => esc_html__('Button Link', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::URL,
                'default' => [
                    'url' => '#contact',
                ],
                'condition' => ['show_cta' => 'yes'],
            ]
        );

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        ?>
        <header
            class="site-header fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-sm transition-all duration-300">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <nav class="flex items-center justify-between h-20">
                    <!-- Logo -->
                    <div class="site-branding">
                        <a href="<?php echo esc_url(home_url('/')); ?>" rel="home" class="flex items-center">
                            <?php if (!empty($settings['logo_image']['url'])): ?>
                                <img src="<?php echo esc_url($settings['logo_image']['url']); ?>" alt="<?php bloginfo('name'); ?>"
                                    class="h-10 w-auto">
                            <?php else: ?>
                                <span
                                    class="text-2xl font-extrabold text-[#065f46]"><?php echo esc_html($settings['logo_text']); ?></span>
                            <?php endif; ?>
                        </a>
                    </div>

                    <!-- Desktop Menu -->
                    <div class="hidden md:flex items-center gap-8">
                        <?php
                        $args = [
                            'theme_location' => 'primary',
                            'container' => false,
                            'menu_class' => 'flex items-center gap-8',
                            'fallback_cb' => false,
                            'echo' => true,
                        ];

                        if (!empty($settings['menu_id'])) {
                            $args['menu'] = $settings['menu_id'];
                            unset($args['theme_location']);
                            wp_nav_menu($args);
                        } else {
                            // Check if primary location has a menu assigned
                            if (has_nav_menu('primary')) {
                                wp_nav_menu($args);
                            } else {
                                // Fallback: Show Page List or Message
                                if (\Elementor\Plugin::$instance->editor->is_edit_mode()) {
                                    echo '<div class="text-sm border border-dashed border-gray-400 p-2 text-gray-500">Please assign a menu to "Primary Menu" location or select one in settings.</div>';
                                } else {
                                    // Fallback to page list
                                    echo '<ul class="flex items-center gap-8">';
                                    wp_list_pages([
                                        'title_li' => '',
                                        'depth' => 1,
                                        'exclude' => $header_template_id ?? '',
                                    ]);
                                    echo '</ul>';
                                }
                            }
                        }
                        ?>
                    </div>

                    <!-- CTA & Mobile Toggle -->
                    <div class="flex items-center gap-4">
                        <?php if ('yes' === $settings['show_cta']): ?>
                            <a href="<?php echo esc_url($settings['cta_link']['url']); ?>"
                                class="zorx-premium-btn hidden md:inline-flex items-center justify-center rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 h-10 py-2 px-6">
                                <?php echo esc_html($settings['cta_text']); ?>
                            </a>
                        <?php endif; ?>

                        <!-- Mobile Menu Toggle -->
                        <button class="md:hidden p-2 text-foreground" id="zorx-mobile-menu-toggle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="w-6 h-6">
                                <line x1="4" x2="20" y1="12" y2="12" />
                                <line x1="4" x2="20" y1="6" y2="6" />
                                <line x1="4" x2="20" y1="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <style>
                        /* Premium Button Styling */
                        .zorx-premium-btn {
                            background: linear-gradient(135deg, #059669 0%, #047857 100%);
                            color: #ffffff !important;
                            box-shadow: 0 4px 14px 0 rgba(4, 120, 87, 0.39);
                            transition: all 0.3s ease;
                        }

                        .zorx-premium-btn:hover {
                            background: linear-gradient(135deg, #047857 0%, #065f46 100%);
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(4, 120, 87, 0.23);
                        }

                        /* Premium Menu Styling */
                        .menu-item a,
                        .page_item a {
                            position: relative;
                            color: #065f46;
                            font-weight: 500;
                            font-size: 0.95rem;
                            transition: color 0.3s ease;
                            text-decoration: none;
                        }

                        .menu-item a:hover,
                        .page_item a:hover {
                            color: #047857;
                        }

                        .menu-item a::after,
                        .page_item a::after {
                            content: '';
                            position: absolute;
                            bottom: -4px;
                            left: 0;
                            width: 0;
                            height: 2px;
                            background-color: #059669;
                            transition: width 0.3s ease;
                        }

                        .menu-item a:hover::after,
                        .page_item a:hover::after {
                            width: 100%;
                        }
                    </style>
                </nav>
            </div>

            <!-- Mobile Menu Panel (Hidden by default) -->
            <div id="zorx-mobile-menu"
                class="hidden md:hidden bg-background border-t border-border py-4 px-4 absolute top-20 left-0 right-0 shadow-lg">
                <div class="flex flex-col gap-4">
                    <?php
                    $mobile_args = $args;
                    $mobile_args['menu_class'] = 'flex flex-col gap-4 text-[#065f46] font-medium';
                    wp_nav_menu($mobile_args);
                    ?>
                    <?php if ('yes' === $settings['show_cta']): ?>
                        <div class="pt-4 border-t border-border">
                            <a href="<?php echo esc_url($settings['cta_link']['url']); ?>"
                                class="zorx-premium-btn inline-flex w-full items-center justify-center rounded-full font-medium transition-all h-10 py-2 px-6">
                                <?php echo esc_html($settings['cta_text']); ?>
                            </a>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <script>
                // Simple inline script for mobile toggle within logic content
                document.getElementById('zorx-mobile-menu-toggle').addEventListener('click', function () {
                    var menu = document.getElementById('zorx-mobile-menu');
                    menu.classList.toggle('hidden');
                });
            </script>
        </header>
        <div class="h-20"></div> <!-- Spacer for fixed header -->
        <?php
    }
}
