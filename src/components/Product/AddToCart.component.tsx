// Imports
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

// Components
import Button from '@/components/UI/Button.component';

// State
import { useCartStore } from '@/stores/cartStore';

// Utils
import { getFormattedCart } from '@/utils/functions/functions';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { ADD_TO_CART } from '@/utils/gql/GQL_MUTATIONS';

interface IImage {
  __typename: string;
  id: string;
  uri: string;
  title: string;
  srcSet: string;
  sourceUrl: string;
}

interface IVariationNode {
  __typename: string;
  name: string;
}

interface IAllPaColors {
  __typename: string;
  nodes: IVariationNode[];
}

interface IAllPaSizes {
  __typename: string;
  nodes: IVariationNode[];
}

export interface IVariationNodes {
  __typename?: string;
  id?: string;
  databaseId: number;
  name: string;
  price: string;
  stockStatus: string;
  stockQuantity: number;
  purchasable: boolean;
  onSale: boolean;
  salePrice?: string;
  regularPrice: string;
  attributes?: {
    nodes?: Array<{
      name: string;
      value: string;
    }>;
  };
}

interface IVariations {
  __typename?: string;
  nodes?: IVariationNodes[];
}

export interface IProduct {
  __typename?: string;
  id?: string;
  databaseId: number;
  averageRating?: number;
  slug?: string;
  description?: string;
  onSale: boolean;
  image?: IImage;
  name: string;
  salePrice?: string;
  regularPrice: string;
  price: string;
  stockQuantity?: number | null;
  stockStatus?: string;
  purchasable?: boolean;
  allPaColors?: IAllPaColors;
  allPaSizes?: IAllPaSizes;
  variations?: IVariations;
}

export interface IProductRootObject {
  product: IProduct;
  variationId?: number;
  fullWidth?: boolean;
  inStock?: boolean;
  hasVariations?: boolean;
  selectedVariation?: {
    databaseId: number;
    stockQuantity: number;
    purchasable: boolean;
  } | null;
}

/**
 * Handles the Add to cart functionality.
 * Uses GraphQL for product data
 * @param {IAddToCartProps} product // Product data
 * @param {number} variationId // Variation ID
 * @param {boolean} fullWidth // Whether the button should be full-width
 */

const AddToCart = ({
  product,
  variationId,
  fullWidth = false,
  inStock = true,
  hasVariations = false,
  selectedVariation = null,
}: IProductRootObject) => {
  const { syncWithWooCommerce, isLoading: isCartLoading } = useCartStore();
  const [requestError, setRequestError] = useState<boolean>(false);

  // For variable products, we need the parent product ID and the variation ID
  // For simple products, we only need the product ID
  const productId = product?.databaseId;
  const finalVariationId = hasVariations && selectedVariation ? (variationId || selectedVariation.databaseId) : undefined;
  
  // Determine button text based on state
  const getButtonText = () => {
    if (isCartLoading || addToCartLoading) {
      return 'Adding...';
    }
    if (hasVariations && !selectedVariation) {
      return 'Select variant';
    }
    if (!inStock) {
      return 'Out of stock';
    }
    return 'Add to cart';
  };

  // Get cart data query
  const { data, refetch, error: cartError } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all', // Return partial data even if there are errors
  });

  // Use useEffect instead of onCompleted (deprecated)
  useEffect(() => {
    if (data) {
      const updatedCart = getFormattedCart(data);
      if (updatedCart) {
        syncWithWooCommerce(updatedCart);
      }
    }
  }, [data, syncWithWooCommerce]);

  // Add to cart mutation
  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
    onCompleted: (mutationData) => {
      // Immediately refetch cart to get updated state
      refetch().then(() => {
        // Also update from the mutation response if available
        if (mutationData?.addToCart?.cartItem) {
          // Trigger a refetch to ensure we have the latest cart state
          setTimeout(() => {
            refetch();
          }, 500);
        }
      });
    },

    onError: (error) => {
      console.error('Add to cart error:', error);
      setRequestError(true);
      // Reset error after 3 seconds
      setTimeout(() => {
        setRequestError(false);
      }, 3000);
    },
  });

  const handleAddToCart = () => {
    if (!productId) {
      console.error('Product ID is missing');
      setRequestError(true);
      return;
    }

    // Check if GraphQL URL is configured
    if (!process.env.NEXT_PUBLIC_GRAPHQL_URL) {
      console.error('NEXT_PUBLIC_GRAPHQL_URL is not configured');
      alert('GraphQL endpoint is not configured. Please check your environment variables.');
      setRequestError(true);
      return;
    }

    // Build the mutation input - AddToCartInput does NOT include clientMutationId
    const input: {
      productId: number;
      variationId?: number;
      quantity?: number;
    } = {
      productId,
    };

    // Add variation ID if this is a variable product with a selected variation
    if (hasVariations && finalVariationId) {
      input.variationId = finalVariationId;
    }

    // Add quantity (default to 1)
    input.quantity = 1;

    // Log the input for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[AddToCart] Starting mutation with:', {
        input,
        productId,
        variationId: finalVariationId,
        hasVariations,
        selectedVariation,
      });
      console.log('[AddToCart] GraphQL URL:', process.env.NEXT_PUBLIC_GRAPHQL_URL);
      console.log('[AddToCart] Mutation definition:', ADD_TO_CART);
    }

    // Call the mutation with the correct input
    addToCart({
      variables: {
        input,
      },
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AddToCart] Mutation failed:', error);
      }
      // Additional error handling
      console.error('Add to cart mutation error:', error);
      if (error.networkError) {
        const networkError = error.networkError;
        const errorDetails: Record<string, unknown> = {
          message: networkError.message,
        };
        
        // Only include statusCode if it exists (ServerParseError or ServerError)
        if ('statusCode' in networkError) {
          errorDetails.statusCode = (networkError as { statusCode: number }).statusCode;
        }
        
        // Only include result if it exists
        if ('result' in networkError) {
          errorDetails.result = (networkError as { result: unknown }).result;
        }
        
        console.error('Network error details:', errorDetails);
        console.error('GraphQL URL:', process.env.NEXT_PUBLIC_GRAPHQL_URL);
        
        // Provide user-friendly error message
        if (networkError.message === 'Failed to fetch') {
          alert('Failed to connect to the server. Please check:\n1. WordPress is running\n2. GraphQL endpoint is accessible\n3. CORS is properly configured');
        }
      }
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        console.error('GraphQL errors:', error.graphQLErrors);
        const errorMessages = error.graphQLErrors.map((e: any) => e.message).join('\n');
        alert(`GraphQL Error:\n${errorMessages}`);
      }
    });
  };

  const isDisabled = 
    addToCartLoading || 
    requestError || 
    isCartLoading || 
    !inStock || 
    (hasVariations && !selectedVariation);

  return (
    <>
      <Button
        handleButtonClick={() => handleAddToCart()}
        buttonDisabled={isDisabled}
        fullWidth={fullWidth}
      >
        {getButtonText()}
      </Button>
    </>
  );
};

export default AddToCart;
