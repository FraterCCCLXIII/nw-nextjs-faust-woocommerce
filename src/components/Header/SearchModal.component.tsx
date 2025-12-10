"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import client from "@/utils/apollo/ApolloClient";

// Simple X icon component
const X = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="15" y1="5" x2="5" y2="15"></line>
    <line x1="5" y1="5" x2="15" y2="15"></line>
  </svg>
);

type SearchResult = {
  type: "product" | "page" | "article";
  id: string;
  title: string;
  description?: string;
  href: string;
  thumbnail?: string;
};

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// GraphQL query to search products
const SEARCH_PRODUCTS = gql`
  query SearchProducts($search: String!) {
    products(first: 10, where: { search: $search }) {
      nodes {
        id
        databaseId
        name
        slug
        description
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

// GraphQL query to search posts
const SEARCH_POSTS = gql`
  query SearchPosts($search: String!) {
    posts(first: 10, where: { search: $search, status: PUBLISH }) {
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setQuery("");
        setResults([]);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on Escape key and prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search products via GraphQL
      try {
        const { data: productsData } = await client.query({
          query: SEARCH_PRODUCTS,
          variables: { search: searchQuery },
        });

        if (productsData?.products?.nodes) {
          productsData.products.nodes.forEach((product: any) => {
            searchResults.push({
              type: "product",
              id: product.id,
              title: product.name,
              description: product.description
                ? product.description.replace(/<[^>]*>/g, "").substring(0, 100)
                : undefined,
              href: `/product/${product.slug}`,
              thumbnail: product.image?.sourceUrl,
            });
          });
        }
      } catch (error) {
        console.error("Product search error:", error);
      }

      // Search pages (static pages)
      const pages = [
        { title: "About Us", href: "/pages/about-us" },
        { title: "Contact Us", href: "/pages/contact" },
        { title: "Components", href: "/pages/components" },
        { title: "Articles", href: "/articles" },
        { title: "Terms of Service", href: "/pages/terms-of-service" },
        { title: "Privacy Policy", href: "/pages/privacy-policy" },
        { title: "Returns & Refunds", href: "/pages/returns-and-refunds" },
      ];

      pages.forEach((page) => {
        if (page.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchResults.push({
            type: "page",
            id: page.href,
            title: page.title,
            href: page.href,
          });
        }
      });

      // Search research articles (blog posts) via GraphQL
      try {
        const { data: postsData } = await client.query({
          query: SEARCH_POSTS,
          variables: { search: searchQuery },
        });

        if (postsData?.posts?.nodes) {
          postsData.posts.nodes.forEach((post: any) => {
            const cleanExcerpt = post.excerpt
              ? post.excerpt.replace(/<[^>]*>/g, "").trim().substring(0, 100)
              : undefined;

            searchResults.push({
              type: "article",
              id: post.id,
              title: post.title,
              description: cleanExcerpt,
              href: `/articles/${post.slug}`,
              thumbnail: post.featuredImage?.node?.sourceUrl,
            });
          });
        }
      } catch (error) {
        console.error("Post search error:", error);
      }
    } catch (error) {
      console.error("Search error:", error);
    }

    setResults(searchResults);
    setIsLoading(false);
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen && !isAnimating) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100]">
      {/* Blurred background */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ease-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className="absolute inset-0 flex items-start justify-center pt-20 px-4 pointer-events-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transition-all duration-150 ease-out ${
            isAnimating
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 scale-[0.98]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-4 p-6 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, pages, and articles..."
              className="flex-1 text-lg outline-none border-none bg-transparent"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Searching...</div>
            ) : query.trim() && results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No results found for &quot;{query}&quot;
              </div>
            ) : query.trim() && results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    onClick={onClose}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {result.thumbnail && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                          <Image
                            src={result.thumbnail}
                            alt={result.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized={
                              result.thumbnail.includes("localhost") ||
                              result.thumbnail.includes("127.0.0.1") ||
                              result.thumbnail.includes("moleculestore.local")
                            }
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">
                            {result.type}
                          </span>
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {result.title}
                          </h3>
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Start typing to search...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at body level
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
};

export default SearchModal;
