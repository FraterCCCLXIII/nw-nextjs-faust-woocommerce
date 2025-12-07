/*eslint complexity: ["error", 20]*/
// Imports
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

// Components
import Billing from './Billing.component';
import CheckoutOrderSummary from './CheckoutOrderSummary.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
import CheckoutConfirmation from './CheckoutConfirmation.component';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { CHECKOUT_MUTATION } from '@/utils/gql/GQL_MUTATIONS';
import { useCartStore } from '@/stores/cartStore';

// Utils
import {
  getFormattedCart,
  createCheckoutData,
  ICheckoutDataProps,
} from '@/utils/functions/functions';

export interface IBilling {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  postcode: string;
  email: string;
  phone: string;
}

export interface IShipping {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  postcode: string;
  email: string;
  phone: string;
}

export interface ICheckoutData {
  clientMutationId: string;
  billing: IBilling;
  shipping: IShipping;
  shipToDifferentAddress: boolean;
  paymentMethod: string;
  isPaid: boolean;
  transactionId: string;
}

interface OrderResponse {
  checkout: {
    result: string;
    redirect: string;
    order: {
      id: string;
      databaseId: number;
      orderNumber: string;
      orderKey: string;
      status: string;
      date: string;
      total: string;
      subtotal: string;
      totalTax: string;
      shippingTotal: string;
      paymentMethod: string;
      paymentMethodTitle: string;
      currency: string;
      billing: {
        firstName: string;
        lastName: string;
        address1: string;
        address2?: string;
        city: string;
        state?: string;
        postcode: string;
        country: string;
        email: string;
        phone?: string;
        company?: string;
      };
      shipping: {
        firstName: string;
        lastName: string;
        address1: string;
        address2?: string;
        city: string;
        state?: string;
        postcode: string;
        country: string;
      };
      lineItems: {
        nodes: Array<{
          id: string;
          productId: number | null;
          quantity: number;
          subtotal: string;
          total: string;
          product: {
            node: {
              id: string;
              name: string;
              image: {
                sourceUrl: string;
                altText: string;
              } | null;
            };
          } | null;
          variation: {
            node: {
              id: string;
              name: string;
              image: {
                sourceUrl: string;
                altText: string;
              } | null;
            };
          } | null;
        }>;
      };
    } | null;
  };
}

