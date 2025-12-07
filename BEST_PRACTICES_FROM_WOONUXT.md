# Best Practices from WooNuxt and Next-WP

## Overview

This document summarizes best practices from **WooNuxt** (Nuxt.js + WooCommerce) and **Next-WP** (Next.js + WordPress) for handling:
- Login/Logout
- Account Pages
- Checkout with Stripe and other payment gateways

## 1. Authentication (Login/Logout)

### WooNuxt Approach

#### Login Mutation
```graphql
mutation login($username: String!, $password: String!) {
  login(
    input: {
      provider: PASSWORD
      credentials: {
        username: $username
        password: $password
      }
    }
  ) {
    authToken
    authTokenExpiration
    refreshToken
    refreshTokenExpiration
    user {
      name
      username
    }
    sessionToken
    customer {
      databaseId
      username
      firstName
      lastName
    }
  }
}
```

**Key Features:**
- Uses `provider: PASSWORD` for username/password authentication
- Returns both JWT tokens (`authToken`, `refreshToken`) and session token
- Returns customer data immediately after login
- Supports OAuth providers (Google, Facebook, etc.)

#### Logout Mutation
```graphql
mutation Logout {
  logout(input: { clientMutationId: "" }) {
    success
  }
}
```

**Implementation Pattern:**
```typescript
async function logoutUser(): Promise<AuthResponse> {
  isPending.value = true;
  try {
    const { logout } = await GqlLogout();
    if (logout) {
      await refreshCart(); // Refresh cart after logout
      clearAllCookies(); // Clear all cookies
      customer.value = { billing: {}, shipping: {} }; // Reset customer state
      clearReturnUrl(); // Clear any stored return URL
    }
    return { success: true };
  } catch (error: any) {
    const errorMsg = getErrorMessage(error);
    return { success: false, error: errorMsg };
  } finally {
    updateViewer(null); // Clear viewer state
    // Redirect based on current route
    if (router.currentRoute.value.path === '/my-account' && viewer.value === null) {
      router.push('/my-account');
    } else {
      router.push('/');
    }
  }
}
```

**Best Practices:**
1. **Clear all state**: Customer, viewer, cart, cookies
2. **Refresh cart**: After logout, refresh cart to clear any session-based cart data
3. **Smart redirect**: Redirect to login page if on account page, otherwise home
4. **Return URL handling**: Store and clear return URLs for post-login redirects

### Current Implementation Comparison

**Your Current Implementation:**
- ✅ Uses `loginWithCookies` mutation (cookie-based auth)
- ✅ Clears cookies, localStorage, sessionStorage
- ✅ Clears Apollo cache
- ✅ Redirects properly

**Improvements from WooNuxt:**
- Consider adding return URL handling for post-login redirects
- Consider refreshing cart after logout
- Consider supporting OAuth providers if needed

---

## 2. Account Pages

### WooNuxt Account Page Structure

**File:** `app/pages/my-account/index.vue`

**Key Features:**
1. **Tab-based navigation** using query parameters (`?tab=my-details`)
2. **Sidebar navigation** with active state management
3. **Conditional rendering** based on authentication status
4. **Post-login redirect handling**

