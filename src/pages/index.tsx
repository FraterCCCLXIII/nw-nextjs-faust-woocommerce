// Components
import Hero from '@/components/Index/Hero.component';
import HeroThreeColumn from '@/components/Index/HeroThreeColumn.component';
import TrustIndicators from '@/components/Index/TrustIndicators.component';
import StickyMediaSections from '@/components/Index/StickyMediaSections.component';
import TetherFeatures from '@/components/Index/TetherFeatures.component';
import Testimonials from '@/components/Index/Testimonials.component';
import ProductCarousel from '@/components/Index/ProductCarousel.component';
import HomeFAQ from '@/components/Index/HomeFAQ.component';
import Layout from '@/components/Layout/Layout.component';
import Link from 'next/link';

// Utilities
import client from '@/utils/apollo/ApolloClient';

// Types
import type { NextPage, GetStaticProps, InferGetStaticPropsType } from 'next';

// GraphQL
import { FETCH_ALL_PRODUCTS_QUERY } from '@/utils/gql/GQL_QUERIES';

/**
 * Main index page matching Medusa design
 * @function Index
 * @param {InferGetStaticPropsType<typeof getStaticProps>} products
 * @returns {JSX.Element} - Rendered component
 */

const Index: NextPage = ({
  products,
  error,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  // Transform WordPress products to match ProductCarousel format
  const carouselProducts = products?.map((product: any) => ({
    databaseId: product.databaseId,
    name: product.name,
    price: product.price || product.regularPrice || '',
    regularPrice: product.regularPrice || product.price || '',
    salePrice: product.salePrice,
    onSale: product.onSale || false,
    slug: product.slug,
    image: product.image,
  })) || [];

  return (
    <Layout title="Home">
      <div className="min-h-screen">
        {/* Hero Section */}
        <div id="top">
          <Hero />
        </div>
        
        {/* Three Column Hero Section */}
        <HeroThreeColumn />
        
        {/* Trust Indicators Section */}
        <div id="results">
          <TrustIndicators />
        </div>
        
        {/* Sticky Media Sections - Main Features */}
        <div id="features">
          <StickyMediaSections />
        </div>
        
        {/* Tether Features Section */}
        <TetherFeatures />
        
        {/* Testimonials Section */}
        <Testimonials />
        
        {/* Featured Products Carousel Section */}
        {carouselProducts && carouselProducts.length > 0 && (
          <section className="w-full py-12 md:py-16 bg-gradient-to-b from-tether-cream to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-tether-dark">
                  Featured Products
                </h2>
                <Link
                  href="/catalog"
                  className="text-tether-dark font-semibold hover:text-tether-dark/70 flex items-center gap-2 transition-colors"
                >
                  <span>Shop All</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 22 22"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      d="M5 12L18 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="square"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 6L19 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="square"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 18L19 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="square"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
              <ProductCarousel products={carouselProducts} />
            </div>
          </section>
        )}

        {error && (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Backend Connection Error:</strong> {error}
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    To fix this, update your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file with a valid WordPress GraphQL URL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <HomeFAQ />
      </div>
    </Layout>
  );
};

export default Index;

export const getStaticProps: GetStaticProps = async () => {
  try {
    const { data, loading, networkStatus } = await client.query({
      query: FETCH_ALL_PRODUCTS_QUERY,
    });

    return {
      props: {
        products: data?.products?.nodes || [],
        loading,
        networkStatus,
      },
      revalidate: 60,
    };
  } catch (error: any) {
    // Handle GraphQL errors gracefully - return empty products array
    // This allows the app to render even without a backend connection
    console.error('GraphQL Error:', error);
    const errorMessage = error?.message || 'Unable to connect to WordPress backend. Please configure NEXT_PUBLIC_GRAPHQL_URL in your .env.local file.';
    return {
      props: {
        products: [],
        loading: false,
        networkStatus: 8, // Error status
        error: errorMessage,
      },
      revalidate: 60,
    };
  }
};
