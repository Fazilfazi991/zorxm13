<?php
// Theme Footer Logic

// 1. Check if Elementor footer template exists
$footer_template = get_page_by_path('zorx-footer', OBJECT, 'elementor_library');

// Fallback: Search by Title if slug not found
if (!$footer_template) {
    $footer_template = get_page_by_title('Zorx Global Footer', OBJECT, 'elementor_library');
}

if ($footer_template && class_exists('\Elementor\Plugin')) {
    // Render Elementor Template
    echo \Elementor\Plugin::instance()->frontend->get_builder_content_for_display($footer_template->ID);
} else {
    // 2. Fallback to Standard PHP Footer
    if (!function_exists('elementor_theme_do_location') || !elementor_theme_do_location('footer')):
        ?>
        <footer class="site-footer bg-white text-gray-600 pt-16 pb-8 border-t border-gray-100 mt-auto">
            <div class="section-container">
                <div class="border-t border-gray-100 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div class="text-gray-400 text-sm">
                        &copy; <?php echo date('Y'); ?>         <?php bloginfo('name'); ?>. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
        <?php
    endif;
}
?>

</div><!-- #page -->

<?php wp_footer(); ?>

</body>

</html>