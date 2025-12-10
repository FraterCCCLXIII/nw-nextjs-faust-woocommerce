import { useQuery } from '@apollo/client';
import Link from 'next/link';
// import { getApolloAuthClient } from '@faustwp/core'; // Removed Faust.js auth client
import { GET_CURRENT_USER, GET_CUSTOMER_ORDERS } from '@/utils/gql/GQL_QUERIES';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

const AccountDashboard = () => {
  // const authClient = getApolloAuthClient(); // Removed Faust.js auth client
  
  const { data: customerData, loading: customerLoading } = useQuery(GET_CURRENT_USER, {
    // client: authClient, // Removed client specific to Faust.js auth
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  const { data: ordersData, loading: ordersLoading } = useQuery(GET_CUSTOMER_ORDERS, {
    // client: authClient, // Removed client specific to Faust.js auth
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  if (customerLoading || ordersLoading) {
    return <LoadingSpinner />;
  }

  const customer = customerData?.customer;
  const orders = ordersData?.customer?.orders?.nodes || [];
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="woocommerce-MyAccount-content">
      <div className="woocommerce-notices-wrapper"></div>
      
      <p className="mb-4">
        Hello <strong>{customer?.firstName || customer?.email || 'there'}</strong>
        {customer?.firstName && customer?.lastName && (
          <> ({customer.firstName} {customer.lastName})</>
        )}
      </p>

      <p className="mb-6 text-gray-600">
        From your account dashboard you can view your{' '}
        <Link href="/account/orders" className="text-gray-900 underline hover:text-gray-700">
          recent orders
        </Link>
        , manage your{' '}
        <Link href="/account/addresses" className="text-gray-900 underline hover:text-gray-700">
          shipping and billing addresses
        </Link>
        , and{' '}
        <Link href="/account/account-details" className="text-gray-900 underline hover:text-gray-700">
          edit your password and account details
        </Link>
        .
      </p>

      {recentOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
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
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">#{order.orderNumber}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.total}</td>
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
          {orders.length > 5 && (
            <div className="mt-4">
              <Link
                href="/account/orders"
                className="text-gray-900 underline hover:text-gray-700 text-sm"
              >
                View all orders →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountDashboard;

