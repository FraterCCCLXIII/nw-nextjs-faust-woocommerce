import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Batch endpoint to fetch all review ratings for comments
 * Accepts comment IDs in the request body or query string
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (!graphqlUrl) {
    return res.status(500).json({ error: 'GraphQL URL not configured' });
  }

  const baseUrl = graphqlUrl.replace('/graphql', '');

  try {
    // Get comment IDs from request body (POST) or query (GET)
    let commentIds: number[] = [];
    
    if (req.method === 'POST' && req.body && Array.isArray(req.body.commentIds)) {
      commentIds = req.body.commentIds;
    } else if (req.method === 'GET' && req.query.commentIds) {
      const ids = Array.isArray(req.query.commentIds) 
        ? req.query.commentIds.map(id => parseInt(id as string, 10))
        : [parseInt(req.query.commentIds as string, 10)];
      commentIds = ids.filter(id => !isNaN(id));
    }

    if (commentIds.length === 0) {
      return res.status(400).json({ error: 'Comment IDs are required', ratings: {} });
    }

    const ratings: Record<number, number> = {};

    console.log(`[API] Fetching ratings for ${commentIds.length} comments:`, commentIds);

    // Fetch rating for each comment ID
    const promises = commentIds.map(async (commentId) => {
      try {
        // Try multiple endpoints to get comment with meta
        let rating = null;

        // Method 1: Try WordPress REST API with edit context
        const response = await fetch(
          `${baseUrl}/wp-json/wp/v2/comments/${commentId}?context=edit`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const comment = await response.json();
          
          // Check various locations for rating
          rating = comment.rating || 
                   comment.meta?.rating ||
                   (comment.meta_data && Array.isArray(comment.meta_data)
                     ? comment.meta_data.find((m: any) => m.key === 'rating' || m.meta_key === 'rating')?.value
                     : null);
        }

        // Method 2: If still no rating, try WooCommerce REST API
        if (!rating) {
          // WooCommerce might expose ratings differently
          // For now, we'll rely on the WordPress REST API
        }

        if (rating !== null && rating !== undefined) {
          ratings[commentId] = parseInt(rating, 10);
          console.log(`[API] Found rating ${ratings[commentId]} for comment ${commentId}`);
        } else {
          console.log(`[API] No rating found for comment ${commentId}`);
        }
      } catch (error) {
        console.error(`[API] Error fetching rating for comment ${commentId}:`, error);
      }
    });

    await Promise.all(promises);

    console.log(`[API] Returning ratings:`, ratings);
    return res.status(200).json({ ratings });
  } catch (error) {
    console.error('[API] Error fetching review ratings:', error);
    return res.status(500).json({ error: 'Failed to fetch review ratings', ratings: {} });
  }
}

