import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { paddedPrice } from '@/utils/functions/functions';

interface ProductCardProps {
  databaseId: number;
  name: string;
  price: string | null | undefined;
  regularPrice: string | null | undefined;
  salePrice?: string | null | undefined;
  onSale: boolean;
  slug: string;
  image?: {
    sourceUrl?: string;
  };
}

const ProductCard = ({
  databaseId,
  name,
  price,
  regularPrice,
  salePrice,
  onSale,
  slug,
  image,
}: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Add padding/empty character after currency symbol
  // Handle null/undefined prices gracefully
  const formattedPrice = price ? paddedPrice(price, 'kr') : 'Price unavailable';
  const formattedRegularPrice = regularPrice ? paddedPrice(regularPrice, 'kr') : 'Price unavailable';
  const formattedSalePrice = salePrice ? paddedPrice(salePrice, 'kr') : undefined;

  const hasImage = image?.sourceUrl && !imageError;
  const isLocalhost = image?.sourceUrl?.includes('localhost') || image?.sourceUrl?.includes('127.0.0.1');

  return (
    <div className="group">
      <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative rounded-lg">
        <Link href={`/product/${slug}`}>
          {hasImage ? (
            <Image
              src={image.sourceUrl!}
              alt={name}
              fill
              className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105 rounded-lg"
              priority={databaseId === 1}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImageError(true)}
              unoptimized={isLocalhost}
            />
          ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center rounded-lg">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </Link>
      </div>

      <Link href={`/product/${slug}`}>
        <div className="mt-4">
          <p className="text-xl font-bold text-center cursor-pointer hover:text-gray-600 transition-colors">
            {name}
          </p>
        </div>
      </Link>
      <div className="mt-2 text-center">
        {onSale ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-bold text-red-600">{formattedSalePrice}</span>
            <span className="text-lg text-gray-500 line-through">{formattedRegularPrice}</span>
          </div>
        ) : (
          <span className="text-lg text-gray-900">{formattedPrice}</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
