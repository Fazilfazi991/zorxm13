<?php
/**
 * AI Provider Interface
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Interface SEO_Copilot_AI_Provider
 */
interface SEO_Copilot_AI_Provider {

	/**
	 * Generate SEO Meta Data (Title, Description).
	 *
	 * @param string $title         The post title.
	 * @param string $content       The post content.
	 * @param string $focus_keyword The focus keyword.
	 * @return array|\WP_Error      Array of generated meta data or WP_Error.
	 */
	public function generate_meta( $title, $content, $focus_keyword );

	/**
	 * Generate comprehensive SEO Brief.
	 *
	 * @param string $keyword
	 * @param string $country_code
	 * @param array  $target_data
	 * @param array  $lsi_keywords
	 * @param array  $competitor_intel
	 * @return array|\WP_Error
	 */
	public function generate_seo_brief( $keyword, $country_code, $target_data, $lsi_keywords, $competitor_intel );

	/**
	 * Analyze Content and provide SEO score and issues.
	 *
	 * @param string $content       The post content.
	 * @param string $focus_keyword The focus keyword.
	 * @return array|\WP_Error      Array with score and issues or WP_Error.
	 */
	public function analyze_content( $content, $focus_keyword );

	/**
	 * Suggest Internal Links.
	 *
	 * @param string $content          The post content.
	 * @param array  $all_posts_titles Array of all post titles to suggest links to.
	 * @return array|\WP_Error         Array of suggested links or WP_Error.
	 */
	public function suggest_internal_links( $content, $all_posts_titles );

	/**
	 * Suggest Schema Markup.
	 *
	 * @param string $content   The post content.
	 * @param string $post_type The post type.
	 * @return array|\WP_Error  Array representing the JSON-LD schema or WP_Error.
	 */
	public function suggest_schema( $content, $post_type );

	/**
	 * Analyze Content Decay.
	 *
	 * @param string $content           The post content.
	 * @param array  $ranking_drop_data Data about traffic/ranking drops.
	 * @return array|\WP_Error          Array with decay analysis and suggestions or WP_Error.
	 */
	public function analyze_decay( $content, $ranking_drop_data );

	/**
	 * Detect Keyword Cannibalization.
	 *
	 * @param array $posts_array Array of posts to analyze for cannibalization.
	 * @return array|\WP_Error   Array of detected cannibalization issues or WP_Error.
	 */
	public function detect_cannibalization( $posts_array );

	/**
	 * Rewrite text for readability.
	 *
	 * @param string $text
	 * @return array|\WP_Error
	 */
	public function rewrite_text( $text );

	/**
	 * Analyze Competitor Gap.
	 *
	 * @param string $focus_keyword
	 * @param string $our_text
	 * @param string $comp_data_json
	 * @return array|\WP_Error
	 */
	public function analyze_competitor_gap( $focus_keyword, $our_text, $comp_data_json );

	/**
	 * Test the API Connection.
	 *
	 * @return bool|\WP_Error True on success, WP_Error on failure.
	 */
	public function test_connection();
}
