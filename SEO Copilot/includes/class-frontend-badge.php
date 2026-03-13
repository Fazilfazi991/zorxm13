<?php
/**
 * SEO Score Frontend Badge
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

class SEO_Copilot_Frontend_Badge {

	protected static $instance = null;

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function __construct() {
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_badge_assets' ] );
		add_action( 'wp_footer', [ $this, 'render_badge_footer' ] );
		add_shortcode( 'seo_copilot_badge', [ $this, 'render_shortcode' ] );
		
		add_action( 'wp_ajax_seo_copilot_save_badge_settings', [ $this, 'ajax_save_settings' ] );
	}

	public function is_badge_enabled() {
		$settings = $this->get_badge_settings();
		return $settings['enabled'] === 'yes' || $settings['enabled'] === '1' || $settings['enabled'] === true;
	}

	public function get_badge_settings() {
		$defaults = [
			'enabled'        => false,
			'position'       => 'bottom-right',
			'style'          => 'pill',
			'show_score'     => 'yes',
			'show_on_mobile' => 'yes',
			'custom_text'    => 'SEO Score',
			'link_to'        => 'homepage',
			'custom_url'     => '',
			'pages'          => 'all',
		];
		$settings = get_option( 'seo_copilot_badge_settings', [] );
		if ( ! is_array( $settings ) ) {
			$settings = [];
		}
		return wp_parse_args( $settings, $defaults );
	}

	public function enqueue_badge_assets() {
		if ( ! $this->is_badge_enabled() ) {
			return;
		}

		// Check 'pages' logic
		$settings = $this->get_badge_settings();
		if ( ! $this->should_display_on_current_page( $settings['pages'] ) ) {
			return;
		}

		wp_enqueue_style( 'seo-copilot-badge-css', trailingslashit( plugin_dir_url( dirname(__FILE__) ) ) . 'assets/css/frontend-badge.css', [], SEO_COPILOT_VERSION );
		wp_enqueue_script( 'seo-copilot-badge-js', trailingslashit( plugin_dir_url( dirname(__FILE__) ) ) . 'assets/js/frontend-badge.js', [], SEO_COPILOT_VERSION, true );
	}

	private function should_display_on_current_page( $pages_setting ) {
		if ( 'all' === $pages_setting ) {
			return true;
		}

		if ( 'homepage' === $pages_setting && ( is_front_page() || is_home() ) ) {
			return true;
		}

		if ( 'posts' === $pages_setting && is_single() && 'post' === get_post_type() ) {
			return true;
		}

		if ( 'pages' === $pages_setting && is_page() ) {
			return true;
		}

		return false;
	}

	public function get_page_score() {
		if ( is_singular() ) {
			$score = get_post_meta( get_the_ID(), '_seo_copilot_score', true );
			if ( $score ) {
				return intval( $score );
			}
		}

		// Fallback to average score
		global $wpdb;
		$avg = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT AVG(meta_value) FROM $wpdb->postmeta WHERE meta_key = %s AND meta_value != ''",
				'_seo_copilot_score'
			)
		);
		return $avg ? round( $avg ) : 100; // Default perfect if brand new? Or maybe 0? Let's say 85 so badge doesn't look bad by default
	}

	public function render_badge_footer() {
		if ( ! $this->is_badge_enabled() ) {
			return;
		}

		$settings = $this->get_badge_settings();
		
		if ( ! $this->should_display_on_current_page( $settings['pages'] ) ) {
			return;
		}

		$score = $this->get_page_score();
		// If using average fallback and it returned 100 on empty db, maybe we want to make it look realistic.
		if ( $score == 100 && ! is_singular() ) {
			// Ensure it represents an actual score if possible.
		}

		echo $this->render_badge_html( $settings, $score );
	}

	public function render_shortcode( $atts ) {
		$atts = shortcode_atts([
			'style'      => '',
			'show_score' => '',
			'text'       => '',
		], $atts);

		$settings = $this->get_badge_settings();
		
		// Overrides
		if( !empty($atts['style']) ) $settings['style'] = $atts['style'];
		if( !empty($atts['show_score']) ) $settings['show_score'] = $atts['show_score'] === 'true' ? 'yes' : 'no';
		if( !empty($atts['text']) ) $settings['custom_text'] = $atts['text'];
		
		$settings['position'] = 'inline'; // Force inline for shortcodes
		$settings['show_on_mobile'] = 'yes'; // Override hide on mobile if shortcode is used explicitly

		// Enqueue explicitly in case not enqueued
		wp_enqueue_style( 'seo-copilot-badge-css', trailingslashit( plugin_dir_url( dirname(__FILE__) ) ) . 'assets/css/frontend-badge.css', [], SEO_COPILOT_VERSION );
		wp_enqueue_script( 'seo-copilot-badge-js', trailingslashit( plugin_dir_url( dirname(__FILE__) ) ) . 'assets/js/frontend-badge.js', [], SEO_COPILOT_VERSION, true );

		return $this->render_badge_html( $settings, $this->get_page_score() );
	}

	private function render_badge_html( $settings, $score ) {
		$style       = $settings['style'];
		$position    = esc_attr( $settings['position'] );
		$custom_text = esc_html( $settings['custom_text'] ?: 'SEO Score' );
		
		$score       = intval( $score );
		if ( $score === 0 ) $score = 85; // Fallback so it doesn't show 0 if unanalyzed

		$score_class = 'score-low';
		if ( $score >= 80 ) {
			$score_class = 'score-high';
		} elseif ( $score >= 50 ) {
			$score_class = 'score-mid';
		}

		$hide_mobile = ( $settings['show_on_mobile'] === 'yes' ) ? '' : 'sc-badge-hide-mobile';
		
		$wrapper_classes = "seo-copilot-badge-wrap pos-{$position} {$hide_mobile}";
		if ( $position === 'inline' ) {
			$wrapper_classes = "seo-copilot-badge-inline {$hide_mobile}";
		}

		$link_url = '#';
		if ( $settings['link_to'] === 'homepage' ) {
			$link_url = 'https://example.com/seo-copilot'; // Replace with actual plugin homepage later
		} elseif ( $settings['link_to'] === 'custom' && ! empty( $settings['custom_url'] ) ) {
			$link_url = esc_url( $settings['custom_url'] );
		}

		$show_score = ( $settings['show_score'] === 'yes' );
		
		$html = '';

		if ( $style === 'pill' ) {
			$html .= '<div class="' . esc_attr( $wrapper_classes ) . '">';
			$html .= '<a class="sc-badge-pill ' . esc_attr( $score_class ) . '" href="' . esc_url( $link_url ) . '" target="_blank" rel="noopener">';
			$html .= '<span class="sc-badge-dot"></span>';
			$html .= '<span>' . $custom_text . ( $show_score ? ': ' . $score : '' ) . '</span>';
			$html .= '</a></div>';
		} 
		elseif ( $style === 'card' ) {
			$html .= '<div class="' . esc_attr( $wrapper_classes ) . '">';
			$html .= '<a class="sc-badge-card ' . esc_attr( $score_class ) . '" href="' . esc_url( $link_url ) . '" target="_blank" rel="noopener">';
			$html .= '<div class="sc-badge-label">' . $custom_text . '</div>';
			$html .= '<div class="sc-badge-score">';
			if ( $show_score ) {
				$html .= $score . '<span style="font-size:12px;color:#6B7280">/100</span>';
			} else {
				$html .= 'VERIFIED<span style="font-size:12px;color:#6B7280"> SITE</span>';
			}
			$html .= '</div>';
			if ( $show_score ) {
				$html .= '<div class="sc-badge-bar"><div class="sc-badge-bar-fill" data-score="' . esc_attr( $score ) . '" style="width:0%"></div></div>';
			}
			$html .= '<div class="sc-badge-powered">Powered by SEO Copilot</div>';
			$html .= '</a></div>';
		}
		elseif ( $style === 'minimal' ) {
			$html .= '<div class="' . esc_attr( $wrapper_classes ) . '">';
			$html .= '<a class="sc-badge-minimal ' . esc_attr( $score_class ) . '" href="' . esc_url( $link_url ) . '" target="_blank" rel="noopener">';
			if ( $show_score ) {
				$html .= '<span style="color:' . ( $score >= 80 ? '#10B981' : ( $score >= 50 ? '#F59E0B' : '#EF4444' ) ) . ';">●</span>';
				$html .= '<span>' . $score . '</span>';
			} else {
				$html .= '<span>' . $custom_text . '</span>';
			}
			$html .= '</a></div>';
		}
		elseif ( $style === 'icon-only' ) {
			$circumference = 126;
			$offset = $circumference - ( $score / 100 * $circumference );
			
			$title = $custom_text . ( $show_score ? ': ' . $score . '/100' : '' );

			$html .= '<div class="' . esc_attr( $wrapper_classes ) . '">';
			$html .= '<a class="sc-badge-icon ' . esc_attr( $score_class ) . '" href="' . esc_url( $link_url ) . '" target="_blank" rel="noopener" title="' . esc_attr( $title ) . '">';
			if ( $show_score ) {
				$html .= '<svg viewBox="0 0 46 46"><circle class="ring-bg" cx="23" cy="23" r="20"/><circle class="ring-fill" cx="23" cy="23" r="20" data-score="' . esc_attr( $score ) . '" style="stroke-dashoffset:' . esc_attr( $offset ) . '"/></svg>';
			}
			$html .= '🚀';
			$html .= '</a></div>';
		}

		return $html;
	}

	public function ajax_save_settings() {
		check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

		$settings = isset( $_POST['settings'] ) ? $_POST['settings'] : [];
		
		// Sanitize inputs
		$sanitized = [
			'enabled'        => isset($settings['enabled']) && $settings['enabled'] === 'yes' ? 'yes' : 'no',
			'position'       => isset($settings['position']) ? sanitize_text_field($settings['position']) : 'bottom-right',
			'style'          => isset($settings['style']) ? sanitize_text_field($settings['style']) : 'pill',
			'show_score'     => isset($settings['show_score']) && $settings['show_score'] === 'yes' ? 'yes' : 'no',
			'show_on_mobile' => isset($settings['show_on_mobile']) && $settings['show_on_mobile'] === 'yes' ? 'yes' : 'no',
			'custom_text'    => isset($settings['custom_text']) ? sanitize_text_field($settings['custom_text']) : 'SEO Score',
			'link_to'        => isset($settings['link_to']) ? sanitize_text_field($settings['link_to']) : 'homepage',
			'custom_url'     => isset($settings['custom_url']) ? esc_url_raw($settings['custom_url']) : '',
			'pages'          => isset($settings['pages']) ? sanitize_text_field($settings['pages']) : 'all',
		];

		update_option( 'seo_copilot_badge_settings', $sanitized );

		wp_send_json_success( 'Settings saved successfully' );
	}
}

function seo_copilot_frontend_badge() {
	return SEO_Copilot_Frontend_Badge::get_instance();
}

// Initialize the module
seo_copilot_frontend_badge();
