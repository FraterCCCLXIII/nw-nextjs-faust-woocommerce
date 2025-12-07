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

  // Get unique attribute options from variations
  // WordPress variations use attributes differently - check if they exist
  const attributeOptions = useMemo(() => {
    if (!product.variations?.nodes) return {};

    const options: Record<string, string[]> = {};
    
    product.variations.nodes.forEach((variation) => {
      // WordPress variations might have attributes in different format
      // Try to extract from variation name or attributes
      if (variation.attributes?.nodes) {
        variation.attributes.nodes.forEach((attr) => {
          if (!options[attr.name]) {
            options[attr.name] = [];
          }
          if (!options[attr.name].includes(attr.value)) {
            options[attr.name].push(attr.value);
          }
        });
      } else if (variation.name) {
        // Fallback: try to parse variation name for attributes
        // This is a simple fallback - adjust based on your actual data structure
        const parts = variation.name.split(' - ');
        if (parts.length > 1) {
          const attrName = 'Variant';
          if (!options[attrName]) {
            options[attrName] = [];
          }
          if (!options[attrName].includes(parts[1] || parts[0])) {
            options[attrName].push(parts[1] || parts[0]);
          }
        }
      }
    });

    return options;
  }, [product.variations]);

  // Get selected attribute values
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Auto-select first variation if only one exists
  useEffect(() => {
    if (product.variations?.nodes && product.variations.nodes.length === 1) {
      setSelectedVariation(product.variations.nodes[0].databaseId);
    }
  }, [product.variations]);

  // Find matching variation based on selected attributes
  useEffect(() => {
    if (!product.variations?.nodes || Object.keys(selectedAttributes).length === 0) {
      return;
    }

    const matchingVariation = product.variations.nodes.find((variation) => {
      const variationAttrs: Record<string, string> = {};
      variation.attributes?.nodes?.forEach((attr) => {
        variationAttrs[attr.name] = attr.value;
      });

      return Object.keys(selectedAttributes).every(
        (key) => variationAttrs[key] === selectedAttributes[key]
      );
    });

    if (matchingVariation) {
      setSelectedVariation(matchingVariation.databaseId);
    }
  }, [selectedAttributes, product.variations]);

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

  return (
    <div className="flex flex-col gap-y-6">
      {/* Variation Options */}
      {hasMultipleVariations && (
        <div className="flex flex-col gap-y-4">
          {Object.entries(attributeOptions).map(([attributeName, values]) => (
            <OptionSelect
              key={attributeName}
              title={attributeName}
              options={values}
              current={selectedAttributes[attributeName]}
              updateOption={(value) => updateAttribute(attributeName, value)}
              disabled={isAdding}
            />
          ))}
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
      />

      {/* Product Tabs */}
      <ProductTabs product={product} />
    </div>
  );
}

