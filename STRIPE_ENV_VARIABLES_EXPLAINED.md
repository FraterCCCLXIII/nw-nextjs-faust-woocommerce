# Why Do We Need Stripe Environment Variables?

## Overview

Two environment variables are required for Stripe integration to work properly:

1. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - **Required for Stripe Elements**
2. `NEXT_PUBLIC_STRIPE_GATEWAY_ID` - **Required to identify Stripe in WooCommerce**

## 1. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

### Why It's Needed

**This is Stripe's client-side API key** that allows your frontend to:
- Load Stripe's JavaScript SDK (`@stripe/stripe-js`)
- Initialize Stripe Elements (the payment form)
- Create payment intents
- Process payments securely

### Where It's Used

```typescript
// src/components/Checkout/StripeElement.component.tsx
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;
```

**Without this key:**
- Stripe Elements won't load
- Payment form won't render
- Users can't enter card details
- Stripe payment processing won't work

### How to Get It

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers → API keys**
3. Copy the **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)

### Security Note

✅ **Safe to expose**: Publishable keys are designed to be used in client-side code
- They're public and visible in your frontend code
- They can only create payment intents, not charge cards directly
- They require a secret key on the backend to actually process payments

---

## 2. NEXT_PUBLIC_STRIPE_GATEWAY_ID

### Why It's Needed

**WooCommerce can have different Stripe gateway IDs** depending on:
- Which Stripe plugin is installed
- How the plugin is configured
- Plugin version

Common values:
- `stripe` (most common, default)
- `stripe_cc`
- `woocommerce_gateway_stripe`
- Custom IDs if multiple Stripe gateways are configured

### Where It's Used

```typescript
// src/components/Checkout/PaymentMethod.component.tsx
const stripeGatewayId = process.env.NEXT_PUBLIC_STRIPE_GATEWAY_ID || 'stripe';

// Check if Stripe is enabled
const isStripeEnabled = enabledGatewayIds.has(stripeGatewayId) || 
                        enabledGatewayIds.has('stripe') || 
                        enabledGatewayIds.has('stripe_cc') ||
                        // ... other checks
```

**Without this:**
- The code might not recognize Stripe as a payment option
- Stripe won't appear in the payment method list
- Even if Stripe is enabled in WooCommerce, it won't show up

### How to Find Your Gateway ID

1. Go to **WordPress Admin → WooCommerce → Settings → Payments**
2. Find your Stripe payment gateway
3. Click on it to view settings
4. Look for **"Gateway ID"** or **"ID"** field
5. Common values:
   - `stripe` (WooCommerce Stripe Payment Gateway plugin)
   - `stripe_cc` (some plugin versions)
   - `woocommerce_gateway_stripe` (older versions)

### Default Value

If not set, the code defaults to `'stripe'`, which works for most installations.

---

## What Happens Without These Variables?

### Without NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

```typescript
// StripeElement.component.tsx
if (!stripePromise) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-700">
        Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY...
      </p>
    </div>
  );
}
```

**Result**: 
- ❌ Stripe payment form won't render
- ❌ Users see an error message
- ❌ Stripe payments are completely unavailable

### Without NEXT_PUBLIC_STRIPE_GATEWAY_ID

**Result**:
- ⚠️ Code defaults to `'stripe'`
- ⚠️ Might work if your gateway ID is actually `'stripe'`
- ❌ Won't work if your gateway ID is different (e.g., `'stripe_cc'`)
- ❌ Stripe won't appear in payment options even if enabled

---

## Example Configuration

### .env.local (for local development)

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
NEXT_PUBLIC_STRIPE_GATEWAY_ID=stripe

# GraphQL
NEXT_PUBLIC_GRAPHQL_URL=https://your-wordpress-site.com/graphql
```

### Coolify Environment Variables

In Coolify, add these in your application's environment variables section:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (or `pk_live_...` for production)
- `NEXT_PUBLIC_STRIPE_GATEWAY_ID` = `stripe` (or your actual gateway ID)

---

## Summary

| Variable | Purpose | Required? | Default |
|----------|---------|-----------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Initialize Stripe SDK and Elements | ✅ **Yes** | None (Stripe won't work) |
| `NEXT_PUBLIC_STRIPE_GATEWAY_ID` | Identify Stripe gateway in WooCommerce | ⚠️ **Recommended** | `'stripe'` (might not match your setup) |

**Bottom Line**: 
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is **absolutely required** - Stripe won't work without it
- `NEXT_PUBLIC_STRIPE_GATEWAY_ID` is **highly recommended** - Set it to match your WooCommerce Stripe gateway ID to ensure Stripe appears as a payment option

---

## Quick Check

To verify your Stripe gateway ID, you can:

1. **Check WooCommerce GraphQL**:
   ```graphql
   query {
     paymentGateways {
       nodes {
         id
         title
         enabled
       }
     }
   }
   ```
   Look for the Stripe gateway and note its `id` field.

2. **Check WordPress Database** (if you have access):
   ```sql
   SELECT option_value 
   FROM wp_options 
   WHERE option_name LIKE '%stripe%gateway%';
   ```

3. **Check Plugin Settings**: Most Stripe plugins show the gateway ID in their settings page.

