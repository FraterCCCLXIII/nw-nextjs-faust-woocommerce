import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { GET_CUSTOMER_ORDERS } from '../../utils/gql/GQL_QUERIES';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
import { logout } from '../../utils/auth';

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  total: string;
  date: string;
}

/**
 * Formats order status by replacing underscores with spaces
 * @param {string} status - Order status (e.g., "ON_HOLD")
 * @returns {string} - Formatted status (e.g., "ON HOLD")
 */
const formatStatus = (status: string): string => {
  return status.replace(/_/g, ' ');
};

/**
 * Customer account component that displays user's orders
 * @function CustomerAccount
 * @returns {JSX.Element} - Rendered component with order history
 */
const CustomerAccount = () => {
  // Use network-only to prevent showing cached data after logout
  const { loading, error, data } = useQuery(GET_CUSTOMER_ORDERS, {
    fetchPolicy: 'network-only', // Always fetch from network, never use cache
    errorPolicy: 'all',
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Logout will handle redirect, so we don't need to reset state
      await logout();
      // Note: logout() performs a full page redirect, so code after this won't execute
    } catch (error) {
      console.error('Logout error:', error);
      // Even on error, logout should redirect, but reset state just in case
      setIsLoggingOut(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  
  // If there's an error or no customer data, don't show content
  // The withAuth HOC should handle redirect, but this is a safety check
  if (error || !data?.customer) {
    return null;
  }

  const orders = data?.customer?.orders?.nodes;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders && orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Order Number</th>
                <th className="py-2 px-4 border-b text-left">Date</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr key={order.id}>
                  <td className="py-2 px-4 border-b">{order.orderNumber}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>You have no orders.</p>
      )}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>
    </div>
  );
};

export default CustomerAccount;
