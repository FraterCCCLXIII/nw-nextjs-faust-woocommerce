import { ApolloClient, InMemoryCache } from '@apollo/client';
import { LOGIN_USER, LOGOUT_USER } from './gql/GQL_MUTATIONS';
import { GET_CURRENT_USER } from './gql/GQL_QUERIES';
import client from './apollo/ApolloClient';

// Return URL handling for post-login redirects
const RETURN_URL_KEY = 'loginReturnUrl';

export function setReturnUrl(url: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(RETURN_URL_KEY, url);
  }
}

export function getReturnUrl(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(RETURN_URL_KEY);
  }
  return null;
}

export function clearReturnUrl(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(RETURN_URL_KEY);
  }
}

export function navigateToLogin(currentRoute?: string): string {
  if (typeof window !== 'undefined') {
    const route = currentRoute || window.location.pathname + window.location.search;
    // Only store return URL if it's not already the login page
    if (route && route !== '/login' && route !== '/account') {
      setReturnUrl(route);
    }
    return '/login';
  }
  return '/login';
}

// Cookie-based authentication - no token storage needed
export function hasCredentials() {
  if (typeof window === 'undefined') {
    return false; // Server-side, no credentials available
  }
  
  // With cookie-based auth, we'll check if user is logged in through a query
  // For now, we'll return false and let components handle the check
  return false;
}

export async function getAuthToken() {
  // Cookie-based auth doesn't need JWT tokens
  return null;
}

function getErrorMessage(error: any): string {
  // Check for GraphQL errors
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const graphQLError = error.graphQLErrors[0];
    const message = graphQLError.message;
    
    // Map GraphQL error messages to user-friendly messages
    switch (message) {
      case 'invalid_username':
        return 'Invalid username or email address. Please check and try again.';
      case 'incorrect_password':
        return 'Wrong password. Please check your password and try again.';
      case 'invalid_email':
        return 'Invalid email address. Please enter a valid email address.';
      case 'empty_username':
        return 'Please enter username or email address.';
      case 'empty_password':
        return 'Please enter password.';
      case 'too_many_retries':
        return 'Too many failed attempts. Please wait a moment before trying again.';
      default:
        return 'Login failed. Please check your credentials and try again.';
    }
  }
  
  // Check for network errors
  if (error.networkError) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Fallback for other errors
  if (error.message) {
    return 'An error occurred during login. Please try again.';
  }
  
  return 'An unknown error occurred. Please try again later.';
}

export async function login(username: string, password: string) {
  console.log('[Auth] Starting login process...', { username: username.substring(0, 3) + '***' });
  try {
    // Use the shared Apollo client to ensure cache is updated
    console.log('[Auth] Calling login mutation...');
    const { data, errors } = await client.mutate({
      mutation: LOGIN_USER,
      variables: { username, password },
      fetchPolicy: 'no-cache', // Don't use cache for login
      errorPolicy: 'all',
    });

    console.log('[Auth] Login mutation response:', { 
      hasData: !!data, 
      hasErrors: !!errors,
      errors: errors?.map(e => e.message),
      loginResult: data?.loginWithCookies 
    });

    const loginResult = data?.loginWithCookies;

    if (!loginResult) {
      console.error('[Auth] No login result in response:', { data, errors });
      throw new Error('Login failed. No response from server.');
    }

    if (loginResult.status !== 'SUCCESS') {
      console.error('[Auth] Login failed with status:', loginResult.status);
      throw new Error('Login failed. Please check your credentials and try again.');
    }

    console.log('[Auth] Login successful, clearing Apollo cache...');
    // Clear Apollo cache to ensure fresh user data is fetched
    try {
      await client.clearStore();
      console.log('[Auth] Apollo cache cleared');
      await client.resetStore();
      console.log('[Auth] Apollo store reset');
    } catch (cacheError) {
      console.warn('[Auth] Error clearing cache after login:', cacheError);
      // Continue even if cache clear fails
    }

    // Check cookies - wait a moment for them to be set
    if (typeof window !== 'undefined') {
      // Wait longer for cookies to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      const cookies = document.cookie;
      console.log('[Auth] Cookies after login:', cookies);
      console.log('[Auth] Cookie string length:', cookies.length);
      
      const hasWPCookie = cookies.includes('wordpress_logged_in') || 
                         cookies.includes('woocommerce') ||
                         cookies.includes('wp_');
      console.log('[Auth] Has WordPress/WooCommerce cookie:', hasWPCookie);
      
      // Log all cookie names for debugging
      const cookieNames = cookies.split(';').map(c => c.split('=')[0].trim()).filter(c => c);
      console.log('[Auth] All cookie names:', cookieNames);
      console.log('[Auth] Cookie count:', cookieNames.length);
      
      // Check if cookies are HttpOnly (not readable by JavaScript)
      if (cookieNames.length === 0 && cookies.length === 0) {
        console.log('[Auth] No cookies visible - they may be HttpOnly (normal for secure auth)');
        console.log('[Auth] HttpOnly cookies are still sent with requests but not readable by JavaScript');
      }
      
      // Try to verify authentication by checking if we can query customer
      console.log('[Auth] Verifying authentication by querying customer data...');
      try {
        const { data: verifyData } = await client.query({
          query: GET_CURRENT_USER,
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        });
        console.log('[Auth] Verification query result:', {
          hasCustomer: !!verifyData?.customer,
          customerId: verifyData?.customer?.id,
          customerEmail: verifyData?.customer?.email,
          isGuest: verifyData?.customer?.id === 'guest' || verifyData?.customer?.id === 'cGd1ZXN0',
        });
      } catch (verifyError) {
        console.warn('[Auth] Verification query failed:', verifyError);
      }
    }

    // On successful login, cookies are automatically set by the server
    console.log('[Auth] Login complete, returning success');
    return { success: true, status: loginResult.status };
  } catch (error: unknown) {
    console.error('[Auth] Login error:', error);
    const userFriendlyMessage = getErrorMessage(error);
    throw new Error(userFriendlyMessage);
  }
}