const CheckoutForm = () => {
  const { cart, clearWooCommerceSession, syncWithWooCommerce } = useCartStore();
  const [orderData, setOrderData] = useState<ICheckoutData | null>(null);
  const [requestError, setRequestError] = useState<ApolloError | null>(null);
  const [orderCompleted, setorderCompleted] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<OrderResponse['checkout']['order'] | null>(null);
  
  // Stripe payment processing state
  const [stripeClientSecret, setStripeClientSecret] = useState<string>('');
  const [stripeElements, setStripeElements] = useState<StripeElements | null>(null);
  const [stripePaymentReady, setStripePaymentReady] = useState<boolean>(false);
  const [isProcessingStripe, setIsProcessingStripe] = useState<boolean>(false);
  const stripeRef = useRef<Stripe | null>(null);
  
  // Initialize Stripe
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).then((stripe) => {
        stripeRef.current = stripe;
      });
    }
  }, []);

  // Get cart data query
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
      console.error('[CheckoutForm] Error fetching cart:', cartError);
    }
  }, [cartError]);

  // Checkout GraphQL mutation
  const [checkout, { loading: checkoutLoading, data: checkoutData, error: checkoutError }] = useMutation<OrderResponse>(
    CHECKOUT_MUTATION,
    {
      variables: {
        input: orderData,
      },
      errorPolicy: 'all', // Return partial data even if there are errors
    },
  );

  // Use useEffect instead of onCompleted (deprecated)
  useEffect(() => {
    if (checkoutData?.checkout?.order) {
      clearWooCommerceSession();
      setorderCompleted(true);
      setCompletedOrder(checkoutData.checkout.order);
      refetch();
    }
  }, [checkoutData, clearWooCommerceSession, refetch]);

  // Log errors for debugging
  useEffect(() => {
    if (checkoutError) {
      setRequestError(checkoutError);
      console.error('[CheckoutForm] Checkout mutation error:', checkoutError);
      refetch();
    }
  }, [checkoutError, refetch]);

  useEffect(() => {
    if (checkoutData?.checkout && !checkoutData.checkout.order) {
      console.error('[CheckoutForm] Checkout completed but no order data received');
    }
  }, [checkoutData]);

  useEffect(() => {
    if (null !== orderData) {
      // Perform checkout mutation when the value for orderData changes.
      checkout();
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [checkout, orderData, refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleFormSubmit = async (submitData: ICheckoutDataProps) => {
    // Ensure all required fields have defaults
    const formData: ICheckoutDataProps = {
      ...submitData,
      address2: submitData.address2 || '',
      country: submitData.country || 'US',
      state: submitData.state || '',
      company: submitData.company || '',
      paymentMethod: submitData.paymentMethod || 'bacs',
    };
    
    const stripeGatewayId = process.env.NEXT_PUBLIC_STRIPE_GATEWAY_ID || 'stripe';
    const isStripe = formData.paymentMethod === stripeGatewayId || 
                     formData.paymentMethod === 'stripe' || 
                     formData.paymentMethod === 'stripe_cc' ||
                     formData.paymentMethod === 'woocommerce_gateway_stripe' ||
                     formData.paymentMethod?.startsWith('stripe');
    
    // Process Stripe payment if Stripe is selected
    if (isStripe && stripeRef.current && stripeElements && stripeClientSecret) {
      setIsProcessingStripe(true);
      try {
        // Submit the elements to validate the form
        const { error: submitError } = await stripeElements.submit();
        if (submitError) {
          console.error('Stripe form validation failed:', submitError);
          setRequestError(new Error(submitError.message) as ApolloError);
          setIsProcessingStripe(false);
          return;
        }

        // Confirm payment with Stripe
        const { error, paymentIntent } = await stripeRef.current.confirmPayment({
          elements: stripeElements,
          clientSecret: stripeClientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/order-received`,
            payment_method_data: {
              billing_details: {
                name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || undefined,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                address: {
                  line1: formData.address1 || undefined,
                  line2: formData.address2 || undefined,
                  city: formData.city || undefined,
                  state: formData.state || undefined,
                  postal_code: formData.postcode || undefined,
                  country: formData.country || undefined,
                },
              },
            },
          },
          redirect: 'if_required',
        });

        if (error) {
          console.error('Stripe payment failed:', error);
          setRequestError(new Error(error.message) as ApolloError);
          setIsProcessingStripe(false);
          return;
        }

        if (paymentIntent) {
          // Add Stripe metadata to checkout data
          const stripeMetaData = [
            { key: '_stripe_payment_intent_id', value: paymentIntent.id },
            { key: '_stripe_payment_method_id', value: paymentIntent.payment_method as string || '' },
            { key: '_stripe_source_id', value: paymentIntent.id },
            { key: '_stripe_fee', value: '0' },
            { key: '_stripe_net', value: paymentIntent.amount.toString() },
            { key: '_stripe_currency', value: paymentIntent.currency },
            { key: '_stripe_charge_captured', value: 'yes' },
            { key: '_wc_stripe_payment_method_type', value: 'card' },
          ];

          formData.metaData = stripeMetaData;
          formData.isPaid = paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing';
          formData.transactionId = paymentIntent.id;
        }
      } catch (error: any) {
        console.error('Stripe payment error:', error);
        setRequestError(new Error(error.message || 'Payment processing failed') as ApolloError);
        setIsProcessingStripe(false);
        return;
      } finally {
        setIsProcessingStripe(false);
      }
    }
    
    const checkOutData = createCheckoutData(formData);
    setOrderData(checkOutData);
    setRequestError(null);
  };

  return (
    <>
      {cart && !orderCompleted ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Checkout Form */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Checkout
                </h1>
                
                {/* Error display*/}
                {requestError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">
                      An error has occurred. Please try again.
                    </p>
                  </div>
                )}
                
                {/* Checkout Loading*/}
                {checkoutLoading && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-blue-600 mb-2">
                      Processing order, please wait...
                    </p>
                    <LoadingSpinner />
                  </div>
                )}
                
                {/* Payment Details Form */}
                <Billing 
                  handleFormSubmit={handleFormSubmit}
                  onStripeClientSecret={setStripeClientSecret}
                  onStripeElements={setStripeElements}
                  onStripePaymentReady={setStripePaymentReady}
                  isProcessingStripe={isProcessingStripe}
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <CheckoutOrderSummary className="lg:sticky lg:top-20" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {!cart && !orderCompleted && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  No products in cart
                </h1>
                <p className="text-gray-600 mb-6">
                  Your cart is empty. Add some products to continue.
                </p>
                <a
                  href="/catalog"
                  className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </a>
              </div>
            </div>
          )}
          {orderCompleted && completedOrder && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <CheckoutConfirmation order={completedOrder} />
            </div>
          )}
          {orderCompleted && !completedOrder && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Thank you for your order!
                </h1>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CheckoutForm;
