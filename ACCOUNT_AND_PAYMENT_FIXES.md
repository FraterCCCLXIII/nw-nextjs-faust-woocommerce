# Account and Payment Gateway Fixes

## Issues Fixed

### 1. Payment Gateways Not Appearing (Stripe & Cash on Delivery)

**Problem**: Stripe (test mode) and Cash on Delivery were enabled in WooCommerce but not appearing in the checkout.

**Root Cause**: 
- The GraphQL query was not properly handling errors
- No debugging information was available to diagnose issues
- The query might not be returning enabled gateways correctly

**Fixes Applied**:
1. Added comprehensive error handling and debugging logs to `PaymentMethod.component.tsx`
2. Added `fetchPolicy: 'network-only'` to ensure fresh data
3. Added debug logging in development mode to show:
   - All gateways returned from GraphQL
   - Which gateways are enabled
   - Gateway IDs for troubleshooting
4. Improved error messages with helpful troubleshooting information

**Backend Settings to Check**:
1. **WooCommerce Payment Settings**:
   - Go to WordPress Admin → WooCommerce → Settings → Payments
   - Verify that "Stripe" is enabled (check the toggle switch)
   - Verify that "Cash on Delivery" or "Bank Transfer (BACS)" is enabled
   - For Stripe, ensure test mode is properly configured if using test mode

2. **GraphQL Query Verification**:
   - The query `GET_AVAILABLE_PAYMENT_GATEWAYS` should return all enabled gateways
   - Check browser console in development mode for debug logs showing gateway IDs
   - Common Stripe gateway IDs: `stripe`, `stripe_cc`, `woocommerce_gateway_stripe`
   - Cash on Delivery IDs: `cod`, `bacs`

3. **Environment Variable**:
   - Ensure `NEXT_PUBLIC_STRIPE_GATEWAY_ID` is set correctly if your Stripe gateway has a custom ID
   - Default is `stripe` (matches webhook URL format `wc-api=wc_stripe`)

**If Still Not Working**:
- Check browser console for GraphQL errors
- Verify the payment gateways are actually enabled in WooCommerce admin
- Check if the GraphQL endpoint has proper permissions to query payment gateways
- Some payment gateways may require specific WooCommerce settings to be "available" (e.g., currency, country restrictions)

---

### 2. Account Details Not Editable

**Problem**: Account details page showed fields but clicking "Edit" didn't work properly, and changes couldn't be saved.

**Root Cause**:
- Component was setting state during render (causing infinite re-renders)
- No actual GraphQL mutation to update customer data
- Form state management was broken

**Fixes Applied**:
1. Fixed state initialization using `useEffect` instead of setting state during render
2. Added `UPDATE_CUSTOMER` GraphQL mutation to `GQL_MUTATIONS.ts`
3. Implemented proper form submission with mutation
4. Added loading states, success messages, and error handling
5. Added password validation (minimum 8 characters, matching confirmation)
6. Added form reset on cancel

**Backend Requirements**:
- The `updateCustomer` mutation must be available in your WooCommerce GraphQL schema
- This is provided by `wp-graphql-woocommerce` plugin
- No additional backend configuration needed if the plugin is installed and active

**How It Works Now**:
1. User clicks "Edit account details"
2. Form fields become editable
3. User can update:
   - First name
   - Last name
   - Email address
   - Password (optional, requires current password if changing)
4. On save, mutation is called and customer data is updated
5. Success/error messages are displayed
6. Form data is refreshed from server

---

### 3. Addresses Not Editable

**Problem**: Addresses page showed placeholder text with "Edit" buttons that didn't work.

**Root Cause**:
- No edit functionality implemented
- No form for editing addresses
- No mutation to update addresses

**Fixes Applied**:
1. Updated `GET_CURRENT_USER` query to include billing and shipping addresses
2. Created full address editing forms for both billing and shipping
3. Integrated with `UPDATE_CUSTOMER` mutation to save addresses
4. Added proper form validation
5. Added display of existing addresses when available
6. Added "Add" button when no address exists, "Edit" when address exists

**Backend Requirements**:
- Same as Account Details - requires `updateCustomer` mutation from `wp-graphql-woocommerce`
- No additional configuration needed

**How It Works Now**:
1. User sees billing and shipping address sections
2. If address exists, it's displayed; if not, shows "You have not set up this type of address yet"
3. User clicks "Edit" or "Add" button
4. Form appears with all address fields:
   - First name, Last name
   - Address line 1, Address line 2
   - City, Postcode
   - Country, State
   - Email, Phone (billing only)
