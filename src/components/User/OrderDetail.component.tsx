import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_ORDER_BY_NUMBER } from '@/utils/gql/GQL_QUERIES';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';
import Image from 'next/image';

interface OrderDetailProps {
  orderNumber: string;
}

const OrderDetail = ({ orderNumber }: OrderDetailProps) => {
  const { data, loading, error } = useQuery(GET_ORDER_BY_NUMBER, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !data?.customer?.orders?.nodes?.length) {
    return (
      <div className="woocommerce-MyAccount-content">
        <p className="text-red-600 mb-4">
          {error ? 'Error loading order details. Please try again later.' : 'Order not found.'}
        </p>
        <Link
          href="/account#orders"
          className="text-gray-900 underline hover:text-gray-700"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  // Find the order matching the orderNumber
  const order = data.customer.orders.nodes.find(
    (o: any) => o.orderNumber === orderNumber || o.orderNumber === String(orderNumber)
  );

  if (!order) {
    return (
      <div className="woocommerce-MyAccount-content">
        <p className="text-red-600 mb-4">Order not found.</p>
        <Link
          href="/account#orders"
          className="text-gray-900 underline hover:text-gray-700"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }
  const lineItems = order.lineItems?.nodes || [];

  return (
    <div className="woocommerce-MyAccount-content">
      <div className="mb-6">
        <Link
          href="/account#orders"
          className="text-gray-600 hover:text-gray-900 underline text-sm mb-4 inline-block"
        >
          ← Back to Orders
        </Link>
        <h2 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h2>
        <p className="text-gray-600 text-sm">
          Date: {new Date(order.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">{order.subtotal}</span>
          </div>
          {order.shippingTotal && parseFloat(order.shippingTotal) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">{order.shippingTotal}</span>
            </div>
          )}
          {order.discountTotal && parseFloat(order.discountTotal) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount:</span>
              <span className="text-gray-900">-{order.discountTotal}</span>
            </div>
          )}
          {order.totalTax && parseFloat(order.totalTax) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-900">{order.totalTax}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-base">
            <span>Total:</span>
            <span>{order.total}</span>
          </div>
        </div>
        {order.paymentMethodTitle && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Payment Method: <span className="font-medium text-gray-900">{order.paymentMethodTitle}</span>
            </p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
        <div className="space-y-4">
          {lineItems.map((item: any) => {
            const product = item.product?.node;
            const variation = item.variation?.node;
            const displayName = variation?.name || product?.name || 'Product';
            const image = variation?.image?.sourceUrl || product?.image?.sourceUrl;
            const altText = variation?.image?.altText || product?.image?.altText || displayName;

            return (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                {image && (
                  <div className="flex-shrink-0">
                    <Image
                      src={image}
                      alt={altText}
                      width={80}
                      height={80}
                      className="rounded object-cover"
                      unoptimized={image.includes('localhost') || image.includes('127.0.0.1') || image.includes('moleculestore.local')}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {product?.slug ? (
                      <Link
                        href={`/product/${product.slug}`}
                        className="hover:text-gray-700 underline"
                      >
                        {displayName}
                      </Link>
                    ) : (
                      displayName
                    )}
                  </h4>
                  {variation?.attributes?.nodes?.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                      {variation.attributes.nodes.map((attr: any, idx: number) => (
                        <span key={idx}>
                          {attr.name}: {attr.value}
                          {idx < variation.attributes.nodes.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{item.total}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping and Billing Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
          <div className="text-sm text-gray-700">
            {order.billing && (
              <>
                <p className="font-medium">
                  {order.billing.firstName} {order.billing.lastName}
                </p>
                {order.billing.company && <p>{order.billing.company}</p>}
                <p>{order.billing.address1}</p>
                {order.billing.address2 && <p>{order.billing.address2}</p>}
                <p>
                  {order.billing.city}, {order.billing.state} {order.billing.postcode}
                </p>
                <p>{order.billing.country}</p>
                {order.billing.email && <p className="mt-2">{order.billing.email}</p>}
                {order.billing.phone && <p>{order.billing.phone}</p>}
              </>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
          <div className="text-sm text-gray-700">
            {order.shipping && (
              <>
                <p className="font-medium">
                  {order.shipping.firstName} {order.shipping.lastName}
                </p>
                {order.shipping.company && <p>{order.shipping.company}</p>}
                <p>{order.shipping.address1}</p>
                {order.shipping.address2 && <p>{order.shipping.address2}</p>}
                <p>
                  {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
                </p>
                <p>{order.shipping.country}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


