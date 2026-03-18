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
      echo "<a href=\"{$url}\" style=\"" .
        "display:inline-block;" .
        "background:{$bg};" .
        "color:{$color};" .
        "padding:14px 32px;" .
        "border-radius:{$radius}px;" .
        "font-weight:600;" .
        "font-size:15px;" .
        "text-decoration:none;" .
        "transition:all 0.3s ease;" .
        "\">{$text}</a>";
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
