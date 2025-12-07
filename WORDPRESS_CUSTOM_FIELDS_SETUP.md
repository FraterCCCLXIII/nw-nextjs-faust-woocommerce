# WordPress Custom Fields Setup Guide

This guide explains how to connect the product detail tabs (Description, COA, Research) to custom fields in WordPress/WooCommerce.

## Overview

The product detail tabs component looks for three custom fields:
- `description` - Extended product description (falls back to standard WooCommerce description)
- `coa` - Certificate of Analysis content
- `research` - Research information content

## Method 1: Using WooCommerce Product Meta (Recommended)

### Step 1: Install a Custom Fields Plugin

You can use one of these plugins:
- **Advanced Custom Fields (ACF)** - Most popular, user-friendly
- **Custom Fields Suite** - Lightweight alternative
- **Pods** - More advanced, supports custom post types

### Step 2: Create Custom Fields

#### Using Advanced Custom Fields (ACF):

1. Install and activate the **Advanced Custom Fields** plugin
2. Go to **Custom Fields** → **Add New**
3. Create a Field Group named "Product Detail Tabs"
4. Add three fields:

   **Field 1: Extended Description**
   - Field Label: `Extended Description`
   - Field Name: `description`
   - Field Type: `WYSIWYG Editor` or `Textarea`
   - Location Rules: Show this field group if `Post Type` is equal to `Product`

   **Field 2: COA**
   - Field Label: `COA (Certificate of Analysis)`
   - Field Name: `coa`
   - Field Type: `WYSIWYG Editor` or `Textarea`
   - Location Rules: Show this field group if `Post Type` is equal to `Product`

   **Field 3: Research**
   - Field Label: `Research Information`
   - Field Name: `research`
   - Field Type: `WYSIWYG Editor` or `Textarea`
   - Location Rules: Show this field group if `Post Type` is equal to `Product`

5. Save the Field Group

### Step 3: Configure ACF to Expose Fields to GraphQL

1. Install **WPGraphQL for Advanced Custom Fields** plugin
2. The fields will automatically be available in GraphQL as `metaData` entries

### Step 4: Add Content to Products

1. Edit any product in WooCommerce
2. Scroll down to find the "Product Detail Tabs" section
3. Fill in the three fields:
   - **Extended Description**: Additional product details (HTML supported)
   - **COA**: Certificate of Analysis content (HTML supported)
   - **Research**: Research information (HTML supported)
4. Save/Update the product

## Method 2: Using WooCommerce Product Meta Directly (Without ACF)

If you prefer not to use ACF, you can add custom meta directly using code or a meta box plugin.

### Using Code (functions.php):

Add this to your theme's `functions.php` or a custom plugin:

```php
// Add custom meta boxes to products
function add_product_detail_tabs_meta_box() {
    add_meta_box(
        'product_detail_tabs',
        'Product Detail Tabs',
        'product_detail_tabs_meta_box_callback',
        'product',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'add_product_detail_tabs_meta_box');

function product_detail_tabs_meta_box_callback($post) {
    wp_nonce_field('product_detail_tabs_meta_box', 'product_detail_tabs_meta_box_nonce');
    
    $description = get_post_meta($post->ID, 'description', true);
    $coa = get_post_meta($post->ID, 'coa', true);
    $research = get_post_meta($post->ID, 'research', true);
    ?>
    <table class="form-table">
        <tr>
            <th><label for="description">Extended Description</label></th>
            <td>
                <?php
                wp_editor($description, 'description', array(
                    'textarea_name' => 'description',
                    'textarea_rows' => 10,
                ));
                ?>
            </td>
        </tr>
        <tr>
            <th><label for="coa">COA (Certificate of Analysis)</label></th>
            <td>
                <?php
                wp_editor($coa, 'coa', array(
                    'textarea_name' => 'coa',
                    'textarea_rows' => 10,
                ));
                ?>
            </td>
        </tr>
        <tr>
            <th><label for="research">Research Information</label></th>
            <td>
                <?php
                wp_editor($research, 'research', array(
                    'textarea_name' => 'research',
                    'textarea_rows' => 10,
                ));
                ?>
            </td>
        </tr>
    </table>
    <?php
}

function save_product_detail_tabs_meta_box($post_id) {
    if (!isset($_POST['product_detail_tabs_meta_box_nonce'])) {
        return;
    }
    
    if (!wp_verify_nonce($_POST['product_detail_tabs_meta_box_nonce'], 'product_detail_tabs_meta_box')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    if (isset($_POST['description'])) {
        update_post_meta($post_id, 'description', wp_kses_post($_POST['description']));
    }
    
    if (isset($_POST['coa'])) {
        update_post_meta($post_id, 'coa', wp_kses_post($_POST['coa']));
    }
    
    if (isset($_POST['research'])) {
        update_post_meta($post_id, 'research', wp_kses_post($_POST['research']));
    }
}
add_action('save_post', 'save_product_detail_tabs_meta_box');
```

## Method 3: Using WooCommerce Product Data Tabs

You can also add these fields to the WooCommerce product data tabs:

1. Install **WooCommerce Custom Fields** plugin, or
2. Use the code method above which adds a custom meta box

## Verification

After setting up the fields:

1. **Test in WordPress Admin:**
   - Edit a product
   - Add content to the three fields
   - Save the product

2. **Test in GraphQL:**
   - Go to your GraphQL endpoint (usually `/graphql`)
   - Run this query:
   ```graphql
   query {
     product(id: "your-product-slug", idType: SLUG) {
       name
       metaData(keysIn: ["description", "coa", "research"]) {
         key
         value
       }
     }
   }
   ```
   - You should see the metaData array with your custom fields

3. **Test in Next.js:**
   - Visit a product page on your Next.js site
   - The tabs should display the content you entered

## Field Names

The component looks for these exact field names (case-sensitive):
- `description` - Extended description
- `coa` - Certificate of Analysis
- `research` - Research information

## HTML Support

All three fields support HTML content. You can use:
- Paragraphs (`<p>`)
- Headings (`<h1>`, `<h2>`, etc.)
- Lists (`<ul>`, `<ol>`)
- Links (`<a>`)
- Images (`<img>`)
- Bold/Italic (`<strong>`, `<em>`)

The component automatically cleans HTML entities and formats the content for display.

## Troubleshooting

### Fields not showing in GraphQL:
- Ensure WPGraphQL and WPGraphQL WooCommerce plugins are active
- Check that the meta keys match exactly: `description`, `coa`, `research`
- Verify the product meta is saved correctly in the database

### Content not displaying:
- Check browser console for errors
- Verify the GraphQL query includes `metaData`
- Ensure field names match exactly (case-sensitive)
- Check that content is saved in WordPress admin

### Description tab shows standard description:
- This is expected behavior - the Description tab falls back to the standard WooCommerce product description if no custom `description` meta field is found

