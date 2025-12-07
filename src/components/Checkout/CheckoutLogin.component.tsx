"use client";

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { LOGIN_USER } from '@/utils/gql/GQL_MUTATIONS';
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';
import Button from '@/components/UI/Button.component';

interface CheckoutLoginProps {
  onLoginSuccess?: () => void;
}

/**
 * Login component for checkout page
 * Allows customers to log in during checkout
 */
const CheckoutLogin = ({ onLoginSuccess }: CheckoutLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  const { data } = useQuery(GET_CURRENT_USER, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const isLoggedIn = !!data?.customer;

  const [loginMutation] = useMutation(LOGIN_USER);

  // Don't show login section if user is already logged in
  if (isLoggedIn) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginMutation({
        variables: {
          username,
          password,
        },
      });

      if (result.data?.loginWithCookies?.status === 'SUCCESS') {
        // Refresh the page to update cart and user data
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        router.reload();
      } else {
        setError('Invalid username or password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showLogin) {
    return (
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Log in to your account</h3>
        <button
          type="button"
          onClick={() => {
            setShowLogin(false);
            setError(null);
            setUsername('');
            setPassword('');
          }}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close login form"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="checkout-username" className="block text-sm font-medium text-gray-700 mb-1">
            Username or Email
          </label>
          <input
            id="checkout-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            placeholder="Enter your username or email"
          />
        </div>

        <div>
          <label htmlFor="checkout-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="checkout-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="submit"
            variant="primary"
            buttonDisabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
          <a
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
};

export default CheckoutLogin;

