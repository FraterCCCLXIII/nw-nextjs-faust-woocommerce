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
  GET_PAGE_BY_SLUG_SIMPLE,
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
              <div className="wp-blocks">
                <WordPressBlocksViewer 
                  blocks={flatListToHierarchical(page.editorBlocks, {
                    childrenKey: 'innerBlocks',
                  })} 
                />
              </div>
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

    // WordPress pages use URI format - try multiple formats
    const uriFormats = [
      `/${slug}/`,  // Standard WordPress URI format
      `/${slug}`,   // Without trailing slash
      slug,         // Just the slug
    ];

    console.log('[getStaticProps] Fetching page with slug:', slug);
    console.log('[getStaticProps] Will try URI formats:', uriFormats);

    let result;
    let lastError: any = null;
    let successfulUri: string | null = null;
    let useSimpleQuery = false;
    
    // Try each URI format until one works
    // First try the full query with editorBlocks, then fall back to simplified if needed
    for (const uri of uriFormats) {
      try {
        console.log('[getStaticProps] Trying URI:', uri);
        
        // First attempt: Try full query with editorBlocks (if WPGraphQL Content Blocks plugin is installed)
        try {
          result = await client.query({
            query: GET_PAGE_BY_SLUG,
            variables: { uri },
            errorPolicy: 'all', // Return partial data even if there are errors
          });
          
          // Check if we got GraphQL errors related to editorBlocks
          if (result.errors && result.errors.length > 0) {
            const hasEditorBlocksError = result.errors.some((e: any) => 
              e.message?.includes('editorBlocks') || 
              e.message?.includes('Unknown type "Core') ||
              e.message?.includes('Cannot query field')
            );
            
            if (hasEditorBlocksError) {
              console.log('[getStaticProps] EditorBlocks not supported, falling back to simplified query...');
              // Fall back to simplified query
              result = await client.query({
                query: GET_PAGE_BY_SLUG_SIMPLE,
                variables: { uri },
                errorPolicy: 'all',
              });
              useSimpleQuery = true;
            }
          }
        } catch (queryError: any) {
          // If the full query fails completely, try simplified query
          console.log('[getStaticProps] Full query failed, trying simplified query...', queryError.message);
          result = await client.query({
            query: GET_PAGE_BY_SLUG_SIMPLE,
            variables: { uri },
            errorPolicy: 'all',
          });
          useSimpleQuery = true;
        }
        
        // If we got data and pageBy exists, break out of the loop
        if (result?.data?.pageBy) {
          console.log('[getStaticProps] Successfully found page with URI:', uri, useSimpleQuery ? '(using simplified query)' : '(using full query with editorBlocks)');
          successfulUri = uri;
          break;
        }
      } catch (queryError: any) {
        console.log('[getStaticProps] Query failed for URI:', uri, queryError.message);
        lastError = queryError;
        // Continue to next URI format
        continue;
      }
    }

    // If all URI formats failed, return error
    if (!result) {
      console.error('[getStaticProps] All URI formats failed. Last error:', lastError);
      return {
        props: {
          page: null,
          error: `Query failed: ${lastError?.message || 'Unknown error'}`,
        },
      };
    }

    const { data, errors } = result;

    // Check for GraphQL errors (should be minimal with simplified query)
    if (errors && errors.length > 0) {
      console.error('[getStaticProps] GraphQL errors:', errors);
      const errorMessages = errors.map((e: any) => e.message || String(e)).join(', ');
      
      // Only return error if it's not a "page not found" type error
      // Some GraphQL implementations return errors even when pageBy is null
      if (!data?.pageBy) {
        // This will be handled below
      } else {
        // If we have data but also errors, log but continue
        console.warn('[getStaticProps] GraphQL errors but data exists:', errorMessages);
      }
    }

    // Check if data exists
    if (!data) {
      console.error('[getStaticProps] No data returned from GraphQL query');
      return {
        props: {
          page: null,
          error: 'No data returned from server',
        },
      };
    }

    // Check if pageBy exists
    if (!data.pageBy) {
      console.error('[getStaticProps] No page found for slug:', slug);
      return {
        props: {
          page: null,
          error: `Page not found for slug: ${slug}`,
        },
        notFound: true,
      };
    }

    // Process the page data
    // If we used the simplified query, editorBlocks will be null/undefined
    // If we used the full query and editorBlocks is available, it will be included
    const fixedPage = {
      ...data.pageBy,
      // editorBlocks will be included if available from the full query
      // If null/undefined, the component will fall back to rendering content
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