/**
 * Clears all cookies for the current domain
 * This is necessary for proper logout with cookie-based authentication
 */
function clearAllCookies() {
  if (typeof window === 'undefined') {
    console.log('[Auth] clearAllCookies: window is undefined, skipping');
    return;
  }

  console.log('[Auth] clearAllCookies: Starting cookie cleanup...');
  const hostname = window.location.hostname;
  const paths = ['/', '/wp-admin/', '/wp-content/', '/wp-includes/'];
  const domains = [
    hostname,
    `.${hostname}`,
    window.location.host,
    `.${window.location.host}`,
  ];
  
  console.log('[Auth] clearAllCookies: Hostname:', hostname);
  console.log('[Auth] clearAllCookies: Domains to try:', domains);
  console.log('[Auth] clearAllCookies: Paths to try:', paths);

  // Get all cookies
  const allCookies = document.cookie.split(';');
  const cookiesToClear: string[] = [];

  console.log('[Auth] clearAllCookies: Found', allCookies.length, 'cookies');

  // Collect all cookie names
  allCookies.forEach((cookie) => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName) {
      cookiesToClear.push(cookieName);
    }
  });
  
  console.log('[Auth] clearAllCookies: Cookies to clear:', cookiesToClear);

  // Also clear known WordPress/WooCommerce cookie prefixes
  const cookiePrefixes = [
    'wordpress_logged_in_',
    'wordpress_',
    'wp_',
    'wp-settings-',
    'wp-settings-time-',
    'woocommerce_',
    'woocommerce_cart_',
    'woocommerce_items_in_cart',
    'woocommerce_cart_hash',
    'woocommerce_session_',
  ];

  // Clear cookies with all combinations of paths and domains
  let clearedCount = 0;
  cookiesToClear.forEach((cookieName) => {
    // Check if it matches any prefix or is in our list
    const shouldClear = cookiePrefixes.some((prefix) => cookieName.startsWith(prefix)) || 
                       cookiesToClear.includes(cookieName);

    if (shouldClear) {
      console.log('[Auth] clearAllCookies: Clearing cookie:', cookieName);
      paths.forEach((path) => {
        domains.forEach((domain) => {
          // Try clearing with specific domain and path
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
          // Also try without domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
          // Try with secure flag
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; secure;`;
          // Try with SameSite
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; SameSite=None; Secure;`;
        });
      });
      clearedCount++;
    }
  });
  
  console.log('[Auth] clearAllCookies: Attempted to clear', clearedCount, 'cookies');
  console.log('[Auth] clearAllCookies: Remaining cookies:', document.cookie);
}

