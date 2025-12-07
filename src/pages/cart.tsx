// Components
import CartLayout from '@/components/Layout/CartLayout.component';
import CartContents from '@/components/Cart/CartContents.component';

// Types
import type { NextPage } from 'next';

const Cart: NextPage = () => (
  <CartLayout title="Cart">
    <CartContents />
  </CartLayout>
);

export default Cart;

