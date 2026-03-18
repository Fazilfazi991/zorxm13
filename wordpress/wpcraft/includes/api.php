<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {

  // Load page data
  register_rest_route('wpcraft/v2', '/page/(?P<id>\d+)', [
    'methods' => 'GET',
    'callback' => 'wpcraft_get_page',
    'permission_callback' => function() {
      return current_user_can('edit_posts');
    }
  ]);

  // Save page data
  register_rest_route('wpcraft/v2', '/page/(?P<id>\d+)', [
    'methods' => 'POST',
    'callback' => 'wpcraft_save_page',
    'permission_callback' => function() {
      return current_user_can('edit_posts');
    }
  ]);

  // Publish page
  register_rest_route('wpcraft/v2', '/publish/(?P<id>\d+)', [
    'methods' => 'POST',
    'callback' => 'wpcraft_publish_page',
    'permission_callback' => function() {
      return current_user_can('edit_posts');
    }
  ]);

  // AI generate
  register_rest_route('wpcraft/v2', '/generate', [
    'methods' => 'POST',
    'callback' => 'wpcraft_ai_generate',
    'permission_callback' => function() {
      return current_user_can('edit_posts');
    }
  ]);

});

function wpcraft_get_page($request) {
  $post_id = $request['id'];
  $post = get_post($post_id);
  if (!$post) {
    return new WP_Error('not_found', 
      'Page not found', ['status' => 404]);
  }
  $data = get_post_meta(
    $post_id, '_wpcraft_data', true
  );
  return rest_ensure_response([
    'post_id' => $post_id,
    'title' => $post->post_title,
    'status' => $post->post_status,
    'data' => $data ? json_decode($data) : null
  ]);
}

function wpcraft_save_page($request) {
  $post_id = $request['id'];
  $body = $request->get_json_params();
  
  if (!isset($body['data'])) {
    return new WP_Error('invalid', 
      'Missing data', ['status' => 400]);
  }
  
  $json = json_encode($body['data']);
  update_post_meta(
    $post_id, '_wpcraft_data', $json
  );
  
  // Also update post title if provided
  if (!empty($body['title'])) {
    wp_update_post([
      'ID' => $post_id,
      'post_title' => sanitize_text_field(
        $body['title']
      )
    ]);
  }
  
  return rest_ensure_response([
    'success' => true,
    'post_id' => $post_id
  ]);
}

function wpcraft_publish_page($request) {
  $post_id = $request['id'];
  
  $result = wp_update_post([
    'ID' => $post_id,
    'post_status' => 'publish'
  ]);
  
  if (is_wp_error($result)) {
    return new WP_Error('publish_failed',
      $result->get_error_message(),
      ['status' => 500]);
  }
  
  return rest_ensure_response([
    'success' => true,
    'url' => get_permalink($post_id)
  ]);
}

function wpcraft_ai_generate($request) {
  $body = $request->get_json_params();
  $prompt = sanitize_text_field(
    $body['prompt'] ?? ''
  );
  $post_id = intval($body['post_id'] ?? 0);
  $api_key = get_option('wpcraft_gemini_key', '');
  
  if (empty($prompt)) {
    return new WP_Error('invalid',
      'Missing prompt', ['status' => 400]);
  }
  
  if (empty($api_key)) {
    return new WP_Error('no_key',
      'Gemini API key not configured. ' .
      'Go to WPCraft Settings.',
      ['status' => 400]);
  }
  
  // Call Gemini API
  $response = wp_remote_post(
    'https://generativelanguage.googleapis.com/' .
    'v1beta/models/gemini-2.5-flash:generateContent' .
    '?key=' . $api_key,
    [
      'timeout' => 60,
      'headers' => [
        'Content-Type' => 'application/json'
      ],
      'body' => json_encode([
        'contents' => [[
          'role' => 'user',
          'parts' => [[
            'text' => wpcraft_build_prompt($prompt)
          ]]
        ]],
        'generationConfig' => [
          'temperature' => 0.7,
          'maxOutputTokens' => 8192,
          'thinkingConfig' => [
            'thinkingBudget' => 0
          ]
        ]
      ])
    ]
  );
  
  if (is_wp_error($response)) {
    return new WP_Error('api_error',
      $response->get_error_message(),
      ['status' => 500]);
  }
  
  $body = json_decode(
    wp_remote_retrieve_body($response), true
  );
  $text = $body['candidates'][0]
    ['content']['parts'][0]['text'] ?? '';
  
  if (empty($text)) {
    return new WP_Error('empty_response',
      'AI returned empty response',
      ['status' => 500]);
  }
  
  // Parse JSON from response
  $text = trim($text);
  $text = preg_replace(
    '/^```json\s*/i', '', $text
  );
  $text = preg_replace('/\s*```$/i', '', $text);
  $text = trim($text);
  
  $first = strpos($text, '{');
  $last = strrpos($text, '}');
  if ($first !== false && $last !== false) {
    $text = substr($text, $first, 
      $last - $first + 1);
  }
  
  $data = json_decode($text, true);
  
  if (!$data) {
    return new WP_Error('parse_error',
      'Failed to parse AI response',
      ['status' => 500]);
  }
  
  return rest_ensure_response([
    'success' => true,
    'data' => $data
  ]);
}

function wpcraft_build_prompt($user_prompt) {
  return 'Generate a page for: ' . $user_prompt . '

Return ONLY valid JSON with this structure:
{
  "title": "Page Title",
  "sections": [
    {
      "id": "unique_id",
      "type": "hero|features|about|cta|footer",
      "settings": {
        "background": "#color or image url",
        "backgroundType": "color|image",
        "backgroundOverlay": "rgba(0,0,0,0.8)",
        "padding": {"top":80,"bottom":80},
        "fullHeight": true
      },
      "columns": [
        {
          "id": "col_id",
          "width": 100,
          "elements": [
            {
              "id": "el_id",
              "type": "heading|text|button|image|spacer",
              "settings": {
                "text": "Content here",
                "tag": "h1",
                "fontSize": 56,
                "fontWeight": "800",
                "fontFamily": "DM Sans",
                "color": "#ffffff",
                "align": "center",
                "marginBottom": 24
              }
            }
          ]
        }
      ]
    }
  ]
}

Use real Unsplash image URLs for backgrounds.
Write real copy for the business.
Include 5-6 sections.
Return ONLY the JSON.';
}
