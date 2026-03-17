jQuery(window).on(
  'elementor/frontend/init', 
  function() {
    if (typeof elementor === 'undefined') return;
    
    var postID = wpcraftData.postID;
    
    // Check if there's pending inject data for this post
    function checkForInject() {
      jQuery.ajax({
        url: wpcraftData.restUrl + 'check-inject',
        method: 'GET',
        data: { post_id: postID },
        headers: { 'X-WP-Nonce': wpcraftData.nonce },
        success: function(response) {
          if (response.elements && 
              response.elements.length > 0) {
            injectIntoElementor(response.elements);
          }
        }
      });
    }
    
    function injectIntoElementor(elements) {
      // Write directly to Elementor's localStorage
      // This is exactly how Soflite does it
      var clipboardData = {
        "__expiration": {},
        "clipboard": {
          "type": "elementor",
          "elements": elements
        }
      };
      
      localStorage.setItem(
        'elementor', 
        JSON.stringify(clipboardData)
      );
      
      // Notify user
      alert(
        'WPCraft: Your page is ready!\n' +
        'Right-click anywhere in Elementor\n' +
        'and select Paste to insert your page.'
      );
    }
    
    // Check on editor load
    setTimeout(checkForInject, 2000);
  }
);
