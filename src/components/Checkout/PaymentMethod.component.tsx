"use client";

import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_AVAILABLE_PAYMENT_GATEWAYS, GET_STRIPE_PAYMENT_INTENT } from '@/utils/gql/GQL_QUERIES';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
import { useCartStore } from '@/stores/cartStore';

interface PaymentGateway {
  id: string;
  title: string;
  description: string;
}

/**
 * Payment method component for checkout
 * Only displays payment gateways that are enabled in WooCommerce
 * 
 * Stripe gateway ID can be configured via NEXT_PUBLIC_STRIPE_GATEWAY_ID environment variable
 * Common values: 'stripe' (most common, matches webhook URL wc-api=wc_stripe), 'stripe_cc', 'woocommerce_gateway_stripe'
 */
interface PaymentMethodProps {
  onStripeElementReady?: (ready: boolean) => void;
  onStripeClientSecret?: (secret: string) => void;
}

const PaymentMethod = ({ onStripeElementReady, onStripeClientSecret }: PaymentMethodProps = {}) => {
  const { register, watch, setValue } = useFormContext();
  const { cart } = useCartStore();
  
  // Get Stripe gateway ID from environment or use common defaults
  // Based on webhook URL format (wc-api=wc_stripe), the gateway ID is typically 'stripe'
  const stripeGatewayId = process.env.NEXT_PUBLIC_STRIPE_GATEWAY_ID || 'stripe';
  
  // Calculate cart total for Stripe payment intent
  const cartTotal = cart?.total ? parseFloat(cart.total.replace(/[^0-9.]/g, '')) * 100 : 0; // Convert to cents
  
  // Fetch available payment gateways from WooCommerce
  const { data, loading, error } = useQuery<{ paymentGateways: { nodes: PaymentGateway[] } }>(
    GET_AVAILABLE_PAYMENT_GATEWAYS,
    {
      errorPolicy: 'all', // Continue even if query fails
      fetchPolicy: 'network-only', // Always fetch from network
    }
  );

  // Get enabled payment gateways
  // Note: WooCommerce GraphQL returns only available (enabled) gateways by default
  const allGateways = data?.paymentGateways?.nodes || [];
  // All returned gateways are already enabled (WooCommerce GraphQL filters them)
  const enabledGateways = allGateways;
  
  // Debug logging
  useEffect(() => {
    if (data) {
      console.log('[PaymentMethod] Payment gateways data:', data);
      console.log('[PaymentMethod] All gateways:', data.paymentGateways?.nodes);
      console.log('[PaymentMethod] Enabled gateways:', enabledGateways);
      console.log('[PaymentMethod] Gateway IDs:', enabledGateways.map(g => g.id));
      console.log('[PaymentMethod] Gateway details:', enabledGateways.map(g => ({ id: g.id, title: g.title, description: g.description })));
      
      // Warn if no gateways are enabled
      if (enabledGateways.length === 0) {
        console.warn('[PaymentMethod] ⚠️ No enabled payment gateways found! This will cause checkout to fail.');
        console.warn('[PaymentMethod] Please check WooCommerce → Settings → Payments and ensure at least one gateway is enabled.');
      } else {
        console.log('[PaymentMethod] ✅ Payment gateways loaded successfully:', enabledGateways.length, 'gateway(s) available');
      }
    }
    if (error) {
      console.error('[PaymentMethod] Error fetching payment gateways:', error);
      console.error('[PaymentMethod] Error details:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });
    }
    if (loading) {
      console.log('[PaymentMethod] Loading payment gateways...');
    }
  }, [data, error, loading, enabledGateways]);
  
  // Log gateway details for debugging
  if (enabledGateways.length > 0) {
    console.log('[PaymentMethod] Processing gateways:', {
      total: allGateways.length,
      enabled: enabledGateways.length,
      gatewayIds: enabledGateways.map(g => g.id),
      gatewayDetails: enabledGateways.map(g => ({ id: g.id, title: g.title, description: g.description })),
    });
  } else {
    console.log('[PaymentMethod] Processing gateways:', {
      total: allGateways.length,
      enabled: enabledGateways.length,
      gatewayIds: [],
    });
  }
  
  // Create a map of gateway IDs for quick lookup
  const enabledGatewayIds = new Set(enabledGateways.map(gateway => gateway.id));
  
  // Check if specific gateways are enabled
  const isBacsEnabled = enabledGatewayIds.has('bacs') || enabledGatewayIds.has('cod');
  const isStripeEnabled = enabledGatewayIds.has(stripeGatewayId) || 
                          enabledGatewayIds.has('stripe') || 
                          enabledGatewayIds.has('stripe_cc') ||
                          enabledGatewayIds.has('woocommerce_gateway_stripe') ||
                          Array.from(enabledGatewayIds).some(id => id.startsWith('stripe'));
  const isEcryptEnabled = enabledGatewayIds.has('ecrypt_payment_gateway');
  
  // Determine default payment method - use the actual gateway ID from WooCommerce
  // Always use the first enabled gateway's actual ID, not hardcoded values
  const defaultMethod = enabledGateways.length > 0 ? enabledGateways[0].id : null;
  
  const [selectedMethod, setSelectedMethod] = useState<string>(defaultMethod);

  // Watch payment method to sync with form state
  const paymentMethod = watch('paymentMethod');
  
  // Fetch Stripe payment intent when Stripe is selected
  const isStripeSelected = selectedMethod === stripeGatewayId || 
                          selectedMethod === 'stripe' || 
                          selectedMethod === 'stripe_cc' ||
                          selectedMethod === 'woocommerce_gateway_stripe' ||
                          selectedMethod?.startsWith('stripe');
  
  const { data: stripeData, loading: stripeLoading } = useQuery(
    GET_STRIPE_PAYMENT_INTENT,
    {
      variables: {
        stripePaymentMethod: 'PAYMENT', // Use PAYMENT for modern Payment Element
      },
      skip: !isStripeSelected || cartTotal === 0, // Skip if Stripe not selected or cart is empty
      errorPolicy: 'all',
      fetchPolicy: 'network-only',
    }
  );
  
  // Pass Stripe client secret to parent when available
  useEffect(() => {
    if (stripeData?.stripePaymentIntent?.clientSecret && onStripeClientSecret) {
      onStripeClientSecret(stripeData.stripePaymentIntent.clientSecret);
    }
  }, [stripeData, onStripeClientSecret]);

  // Sync selectedMethod with form state on mount and when gateways load
  useEffect(() => {
    if (paymentMethod) {
      setSelectedMethod(paymentMethod);
      console.log('[PaymentMethod] Payment method from form:', paymentMethod);
    } else if (defaultMethod && !loading && enabledGateways.length > 0) {
      console.log('[PaymentMethod] Setting default payment method to:', defaultMethod);
      setSelectedMethod(defaultMethod);
      setValue('paymentMethod', defaultMethod, { shouldValidate: true });
    }
  }, [paymentMethod, defaultMethod, loading, setValue, enabledGateways.length]);

  // Update form value when selection changes
  const handleMethodChange = (method: string) => {
    // Use the actual gateway ID from WooCommerce (method is already the gateway ID)
    console.log('[PaymentMethod] Payment method changed to:', method);
    setSelectedMethod(method);
    setValue('paymentMethod', method, { shouldValidate: true });
  };

  // Register the payment method field
  register('paymentMethod', { required: 'Please select a payment method' });

  // Helper function to get display info for a gateway
  const getGatewayDisplayInfo = (gatewayId: string) => {
    const gateway = enabledGateways.find(g => g.id === gatewayId);
    if (gateway) {
      return {
        title: gateway.title,
        description: gateway.description || '',
      };
    }
    
    // Fallback display info for known gateways
    if (gatewayId === 'bacs' || gatewayId === 'cod') {
      return {
        title: 'Bank Transfer / Cash on Delivery',
        description: 'Pay with bank transfer or cash on delivery',
      };
    }
    if (gatewayId === stripeGatewayId || gatewayId === 'stripe' || gatewayId === 'stripe_cc' || gatewayId === 'woocommerce_gateway_stripe' || gatewayId?.startsWith('stripe')) {
      return {
        title: 'Credit / Debit Card',
        description: 'Pay securely with Stripe',
      };
    }
    if (gatewayId === 'ecrypt_payment_gateway') {
      return {
        title: 'Ecrypt Payment Gateway',
        description: 'Alternative payment method',
      };
    }
    
    return {
      title: gatewayId,
      description: '',
    };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-3">Payment method</div>
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          <span className="text-sm text-gray-500">Loading payment methods...</span>
        </div>
      </div>
    );
  }

  // Show error state with helpful message
  if (error) {
    console.error('[PaymentMethod] GraphQL error:', error);
    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-2 font-semibold">Payment method</div>
        <div className="text-sm text-yellow-700">
          Unable to load payment methods. Please check your WooCommerce payment gateway settings.
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-yellow-600">
              Error: {error.message || 'Unknown error'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // If no gateways are enabled, show a message
  if (enabledGateways.length === 0) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-2 font-semibold">Payment method</div>
        <div className="text-sm text-yellow-700">
          No payment methods available. Please enable at least one payment gateway in WooCommerce settings.
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-yellow-600">
              Debug: Found {allGateways.length} total gateways, {enabledGateways.length} enabled.
              {allGateways.length > 0 && (
                <div>Gateway IDs: {allGateways.map(g => g.id).join(', ')}</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 mb-3">Payment method</div>
      
      <div className="space-y-2">
        {/* Bank Transfer / Cash on Delivery - only show if enabled */}
        {isBacsEnabled && (
          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              value="bacs"
              checked={selectedMethod === 'bacs' || selectedMethod === 'cod'}
              onChange={() => handleMethodChange('bacs')}
              className="mr-3 h-4 w-4 cursor-pointer accent-black"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Bank Transfer / Cash on Delivery</div>
              <div className="text-xs text-gray-500">Pay with bank transfer or cash on delivery</div>
            </div>
          </label>
        )}

        {/* Stripe WooCommerce - only show if enabled */}
        {isStripeEnabled && (
          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              value="stripe"
              checked={
                selectedMethod === stripeGatewayId ||
                selectedMethod === 'stripe' ||
                selectedMethod === 'stripe_cc' ||
                selectedMethod === 'woocommerce_gateway_stripe' ||
                selectedMethod?.startsWith('stripe')
              }
              onChange={() => handleMethodChange('stripe')}
              className="mr-3 h-4 w-4 cursor-pointer accent-black"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 flex items-center gap-2">
                Credit / Debit Card
                <div className="flex items-center gap-1">
                  <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
                    <rect width="24" height="16" rx="2" fill="#635BFF"/>
                    <path d="M9.5 8L7 5.5L4.5 8L7 10.5L9.5 8Z" fill="white"/>
                    <path d="M14.5 8L17 5.5L19.5 8L17 10.5L14.5 8Z" fill="white"/>
                  </svg>
                  <span className="text-xs text-gray-400">Stripe</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">Pay securely with Stripe</div>
            </div>
          </label>
        )}

        {/* Ecrypt Gateway - only show if enabled */}
        {isEcryptEnabled && (
          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              value="ecrypt_payment_gateway"
              checked={selectedMethod === 'ecrypt_payment_gateway'}
              onChange={() => handleMethodChange('ecrypt_payment_gateway')}
              className="mr-3 h-4 w-4 cursor-pointer accent-black"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Ecrypt Payment Gateway</div>
              <div className="text-xs text-gray-500">Alternative payment method</div>
            </div>
          </label>
        )}

        {/* Display any other enabled gateways that don't match our known patterns */}
        {enabledGateways
          .filter(gateway => {
            const id = gateway.id;
            return !isBacsEnabled && id !== 'bacs' && id !== 'cod' &&
                   !isStripeEnabled && id !== stripeGatewayId && id !== 'stripe' && id !== 'stripe_cc' && id !== 'woocommerce_gateway_stripe' && !id.startsWith('stripe') &&
                   !isEcryptEnabled && id !== 'ecrypt_payment_gateway';
          })
          .map(gateway => {
            const displayInfo = getGatewayDisplayInfo(gateway.id);
            return (
              <label key={gateway.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value={gateway.id}
                  checked={selectedMethod === gateway.id}
                  onChange={() => handleMethodChange(gateway.id)}
                  className="mr-3 h-4 w-4 cursor-pointer accent-black"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{displayInfo.title}</div>
                  {displayInfo.description && (
                    <div className="text-xs text-gray-500">{displayInfo.description}</div>
                  )}
                </div>
              </label>
            );
          })}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        value={selectedMethod}
        {...register('paymentMethod')}
      />
    </div>
  );
};

export default PaymentMethod;

