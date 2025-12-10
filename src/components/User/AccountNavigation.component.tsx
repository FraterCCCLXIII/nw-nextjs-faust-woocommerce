import Link from 'next/link';
import { useRouter } from 'next/router';
// import { useLogout } from '@faustwp/core'; // Replaced with custom logout
import { useState, useEffect } from 'react';
import { logout } from '@/utils/auth'; // Use custom logout function

interface AccountNavItem {
  id: string;
  label: string;
  href: string;
  endpoint: string;
  icon?: string;
}

const accountNavItems: AccountNavItem[] = [
  { id: 'my-details', label: 'My Details', href: '/account#my-details', endpoint: 'my-details', icon: 'information-circle' },
  { id: 'orders', label: 'Orders', href: '/account#orders', endpoint: 'orders', icon: 'bag-check' },
  { id: 'downloads', label: 'Downloads', href: '/account#downloads', endpoint: 'downloads', icon: 'cloud-download' },
  { id: 'addresses', label: 'Addresses', href: '/account#addresses', endpoint: 'addresses', icon: 'location' },
  { id: 'payment-methods', label: 'Payment methods', href: '/account#payment-methods', endpoint: 'payment-methods', icon: 'card' },
  { id: 'account-details', label: 'Account details', href: '/account#account-details', endpoint: 'account-details', icon: 'settings' },
];

interface AccountNavigationProps {
  activeEndpoint?: string;
}

const AccountNavigation = ({ activeEndpoint = 'dashboard' }: AccountNavigationProps) => {
  const router = useRouter();
  const currentPath = router.pathname;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // const { logout, loading: logoutLoading } = useLogout(); // Replaced with custom logout

  // Determine active item based on hash or fallback
  const getActiveItem = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash) {
        return hash;
      }
    }
    // Fallback to query parameter for backward compatibility
    const tab = router.query.tab as string;
    if (tab) {
      return tab;
    }
    // Fallback to path-based detection for backward compatibility
    if (currentPath === '/account') return 'my-details';
    if (currentPath.startsWith('/account/orders')) return 'orders';
    if (currentPath.startsWith('/account/downloads')) return 'downloads';
    if (currentPath.startsWith('/account/addresses')) return 'addresses';
    if (currentPath.startsWith('/account/payment-methods')) return 'payment-methods';
    if (currentPath.startsWith('/account/account-details')) return 'account-details';
    return activeEndpoint || 'my-details';
  };

  const [activeId, setActiveId] = useState(getActiveItem());

  // Update active tab when hash changes or when activeEndpoint prop changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      console.log('[AccountNav] Hash change detected:', hash);
      if (hash) {
        setActiveId(hash);
        console.log('[AccountNav] Active ID set to:', hash);
      } else {
        setActiveId('my-details');
        console.log('[AccountNav] Active ID set to default: my-details');
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    // Also check on mount
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Separate effect to sync with activeEndpoint prop (from parent account page)
  useEffect(() => {
    if (activeEndpoint && activeEndpoint !== activeId) {
      console.log('[AccountNav] Syncing with activeEndpoint prop:', activeEndpoint);
      setActiveId(activeEndpoint);
    }
  }, [activeEndpoint]);

  const handleLogout = async () => {
    console.log('[AccountNav] Logout button clicked');
    setIsLoggingOut(true);
    try {
      console.log('[AccountNav] Calling custom logout function...');
      // The custom logout function handles all cleanup and redirects
      await logout();
      console.log('[AccountNav] Custom logout function completed');
      // Note: logout() performs a full page redirect, so code after this won't execute
    } catch (error) {
      console.error('[AccountNav] Logout error:', error);
      // Even on error, logout should redirect, but reset state just in case
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="woocommerce-MyAccount-navigation" aria-label="Account pages">
      <ul className="space-y-1 lg:block flex flex-wrap gap-2">
        {accountNavItems.map((item) => {
          const isActive = item.id === activeId;
            return (
              <li
                key={item.id}
                className={`woocommerce-MyAccount-navigation-link woocommerce-MyAccount-navigation-link--${item.endpoint} ${
                  isActive ? 'is-active' : ''
                }`}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    // For hash links, manually update the hash to trigger hashchange event
                    if (item.href.includes('#')) {
                      e.preventDefault();
                      const hash = item.href.split('#')[1];
                      console.log('[AccountNav] Clicked tab:', item.id, 'hash:', hash);
                      window.location.hash = hash;
                      // Manually trigger hashchange for immediate update
                      window.dispatchEvent(new HashChangeEvent('hashchange'));
                      // Also update local state immediately
                      setActiveId(hash);
                    }
                  }}
                >
                  {item.icon && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon === 'information-circle' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                      {item.icon === 'bag-check' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                      {item.icon === 'cloud-download' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      )}
                      {item.icon === 'location' && (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </>
                      )}
                      {item.icon === 'card' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      )}
                      {item.icon === 'settings' && (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </>
                      )}
                    </svg>
                  )}
                  {item.label}
                </Link>
              </li>
            );
        })}
        
        {/* Logout Link */}
        <li className="woocommerce-MyAccount-navigation-link woocommerce-MyAccount-navigation-link--customer-logout">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut} // Use custom loading state
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isLoggingOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AccountNavigation;

