"use client";

import Image from 'next/image';
import { ReactNode } from 'react';

interface Block {
  blockName?: string | null;
  name?: string;
  __typename?: string;
  innerBlocks?: Block[];
  innerContent?: string[];
  attrs?: Record<string, any>;
  attributes?: Record<string, any>;
  innerHTML?: string;
  renderedHtml?: string;
  saveContent?: string;
  originalContent?: string;
  clientId?: string;
  parentClientId?: string | null;
}

interface BlockRendererProps {
  blocks?: Block[] | string | null | undefined;
  editorBlocks?: Block[] | null | undefined;
  fallbackContent?: string;
}

/**
 * Converts flat editorBlocks array to hierarchical structure
 * Based on clientId and parentClientId relationships
 * If blocks are already hierarchical (have innerBlocks), returns as-is
 */
const flatListToHierarchical = (blocks: Block[]): Block[] => {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return [];
  }

  // Check if blocks already have hierarchical structure (innerBlocks populated)
  const hasHierarchy = blocks.some(block => 
    block.innerBlocks && Array.isArray(block.innerBlocks) && block.innerBlocks.length > 0
  );
  
  if (hasHierarchy) {
    // Already hierarchical, return as-is
    return blocks;
  }

  // Check if we have clientId/parentClientId structure (flat list from WPGraphQL Content Blocks)
  const hasClientIds = blocks.some(block => block.clientId);
  
  if (!hasClientIds) {
    // No clientId structure, return as-is (might be from blocks/blocksJSON)
    return blocks;
  }

  // Create a map of blocks by clientId
  const blockMap = new Map<string, Block>();
  blocks.forEach(block => {
    if (block.clientId) {
      blockMap.set(block.clientId, { ...block, innerBlocks: [] });
    }
  });

  // Build hierarchical structure
  const rootBlocks: Block[] = [];
  blocks.forEach(block => {
    if (!block.clientId) {
      // Block without clientId goes to root
      rootBlocks.push(block);
      return;
    }

    const currentBlock = blockMap.get(block.clientId);
    if (!currentBlock) return;

    if (block.parentClientId) {
      const parent = blockMap.get(block.parentClientId);
      if (parent && parent.innerBlocks) {
        parent.innerBlocks.push(currentBlock);
      } else {
        // Parent not found, add to root
        rootBlocks.push(currentBlock);
      }
    } else {
      // No parent, add to root
      rootBlocks.push(currentBlock);
    }
  });

  return rootBlocks.length > 0 ? rootBlocks : blocks;
};

/**
 * Renders WordPress Gutenberg blocks
 * Supports both editorBlocks (WPGraphQL Content Blocks) and blocks/blocksJSON formats
 */
const BlockRenderer = ({ blocks, editorBlocks, fallbackContent }: BlockRendererProps) => {
  let parsedBlocks: Block[] = [];
  
  // Debug logging (remove in production)
  if (typeof window !== 'undefined') {
    console.log('[BlockRenderer] editorBlocks:', editorBlocks);
    console.log('[BlockRenderer] blocks:', blocks);
    console.log('[BlockRenderer] fallbackContent length:', fallbackContent?.length);
  }
  
  // Priority: editorBlocks > blocks > fallbackContent
  if (editorBlocks && Array.isArray(editorBlocks) && editorBlocks.length > 0) {
    // Use editorBlocks from WPGraphQL Content Blocks plugin
    // Convert flat structure to hierarchical if needed
    parsedBlocks = flatListToHierarchical(editorBlocks);
    if (typeof window !== 'undefined') {
      console.log('[BlockRenderer] Parsed blocks:', parsedBlocks);
    }
    // If parsing resulted in empty array, fall back to HTML
    if (parsedBlocks.length === 0 && fallbackContent) {
      if (typeof window !== 'undefined') {
        console.log('[BlockRenderer] Parsed blocks empty, falling back to HTML');
      }
      return (
        <div
          className="prose prose-lg max-w-none product-detail-content"
          dangerouslySetInnerHTML={{ __html: fallbackContent }}
        />
      );
    }
  } else if (blocks) {
    // Fallback to blocks/blocksJSON format
    if (typeof blocks === 'string') {
      try {
        parsedBlocks = JSON.parse(blocks);
      } catch (e) {
        // If parsing fails, treat as HTML content
        if (fallbackContent) {
          return (
            <div
              className="prose prose-lg max-w-none product-detail-content"
              dangerouslySetInnerHTML={{ __html: fallbackContent }}
            />
          );
        }
        return null;
      }
    } else if (Array.isArray(blocks)) {
      parsedBlocks = blocks;
    }
  }

  if (!Array.isArray(parsedBlocks) || parsedBlocks.length === 0) {
    // Fallback to HTML content
    if (fallbackContent) {
      if (typeof window !== 'undefined') {
        console.log('[BlockRenderer] No blocks found, using fallback HTML content');
      }
      return (
        <div
          className="prose prose-lg max-w-none product-detail-content"
          dangerouslySetInnerHTML={{ __html: fallbackContent }}
        />
      );
    }
    if (typeof window !== 'undefined') {
      console.warn('[BlockRenderer] No blocks and no fallback content available');
    }
    return null;
  }

  if (typeof window !== 'undefined') {
    console.log('[BlockRenderer] Rendering', parsedBlocks.length, 'blocks');
  }

  return (
    <div className="wp-blocks">
      {parsedBlocks.map((block, index) => {
        const key = block.clientId || block.name || index;
        return <BlockComponent key={key} block={block} />;
      })}
    </div>
  );
};

