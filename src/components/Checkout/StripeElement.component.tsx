"use client";

import { useEffect, useRef, useState } from 'react';
import { loadStripe, Stripe, StripeElements, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripeElementProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onElementReady: (elements: StripeElements) => void;
  onPaymentReady: (ready: boolean) => void;
}

// Stripe publishable key from environment
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

/**
 * Inner component that uses Stripe hooks
 */
const StripePaymentForm = ({ onElementReady, onPaymentReady }: { onElementReady: (elements: StripeElements) => void; onPaymentReady: (ready: boolean) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (elements) {
      onElementReady(elements);
      
      // Listen for changes in the Payment Element
      const paymentElement = elements.getElement('payment');
      if (paymentElement) {
        const handleChange = (event: any) => {
          const ready = event.complete;
          setIsReady(ready);
          onPaymentReady(ready);
        };
        
        paymentElement.on('change', handleChange);
        
        return () => {
          paymentElement.off('change', handleChange);
        };
      }
    }
  }, [elements, onElementReady, onPaymentReady]);

  if (!stripe || !elements) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Loading payment form...</p>
      </div>
    );
  }

  return (
    <div className="stripe-payment-element">
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          fields: {
            billingDetails: {
              name: 'auto',
              email: 'auto',
              phone: 'never',
              address: 'never',
            },
          },
        }}
      />
    </div>
  );
};

/**
 * Stripe Element wrapper component
 * Handles Stripe Elements integration for payment processing
 */
const StripeElement = ({ clientSecret, amount, currency, onElementReady, onPaymentReady }: StripeElementProps) => {
  if (!stripePromise) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.
        </p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Preparing payment form...</p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#000000',
        colorBackground: '#ffffff',
        colorText: '#1a202c',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
        fontSizeBase: '16px', // Ensure readable font size
      },
      rules: {
        '.Input': {
          fontSize: '16px', // Prevent zoom on iOS
          padding: '12px',
        },
        '.Input--focus': {
          borderColor: '#000000',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm onElementReady={onElementReady} onPaymentReady={onPaymentReady} />
    </Elements>
  );
};

export default StripeElement;

