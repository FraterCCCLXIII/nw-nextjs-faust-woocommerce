"use client";

import { useFormContext } from 'react-hook-form';
import StripeElement from './StripeElement.component';
import { useCartStore } from '@/stores/cartStore';

interface CreditCardFieldsProps {
  stripeClientSecret?: string;
  onStripeElementReady?: (elements: any) => void;
  onStripePaymentReady?: (ready: boolean) => void;
}

/**
 * Credit card fields component for checkout
 * Uses Stripe Elements for Stripe payments, manual fields for other gateways
 */
const CreditCardFields = ({ stripeClientSecret, onStripeElementReady, onStripePaymentReady }: CreditCardFieldsProps = {}) => {
  const { register, formState: { errors }, watch } = useFormContext();
  const { cart } = useCartStore();
  const paymentMethod = watch('paymentMethod');
  
  // Show credit card fields for Stripe or Ecrypt payment methods
  // Stripe can have different gateway IDs: 'stripe', 'woocommerce_gateway_stripe', 'stripe_cc', etc.
  // Default to 'stripe' based on webhook URL format (wc-api=wc_stripe)
  const stripeGatewayId = process.env.NEXT_PUBLIC_STRIPE_GATEWAY_ID || 'stripe';
  const isStripe = 
    paymentMethod === stripeGatewayId ||
    paymentMethod === 'stripe' || 
    paymentMethod === 'woocommerce_gateway_stripe' ||
    paymentMethod === 'stripe_cc' ||
    paymentMethod?.startsWith('stripe');
  
  const isEcrypt = paymentMethod === 'ecrypt_payment_gateway';
  const showCardFields = isStripe || isEcrypt;

  // Don't render if payment method doesn't require card fields
  if (!showCardFields) {
    return null;
  }
  
  // Use Stripe Elements for Stripe payments
  if (isStripe && stripeClientSecret && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    const cartTotal = cart?.total ? parseFloat(cart.total.replace(/[^0-9.]/g, '')) * 100 : 0;
    const currency = 'usd'; // TODO: Get from cart or config
    
    return (
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-3">Card information</div>
        <StripeElement
          clientSecret={stripeClientSecret}
          amount={cartTotal}
          currency={currency}
          onElementReady={(elements) => {
            if (onStripeElementReady) onStripeElementReady(elements);
          }}
          onPaymentReady={(ready) => {
            if (onStripePaymentReady) onStripePaymentReady(ready);
          }}
        />
      </div>
    );
  }
  
  // Fallback to manual card fields for Ecrypt or if Stripe Elements not available

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 mb-3">Card information</div>
      
      {/* Name on Card */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Name on card"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
          {...register('cardName', {
            required: showCardFields ? 'Name on card is required' : false
          })}
        />
        {errors.cardName && (
          <p className="text-red-600 text-xs mt-1">{errors.cardName.message as string}</p>
        )}
      </div>

      {/* Card Number */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="1234 1234 1234 1234"
            maxLength={19}
            className="w-full px-3 py-2 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
            {...register('cardNumber', {
              required: showCardFields ? 'Card number is required' : false,
              validate: (value) => {
                if (showCardFields && !value) {
                  return 'Card number is required';
                }
                if (showCardFields && value && !/^[\d\s]{13,19}$/.test(value)) {
                  return 'Please enter a valid card number';
                }
                return true;
              }
            })}
            onInput={(e) => {
              // Format card number with spaces
              let value = e.currentTarget.value.replace(/\s/g, '');
              if (value.length > 0) {
                value = value.match(/.{1,4}/g)?.join(' ') || value;
                e.currentTarget.value = value;
              }
            }}
          />
          {/* Payment Method Logos */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            <div className="w-7 h-4 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">VISA</span>
            </div>
            <div className="w-7 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">MC</span>
            </div>
            <div className="w-7 h-4 bg-blue-700 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AM</span>
            </div>
            <div className="w-7 h-4 bg-gradient-to-r from-blue-600 via-red-500 to-green-500 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">JCB</span>
            </div>
          </div>
        </div>
        {errors.cardNumber && (
          <p className="text-red-600 text-xs mt-1">{errors.cardNumber.message as string}</p>
        )}
      </div>

      {/* Expiration and CVC - Side by Side */}
      <div className="flex gap-3">
        {/* Expiration Date */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="MM / YY"
            maxLength={7}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
            {...register('cardExpiry', {
              required: showCardFields ? 'Expiration date is required' : false,
              validate: (value) => {
                if (showCardFields && !value) {
                  return 'Expiration date is required';
                }
                if (showCardFields && value && !/^(0[1-9]|1[0-2])\s?\/\s?([0-9]{2})$/.test(value)) {
                  return 'Please enter MM/YY format';
                }
                return true;
              }
            })}
            onKeyDown={(e) => {
              // Allow backspace, delete, tab, escape, enter
              if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                  (e.keyCode === 65 && e.ctrlKey === true) ||
                  (e.keyCode === 67 && e.ctrlKey === true) ||
                  (e.keyCode === 86 && e.ctrlKey === true) ||
                  (e.keyCode === 88 && e.ctrlKey === true) ||
                  // Allow home, end, left, right
                  (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
              }
              // Ensure that it is a number and stop the keypress
              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
              }
            }}
            onInput={(e) => {
              // Format expiration date - allow easier typing
              let value = e.currentTarget.value.replace(/\D/g, '');
              if (value.length > 0) {
                if (value.length <= 2) {
                  e.currentTarget.value = value;
                } else {
                  // Add slash after month
                  e.currentTarget.value = value.substring(0, 2) + ' / ' + value.substring(2, 4);
                }
              } else {
                e.currentTarget.value = '';
              }
            }}
          />
          {errors.cardExpiry && (
            <p className="text-red-600 text-xs mt-1">{errors.cardExpiry.message as string}</p>
          )}
        </div>

        {/* CVC */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="CVC"
            maxLength={4}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
            {...register('cardCvc', {
              required: showCardFields ? 'CVC is required' : false,
              validate: (value) => {
                if (showCardFields && !value) {
                  return 'CVC is required';
                }
                if (showCardFields && value && !/^[0-9]{3,4}$/.test(value)) {
                  return 'Please enter a valid CVC';
                }
                return true;
              }
            })}
          />
          {/* CVC Hint Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          {errors.cardCvc && (
            <p className="text-red-600 text-xs mt-1">{errors.cardCvc.message as string}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditCardFields;