**Structure:**
```vue
<template>
  <div class="container min-h-[600px]">
    <!-- Show login form if not authenticated -->
    <LazyLoginAndRegister v-if="!viewer" />
    
    <!-- Show account dashboard if authenticated -->
    <div v-else class="flex flex-col lg:flex-row">
      <!-- Sidebar Navigation -->
      <div class="lg:sticky top-16 w-full lg:max-w-[260px]">
        <!-- User info with avatar -->
        <section>
          <img :src="avatar" />
          <div>Welcome, {{ viewer?.firstName }}</div>
          <span>{{ viewer?.email }}</span>
        </section>
        
        <!-- Navigation Links -->
        <nav>
          <NuxtLink to="/my-account?tab=my-details" :class="{ active: activeTab == 'my-details' }">
            My Details
          </NuxtLink>
          <NuxtLink to="/my-account?tab=orders">Orders</NuxtLink>
          <NuxtLink to="/my-account?tab=downloads">Downloads</NuxtLink>
          <NuxtLink to="/my-account?tab=wishlist">Wishlist</NuxtLink>
        </nav>
        
        <!-- Logout Button -->
        <button @click="logoutUser">Log out</button>
      </div>
      
      <!-- Main Content Area -->
      <main class="flex-1">
        <AccountMyDetails v-if="activeTab === 'my-details'" />
        <OrderList v-else-if="activeTab === 'orders'" />
        <DownloadList v-else-if="activeTab === 'downloads'" />
        <WishList v-else-if="activeTab === 'wishlist'" />
      </main>
    </div>
  </div>
</template>
```

**Account Details Component:**
```vue
<template>
  <div class="grid gap-8 account-form">
    <PersonalInformation />
    <BillingAndShipping />
    <ChangePassword />
  </div>
</template>
```

**Best Practices:**
1. **Tab-based navigation**: Use query parameters for tabs (`?tab=my-details`)
2. **Lazy loading**: Use `LazyLoginAndRegister` for code splitting
3. **Sticky sidebar**: Keep navigation visible while scrolling
4. **Avatar display**: Show user avatar and welcome message
5. **Mobile responsive**: Different layouts for mobile vs desktop
6. **Component separation**: Separate components for each section (PersonalInformation, BillingAndShipping, ChangePassword)

### Current Implementation Comparison

**Your Current Implementation:**
- ✅ Uses separate routes (`/account`, `/account/orders`, etc.)
- ✅ Has `AccountNavigation` component
- ✅ Has `withAuth` HOC for protection
- ✅ Has separate components for each section

**Improvements from WooNuxt:**
- Consider tab-based navigation for better UX (single page, query params)
- Consider adding avatar display
- Consider lazy loading components
- Consider adding wishlist functionality

---

## 3. Checkout with Stripe

### WooNuxt Stripe Integration

#### Stripe Payment Intent Query
```graphql
query getStripePaymentIntent($stripePaymentMethod: StripePaymentMethodEnum!) {
  stripePaymentIntent(stripePaymentMethod: $stripePaymentMethod) {
    amount
    clientSecret
    error
    id
    currency
  }
}
```

#### Checkout Mutation
```graphql
mutation Checkout(
  $billing: CustomerAddressInput = {}
  $metaData: [MetaDataInput] = { key: "", value: "" }
  $paymentMethod: String = "stripe"
  $shipping: CustomerAddressInput = {}
  $customerNote: String = ""
  $shipToDifferentAddress: Boolean = false
  $account: CreateAccountInput = { username: "", password: "" }
  $transactionId: String = ""
  $isPaid: Boolean = false
) {
  checkout(input: {
    paymentMethod: $paymentMethod
    billing: $billing
    metaData: $metaData
    shipping: $shipping
    customerNote: $customerNote
    shipToDifferentAddress: $shipToDifferentAddress
    account: $account
    transactionId: $transactionId
    isPaid: $isPaid
  }) {
    result
    redirect
    order {
      needsPayment
      needsProcessing
      status
      databaseId
      orderKey
      subtotal
      total
      paymentMethodTitle
      paymentMethod
    }
  }
}
```

#### Stripe Payment Flow

