<?php
require_once('wp-load.php');

echo "--- Elementor Templates ---\n";
$args = array(
    'post_type' => 'elementor_library',
    'post_status' => 'publish',
    'posts_per_page' => -1,
);
$templates = get_posts($args);
if ($templates) {
    foreach ($templates as $t) {
        echo "ID: " . $t->ID . " | Title: " . $t->post_title . " | Slug: [" . $t->post_name . "] | Type: " . get_post_meta($t->ID, '_elementor_template_type', true) . "\n";
    }
} else {
    echo "No Elementor templates found.\n";
}

echo "\n--- Nav Menus ---\n";
$menus = wp_get_nav_menus();
if ($menus) {
    foreach ($menus as $m) {
        echo "ID: " . $m->term_id . " | Name: " . $m->name . " | Slug: " . $m->slug . "\n";
    }
} else {
    echo "No menus found.\n";
}

echo "\n--- Header Logic Check ---\n";
$header_slug = 'zorx-header';
$found = get_page_by_path($header_slug, OBJECT, 'elementor_library');
if ($found) {
    echo "SUCCESS: Found header template with slug 'zorx-header' (ID: $found->ID).\n";
} else {
    echo "FAIL: Could not find header template with exact slug 'zorx-header'.\n";
    // Try to find it by title
    $by_title = get_page_by_title('Zorx Global Header', OBJECT, 'elementor_library');
    if ($by_title) {
        echo "INFO: Found template by Title 'Zorx Global Header' but slug is [" . $by_title->post_name . "].\n";
    }
}
