"use client";

import { useState, useMemo, useEffect } from "react";
import ProductPrice from "./ProductPrice.component";
import OptionSelect from "./OptionSelect.component";
import AddToCart from "./AddToCart.component";
import ProductTabs from "./ProductTabs.component";

interface ProductActionsProps {
  product: {
    databaseId: number;
    name: string;
    description?: string;
    price: string;
    regularPrice: string;
    salePrice?: string;
    onSale: boolean;
    stockQuantity?: number | null;
    stockStatus?: string;
    purchasable?: boolean;
    attributes?: {
      nodes?: Array<{
        name: string;
        options?: string[];
      }>;
    };
    variations?: {
      nodes?: Array<{
        databaseId: number;
        name: string;
        price: string;
        regularPrice: string;
        salePrice?: string;
        onSale: boolean;
        stockQuantity: number;
        purchasable: boolean;
        stockStatus: string;
        attributes?: {
          nodes?: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [selectedVariation, setSelectedVariation] = useState<number | undefined>();
  const [isAdding, setIsAdding] = useState(false);

  // Helper function to parse size value for comparison (e.g., "10mg" -> 10)
  const parseSizeValue = (size: string): number => {
    const match = String(size).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
  };

  // Helper function to sort sizes from smallest to largest
  const sortSizes = (sizes: string[]): string[] => {
    return [...sizes].sort((a, b) => {
      const aNum = parseSizeValue(a);
      const bNum = parseSizeValue(b);
      return aNum - bNum;
    });
  };

  // Helper function to find smallest size
  const findSmallestSize = (sizes: string[]): string => {
    if (sizes.length === 0) return '';
    const sorted = sortSizes(sizes);
    return sorted[0];
  };

  // Get unique attribute options from parent product attributes or variations
  const attributeOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    
    // First, try to get attributes from parent product (VariableProduct attributes)
    // This gives us all available options for each attribute
    if (product.attributes?.nodes && product.attributes.nodes.length > 0) {
      product.attributes.nodes.forEach((attr) => {
        if (attr.name && attr.options && attr.options.length > 0) {
          const attrName = String(attr.name).trim();
          // Filter out empty options and trim values
          let validOptions = attr.options
            .map(opt => String(opt).trim())
            .filter(opt => opt.length > 0);
          
          // Sort size attributes from smallest to largest
          if (attrName.toLowerCase().includes('size')) {
            validOptions = sortSizes(validOptions);
          }
          
          if (validOptions.length > 0) {
            options[attrName] = validOptions;
          }
        }
      });
    }
    
    // If we got options from parent product, use those
    if (Object.keys(options).length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Attribute options from parent product:', options);
      }
      return options;
    }
    
    // Fallback: try to extract from variations
    if (!product.variations?.nodes) return {};

    // Debug: log raw variation data
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw variations data:', product.variations.nodes);
      product.variations.nodes.forEach((variation, index) => {
        console.log(`Variation ${index} (full object):`, variation);
        console.log(`Variation ${index} attributes nodes:`, variation.attributes?.nodes);
        if (variation.attributes?.nodes) {
          variation.attributes.nodes.forEach((attr, attrIndex) => {
            console.log(`  Attribute ${attrIndex}:`, attr);
          });
        }
      });
    }
    
    product.variations.nodes.forEach((variation) => {
      // WordPress variations might have attributes in different format
      // Try to extract from variation name or attributes
      if (variation.attributes?.nodes && variation.attributes.nodes.length > 0) {
        variation.attributes.nodes.forEach((attr) => {
          // Only process attributes with valid name and value
          if (attr && attr.name && attr.value && String(attr.value).trim().length > 0) {
            const attrName = String(attr.name).trim();
            const attrValue = String(attr.value).trim();
            
            if (!options[attrName]) {
              options[attrName] = [];
            }
            if (!options[attrName].includes(attrValue)) {
              options[attrName].push(attrValue);
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.warn('Invalid attribute found:', attr);
          }
        });
      } else if (variation.name) {
        // Fallback: try to parse variation name for attributes
        // This is a simple fallback - adjust based on your actual data structure
        const parts = variation.name.split(' - ');
        if (parts.length > 1) {
          const attrName = 'Variant';
          const attrValue = parts[1]?.trim() || parts[0]?.trim();
          if (attrValue) {
            if (!options[attrName]) {
              options[attrName] = [];
            }
            if (!options[attrName].includes(attrValue)) {
              options[attrName].push(attrValue);
            }
          }
        }
      }
    });

    // Sort size attributes after collecting all values
    Object.keys(options).forEach((attrName) => {
      if (attrName.toLowerCase().includes('size')) {
        options[attrName] = sortSizes(options[attrName]);
      }
    });

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Attribute options from variations:', options);
    }

    return options;
  }, [product.variations, product.attributes]);

