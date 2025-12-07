// Imports
import Head from 'next/head';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useQuery } from '@apollo/client';

// Components
import Header from '@/components/Header/Header.component';
import ShippingBanner from './ShippingBanner.component';
import Logo from '@/components/UI/Logo.component';
import CartIcon from '@/components/UI/icons/CartIcon.component';
import { useCartStore } from '@/stores/cartStore';
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';

interface ICartLayoutProps {
  children?: ReactNode;
  title: string;
}

/**
 * Renders a layout specifically for cart page.
 * Features header but no footer - uses sticky footer for checkout actions instead.
 * @function CartLayout
 * @param {ReactNode} children - Children to be rendered by CartLayout component
 * @param {string} title - Title for the page. Is set in <title>{title}</title>
 * @returns {JSX.Element} - Rendered component
 */
const CartLayout = ({ children, title }: ICartLayoutProps) => {
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart?.totalProductsCount || 0;

  // Check if user is authenticated
  const { data } = useQuery(GET_CURRENT_USER, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const loggedIn = !!data?.customer;

  return (
    <>
      <Head>
        <title>{`${title} - Molecule`}</title>
        <meta name="description" content="Your shopping cart" />
      </Head>
      <div className="flex flex-col min-h-screen w-full mx-auto">
        <ShippingBanner />
        <Header title={title} />
        <main className="flex-1 pb-32">{children}</main>
        {/* No Footer or Stickynav - using sticky footer in CartContents instead */}
      </div>
    </>
  );
};

export default CartLayout;

