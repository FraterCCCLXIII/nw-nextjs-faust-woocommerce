import type {
  NextPage,
  GetStaticProps,
  GetStaticPaths,
  InferGetStaticPropsType,
} from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { flatListToHierarchical } from '@faustwp/core';
import { WordPressBlocksViewer } from '@faustwp/blocks';
import Layout from '@/components/Layout/Layout.component';
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
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // If this is a known route, let Next.js handle it
  const slug = router.query.slug as string[];
  const path = slug ? `/${slug.join('/')}` : '';

  // Known routes that should not be handled here
  const knownRoutes = [
    '/catalog',
    '/cart',
    '/checkout',
    '/account',
    '/login',
    '/articles',
    '/categories',
    '/category',
    '/product',
  ];

  if (knownRoutes.some(route => path.startsWith(route))) {
    return null;
  }

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
            {page.editorBlocks && page.editorBlocks.length > 0 ? (
              <WordPressBlocksViewer 
                blocks={flatListToHierarchical(page.editorBlocks, {
                  childrenKey: 'innerBlocks',
                })} 
              />
            ) : (
              <div
                className="prose prose-lg max-w-none product-detail-content"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            )}
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
        params: { slug: [page.slug] },
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
    const slugArray = params?.slug as string[];
    const slug = slugArray ? slugArray.join('/') : '';

    if (!slug) {
      return {
        props: {
          page: null,
          error: 'Page slug is required',
        },
      };
    }

    // WordPress pages use URI format
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

    // Fix image URLs in editorBlocks
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:8080';
    const fixedPage = {
      ...data.pageBy,
      editorBlocks: data.pageBy.editorBlocks?.map((block: any) => {
        // Fix renderedHtml URLs
        if (block.renderedHtml) {
          let fixedHtml = block.renderedHtml;
          // Fix malformed URLs like http://localhost:3000:8080
          fixedHtml = fixedHtml.replace(/http:\/\/localhost:3000:8080/g, wordpressUrl);
          // Fix relative URLs in src attributes
          fixedHtml = fixedHtml.replace(/src="\/([^"]+)"/g, `src="${wordpressUrl}/$1"`);
          // Fix URLs that incorrectly use localhost:3000
          fixedHtml = fixedHtml.replace(/src="http:\/\/localhost:3000\/([^"]+)"/g, `src="${wordpressUrl}/$1"`);
          return { ...block, renderedHtml: fixedHtml };
        }
        // Fix attributes URLs
        if (block.attributes) {
          const fixedAttrs = { ...block.attributes };
          if (fixedAttrs.src) {
            if (fixedAttrs.src.includes(':3000:8080')) {
              fixedAttrs.src = fixedAttrs.src.replace(':3000:8080', ':8080');
            } else if (fixedAttrs.src.startsWith('/') && !fixedAttrs.src.startsWith('//')) {
              fixedAttrs.src = `${wordpressUrl}${fixedAttrs.src}`;
            } else if (fixedAttrs.src.startsWith('http://localhost:3000')) {
              fixedAttrs.src = fixedAttrs.src.replace('http://localhost:3000', wordpressUrl);
            }
          }
          if (fixedAttrs.url) {
            if (fixedAttrs.url.includes(':3000:8080')) {
              fixedAttrs.url = fixedAttrs.url.replace(':3000:8080', ':8080');
            } else if (fixedAttrs.url.startsWith('/') && !fixedAttrs.url.startsWith('//')) {
              fixedAttrs.url = `${wordpressUrl}${fixedAttrs.url}`;
            } else if (fixedAttrs.url.startsWith('http://localhost:3000')) {
              fixedAttrs.url = fixedAttrs.url.replace('http://localhost:3000', wordpressUrl);
            }
          }
          return { ...block, attributes: fixedAttrs };
        }
        return block;
      }),
    };

    return {
      props: {
        page: fixedPage,
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

