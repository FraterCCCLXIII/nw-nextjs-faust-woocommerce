import { useQuery } from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { IProductRootObject } from '@/utils/functions/functions';

interface CheckoutOrderSummaryProps {
  className?: string;
}

const CheckoutOrderSummary = ({ className = '' }: CheckoutOrderSummaryProps) => {
  const { data, loading } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  if (loading) {
    return (
      <aside className={className}>
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">Loading order summary...</p>
        </div>
      </aside>
    );
  }

  const cartItems = data?.cart?.contents?.nodes || [];
  const cartTotal = data?.cart?.total || '$0.00';
  const subtotal = data?.cart?.subtotal || '$0.00';

  if (!cartItems.length) {
    return (
      <aside className={className}>
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Order summary</h2>
          <p className="text-gray-600">Your cart is empty.</p>
          <Link href="/catalog" className="text-blue-600 hover:underline mt-4 inline-block">
            Continue shopping
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className={className}>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Order summary</h2>
        </div>

        {/* Cart Items */}
        <div className="p-6 border-b border-gray-200 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {cartItems.map((item: IProductRootObject) => (
              <div key={item.key} className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 relative">
                  <Image
                    src={item.product.node.image?.sourceUrl || '/placeholder.png'}
                    alt={item.product.node.name}
                    fill
                    sizes="64px"
                    className="rounded object-cover"
                    unoptimized={
                      item.product.node.image?.sourceUrl?.includes('localhost') ||
                      item.product.node.image?.sourceUrl?.includes('127.0.0.1')
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {item.product.node.name}
                  </h3>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">{item.subtotal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">Calculated at next step</span>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-base font-semibold text-gray-900">{cartTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CheckoutOrderSummary;

