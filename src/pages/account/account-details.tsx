import dynamic from 'next/dynamic';
import Layout from '@/components/Layout/Layout.component';
import AccountNavigation from '@/components/User/AccountNavigation.component';
import AccountDetails from '@/components/User/AccountDetails.component';
import withAuth from '@/components/User/withAuth.component';

import type { NextPage } from 'next';

const AccountDetailsPage: NextPage = () => {
  return (
    <Layout title="Account details">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">My account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation */}
          <div className="lg:col-span-1">
            <AccountNavigation activeEndpoint="edit-account" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AccountDetails />
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Disable SSR to prevent issues with authentication hooks
const AuthenticatedPage = dynamic(
  () => Promise.resolve(withAuth(AccountDetailsPage)),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    ),
  }
);

export default AuthenticatedPage;

