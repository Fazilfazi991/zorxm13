<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {

  // Load page data
  register_rest_route('wpcraft/v2', '/page/(?P<id>\d+)', [
    'methods' => 'GET',
    'callback' => 'wpcraft_get_page',
    'permission_callback' => function($request) {
      $nonce = $request->get_header('X-WP-Nonce');
      if (!$nonce) {
        $nonce = $request->get_param('_wpnonce');
      }
      if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) {
        return current_user_can('edit_posts');
      }
      if (is_user_logged_in()) {
        return current_user_can('edit_posts');
      }
      return new WP_Error('rest_forbidden', 'Authentication required.', ['status' => 401]);
    }
  ]);

  // Save page data
  register_rest_route('wpcraft/v2', '/page/(?P<id>\d+)', [
    'methods' => 'POST',
    'callback' => 'wpcraft_save_page',
    'permission_callback' => function($request) {
      $nonce = $request->get_header('X-WP-Nonce');
      if (!$nonce) {
        $nonce = $request->get_param('_wpnonce');
      }
      if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) {
        return current_user_can('edit_posts');
      }
      if (is_user_logged_in()) {
        return current_user_can('edit_posts');
      }
      return new WP_Error('rest_forbidden', 'Authentication required.', ['status' => 401]);
    }
  ]);

  // Publish page
  register_rest_route('wpcraft/v2', '/publish/(?P<id>\d+)', [
    'methods' => 'POST',
    'callback' => 'wpcraft_publish_page',
    'permission_callback' => function($request) {
      $nonce = $request->get_header('X-WP-Nonce');
      if (!$nonce) {
        $nonce = $request->get_param('_wpnonce');
      }
      if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) {
        return current_user_can('edit_posts');
      }
      if (is_user_logged_in()) {
        return current_user_can('edit_posts');
      }
      return new WP_Error('rest_forbidden', 'Authentication required.', ['status' => 401]);
    }
  ]);

  // AI generate
  register_rest_route('wpcraft/v2', '/generate', [
    'methods' => 'POST',
    'callback' => 'wpcraft_ai_generate',
    'permission_callback' => function($request) {
      $nonce = $request->get_header('X-WP-Nonce');
      if (!$nonce) {
        $nonce = $request->get_param('_wpnonce');
      }
      if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) {
        return current_user_can('edit_posts');
      }
      if (is_user_logged_in()) {
        return current_user_can('edit_posts');
      }
      return new WP_Error('rest_forbidden', 'Authentication required.', ['status' => 401]);
    }
  ]);
  
  // Get credits
  register_rest_route('wpcraft/v2', '/credits', [
    'methods' => 'GET',
    'callback' => 'wpcraft_get_credits',
    'permission_callback' => function($request) {
      $nonce = $request->get_header('X-WP-Nonce');
      if (!$nonce) {
        $nonce = $request->get_param('_wpnonce');
      }
      if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) {
        return current_user_can('edit_posts');
      }
      if (is_user_logged_in()) {
        return current_user_can('edit_posts');
      }
      return new WP_Error('rest_forbidden', 'Authentication required.', ['status' => 401]);
    }
  ]);

  // Generate SEO Meta
  register_rest_route('wpcraft/v2', '/seo', [
    'methods' => 'POST',
    'callback' => 'wpcraft_ai_seo',
    'permission_callback' => function($request) {
      $nonce = $request->get_header('X-WP-Nonce');
      if (!$nonce) $nonce = $request->get_param('_wpnonce');
      if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) return current_user_can('edit_posts');
      if (is_user_logged_in()) return current_user_can('edit_posts');
      return new WP_Error('rest_forbidden', 'Authentication required.', ['status' => 401]);
    }
  ]);

  // Generate Color Palette
  register_rest_route('wpcraft/v2', '/palette', [
    'methods' => 'POST',
    'callback' => 'wpcraft_ai_palette',
    'permission_callback' => function($request) {
      $nonce = $request->get_header('X-WP-Nonce');
      if (!$nonce) $nonce = $request->get_param('_wpnonce');
      if ($nonce && wp_verify_nonce($nonce, 'wp_rest')) return current_user_can('edit_posts');
      if (is_user_logged_in()) return current_user_can('edit_posts');
      return new WP_Error('rest_forbidden', 'Authentication required.', ['status' => 401]);
    }
  ]);

});

