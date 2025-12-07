import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLogin } from '@faustwp/core';
import Layout from '@/components/Layout/Layout.component';
import Button from '@/components/UI/Button.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';
import Link from 'next/link';

import type { NextPage } from 'next';

/**
 * Login page using Faust.js authentication
 */
const LoginFaustPage: NextPage = () => {
  const router = useRouter();
  const { login, loading, data, error } = useLogin();
  const [usernameEmail, setUsernameEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle login response
  useEffect(() => {
    if (data?.generateAuthorizationCode) {
      if (data.generateAuthorizationCode.error) {
        setErrorMessage(data.generateAuthorizationCode.error);
      } else if (data.generateAuthorizationCode.code) {
        // Login successful - redirect will be handled by useLogin hook
        const returnUrl = typeof window !== 'undefined' 
          ? sessionStorage.getItem('loginReturnUrl') 
          : null;
        
        if (returnUrl && returnUrl !== '/login-faust' && returnUrl !== '/account') {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('loginReturnUrl');
          }
          login(usernameEmail, password, `${returnUrl}?login=success`);
        } else {
          login(usernameEmail, password, '/account?login=success');
        }
      }
    }
  }, [data, usernameEmail, password, login]);

  // Handle Apollo errors
  useEffect(() => {
    if (error) {
      setErrorMessage(error.message || 'An error occurred during login');
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!usernameEmail || !password) {
      setErrorMessage('Please enter both username/email and password');
      return;
    }

    // Get return URL from query or session storage
    const returnUrl = router.query.redirect_uri as string || 
      (typeof window !== 'undefined' ? sessionStorage.getItem('loginReturnUrl') : null) ||
      '/account';

    login(usernameEmail, password, returnUrl);
  };

  return (
    <Layout title="Log In">
      <section className="text-gray-700 container p-4 py-2 mx-auto mb-[8rem] md:mb-0">
        <div className="mx-auto lg:w-1/2">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Log In
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <label htmlFor="usernameEmail" className="block pb-2 text-sm font-medium text-gray-700">
                  Username or email
                </label>
                <input
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-black focus:border-black block w-full p-2.5 placeholder-gray-400"
                  id="usernameEmail"
                  placeholder="Username or email"
                  type="text"
                  value={usernameEmail}
                  onChange={(e) => setUsernameEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="w-full">
                <label htmlFor="password" className="block pb-2 text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-black focus:border-black block w-full p-2.5 placeholder-gray-400"
                  id="password"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {errorMessage && (
                <div className="w-full text-red-600 text-sm text-center">
                  {errorMessage}
                </div>
              )}

              <div className="w-full mt-4">
                <Button variant="primary" buttonDisabled={loading} type="submit">
                  {loading ? <LoadingSpinner /> : 'Log In'}
                </Button>
              </div>

              <div className="w-full mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-black font-semibold hover:underline">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default LoginFaustPage;

