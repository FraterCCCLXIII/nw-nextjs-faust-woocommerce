import { useRouter } from 'next/router';
import { useAuth } from '@faustwp/core';
import Layout from '@/components/Layout/Layout.component';
import BuddyPressProfile from '@/components/BuddyPress/BuddyPressProfile.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

const BuddyPressProfilePage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { isAuthenticated, isReady, loginUrl } = useAuth({
    strategy: 'local',
    loginPageUrl: '/login-faust',
    shouldRedirect: true,
  });

  if (!isReady) {
    return (
      <Layout title="Profile">
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!isAuthenticated && loginUrl) {
    router.push(loginUrl);
    return null;
  }

  const profileUserId = userId ? parseInt(userId as string, 10) : undefined;

  return (
    <Layout title="Profile">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <BuddyPressProfile userId={profileUserId} />
      </div>
    </Layout>
  );
};

export default BuddyPressProfilePage;


