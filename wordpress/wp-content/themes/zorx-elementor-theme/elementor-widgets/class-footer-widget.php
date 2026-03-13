<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * ZORX Footer Widget.
 *
 * Elementor widget that simulates the main site footer.
 */
class Zorx_Footer_Widget extends \Elementor\Widget_Base
{

    public function get_name()
    {
        return 'zorx_footer';
    }

    public function get_title()
    {
        return esc_html__('Global Footer', 'zorx-theme');
    }

    public function get_icon()
    {
        return 'eicon-footer';
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
                'label' => esc_html__('Footer Content', 'zorx-theme'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'description',
            [
                'label' => esc_html__('Company Description', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXTAREA,
                'default' => "Dubai's leading digital marketing agency. We help ambitious brands scale with data-driven strategies that convert.",
            ]
        );

        $this->add_control(
            'email',
            [
                'label' => esc_html__('Email Address', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'hello@zorx.ae',
            ]
        );

        $this->add_control(
            'phone',
            [
                'label' => esc_html__('Phone Number', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => '+971 XXX XXX XXX',
            ]
        );

        // Services Links
        $repeater_services = new \Elementor\Repeater();
        $repeater_services->add_control(
            'text',
            [
                'label' => esc_html__('Link Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'Service Name',
            ]
        );
        $repeater_services->add_control(
            'link',
            [
                'label' => esc_html__('Link URL', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::URL,
                'placeholder' => '#',
            ]
        );
        $this->add_control(
            'services_links',
            [
                'label' => esc_html__('Services Links', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater_services->get_controls(),
                'default' => [
                    ['text' => 'SEO', 'link' => ['url' => '#']],
                    ['text' => 'Google Ads', 'link' => ['url' => '#']],
                    ['text' => 'Social Media', 'link' => ['url' => '#']],
                    ['text' => 'Web Design', 'link' => ['url' => '#']],
                ],
                'title_field' => '{{{ text }}}',
            ]
        );

        // Company Links
        $repeater_company = new \Elementor\Repeater();
        $repeater_company->add_control(
            'text',
            [
                'label' => esc_html__('Link Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'Page Name',
            ]
        );
        $repeater_company->add_control(
            'link',
            [
                'label' => esc_html__('Link URL', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::URL,
                'placeholder' => '#',
            ]
        );
        $this->add_control(
            'company_links',
            [
                'label' => esc_html__('Company Links', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater_company->get_controls(),
                'default' => [
                    ['text' => 'About Us', 'link' => ['url' => '/about/']],
                    ['text' => 'Our Process', 'link' => ['url' => '/#process']],
                    ['text' => 'Careers', 'link' => ['url' => '#']],
                ],
                'title_field' => '{{{ text }}}',
            ]
        );

        // Quick Links
        $repeater_quick = new \Elementor\Repeater();
        $repeater_quick->add_control(
            'text',
            [
                'label' => esc_html__('Link Text', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'default' => 'Link Name',
            ]
        );
        $repeater_quick->add_control(
            'link',
            [
                'label' => esc_html__('Link URL', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::URL,
                'placeholder' => '#',
            ]
        );
        $this->add_control(
            'quick_links',
            [
                'label' => esc_html__('Quick Links', 'zorx-theme'),
                'type' => \Elementor\Controls_Manager::REPEATER,
                'fields' => $repeater_quick->get_controls(),
                'default' => [
                    ['text' => 'Contact', 'link' => ['url' => '/#contact']],
                    ['text' => 'Privacy Policy', 'link' => ['url' => '#']],
                    ['text' => 'Terms of Service', 'link' => ['url' => '#']],
                ],
                'title_field' => '{{{ text }}}',
            ]
        );

        $this->end_controls_section();

    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        ?>
        <footer class="bg-white text-gray-600 pt-16 pb-8 border-t border-gray-100">
            <div class="max-w-7xl mx-auto">
                <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    <!-- Brand Column -->
                    <div class="lg:col-span-2">
                        <div class="text-3xl font-extrabold mb-4">
                            <span class="text-[#065f46]">ZORX</span>
                        </div>
                        <p class="text-gray-500 mb-6 max-w-sm">
                            <?php echo esc_html($settings['description']); ?>
                        </p>

                        <div class="space-y-3">
                            <div class="flex items-center gap-3 text-gray-500">
                                <!-- MapPin Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="text-[#065f46]">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>Dubai, UAE</span>
                            </div>
                            <div class="flex items-center gap-3 text-gray-500">
                                <!-- Mail Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="text-[#065f46]">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <a href="mailto:<?php echo esc_attr($settings['email']); ?>"
                                    class="hover:text-[#065f46] transition-colors">
                                    <?php echo esc_html($settings['email']); ?>
                                </a>
                            </div>
                            <div class="flex items-center gap-3 text-gray-500">
                                <!-- Phone Icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="text-[#065f46]">
                                    <path
                                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <a href="tel:<?php echo esc_attr($settings['phone']); ?>"
                                    class="hover:text-[#065f46] transition-colors">
                                    <?php echo esc_html($settings['phone']); ?>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Services -->
                    <div>
                        <h4 class="font-bold text-lg mb-4 text-[#065f46]">Services</h4>
                        <ul class="space-y-3">
                            <?php foreach ($settings['services_links'] as $item): ?>
                                <li>
                                    <a href="<?php echo esc_url($item['link']['url']); ?>"
                                        class="text-gray-500 hover:text-[#065f46] transition-colors">
                                        <?php echo esc_html($item['text']); ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>

                    <!-- Company -->
                    <div>
                        <h4 class="font-bold text-lg mb-4 text-[#065f46]">Company</h4>
                        <ul class="space-y-3">
                            <?php foreach ($settings['company_links'] as $item): ?>
                                <li>
                                    <a href="<?php echo esc_url($item['link']['url']); ?>"
                                        class="text-gray-500 hover:text-[#065f46] transition-colors">
                                        <?php echo esc_html($item['text']); ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>

                    <!-- Quick Links -->
                    <div>
                        <h4 class="font-bold text-lg mb-4 text-[#065f46]">Quick Links</h4>
                        <ul class="space-y-3">
                            <?php foreach ($settings['quick_links'] as $item): ?>
                                <li>
                                    <a href="<?php echo esc_url($item['link']['url']); ?>"
                                        class="text-gray-500 hover:text-[#065f46] transition-colors">
                                        <?php echo esc_html($item['text']); ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                </div>

                <!-- Bottom Bar -->
                <div class="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p class="text-gray-400 text-sm">
                        &copy; <?php echo date('Y'); ?> ZORX Digital Marketing. All Rights Reserved.
                    </p>

                    <!-- Social Links Placeholders -->
                    <div class="flex gap-4">
                        <a href="#"
                            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#065f46] hover:bg-[#065f46] hover:text-white transition-colors">
                            <span class="sr-only">LinkedIn</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect width="4" height="12" x="2" y="9" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </a>
                        <a href="#"
                            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#065f46] hover:bg-[#065f46] hover:text-white transition-colors">
                            <span class="sr-only">Instagram</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                        </a>
                        <a href="#"
                            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#065f46] hover:bg-[#065f46] hover:text-white transition-colors">
                            <span class="sr-only">Twitter</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path
                                    d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
        <?php
    }
}
