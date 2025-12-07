import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

import { useCartStore } from '@/stores/cartStore';
import Button from '@/components/UI/Button.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
import CartStickyFooter from './CartStickyFooter.component';

import {
  getFormattedCart,
  getUpdatedItems,
  handleQuantityChange,
  IProductRootObject,
} from '@/utils/functions/functions';

import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';

const CartContents = () => {
  const router = useRouter();
  const { clearWooCommerceSession, syncWithWooCommerce } = useCartStore();
  const isCheckoutPage = router.pathname === '/checkout';

  const { data, refetch, error: cartError } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all', // Return partial data even if there are errors
  });

  // Use useEffect instead of onCompleted (deprecated)
  useEffect(() => {
    if (data) {
      const updatedCart = getFormattedCart(data);
      if (!updatedCart && !data?.cart?.contents?.nodes?.length) {
        clearWooCommerceSession();
        return;
      }
      if (updatedCart) {
        syncWithWooCommerce(updatedCart);
      }
    }
  }, [data, clearWooCommerceSession, syncWithWooCommerce]);

  // Log errors for debugging
  useEffect(() => {
    if (cartError) {
      console.error('[CartContents] Error fetching cart:', cartError);
    }
  }, [cartError]);

  const [updateCart, { loading: updateCartProcessing }] = useMutation(
    UPDATE_CART,
    {
      onCompleted: () => {
        refetch();
        setTimeout(() => {
          refetch();
        }, 3000);
      },
    },
  );

  const handleRemoveProductClick = (
    cartKey: string,
    products: IProductRootObject[],
  ) => {
    if (products?.length) {
      const updatedItems = getUpdatedItems(products, 0, cartKey);
      updateCart({
        variables: {
          input: {
            clientMutationId: uuidv4(),
            items: updatedItems,
          },
        },
      });
    }
    refetch();
    setTimeout(() => {
      refetch();
    }, 3000);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  const getUnitPrice = (subtotal: string, quantity: number) => {
    const numericSubtotal = parseFloat(subtotal.replace(/[^0-9.-]+/g, ''));
    return isNaN(numericSubtotal)
      ? 'N/A'
      : (numericSubtotal / quantity).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {data?.cart?.contents?.nodes?.length ? (
        <>
          {/* Top Banner */}
          <div className="bg-white p-6 mb-8 text-center border-b border-gray-300">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Your Shopping Cart</h2>
            <p className="text-gray-600 text-sm md:text-base">
              Review your items and proceed to checkout when ready
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 mb-8 md:w-full">
            {data.cart.contents.nodes.map((item: IProductRootObject) => (
              <div
                key={item.key}
                className="flex items-center border-b border-gray-200 py-4"
              >
                <div className="flex-shrink-0 w-24 h-24 relative hidden md:block">
                  <Image
                    src={
                      item.product.node.image?.sourceUrl || '/placeholder.png'
                    }
                    alt={item.product.node.name}
                    fill
                    sizes="96px"
                    className="rounded object-cover"
                    unoptimized={
                      item.product.node.image?.sourceUrl?.includes('localhost') ||
                      item.product.node.image?.sourceUrl?.includes('127.0.0.1')
                    }
                  />
                </div>
                <div className="flex-grow ml-4">
                  <h2 className="text-lg font-semibold">
                    {item.product.node.name}
                  </h2>
                  <p className="text-gray-600">
                    ${getUnitPrice(item.subtotal, item.quantity)}
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => {
                      handleQuantityChange(
                        event,
                        item.key,
                        data.cart.contents.nodes,
                        updateCart,
                        updateCartProcessing,
                      );
                    }}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded mr-2"
                  />
                  <Button
                    handleButtonClick={() =>
                      handleRemoveProductClick(
                        item.key,
                        data.cart.contents.nodes,
                      )
                    }
                    variant="danger"
                    buttonDisabled={updateCartProcessing}
                  >
                    Remove
                  </Button>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold">{item.subtotal}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Sticky Footer - Subtotal, Terms, and Checkout Button */}
          {!isCheckoutPage && <CartStickyFooter />}
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            No products in cart
          </h2>
          <Link href="/catalog" passHref>
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      )}
      {updateCartProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-lg mb-2">Updating cart...</p>
            <LoadingSpinner />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartContents;
