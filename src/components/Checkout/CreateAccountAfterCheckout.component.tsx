"use client";

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '@/utils/gql/GQL_MUTATIONS';
import Button from '@/components/UI/Button.component';

interface CreateAccountAfterCheckoutProps {
  email: string;
  firstName?: string;
  lastName?: string;
  onAccountCreated?: () => void;
}

/**
 * Component for creating account after checkout completion
 * Recommended option - allows customers to create account after order is placed
 */
const CreateAccountAfterCheckout = ({
  email,
  firstName,
  lastName,
  onAccountCreated,
}: CreateAccountAfterCheckoutProps) => {
  const [username, setUsername] = useState(email.split('@')[0] || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [createAccount] = useMutation(CREATE_USER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await createAccount({
        variables: {
          username: username || email.split('@')[0],
          email,
          password,
          firstName: firstName || '',
          lastName: lastName || '',
        },
      });

      if (result.data?.registerCustomer?.customer) {
        setSuccess(true);
        if (onAccountCreated) {
          onAccountCreated();
        }
        // Optionally redirect to account page or refresh
        setTimeout(() => {
          window.location.href = '/account';
        }, 2000);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-green-800">
            Account created successfully! Redirecting to your account page...
          </p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Create an account for faster checkout next time
            </h4>
            <p className="text-xs text-blue-700">
              Save your information and track your orders easily.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="ml-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-900">Create Your Account</h4>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setError(null);
            setPassword('');
            setConfirmPassword('');
          }}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close form"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="post-checkout-username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="post-checkout-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label htmlFor="post-checkout-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="post-checkout-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
            placeholder="Enter a password (min. 8 characters)"
          />
        </div>

        <div>
          <label htmlFor="post-checkout-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            id="post-checkout-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
            placeholder="Confirm your password"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="submit"
            variant="primary"
            buttonDisabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountAfterCheckout;