5. User fills form and clicks "Save address"
6. Address is saved via GraphQL mutation
7. Success message appears and form closes
8. Updated address is displayed

---

### 4. Logout Not Working Properly

**Problem**: Logout button didn't properly clear the session, user remained logged in.

**Root Cause**:
- No GraphQL logout mutation was being called
- Only client-side redirect, no server-side session clearing
- Apollo cache wasn't being cleared

**Fixes Applied**:
1. Added `LOGOUT_USER` GraphQL mutation to `GQL_MUTATIONS.ts`
2. Updated `logout()` function in `auth.ts` to:
   - Call logout mutation to clear server-side session
   - Clear Apollo cache and reset store
   - Clear localStorage and sessionStorage
   - Redirect to home page with success parameter
3. Added proper error handling (continues with client-side cleanup if mutation fails)

**Backend Requirements**:
- The `logout` mutation must be available in your GraphQL schema
- This is typically provided by:
  - `wp-graphql` core plugin (basic logout)
  - `wp-graphql-cors` plugin (enhanced logout with cookie clearing)
- If logout mutation is not available, the function will still work but only clears client-side state

**How It Works Now**:
1. User clicks "Log out" button
2. Logout mutation is called to clear server-side session
3. All client-side storage is cleared (cookies, localStorage, sessionStorage)
4. Apollo cache is cleared and reset
5. User is redirected to home page
6. User is now fully logged out

**If Logout Still Doesn't Work**:
- Check if `logout` mutation exists in your GraphQL schema
- Install/activate `wp-graphql-cors` plugin for enhanced logout functionality
- Check browser console for any errors during logout
- Verify cookies are being cleared (check browser DevTools → Application → Cookies)

---

## Testing Checklist

### Payment Gateways
- [ ] Stripe appears in checkout when enabled in WooCommerce
- [ ] Cash on Delivery appears when enabled
- [ ] Only enabled gateways are shown
- [ ] Error messages appear if query fails
- [ ] Debug logs appear in console (development mode)

### Account Details
- [ ] Can click "Edit account details" button
- [ ] Form fields become editable
- [ ] Can update first name, last name, email
- [ ] Can change password (with validation)
- [ ] Success message appears on save
- [ ] Changes persist after page refresh
- [ ] Cancel button resets form

### Addresses
- [ ] Billing address section displays correctly
- [ ] Shipping address section displays correctly
- [ ] Can click "Edit" or "Add" button
- [ ] Form appears with all fields
- [ ] Can save billing address
- [ ] Can save shipping address
- [ ] Success message appears on save
- [ ] Addresses persist after page refresh

### Logout
- [ ] Can click "Log out" button
- [ ] User is redirected to home page
- [ ] User is logged out (cannot access account pages)
- [ ] Session is cleared (cannot access protected routes)
- [ ] No errors in console

---

## GraphQL Mutations Added

### UPDATE_CUSTOMER
```graphql
mutation UpdateCustomer($input: UpdateCustomerInput!) {
  updateCustomer(input: $input) {
    customer {
      id
      email
      firstName
      lastName
      username
      billing { ... }
      shipping { ... }
    }
  }
}
```

### LOGOUT_USER
```graphql
mutation Logout {
  logout {
    status
  }
}
```

---

## Environment Variables

- `NEXT_PUBLIC_STRIPE_GATEWAY_ID` - Optional, defaults to `stripe`. Set this if your Stripe gateway has a custom ID.

---

## Troubleshooting

### Payment Gateways Still Not Showing
1. Check WooCommerce → Settings → Payments - ensure gateways are enabled
2. Check browser console for GraphQL errors
3. Verify GraphQL endpoint is accessible
4. Check if gateways have country/currency restrictions
5. In development mode, check console logs for gateway IDs

### Account Updates Fail
1. Verify `updateCustomer` mutation exists in GraphQL schema
2. Check browser console for mutation errors
3. Verify user is logged in (mutation requires authentication)
4. Check if fields being updated are allowed by WooCommerce

### Logout Doesn't Clear Session
1. Verify `logout` mutation exists in GraphQL schema
2. Install/activate `wp-graphql-cors` plugin
3. Check browser console for errors
4. Verify cookies are being cleared in DevTools
5. Check if CORS is properly configured for cookie-based auth

---

## Notes

- All fixes maintain backward compatibility
- Error handling is comprehensive with user-friendly messages
- Development mode includes additional debugging information
- All mutations include proper error handling and loading states