  // Get selected attribute values
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Auto-select smallest size when attribute options are available
  useEffect(() => {
    if (Object.keys(attributeOptions).length > 0 && Object.keys(selectedAttributes).length === 0) {
      const initialAttributes: Record<string, string> = {};
      
      Object.entries(attributeOptions).forEach(([attrName, values]) => {
        // For size attributes, select the smallest
        if (attrName.toLowerCase().includes('size')) {
          initialAttributes[attrName] = findSmallestSize(values);
        } else {
          // For other attributes, select the first option
          initialAttributes[attrName] = values[0];
        }
      });
      
      setSelectedAttributes(initialAttributes);
    }
  }, [attributeOptions]);

  // Auto-select first variation if only one exists
  useEffect(() => {
    if (product.variations?.nodes && product.variations.nodes.length === 1) {
      setSelectedVariation(product.variations.nodes[0].databaseId);
    }
  }, [product.variations]);

  // Find matching variation based on selected attributes
  useEffect(() => {
    if (!product.variations?.nodes || Object.keys(selectedAttributes).length === 0) {
      setSelectedVariation(undefined);
      return;
    }

    let matchingVariation = null;
    
    // Strategy 1: Match by comparing selected attributes with variation attributes
    // This is the most reliable method
    matchingVariation = product.variations.nodes.find((variation) => {
      const variationAttrs: Record<string, string> = {};
      variation.attributes?.nodes?.forEach((attr) => {
        if (attr.name && attr.value) {
          // Normalize attribute name (handle both "Size" and "pa_size" formats)
          const normalizedName = attr.name.toLowerCase().replace(/^pa_/, '');
          // Normalize value: trim and lowercase for comparison
          const normalizedValue = String(attr.value).trim().toLowerCase();
          variationAttrs[normalizedName] = normalizedValue;
        }
      });

      // Match all selected attributes
      return Object.keys(selectedAttributes).every(
        (key) => {
          // Normalize the key name for comparison
          const normalizedKey = key.toLowerCase().replace(/^pa_/, '');
          const selectedValue = String(selectedAttributes[key]).trim().toLowerCase();
          const variationValue = variationAttrs[normalizedKey] || '';
          
          // Exact match (case-insensitive, trimmed)
          if (variationValue === selectedValue && variationValue !== '') {
            return true;
          }
          
          // Also try matching without any normalization differences
          // Sometimes the value might have slight formatting differences
          const selectedValueClean = selectedValue.replace(/\s+/g, ' ').trim();
          const variationValueClean = variationValue.replace(/\s+/g, ' ').trim();
          
          return variationValueClean === selectedValueClean && variationValueClean !== '';
        }
      );
    });
    
    // Strategy 2: If Strategy 1 fails and we have parent product attributes, try matching by index
    // This handles cases where variation attributes have empty values
    // Note: This assumes variations are in the same order as sorted attribute options
    if (!matchingVariation && product.attributes?.nodes && product.attributes.nodes.length > 0) {
      const selectedAttrEntry = Object.entries(selectedAttributes)[0];
      if (selectedAttrEntry) {
        const [attrName, selectedValue] = selectedAttrEntry;
        const parentAttr = product.attributes.nodes.find(attr => {
          const attrNameLower = attr.name.toLowerCase().replace(/^pa_/, '');
          const keyNameLower = attrName.toLowerCase().replace(/^pa_/, '');
          return attrNameLower === keyNameLower;
        });
        
        if (parentAttr?.options) {
          // Sort options to match the order we display them
          const sortedOptions = attrName.toLowerCase().includes('size') 
            ? sortSizes([...parentAttr.options].map(opt => String(opt).trim()))
            : [...parentAttr.options].map(opt => String(opt).trim());
          
          const selectedIndex = sortedOptions.findIndex(opt => 
            opt.toLowerCase() === String(selectedValue).trim().toLowerCase()
          );
          
          if (selectedIndex >= 0 && selectedIndex < product.variations.nodes.length) {
            matchingVariation = product.variations.nodes[selectedIndex];
          }
        }
      }
    }

    if (matchingVariation) {
      setSelectedVariation(matchingVariation.databaseId);
      if (process.env.NODE_ENV === 'development') {
        console.log('Matched variation:', {
          databaseId: matchingVariation.databaseId,
          name: matchingVariation.name,
          price: matchingVariation.price,
          regularPrice: matchingVariation.regularPrice,
          salePrice: matchingVariation.salePrice,
          forAttributes: selectedAttributes
        });
      }
    } else {
      setSelectedVariation(undefined);
      if (process.env.NODE_ENV === 'development') {
        console.warn('No matching variation found for attributes:', selectedAttributes);
        console.warn('Available variations:', product.variations.nodes.map(v => ({
          databaseId: v.databaseId,
          name: v.name,
          attributes: v.attributes?.nodes
        })));
        console.warn('Parent product attributes:', product.attributes);
      }
    }
  }, [selectedAttributes, product.variations, product.attributes]);

