<?php
/**
 * The main template file
 */

get_header();
?>

<main id="primary" class="site-main">
	<div class="section-container section-padding">
		<?php
		if ( have_posts() ) :
			while ( have_posts() ) :
				the_post();
				?>
				<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
					<header class="entry-header mb-6">
						<?php the_title( '<h1 class="heading-section">', '</h1>' ); ?>
					</header>

					<div class="entry-content text-muted-foreground">
						<?php
						the_content();

						wp_link_pages( array(
							'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'zorx-theme' ),
							'after'  => '</div>',
						) );
						?>
					</div>
				</article>
				<?php
			endwhile;

			the_posts_navigation();

		else :
			?>
			<p><?php esc_html_e( 'It seems we can&rsquo;t find what you&rsquo;re looking for.', 'zorx-theme' ); ?></p>
			<?php
		endif;
		?>
	</div>
</main>

<?php
get_footer();
