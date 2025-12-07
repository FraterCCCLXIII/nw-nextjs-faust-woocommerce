# Installing WPGraphQL Content Blocks Plugin

This guide explains how to install the [WPGraphQL Content Blocks](https://github.com/wpengine/wp-graphql-content-blocks) plugin on your WordPress backend.

## Prerequisites

1. **WPGraphQL Plugin** must be installed and activated first
   - Download from: https://wordpress.org/plugins/wp-graphql/
   - Or install via WordPress admin: Plugins → Add New → Search "WPGraphQL"

## Installation Methods

### Method 1: WordPress Admin (Recommended)

1. **Download the Plugin**
   - Go to: https://github.com/wpengine/wp-graphql-content-blocks/releases
   - Download the latest `.zip` file (e.g., `wp-graphql-content-blocks-4.8.4.zip`)

2. **Install via WordPress Admin**
   - Go to WordPress Admin → Plugins → Add New
   - Click "Upload Plugin"
   - Choose the downloaded `.zip` file
   - Click "Install Now"
   - Click "Activate Plugin"

### Method 2: Manual Installation

1. **Download the Plugin**
   ```bash
   # Download the latest release
   wget https://github.com/wpengine/wp-graphql-content-blocks/archive/refs/heads/main.zip
   unzip main.zip
   ```

2. **Upload to WordPress**
   - Upload the `wp-graphql-content-blocks-main` folder to `/wp-content/plugins/`
   - Rename it to `wp-graphql-content-blocks`
   - Or use SFTP/FTP to upload the folder

3. **Activate**
   - Go to WordPress Admin → Plugins
   - Find "WPGraphQL Content Blocks"
   - Click "Activate"

### Method 3: WP-CLI (Command Line)

```bash
# Navigate to WordPress root
cd /path/to/wordpress

# Download and install
wp plugin install https://github.com/wpengine/wp-graphql-content-blocks/archive/refs/heads/main.zip --activate
```

## Verification

After installation, verify the plugin is working:

1. **Check GraphQL Schema**
   - Go to your GraphQL endpoint (usually `/graphql`)
   - Or use GraphiQL IDE if available
   - Query for `editorBlocks` field:

```graphql
{
  posts {
    nodes {
      title
      editorBlocks(flat: false) {
        __typename
        name
        renderedHtml
      }
    }
  }
}
```

2. **Check WordPress Admin**
   - Go to Plugins page
   - Verify "WPGraphQL Content Blocks" is listed and activated

## What This Plugin Provides

- **`editorBlocks` field** on Post and Page types
- **Block data** with `__typename`, `name`, `attributes`, `renderedHtml`
- **Hierarchical structure** with `editorBlocks(flat: false)`
- **Flattened structure** with `editorBlocks(flat: true)`
- **Support for all Gutenberg blocks** including custom blocks

## Next Steps

Once installed, the Next.js frontend will automatically:
1. Query `editorBlocks` from WordPress
2. Render blocks using the `BlockRenderer` component
3. Fall back to HTML content if blocks aren't available

No additional configuration needed in WordPress - the plugin works automatically once activated!

