<?php
/**
 * The template for displaying all pages
 */

get_header();
?>

<main id="primary" class="site-main">
    <?php
    while (have_posts()):
        the_post();

        if (\Elementor\Plugin::$instance->db->is_built_with_elementor(get_the_ID())) {
            the_content();
        } else {
            ?>
            <div class="section-container section-padding">
                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                    <header class="entry-header mb-8">
                        <?php the_title('<h1 class="heading-display mb-4">', '</h1>'); ?>
                    </header>

                    <div class="entry-content prose max-w-none">
                        <?php
                        the_content();

                        wp_link_pages(array(
                            'before' => '<div class="page-links">' . esc_html__('Pages:', 'zorx-theme'),
                            'after' => '</div>',
                        ));
                        ?>
                    </div>
                </article>
            </div>
            <?php
        }

    endwhile;
    ?>
</main>

<?php
get_footer();
