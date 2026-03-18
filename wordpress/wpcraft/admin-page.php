<?php if (!defined('ABSPATH')) exit; ?>
<div class="wrap wpcraft-wrap">
  
  <div class="wpcraft-header">
    <div class="wpcraft-logo">WPCraft</div>
    <p>AI Page Importer — paste JSON, 
       create Elementor pages instantly</p>
  </div>

  <div class="wpcraft-card">
    <h2>Create Page from JSON</h2>
    <p class="wpcraft-subtitle">
      Generate a page on 
      <a href="https://zorxm13.vercel.app/ai-generator" 
         target="_blank">WPCraft Generator</a>, 
      copy the JSON, paste it below.
    </p>

    <div class="wpcraft-form">
      
      <div class="wpcraft-field">
        <label for="wpcraft-title">Page Title</label>
        <input 
          type="text" 
          id="wpcraft-title"
          placeholder="e.g. Landing Page — SEO Agency"
        />
      </div>

      <div class="wpcraft-field">
        <label for="wpcraft-json">
          Paste your JSON here
          <span class="wpcraft-hint">
            From WPCraft Generator → 
            "Download JSON" or "Copy JSON"
          </span>
        </label>
        <textarea 
          id="wpcraft-json"
          placeholder='Paste your Elementor JSON here...
          
Example format:
{
  "type": "elementor",
  "elements": [...]
}

Or download JSON from WPCraft Generator.'
          rows="12"
        ></textarea>
      </div>

      <div class="wpcraft-field wpcraft-checkbox-row">
        <input type="checkbox" id="wpcraft-draft" 
          checked />
        <label for="wpcraft-draft">
          Create as draft 
          (recommended — review before publishing)
        </label>
      </div>

      <button id="wpcraft-submit" 
        class="wpcraft-btn">
        Create Elementor Page →
      </button>

      <div id="wpcraft-result" 
        class="wpcraft-result" 
        style="display:none;">
      </div>

    </div>
  </div>

  <div class="wpcraft-card wpcraft-help">
    <h3>How to use</h3>
    <ol>
      <li>
        Go to 
        <a href="https://zorxm13.vercel.app/ai-generator" 
           target="_blank">
          WPCraft Generator
        </a>
      </li>
      <li>Fill in your business details 
          and generate a page</li>
      <li>Click "Download JSON" or "Copy JSON"</li>
      <li>Paste the JSON in the box above</li>
      <li>Click "Create Elementor Page"</li>
      <li>Edit your new page in Elementor</li>
    </ol>
  </div>

</div>
