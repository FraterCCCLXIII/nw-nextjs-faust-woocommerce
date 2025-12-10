import { filteredVariantPrice, paddedPrice } from '@/utils/functions/functions';

interface ProductPriceProps {
  product: {
    price: string;
    regularPrice: string;
    salePrice?: string;
    onSale: boolean;
    variations?: {
      nodes?: Array<{
        databaseId: number;
        price: string;
        regularPrice: string;
        salePrice?: string;
        onSale: boolean;
      }>;
    };
  };
  selectedVariation?: number;
}

const ProductPrice = ({ product, selectedVariation }: ProductPriceProps) => {
  // Get the price based on whether we have a selected variation
  let displayPrice = product.price;
  let displayRegularPrice = product.regularPrice;
  let displaySalePrice = product.salePrice;
  let isOnSale = product.onSale;

  // If we have a selected variation, use its price
  if (selectedVariation && product.variations?.nodes) {
    const variation = product.variations.nodes.find(
      (v) => v.databaseId === selectedVariation
    );
    
    if (variation) {
      console.log('[ProductPrice] Selected variation found:', {
        databaseId: variation.databaseId,
        price: variation.price,
        regularPrice: variation.regularPrice,
        salePrice: variation.salePrice,
        onSale: variation.onSale,
      });
      
      // Use salePrice if on sale, otherwise use price, fallback to regularPrice
      displayPrice = variation.onSale && variation.salePrice
        ? variation.salePrice
        : (variation.price || variation.regularPrice || '');
      displayRegularPrice = variation.regularPrice || '';
      displaySalePrice = variation.salePrice || '';
      isOnSale = variation.onSale;
      
      // If we still don't have a price, fallback to product price
      if (!displayPrice && !displayRegularPrice) {
        console.warn('[ProductPrice] Variation has no price, falling back to product price');
        displayPrice = product.price || product.regularPrice || '';
        displayRegularPrice = product.regularPrice || '';
      }
    } else {
      console.warn('[ProductPrice] Variation not found for databaseId:', selectedVariation);
    }
  } else {
    // For products without selected variation, determine display price
    // If on sale and salePrice exists, use salePrice, otherwise use price or regularPrice
    if (isOnSale && displaySalePrice) {
      displayPrice = displaySalePrice;
    } else {
      displayPrice = displayPrice || displayRegularPrice;
    }
  }

  console.log('[ProductPrice] Price calculation:', {
    selectedVariation,
    displayPrice,
    displayRegularPrice,
    displaySalePrice,
    isOnSale,
  });

  // Format prices - ensure we have valid price strings
  // Only format if price exists and is not empty
  const formattedPrice = displayPrice && displayPrice.trim() 
    ? paddedPrice(displayPrice, 'kr') 
    : '';
  const formattedRegularPrice = displayRegularPrice && displayRegularPrice.trim()
    ? paddedPrice(displayRegularPrice, 'kr')
    : '';
  const formattedSalePrice = displaySalePrice && displaySalePrice.trim()
    ? paddedPrice(displaySalePrice, 'kr')
    : '';

  console.log('[ProductPrice] Formatted prices:', {
    formattedPrice,
    formattedRegularPrice,
    formattedSalePrice,
  });

  // Calculate percentage discount if on sale
  const percentageDiff =
    isOnSale && displayRegularPrice && displaySalePrice
      ? Math.round(
          ((parseFloat(displayRegularPrice) - parseFloat(displaySalePrice)) /
            parseFloat(displayRegularPrice)) *
            100
        )
      : null;

  // Determine what price to display - displayPrice is already set correctly above
  // Use formattedPrice (which is based on displayPrice) or fallback to regularPrice
  const priceToDisplay = formattedPrice || formattedRegularPrice;

  console.log('[ProductPrice] Final price to display:', priceToDisplay);

  // Don't render if no price is available
  if (!priceToDisplay || !priceToDisplay.trim()) {
    console.warn('[ProductPrice] No price available, returning null');
    return null;
  }

  // Helper function to safely extract price from range or return single price
  const getDisplayPrice = (price: string, isVariation: boolean) => {
    if (!isVariation) {
      return price;
    }
    // If price contains a range (has "-"), extract the left side
    // Otherwise, return the price as-is
    if (price && price.includes(' - ')) {
      return filteredVariantPrice(price, '');
    }
    return price;
  };

  return (
    <div className="flex flex-col text-gray-900">
      <span
        className={`text-2xl font-semibold ${
          isOnSale ? 'text-red-600' : 'text-gray-900'
        }`}
        data-testid="product-price"
      >
        {product.variations && !selectedVariation && 'From '}
        {getDisplayPrice(priceToDisplay, !!selectedVariation)}
      </span>
      {isOnSale && formattedRegularPrice && (
        <>
          <p className="mt-1">
            <span className="text-gray-600 text-base">Original: </span>
            <span
              className="line-through text-gray-500"
              data-testid="original-product-price"
            >
              {selectedVariation && formattedRegularPrice.includes(' - ')
                ? filteredVariantPrice(formattedRegularPrice, 'right')
                : formattedRegularPrice}
            </span>
          </p>
          {percentageDiff && (
            <span className="text-red-600 text-sm mt-1">
              -{percentageDiff}%
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default ProductPrice;

