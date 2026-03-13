<?php
/**
 * Topical Authority Engine Class
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! class_exists( 'SEO_Copilot_Topical_Authority' ) ) {

	class SEO_Copilot_Topical_Authority {

		public function __construct() {
			// Hooks
			add_action( 'save_post', [ $this, 'auto_match_new_post' ], 20, 1 );

			// AJAX endpoints
			add_action( 'wp_ajax_seo_copilot_generate_topic_map', [ $this, 'ajax_generate_topic_map' ] );
			add_action( 'wp_ajax_seo_copilot_get_topic_map', [ $this, 'ajax_get_topic_map' ] );
			add_action( 'wp_ajax_seo_copilot_update_gap_status', [ $this, 'ajax_update_gap_status' ] );
			add_action( 'wp_ajax_seo_copilot_get_calendar', [ $this, 'ajax_get_calendar' ] );
			add_action( 'wp_ajax_seo_copilot_delete_topic_map', [ $this, 'ajax_delete_topic_map' ] );
			add_action( 'wp_ajax_seo_copilot_link_gap_to_post', [ $this, 'ajax_link_gap_to_post' ] );
			add_action( 'wp_ajax_seo_copilot_generate_gap_brief', [ $this, 'ajax_generate_gap_brief' ] );
		}

		/**
		 * Generates the topic map via AI and saves it.
		 */
		public function generate_topic_map( $main_topic, $country_code ) {
			global $wpdb;

			$provider = SEO_Copilot_AI_Factory::get_provider();
			
			$prompt = "You are an expert SEO content strategist. Generate a complete topical authority map for a website about '{$main_topic}'.

Think like Google: what ALL subtopics must a true expert on '{$main_topic}' cover to be considered the authority?

Return exactly this JSON structure and absolutely nothing else:
{
  \"main_topic\": \"{$main_topic}\",
  \"clusters\": [
    {
      \"cluster_name\": \"string\",
      \"cluster_description\": \"string\",
      \"subtopics\": [
        {
          \"title\": \"string\",
          \"search_intent\": \"informational|commercial|transactional|navigational\",
          \"content_type\": \"guide|tutorial|listicle|comparison|review|tool\",
          \"estimated_volume\": \"high|medium|low\",
          \"difficulty\": \"easy|medium|hard\",
          \"priority\": 8,
          \"example_title\": \"Specific title targeting this\"
        }
      ]
    }
  ],
  \"pillar_page\": {
    \"title\": \"string\",
    \"description\": \"string\"
  },
  \"estimated_posts_needed\": 25,
  \"time_to_authority\": \"6-12 months\"
}";

			$response = $provider->generate_text( $prompt, ['temperature' => 0.5] );
			if ( is_wp_error( $response ) ) {
				return $response;
			}

			$json = $this->extract_json( $response );
			if ( ! $json || empty( $json['clusters'] ) ) {
				return new WP_Error( 'parse_error', 'Failed to parse AI response into semantic clusters.' );
			}

			// Insert Map
			$table_maps = $wpdb->prefix . 'seo_copilot_topic_maps';
			$wpdb->insert(
				$table_maps,
				[
					'main_topic' => $main_topic,
					'country_code' => $country_code,
					'topic_data' => wp_json_encode( $json ),
					'coverage_score' => 0,
					'total_subtopics' => 0,
					'covered_subtopics' => 0,
					'status' => 'active',
					'created_at' => current_time( 'mysql' ),
					'updated_at' => current_time( 'mysql' )
				],
				[ '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%s', '%s' ]
			);

			$map_id = $wpdb->insert_id;
			if ( ! $map_id ) return new WP_Error( 'db_error', 'Could not create map.' );

			// Process Clusters into Gaps
			$table_gaps = $wpdb->prefix . 'seo_copilot_topic_gaps';
			$total_subs = 0;
			$covered_subs = 0;

			foreach ( $json['clusters'] as $cluster ) {
				$cluster_name = isset( $cluster['cluster_name'] ) ? sanitize_text_field( $cluster['cluster_name'] ) : 'General';
				
				if ( ! empty( $cluster['subtopics'] ) ) {
					foreach ( $cluster['subtopics'] as $sub ) {
						$sub_title = sanitize_text_field( $sub['title'] );
						$volume_str = isset($sub['estimated_volume']) ? strtolower($sub['estimated_volume']) : 'low';
						$diff_str = isset($sub['difficulty']) ? strtolower($sub['difficulty']) : 'medium';
						$ai_priority = isset($sub['priority']) ? intval($sub['priority']) : 5;

						// Map Volumes
						$vol = 200;
						if ( $volume_str === 'high' ) $vol = 5000;
						elseif ( $volume_str === 'medium' ) $vol = 1000;

						// Map Difficulty (1-10 string mappings naive)
						$diff_score = 5;
						if ( $diff_str === 'easy' ) $diff_score = 2;
						elseif ( $diff_str === 'hard' ) $diff_score = 8;

						// priority_score calculation
						$priority_score = ( $vol / 1000 ) * ( 11 - $diff_score ) * $ai_priority;
						$priority_score = min( 1000, max( 1, intval($priority_score) ) ); // Clamp

						// Check existing content
						$match = $this->find_matching_post( $sub_title );
						$status = 'gap';
						$matched_post_id = null;

						if ( $match['status'] === 'covered' ) {
							$status = 'covered';
							$matched_post_id = $match['post_id'];
							$covered_subs++;
						} elseif ( $match['status'] === 'partial' ) {
							$status = 'partial';
							$matched_post_id = $match['post_id'];
						}

						$wpdb->insert(
							$table_gaps,
							[
								'map_id' => $map_id,
								'subtopic' => $sub_title,
								'cluster' => $cluster_name,
								'search_volume' => $vol,
								'priority_score' => $priority_score,
								'status' => $status,
								'matched_post_id' => $matched_post_id,
								'created_at' => current_time('mysql')
							],
							[ '%d', '%s', '%s', '%d', '%d', '%s', '%d', '%s' ]
						);

						$total_subs++;
					}
				}
			}

			// Update total score
			$coverage_score = $total_subs > 0 ? round( ( $covered_subs / $total_subs ) * 100 ) : 0;
			$wpdb->update(
				$table_maps,
				[
					'total_subtopics' => $total_subs,
					'covered_subtopics' => $covered_subs,
					'coverage_score' => $coverage_score
				],
				[ 'id' => $map_id ],
				[ '%d', '%d', '%d' ],
				[ '%d' ]
			);

			if ( class_exists('SEO_Copilot_Admin') ) {
				SEO_Copilot_Admin::log_activity( 0, 'Topical Authority Map Created', [ 'topic' => $main_topic, 'subs' => $total_subs ] );
			}

			return $map_id;
		}

		private function find_matching_post( $subtopic ) {
			// Super naive title matching for proof of concept
			global $wpdb;
			
			$term = '%' . $wpdb->esc_like( $subtopic ) . '%';
			
			// 1. Check exact titles
			$exact = $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_title LIKE %s AND post_status='publish' AND post_type IN ('post','page') LIMIT 1", $term ) );
			
			if ( $exact ) {
				return [ 'status' => 'covered', 'post_id' => $exact ];
			}

			// 2. Fallback to WP_Query loose searching for partial
			$args = [
				's' => $subtopic,
				'post_type' => ['post', 'page'],
				'post_status' => 'publish',
				'posts_per_page' => 1
			];
			$q = new WP_Query( $args );
			if ( $q->have_posts() ) {
				return [ 'status' => 'partial', 'post_id' => $q->posts[0]->ID ];
			}

			return [ 'status' => 'none', 'post_id' => null ];
		}

		public function get_topic_map( $map_id ) {
			global $wpdb;
			$map = $wpdb->get_row( $wpdb->prepare("SELECT * FROM {$wpdb->prefix}seo_copilot_topic_maps WHERE id = %d", $map_id) );
			if ( ! $map ) return false;

			$gaps = $wpdb->get_results( $wpdb->prepare("SELECT * FROM {$wpdb->prefix}seo_copilot_topic_gaps WHERE map_id = %d ORDER BY priority_score DESC", $map_id) );

			$clusters = [];
			foreach ( $gaps as $g ) {
				if ( ! isset( $clusters[ $g->cluster ] ) ) {
					$clusters[ $g->cluster ] = [
						'name' => $g->cluster,
						'total' => 0,
						'covered' => 0,
						'gaps' => []
					];
				}
				$clusters[ $g->cluster ]['total']++;
				if ( $g->status === 'covered' ) {
					$clusters[ $g->cluster ]['covered']++;
				}
				$clusters[ $g->cluster ]['gaps'][] = $g;
			}

			// Calc coverage %
			foreach ( $clusters as $k => $c ) {
				$clusters[$k]['coverage'] = $c['total'] > 0 ? round( ( $c['covered'] / $c['total'] ) * 100 ) : 0;
			}

			$map->clusters = $clusters;
			$map->topic_data = json_decode( $map->topic_data, true );

			return $map;
		}

		public function get_all_maps() {
			global $wpdb;
			return $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}seo_copilot_topic_maps ORDER BY updated_at DESC" );
		}

		public function update_gap_status( $gap_id, $status, $post_id = null ) {
			global $wpdb;
			$table = $wpdb->prefix . 'seo_copilot_topic_gaps';
			
			$gap = $wpdb->get_row($wpdb->prepare("SELECT map_id FROM $table WHERE id = %d", $gap_id));
			if ( ! $gap ) return false;

			$data = [ 'status' => $status ];
			if ( $post_id !== null ) {
				$data['matched_post_id'] = $post_id;
			}

			$wpdb->update(
				$table,
				$data,
				[ 'id' => $gap_id ],
				[ '%s', '%d' ],
				[ '%d' ]
			);

			$this->recalc_map_score( $gap->map_id );
			return true;
		}

		private function recalc_map_score( $map_id ) {
			global $wpdb;
			$gaps_table = $wpdb->prefix . 'seo_copilot_topic_gaps';
			$maps_table = $wpdb->prefix . 'seo_copilot_topic_maps';

			$total = $wpdb->get_var($wpdb->prepare("SELECT COUNT(id) FROM $gaps_table WHERE map_id = %d", $map_id));
			$covered = $wpdb->get_var($wpdb->prepare("SELECT COUNT(id) FROM $gaps_table WHERE map_id = %d AND status = 'covered'", $map_id));

			$score = $total > 0 ? round( ($covered / $total) * 100 ) : 0;

			$wpdb->update(
				$maps_table,
				[
					'total_subtopics' => $total,
					'covered_subtopics' => $covered,
					'coverage_score' => $score,
					'updated_at' => current_time('mysql')
				],
				[ 'id' => $map_id ],
				[ '%d', '%d', '%d', '%s' ],
				[ '%d' ]
			);
		}

		public function auto_match_new_post( $post_id ) {
			// Ignore revisions
			if ( wp_is_post_revision( $post_id ) ) return;
			$post = get_post($post_id);
			if ( ! $post || $post->post_status !== 'publish' || ! in_array( $post->post_type, ['post','page'] ) ) {
				return;
			}

			global $wpdb;
			$gaps_table = $wpdb->prefix . 'seo_copilot_topic_gaps';

			// Find partials or gaps that match this post's title natively
			$term = '%' . $wpdb->esc_like( $post->post_title ) . '%';
			$matches = $wpdb->get_results( $wpdb->prepare("SELECT id FROM $gaps_table WHERE status != 'covered' AND subtopic LIKE %s", $term) );

			if ( $matches ) {
				foreach ( $matches as $m ) {
					$this->update_gap_status( $m->id, 'covered', $post_id );
				}
			}
		}

		public function get_content_calendar( $map_id, $weeks = 12 ) {
			global $wpdb;
			// 2 posts per week = $weeks * 2 gaps needed max
			$limit = $weeks * 2;
			
			$gaps = $wpdb->get_results( $wpdb->prepare("SELECT * FROM {$wpdb->prefix}seo_copilot_topic_gaps WHERE map_id = %d AND status IN ('gap', 'planned') ORDER BY priority_score DESC LIMIT %d", $map_id, $limit) );

			$cal = [];
			$gap_idx = 0;

			$start_date = current_time('timestamp');

			for ( $i = 1; $i <= $weeks; $i++ ) {
				$week_gaps = [];
				if ( isset($gaps[$gap_idx]) ) { $week_gaps[] = $gaps[$gap_idx]; $gap_idx++; }
				if ( isset($gaps[$gap_idx]) ) { $week_gaps[] = $gaps[$gap_idx]; $gap_idx++; }

				if ( empty($week_gaps) ) break; // No more gaps to schedule

				$wk_start = $start_date + ( ($i - 1) * 7 * 86400 );
				$wk_end = $wk_start + ( 6 * 86400 );
				$range = date_i18n('M j', $wk_start) . ' - ' . date_i18n('M j', $wk_end);

				$cal[] = [
					'week' => $i,
					'date_range' => $range,
					'posts' => $week_gaps
				];
			}

			return $cal;
		}

		public function delete_map( $map_id ) {
			global $wpdb;
			$wpdb->delete( $wpdb->prefix . 'seo_copilot_topic_gaps', ['map_id' => $map_id], ['%d'] );
			$wpdb->delete( $wpdb->prefix . 'seo_copilot_topic_maps', ['id' => $map_id], ['%d'] );
			return true;
		}

		public function get_coverage_by_cluster( $map_id ) {
			$map = $this->get_topic_map( $map_id );
			if ( ! $map ) return [];

			$res = [];
			foreach ( $map->clusters as $c ) {
				$partials = 0;
				$gaps = 0;
				foreach ($c['gaps'] as $g) {
					if ($g->status === 'partial') $partials++;
					if ($g->status === 'gap') $gaps++;
				}
				$res[] = [
					'name' => $c['name'],
					'coverage' => $c['coverage'],
					'covered' => $c['covered'],
					'partials' => $partials,
					'gaps' => $gaps
				];
			}
			return $res;
		}

		private function extract_json( $text ) {
			$text = preg_replace('/```json/i', '', $text);
			$text = preg_replace('/```/i', '', $text);
			return json_decode(trim($text), true);
		}

		/* -------------------------------------------------------------
		 * AJAX HANDLERS
		 * ------------------------------------------------------------- */
		
		public function ajax_generate_topic_map() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$topic = sanitize_text_field( wp_unslash($_POST['topic']) );
			$country = sanitize_text_field( wp_unslash($_POST['country']) );

			$map_id = $this->generate_topic_map( $topic, $country );

			if ( is_wp_error($map_id) ) {
				wp_send_json_error( $map_id->get_error_message() );
			}

			wp_send_json_success( ['map_id' => $map_id] );
		}

		public function ajax_get_topic_map() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$map_id = intval($_POST['map_id']);
			$map = $this->get_topic_map( $map_id );

			if ( $map ) {
				$map->cluster_coverage = $this->get_coverage_by_cluster($map_id);
				$map->calendar = $this->get_content_calendar($map_id);
				wp_send_json_success( $map );
			} else {
				wp_send_json_error( "Map not found." );
			}
		}

		public function ajax_update_gap_status() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$gap_id = intval($_POST['gap_id']);
			$status = sanitize_text_field($_POST['status']);
			
			if ( $this->update_gap_status( $gap_id, $status ) ) {
				wp_send_json_success();
			} else {
				wp_send_json_error();
			}
		}

		public function ajax_get_calendar() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$map_id = intval($_POST['map_id']);
			$cal = $this->get_content_calendar($map_id);
			wp_send_json_success( $cal );
		}

		public function ajax_delete_topic_map() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$map_id = intval($_POST['map_id']);
			$this->delete_map( $map_id );
			wp_send_json_success();
		}

		public function ajax_link_gap_to_post() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$gap_id = intval($_POST['gap_id']);
			$post_id = intval($_POST['post_id']);

			if ( $this->update_gap_status( $gap_id, 'covered', $post_id ) ) {
				wp_send_json_success();
			} else {
				wp_send_json_error();
			}
		}

		public function ajax_generate_gap_brief() {
			check_ajax_referer( 'seo_copilot_admin_nonce', 'nonce' );
			if ( ! current_user_can('manage_options') ) wp_send_json_error();

			$gap_id = intval($_POST['gap_id']);
			
			global $wpdb;
			$gap = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}seo_copilot_topic_gaps WHERE id = %d", $gap_id));
			if ( ! $gap ) wp_send_json_error("Gap not found");

			$map = $wpdb->get_row($wpdb->prepare("SELECT country_code FROM {$wpdb->prefix}seo_copilot_topic_maps WHERE id = %d", $gap->map_id));
			$country = $map ? $map->country_code : 'US';

			// Leverage existing SEO Brief Generator
			if ( class_exists('SEO_Copilot_Brief_Generator') ) {
				$generator = seo_copilot_brief_generator();
				$brief_id = $generator->generate_brief( $gap->subtopic, $country );
				
				if ( ! is_wp_error($brief_id) ) {
					// Update gap with brief ID and mark planned
					$wpdb->update(
						$wpdb->prefix . 'seo_copilot_topic_gaps',
						[ 'brief_id' => $brief_id, 'status' => 'planned' ],
						[ 'id' => $gap_id ],
						[ '%d', '%s' ],
						[ '%d' ]
					);
					
					// Return URL to the brief builder
					$url = admin_url('admin.php?page=seo-copilot-briefs&action=edit&id=' . $brief_id);
					wp_send_json_success( ['redirect_url' => $url] );
				} else {
					wp_send_json_error( $brief_id->get_error_message() );
				}
			} else {
				wp_send_json_error("SEO Brief Generator module not active.");
			}
		}

	}
}

/**
 * Access function for singletons
 */
function seo_copilot_topical_authority() {
	static $instance = null;
	if ( is_null( $instance ) ) {
		$instance = new SEO_Copilot_Topical_Authority();
	}
	return $instance;
}

// Hook it immediately
seo_copilot_topical_authority();
