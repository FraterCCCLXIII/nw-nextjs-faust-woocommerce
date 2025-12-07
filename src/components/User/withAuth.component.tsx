import { useRouter } from 'next/router';
import { useEffect, ComponentType, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../../utils/gql/GQL_QUERIES';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withAuth<P = any>(WrappedComponent: ComponentType<P>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Wrapper = (props: any) => {
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    // Ensure we're mounted on the client side
    useEffect(() => {
      setIsMounted(true);
    }, []);
    
    // Use network-only to always check server-side authentication
    // This prevents showing stale cached data after logout
    // Only run query on client side after mounting
    const isClient = typeof window !== 'undefined';
    const { data, loading, error, refetch } = useQuery(GET_CURRENT_USER, {
      errorPolicy: 'all',
      fetchPolicy: 'network-only', // Always fetch from network, never use cache
      notifyOnNetworkStatusChange: false, // Don't trigger loading state on network updates
      skip: !isClient || !isMounted, // Skip query during SSR and until mounted
      // Removed onCompleted and onError - using useEffect instead for logging
    });

    // Debug logging
    useEffect(() => {
      if (isMounted) {
        console.log('[withAuth] State:', {
          isMounted,
          loading,
          hasData: !!data,
          hasCustomer: !!data?.customer,
          customerId: data?.customer?.id,
          customerEmail: data?.customer?.email,
          hasError: !!error,
          errorMessage: error?.message,
          hasRedirected,
          currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
          query: typeof window !== 'undefined' ? window.location.search : 'N/A',
        });
        
        if (error) {
          console.error('[withAuth] Query error details:', {
            message: error.message,
            graphQLErrors: error.graphQLErrors,
            networkError: error.networkError,
          });
        }
      }
    }, [isMounted, loading, data, error, hasRedirected]);

    useEffect(() => {
      // Only check once we're mounted on the client and have a definitive answer
      // Add a small delay to allow cookies to propagate after login
      if (isMounted && !loading && !hasRedirected) {
        console.log('[withAuth] Checking authentication status...');
        
        // If there's an error or no customer data, user is not authenticated
        // But wait a bit longer if we just came from login (check URL params)
        const isFromLogin = typeof window !== 'undefined' && 
          (window.location.search.includes('login=success') || 
           document.referrer.includes('/login'));
        
        console.log('[withAuth] Auth check:', {
          hasError: !!error,
          hasCustomer: !!data?.customer,
          isFromLogin,
          referrer: typeof window !== 'undefined' ? document.referrer : 'N/A',
          search: typeof window !== 'undefined' ? window.location.search : 'N/A',
        });
        
        if (error || !data?.customer) {
          console.log('[withAuth] User not authenticated');
          
          // If we just came from login, give it a moment for cookies to set
          if (isFromLogin && !hasRedirected) {
            console.log('[withAuth] Coming from login, waiting 500ms before retry...');
            const timeoutId = setTimeout(() => {
              console.log('[withAuth] Retrying user query...');
              // Retry the query once more
              refetch().then(({ data: retryData, error: retryError }) => {
                console.log('[withAuth] Retry result:', {
                  hasCustomer: !!retryData?.customer,
                  customerId: retryData?.customer?.id,
                  error: retryError,
                });
                
                if (!retryData?.customer && !hasRedirected) {
                  console.log('[withAuth] Still no customer after retry, redirecting to login');
                  setHasRedirected(true);
                  router.replace('/login');
                } else if (retryData?.customer) {
                  console.log('[withAuth] Customer found after retry, authentication successful');
                }
              }).catch((retryErr) => {
                console.error('[withAuth] Retry error:', retryErr);
                if (!hasRedirected) {
                  setHasRedirected(true);
                  router.replace('/login');
                }
              });
            }, 500);
            
            return () => clearTimeout(timeoutId);
          } else if (!isFromLogin) {
            console.log('[withAuth] Not from login, redirecting to login page');
            setHasRedirected(true);
            router.replace('/login');
          }
          return;
        } else {
          console.log('[withAuth] User authenticated, allowing access');
        }
      }
    }, [data, loading, error, router, hasRedirected, isMounted, refetch]);

    // Show loading during SSR or initial load
    if (!isMounted || loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    // If we've redirected or no customer data, don't render (show nothing)
    // Also check for error to prevent showing content when not authenticated
    if (hasRedirected || !data?.customer || error) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
}

export default withAuth;
