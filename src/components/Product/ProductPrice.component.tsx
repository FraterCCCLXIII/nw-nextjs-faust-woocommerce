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
      // Use salePrice if on sale, otherwise use price, fallback to regularPrice
      displayPrice = variation.onSale && variation.salePrice
        ? variation.salePrice
        : (variation.price || variation.regularPrice);
      displayRegularPrice = variation.regularPrice;
      displaySalePrice = variation.salePrice;
      isOnSale = variation.onSale;
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

  // Format prices - ensure we have valid price strings
  const formattedPrice = displayPrice ? paddedPrice(displayPrice, 'kr') : '';
  const formattedRegularPrice = displayRegularPrice
    ? paddedPrice(displayRegularPrice, 'kr')
    : '';
  const formattedSalePrice = displaySalePrice
    ? paddedPrice(displaySalePrice, 'kr')
    : '';

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

  // Don't render if no price is available
  if (!priceToDisplay) {
    return null;
  }

  return (
    <div className="flex flex-col text-gray-900">
      <span
        className={`text-2xl font-semibold ${
          isOnSale ? 'text-red-600' : 'text-gray-900'
        }`}
        data-testid="product-price"
      >
        {product.variations && !selectedVariation && 'From '}
        {product.variations && selectedVariation
          ? filteredVariantPrice(priceToDisplay, '')
          : priceToDisplay}
      </span>
      {isOnSale && formattedRegularPrice && (
        <>
          <p className="mt-1">
            <span className="text-gray-600 text-base">Original: </span>
            <span
              className="line-through text-gray-500"
              data-testid="original-product-price"
            >
              {product.variations && selectedVariation
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

