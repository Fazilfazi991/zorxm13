# ZORX Elementor Theme - Usage Guide

This guide explains how to install and use the custom ZORX Elementor theme and its templates.

## 1. Installation

1.  **WordPress**: Ensure WordPress is installed.
2.  **Theme**: Activate the **ZORX Growth Engine** theme (folder: `zorx-elementor-theme`).
3.  **Plugins**: Ensure **Elementor** (free) is installed and activated.

## 2. Importing Templates

We have provided pre-built Elementor templates for the Homepage and About Us page.

### Location of Template Files
These files are located in your theme folder:
*   `wordpress/wp-content/themes/zorx-elementor-theme/templates/homepage-template.json`
*   `wordpress/wp-content/themes/zorx-elementor-theme/templates/about-template.json`
*   `wordpress/wp-content/themes/zorx-elementor-theme/templates/services-template.json`
*   `wordpress/wp-content/themes/zorx-elementor-theme/templates/contact-template.json`

### Steps to Import
1.  Go to your WordPress Dashboard.
2.  Navigate to **Templates > Saved Templates**.
3.  Click the **Import Templates** button at the top.
4.  Click **Choose File** and select the JSON files mentioned above.
5.  Click **Import Now**.

## 3. Creating Pages from Templates

### Critical: Ensuring Header & Footer Appear
To make sure your standard Header and Footer (Theme Header/Footer) show up:
1.  Edit your page (e.g., About Us).
2.  Look at the **Page Attributes** section (in the right sidebar of the WordPress page editor, NOT inside Elementor).
3.  Ensure **Template** is set to **Default Template**.
4.  *Do not* select "Elementor Canvas" (this removes the header/footer).

### Steps to Create About, Services, or Contact Pages
1.  Create a new page.
2.  Edit with Elementor.
3.  Click the **Folder Icon**.
4.  Select **My Templates**.
5.  Insert **Zorx About Page Full**, **Zorx Services Page**, or **Zorx Contact Page**.
6.  Click **Yes** to import settings.

## 4. Setting Up the Menu (Navbar)
For the header links (Home, About, Services, Contact) to appear:
1.  Go to **Appearance > Menus**.
2.  Create a new menu (e.g., "Main Menu").
3.  Add your pages to the menu.
4.  Check the box **Display location: Primary Menu**.
5.  Save Menu.

### Alternative Method: Using Shortcodes
If you cannot find the Folder icon or prefer a simpler way:
1.  Go to your WordPress Dashboard > **Templates > Saved Templates**.
2.  Look at the list of templates. There is a column called **Shortcode**.
3.  Copy the shortcode for your template (e.g., `[elementor-template id="123"]`).
4.  Go to edit your page in Elementor.
5.  Search for the **Shortcode** widget in the left sidebar.
6.  Drag it onto your page.
7.  Paste the code you copied into the box.
8.  The template will bloom into full view!

## 4. Customizing Content

All distinct sections are built as custom **ZORX Widgets**. To edit content:
1.  Click on any section (e.g., the Hero or Services grid).
2.  The left sidebar will show specific fields for that widget (e.g., "Heading", "Description", "Badge Text").
3.  Use these fields to update text, links, and icons.
4.  The design (colors, fonts, spacing) is automatically handled by the theme to match the ZORX branding.

## 5. Setting the Homepage

To make your new Home page the actual front page of your site:
1.  Go to **Settings > Reading**.
2.  Under "Your homepage displays", select **A static page**.
3.  For "Homepage", select the "Home" page you just created.
4.  Click **Save Changes**.
