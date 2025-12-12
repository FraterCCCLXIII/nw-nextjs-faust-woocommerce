"use client";

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { SUBMIT_PRODUCT_REVIEW } from '@/utils/gql/GQL_MUTATIONS';
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';
import Link from 'next/link';

interface ProductReviewFormProps {
  productId: number | string;
  productDatabaseId: number;
  productGraphQLId?: string; // GraphQL ID (e.g., "cHJvZHVjdDo3Nw==")
  onReviewSubmitted?: () => void;
}

const ProductReviewForm = ({ 
  productId, 
  productDatabaseId,
  productGraphQLId,
  onReviewSubmitted 
}: ProductReviewFormProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user is logged in
  const { data: userData } = useQuery(GET_CURRENT_USER, {
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
  });

  const customer = userData?.customer;
  const isLoggedIn = !!customer && customer?.id !== 'guest' && customer?.id !== 'cGd1ZXN0';

  // Pre-fill name and email if logged in
  useEffect(() => {
    if (isLoggedIn && customer) {
      if (customer.firstName && customer.lastName) {
        setName(`${customer.firstName} ${customer.lastName}`);
      } else if (customer.firstName) {
        setName(customer.firstName);
      } else if (customer.username) {
        setName(customer.username);
      }
      if (customer.email) {
        setEmail(customer.email);
      }
    }
  }, [isLoggedIn, customer]);

  const [submitReview] = useMutation(SUBMIT_PRODUCT_REVIEW, {
    onCompleted: () => {
      setSuccess(true);
      setIsSubmitting(false);
      setError(null);
      // Reset form
      setRating(0);
      setComment('');
      if (!isLoggedIn) {
        setName('');
        setEmail('');
      }
      // Call callback if provided
      if (onReviewSubmitted) {
        setTimeout(() => {
          onReviewSubmitted();
        }, 2000);
      }
    },
    onError: (err) => {
      setIsSubmitting(false);
      console.error('Review submission error details:', {
        graphQLErrors: err.graphQLErrors,
        networkError: err.networkError,
        message: err.message,
      });
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Failed to submit review. Please try again.';
      setError(errorMessage);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please enter a review comment');
      return;
    }

    if (!isLoggedIn) {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // WooCommerce GraphQL WriteReviewInput structure
      // Error message suggests: "content" instead of "comment", and "commentOn" for product
      const input: any = {
        rating,
        content: comment.trim(), // Use 'content' as suggested by error message
      };

      // Use 'commentOn' for the product (expects Int, not GraphQL ID string)
      // Use databaseId which is the numeric ID
      input.commentOn = productDatabaseId;

      // Add reviewer info for guests (if not logged in)
      if (!isLoggedIn) {
        input.author = name.trim(); // Try 'author' instead of 'reviewer'
        input.authorEmail = email.trim(); // Try 'authorEmail' instead of 'reviewerEmail'
      }

      console.log('[ProductReviewForm] Submitting review with input:', {
        ...input,
        content: input.content.substring(0, 50) + '...', // Log truncated content
      });

      await submitReview({
        variables: {
          input,
        },
      });
    } catch (err) {
      // Error handled in onError callback
      console.error('Review submission error:', err);
    }
  };

  if (success) {
    return (
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">Thank you for your review!</p>
        <p className="text-green-700 text-sm mt-1">Your review has been submitted and is pending approval.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-colors"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <svg
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {rating} star{rating !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Name (only for guests) */}
      {!isLoggedIn && (
        <div>
          <label htmlFor="review-name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>
      )}

      {/* Email (only for guests) */}
      {!isLoggedIn && (
        <div>
          <label htmlFor="review-email" className="block text-sm font-medium text-gray-700 mb-1">
            Your Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="review-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>
      )}

      {/* Comment */}
      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Share your thoughts about this product..."
          required
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {!isLoggedIn && (
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-black font-semibold hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </form>
  );
};

export default ProductReviewForm;

