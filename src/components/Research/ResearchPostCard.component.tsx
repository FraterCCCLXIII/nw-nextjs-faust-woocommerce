'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ResearchPostCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    author?: {
      node: {
        name: string;
      };
    };
    featuredImage?: {
      node: {
        sourceUrl: string;
        altText: string;
      } | null;
    } | null;
  };
}

const ResearchPostCard = ({ post }: ResearchPostCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Strip HTML from excerpt
  const cleanExcerpt = post.excerpt
    ? post.excerpt.replace(/<[^>]*>/g, '').trim()
    : '';

  const imageUrl = post.featuredImage?.node?.sourceUrl;
  const hasImage = imageUrl && !imageError;
  const isLocalhost =
    imageUrl?.includes('localhost') || imageUrl?.includes('127.0.0.1');

  return (
    <Link href={`/articles/${post.slug}`}>
      <article className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-900 transition-colors cursor-pointer h-full flex flex-col">
        <div className="aspect-square overflow-hidden relative bg-gray-200">
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={post.featuredImage?.node?.altText || post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
              unoptimized={isLocalhost}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                id="Isolation_Mode"
                data-name="Isolation Mode"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 42.05 48.55"
                className="w-16 h-16"
              >
                <defs>
                  <style>
                    {`.cls-1 { fill: #d1d5db; } .cls-2 { fill: #e5e7eb; }`}
                  </style>
                </defs>
                <polygon
                  className="cls-1"
                  points="42.05 36.41 42.05 12.14 21.02 0 0 12.14 0 36.41 21.02 48.55 42.05 36.41"
                />
                <polygon
                  className="cls-2"
                  points="21.41 43.23 20.63 41.89 36.47 32.75 37.25 34.09 21.41 43.23"
                />
                <rect
                  className="cls-2"
                  x="4.41"
                  y="15.13"
                  width="1.55"
                  height="18.29"
                />
                <polygon
                  className="cls-2"
                  points="36.47 15.8 20.63 6.66 21.41 5.32 37.25 14.46 36.47 15.8"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
            {post.title}
          </h3>
          {cleanExcerpt && (
            <p className="text-sm text-gray-600 leading-relaxed flex-1">
              {cleanExcerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
};

export default ResearchPostCard;

