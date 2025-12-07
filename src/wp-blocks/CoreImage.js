import { CoreBlocks } from '@faustwp/blocks';

// Get the original CoreImage component from CoreBlocks
// Use destructuring to ensure proper import
const { CoreImage: FaustCoreImage } = CoreBlocks;

if (!FaustCoreImage) {
  throw new Error('CoreImage not found in CoreBlocks. Available blocks: ' + Object.keys(CoreBlocks || {}).join(', '));
}

/**
 * Custom CoreImage component that fixes relative image URLs
 * to use the WordPress URL from environment variables
 */
export function CoreImage(props) {
  const { attributes, renderedHtml } = props;
  
  // Get WordPress URL from environment
  const wordpressUrl = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:8080'
    : process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:8080';
  
  // Create a new props object with fixed attributes
  const fixedProps = {
    ...props,
    attributes: attributes ? { ...attributes } : undefined,
  };
  
  // Fix relative URLs in attributes
  if (fixedProps.attributes) {
    // Fix src attribute
    if (fixedProps.attributes.src) {
      const src = fixedProps.attributes.src;
      // If src is relative (starts with /), prepend WordPress URL
      if (src.startsWith('/') && !src.startsWith('//')) {
        fixedProps.attributes.src = `${wordpressUrl}${src}`;
      }
      // If src is relative without leading slash, add it
      else if (!src.startsWith('http') && !src.startsWith('//')) {
        fixedProps.attributes.src = `${wordpressUrl}/${src}`;
      }
      // Fix malformed URLs like http://localhost:3000:8080
      else if (src.includes(':3000:8080')) {
        fixedProps.attributes.src = src.replace(':3000:8080', ':8080');
      }
    }
    
    // Fix url attribute if present
    if (fixedProps.attributes.url) {
      const url = fixedProps.attributes.url;
      if (url.startsWith('/') && !url.startsWith('//')) {
        fixedProps.attributes.url = `${wordpressUrl}${url}`;
      } else if (!url.startsWith('http') && !url.startsWith('//')) {
        fixedProps.attributes.url = `${wordpressUrl}/${url}`;
      } else if (url.includes(':3000:8080')) {
        fixedProps.attributes.url = url.replace(':3000:8080', ':8080');
      }
    }
  }
  
  // If renderedHtml exists, fix URLs in it
  if (renderedHtml) {
    let fixedHtml = renderedHtml;
    // Fix malformed URLs
    fixedHtml = fixedHtml.replace(/http:\/\/localhost:3000:8080/g, wordpressUrl);
    // Fix relative URLs in src attributes
    fixedHtml = fixedHtml.replace(/src="\/([^"]+)"/g, `src="${wordpressUrl}/$1"`);
    // Fix relative URLs in href attributes
    fixedHtml = fixedHtml.replace(/href="\/([^"]+)"/g, `href="${wordpressUrl}/$1"`);
    
    fixedProps.renderedHtml = fixedHtml;
  }
  
  // Use the Faust CoreImage component with fixed props
  return FaustCoreImage(fixedProps);
}

CoreImage.fragments = FaustCoreImage.fragments;
CoreImage.config = FaustCoreImage.config;
CoreImage.displayName = 'CoreImage';