export async function logout() {
  console.log('[Auth] ========== LOGOUT STARTED ==========');
  try {
    // Step 1: Attempt logout mutation (optional - may not be available in all WPGraphQL setups)
    // For cookie-based auth, server-side logout mutation is optional since cookies are cleared client-side
    console.log('[Auth] Step 1: Attempting logout mutation (optional for cookie-based auth)...');
    
    try {
      const result = await client.mutate({
        mutation: LOGOUT_USER,
        fetchPolicy: 'no-cache',
        errorPolicy: 'all', // Continue even if mutation fails
      });
      
      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors[0]?.message || 'Unknown error';
        // Check if it's the "field doesn't exist" error (expected)
        if (errorMessage.includes('Cannot query field "logout"')) {
          console.log('[Auth] Step 1: Logout mutation not available in GraphQL schema (expected)');
          console.log('[Auth] Step 1: This is normal - proceeding with client-side cleanup');
        } else {
          console.warn('[Auth] Step 1: Logout mutation error:', errorMessage);
          console.log('[Auth] Step 1: Proceeding with client-side cleanup');
        }
      } else if (result.data?.logout?.status) {
        console.log('[Auth] Step 1: Logout mutation successful, status:', result.data.logout.status);
      } else {
        console.log('[Auth] Step 1: Logout mutation completed (no data, no errors)');
      }
    } catch (error: any) {
      const errorMessage = error?.graphQLErrors?.[0]?.message || error?.message || 'Unknown error';
      // Check if it's the "field doesn't exist" error (expected)
      if (errorMessage.includes('Cannot query field "logout"')) {
        console.log('[Auth] Step 1: Logout mutation not available in GraphQL schema (expected)');
        console.log('[Auth] Step 1: This is normal - proceeding with client-side cleanup');
      } else {
        console.warn('[Auth] Step 1: Logout mutation error:', errorMessage);
        console.log('[Auth] Step 1: Proceeding with client-side cleanup');
      }
    }

    // Step 2: Clear WooCommerce session from localStorage (before clearing all)
    if (typeof window !== 'undefined') {
      console.log('[Auth] Step 2: Clearing WooCommerce session...');
      const wooSession = localStorage.getItem('woo-session');
      const wooCart = localStorage.getItem('woocommerce-cart');
      console.log('[Auth] Before clear - woo-session exists:', !!wooSession, 'woocommerce-cart exists:', !!wooCart);
      
      localStorage.removeItem('woo-session');
      localStorage.removeItem('woocommerce-cart');
      
      console.log('[Auth] After clear - woo-session exists:', !!localStorage.getItem('woo-session'), 'woocommerce-cart exists:', !!localStorage.getItem('woocommerce-cart'));
      console.log('[Auth] Step 2: WooCommerce session cleared');
    }

    // Step 3: Clear all cookies (WordPress session cookies, etc.)
    if (typeof window !== 'undefined') {
      console.log('[Auth] Step 3: Clearing cookies...');
      const cookiesBefore = document.cookie;
      console.log('[Auth] Cookies before clear:', cookiesBefore);
      console.log('[Auth] Cookie count before:', cookiesBefore.split(';').filter(c => c.trim()).length);
      
      clearAllCookies();
      
      const cookiesAfter = document.cookie;
      console.log('[Auth] Cookies after clear:', cookiesAfter);
      console.log('[Auth] Cookie count after:', cookiesAfter.split(';').filter(c => c.trim()).length);
      console.log('[Auth] Step 3: Cookies cleared');
    }

    // Step 4: Clear Apollo cache (must happen before redirect)
    console.log('[Auth] Step 4: Clearing Apollo cache...');
    try {
      // Clear the cache first
      await client.clearStore();
      console.log('[Auth] Step 4a: Apollo cache cleared');
      
      // Reset the store to ensure fresh state
      await client.resetStore();
      console.log('[Auth] Step 4b: Apollo store reset');
      console.log('[Auth] Step 4: Apollo cache cleared successfully');
    } catch (cacheError) {
      console.error('[Auth] Step 4: Error clearing Apollo cache:', cacheError);
    }

    // Step 5: Clear remaining localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      console.log('[Auth] Step 5: Clearing storage...');
      const localStorageKeys = Object.keys(localStorage);
      const sessionStorageKeys = Object.keys(sessionStorage);
      console.log('[Auth] localStorage keys before clear:', localStorageKeys);
      console.log('[Auth] sessionStorage keys before clear:', sessionStorageKeys);
      
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('[Auth] localStorage keys after clear:', Object.keys(localStorage));
      console.log('[Auth] sessionStorage keys after clear:', Object.keys(sessionStorage));
      console.log('[Auth] Step 5: Storage cleared');
    }

    // Step 6: Force a hard redirect to home page
    // Add a small delay to ensure all cleanup is complete
    if (typeof window !== 'undefined') {
      console.log('[Auth] Step 6: Preparing redirect...');
      const redirectUrl = '/?logout=success&t=' + Date.now();
      console.log('[Auth] Redirect URL:', redirectUrl);
      console.log('[Auth] Current URL:', window.location.href);
      
      // TEMPORARILY DISABLED: Prevent redirect to capture logs
      console.log('[Auth] REDIRECT DISABLED FOR DEBUGGING - Logout completed!');
      console.log('[Auth] Would redirect to:', redirectUrl);
      
      // setTimeout(() => {
      //   console.log('[Auth] Step 6: Executing redirect now...');
      //   // Use replace to prevent back button from going to account page
      //   // Add timestamp to prevent caching
      //   window.location.replace(redirectUrl);
      // }, 100);
    }
    
    console.log('[Auth] ========== LOGOUT COMPLETED ==========');
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    // Even if logout fails, perform comprehensive cleanup
    try {
      if (typeof window !== 'undefined') {
        // Clear WooCommerce session
        localStorage.removeItem('woo-session');
        localStorage.removeItem('woocommerce-cart');
        // Clear all cookies
        clearAllCookies();
        // Clear storage
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Clear Apollo cache
      await client.clearStore();
      await client.resetStore();
    } catch (clearError) {
      console.error('[Auth] Error during cleanup:', clearError);
    }
    
    // Always redirect to home page even on error
    if (typeof window !== 'undefined') {
      // TEMPORARILY DISABLED: Prevent redirect to capture logs
      console.log('[Auth] ERROR HANDLER: REDIRECT DISABLED FOR DEBUGGING');
      console.log('[Auth] ERROR HANDLER: Would redirect to: /?logout=success&t=' + Date.now());
      
      // setTimeout(() => {
      //   window.location.replace('/?logout=success&t=' + Date.now());
      // }, 100);
    }
  }
}
