// Imports
import Image from 'next/image';
import Link from 'next/link';
import Button from '../UI/Button.component';
import CreateAccountAfterCheckout from './CreateAccountAfterCheckout.component';

interface OrderItem {
  id: string;
  productId: number | null;
  quantity: number;
  subtotal: string;
  total: string;
  product: {
    node: {
      id: string;
      name: string;
      image: {
        sourceUrl: string;
        altText: string;
      } | null;
    };
  } | null;
  variation: {
    node: {
      id: string;
      name: string;
      image: {
        sourceUrl: string;
        altText: string;
      } | null;
    };
  } | null;
}

interface BillingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
  email: string;
  phone?: string;
  company?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
}

interface OrderData {
  id: string;
  databaseId: number;
  orderNumber: string;
  orderKey: string;
  status: string;
  date: string;
  total: string;
  subtotal: string;
  totalTax: string;
  shippingTotal: string;
  paymentMethod: string;
  paymentMethodTitle: string;
  currency: string;
  billing: BillingAddress;
  shipping: ShippingAddress;
  lineItems: {
    nodes: OrderItem[];
  };
}

interface CheckoutConfirmationProps {
  order: OrderData;
}

const CheckoutConfirmation = ({ order }: CheckoutConfirmationProps) => {
  const formatAddress = (address: BillingAddress | ShippingAddress) => {
    const parts = [
      address.address1,
      address.address2,
      `${address.city}, ${address.state || ''} ${address.postcode}`.trim(),
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getProductImage = (item: OrderItem) => {
    if (item.variation?.node?.image?.sourceUrl) {
      return item.variation.node.image.sourceUrl;
    }
    if (item.product?.node?.image?.sourceUrl) {
      return item.product.node.image.sourceUrl;
    }
    return '/placeholder.png';
  };

  const getProductName = (item: OrderItem) => {
    if (item.variation?.node?.name) {
      return item.variation.node.name;
    }
    if (item.product?.node?.name) {
      return item.product.node.name;
    }
    return 'Product';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Banner */}
      <div className="bg-white border-b border-gray-300 p-6 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
          Thank you for your order!
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          Your order has been received and is being processed
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Order Number:</span>
              <span className="ml-2 text-gray-900">#{order.orderNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Order Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(order.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Order Status:</span>
              <span className="ml-2 text-gray-900 capitalize">{order.status}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Payment Method:</span>
              <span className="ml-2 text-gray-900">
                {order.paymentMethodTitle || order.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.lineItems.nodes.map((item) => (
              <div
                key={item.id}
                className="flex items-center border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex-shrink-0 w-20 h-20 relative mr-4">
                  <Image
                    src={getProductImage(item)}
                    alt={getProductName(item)}
                    fill
                    sizes="80px"
                    className="rounded object-cover"
                    unoptimized={
                      getProductImage(item).includes('localhost') ||
                      getProductImage(item).includes('127.0.0.1')
                    }
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900">{getProductName(item)}</h4>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{item.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Totals */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-semibold text-gray-900">{order.subtotal}</span>
          </div>
          {parseFloat(order.shippingTotal) > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Shipping:</span>
              <span className="font-semibold text-gray-900">{order.shippingTotal}</span>
            </div>
          )}
          {parseFloat(order.totalTax) > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Tax:</span>
              <span className="font-semibold text-gray-900">{order.totalTax}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-xl font-bold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-gray-900">{order.total}</span>
          </div>
        </div>
      </div>

      {/* Billing and Shipping Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Billing Address */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Billing Address</h3>
          <div className="text-gray-700 space-y-1">
            <p className="font-semibold">
              {order.billing.firstName} {order.billing.lastName}
            </p>
            {order.billing.company && <p>{order.billing.company}</p>}
            <p>{formatAddress(order.billing)}</p>
            {order.billing.phone && <p>Phone: {order.billing.phone}</p>}
            <p>Email: {order.billing.email}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h3>
          <div className="text-gray-700 space-y-1">
            <p className="font-semibold">
              {order.shipping.firstName} {order.shipping.lastName}
            </p>
            <p>{formatAddress(order.shipping)}</p>
          </div>
        </div>
      </div>

      {/* Create Account After Checkout (Recommended) */}
      <div className="mb-8">
        <CreateAccountAfterCheckout
          email={order.billing.email}
          firstName={order.billing.firstName}
          lastName={order.billing.lastName}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/catalog" passHref>
          <Button variant="secondary">Continue Shopping</Button>
        </Link>
        <Link href="/" passHref>
          <Button variant="primary">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default CheckoutConfirmation;

