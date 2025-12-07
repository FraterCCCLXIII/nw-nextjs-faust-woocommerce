import type { NextPage, GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';
import client from '@/utils/apollo/ApolloClient';
import { GET_ALL_POSTS } from '@/utils/gql/GQL_QUERIES';
import ResearchPostCard from '@/components/Research/ResearchPostCard.component';

interface Post {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
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
}

interface ArticlesPageProps {
  posts: Post[];
  error?: string;
}

const Articles: NextPage<ArticlesPageProps> = ({
  posts,
  error,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Layout title="Articles">
      <Head>
        <title>Articles | Molecule</title>
        <meta
          name="description"
          content="Read our latest articles and product guides."
        />
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
            Articles
          </h1>

          {error && (
            <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: Post) => (
                <ResearchPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                No articles available yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const { data } = await client.query({
      query: GET_ALL_POSTS,
    });

    return {
      props: {
        posts: data.posts?.nodes || [],
        error: null,
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return {
      props: {
        posts: [],
        error: error.message || 'Failed to fetch blog posts',
      },
      revalidate: 60,
    };
  }
};

export default Articles;

