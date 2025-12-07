import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

/**
 * Redirect from Norwegian slug /min-konto to English /account
 * Maintains backward compatibility for old links
 */
const MinKonto: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account');
  }, [router]);

  return null;
};

export default MinKonto;
