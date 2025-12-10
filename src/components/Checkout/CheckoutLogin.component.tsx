"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
// import { useLogin, useLogout, useAuth, getApolloAuthClient } from '@faustwp/core'; // Replaced with custom auth
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';
import { login as customLogin, logout as customLogout } from '@/utils/auth';
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
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  // Use direct GraphQL query for authentication status (cookie-based)
  const [loginLoading, setLoginLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  
  const { data, refetch, loading: userLoading } = useQuery(GET_CURRENT_USER, {
    // Use regular client - cookies are automatically included
    errorPolicy: 'all',
    fetchPolicy: 'network-only', // Always check fresh status
  });

  const customer = data?.customer;
  const isLoggedIn = !!customer && customer?.id !== 'guest' && customer?.id !== 'cGd1ZXN0';

  // Get user display name (firstName + lastName, or email, or username)
  const getUserDisplayName = () => {
    if (customer?.firstName && customer?.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    if (customer?.firstName) {
      return customer.firstName;
    }
    if (customer?.email) {
      return customer.email;
    }
    if (customer?.username) {
      return customer.username;
    }
    return 'User';
  };

  // Handle logout using custom logout function
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      console.log('[CheckoutLogin] Logging out...');
      await customLogout();
      console.log('[CheckoutLogin] Logout successful');
      // Reload page to clear form data
      router.reload();
    } catch (error) {
      console.error('[CheckoutLogin] Logout error:', error);
      setLogoutLoading(false);
    }
  };

  // Show logged in message if user is logged in
  if (isLoggedIn) {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Logged in as <span className="font-semibold text-gray-900">{getUserDisplayName()}</span>
              {customer?.email && customer.email !== getUserDisplayName() && (
                <span className="text-gray-500"> ({customer.email})</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {logoutLoading ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate inputs
    if (!username.trim()) {
      setError('Please enter your username or email');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setError(null);
    setLoginLoading(true);

    console.log('[CheckoutLogin] Starting login...', { username: username.substring(0, 3) + '***' });

    try {
      // Use custom login function (cookie-based)
      const result = await customLogin(username.trim(), password.trim());
      
      if (result.success) {
        console.log('[CheckoutLogin] Login successful');
        // Refetch user data
        await refetch();
        if (onLoginSuccess) {
          console.log('[CheckoutLogin] Calling onLoginSuccess callback...');
          onLoginSuccess();
        }
        setShowLogin(false);
        setUsername('');
        setPassword('');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('[CheckoutLogin] Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
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
            buttonDisabled={loginLoading || !username.trim() || !password.trim()}
          >
            {loginLoading ? 'Logging in...' : 'Log in'}
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

