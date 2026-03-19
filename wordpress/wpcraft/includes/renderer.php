<?php
if (!defined('ABSPATH')) exit;

function wpcraft_render_page($data) {
  if (empty($data['sections'])) return '';
  
  ob_start();
  ?>
  <div class="wpcraft-page">
    <?php foreach ($data['sections'] as $section): ?>
      <?php wpcraft_render_section($section); ?>
    <?php endforeach; ?>
  </div>
  <?php
  return ob_get_clean();
}

function wpcraft_render_section($section) {
  $settings = $section['settings'] ?? [];
  $style = wpcraft_section_styles($settings);
  $id = esc_attr($section['id'] ?? '');
  ?>
  <section id="<?php echo $id; ?>" 
    style="<?php echo $style; ?>">
    <?php if (!empty($settings['backgroundType']) 
      && $settings['backgroundType'] === 'image' 
      && !empty($settings['backgroundOverlay'])): ?>
      <div style="position:absolute;inset:0;
        background:<?php echo esc_attr(
          $settings['backgroundOverlay']
        ); ?>;"></div>
    <?php endif; ?>
    <div style="position:relative;z-index:1;
      max-width:1200px;margin:0 auto;
      display:flex;flex-wrap:wrap;">
      <?php foreach (
        $section['columns'] ?? [] as $col
      ): ?>
        <?php wpcraft_render_column($col); ?>
      <?php endforeach; ?>
    </div>
  </section>
  <?php
}

function wpcraft_section_styles($settings) {
  $styles = [];
  $styles[] = 'position:relative';
  $styles[] = 'box-sizing:border-box';
  
  $pt = $settings['padding']['top'] ?? 80;
  $pb = $settings['padding']['bottom'] ?? 80;
  $styles[] = "padding:{$pt}px 40px {$pb}px";
  
  if (!empty($settings['fullHeight'])) {
    $styles[] = 'min-height:100vh';
    $styles[] = 'display:flex';
    $styles[] = 'align-items:center';
  }
  
  $bg_type = $settings['backgroundType'] ?? 'color';
  
  if ($bg_type === 'image' && 
      !empty($settings['background'])) {
    $url = esc_url($settings['background']);
    $styles[] = "background-image:url({$url})";
    $styles[] = 'background-size:cover';
    $styles[] = 'background-position:center';
    $styles[] = 'background-repeat:no-repeat';
  } elseif (!empty($settings['background'])) {
    $bg = esc_attr($settings['background']);
    $styles[] = "background-color:{$bg}";
  }
  
  return implode(';', $styles);
}

function wpcraft_render_column($col) {
  $width = $col['width'] ?? 100;
  $flex = $width === 100 ? '1 1 100%' : 
    "0 0 {$width}%";
  ?>
  <div style="flex:<?php echo $flex; ?>;
    padding:0 12px;box-sizing:border-box;">
    <?php foreach (
      $col['elements'] ?? [] as $element
    ): ?>
      <?php wpcraft_render_element($element); ?>
    <?php endforeach; ?>
  </div>
  <?php
}

