// Components
import CheckoutLayout from '@/components/Layout/CheckoutLayout.component';
import CheckoutForm from '@/components/Checkout/CheckoutForm.component';

// Types
import type { NextPage } from 'next';

const Checkout: NextPage = () => (
  <CheckoutLayout title="Checkout">
    <CheckoutForm />
  </CheckoutLayout>
);

export default Checkout;

