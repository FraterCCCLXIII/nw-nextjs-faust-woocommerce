import { GetServerSideProps } from 'next';

/**
 * Redirect from Norwegian slug /produkt/[slug] to English /product/[slug]
 * Maintains backward compatibility for old links
 */
export const getServerSideProps: GetServerSideProps = async ({
  params,
  res,
}) => {
  const slug = params?.slug;
  
  if (slug) {
    res.setHeader('Location', `/product/${slug}`);
    res.statusCode = 301;
    res.end();
  }
  
  return { props: {} };
};

// This component will never render due to the redirect
export default function ProduktRedirect() {
  return null;
}
