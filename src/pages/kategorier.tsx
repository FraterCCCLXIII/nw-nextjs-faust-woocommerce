import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

/**
 * Redirect from Norwegian slug /kategorier to English /categories
 * Maintains backward compatibility for old links
 */
const Kategorier: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/categories');
  }, [router]);

  return null;
};

export default Kategorier;
