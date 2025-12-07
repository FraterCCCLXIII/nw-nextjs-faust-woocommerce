"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageGallery from './ImageGallery.component';
import ProductInfo from './ProductInfo.component';
import ProductActions from './ProductActions.component';
import ProductDetailTabs from './ProductDetailTabs.component';
import ProductDisclaimer from './ProductDisclaimer.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';
import { IProductRootObject } from './AddToCart.component';

const SingleProduct = ({ product }: IProductRootObject) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(false);
  }, [product]);

  // Prepare images array for ImageGallery
  // Handle both null image and missing sourceUrl
  const images = (() => {
    // Check if image exists and has sourceUrl
    if (product.image?.sourceUrl) {
      return [
        {
          id: product.image.id || product.databaseId?.toString() || '1',
          sourceUrl: product.image.sourceUrl,
          altText: product.image.title || product.name || 'Product image',
        },
      ];
    }
    
    // Log in development only
    if (process.env.NODE_ENV === 'development') {
      console.warn('Product image missing for product:', {
        name: product.name,
        databaseId: product.databaseId,
        image: product.image,
      });
    }
    
    return [];
  })();

  if (isLoading) {
    return (
      <div className="h-56 mt-20">
        <p className="text-xl font-bold text-center">Loading product...</p>
        <br />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-start py-6 relative gap-6 md:gap-8"
        data-testid="product-container"
      >
        {/* Image Gallery */}
        <div className="block w-full md:flex-1 relative">
          <ImageGallery images={images} />
        </div>

        {/* Product Info and Actions */}
        <div className="flex flex-col md:sticky md:top-48 md:py-0 max-w-[600px] w-full py-8 gap-y-6">
          {/* Product Info (Title & Description) - Above Price */}
          <ProductInfo product={product} />

          {/* Product Actions (Price, Options, Add to Cart, Tabs) */}
          <ProductActions product={product} />
        </div>
      </div>

      {/* Product Detail Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <ProductDetailTabs product={product} />
      </div>
    </>
  );
};

export default SingleProduct;
