import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

/**
 * Redirect from Norwegian slug /handlekurv to English /cart
 * Maintains backward compatibility for old links
 */
const Handlekurv: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cart');
  }, [router]);

  return null;
};

export default Handlekurv;
