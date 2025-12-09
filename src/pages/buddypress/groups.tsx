import { useRouter } from 'next/router';
import { useAuth } from '@faustwp/core';
import Layout from '@/components/Layout/Layout.component';
import BuddyPressGroups from '@/components/BuddyPress/BuddyPressGroups.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

const BuddyPressGroupsPage = () => {
  const router = useRouter();
  const { isAuthenticated, isReady, loginUrl } = useAuth({
    strategy: 'local',
    loginPageUrl: '/login-faust',
    shouldRedirect: true,
  });

  if (!isReady) {
    return (
      <Layout title="Groups">
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!isAuthenticated && loginUrl) {
    router.push(loginUrl);
    return null;
  }

  return (
    <Layout title="Groups">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <BuddyPressGroups />
      </div>
    </Layout>
  );
};

export default BuddyPressGroupsPage;