function wpcraft_render_element($el) {
  $type = $el['type'] ?? '';
  $settings = $el['settings'] ?? [];
  $style = wpcraft_element_styles($settings);
  
  switch ($type) {
    case 'heading':
      $tag = esc_attr(
        $settings['tag'] ?? 'h2'
      );
      $text = wp_kses_post(
        $settings['text'] ?? ''
      );
      echo "<{$tag} style=\"{$style}\">" .
        $text . "</{$tag}>";
      break;
      
    case 'text':
      $text = wp_kses_post(
        $settings['text'] ?? ''
      );
      echo "<p style=\"{$style}\">" . 
        $text . "</p>";
      break;
      
    case 'buttonGroup':
      $direction = esc_attr($settings['direction'] ?? 'row');
      $gap = intval($settings['gap'] ?? 16);
      $align = esc_attr($settings['align'] ?? 'center');
      $mb = intval($settings['marginBottom'] ?? 0);
      $justify = $align === 'left' ? 'flex-start' : ($align === 'right' ? 'flex-end' : 'center');
      
      echo "<div style=\"display:flex;flex-direction:{$direction};gap:{$gap}px;justify-content:{$justify};margin-bottom:{$mb}px;\">";
      foreach ($el['buttons'] ?? [] as $btn) {
        wpcraft_render_element($btn);
      }
      echo "</div>";
      break;

    case 'divider':
      $divStyle = $settings['style'] ?? 'line';
      $divColor = esc_attr($settings['color'] ?? '#e2e8f0');
      $divHeight = intval($settings['height'] ?? 0);
      $divMb = intval($settings['marginBottom'] ?? 0);
      
      if ($divStyle === 'wave') {
        $divHeight = $divHeight ?: 60; // fallback depth
        echo "<svg viewBox=\"0 0 1200 120\" preserveAspectRatio=\"none\" style=\"display:block;width:100%;height:{$divHeight}px;margin-bottom:{$divMb}px;\">
          <path d=\"M321.4,56.4c58-10.8,114.2-30.1,172-41.9,82.4-16.7,168.2-17.7,250.5-.4,242.9,50.8,325.8,91.8,404.7,112.7,70.1,18.5,146.5,26.1,214.3,3V0H0v27.4A600.2,600.2,0,0,0,321.4,56.4Z\" fill=\"{$divColor}\"></path>
        </svg>";
      } else {
        echo "<hr style=\"border:none;border-top:1px solid {$divColor};margin:{$divMb}px 0;\">";
      }
      break;

    case 'icon':
      $name = esc_attr($settings['name'] ?? 'mdi:check');
      $size = intval($settings['size'] ?? 24);
      $iconColor = rawurlencode($settings['color'] ?? '#000000');
      $align = esc_attr($settings['align'] ?? 'left');
      
      $alignStyle = $align === 'center' ? 'margin:0 auto;' : ($align === 'right' ? 'margin-left:auto;' : '');
      $url = "https://api.iconify.design/{$name}.svg?color={$iconColor}";
      echo "<img src=\"{$url}\" width=\"{$size}\" height=\"{$size}\" style=\"display:block;{$alignStyle}{$style}\">";
      break;

    case 'button':
      $text = esc_html(
        $settings['text'] ?? 'Click Here'
      );
      $url = esc_url(
        $settings['url'] ?? '#'
      );
      $bg = esc_attr(
        $settings['backgroundColor'] ?? '#166534'
      );
      $color = esc_attr(
        $settings['color'] ?? '#ffffff'
      );
      $radius = intval(
        $settings['borderRadius'] ?? 8
      );
      $variant = $settings['variant'] ?? 'solid';
      $btnSize = $settings['size'] ?? 'md';

      $pad = '12px 28px';
      $fs = '16px';
      if ($btnSize === 'sm') { $pad = '8px 20px'; $fs = '14px'; }
      if ($btnSize === 'lg') { $pad = '16px 36px'; $fs = '18px'; }

      $btn_bg = $variant === 'outline' ? 'transparent' : $bg;
      $btn_border = $variant === 'outline' ? "2px solid {$bg}" : 'none';
      if ($variant === 'outline') $color = $bg;

      echo "<a href=\"{$url}\" style=\"" .
        "display:inline-block;" .
        "background:{$btn_bg};" .
        "color:{$color};" .
        "padding:{$pad};" .
        "border:{$btn_border};" .
        "border-radius:{$radius}px;" .
        "font-weight:600;" .
        "font-size:{$fs};" .
        "text-decoration:none;" .
        "transition:all 0.3s ease;" .
        "{$style}\">{$text}</a>";
      break;
      
    case 'image':
      $url = esc_url(
        $settings['url'] ?? ''
      );
      $alt = esc_attr(
        $settings['alt'] ?? ''
      );
      if ($url) {
        echo "<img src=\"{$url}\" " .
          "alt=\"{$alt}\" " .
          "style=\"{$style}\">";
      }
      break;
      
    case 'spacer':
      $height = intval(
        $settings['height'] ?? 40
      );
      $bg = esc_attr(
        $settings['backgroundColor'] ?? ''
      );
      $width = esc_attr(
        $settings['width'] ?? '100%'
      );
      $bg_style = $bg ? 
        "background:{$bg};" : '';
      echo "<div style=\"" .
        "height:{$height}px;" .
        "width:{$width};" .
        "{$bg_style}\"></div>";
      break;
  }
}

function wpcraft_element_styles($settings) {
  $styles = [];
  
  if (!empty($settings['fontSize'])) {
    $styles[] = 'font-size:' . 
      intval($settings['fontSize']) . 'px';
  }
  if (!empty($settings['fontWeight'])) {
    $styles[] = 'font-weight:' . 
      esc_attr($settings['fontWeight']);
  }
  if (!empty($settings['fontFamily'])) {
    $styles[] = 'font-family:\'' . 
      esc_attr($settings['fontFamily']) . 
      '\',sans-serif';
  }
  if (!empty($settings['color'])) {
    $styles[] = 'color:' . 
      esc_attr($settings['color']);
  }
  if (!empty($settings['align'])) {
    $styles[] = 'text-align:' . 
      esc_attr($settings['align']);
  }
  if (isset($settings['marginBottom'])) {
    $styles[] = 'margin-bottom:' . 
      intval($settings['marginBottom']) . 'px';
  }
  if (isset($settings['lineHeight'])) {
    $styles[] = 'line-height:' . 
      floatval($settings['lineHeight']);
  }
  if (!empty($settings['width'])) {
    $styles[] = 'width:100%';
  }
  
  return implode(';', $styles);
}