  const updateAttribute = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  const selectedVariationData = useMemo(() => {
    if (!selectedVariation || !product.variations?.nodes) return null;
    return product.variations.nodes.find((v) => v.databaseId === selectedVariation);
  }, [selectedVariation, product.variations]);

  const inStock = useMemo(() => {
    if (!product.variations) {
      // For simple products, check stockStatus first (most reliable)
      // GraphQL returns 'instock', 'outofstock', or 'onbackorder' (lowercase)
      // Also check purchasable flag if available
      if (product.stockStatus) {
        const isInStock = product.stockStatus === 'instock' || product.stockStatus === 'IN_STOCK';
        return isInStock && (product.purchasable !== false);
      }
      // Fallback to stockQuantity if stockStatus is not available
      // If stock management is disabled, stockQuantity may be null but product is still purchasable
      return (product.purchasable !== false) && 
             (product.stockQuantity === null || product.stockQuantity === undefined || product.stockQuantity > 0);
    }
    if (!selectedVariationData) return false;
    // For variations, check stockStatus and purchasable
    const isInStock = selectedVariationData.stockStatus === 'instock' || 
                      selectedVariationData.stockStatus === 'IN_STOCK';
    return isInStock && selectedVariationData.purchasable;
  }, [product, selectedVariationData]);

  const hasVariations = product.variations && product.variations.nodes && product.variations.nodes.length > 0;
  const variationsNodes = product.variations?.nodes;
  const hasMultipleVariations = hasVariations && variationsNodes && variationsNodes.length > 1;
  const hasAttributeOptions = Object.keys(attributeOptions).length > 0;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Product variations debug:', {
      hasVariations,
      variationsCount: variationsNodes?.length || 0,
      hasMultipleVariations,
      attributeOptions,
      hasAttributeOptions,
    });
  }

  return (
    <div className="flex flex-col gap-y-6">
      {/* Variation Options */}
      {hasVariations && hasAttributeOptions && (
        <div className="flex flex-col gap-y-4">
          {Object.entries(attributeOptions).map(([attributeName, values]) => {
            // Filter out empty values
            const validValues = values.filter(v => v && v.trim().length > 0);
            if (validValues.length === 0) return null;
            
            return (
              <OptionSelect
                key={attributeName}
                title={attributeName}
                options={validValues}
                current={selectedAttributes[attributeName]}
                updateOption={(value) => updateAttribute(attributeName, value)}
                disabled={isAdding}
              />
            );
          })}
        </div>
      )}

      {/* Price */}
      <ProductPrice product={product} selectedVariation={selectedVariation} />

      {/* Add to Cart Button */}
      <AddToCart
        product={product}
        variationId={selectedVariation}
        fullWidth={true}
        inStock={inStock}
        hasVariations={hasVariations}
        selectedVariation={selectedVariationData}
        selectedAttributes={selectedAttributes}
        productAttributes={product.attributes}
      />

      {/* Product Tabs */}
      <ProductTabs product={product} />
    </div>
  );
}