/**
 * Renders a single block
 */
const BlockComponent = ({ block }: { block: Block }) => {
  if (!block) {
    if (typeof window !== 'undefined') {
      console.warn('[BlockComponent] Block is null or undefined');
    }
    return null;
  }

  // Handle different block name formats
  // WPGraphQL Content Blocks uses 'name' field (e.g., "core/paragraph")
  // Other formats may use 'blockName'
  const blockName = block.name || block.blockName;
  
  if (!blockName) {
    // Handle classic editor content (no blockName)
    // WPGraphQL Content Blocks provides renderedHtml
    const htmlContent = block.renderedHtml || block.innerHTML || block.saveContent || block.originalContent;
    if (htmlContent) {
      if (typeof window !== 'undefined') {
        console.log('[BlockComponent] Rendering block without name using HTML content');
      }
      return (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    }
    if (typeof window !== 'undefined') {
      console.warn('[BlockComponent] Block has no name and no HTML content:', block);
    }
    return null;
  }
  
  if (typeof window !== 'undefined') {
    console.log('[BlockComponent] Rendering block:', blockName, block);
  }

  // Merge attrs and attributes (different plugins use different field names)
  const attrs = { ...(block.attrs || {}), ...(block.attributes || {}) };
  const innerBlocks = block.innerBlocks || [];
  
  // WPGraphQL Content Blocks provides renderedHtml which is preferred
  // Fall back to other HTML sources if not available
  const innerHTML = block.renderedHtml || block.innerHTML || block.saveContent || block.originalContent || '';
  
  // Handle both 'core/paragraph' and 'paragraph' formats
  // Extract block type from name (e.g., "core/paragraph" -> "paragraph")
  const blockType = blockName.replace(/^(core\/|wp\/)/, '').toLowerCase();
  
  // If renderedHtml is available and contains full HTML, prefer using it directly for most blocks
  // This ensures server/client consistency
  const hasRenderedHtml = !!block.renderedHtml;
  
  // For most blocks, if renderedHtml exists, use it directly to avoid hydration issues
  // Only construct custom components for blocks that need special handling (like images, galleries)
  if (hasRenderedHtml && !['image', 'gallery', 'columns', 'column'].includes(blockType)) {
    return (
      <div
        className="my-4"
        dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
      />
    );
  }

  switch (blockType) {
    case 'paragraph':
      // If renderedHtml is available, use it directly (it's already a complete <p> tag)
      if (hasRenderedHtml && block.renderedHtml) {
        return (
          <div
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
      }
      // Otherwise construct from attributes
      const paragraphContent = innerHTML || attrs.content || '';
      return (
        <p
          className="mb-4 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: paragraphContent }}
        />
      );

    case 'heading':
      // If renderedHtml is available, use it directly (it's already a complete heading tag)
      if (hasRenderedHtml && block.renderedHtml) {
        return (
          <div
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
      }
      // Otherwise construct from attributes
      const level = attrs.level || 2;
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      const headingContent = innerHTML || attrs.content || '';
      return (
        <HeadingTag
          className={`mb-4 font-bold text-gray-900 ${
            level === 1 ? 'text-4xl' :
            level === 2 ? 'text-3xl' :
            level === 3 ? 'text-2xl' :
            level === 4 ? 'text-xl' :
            'text-lg'
          }`}
          dangerouslySetInnerHTML={{ __html: headingContent }}
        />
      );

    case 'image':
      const imageUrl = attrs.url || attrs.src;
      const imageAlt = attrs.alt || '';
      const imageWidth = attrs.width || 800;
      const imageHeight = attrs.height || 600;
      
      if (!imageUrl) return null;
      
      return (
        <figure className="my-8">
          <div className="relative w-full" style={{ aspectRatio: `${imageWidth}/${imageHeight}` }}>
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
              unoptimized={imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1') || imageUrl.includes('moleculestore.local')}
            />
          </div>
          {attrs.caption && (
            <figcaption className="mt-2 text-sm text-gray-600 text-center">
              {attrs.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'gallery':
      const galleryImages = attrs.images || [];
      return (
        <div className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((img: any, idx: number) => (
            <div key={idx} className="relative aspect-square">
              <Image
                src={img.url || img.src}
                alt={img.alt || ''}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized={img.url?.includes('localhost') || img.url?.includes('127.0.0.1') || img.url?.includes('moleculestore.local')}
              />
            </div>
          ))}
        </div>
      );

    case 'list':
      // If renderedHtml is available, use it directly
      if (hasRenderedHtml && block.renderedHtml) {
        return (
          <div
            className="my-4 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
      }
      return (
        <div
          className="my-4 prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: innerHTML }}
        />
      );

    case 'quote':
      // If renderedHtml is available, use it directly (it's already a complete <blockquote> tag)
      if (hasRenderedHtml && block.renderedHtml) {
        return (
          <div
            className="my-8"
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
      }
      // Otherwise construct from attributes
      const quoteContent = innerHTML || attrs.value || '';
      return (
        <blockquote className="my-8 pl-6 border-l-4 border-gray-300 italic text-gray-700">
          <div dangerouslySetInnerHTML={{ __html: quoteContent }} />
          {attrs.citation && (
            <cite className="block mt-2 text-sm text-gray-600 not-italic">
              — {attrs.citation}
            </cite>
          )}
        </blockquote>
      );

    case 'code':
      // If renderedHtml is available, use it directly (it's already a complete <pre><code> tag)
      if (hasRenderedHtml && block.renderedHtml) {
        return (
          <div
            className="my-8"
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
      }
      // Otherwise construct from attributes
      const codeContent = innerHTML || attrs.content || '';
      return (
        <pre className="my-8 p-4 bg-gray-100 rounded-lg overflow-x-auto">
          <code className="text-sm" dangerouslySetInnerHTML={{ __html: codeContent }} />
        </pre>
      );

    case 'separator':
      return <hr className="my-8 border-gray-300" />;

    case 'spacer':
      const height = attrs.height || 20;
      return <div style={{ height: `${height}px` }} />;

    case 'columns':
      // Number of columns is determined by the number of innerBlocks (CoreColumn blocks)
      const columnCount = innerBlocks.length || 2;
      const gridColsClass = 
        columnCount === 1 ? 'grid-cols-1' :
        columnCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
        columnCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
        columnCount === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
        'grid-cols-1 md:grid-cols-2';
      return (
        <div className={`my-8 grid gap-4 ${gridColsClass}`}>
          {innerBlocks.map((innerBlock, idx) => (
            <BlockComponent key={innerBlock.clientId || idx} block={innerBlock} />
          ))}
        </div>
      );

    case 'column':
      return (
        <div>
          {innerBlocks.map((innerBlock, idx) => (
            <BlockComponent key={idx} block={innerBlock} />
          ))}
        </div>
      );

    case 'group':
    case 'cover':
    case 'media-text':
      // If renderedHtml is available, use it directly (it contains the full HTML structure)
      if (hasRenderedHtml && block.renderedHtml) {
        return (
          <div
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
      }
      // Otherwise try to render innerBlocks
      if (innerBlocks && innerBlocks.length > 0) {
        return (
          <div className="my-8">
            {innerBlocks.map((innerBlock, idx) => (
              <BlockComponent key={innerBlock.clientId || idx} block={innerBlock} />
            ))}
          </div>
        );
      }
      // Fallback to renderedHtml if available
      if (block.renderedHtml) {
        return (
          <div
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
      }
      return null;

    case 'button':
      const buttonText = attrs.text || 'Click here';
      const buttonUrl = attrs.url || '#';
      return (
        <div className="my-6">
          <a
            href={buttonUrl}
            className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            {buttonText}
          </a>
        </div>
      );

    case 'html':
      return (
        <div
          className="my-4"
          dangerouslySetInnerHTML={{ __html: innerHTML }}
        />
      );

    default:
      // For unknown blocks, prefer renderedHtml from WPGraphQL Content Blocks
      // This ensures server/client consistency
      if (hasRenderedHtml && block.renderedHtml) {
        return (
          <div
            className="my-4 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: block.renderedHtml }}
          />
        );
      }
      // Then try innerHTML
      if (innerHTML) {
        return (
          <div
            className="my-4 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: innerHTML }}
          />
        );
      }
      // Finally try innerBlocks
      if (innerBlocks && innerBlocks.length > 0) {
        return (
          <div className="my-4">
            {innerBlocks.map((innerBlock, idx) => (
              <BlockComponent key={innerBlock.clientId || idx} block={innerBlock} />
            ))}
          </div>
        );
      }
      return null;
  }
};

export default BlockRenderer;

