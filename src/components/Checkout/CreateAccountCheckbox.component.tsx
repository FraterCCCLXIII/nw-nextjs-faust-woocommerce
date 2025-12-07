"use client";

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface CreateAccountCheckboxProps {
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Component for creating account during checkout
 * Allows customers to create an account before placing their order
 */
const CreateAccountCheckbox = ({ email, firstName, lastName }: CreateAccountCheckboxProps) => {
  const { register, watch, setValue } = useFormContext();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const createAccount = watch('createAccount');

  const handleCreateAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setValue('createAccount', checked);
    setShowPasswordFields(checked);
    
    if (!checked) {
      setValue('accountPassword', '');
      setValue('accountUsername', '');
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
              })}
              placeholder="Enter a password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters. Use a strong password for security.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccountCheckbox;

