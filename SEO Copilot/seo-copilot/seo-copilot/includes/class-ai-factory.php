<?php
/**
 * AI Factory Class
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_AI_Factory' ) ) {

	/**
	 * Class SEO_Copilot_AI_Factory
	 */
	class SEO_Copilot_AI_Factory {

		/**
		 * Get the configured AI provider instance.
		 *
		 * @return SEO_Copilot_AI_Provider
		 */
		public static function get_provider() {
			$options  = get_option( 'seo_copilot_settings', [] );
			$provider = isset( $options['ai_provider'] ) ? $options['ai_provider'] : 'claude';

			switch ( $provider ) {
				case 'gemini':
					return new SEO_Copilot_Gemini_API();
				case 'claude':
				default:
					return new SEO_Copilot_Claude_API();
			}
		}
	}
}