function wpcraft_get_credits($request) {
  return rest_ensure_response([
    'credits' => (int) get_option('wpcraft_credits', 0)
  ]);
}

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
  
  $json = wp_json_encode($body['data']);
  update_post_meta(
    $post_id, '_wpcraft_data', wp_slash($json)
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
  // TEMP DEBUG - remove after fix
  error_reporting(E_ALL);
  ini_set('display_errors', 0);
  ini_set('log_errors', 1);

  $body = $request->get_json_params();
  $prompt = sanitize_text_field(
    $body['prompt'] ?? ''
  );
  
  $license_key = get_option(
    'wpcraft_license_key', ''
  );
  
  // TESTING BYPASS - remove before production
  if (defined('WPCRAFT_DEV_MODE') && WPCRAFT_DEV_MODE === true) {
    // Skip license/credits check entirely
  } else {
    if (empty($license_key)) {
      return new WP_Error('no_license',
        'Please activate WPCraft first. ' .
        'Go to WPCraft → Settings.',
        ['status' => 401]);
    }
  }
  
  if (empty($prompt)) {
    return new WP_Error('invalid',
      'Missing prompt', ['status' => 400]);
  }
  
  $generation_type = sanitize_text_field(
    $body['generation_type'] ?? 'page'
  );

  // Call YOUR Vercel API — not Gemini directly
  $payload = [
    'source' => 'wpcraft-plugin',
    'license_key' => $license_key,
    'generation_type' => $generation_type
  ];
  
  // When in DEV_MODE, send a dev bypass key to Vercel
  if (defined('WPCRAFT_DEV_MODE') && WPCRAFT_DEV_MODE === true) {
    $payload['license_key'] = 'dev_bypass_2024';
    $payload['dev_mode'] = true;
  }
  
  if ($generation_type === 'refine') {
    $payload['systemPrompt'] = "You are a JSON page builder assistant. The user will give you a single section or element JSON object and a text instruction. Return ONLY the updated JSON object for that section or element. Do not wrap it in markdown. Do not explain anything. Return raw JSON only.";
    $payload['prompt'] = $prompt;
    $payload['contextJson'] = $body['contextJson'] ?? '';
  } else {
    $payload['pageType'] = $body['pageType'] ?? 'landing';
    $payload['businessName'] = sanitize_text_field($body['businessName'] ?? $prompt);
    $payload['description'] = sanitize_textarea_field($prompt);
    $payload['tone'] = $body['tone'] ?? 'professional';
    $payload['primaryColor'] = sanitize_hex_color($body['primaryColor'] ?? '#166534') ?: '#166534';
    $payload['ctaText'] = sanitize_text_field($body['ctaText'] ?? 'Get Started');
  }

  // FIX #1 & #4: Early Streaming Response
  if ($generation_type === 'page' || $generation_type === 'section') {
      header('Access-Control-Allow-Origin: *');
      header('Content-Type: application/json; charset=utf-8');
      header('Transfer-Encoding: chunked');
      header('Cache-Control: no-cache');
      if (extension_loaded('zlib')) ob_start('ob_gzhandler');

      // Send immediate response with skeleton
      echo json_encode([
          'type' => 'skeleton',
          'sections' => 6,
          'message' => 'Analyzing your request...'
      ]) . "\n";
      if (ob_get_level() > 0) ob_end_flush();
      flush();
  }

  set_time_limit(200);
  $response = wp_remote_post(
    'https://zorxm13.vercel.app/api/generate',
    [
      'timeout' => 180,
      'headers' => [
        'Content-Type' => 'application/json'
      ],
      'body' => json_encode($payload)
    ]
  );
  
  if (is_wp_error($response)) {
    return new WP_Error('api_error',
      'Connection failed: ' . 
      $response->get_error_message(),
      ['status' => 500]);
  }
  
  $status = wp_remote_retrieve_response_code(
    $response
  );
  $data = json_decode(
    wp_remote_retrieve_body($response), true
  );
  
  // Handle credit errors
  if ($status === 402) {
    // Update local credits to 0
    update_option('wpcraft_credits', 0);
    return new WP_Error('no_credits',
      $data['error'] ?? 'No credits remaining.',
      [
        'status' => 402,
        'upgrade_url' => $data['upgrade_url'] ?? 
          'https://zorxm13.vercel.app/pricing'
      ]
    );
  }
  
  if ($status !== 200 || empty($data['success'])) {
    return new WP_Error('api_error',
      'Vercel said: ' . wp_remote_retrieve_body($response),
      ['status' => 500]);
  }
  
  // Update local credits display
  if (isset($data['credits_remaining'])) {
    update_option(
      'wpcraft_credits', 
      $data['credits_remaining']
    );
  }
  
  // Retrieve raw payload from Vercel
  $vercel_payload = $data['data'] ?? [];
  
  if ($generation_type === 'refine') {
    $wpcraft_data = $vercel_payload;
  } else {
    // Force format to native WPCraft {"sections": [...]} exactly!
    $wpcraft_data = [];
    $wpcraft_data['title'] = $vercel_payload['title'] ?? 'Generated Page';
    $wpcraft_data['sections'] = $vercel_payload['sections'] ?? $vercel_payload['elements'] ?? [];
  }

  // error_log('WPCRAFT DATA KEYS: ' . implode(',', array_keys($wpcraft_data ?? []))); // Removed as part of streaming logic
  
  // Handle streaming response for 'page' and 'section' generation types
  if ($generation_type === 'page' || $generation_type === 'section') {
      if (!$data['success'] || empty($data['data'])) {
          echo json_encode(['type' => 'error', 'data' => ['message' => $data['error'] ?? 'Generation failed']]) . "\n";
          flush();
          exit;
      }
      
      $sections = isset($data['data']['elements']) ? $data['data']['elements'] : $data['data']['sections']; // Assuming 'sections' is the key for page/section data
      foreach ($sections as $index => $section) {
          echo json_encode([
              'type' => 'section',
              'index' => $index + 1,
              'total' => count($sections),
              'data' => $section
          ]) . "\n";
          usleep(100000); // 0.1s delay
          flush();
      }
      
      echo json_encode(['type' => 'complete', 'timestamp' => time()]) . "\n";
      flush();
      exit;
  }

  // Fallback for non-streaming endpoints (e.g., 'refine')
  return rest_ensure_response([
    'success' => $data['success'] ?? false,
    'data' => $wpcraft_data, // Use $wpcraft_data for non-streaming, already formatted
    'error' => $data['error'] ?? null,
    'credits_remaining' => $data['credits_remaining'] ?? null
  ]);
}

  // Elementor conversion routines removed. WPCraft is now standalone.

