# WordPress Block Editor (Gutenberg) Support

This Next.js application now supports rendering WordPress Gutenberg blocks from the block editor.

## Setup Requirements

To enable block rendering, you need to install and configure the following WordPress plugins:

### 1. WPGraphQL
- **Plugin**: [WPGraphQL](https://wordpress.org/plugins/wp-graphql/)
- **Purpose**: Provides GraphQL API for WordPress

### 2. WPGraphQL Content Blocks (Recommended)
- **Plugin**: [WPGraphQL Content Blocks](https://github.com/wpengine/wp-graphql-content-blocks) by WP Engine
- **Purpose**: Exposes Gutenberg blocks via GraphQL with full block data
- **Installation**: See `WPGraphQL_CONTENT_BLOCKS_INSTALL.md` for detailed instructions
- **Features**:
  - Provides `editorBlocks` field with `renderedHtml` and `attributes`
  - Supports hierarchical block structure
  - Works with all Gutenberg blocks including custom blocks
- **Alternative**: Falls back to `blocks`/`blocksJSON` if plugin not installed

## How It Works

The `BlockRenderer` component automatically:
1. Checks if block data is available in the GraphQL response
2. Parses block JSON if provided as a string
3. Renders each block type with appropriate React components
4. Falls back to HTML content if blocks are not available

## Supported Block Types

The following WordPress core blocks are currently supported:

### Text Blocks
- **Paragraph** (`core/paragraph`) - Standard text paragraphs
- **Heading** (`core/heading`) - H1-H6 headings with proper styling
- **List** (`core/list`) - Ordered and unordered lists
- **Quote** (`core/quote`) - Blockquotes with citation support
- **Code** (`core/code`) - Code blocks with syntax highlighting container

### Media Blocks
- **Image** (`core/image`) - Single images with captions
- **Gallery** (`core/gallery`) - Image galleries in grid layout

### Layout Blocks
- **Columns** (`core/columns`) - Multi-column layouts
- **Column** (`core/column`) - Individual column containers
- **Group** (`core/group`) - Grouping container
- **Cover** (`core/cover`) - Cover block with background
- **Media & Text** (`core/media-text`) - Side-by-side media and text

### Design Blocks
- **Separator** (`core/separator`) - Horizontal dividers
- **Spacer** (`core/spacer`) - Vertical spacing
- **Button** (`core/button`) - Call-to-action buttons

### Other Blocks
- **HTML** (`core/html`) - Custom HTML content
- **Classic Editor Content** - Automatically falls back to HTML rendering

## GraphQL Query Fields

The following fields are automatically queried:

### Primary (WPGraphQL Content Blocks)
```graphql
editorBlocks(flat: false) {
  __typename
  name
  renderedHtml
  clientId
  parentClientId
  # ... block-specific attributes
}
```

### Fallback
```graphql
blocks
blocksJSON
```

These fields are added to:
- `GET_POST_BY_SLUG` - For blog posts/articles
- `GET_PAGE_BY_SLUG` - For WordPress pages

**Priority**: The component uses `editorBlocks` first (if available), then falls back to `blocks`/`blocksJSON`, and finally to HTML `content`.

## Usage

Blocks are automatically rendered on:
- Article pages (`/articles/[slug]`)
- WordPress pages (`/pages/[slug]`)
- Dynamic pages (`/[...slug]`)

The component will automatically:
1. Try to render blocks if available
2. Fall back to HTML content if blocks are not available
3. Handle both JSON string and array formats

## Adding Custom Block Support

To add support for additional blocks, edit `src/components/Blocks/BlockRenderer.component.tsx`:

1. Add a new case in the `switch` statement:
```typescript
case 'your-block-type':
  return (
    <YourCustomComponent attrs={attrs} innerHTML={innerHTML} />
  );
```

2. Handle nested blocks if needed:
```typescript
case 'your-block-type':
  return (
    <div>
      {innerBlocks.map((innerBlock, idx) => (
        <BlockComponent key={idx} block={innerBlock} />
      ))}
    </div>
  );
```

## Styling

Blocks use Tailwind CSS classes for styling. The component includes:
- Prose styling for text content
- Responsive image handling
- Proper spacing and typography
- Theme-consistent colors

Custom styles can be added by modifying the className props in each block case.

## Troubleshooting

### Blocks Not Rendering

1. **Check Plugin Installation**: 
   - Ensure WPGraphQL is installed and activated
   - Ensure WPGraphQL Content Blocks is installed and activated
   - See `WPGraphQL_CONTENT_BLOCKS_INSTALL.md` for installation instructions

2. **Check GraphQL Response**: 
   - Verify that `editorBlocks` field is being returned (check in GraphQL playground)
   - Test query:
   ```graphql
   {
     post(id: "YOUR_POST_ID", idType: DATABASE_ID) {
       editorBlocks(flat: false) {
         __typename
         name
         renderedHtml
       }
     }
   }
   ```

3. **Check Block Format**: 
   - WPGraphQL Content Blocks provides `renderedHtml` which is preferred
   - Component also supports `blocks`/`blocksJSON` as fallback
   - Component handles multiple formats automatically

4. **Fallback**: 
   - If `editorBlocks` aren't available, component tries `blocks`/`blocksJSON`
   - If blocks aren't available, component automatically uses HTML `content`

### Block Types Not Supported

If a block type isn't rendering correctly:
1. Check the browser console for errors
2. The component will attempt to render `innerHTML` or `innerBlocks` as fallback
3. Add a specific case for the block type in `BlockRenderer.component.tsx`

## Testing

To test block rendering:
1. Create a new WordPress post/page using the block editor
2. Add various block types (paragraphs, images, galleries, etc.)
3. View the post/page on the Next.js frontend
4. Verify that blocks render correctly

## Notes

- The component gracefully handles missing block data
- Classic editor content (non-block) will still render as HTML
- Images are optimized using Next.js Image component
- All blocks are responsive and mobile-friendly