**1. Payment Element (Modern Approach)**
```typescript
// Load Stripe
const stripe = await loadStripe(stripeKey);

// Get payment intent client secret
const { stripePaymentIntent } = await GqlGetStripePaymentIntent({
  stripePaymentMethod: 'PAYMENT'
});
stripeClientSecret.value = stripePaymentIntent?.clientSecret || '';

// Create Stripe Elements
const elements = stripe.elements({
  clientSecret: stripeClientSecret.value
});

// Submit payment
const { error, paymentIntent } = await stripe.confirmPayment({
  elements: elements.value,
  clientSecret: stripeClientSecret.value,
  confirmParams: {
    return_url: `${window.location.origin}/checkout/order-received`,
    payment_method_data: {
      billing_details: {
        name: `${customer.billing.firstName} ${customer.billing.lastName}`,
        email: customer.billing.email,
        address: { ... }
      }
    }
  },
  redirect: 'if_required'
});

// Add metadata to checkout
if (paymentIntent) {
  orderInput.value.metaData.push({ 
    key: '_stripe_payment_intent_id', 
    value: paymentIntent.id 
  });
  orderInput.value.metaData.push({ 
    key: '_stripe_payment_method_id', 
    value: paymentIntent.payment_method 
  });
  orderInput.value.metaData.push({ 
    key: '_stripe_source_id', 
    value: paymentIntent.id 
  });
  orderInput.value.metaData.push({ 
    key: '_stripe_fee', 
    value: '0' 
  });
  orderInput.value.metaData.push({ 
    key: '_stripe_net', 
    value: paymentIntent.amount.toString() 
  });
  orderInput.value.metaData.push({ 
    key: '_stripe_currency', 
    value: paymentIntent.currency 
  });
  orderInput.value.metaData.push({ 
    key: '_stripe_charge_captured', 
    value: 'yes' 
  });
  orderInput.value.metaData.push({ 
    key: '_wc_stripe_payment_method_type', 
    value: 'card' 
  });
  
  isPaid.value = paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing';
  orderInput.value.transactionId = paymentIntent.id;
}
```

**2. Card Element (Legacy Approach)**
```typescript
// Get setup intent
const { stripePaymentIntent } = await GqlGetStripePaymentIntent({
  stripePaymentMethod: 'SETUP'
});
clientSecret = stripePaymentIntent?.clientSecret || '';

// Confirm card setup
const { setupIntent } = await stripe.confirmCardSetup(clientSecret, { 
  payment_method: { card: cardElement } 
});

if (setupIntent) {
  orderInput.value.metaData.push({ 
    key: '_stripe_intent_id', 
    value: setupIntent.id 
  });
  isPaid.value = setupIntent?.status === 'succeeded' || false;
  orderInput.value.transactionId = setupIntent?.id || new Date().getTime().toString();
}
```

#### Checkout Process Flow

```typescript
const processCheckout = async (isPaid = false): Promise<any> => {
  isProcessingOrder.value = true;

  try {
    // 1. Build checkout payload
    const checkoutPayload = buildCheckoutPayload(isPaid);

    // 2. Process checkout
    const { checkout } = await GqlCheckout(checkoutPayload);

    // 3. Handle account creation if requested
    if (orderInput.value.createAccount) {
      await loginUser({ username, password });
    }

    const orderId = checkout?.order?.databaseId;
    const orderKey = checkout?.order?.orderKey;

    // 4. Handle PayPal redirect if needed
    if (checkout?.redirect && isPayPalPayment()) {
      await handlePayPalRedirect(checkout, String(orderId), orderKey);
    } else {
      // 5. Standard redirect to order received page
      router.push(`/checkout/order-received/${orderId}/?key=${orderKey}`);
    }

    // 6. Finalize checkout
    await finalizeCheckout(checkout);

    return checkout;
  } catch (error: any) {
    console.error('Checkout error:', error);
    if (error.message) alert(error.message);
    return null;
  } finally {
    isProcessingOrder.value = false;
  }
};
```

#### Stripe Element Component

**Key Features:**
- Supports both Payment Element (modern) and Card Element (legacy)
- Handles element ready state
- Validates form before submission
- Listens for changes to enable/disable checkout button