function wpcraft_ai_seo($request) {
  $body = $request->get_json_params();
  $post_id = intval($body['post_id'] ?? 0);
  
  if (!$post_id) {
    return new WP_Error('invalid', 'Missing post_id', ['status' => 400]);
  }

  $data = get_post_meta($post_id, '_wpcraft_data', true);
  if (empty($data)) {
    return new WP_Error('no_content', 'No WPCraft data found on page', ['status' => 404]);
  }

  $license_key = get_option('wpcraft_license_key', '');
  $payload = [
    'source' => 'wpcraft-plugin',
    'license_key' => $license_key,
    'generation_type' => 'seo',
    'prompt' => wp_strip_all_tags(is_string($data) ? $data : wp_json_encode($data))
  ];

  if (defined('WPCRAFT_DEV_MODE') && WPCRAFT_DEV_MODE === true) {
    $payload['license_key'] = 'dev_bypass_2024';
    $payload['dev_mode'] = true;
  }

  set_time_limit(200);
  $response = wp_remote_post(
    'https://zorxm13.vercel.app/api/generate',
    [
      'timeout' => 180,
      'headers' => ['Content-Type' => 'application/json'],
      'body' => wp_json_encode($payload)
    ]
  );

  if (is_wp_error($response)) {
    return new WP_Error('api_error', $response->get_error_message(), ['status' => 500]);
  }

  $status = wp_remote_retrieve_response_code($response);
  $res_data = json_decode(wp_remote_retrieve_body($response), true);

  if ($status !== 200 || empty($res_data['success'])) {
    return new WP_Error('api_error', wp_remote_retrieve_body($response), ['status' => 500]);
  }

  $seo_data = $res_data['data'] ?? [];
  
  if (!empty($seo_data['title'])) {
    update_post_meta($post_id, '_yoast_wpseo_title', sanitize_text_field($seo_data['title']));
    update_post_meta($post_id, '_wpcraft_seo_title', sanitize_text_field($seo_data['title']));
  }
  if (!empty($seo_data['description'])) {
    update_post_meta($post_id, '_yoast_wpseo_metadesc', sanitize_textarea_field($seo_data['description']));
  }
  if (!empty($seo_data['keywords'])) {
    $kw = is_array($seo_data['keywords']) ? implode(', ', $seo_data['keywords']) : $seo_data['keywords'];
    update_post_meta($post_id, '_yoast_wpseo_focuskw', sanitize_text_field($kw));
  }
  
  return rest_ensure_response([
    'success' => true,
    'data' => $seo_data
  ]);
}

function wpcraft_ai_palette($request) {
  $body = $request->get_json_params();
  $primary_color = sanitize_hex_color($body['primary_color'] ?? '#000000');
  
  $license_key = get_option('wpcraft_license_key', '');
  $payload = [
    'source' => 'wpcraft-plugin',
    'license_key' => $license_key,
    'generation_type' => 'palette',
    'prompt' => "Generate a color palette for primary color: " . $primary_color
  ];

  if (defined('WPCRAFT_DEV_MODE') && WPCRAFT_DEV_MODE === true) {
    $payload['license_key'] = 'dev_bypass_2024';
    $payload['dev_mode'] = true;
  }

  set_time_limit(200);
  $response = wp_remote_post(
    'https://zorxm13.vercel.app/api/generate',
    [
      'timeout' => 180,
      'headers' => ['Content-Type' => 'application/json'],
      'body' => wp_json_encode($payload)
    ]
  );

  if (is_wp_error($response)) {
    return new WP_Error('api_error', $response->get_error_message(), ['status' => 500]);
  }

  $status = wp_remote_retrieve_response_code($response);
  $res_data = json_decode(wp_remote_retrieve_body($response), true);

  if ($status !== 200 || empty($res_data['success'])) {
    return new WP_Error('api_error', wp_remote_retrieve_body($response), ['status' => 500]);
  }

  return rest_ensure_response([
    'success' => true,
    'data' => $res_data['data'] ?? []
  ]);
}
