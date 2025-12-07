import Layout from '@/components/Layout/Layout.component';
import UserRegistration from '@/components/User/UserRegistration.component';

import type { NextPage } from 'next';

const RegisterPage: NextPage = () => {
  return (
    <Layout title="Create Account">
      <div className="container mx-auto px-4 py-8">
        <UserRegistration />
      </div>
    </Layout>
  );
};

export default RegisterPage;

