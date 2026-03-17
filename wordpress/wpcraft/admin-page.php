<?php if (!defined('ABSPATH')) exit; ?>
<div class="wrap wpcraft-admin">
  <h1>WPCraft AI Page Builder</h1>
  <p>Your site is connected to WPCraft.</p>
  <p>
    <a href="https://zorxm13.vercel.app/ai-generator" 
       target="_blank" 
       class="button button-primary button-large">
      Open WPCraft Generator →
    </a>
  </p>
  <div class="wpcraft-info">
    <h3>How to use:</h3>
    <ol>
      <li>Click "Open WPCraft Generator" above</li>
      <li>Fill in your business details and generate</li>
      <li>Click "Send to WordPress" on the generator</li>
      <li>Open your page in Elementor</li>
      <li>Right-click → Paste to insert your page</li>
    </ol>
  </div>

  <?php $nonce = wp_create_nonce('wp_rest'); ?>
  <div class="wpcraft-nonce-box">
    <label>Your Site Nonce (copy this):</label>
    <input 
      type="text" 
      readonly 
      onclick="this.select()" 
      value="<?php echo esc_attr($nonce); ?>"
    />
    <p class="description">
      Paste this in the WPCraft generator 
      when connecting your site.
      Note: Nonce expires after 24 hours.
    </p>
  </div>
</div>
