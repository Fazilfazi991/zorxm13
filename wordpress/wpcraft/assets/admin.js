jQuery(document).ready(function($) {
  
  $('#wpcraft-submit').on('click', function() {
    var jsonData = $('#wpcraft-json').val().trim()
    var pageTitle = $('#wpcraft-title').val().trim()
    
    if (!jsonData) {
      showResult('error', 
        'Please paste your JSON first.')
      return
    }

    // Validate JSON
    try {
      JSON.parse(jsonData)
    } catch(e) {
      showResult('error', 
        'Invalid JSON format. Please check ' +
        'your JSON and try again.<br>' +
        'Error: ' + e.message)
      return
    }

    var $btn = $(this)
    $btn.text('Creating page...').prop(
      'disabled', true
    )

    $.ajax({
      url: wpcraftData.ajaxurl,
      method: 'POST',
      data: {
        action: 'wpcraft_create_page',
        nonce: wpcraftData.nonce,
        json_data: jsonData,
        page_title: pageTitle || 'WPCraft Page'
      },
      success: function(response) {
        if (response.success) {
          var data = response.data
          showResult('success', 
            '<strong>' + data.message + 
            '</strong><br><br>' +
            '<a href="' + data.edit_url + 
            '" class="wpcraft-btn wpcraft-btn-sm"' +
            ' target="_blank">' +
            'Edit in Elementor →</a> ' +
            '<a href="' + data.view_url + 
            '" class="wpcraft-btn ' +
            'wpcraft-btn-sm wpcraft-btn-outline"' +
            ' target="_blank">Preview page</a>'
          )
          // Clear the textarea
          $('#wpcraft-json').val('')
          $('#wpcraft-title').val('')
        } else {
          showResult('error', 
            'Error: ' + response.data)
        }
      },
      error: function() {
        showResult('error', 
          'Connection error. Please try again.')
      },
      complete: function() {
        $btn.text('Create Elementor Page →')
          .prop('disabled', false)
      }
    })
  })

  function showResult(type, message) {
    var $result = $('#wpcraft-result')
    $result
      .removeClass('wpcraft-success wpcraft-error')
      .addClass('wpcraft-' + type)
      .html(message)
      .show()
    $('html, body').animate({
      scrollTop: $result.offset().top - 100
    }, 300)
  }

})
