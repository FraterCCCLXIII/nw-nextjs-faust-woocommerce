import { Product, ProductCategory, ProductType } from '@/types/product';

export const getUniqueProductTypes = (products: Product[]): ProductType[] => {
  // Use Map to ensure unique categories by slug
  const categoryMap = new Map<string, ProductType>();

  products?.forEach((product) => {
    product.productCategories?.nodes.forEach((cat: ProductCategory) => {
      if (!categoryMap.has(cat.slug)) {
        categoryMap.set(cat.slug, {
          id: cat.slug,
          name: cat.name,
          checked: false,
        });
      }
    });
  });

  // Convert Map values to array and sort by name
  return Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};

/**
 * Cleans HTML from text by decoding HTML entities and stripping HTML tags
 * Works on both server and client side
 * @param html - The HTML string to clean
 * @returns Clean plain text
 */
export const cleanHtmlFromText = (html: string | null | undefined): string => {
  if (!html) return '';

  // If we're in the browser, use DOM API for better accuracy
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      return text.trim();
    } catch {
      // Fall through to regex-based approach if DOM fails
    }
  }

  // Server-side or fallback: use regex-based approach
  // First decode common HTML entities
  let decoded = html
    .replace(/&amp;/g, '&') // Must be first to avoid double-decoding
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Handle numeric entities (&#123; and &#x1F; format)
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
    const code = parseInt(dec, 10);
    return code <= 0x10ffff ? String.fromCharCode(code) : '';
  });
  decoded = decoded.replace(/&#x([a-f\d]+);/gi, (_, hex) => {
    const code = parseInt(hex, 16);
    return code <= 0x10ffff ? String.fromCharCode(code) : '';
  });

  // Strip HTML tags using regex
  const stripped = decoded.replace(/<[^>]*>/g, '');

  // Final cleanup: decode any remaining entities and normalize whitespace
  return stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();
};

/**
 * Converts plain text to HTML by detecting headings and paragraphs
 * If the input already contains HTML tags, returns it as-is
 * @param text - The text to convert (plain text or HTML)
 * @returns HTML string with proper paragraph and heading tags
 */
export const convertTextToHtml = (text: string | null | undefined): string => {
  if (!text) return '';

  // If text already contains HTML tags, return as-is
  if (/<[^>]+>/.test(text)) {
    return text;
  }

  // Normalize line breaks
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split by double line breaks to get major sections
  const majorSections = normalized.split(/\n\s*\n/).filter(section => section.trim());

  const htmlSections = majorSections.map(section => {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) return '';

    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      const nextLine = lines[i + 1];
      
      // Detect if current line is a heading:
      // - Short line (< 100 chars)
      // - Doesn't end with sentence punctuation
      // - Next line exists and is longer (indicating paragraph content)
      const isShort = currentLine.length < 100;
      const noEndPunctuation = !currentLine.match(/[.!?]$/);
      const hasNextLine = !!nextLine;
      const nextLineIsLonger = nextLine && nextLine.length > currentLine.length + 20;
      
      const isHeading = isShort && noEndPunctuation && hasNextLine && nextLineIsLonger;
      
      if (isHeading) {
        // Current line is a heading, collect following paragraph content
        const headingLevel = currentLine.length < 60 ? 'h3' : 'h2';
        processedLines.push(`<${headingLevel}>${escapeHtml(currentLine)}</${headingLevel}>`);
        
        // Collect all following lines until we hit another potential heading
        const paragraphLines: string[] = [];
        i++; // Move to next line
        
        while (i < lines.length) {
          const line = lines[i];
          const next = lines[i + 1];
          
          // Check if this line is a new heading
          const couldBeHeading = line.length < 100 && 
                                 !line.match(/[.!?]$/) && 
                                 next && 
                                 next.length > line.length + 20;
          
          if (couldBeHeading) {
            i--; // Back up to process this line as heading
            break;
          }
          
          paragraphLines.push(line);
          i++;
        }
        
        if (paragraphLines.length > 0) {
          processedLines.push(`<p>${escapeHtml(paragraphLines.join(' '))}</p>`);
        }
      } else {
        // Regular paragraph line
        processedLines.push(`<p>${escapeHtml(currentLine)}</p>`);
      }
    }

    return processedLines.join('');
  });

  return htmlSections.join('');
};

/**
 * Escapes HTML special characters
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};
