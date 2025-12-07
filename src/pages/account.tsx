import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth, getApolloAuthClient } from '@faustwp/core';
import Layout from '@/components/Layout/Layout.component';
import AccountNavigation from '@/components/User/AccountNavigation.component';
import AccountDashboard from '@/components/User/AccountDashboard.component';
import AccountOrders from '@/components/User/AccountOrders.component';
import AccountDownloads from '@/components/User/AccountDownloads.component';
import AccountAddresses from '@/components/User/AccountAddresses.component';
import AccountPaymentMethods from '@/components/User/AccountPaymentMethods.component';
import AccountDetails from '@/components/User/AccountDetails.component';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';

import type { NextPage } from 'next';

const CustomerAccountPage: NextPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('my-details');
  
  // Faust.js authentication hooks
  const { isAuthenticated, isReady, loginUrl } = useAuth({
    strategy: 'local',
    loginPageUrl: '/login-faust',
    shouldRedirect: true,
  });
  
  // Redirect to login if not authenticated (after auth check is ready)
  useEffect(() => {
    if (isReady && !isAuthenticated && loginUrl) {
      // Store current URL for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('loginReturnUrl', router.asPath);
      }
      router.push(loginUrl);
    }
  }, [isReady, isAuthenticated, loginUrl, router]);
  
  // Handle hash-based navigation
  useEffect(() => {
    // Set default hash if none exists
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.slice(1);
      console.log('[Account] Initial hash:', currentHash);
      
      if (!currentHash) {
        window.history.replaceState(null, '', '/account#my-details');
        setActiveTab('my-details');
        console.log('[Account] Set default hash to my-details');
      } else {
        setActiveTab(currentHash);
        console.log('[Account] Set active tab from hash:', currentHash);
      }
    }
    
    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      console.log('[Account] Hash changed to:', newHash);
      if (newHash) {
        setActiveTab(newHash);
        console.log('[Account] Active tab updated to:', newHash);
      } else {
        setActiveTab('my-details');
        console.log('[Account] Active tab reset to my-details');
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    // Also listen for popstate (back/forward button)
    window.addEventListener('popstate', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);
  
  // Debug: Log activeTab changes
  useEffect(() => {
    console.log('[Account] Active tab state changed to:', activeTab);
  }, [activeTab]);
  
  // Get user data for avatar
  const authClient = getApolloAuthClient(); // Get authenticated client
  const { data: userData } = useQuery(GET_CURRENT_USER, {
    client: authClient, // Use authenticated client
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });
  
  const customer = userData?.customer;
  const avatar = null; // Avatar field removed from GraphQL query
  const firstName = customer?.firstName || customer?.email || 'User';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-details':
      case 'dashboard':
        return <AccountDashboard />;
      case 'orders':
        return <AccountOrders />;
      case 'downloads':
        return <AccountDownloads />;
      case 'addresses':
        return <AccountAddresses />;
      case 'payment-methods':
        return <AccountPaymentMethods />;
      case 'account-details':
        return <AccountDetails />;
      default:
        return <AccountDashboard />;
    }
  };

  return (
    <Layout title="My account">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row items-start justify-between w-full lg:gap-12 mb-24">
          {/* Left Sidebar */}
          <div className="mt-2 lg:sticky top-16 w-full lg:max-w-[260px]">
            {/* User Info with Avatar */}
            <section className="my-8 flex gap-4 items-start justify-center w-full">
              {avatar ? (
                <img 
                  src={avatar} 
                  className="rounded-full aspect-square border border-gray-300" 
                  alt="user-avatar" 
                  width="48" 
                  height="48" 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-lg">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 text-balance leading-tight w-full text-ellipsis overflow-hidden">
                <div className="text-lg font-semibold">Welcome, {firstName}</div>
                {customer?.email && (
                  <span className="text-gray-400 font-light text-sm" title={customer.email}>
                    {customer.email}
                  </span>
                )}
              </div>
            </section>
            
            <hr className="my-8" />
            
            {/* Navigation */}
            <AccountNavigation activeEndpoint={activeTab} />
          </div>

          {/* Main Content */}
          <main className="flex-1 w-full lg:my-8 rounded-lg max-w-screen-lg lg:sticky top-24">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerAccountPage;

