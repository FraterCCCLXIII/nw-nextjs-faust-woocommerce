import { useRouter } from 'next/router';
import { useAuth } from '@faustwp/core';
import Layout from '@/components/Layout/Layout.component';
import BuddyPressFriends from '@/components/BuddyPress/BuddyPressFriends.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

const BuddyPressFriendsPage = () => {
  const router = useRouter();
  const { isAuthenticated, isReady, loginUrl } = useAuth({
    strategy: 'local',
    loginPageUrl: '/login-faust',
    shouldRedirect: true,
  });

  if (!isReady) {
    return (
      <Layout title="Friends">
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!isAuthenticated && loginUrl) {
    router.push(loginUrl);
    return null;
  }

  return (
    <Layout title="Friends">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <BuddyPressFriends />
      </div>
    </Layout>
  );
};

export default BuddyPressFriendsPage;


