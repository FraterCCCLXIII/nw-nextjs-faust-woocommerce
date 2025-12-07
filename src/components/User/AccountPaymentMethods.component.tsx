const AccountPaymentMethods = () => {
  // Payment methods functionality would require additional GraphQL queries
  // For now, showing a placeholder that matches WooCommerce structure

  return (
    <div className="woocommerce-MyAccount-content">
      <h2 className="text-2xl font-bold mb-6">Payment methods</h2>
      
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No payment methods saved yet.</p>
        <p className="text-sm text-gray-500">
          Payment methods will appear here when you save them during checkout.
        </p>
      </div>
    </div>
  );
};

export default AccountPaymentMethods;

