// Imports
import {
  SubmitHandler,
  useForm,
  useFormContext,
  FormProvider,
} from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';

// Components
import { InputField } from '@/components/Input/InputField.component';
import Button from '../UI/Button.component';
import CheckoutLogin from './CheckoutLogin.component';
import CreateAccountCheckbox from './CreateAccountCheckbox.component';
import PaymentMethod from './PaymentMethod.component';
import CreditCardFields from './CreditCardFields.component';
import StateField from './StateField.component';
import BillingAddressCheckbox from './BillingAddressCheckbox.component';
import BillingAddressFields from './BillingAddressFields.component';

// GraphQL
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';
import { getApolloAuthClient } from '@faustwp/core';

// Constants
import { INPUT_FIELDS } from '@/utils/constants/INPUT_FIELDS';
import { ICheckoutDataProps } from '@/utils/functions/functions';

interface IBillingProps {
  handleFormSubmit: SubmitHandler<ICheckoutDataProps>;
  onStripeClientSecret?: (secret: string) => void;
  onStripeElements?: (elements: any) => void;
  onStripePaymentReady?: (ready: boolean) => void;
  isProcessingStripe?: boolean;
}

const OrderButton = ({ isProcessingStripe }: { isProcessingStripe?: boolean }) => {
  const { register, formState: { errors }, watch } = useFormContext();
  const paymentMethod = watch('paymentMethod');

  return (
    <div className="w-full">
      
      {/* Terms Checkbox in Grey Border Container */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 cursor-pointer accent-black flex-shrink-0"
            {...register('termsAccepted', { 
              required: 'You must accept the terms and conditions to proceed' 
            })}
          />
          <span className="ml-3 text-sm text-gray-700">
            I have read, understood and agreed with your Terms of Service and Waiver Agreement. I certify that these products will not be used on humans.
          </span>
        </label>
        {errors.termsAccepted && (
          <p className="text-red-600 text-sm mt-2 ml-7">
            {errors.termsAccepted.message as string}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <Button type="submit" disabled={isProcessingStripe}>
          {isProcessingStripe ? 'PROCESSING PAYMENT...' : 'PLACE ORDER'}
        </Button>
      </div>
    </div>
  );
};

const Billing = ({ 
  handleFormSubmit, 
  onStripeClientSecret, 
  onStripeElements, 
  onStripePaymentReady,
  isProcessingStripe = false 
}: IBillingProps) => {
  const methods = useForm<ICheckoutDataProps>();
  const email = methods.watch('email') || '';
  const [stripeClientSecret, setStripeClientSecret] = useState<string>('');
  const [stripeElements, setStripeElements] = useState<any>(null);
  const [stripePaymentReady, setStripePaymentReady] = useState<boolean>(false);
  const [fieldsPopulated, setFieldsPopulated] = useState(false);
  
  // Query user data to auto-populate form using Faust.js authenticated client
  const authClient = getApolloAuthClient(); // Get authenticated Apollo client from Faust.js
  const { data: userData, loading: userDataLoading, error: userDataError, refetch: refetchUser } = useQuery(GET_CURRENT_USER, {
    client: authClient, // Use authenticated client - automatically includes auth tokens
    errorPolicy: 'all',
    fetchPolicy: 'network-only', // Always fetch from network to ensure fresh data
    notifyOnNetworkStatusChange: true,
  });

  // Debug logging - check cookies and query state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie;
      const cookieNames = cookies.split(';').map(c => c.split('=')[0].trim()).filter(c => c);
      console.log('[Billing] Cookies available:', {
        cookieString: cookies,
        cookieNames,
        hasWordPressCookie: cookies.includes('wordpress_logged_in') || cookies.includes('wp_'),
        hasWooCommerceCookie: cookies.includes('woocommerce'),
      });
    }
    
    console.log('[Billing] User data query state:', {
      hasData: !!userData,
      loading: userDataLoading,
      error: userDataError,
      customer: userData?.customer,
      customerId: userData?.customer?.id,
      customerEmail: userData?.customer?.email,
      customerFirstName: userData?.customer?.firstName,
      customerLastName: userData?.customer?.lastName,
      hasBilling: !!userData?.customer?.billing,
      hasShipping: !!userData?.customer?.shipping,
      billing: userData?.customer?.billing,
      shipping: userData?.customer?.shipping,
      isGuest: userData?.customer?.id === 'guest' || userData?.customer?.id === 'cGd1ZXN0',
    });
    
    // Log full customer object for debugging
    if (userData?.customer) {
      console.log('[Billing] Full customer object:', JSON.stringify(userData.customer, null, 2));
    }
  }, [userData, userDataLoading, userDataError]);

  const customer = userData?.customer;
  const isLoggedIn = !!customer && customer?.id !== 'guest' && customer?.id !== 'cGd1ZXN0';
  const isGuest = customer?.id === 'guest' || customer?.id === 'cGd1ZXN0';
  
  // Debug logged in status
  useEffect(() => {
    console.log('[Billing] Login status:', {
      isLoggedIn,
      hasCustomer: !!customer,
      customerId: customer?.id,
      isGuest,
    });
  }, [isLoggedIn, customer, isGuest]);

  // Note: We don't auto-clear cache here because:
  // 1. It causes errors when called during active queries
  // 2. HttpOnly cookies (wordpress_logged_in) aren't visible to JavaScript
  // 3. The login flow in CheckoutLogin already handles cache clearing
  // If user data doesn't update after login, it's likely a backend/cookie issue
  
  // Auto-populate form fields from user data when logged in
  useEffect(() => {
    console.log('[Billing] Field population effect triggered:', {
      isLoggedIn,
      hasCustomer: !!customer,
      fieldsPopulated,
      shouldPopulate: isLoggedIn && customer && !fieldsPopulated,
    });

    if (isLoggedIn && customer && !fieldsPopulated) {
      console.log('[Billing] Starting field population...');
      console.log('[Billing] Full customer object:', JSON.stringify(customer, null, 2));
      console.log('[Billing] Populating form fields from customer data:', {
        hasCustomer: !!customer,
        customerId: customer.id,
        customerEmail: customer.email,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        hasBilling: !!customer.billing,
        hasShipping: !!customer.shipping,
        billing: customer.billing,
        shipping: customer.shipping,
      });

      const billing = customer.billing;
      const shipping = customer.shipping;
      
      console.log('[Billing] Billing data:', {
        hasBilling: !!billing,
        billingFirstName: billing?.firstName,
        billingLastName: billing?.lastName,
        billingAddress1: billing?.address1,
        billingCity: billing?.city,
        billingState: billing?.state,
        billingPostcode: billing?.postcode,
        billingPhone: billing?.phone,
        billingEmail: billing?.email,
      });
      
      console.log('[Billing] Shipping data:', {
        hasShipping: !!shipping,
        shippingFirstName: shipping?.firstName,
        shippingLastName: shipping?.lastName,
        shippingAddress1: shipping?.address1,
        shippingCity: shipping?.city,
        shippingState: shipping?.state,
        shippingPostcode: shipping?.postcode,
      });
      
      // Populate email from customer (always use customer email if available)
      if (customer.email) {
        const currentEmail = methods.getValues('email');
        console.log('[Billing] Email check:', {
          customerEmail: customer.email,
          currentEmail,
          isEmpty: !currentEmail || currentEmail.trim() === '',
        });
        if (!currentEmail || currentEmail.trim() === '') {
          methods.setValue('email', customer.email, { shouldValidate: false });
          console.log('[Billing] ✅ Populated email:', customer.email);
        } else {
          console.log('[Billing] ⏭️ Skipped email (already has value):', currentEmail);
        }
      } else {
        console.log('[Billing] ⚠️ No customer email available');
      }
      
      // Populate shipping fields (prefer shipping address, fallback to billing)
      const addressSource = (shipping?.address1 || shipping?.city) ? shipping : billing;
      
      console.log('[Billing] Address source selection:', {
        hasShippingAddress1: !!shipping?.address1,
        hasShippingCity: !!shipping?.city,
        hasBillingAddress1: !!billing?.address1,
        hasBillingCity: !!billing?.city,
        selectedSource: addressSource === shipping ? 'shipping' : 'billing',
        addressSourceData: addressSource,
      });
      
      if (addressSource) {
        console.log('[Billing] ✅ Using address source:', addressSource === shipping ? 'shipping' : 'billing');
        
        // Always populate if field is empty, or if we have data from customer
        const currentFirstName = methods.getValues('firstName');
        if (addressSource.firstName && (!currentFirstName || currentFirstName.trim() === '')) {
          methods.setValue('firstName', addressSource.firstName, { shouldValidate: false });
          console.log('[Billing] ✅ Populated firstName:', addressSource.firstName);
        } else {
          console.log('[Billing] ⏭️ Skipped firstName:', { 
            hasValue: !!addressSource.firstName, 
            currentValue: currentFirstName 
          });
        }
        
        const currentLastName = methods.getValues('lastName');
        if (addressSource.lastName && (!currentLastName || currentLastName.trim() === '')) {
          methods.setValue('lastName', addressSource.lastName, { shouldValidate: false });
          console.log('[Billing] ✅ Populated lastName:', addressSource.lastName);
        } else {
          console.log('[Billing] ⏭️ Skipped lastName:', { 
            hasValue: !!addressSource.lastName, 
            currentValue: currentLastName 
          });
        }
        
        const currentAddress1 = methods.getValues('address1');
        if (addressSource.address1 && (!currentAddress1 || currentAddress1.trim() === '')) {
          methods.setValue('address1', addressSource.address1, { shouldValidate: false });
          console.log('[Billing] ✅ Populated address1:', addressSource.address1);
        } else {
          console.log('[Billing] ⏭️ Skipped address1:', { 
            hasValue: !!addressSource.address1, 
            currentValue: currentAddress1 
          });
        }
        
        const currentCity = methods.getValues('city');
        if (addressSource.city && (!currentCity || currentCity.trim() === '')) {
          methods.setValue('city', addressSource.city, { shouldValidate: false });
          console.log('[Billing] ✅ Populated city:', addressSource.city);
        } else {
          console.log('[Billing] ⏭️ Skipped city:', { 
            hasValue: !!addressSource.city, 
            currentValue: currentCity 
          });
        }
        
        const currentState = methods.getValues('state');
        if (addressSource.state && (!currentState || currentState.trim() === '')) {
          methods.setValue('state', addressSource.state, { shouldValidate: false });
          console.log('[Billing] ✅ Populated state:', addressSource.state);
        } else {
          console.log('[Billing] ⏭️ Skipped state:', { 
            hasValue: !!addressSource.state, 
            currentValue: currentState 
          });
        }
        
        const currentPostcode = methods.getValues('postcode');
        if (addressSource.postcode && (!currentPostcode || currentPostcode.trim() === '')) {
          methods.setValue('postcode', addressSource.postcode, { shouldValidate: false });
          console.log('[Billing] ✅ Populated postcode:', addressSource.postcode);
        } else {
          console.log('[Billing] ⏭️ Skipped postcode:', { 
            hasValue: !!addressSource.postcode, 
            currentValue: currentPostcode 
          });
        }
        
        // Phone can come from billing if not in shipping
        const phoneSource = addressSource.phone || billing?.phone;
        const currentPhone = methods.getValues('phone');
        if (phoneSource && (!currentPhone || currentPhone.trim() === '')) {
          methods.setValue('phone', phoneSource, { shouldValidate: false });
          console.log('[Billing] ✅ Populated phone:', phoneSource);
        } else {
          console.log('[Billing] ⏭️ Skipped phone:', { 
            hasValue: !!phoneSource, 
            currentValue: currentPhone 
          });
        }
      }
      
      // Always populate billing fields from customer.billing if available
      if (billing) {
        console.log('[Billing] ✅ Populating billing fields from customer.billing');
        console.log('[Billing] Billing data available:', {
          firstName: billing.firstName,
          lastName: billing.lastName,
          address1: billing.address1,
          city: billing.city,
          state: billing.state,
          postcode: billing.postcode,
        });
        
        const currentBillingFirstName = methods.getValues('billingFirstName');
        if (billing.firstName && (!currentBillingFirstName || currentBillingFirstName.trim() === '')) {
          methods.setValue('billingFirstName', billing.firstName, { shouldValidate: false });
          console.log('[Billing] ✅ Populated billingFirstName:', billing.firstName);
        } else {
          console.log('[Billing] ⏭️ Skipped billingFirstName:', { 
            hasValue: !!billing.firstName, 
            currentValue: currentBillingFirstName 
          });
        }
        
        const currentBillingLastName = methods.getValues('billingLastName');
        if (billing.lastName && (!currentBillingLastName || currentBillingLastName.trim() === '')) {
          methods.setValue('billingLastName', billing.lastName, { shouldValidate: false });
          console.log('[Billing] ✅ Populated billingLastName:', billing.lastName);
        } else {
          console.log('[Billing] ⏭️ Skipped billingLastName:', { 
            hasValue: !!billing.lastName, 
            currentValue: currentBillingLastName 
          });
        }
        
        const currentBillingAddress1 = methods.getValues('billingAddress1');
        if (billing.address1 && (!currentBillingAddress1 || currentBillingAddress1.trim() === '')) {
          methods.setValue('billingAddress1', billing.address1, { shouldValidate: false });
          console.log('[Billing] ✅ Populated billingAddress1:', billing.address1);
        } else {
          console.log('[Billing] ⏭️ Skipped billingAddress1:', { 
            hasValue: !!billing.address1, 
            currentValue: currentBillingAddress1 
          });
        }
        
        const currentBillingCity = methods.getValues('billingCity');
        if (billing.city && (!currentBillingCity || currentBillingCity.trim() === '')) {
          methods.setValue('billingCity', billing.city, { shouldValidate: false });
          console.log('[Billing] ✅ Populated billingCity:', billing.city);
        } else {
          console.log('[Billing] ⏭️ Skipped billingCity:', { 
            hasValue: !!billing.city, 
            currentValue: currentBillingCity 
          });
        }
        
        const currentBillingState = methods.getValues('billingState');
        if (billing.state && (!currentBillingState || currentBillingState.trim() === '')) {
          methods.setValue('billingState', billing.state, { shouldValidate: false });
          console.log('[Billing] ✅ Populated billingState:', billing.state);
        } else {
          console.log('[Billing] ⏭️ Skipped billingState:', { 
            hasValue: !!billing.state, 
            currentValue: currentBillingState 
          });
        }
        
        const currentBillingPostcode = methods.getValues('billingPostcode');
        if (billing.postcode && (!currentBillingPostcode || currentBillingPostcode.trim() === '')) {
          methods.setValue('billingPostcode', billing.postcode, { shouldValidate: false });
          console.log('[Billing] ✅ Populated billingPostcode:', billing.postcode);
        } else {
          console.log('[Billing] ⏭️ Skipped billingPostcode:', { 
            hasValue: !!billing.postcode, 
            currentValue: currentBillingPostcode 
          });
        }
      } else {
        console.log('[Billing] ⚠️ No billing data available from customer');
      }
      
      console.log('[Billing] ✅ Form fields populated - setting fieldsPopulated to true');
      setFieldsPopulated(true);
    } else {
      console.log('[Billing] ⏭️ Skipping field population:', {
        isLoggedIn,
        hasCustomer: !!customer,
        fieldsPopulated,
        reason: !isLoggedIn ? 'not logged in' : !customer ? 'no customer data' : 'already populated',
      });
    }
  }, [isLoggedIn, customer, fieldsPopulated]);

  // Reset fieldsPopulated when customer data changes (e.g., after login)
  useEffect(() => {
    if (isLoggedIn && customer && fieldsPopulated) {
      // Check if customer data has actually changed by comparing key fields
      const currentEmail = methods.getValues('email');
      if (customer.email && currentEmail !== customer.email) {
        console.log('[Billing] Customer data changed, resetting population flag');
        setFieldsPopulated(false);
      }
    }
  }, [customer?.email, customer?.id, isLoggedIn, fieldsPopulated]);

  // Handle login success - refetch user data and populate fields
  const handleLoginSuccess = async () => {
    const { data: newUserData } = await refetchUser();
    if (newUserData?.customer) {
      setFieldsPopulated(false); // Reset to trigger population
    }
  };

  // Handle account creation success - same as login success
  const handleAccountCreated = async () => {
    await handleLoginSuccess();
  };
  
  // Pass Stripe data to parent
  useEffect(() => {
    if (onStripeClientSecret && stripeClientSecret) {
      onStripeClientSecret(stripeClientSecret);
    }
  }, [stripeClientSecret, onStripeClientSecret]);
  
  useEffect(() => {
    if (onStripeElements && stripeElements) {
      onStripeElements(stripeElements);
    }
  }, [stripeElements, onStripeElements]);
  
  useEffect(() => {
    if (onStripePaymentReady !== undefined) {
      onStripePaymentReady(stripePaymentReady);
    }
  }, [stripePaymentReady, onStripePaymentReady]);

  return (
    <section className="text-gray-700">
      <FormProvider {...methods}>
        {/* Login Section - Outside form to avoid nested forms */}
        <CheckoutLogin onLoginSuccess={handleLoginSuccess} />
        
        <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
          {/* Compact Form Fields - Side by Side, No Top Labels */}
          <div className="space-y-3 mb-6">
            {/* Email - Full Width */}
            {INPUT_FIELDS.filter(field => field.name === 'email').map(({ id, label, name, customValidation }) => (
              <InputField
                key={id}
                inputLabel={label}
                inputName={name}
                customValidation={customValidation}
                className="w-full"
              />
            ))}

            {/* Shipping Information Heading */}
            <div className="text-sm text-gray-600 mb-3">Shipping Information</div>

            {/* First Name and Last Name - Side by Side */}
            <div className="flex gap-3">
              {INPUT_FIELDS.filter(field => field.name === 'firstName' || field.name === 'lastName').map(({ id, label, name, customValidation }) => (
                <InputField
                  key={id}
                  inputLabel={label}
                  inputName={name}
                  customValidation={customValidation}
                />
              ))}
            </div>

            {/* Address - Full Width */}
            {INPUT_FIELDS.filter(field => field.name === 'address1').map(({ id, label, name, customValidation }) => (
              <InputField
                key={id}
                inputLabel={label}
                inputName={name}
                customValidation={customValidation}
                className="w-full"
              />
            ))}

            {/* City, State, and Postal Code - Side by Side */}
            <div className="flex gap-3">
              {INPUT_FIELDS.filter(field => field.name === 'city').map(({ id, label, name, customValidation }) => (
                <InputField
                  key={id}
                  inputLabel={label}
                  inputName={name}
                  customValidation={customValidation}
                />
              ))}
              <StateField />
              {INPUT_FIELDS.filter(field => field.name === 'postcode').map(({ id, label, name, customValidation }) => (
                <InputField
                  key={id}
                  inputLabel={label}
                  inputName={name}
                  customValidation={customValidation}
                />
              ))}
            </div>

            {/* Phone - Full Width */}
            {INPUT_FIELDS.filter(field => field.name === 'phone').map(({ id, label, name, customValidation }) => (
              <InputField
                key={id}
                inputLabel={label}
                inputName={name}
                customValidation={customValidation}
                className="w-full"
              />
            ))}
          </div>

          {/* Create Account During Checkout */}
          {email && !isLoggedIn && (
            <CreateAccountCheckbox
              email={email}
              firstName={methods.watch('firstName')}
              lastName={methods.watch('lastName')}
              onAccountCreated={handleAccountCreated}
            />
          )}

          {/* Payment Method */}
          <PaymentMethod 
            onStripeClientSecret={setStripeClientSecret}
            onStripeElementReady={setStripePaymentReady}
          />

          {/* Credit Card Fields - Stripe Elements or manual fields */}
          <CreditCardFields 
            stripeClientSecret={stripeClientSecret}
            onStripeElementReady={setStripeElements}
            onStripePaymentReady={setStripePaymentReady}
          />

          {/* Billing Address Checkbox */}
          <BillingAddressCheckbox />

          {/* Billing Address Fields - Show when checkbox is unchecked */}
          <BillingAddressFields />

          {/* Order Button */}
          <OrderButton isProcessingStripe={isProcessingStripe} />
        </form>
      </FormProvider>
    </section>
  );
};

export default Billing;
