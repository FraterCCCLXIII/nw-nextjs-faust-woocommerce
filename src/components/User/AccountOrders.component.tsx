import { useQuery } from '@apollo/client';
import Link from 'next/link';
// import { getApolloAuthClient } from '@faustwp/core'; // Removed Faust.js auth client
import { GET_CUSTOMER_ORDERS } from '@/utils/gql/GQL_QUERIES';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

const AccountOrders = () => {
  // const authClient = getApolloAuthClient(); // Removed Faust.js auth client
  
  const { data, loading, error } = useQuery(GET_CUSTOMER_ORDERS, {
    // client: authClient, // Removed client specific to Faust.js auth
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !data?.customer) {
    return (
      <div className="woocommerce-MyAccount-content">
        <p className="text-red-600">Error loading orders. Please try again later.</p>
      </div>
    );
  }

  const orders = data.customer.orders?.nodes || [];

  return (
    <div className="woocommerce-MyAccount-content">
      <h2 className="text-2xl font-bold mb-6">Orders</h2>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Order</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Total</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">#{order.orderNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{order.total}</td>
                  <td className="py-3 px-4 text-sm">
                    <Link
                      href={`/account/orders/${order.orderNumber}`}
                      className="text-gray-900 underline hover:text-gray-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You have no orders yet.</p>
          <Link
            href="/catalog"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default AccountOrders;

