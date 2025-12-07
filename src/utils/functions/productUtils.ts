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
