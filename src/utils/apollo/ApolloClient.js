/*eslint complexity: ["error", 8]*/

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { Observable } from 'zen-observable-ts';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Middleware operation
 * If we have a session token in localStorage, add it to the GraphQL request as a Session header.
 */
export const middleware = new ApolloLink((operation, forward) => {
  /**
   * If session data exist in local storage, set value as session header.
   * Here we also delete the session if it is older than 7 days
   */
  const sessionData = process.browser
    ? JSON.parse(localStorage.getItem('woo-session'))
    : null;

  const headers = {};

  if (sessionData && sessionData.token && sessionData.createdTime) {
    const { token, createdTime } = sessionData;

    // Check if the token is older than 7 days
    if (Date.now() - createdTime > SEVEN_DAYS) {
      // If it is, delete it
      localStorage.removeItem('woo-session');
      localStorage.setItem('woocommerce-cart', JSON.stringify({}));
    } else {
      // If it's not, use the token
      headers['woocommerce-session'] = `Session ${token}`;
    }
  }

  // Cookie-based authentication - no JWT tokens needed
  // Cookies are automatically included with credentials: 'include'

  operation.setContext({
    headers,
  });

  return forward(operation);
});

/**
 * Afterware operation.
 *
 * This catches the incoming session token and stores it in localStorage, for future GraphQL requests.
 */
export const afterware = new ApolloLink((operation, forward) =>
  forward(operation).map((response) => {
    /**
     * Check for session header and update session in local storage accordingly.
     */
    const context = operation.getContext();
    const {
      response: { headers },
    } = context;

    const session = headers.get('woocommerce-session');

    if (session && process.browser) {
      if ('false' === session) {
        // Remove session data if session destroyed.
        localStorage.removeItem('woo-session');
        // Update session new data if changed.
      } else {
        // Always update session if we get a new one (even if one exists)
        // This ensures we have the latest session token after addToCart
        const sessionToken = session.startsWith('Session ') ? session.substring(8) : session;
        localStorage.setItem(
          'woo-session',
          JSON.stringify({ token: sessionToken, createdTime: Date.now() }),
        );
        console.log('[Apollo Afterware] Updated WooCommerce session in localStorage');
      }
    }

    return response;
  }),
);

const clientSide = typeof window === 'undefined';

// Link to intercept and block generateAuthorizationCode operations
const filterAuthLink = new ApolloLink((operation, forward) => {
  // Check if this operation is trying to call generateAuthorizationCode
  const queryString = operation.query?.loc?.source?.body || '';
  if (queryString.includes('generateAuthorizationCode')) {
    console.log('[Apollo] Blocking generateAuthorizationCode operation (Faust.js auth not available)');
    // Mark this operation to not be cached
    operation.setContext({
      fetchOptions: {
        ...operation.getContext().fetchOptions,
      },
    });
    // Return an Observable that immediately emits a structure matching the expected schema
    // This prevents the request from being sent to the server
    return new Observable((observer) => {
      observer.next({
        data: {
          generateAuthorizationCode: {
            code: null,
            error: null,
          }
        }
      });
      observer.complete();
    });
  }
  // For all other operations, forward normally
  return forward(operation);
});

// Error link to suppress generateAuthorizationCode errors (as backup)
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      if (message.includes('generateAuthorizationCode')) {
        // Silently ignore - Faust.js auth is not configured
        console.log('[Apollo] generateAuthorizationCode error (ignored - Faust.js auth not available)');
      }
    });
  }
});

// Determine GraphQL URI
// Use proxy in browser to handle cross-domain cookies, direct URL in SSR
const getGraphqlUri = () => {
  if (typeof window !== 'undefined') {
    // Browser: use proxy to handle cross-domain cookies
    // Cookies set for moleculestore.local need to be forwarded via proxy
    return '/api/graphql-proxy';
  } else {
    // SSR: use direct URL
    return process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://moleculestore.local/graphql';
  }
};

// Apollo GraphQL client.
const client = new ApolloClient({
  ssrMode: clientSide,
  link: filterAuthLink.concat(
    errorLink.concat(
      middleware.concat(
        afterware.concat(
          createHttpLink({
            uri: getGraphqlUri(),
            fetch,
            credentials: 'include', // Include cookies for authentication
          }),
        ),
      ),
    ),
  ),
  cache: new InMemoryCache(),
  // Configure to handle errors gracefully
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all', // Return both data and errors
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
