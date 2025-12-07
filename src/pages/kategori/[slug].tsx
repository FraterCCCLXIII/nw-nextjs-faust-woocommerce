import { GetServerSideProps } from 'next';

/**
 * Redirect from Norwegian slug /kategori/[slug] to English /category/[slug]
 * Maintains backward compatibility for old links
 */
export const getServerSideProps: GetServerSideProps = async ({
  params,
  query,
  res,
}) => {
  const slug = params?.slug;
  const id = query.id;
  
  if (slug) {
    // If there's an ID query param, include it in the redirect
    const redirectUrl = id ? `/category/${slug}?id=${id}` : `/category/${slug}`;
    res.setHeader('Location', redirectUrl);
    res.statusCode = 301;
    res.end();
  }
  
  return { props: {} };
};

// This component will never render due to the redirect
export default function KategoriRedirect() {
  return null;
}
