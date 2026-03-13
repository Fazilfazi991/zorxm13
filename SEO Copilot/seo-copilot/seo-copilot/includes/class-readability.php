<?php
/**
 * Readability Coach Class
 */
if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Readability' ) ) {
	class SEO_Copilot_Readability {

		public function __construct() {
			add_action( 'wp_ajax_seo_copilot_analyze_readability', [ $this, 'ajax_analyze_readability' ] );
			add_action( 'wp_ajax_seo_copilot_rewrite_text', [ $this, 'ajax_rewrite_text' ] );
			add_action( 'wp_ajax_seo_copilot_bulk_analyze', [ $this, 'ajax_bulk_analyze' ] );
		}

		/**
		 * Calculate Flesch Reading Ease Score
		 * Formula: 206.835 - (1.015 * (total_words / total_sentences)) - (84.6 * (total_syllables / total_words))
		 */
		private function calculate_flesch_score( $text ) {
			$text = wp_strip_all_tags( $text );
			if ( empty( trim( $text ) ) ) return [ 'score' => 0, 'grade' => 'N/A' ];

			// Count sentences
			$sentences = preg_match_all(('/[^\s](\.|\!|\?)(?!\w)/'), $text, $matches );
			if ( $sentences === 0 ) $sentences = 1;

			// Count words
			$words = str_word_count( $text );
			if ( $words === 0 ) $words = 1;

			// Count syllables (approximate heuristic for speed)
			$syllables = $this->count_syllables( $text );

			$score = 206.835 - ( 1.015 * ( $words / $sentences ) ) - ( 84.6 * ( $syllables / $words ) );
			$score = max( 0, min( 100, round( $score ) ) );

			// Grade interpretation
			if ( $score >= 90 ) $grade = 'Very Easy';
			elseif ( $score >= 80 ) $grade = 'Easy';
			elseif ( $score >= 70 ) $grade = 'Fairly Easy';
			elseif ( $score >= 60 ) $grade = 'Standard';
			elseif ( $score >= 50 ) $grade = 'Fairly Difficult';
			elseif ( $score >= 30 ) $grade = 'Difficult';
			else $grade = 'Very Confusing';

			return [
				'score'     => $score,
				'grade'     => $grade,
				'words'     => $words,
				'sentences' => $sentences,
				'syllables' => $syllables
			];
		}

		/**
		 * Approximate Syllable Counter
		 */
		private function count_syllables( $text ) {
			$words = explode( ' ', preg_replace( '/[^a-zA-Z ]/', '', $text ) );
			$total = 0;
			
			foreach ( $words as $word ) {
				$word = strtolower( trim( $word ) );
				if ( empty( $word ) ) continue;
				
				// Basic heuristic for English syllables
				$word = preg_replace( '/(?:[^laeiouy]es|ed|[^laeiouy]e)$/', '', $word );
				$word = preg_replace( '/^y/', '', $word );
				$count = preg_match_all( '/[aeiouy]{1,2}/', $word, $matches );
				
				$total += ( $count > 0 ) ? $count : 1;
			}
			
			return $total;
		}

		/**
		 * Detect Passive Voice (Heuristics)
		 */
		private function detect_passive_voice( $text ) {
			// A very rudimentary passive voice regex finder.
			// Looks for forms of "to be" followed by an 'ed' verb or common irregular past participles.
			
			$passive_patterns = '/\b(am|is|are|was|were|be|been|being)\s+([a-z]+ed|known|seen|done|written|made|found|taken)\b/i';
			
			// Split into sentences
			$sentences = preg_split( '/(?<=[.?!])\s+(?=[a-z])/i', wp_strip_all_tags( $text ) );
			$passive_sentences = [];

			foreach ( $sentences as $sentence ) {
				if ( preg_match( $passive_patterns, $sentence ) ) {
					$passive_sentences[] = trim( $sentence );
				}
			}

			return $passive_sentences;
		}

		// --- AJAX HANDLERS ---

		public function ajax_analyze_readability() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'edit_posts' ) ) wp_send_json_error( 'Permission denied' );

			$text = isset( $_POST['text'] ) ? wp_unslash( $_POST['text'] ) : '';
			if ( empty( trim( $text ) ) ) {
				wp_send_json_error( 'Text is empty.' );
			}

			$flesch = $this->calculate_flesch_score( $text );
			$passive = $this->detect_passive_voice( $text );

			wp_send_json_success( [
				'flesch'  => $flesch,
				'passive' => $passive
			] );
		}

		public function ajax_rewrite_text() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'edit_posts' ) ) wp_send_json_error( 'Permission denied' );

			$text = isset( $_POST['text'] ) ? wp_unslash( $_POST['text'] ) : '';
			if ( empty( trim( $text ) ) ) wp_send_json_error( 'No text to rewrite.' );

			$ai = SEO_Copilot_AI_Factory::get_provider();
			if ( is_wp_error( $ai ) ) {
				wp_send_json_error( $ai->get_error_message() );
			}

			$result = $ai->rewrite_text( $text );
			
			if ( is_wp_error( $result ) ) {
				wp_send_json_error( $result->get_error_message() );
			}

			wp_send_json_success( $result );
		}

		public function ajax_bulk_analyze() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

			$posts = get_posts([
				'post_type'      => 'post',
				'post_status'    => 'publish',
				'posts_per_page' => 20,
				'orderby'        => 'post_date',
				'order'          => 'DESC'
			]);

			$results = [];
			foreach ( $posts as $p ) {
				$flesch = $this->calculate_flesch_score( $p->post_content );
				
				$results[] = [
					'id'    => $p->ID,
					'title' => $p->post_title,
					'url'   => get_edit_post_link( $p->ID, 'raw' ),
					'score' => $flesch['score'],
					'grade' => $flesch['grade']
				];
			}

			wp_send_json_success( $results );
		}
	}
}
new SEO_Copilot_Readability();
