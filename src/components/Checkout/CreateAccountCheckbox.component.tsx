"use client";

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '@/utils/gql/GQL_MUTATIONS';
import { login } from '@/utils/auth';
import client from '@/utils/apollo/ApolloClient';

interface CreateAccountCheckboxProps {
  email: string;
  firstName?: string;
  lastName?: string;
  onAccountCreated?: () => void;
}

/**
 * Component for creating account during checkout
 * Allows customers to create an account before placing their order
 */
const CreateAccountCheckbox = ({ email, firstName, lastName, onAccountCreated }: CreateAccountCheckboxProps) => {
  const { register, watch, setValue, formState: { errors }, trigger } = useFormContext();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState(false);
  const createAccount = watch('createAccount');
  const accountPassword = watch('accountPassword');
  const accountUsername = watch('accountUsername');

  const [registerUser] = useMutation(CREATE_USER);

  const handleCreateAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setValue('createAccount', checked);
    setShowPasswordFields(checked);
    setAccountError(null);
    setAccountSuccess(false);
    
    if (!checked) {
      setValue('accountPassword', '');
      setValue('accountUsername', '');
    }
  };

  // Handle account creation when password is entered and checkbox is checked
  const handleAccountCreation = async () => {
    if (!createAccount || !accountPassword || accountPassword.length < 8) {
      return;
    }

    // Validate form fields
    const isValid = await trigger('accountPassword');
    if (!isValid) {
      return;
    }

    setIsCreatingAccount(true);
    setAccountError(null);

    try {
      const username = accountUsername || email.split('@')[0];
      
      // Check if email is already taken by attempting registration
      const response = await registerUser({
        variables: {
          username,
          email,
          password: accountPassword,
          firstName: firstName || '',
          lastName: lastName || '',
        },
      });

      // Check for GraphQL errors
      if (response.errors && response.errors.length > 0) {
        const errorMessage = response.errors[0].message || 'Account creation failed';
        
        // Check for email already taken error
        if (errorMessage.toLowerCase().includes('email') || 
            errorMessage.toLowerCase().includes('already') ||
            errorMessage.toLowerCase().includes('exists')) {
          setAccountError('This email is already registered. Please log in instead.');
          setValue('createAccount', false);
          setShowPasswordFields(false);
          return;
        }
        
        setAccountError(errorMessage);
        return;
      }

      const customer = response.data?.registerCustomer?.customer;
      
      if (customer) {
        setAccountSuccess(true);
        
        // Auto-login after account creation
        try {
          // Use email as username for login (WooCommerce allows this)
          const loginResult = await login(email, accountPassword);
          
          if (loginResult.success) {
            // Clear Apollo cache to ensure fresh user data
            await client.clearStore();
            await client.resetStore();
            
            // Wait for cookies to be set
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Call success callback to populate form fields
            if (onAccountCreated) {
              onAccountCreated();
            }
          }
        } catch (loginError: any) {
          console.error('Auto-login after registration failed:', loginError);
          // Account was created but login failed - user can manually log in
          setAccountError('Account created successfully, but automatic login failed. Please log in manually.');
        }
      } else {
        setAccountError('Failed to create account. Please try again.');
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      
      // Handle GraphQL errors
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        const errorMessage = graphQLError.message || 'Account creation failed';
        
        // Check for email already taken
        if (errorMessage.toLowerCase().includes('email') || 
            errorMessage.toLowerCase().includes('already') ||
            errorMessage.toLowerCase().includes('exists')) {
          setAccountError('This email is already registered. Please log in instead.');
          setValue('createAccount', false);
          setShowPasswordFields(false);
          return;
        }
        
        setAccountError(errorMessage);
      } else if (error.networkError) {
        setAccountError('Network error. Please check your connection and try again.');
      } else {
        setAccountError('Failed to create account. Please try again.');
      }
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Trigger account creation when password field loses focus and has valid input
  const handlePasswordBlur = async () => {
    if (createAccount && accountPassword && accountPassword.length >= 8) {
      await handleAccountCreation();
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          {...register('createAccount')}
          onChange={handleCreateAccountChange}
          className="mt-1 h-4 w-4 cursor-pointer accent-black"
        />
        <div className="ml-3 flex-1">
          <span className="text-sm font-medium text-gray-900">
            Create an account?
          </span>
          <p className="text-xs text-gray-600 mt-1">
            Create an account to save your information for faster checkout next time.
          </p>
        </div>
      </label>

      {showPasswordFields && createAccount && (
        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
          {accountError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{accountError}</p>
            </div>
          )}
          
          {accountSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">Account created successfully! You are now logged in.</p>
            </div>
          )}

          <div>
            <label htmlFor="account-username" className="block text-sm font-medium text-gray-700 mb-1">
              Username (optional)
            </label>
            <input
              id="account-username"
              type="text"
              {...register('accountUsername')}
              placeholder={email.split('@')[0] || 'username'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              If left blank, your email will be used as your username.
            </p>
          </div>

          <div>
            <label htmlFor="account-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="account-password"
              type="password"
              {...register('accountPassword', {
                required: createAccount ? 'Password is required to create an account' : false,
                minLength: createAccount ? {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                } : undefined,
                validate: (value) => {
                  if (createAccount && value && value.length < 8) {
                    return 'Password must be at least 8 characters';
                  }
                  return true;
                },
              })}
              placeholder="Enter a password (min. 8 characters)"
              onBlur={handlePasswordBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm ${
                errors.accountPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.accountPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.accountPassword.message as string}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters. Use a strong password for security.
            </p>
            {isCreatingAccount && (
              <p className="text-xs text-blue-600 mt-1">Creating account...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccountCheckbox;

