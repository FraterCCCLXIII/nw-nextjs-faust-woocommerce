import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

/**
 * Redirect from Norwegian slug /produkter to English /catalog
 * Maintains backward compatibility for old links
 */
const Produkter: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/catalog');
  }, [router]);

  return null;
};

export default Produkter;
