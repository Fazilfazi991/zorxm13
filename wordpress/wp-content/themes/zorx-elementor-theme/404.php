<?php
/**
 * The template for displaying 404 pages (not found)
 */

get_header();
?>

<main id="primary" class="site-main">
    <section class="min-h-[60vh] flex items-center justify-center bg-gray-50 section-padding">
        <div class="section-container text-center">
            <header class="page-header mb-8">
                <h1 class="heading-display text-primary mb-4">404</h1>
                <h2 class="text-3xl font-bold text-foreground"><?php esc_html_e('Page Not Found', 'zorx-theme'); ?>
                </h2>
            </header>

            <div class="page-content max-w-md mx-auto">
                <p class="text-muted-foreground mb-8">
                    <?php esc_html_e('It looks like nothing was found at this location. Maybe try a search?', 'zorx-theme'); ?>
                </p>
                <a href="<?php echo esc_url(home_url('/')); ?>"
                    class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">
                    <?php esc_html_e('Back to Home', 'zorx-theme'); ?>
                </a>
            </div>
        </div>
    </section>
</main>

<?php
get_footer();