**Implementation:**
```vue
<template>
  <div v-if="stripe" id="stripe-element">
    <!-- Payment Element or Card Element -->
  </div>
</template>

<script setup>
const handleStripeElement = (stripeElements: StripeElements): void => {
  elements.value = stripeElements;
  const paymentMethodType = appConfig.stripePaymentMethod || 'payment';

  if (paymentMethodType === 'payment') {
    // Modern Payment Element
    const paymentElement = stripeElements.getElement('payment');
    if (paymentElement) {
      paymentElement.on('change', (event) => {
        isStripeElementReady.value = event.complete;
      });
    }
  } else {
    // Card Element
    const cardElement = stripeElements.getElement('card');
    if (cardElement) {
      cardElement.on('change', (event) => {
        isStripeElementReady.value = event.complete && !event.error;
      });
    }
  }
};
</script>
```

### Current Implementation Comparison

**Your Current Implementation:**
- ✅ Has `PaymentMethod` component that fetches available gateways
- ✅ Has `CreditCardFields` component for card input
- ✅ Uses `CHECKOUT_MUTATION` with payment method

**Improvements from WooNuxt:**
1. **Stripe Payment Intent**: Use GraphQL query to get payment intent client secret
2. **Stripe Elements**: Use `@stripe/stripe-js` and Stripe Elements instead of manual card fields
3. **Payment Metadata**: Add comprehensive Stripe metadata to checkout
4. **Payment Status**: Track `isPaid` status based on payment intent
5. **Error Handling**: Better error handling for payment failures
6. **Payment Element**: Use modern Payment Element for better UX

---

## 4. Payment Gateway Handling

### WooNuxt Payment Gateway Fragment
```graphql
fragment PaymentGateway on PaymentGateway {
  title
  id
  description
}
```

### Payment Options Component

**Features:**
- Displays all enabled payment gateways
- Radio button selection
- Conditional rendering of Stripe Element
- Gateway-specific handling

**Implementation Pattern:**
```vue
<template>
  <div v-if="paymentGateways?.nodes.length">
    <h2>Payment Options</h2>
    <div v-for="gateway in paymentGateways.nodes" :key="gateway.id">
      <label>
        <input 
          type="radio" 
          :value="gateway.id" 
          v-model="selectedPaymentMethod"
        />
        {{ gateway.title }}
      </label>
    </div>
    <!-- Conditionally show Stripe Element -->
    <StripeElement 
      v-if="stripe && selectedPaymentMethod === 'stripe'" 
      :stripe 
      @updateElement="handleStripeElement" 
    />
  </div>
</template>
```

### Current Implementation Comparison

**Your Current Implementation:**
- ✅ Fetches payment gateways from GraphQL
- ✅ Filters by enabled status
- ✅ Conditionally shows credit card fields for Stripe

**Improvements from WooNuxt:**
- Consider using Stripe Elements instead of manual card fields
- Consider adding payment gateway icons/logos
- Consider better visual feedback for selected payment method

---

## 5. Customer Data Management

### WooNuxt Customer Fragment
```graphql
fragment Customer on Customer {
  lastName
  email
  firstName
  username
  databaseId
  sessionToken
  isPayingCustomer
  billing {
    ...Address
  }
  shipping {
    ...Address
  }
}

fragment Address on CustomerAddress {
  address1
  address2
  city
  country
  email
  firstName
  lastName
  phone
  postcode
  company
  state
}
```

### Update Customer Mutation
```graphql
mutation UpdateCustomer($input: UpdateCustomerInput!) {
  updateCustomer(input: $input) {
    customer {
      downloadableItems(first: 100) {
        nodes {
          ...DownloadableItem
        }
      }
    }
  }
}
```

**Best Practices:**
1. **Session Token**: Store and use `sessionToken` for WooCommerce session
2. **Address Fragments**: Reuse address fragments for billing and shipping
3. **Comprehensive Fields**: Include all address fields (company, state, etc.)
4. **Downloadable Items**: Fetch downloadable items with customer data

---

## 6. Key Takeaways and Recommendations

