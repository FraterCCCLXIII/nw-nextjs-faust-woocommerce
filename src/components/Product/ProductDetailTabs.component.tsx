"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { cleanHtmlFromText } from '@/utils/functions/productUtils';
import ProductReviewForm from './ProductReviewForm.component';
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GQL_QUERIES';

interface Review {
  id: string;
  databaseId: number;
  date: string;
  dateGmt: string;
  content: string;
  author?: {
    node?: {
      name?: string;
      email?: string;
    };
  };
  rating?: number;
  verified?: boolean;
}

interface ProductDetailTabsProps {
  product: {
    id?: string;
    databaseId?: number;
    description?: string;
    averageRating?: number;
    reviewCount?: number;
    reviews?: {
      nodes?: Review[];
    };
    metaData?: Array<{
      key: string;
      value: string;
    }>;
    metadata?: {
      description?: string;
      reviews?: string;
    } | string;
  };
}

const ProductDetailTabs = ({ product }: ProductDetailTabsProps) => {
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>(
    'description'
  );
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews separately using comments query
  // Use product.id (GraphQL ID) for contentIdIn, or convert databaseId to GraphQL ID format
  const productGraphQLId = product.id || (product.databaseId ? `cG9zdDp${product.databaseId}` : null);
  
  const { data: reviewsData, loading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useQuery(
    GET_PRODUCT_REVIEWS,
    {
      variables: { productId: productGraphQLId || String(product.databaseId) },
      skip: !product.databaseId && !product.id, // Fetch when product is available
      errorPolicy: 'all', // Continue even if query fails
    }
  );

  // Debug logging
  useEffect(() => {
    if (activeTab === 'reviews') {
      console.log('[ProductDetailTabs] Reviews data:', reviewsData);
      console.log('[ProductDetailTabs] Reviews loading:', reviewsLoading);
      console.log('[ProductDetailTabs] Reviews error:', reviewsError);
      console.log('[ProductDetailTabs] Product databaseId:', product.databaseId);
    }
  }, [activeTab, reviewsData, reviewsLoading, reviewsError, product.databaseId]);

  // Transform metaData array from GraphQL to object format
  // GraphQL returns: [{ key: "description", value: "..." }, { key: "coa", value: "..." }]
  // Component expects: { description: "...", coa: "..." }
  let metadata: Record<string, any> = {};
  
  try {
    // First, try to get from metaData array (GraphQL format)
    if (product?.metaData && Array.isArray(product.metaData)) {
      product.metaData.forEach((item) => {
        if (item.key && item.value) {
          metadata[item.key] = item.value;
        }
      });
    }
    // Fallback to metadata object/string (legacy format)
    else if (product?.metadata) {
      if (typeof product.metadata === 'string') {
        try {
          metadata = JSON.parse(product.metadata);
        } catch {
          metadata = {};
        }
      } else if (
        typeof product.metadata === 'object' &&
        product.metadata !== null
      ) {
        metadata = product.metadata as Record<string, any>;
      }
    }
  } catch (error) {
    console.error('Error parsing product metadata:', error);
    metadata = {};
  }

  // Get raw HTML for description (preserve formatting like bold, italics, lists, etc.)
  const descriptionHtml = metadata?.description || product.description || '';
  
  // Process reviews from comments query
  // Note: Rating and verified status might need to be fetched differently
  // WooCommerce stores rating in comment meta, but GraphQL might not expose it directly
  const reviews: Review[] = reviewsData?.comments?.nodes?.map((comment: any) => {
    // Try to extract rating from comment content or other fields
    // For now, we'll set rating to undefined if not available
    // The rating might be stored in a different way or need a separate query
    
    return {
      id: comment.id,
      databaseId: comment.databaseId,
      date: comment.date,
      dateGmt: comment.dateGmt,
      content: comment.content,
      author: comment.author,
      rating: undefined, // Will need to fetch from WooCommerce meta separately if needed
      verified: false, // Will need to fetch from WooCommerce meta separately if needed
    };
  }) || [];

  // Debug: Log processed reviews
  useEffect(() => {
    if (activeTab === 'reviews' && reviews.length > 0) {
      console.log('[ProductDetailTabs] Processed reviews:', reviews);
    }
  }, [activeTab, reviews]);
  
  const reviewCount = product?.reviewCount || reviews.length;
  const averageRating = product?.averageRating || 0;

  const tabs = [
    { id: 'description' as const, label: 'Description' },
    { id: 'reviews' as const, label: `Reviews (${reviewCount})` },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Render star rating
  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">★</span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">☆</span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">★</span>
        );
      }
    }
    return stars;
  };

  return (
    <div className="w-full mt-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Product detail tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors rounded-none
                ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="prose prose-sm max-w-none">
        {activeTab === 'description' ? (
          descriptionHtml ? (
            <div 
              className="product-detail-content"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : (
            <p className="text-gray-500">No content available.</p>
          )
        ) : (
          <div className="space-y-6">
            {/* Reviews Summary */}
            {reviewCount > 0 && averageRating > 0 && (
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                  <div className="flex">{renderStars(averageRating)}</div>
                </div>
                <span className="text-gray-600">
                  Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}

            {/* Loading State */}
            {reviewsLoading && (
              <p className="text-gray-500">Loading reviews...</p>
            )}

            {/* Error State */}
            {reviewsError && (
              <div className="text-red-600 text-sm mb-4">
                Error loading reviews: {reviewsError.message}
                <br />
                <span className="text-xs text-gray-500">
                  (This might be a GraphQL schema issue. Reviews may still appear after approval.)
                </span>
              </div>
            )}

            {/* Existing Reviews List */}
            {!reviewsLoading && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id || review.databaseId} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {review.author?.node?.name || 'Anonymous'}
                          </span>
                          {review.verified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {review.rating && (
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                              <span className="ml-1">{review.rating}/5</span>
                            </div>
                          )}
                          <span>•</span>
                          <span>{formatDate(review.date || review.dateGmt)}</span>
                        </div>
                      </div>
                    </div>
                    {review.content && (
                      <div 
                        className="text-gray-700 mt-2"
                        dangerouslySetInnerHTML={{ __html: review.content }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : !reviewsLoading && reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            ) : null}

            {/* Add Review Button */}
            {!showReviewForm && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Write a Review
                </button>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && product.databaseId && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                <ProductReviewForm
                  productId={product.databaseId}
                  productDatabaseId={product.databaseId}
                  productGraphQLId={product.id}
                  onReviewSubmitted={() => {
                    setShowReviewForm(false);
                    // Refetch reviews after submission
                    refetchReviews();
                    // Optionally refresh the page or refetch product data
                    if (typeof window !== 'undefined') {
                      setTimeout(() => {
                        window.location.reload();
                      }, 2000);
                    }
                  }}
                />
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="mt-4 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailTabs;

