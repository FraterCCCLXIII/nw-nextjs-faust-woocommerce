import { useState } from 'react';
import { Product, ProductType } from '@/types/product';
import { getUniqueProductTypes } from '@/utils/functions/productUtils';

export const useProductFilters = (products: Product[]) => {
  // Calculate dynamic price range from actual products
  const calculatePriceRange = (products: Product[]): [number, number] => {
    if (!products || products.length === 0) return [0, 1000];
    
    const prices = products
      .map((product) => {
        if (!product.price) return null;
        const price = parseFloat(product.price.replace(/[^0-9.]/g, ''));
        return isNaN(price) ? null : price;
      })
      .filter((price): price is number => price !== null);
    
    if (prices.length === 0) return [0, 1000];
    
    const minPrice = Math.floor(Math.min(...prices));
    const maxPrice = Math.ceil(Math.max(...prices));
    
    // Add 10% padding to the max price for better UX
    return [0, Math.max(1000, maxPrice * 1.1)];
  };

  const [sortBy, setSortBy] = useState('popular');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>(() =>
    calculatePriceRange(products)
  );
  const [productTypes, setProductTypes] = useState<ProductType[]>(() =>
    products ? getUniqueProductTypes(products) : [],
  );

  const toggleProductType = (id: string) => {
    setProductTypes((prev) =>
      prev.map((type) =>
        type.id === id ? { ...type, checked: !type.checked } : type,
      ),
    );
  };

  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(calculatePriceRange(products));
    setProductTypes((prev) =>
      prev.map((type) => ({ ...type, checked: false })),
    );
  };

  const filterProducts = (products: Product[]) => {
    const filtered = products?.filter((product: Product) => {
      // Filter by price - skip products with null/undefined/empty prices
      // For variable products, price might be a range (e.g., "$10 - $20")
      // Use the first price in the range, or fallback to regularPrice
      const priceToCheck = product.price || product.regularPrice || product.salePrice || '';
      
      if (!priceToCheck || priceToCheck === '') {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useProductFilters] Filtering out product without price:', {
            name: product.name,
            price: product.price,
            regularPrice: product.regularPrice,
            salePrice: product.salePrice,
          });
        }
        return false;
      }
      
      // Handle price ranges (e.g., "$10 - $20" or "$10.00 - $20.00")
      // Extract the first (minimum) price from the range
      let priceString = priceToCheck;
      if (priceString.includes(' - ')) {
        priceString = priceString.split(' - ')[0].trim();
      }
      
      const productPrice = parseFloat(priceString.replace(/[^0-9.]/g, ''));
      if (isNaN(productPrice)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useProductFilters] Filtering out product with invalid price:', {
            name: product.name,
            originalPrice: priceToCheck,
            extractedPrice: priceString,
            parsedPrice: productPrice,
          });
        }
        return false;
      }
      
      const withinPriceRange =
        productPrice >= priceRange[0] && productPrice <= priceRange[1];
      if (!withinPriceRange) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useProductFilters] Filtering out product outside price range:', {
            name: product.name,
            price: productPrice,
            priceRange: priceRange,
          });
        }
        return false;
      }

      // Filter by product type
      const selectedTypes = productTypes
        .filter((t) => t.checked)
        .map((t) => t.name.toLowerCase());
      if (selectedTypes.length > 0) {
        const productCategories =
          product.productCategories?.nodes.map((cat) =>
            cat.name.toLowerCase(),
          ) || [];
        if (!selectedTypes.some((type) => productCategories.includes(type)))
          return false;
      }

      // Filter by size
      if (selectedSizes.length > 0) {
        const productSizes =
          product.allPaSizes?.nodes.map((node) => node.name) || [];
        if (!selectedSizes.some((size) => productSizes.includes(size)))
          return false;
      }

      // Filter by color
      if (selectedColors.length > 0) {
        const productColors =
          product.allPaColors?.nodes.map((node) => node.name) || [];
        if (!selectedColors.some((color) => productColors.includes(color)))
          return false;
      }

      return true;
    });

    // Sort products
    return [...(filtered || [])].sort((a, b) => {
      // Handle null/undefined prices
      const priceAStr = a.price || '0';
      const priceBStr = b.price || '0';
      const priceA = parseFloat(priceAStr.replace(/[^0-9.]/g, '')) || 0;
      const priceB = parseFloat(priceBStr.replace(/[^0-9.]/g, '')) || 0;

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'newest':
          return b.databaseId - a.databaseId;
        default: // 'popular'
          return 0;
      }
    });
  };

  return {
    sortBy,
    setSortBy,
    selectedSizes,
    setSelectedSizes,
    selectedColors,
    setSelectedColors,
    priceRange,
    setPriceRange,
    productTypes,
    toggleProductType,
    resetFilters,
    filterProducts,
  };
};
