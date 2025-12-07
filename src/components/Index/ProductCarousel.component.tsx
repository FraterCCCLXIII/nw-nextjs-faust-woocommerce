"use client";

import { useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/Product/ProductCard.component";

interface Product {
  databaseId: number;
  name: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
  onSale: boolean;
  slug: string;
  image?: {
    sourceUrl?: string;
  };
}

type ProductCarouselProps = {
  products: Product[];
};

export default function ProductCarousel({
  products,
}: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors hidden md:block"
        aria-label="Scroll left"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors hidden md:block"
        aria-label="Scroll right"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Scrollable Product List */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6 no-scrollbar"
      >
        {products.map((product) => (
          <div
            key={product.databaseId}
            className="flex-shrink-0 w-[280px] sm:w-[320px]"
          >
            <ProductCard
              databaseId={product.databaseId}
              name={product.name}
              price={product.price}
              regularPrice={product.regularPrice}
              salePrice={product.salePrice}
              onSale={product.onSale}
              slug={product.slug}
              image={product.image}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

