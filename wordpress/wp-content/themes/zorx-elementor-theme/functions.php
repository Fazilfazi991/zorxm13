<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Define Constants
define( 'ZORX_THEME_VERSION', '1.0.0' );
define( 'ZORX_THEME_DIR', get_template_directory() );
define( 'ZORX_THEME_URI', get_template_directory_uri() );

/**
 * Theme Setup
 */
function zorx_theme_setup() {
	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	// Let WordPress manage the document title.
	add_theme_support( 'title-tag' );

	// Enable support for Post Thumbnails on posts and pages.
	add_theme_support( 'post-thumbnails' );

	// Navigate Menus
	register_nav_menus( array(
		'primary' => esc_html__( 'Primary Menu', 'zorx-theme' ),
		'footer'  => esc_html__( 'Footer Menu', 'zorx-theme' ),
	) );

	// HTML5 Support
	add_theme_support( 'html5', array(
		'search-form',
		'comment-form',
		'comment-list',
		'gallery',
		'caption',
	) );
	
	// Elementor Support
	add_theme_support( 'elementor' );
}
add_action( 'after_setup_theme', 'zorx_theme_setup' );

/**
 * Enqueue Scripts and Styles
 */
function zorx_theme_scripts() {
	// Enqueue Google Fonts (Plus Jakarta Sans)
	wp_enqueue_style( 'zorx-fonts', 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap', array(), null );

	// Enqueue Main CSS
	wp_enqueue_style( 'zorx-main-style', ZORX_THEME_URI . '/assets/css/main.css', array(), ZORX_THEME_VERSION );
	
	// Enqueue Theme Style (for style.css)
	wp_enqueue_style( 'zorx-style', get_stylesheet_uri(), array(), ZORX_THEME_VERSION );

	// Enqueue Scripts
	wp_enqueue_script( 'zorx-main-script', ZORX_THEME_URI . '/assets/js/main.js', array('jquery'), ZORX_THEME_VERSION, true );
}
add_action( 'wp_enqueue_scripts', 'zorx_theme_scripts' );

/**
 * Register Custom Elementor Widgets
 */
require get_template_directory() . '/inc/elementor-setup.php';
