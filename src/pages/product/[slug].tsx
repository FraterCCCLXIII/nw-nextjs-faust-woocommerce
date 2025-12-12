// Imports
import { withRouter } from 'next/router';

// Components
import SingleProduct from '@/components/Product/SingleProduct.component';
import Layout from '@/components/Layout/Layout.component';

// Utilities
import client from '@/utils/apollo/ApolloClient';

// Types
import type {
  NextPage,
  GetServerSideProps,
  InferGetServerSidePropsType,
} from 'next';

// GraphQL
import { GET_SINGLE_PRODUCT } from '@/utils/gql/GQL_QUERIES';

/**
 * Display a single product with dynamic pretty urls
 * @function Product
 * @param {InferGetServerSidePropsType<typeof getServerSideProps>} product
 * @returns {JSX.Element} - Rendered component
 */
const Product: NextPage = ({
  product,
  networkStatus,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const hasError = networkStatus === '8';
  return (
    <Layout title={`${product.name ? product.name : ''}`}>
      {product ? (
        <SingleProduct product={product} />
      ) : (
        <div className="mt-8 text-2xl text-center">Loading product...</div>
      )}
      {hasError && (
        <div className="mt-8 text-2xl text-center">
          Error loading product...
        </div>
      )}
    </Layout>
  );
};

export default withRouter(Product);

export const getServerSideProps: GetServerSideProps = async ({
  params,
  query,
  res,
}) => {
  // Handle legacy URLs with ID parameter by removing it
  if (query.id) {
    res.setHeader('Location', `/product/${params?.slug}`);
    res.statusCode = 301;
    res.end();
    return { props: {} };
  }

  try {
    const { data, loading, networkStatus, errors } = await client.query({
      query: GET_SINGLE_PRODUCT,
      variables: { slug: params?.slug },
      errorPolicy: 'all', // Continue even if there are errors
    });

    if (errors) {
      console.error('GraphQL errors:', errors);
    }

    if (!data || !data.product) {
      return {
        notFound: true,
      };
    }

    return {
      props: { product: data.product, loading, networkStatus },
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      notFound: true,
    };
  }
};

