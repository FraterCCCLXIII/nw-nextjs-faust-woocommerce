import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useForm, FormProvider } from 'react-hook-form';
import { CREATE_USER } from '../../utils/gql/GQL_MUTATIONS';
import { InputField } from '../Input/InputField.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
import Button from '../UI/Button.component';
import Link from 'next/link';

interface IRegistrationData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * User registration component that handles WooCommerce customer creation
 * @function UserRegistration
 * @returns {JSX.Element} - Rendered component with registration form
 */
const UserRegistration = () => {
  const methods = useForm<IRegistrationData>();
  const [registerUser, { loading }] = useMutation(CREATE_USER);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: IRegistrationData) => {
    setError(null);
    console.log('[UserRegistration] Submitting registration with data:', {
      username: data.username,
      email: data.email,
      hasPassword: !!data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    
    try {
      const response = await registerUser({
        variables: data,
      });
      
      console.log('[UserRegistration] Registration response:', response);

      // Check for GraphQL errors in the response first
      if (response.errors && response.errors.length > 0) {
        const errorMessage = response.errors[0].message || 'Registration failed. Please check your information and try again.';
        setError(errorMessage);
        return;
      }

      const customer = response.data?.registerCustomer?.customer;
      if (customer) {
        setRegistrationCompleted(true);
      } else {
        setError('Failed to register customer. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      // Handle Apollo/GraphQL errors
      if (error && typeof error === 'object') {
        const apolloError = error as any;
        
        // Check for GraphQL errors
        if (apolloError.graphQLErrors && apolloError.graphQLErrors.length > 0) {
          const graphQLError = apolloError.graphQLErrors[0];
          setError(graphQLError.message || 'Registration failed. Please check your information and try again.');
          return;
        }
        
        // Check for network errors
        if (apolloError.networkError) {
          const networkError = apolloError.networkError;
          if (networkError.message === 'Failed to fetch') {
            setError('Unable to connect to the server. Please check your connection and try again.');
          } else {
            setError(networkError.message || 'Network error occurred. Please try again.');
          }
          return;
        }
      }
      
      // Handle standard Error objects
      if (error instanceof Error) {
        setError(error.message || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  if (registrationCompleted) {
    return (
      <div className="text-center my-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Registration successful!
        </h2>
        <p>You can now log in with your account.</p>
      </div>
    );
  }

  return (
    <section className="text-gray-700 container p-4 py-2 mx-auto mb-[8rem] md:mb-0">
      <div className="mx-auto lg:w-1/2">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Create Account
        </h1>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <label htmlFor="username" className="block pb-2 text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-black focus:border-black block w-full p-2.5 placeholder-gray-400"
                  id="username"
                  placeholder="Username"
                  type="text"
                  {...methods.register('username', { required: true })}
                />
              </div>
              <div className="w-full">
                <label htmlFor="email" className="block pb-2 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-black focus:border-black block w-full p-2.5 placeholder-gray-400"
                  id="email"
                  placeholder="Email"
                  type="email"
                  {...methods.register('email', { required: true })}
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
                  {...methods.register('password', { required: true })}
                />
              </div>
              <div className="w-full">
                <label htmlFor="firstName" className="block pb-2 text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-black focus:border-black block w-full p-2.5 placeholder-gray-400"
                  id="firstName"
                  placeholder="First Name"
                  type="text"
                  {...methods.register('firstName', { required: true })}
                />
              </div>
              <div className="w-full">
                <label htmlFor="lastName" className="block pb-2 text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-black focus:border-black block w-full p-2.5 placeholder-gray-400"
                  id="lastName"
                  placeholder="Last Name"
                  type="text"
                  {...methods.register('lastName', { required: true })}
                />
              </div>

              {error && (
                <div className="w-full text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="w-full mt-4">
                <Button variant="primary" buttonDisabled={loading} type="submit">
                  {loading ? <LoadingSpinner /> : 'Register'}
                </Button>
              </div>

              <div className="w-full mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-black font-semibold hover:underline">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default UserRegistration;
