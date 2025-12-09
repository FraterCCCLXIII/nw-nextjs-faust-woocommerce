import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLogout } from '@faustwp/core';
import { useState, useEffect } from 'react';

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

const buddypressNavItems: AccountNavItem[] = [
  { id: 'buddypress-profile', label: 'Profile', href: '/buddypress/profile', endpoint: 'buddypress-profile', icon: 'user' },
  { id: 'buddypress-activity', label: 'Activity', href: '/buddypress/activity', endpoint: 'buddypress-activity', icon: 'activity' },
  { id: 'buddypress-friends', label: 'Friends', href: '/buddypress/friends', endpoint: 'buddypress-friends', icon: 'users' },
  { id: 'buddypress-messages', label: 'Messages', href: '/buddypress/messages', endpoint: 'buddypress-messages', icon: 'mail' },
  { id: 'buddypress-notifications', label: 'Notifications', href: '/buddypress/notifications', endpoint: 'buddypress-notifications', icon: 'bell' },
  { id: 'buddypress-groups', label: 'Groups', href: '/buddypress/groups', endpoint: 'buddypress-groups', icon: 'group' },
  { id: 'buddypress-settings', label: 'Settings', href: '/buddypress/settings', endpoint: 'buddypress-settings', icon: 'settings' },
];

interface AccountNavigationProps {
  activeEndpoint?: string;
}

const AccountNavigation = ({ activeEndpoint = 'dashboard' }: AccountNavigationProps) => {
  const router = useRouter();
  const currentPath = router.pathname;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, loading: logoutLoading } = useLogout(); // Use Faust.js useLogout

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
    if (currentPath.startsWith('/buddypress/profile')) return 'buddypress-profile';
    if (currentPath.startsWith('/buddypress/activity')) return 'buddypress-activity';
    if (currentPath.startsWith('/buddypress/friends')) return 'buddypress-friends';
    if (currentPath.startsWith('/buddypress/messages')) return 'buddypress-messages';
    if (currentPath.startsWith('/buddypress/notifications')) return 'buddypress-notifications';
    if (currentPath.startsWith('/buddypress/groups')) return 'buddypress-groups';
    if (currentPath.startsWith('/buddypress/settings')) return 'buddypress-settings';
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
      console.log('[AccountNav] Calling Faust.js logout function...');
      await logout('/'); // Redirect to homepage after logout
      console.log('[AccountNav] Faust.js logout function completed');
    } catch (error) {
      console.error('[AccountNav] Logout error:', error);
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
                      {item.icon === 'user' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      )}
                      {item.icon === 'activity' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      )}
                      {item.icon === 'users' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      )}
                      {item.icon === 'mail' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      )}
                      {item.icon === 'bell' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      )}
                      {item.icon === 'group' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      )}
                    </svg>
                  )}
                  {item.label}
                </Link>
              </li>
            );
        })}
        
        {/* BuddyPress Section */}
        <li className="mt-6 pt-6 border-t border-gray-200">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Community
          </p>
        </li>
        {buddypressNavItems.map((item) => {
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
              >
                {item.icon && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon === 'user' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    )}
                    {item.icon === 'activity' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    )}
                    {item.icon === 'users' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    )}
                    {item.icon === 'mail' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    )}
                    {item.icon === 'bell' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    )}
                    {item.icon === 'group' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
            disabled={isLoggingOut || logoutLoading} // Use Faust.js loading state
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isLoggingOut || logoutLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {isLoggingOut || logoutLoading ? 'Logging out...' : 'Log out'}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AccountNavigation;

