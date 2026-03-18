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
  $body = $request->get_json_params();
  $prompt = sanitize_text_field(
    $body['prompt'] ?? ''
  );
  
  $license_key = get_option(
    'wpcraft_license_key', ''
  );
  
  if (empty($license_key)) {
    return new WP_Error('no_license',
      'Please activate WPCraft first. ' .
      'Go to WPCraft → Settings.',
      ['status' => 401]);
  }
  
  if (empty($prompt)) {
    return new WP_Error('invalid',
      'Missing prompt', ['status' => 400]);
  }
  
  $generation_type = sanitize_text_field(
    $body['generation_type'] ?? 'page'
  );

  // Call YOUR Vercel API — not Gemini directly
  $response = wp_remote_post(
    'https://zorxm13.vercel.app/api/generate',
    [
      'timeout' => 60,
      'headers' => [
        'Content-Type' => 'application/json'
      ],
      'body' => json_encode([
        'source' => 'wpcraft-plugin',
        'license_key' => $license_key,
        'generation_type' => $generation_type,
        'pageType' => 
          $generation_type === 'section' || $generation_type === 'refine'
            ? $generation_type 
            : ($body['pageType'] ?? 'landing'),
        'businessName' => sanitize_text_field(
          $body['businessName'] ?? $prompt
        ),
        'description' => sanitize_textarea_field(
          $prompt
        ),
        'contextJson' => $body['contextJson'] ?? '',
        'tone' => $body['tone'] ?? 'professional',
        'primaryColor' => sanitize_hex_color(
          $body['primaryColor'] ?? '#166534'
        ) ?: '#166534',
        'ctaText' => sanitize_text_field(
          $body['ctaText'] ?? 'Get Started'
        )
      ])
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
      $data['error'] ?? 'Generation failed.',
      ['status' => 500]);
  }
  
  // Update local credits display
  if (isset($data['credits_remaining'])) {
    update_option(
      'wpcraft_credits', 
      $data['credits_remaining']
    );
  }
  
  if ($generation_type === 'refine') {
    // Return precisely the updated component JSON from Vercel bypassing elementor -> wpcraft total page conversion
    return rest_ensure_response([
      'success' => true,
      'data' => $data['data'] ?? [],
      'credits_remaining' => 
        $data['credits_remaining'] ?? null
    ]);
  }
  
  // Convert Elementor JSON to WPCraft format
  $wpcraft_data = wpcraft_convert_from_elementor(
    $data['data'] ?? []
  );
  
  return rest_ensure_response([
    'success' => true,
    'data' => $wpcraft_data,
    'credits_remaining' => 
      $data['credits_remaining'] ?? null
  ]);
}

function wpcraft_convert_from_elementor($elementor) {
  $sections = [];
  
  $elements = $elementor['elements'] ?? 
    $elementor['content'] ?? [];
  
  foreach ($elements as $el) {
    if (($el['elType'] ?? '') !== 'section') {
      continue;
    }
    
    $settings = $el['settings'] ?? [];
    $columns = [];
    
    foreach ($el['elements'] ?? [] as $col) {
      if (($col['elType'] ?? '') !== 'column') {
        continue;
      }
      $width = $col['settings']['_column_size'] 
        ?? 100;
      $elements_out = [];
      
      foreach ($col['elements'] ?? [] as $widget) {
        $ws = $widget['settings'] ?? [];
        $type = $widget['widgetType'] ?? '';
        
        switch ($type) {
          case 'heading':
            $elements_out[] = [
              'id' => $widget['id'] ?? 
                uniqid('el_'),
              'type' => 'heading',
              'settings' => [
                'text' => $ws['title'] ?? '',
                'tag' => $ws['header_size'] ?? 'h2',
                'fontSize' => $ws['typography_font_size']['size'] ?? 32,
                'fontWeight' => $ws['typography_font_weight'] ?? '700',
                'fontFamily' => $ws['typography_font_family'] ?? 'DM Sans',
                'color' => $ws['title_color'] ?? '#ffffff',
                'align' => $ws['align'] ?? 'left',
                'marginBottom' => intval($ws['_margin']['bottom'] ?? 16)
              ]
            ];
            break;
          case 'text-editor':
            $elements_out[] = [
              'id' => $widget['id'] ?? uniqid('el_'),
              'type' => 'text',
              'settings' => [
                'text' => strip_tags($ws['editor'] ?? $ws['content'] ?? ''),
                'fontSize' => $ws['typography_font_size']['size'] ?? 16,
                'color' => $ws['text_color'] ?? '#ffffff',
                'align' => $ws['align'] ?? 'left',
                'marginBottom' => 24,
                'lineHeight' => 1.7
              ]
            ];
            break;
          case 'button':
            $elements_out[] = [
              'id' => $widget['id'] ?? uniqid('el_'),
              'type' => 'button',
              'settings' => [
                'text' => $ws['text'] ?? 'Click Here',
                'url' => $ws['link']['url'] ?? '#',
                'backgroundColor' => $ws['background_color'] ?? '#166534',
                'color' => $ws['button_text_color'] ?? '#ffffff',
                'borderRadius' => 8,
                'align' => $ws['align'] ?? 'left',
                'marginBottom' => 0
              ]
            ];
            break;
          case 'image':
            $elements_out[] = [
              'id' => $widget['id'] ?? uniqid('el_'),
              'type' => 'image',
              'settings' => [
                'url' => $ws['image']['url'] ?? '',
                'alt' => '',
                'width' => '100%',
                'marginBottom' => 16
              ]
            ];
            break;
          case 'spacer':
            $elements_out[] = [
              'id' => $widget['id'] ?? uniqid('el_'),
              'type' => 'spacer',
              'settings' => [
                'height' => $ws['spacer_size']['size'] ?? 40,
                'backgroundColor' => $ws['background_color'] ?? '',
                'width' => isset($ws['_width']['size']) ? $ws['_width']['size'] . 'px' : '100%'
              ]
            ];
            break;
        }
      }
      
      if (!empty($elements_out)) {
        $columns[] = [
          'id' => $col['id'] ?? uniqid('col_'),
          'width' => intval($width),
          'elements' => $elements_out
        ];
      }
    }
    
    // Build section settings
    $bg_image = $settings['background_image']['url'] ?? '';
    $bg_color = $settings['background_color'] ?? '#ffffff';
    $bg_type = !empty($bg_image) ? 'image' : 'color';
    
    $sections[] = [
      'id' => $el['id'] ?? uniqid('sec_'),
      'type' => 'section',
      'settings' => [
        'background' => $bg_type === 'image' ? $bg_image : $bg_color,
        'backgroundType' => $bg_type,
        'backgroundOverlay' => $settings['background_overlay_color'] ?? '',
        'padding' => [
          'top' => intval($settings['padding']['top'] ?? 80),
          'bottom' => intval($settings['padding']['bottom'] ?? 80)
        ],
        'fullHeight' => ($settings['height'] ?? '') === 'min-height'
      ],
      'columns' => $columns
    ];
  }
  
  return [
    'title' => 'Generated Page',
    'sections' => $sections
  ];
}
