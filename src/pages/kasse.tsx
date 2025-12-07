import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

/**
 * Redirect from Norwegian slug /kasse to English /checkout
 * Maintains backward compatibility for old links
 */
const Kasse: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/checkout');
  }, [router]);

  return null;
};

export default Kasse;
