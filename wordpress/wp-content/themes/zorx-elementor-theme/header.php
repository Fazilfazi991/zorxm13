<!doctype html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
    <?php wp_body_open(); ?>

    <div id="page" class="site bg-background min-h-screen flex flex-col">
        <a class="skip-link screen-reader-text"
            href="#primary"><?php esc_html_e('Skip to content', 'zorx-theme'); ?></a>

        <header
            class="site-header fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-sm transition-all duration-300">
            <div class="section-container">
                <nav class="flex items-center justify-between h-20">
                    <div class="site-branding">
                        <?php
                        if (has_custom_logo()):
                            the_custom_logo();
                        else:
                            ?>
                            <a href="<?php echo esc_url(home_url('/')); ?>" rel="home">
                                <img
                                    src="http://localhost/zorx-growth-engine-main/wordpress/wp-content/uploads/2025/12/logo.png">
                            </a>
                            <?php
                        endif;
                        ?>
                    </div>

                    <!-- Desktop Menu -->
                    <div class="hidden md:flex items-center gap-8">
                        <style>
                            /* Premium Menu Styling */
                            .primary-menu-item {
                                position: relative;
                                color: #065f46;
                                font-weight: 500;
                                font-size: 0.95rem;
                                transition: color 0.3s ease;
                                text-decoration: none;
                            }

                            .primary-menu-item:hover {
                                color: #047857;
                            }

                            .primary-menu-item::after {
                                content: '';
                                position: absolute;
                                bottom: -4px;
                                left: 0;
                                width: 0;
                                height: 2px;
                                background-color: #059669;
                                transition: width 0.3s ease;
                            }

                            .primary-menu-item:hover::after {
                                width: 100%;
                            }

                            /* WordPress Menu Structure Adjustment */
                            #primary-menu>li>a {
                                position: relative;
                                color: #065f46;
                                font-weight: 500;
                                transition: color 0.3s ease;
                            }

                            #primary-menu>li>a:hover {
                                color: #059669;
                            }
                        </style>
                        <?php
                        wp_nav_menu(array(
                            'theme_location' => 'primary',
                            'menu_id' => 'primary-menu',
                            'container' => false,
                            'menu_class' => 'flex items-center gap-8', // Classes handled by CSS above mostly
                            'fallback_cb' => false,
                        ));
                        ?>
                    </div>

                    <!-- CTA Button (Desktop) -->
                    <div class="hidden md:block">
                        <style>
                            .zorx-premium-btn {
                                background-color: hsl(150, 76%, 27%);
                                color: #ffffff !important;
                                border-radius: 0.75rem;
                                font-weight: 600;
                                transition: all 0.3s ease;
                            }

                            .zorx-premium-btn:hover {
                                background-color: hsl(150, 76%, 27%, 0.9);
                                box-shadow: 0 0 40px hsl(150 76% 27% / 0.2);
                                transform: translateY(-1px);
                            }
                        </style>
                        <a href="#contact"
                            class="zorx-premium-btn inline-flex items-center justify-center text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 h-11 px-5 py-2.5">
                            <?php esc_html_e('Get Started', 'zorx-theme'); ?>
                        </a>
                    </div>

                    <!-- Mobile Menu Toggle -->
                    <button id="mobile-menu-toggle" class="md:hidden p-2 text-foreground focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-menu">
                            <line x1="4" x2="20" y1="12" y2="12" />
                            <line x1="4" x2="20" y1="6" y2="6" />
                            <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                    </button>
                </nav>

                <!-- Mobile Menu Drawer -->
                <div id="mobile-menu"
                    class="hidden md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border shadow-lg p-6">
                    <div class="flex flex-col gap-6">
                        <?php
                        wp_nav_menu(array(
                            'theme_location' => 'primary',
                            'container' => false,
                            'menu_class' => 'flex flex-col gap-4 text-lg font-medium text-foreground',
                            'fallback_cb' => false,
                        ));
                        ?>
                        <a href="#contact"
                            class="zorx-premium-btn inline-flex items-center justify-center text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 h-11 px-5 py-2.5 w-full">
                            <?php esc_html_e('Get Started', 'zorx-theme'); ?>
                        </a>
                    </div>
                </div>

                <script>
                    document.getElementById('mobile-menu-toggle').addEventListener('click', function () {
                        const menu = document.getElementById('mobile-menu');
                        menu.classList.toggle('hidden');
                    });
                </script>
            </div>
        </header>
        <div class="h-20"></div> <!-- Spacer -->