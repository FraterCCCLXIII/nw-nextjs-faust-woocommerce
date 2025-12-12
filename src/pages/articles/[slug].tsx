import type {
  NextPage,
  GetStaticProps,
  GetStaticPaths,
  InferGetStaticPropsType,
} from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Layout from '@/components/Layout/Layout.component';
import BlockRenderer from '@/components/Blocks/BlockRenderer.component';
import client from '@/utils/apollo/ApolloClient';
import {
  GET_POST_BY_SLUG,
  GET_ALL_POST_SLUGS,
  GET_ALL_POSTS,
} from '@/utils/gql/GQL_QUERIES';

interface Post {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  editorBlocks?: any[];
  author: {
    node: {
      name: string;
    };
  };
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
  categories: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
  tags: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
}

interface PostPageProps {
  post: Post | null;
  error?: string;
}

const ArticlePost: NextPage<PostPageProps> = ({
  post,
  error,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [imageError, setImageError] = useState(false);

  if (error || !post) {
    return (
      <Layout title="Post Not Found">
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Post Not Found
              </h1>
              <p className="text-gray-600 mb-8">{error || 'The post you are looking for does not exist.'}</p>
              <Link
                href="/articles"
                className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                ← Back to Articles
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Strip HTML from excerpt for subtitle
  const cleanExcerpt = post.excerpt
    ? post.excerpt.replace(/<[^>]*>/g, '').trim()
    : '';

  return (
    <Layout title={post.title}>
      <Head>
        <title>{post.title} | Articles | Molecule</title>
        <meta
          name="description"
          content={cleanExcerpt || 'Article from Molecule'}
        />
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Link
            href="/articles"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Articles
          </Link>

          <article>
            {/* Tags */}
            {post.tags?.nodes && post.tags.nodes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.nodes.map((tag: { slug: string; name: string }) => (
                  <span
                    key={tag.slug}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Byline */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              {post.author?.node?.name && (
                <span className="font-medium text-gray-900">
                  By {post.author.node.name}
                </span>
              )}
              {post.date && (
                <span className="text-gray-500">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>

            {/* Subtitle/Excerpt */}
            {cleanExcerpt && (
              <p className="text-xl text-gray-600 mb-8">{cleanExcerpt}</p>
            )}

            {/* Featured Image */}
            {post.featuredImage?.node?.sourceUrl && !imageError && (
              <div className="relative w-full h-64 md:h-96 mb-8 rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || post.title}
                  fill
                  className="object-cover rounded-2xl"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  style={{
                    objectFit: 'cover',
                  }}
                  onError={() => setImageError(true)}
                  unoptimized={
                    post.featuredImage.node.sourceUrl.includes('localhost') ||
                    post.featuredImage.node.sourceUrl.includes('127.0.0.1') ||
                    post.featuredImage.node.sourceUrl.includes('moleculestore.local')
                  }
                />
              </div>
            )}

            {/* Content */}
            {(() => {
              // Debug logging
              if (typeof window !== 'undefined') {
                console.log('[ArticlePost] Post data:', {
                  hasEditorBlocks: !!post.editorBlocks,
                  editorBlocksLength: post.editorBlocks?.length || 0,
                  hasContent: !!post.content,
                  contentLength: post.content?.length || 0,
                  contentPreview: post.content?.substring(0, 100),
                });
              }
              
              // If we have content but no editorBlocks, render content directly as fallback
              if (post.content && (!post.editorBlocks || post.editorBlocks.length === 0)) {
                return (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                );
              }
              
              return (
                <BlockRenderer 
                  editorBlocks={post.editorBlocks}
                  fallbackContent={post.content}
                />
              );
            })()}
          </article>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { data } = await client.query({
      query: GET_ALL_POST_SLUGS,
    });

    const paths =
      data.posts?.nodes?.map((post: { slug: string }) => ({
        params: { slug: post.slug },
      })) || [];

    return {
      paths,
      fallback: 'blocking', // Generate pages on-demand if not found
    };
  } catch (error) {
    console.error('Error fetching post slugs:', error);
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
          post: null,
          error: 'Post slug is required',
        },
      };
    }

    console.log('[getStaticProps] Fetching post with slug:', slug);
    console.log('[getStaticProps] GraphQL URL:', process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://moleculestore.local/graphql');

    let result;
    try {
      result = await client.query({
        query: GET_POST_BY_SLUG,
        variables: { slug },
        errorPolicy: 'all', // Return partial data even if there are errors
      });
      console.log('[getStaticProps] Query completed, result:', {
        hasData: !!result?.data,
        hasErrors: !!result?.errors,
        resultKeys: result ? Object.keys(result) : [],
      });
    } catch (queryError: any) {
      console.error('[getStaticProps] Query threw an exception:', queryError);
      console.error('[getStaticProps] Query error details:', {
        message: queryError.message,
        stack: queryError.stack,
        graphQLErrors: queryError.graphQLErrors,
        networkError: queryError.networkError,
      });
      return {
        props: {
          post: null,
          error: `Query failed: ${queryError.message || 'Unknown error'}`,
        },
      };
    }

    if (!result) {
      console.error('[getStaticProps] Query returned no result');
      return {
        props: {
          post: null,
          error: 'Query returned no result',
        },
      };
    }

    const { data, errors } = result;

    // Debug logging - check what we got
    const stringifiedData = data ? JSON.stringify(data, null, 2) : 'null';
    console.log('[getStaticProps] GraphQL response:', {
      hasData: !!data,
      hasPost: !!data?.post,
      errors: errors,
      errorCount: errors?.length || 0,
      errorMessages: errors?.map((e: any) => e.message || String(e)) || [],
      dataKeys: data ? Object.keys(data) : [],
      slug: slug,
      fullData: stringifiedData.substring(0, 500),
    });

    if (errors && errors.length > 0) {
      console.error('[getStaticProps] GraphQL errors:', errors);
      const errorMessages = errors.map((e: any) => e.message || String(e)).join(', ');
      return {
        props: {
          post: null,
          error: `GraphQL error: ${errorMessages}`,
        },
      };
    }

    if (!data) {
      console.error('[getStaticProps] No data returned from GraphQL query');
      return {
        props: {
          post: null,
          error: 'No data returned from server',
        },
      };
    }

    if (!data.post) {
      console.error('[getStaticProps] No post found for slug:', slug);
      // Try to find the post in posts list as fallback
      try {
        const { data: postsData } = await client.query({
          query: GET_ALL_POSTS,
        });
        const allPosts = postsData?.posts?.nodes || [];
        const foundPost = allPosts.find((p: any) => p.slug === slug);
        if (foundPost) {
          console.log('[getStaticProps] Found post in posts list, fetching full details...');
          // If found, try querying again with databaseId
          const { data: postData } = await client.query({
            query: GET_POST_BY_SLUG,
            variables: { slug: foundPost.databaseId.toString() },
            errorPolicy: 'all',
          });
          if (postData?.post) {
            return {
              props: {
                post: postData.post,
                error: null,
              },
              revalidate: 60,
            };
          }
        }
      } catch (fallbackError) {
        console.error('[getStaticProps] Fallback query failed:', fallbackError);
      }
      
      return {
        props: {
          post: null,
          error: `Post not found for slug: ${slug}`,
        },
        notFound: true,
      };
    }

    // Debug logging
    console.log('[getStaticProps] Post data:', {
      title: data.post.title,
      hasEditorBlocks: !!data.post.editorBlocks,
      editorBlocksLength: data.post.editorBlocks?.length || 0,
      hasContent: !!data.post.content,
      contentLength: data.post.content?.length || 0,
      contentPreview: data.post.content?.substring(0, 200),
    });

    return {
      props: {
        post: data.post,
        error: null,
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error: any) {
    console.error('[getStaticProps] Exception fetching post:', error);
    console.error('[getStaticProps] Error details:', {
      message: error.message,
      stack: error.stack,
      graphQLErrors: error.graphQLErrors,
      networkError: error.networkError,
    });
    return {
      props: {
        post: null,
        error: error.message || 'Failed to fetch post',
      },
    };
  }
};

export default ArticlePost;

