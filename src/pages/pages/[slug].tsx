import type {
  NextPage,
  GetStaticProps,
  GetStaticPaths,
  InferGetStaticPropsType,
} from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import Layout from '@/components/Layout/Layout.component';
import BlockRenderer from '@/components/Blocks/BlockRenderer.component';
import client from '@/utils/apollo/ApolloClient';
import {
  GET_PAGE_BY_SLUG,
  GET_ALL_PAGE_SLUGS,
} from '@/utils/gql/GQL_QUERIES';

interface Page {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  content: string;
  date: string;
  editorBlocks?: any[];
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    } | null;
  } | null;
}

interface PageProps {
  page: Page | null;
  error?: string;
}

const DynamicPage: NextPage<PageProps> = ({
  page,
  error,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [imageError, setImageError] = useState(false);

  if (error || !page) {
    return (
      <Layout title="Page Not Found">
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h1>
              <p className="text-gray-600 mb-8">{error || 'The page you are looking for does not exist.'}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={page.title}>
      <Head>
        <title>{page.title} | NW</title>
        <meta
          name="description"
          content={`${page.title} page`}
        />
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <article>
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              {page.title}
            </h1>

            {/* Featured Image */}
            {page.featuredImage?.node?.sourceUrl && !imageError && (
              <div className="relative w-full h-64 md:h-96 mb-8 rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src={page.featuredImage.node.sourceUrl}
                  alt={page.featuredImage.node.altText || page.title}
                  fill
                  className="object-cover rounded-2xl"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  style={{
                    objectFit: 'cover',
                  }}
                  onError={() => setImageError(true)}
                  unoptimized={
                    page.featuredImage.node.sourceUrl.includes('localhost') ||
                    page.featuredImage.node.sourceUrl.includes('127.0.0.1') ||
                    page.featuredImage.node.sourceUrl.includes('moleculestore.local')
                  }
                />
              </div>
            )}

            {/* Content */}
            <BlockRenderer 
              editorBlocks={page.editorBlocks}
              fallbackContent={page.content}
            />
          </article>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { data } = await client.query({
      query: GET_ALL_PAGE_SLUGS,
    });

    const paths =
      data.pages?.nodes?.map((page: { slug: string }) => ({
        params: { slug: page.slug },
      })) || [];

    return {
      paths,
      fallback: 'blocking', // Generate pages on-demand if not found
    };
  } catch (error) {
    console.error('Error fetching page slugs:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const slug = params?.slug as string;

    if (!slug) {
      return {
        props: {
          page: null,
          error: 'Page slug is required',
        },
      };
    }

    // WordPress pages use URI format, typically just the slug for root-level pages
    const uri = `/${slug}/`;

    const { data } = await client.query({
      query: GET_PAGE_BY_SLUG,
      variables: { uri },
    });

    if (!data.pageBy) {
      return {
        props: {
          page: null,
          error: 'Page not found',
        },
        notFound: true,
      };
    }

    return {
      props: {
        page: data.pageBy,
        error: null,
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error: any) {
    console.error('Error fetching page:', error);
    return {
      props: {
        page: null,
        error: error.message || 'Failed to fetch page',
      },
    };
  }
};

export default DynamicPage;

