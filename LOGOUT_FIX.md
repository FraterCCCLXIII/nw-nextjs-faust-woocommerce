# Logout Functionality Fix

## Problem
The logout button was not fully working - users remained logged in after clicking logout.

## Root Causes Identified

1. **Missing Cookie Clearing**: WordPress uses cookie-based authentication, and the logout function wasn't properly clearing all WordPress/WooCommerce session cookies
2. **WooCommerce Session Not Cleared**: The WooCommerce session stored in localStorage (`woo-session`) wasn't being cleared
3. **Incomplete Cleanup Order**: The cleanup steps weren't in the optimal order, and some steps might not complete before redirect

## Fixes Applied

### 1. Added Comprehensive Cookie Clearing
- Added `clearAllCookies()` function that:
  - Identifies all cookies in the browser
  - Clears WordPress-specific cookies (e.g., `wordpress_logged_in_*`, `wordpress_*`, `wp_*`)
  - Clears WooCommerce cookies (e.g., `woocommerce_session_*`, `woocommerce_cart_*`)
  - Attempts to clear cookies with multiple path/domain combinations to ensure they're removed
  - Handles cookies with different security flags (secure, SameSite)

### 2. Proper Cleanup Sequence
The logout now follows this sequence:
1. **Call logout mutation** - Clears server-side session (if available)
2. **Clear WooCommerce session** - Removes `woo-session` and `woocommerce-cart` from localStorage
3. **Clear all cookies** - Removes all WordPress/WooCommerce cookies
4. **Clear Apollo cache** - Clears GraphQL cache and resets store
5. **Clear all storage** - Removes remaining localStorage and sessionStorage
6. **Redirect** - Redirects to home page with timestamp to prevent caching

### 3. Enhanced Error Handling
- Even if the logout mutation fails, all client-side cleanup still happens
- Comprehensive error handling ensures redirect always occurs
- Added delays to ensure cleanup completes before redirect

## Code Changes

### Updated `src/utils/auth.ts`

**Added:**
- `clearAllCookies()` function for comprehensive cookie clearing
- Proper cleanup sequence
- WooCommerce session clearing
- Enhanced error handling

**Key improvements:**
```typescript
// Now clears WooCommerce session first
localStorage.removeItem('woo-session');
localStorage.removeItem('woocommerce-cart');

// Then clears all cookies
clearAllCookies();

// Then clears Apollo cache
await client.clearStore();
await client.resetStore();

// Finally clears all storage and redirects
localStorage.clear();
sessionStorage.clear();
window.location.replace('/?logout=success&t=' + Date.now());
```

## Backend Requirements

### WordPress/GraphQL Configuration

1. **Logout Mutation Must Be Enabled**
   - The `logout` mutation must be available in your GraphQL schema
   - This is typically provided by:
     - `wp-graphql-cors` plugin (recommended) - provides enhanced logout with cookie clearing
     - `wp-graphql` core plugin - provides basic logout mutation

2. **Enable Logout Mutation in wp-graphql-cors**
   - Go to WordPress Admin → GraphQL → Settings → CORS Settings
   - Enable "Add logout mutation for destroying user session"
   - Ensure "Send site credentials" is also enabled

3. **Cookie Settings**
   - Ensure cookies are set with proper domain/path
   - If using cross-domain setup, ensure SameSite and Secure flags are configured correctly

## Testing Checklist

After deploying the fix, test the following:

- [ ] Click "Log out" button
- [ ] User is redirected to home page
- [ ] User cannot access `/account` pages (should redirect to login)
- [ ] Browser DevTools → Application → Cookies shows no WordPress/WooCommerce cookies
- [ ] Browser DevTools → Application → Local Storage shows no `woo-session` or `woocommerce-cart`
- [ ] Browser DevTools → Application → Session Storage is empty
- [ ] After logout, attempting to access account pages redirects to login
- [ ] No errors in browser console during logout
- [ ] User can log in again after logout

## Troubleshooting

### Logout Still Doesn't Work

1. **Check if logout mutation exists:**
   - Open browser DevTools → Network tab
   - Click logout button
   - Look for GraphQL request to `/graphql`
   - Check if mutation is `logout` and if it returns success
   - If mutation doesn't exist, enable it in wp-graphql-cors settings

2. **Check cookies:**
   - Open DevTools → Application → Cookies
   - Before logout, note all WordPress/WooCommerce cookies
   - After logout, verify they're all gone
   - If cookies remain, check cookie domain/path settings

3. **Check console logs:**
   - Open browser console
   - Click logout
   - Look for `[Auth]` log messages
   - Should see: "Starting logout process", "Logout mutation successful", "Cookies cleared", etc.
   - If errors appear, note them for debugging

4. **Verify Apollo cache is cleared:**
   - After logout, try accessing account page
   - Should redirect to login immediately
   - If it shows cached data, Apollo cache might not be clearing properly

### Common Issues

**Issue: User can still access account pages after logout**
- **Cause**: Cookies not being cleared properly
- **Solution**: Check cookie domain/path, ensure `clearAllCookies()` is working

**Issue: Logout mutation fails**
- **Cause**: Mutation not enabled in wp-graphql-cors
- **Solution**: Enable logout mutation in WordPress admin settings

**Issue: User redirected but still logged in**
- **Cause**: Server-side session not cleared
- **Solution**: Ensure logout mutation is working, check WordPress session handling

## Additional Notes

- The logout function now includes comprehensive error handling
- Even if some steps fail, cleanup continues and user is redirected
- All cleanup happens before redirect to ensure proper logout
- Timestamp is added to redirect URL to prevent browser caching
- `window.location.replace()` is used instead of `push()` to prevent back button from going to account page

## Related Files

- `src/utils/auth.ts` - Logout function implementation
- `src/components/User/AccountNavigation.component.tsx` - Logout button component
- `src/utils/gql/GQL_MUTATIONS.ts` - Logout mutation definition
- `src/components/User/withAuth.component.tsx` - Authentication check after logout