### Authentication
1. ✅ **Current**: Cookie-based auth is good for WordPress
2. 🔄 **Improve**: Add return URL handling for post-login redirects
3. 🔄 **Improve**: Refresh cart after logout
4. 🔄 **Consider**: Support OAuth providers if needed

### Account Pages
1. ✅ **Current**: Separate routes work well
2. 🔄 **Consider**: Tab-based navigation for better UX
3. 🔄 **Add**: Avatar display and welcome message
4. 🔄 **Add**: Lazy loading for better performance

### Checkout & Stripe
1. ⚠️ **Critical**: Implement Stripe Payment Intent query
2. ⚠️ **Critical**: Use Stripe Elements instead of manual card fields
3. ⚠️ **Critical**: Add comprehensive Stripe metadata to checkout
4. 🔄 **Improve**: Better error handling for payment failures
5. 🔄 **Add**: Support for both Payment Element and Card Element
6. 🔄 **Add**: Payment status tracking (`isPaid`)

### Payment Gateways
1. ✅ **Current**: Dynamic gateway fetching is good
2. 🔄 **Improve**: Use Stripe Elements for Stripe payments
3. 🔄 **Add**: Payment gateway icons/logos
4. 🔄 **Add**: Better visual feedback

### Customer Management
1. ✅ **Current**: Update customer mutation is implemented
2. 🔄 **Add**: Session token handling for WooCommerce
3. 🔄 **Add**: Comprehensive address fragments
4. 🔄 **Add**: Downloadable items support

---

## 7. Implementation Priority

### High Priority (Critical for Stripe)
1. **Stripe Payment Intent Query** - Required for Stripe to work properly
2. **Stripe Elements Integration** - Better UX and security
3. **Payment Metadata** - Required for WooCommerce Stripe plugin
4. **Payment Status Tracking** - Ensure orders are marked as paid

### Medium Priority (UX Improvements)
1. **Return URL Handling** - Better post-login experience
2. **Tab-based Account Navigation** - Better UX
3. **Avatar Display** - Personalization
4. **Payment Gateway Icons** - Visual clarity

### Low Priority (Nice to Have)
1. **OAuth Providers** - If needed
2. **Wishlist** - Additional feature
3. **Lazy Loading** - Performance optimization

---

## 8. Code Examples

### Stripe Payment Intent Query (Add to GQL_QUERIES.ts)
```typescript
export const GET_STRIPE_PAYMENT_INTENT = gql`
  query GetStripePaymentIntent($stripePaymentMethod: StripePaymentMethodEnum!) {
    stripePaymentIntent(stripePaymentMethod: $stripePaymentMethod) {
      amount
      clientSecret
      error
      id
      currency
    }
  }
`;
```

### Stripe Elements Component (Create new component)
```typescript
// components/Checkout/StripeElement.component.tsx
"use client";

import { useEffect, useRef } from 'react';
import { loadStripe, StripeElements } from '@stripe/stripe-js';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';

interface StripeElementProps {
  clientSecret: string;
  onElementReady: (elements: StripeElements) => void;
}

const StripeElement = ({ clientSecret, onElementReady }: StripeElementProps) => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentElement 
        onReady={(elements) => onElementReady(elements)}
      />
    </Elements>
  );
};

export default StripeElement;
```

---

## 9. Resources

- **WooNuxt**: https://github.com/woonuxt/woonuxt
- **Stripe Elements**: https://stripe.com/docs/stripe-js
- **WooCommerce GraphQL**: https://github.com/wp-graphql/wp-graphql-woocommerce
- **Stripe WooCommerce Plugin**: https://woocommerce.com/products/woocommerce-gateway-stripe/

---

## 10. Next Steps

1. **Implement Stripe Payment Intent query**
2. **Create Stripe Elements component**
3. **Update checkout flow to use Stripe Elements**
4. **Add comprehensive Stripe metadata**
5. **Test with Stripe test mode**
6. **Add return URL handling for login**
7. **Consider tab-based account navigation**

