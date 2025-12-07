import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { login } from '../../utils/auth';
import { InputField } from '../Input/InputField.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
import Button from '../UI/Button.component';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';

interface ILoginData {
  username: string;
  password: string;
}

/**
 * User login component that handles user authentication
 * @function UserLogin
 * @returns {JSX.Element} - Rendered component with login form
 */
const UserLogin = () => {
  const methods = useForm<ILoginData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Refetch query to verify login
  const { refetch: refetchUser } = useQuery(GET_CURRENT_USER, {
    skip: true, // Don't run automatically
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  const onSubmit = async (data: ILoginData) => {
    console.log('[UserLogin] Form submitted, starting login...');
    setLoading(true);
    setError(null);
    try {
      console.log('[UserLogin] Calling login function...');
      const result = await login(data.username, data.password);
      console.log('[UserLogin] Login result:', result);
      
      if (result.success && result.status === 'SUCCESS') {
        console.log('[UserLogin] Login successful, waiting for cookies...');
        // Wait a moment for cookies to be set and cache to clear
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('[UserLogin] Wait complete, refetching user data...');
        
        // Refetch user data to verify login worked
        try {
          const { data: userData, error: refetchError } = await refetchUser();
          console.log('[UserLogin] Refetch result:', { 
            hasCustomer: !!userData?.customer,
            customerId: userData?.customer?.id,
            customerEmail: userData?.customer?.email,
            customerFirstName: userData?.customer?.firstName,
            customerUsername: userData?.customer?.username,
            fullCustomerData: userData?.customer,
            error: refetchError 
          });
          
          // Check if customer is actually authenticated (not guest)
          if (userData?.customer?.id === 'guest' || userData?.customer?.id === 'cGd1ZXN0') {
            console.warn('[UserLogin] WARNING: Customer ID is "guest" - user may not be fully authenticated');
            console.warn('[UserLogin] This could indicate cookies are not being set properly');
          }
          
          if (!userData?.customer) {
            console.warn('[UserLogin] User data not available after login, but continuing...');
          } else {
            console.log('[UserLogin] User data confirmed, proceeding with redirect');
          }
        } catch (refetchError) {
          console.warn('[UserLogin] Error refetching user:', refetchError);
          // Continue anyway - cookies might be set even if query fails
        }

        // Check for return URL
        const returnUrl = typeof window !== 'undefined' ? sessionStorage.getItem('loginReturnUrl') : null;
        console.log('[UserLogin] Return URL:', returnUrl);
        
        // TEMPORARILY DISABLED: Prevent redirect to capture logs
        console.log('[UserLogin] REDIRECT DISABLED FOR DEBUGGING - Login successful!');
        console.log('[UserLogin] Would redirect to:', returnUrl && returnUrl !== '/login' && returnUrl !== '/account' ? `${returnUrl}?login=success` : '/account?login=success');
        
        // if (returnUrl && returnUrl !== '/login' && returnUrl !== '/account') {
        //   // Clear return URL and redirect
        //   if (typeof window !== 'undefined') {
        //     sessionStorage.removeItem('loginReturnUrl');
        //   }
        //   console.log('[UserLogin] Redirecting to return URL:', returnUrl);
        //   // Use replace with a query param to signal successful login
        //   router.replace(`${returnUrl}?login=success`);
        // } else {
        //   console.log('[UserLogin] Redirecting to /account');
        //   // Use replace with query param to signal successful login
        //   router.replace('/account?login=success');
        // }
      } else {
        console.error('[UserLogin] Login result indicates failure:', result);
        throw new Error('Failed to login');
      }
    } catch (error: unknown) {
      console.error('[UserLogin] Login error caught:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
      console.log('[UserLogin] Login process complete');
    }
  };

  return (
    <section className="text-gray-700 container p-4 py-2 mx-auto mb-[8rem] md:mb-0">
      <div className="mx-auto lg:w-1/2">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Log In
        </h1>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <label htmlFor="username" className="block pb-2 text-sm font-medium text-gray-700">
                  Username or email
                </label>
                <input
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-black focus:border-black block w-full p-2.5 placeholder-gray-400"
                  id="username"
                  placeholder="Username or email"
                  type="text"
                  {...methods.register('username', { required: true })}
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

              {error && (
                <div className="w-full text-red-600 text-sm text-center">
                  {error}
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
        </FormProvider>
      </div>
    </section>
  );
};

export default UserLogin;
