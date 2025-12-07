import Image from 'next/image';
import { useState } from 'react';

interface ProductImage {
  id?: string;
  sourceUrl?: string;
  altText?: string;
}

interface ImageGalleryProps {
  images: ProductImage[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[29/34] w-full overflow-hidden bg-gray-100 rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      </div>
    );
  }

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 gap-y-4">
        {images.map((image, index) => {
          const hasError = imageErrors.has(index);
          const showFallback = hasError || !image.sourceUrl;

          return (
            <div
              key={image.id || index}
              className="relative aspect-[29/34] w-full overflow-hidden bg-gray-100 rounded-lg"
            >
              {showFallback ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <span className="text-gray-400 block mb-2">No image</span>
                    {process.env.NODE_ENV === 'development' && image.sourceUrl && (
                      <span className="text-xs text-gray-500 block break-all">
                        URL: {image.sourceUrl}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <Image
                  src={image.sourceUrl!}
                  priority={index <= 2}
                  className="absolute inset-0 rounded-lg"
                  alt={image.altText || `Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                  style={{
                    objectFit: 'cover',
                  }}
                  onError={() => handleImageError(index)}
                  unoptimized={image.sourceUrl?.includes('localhost') || image.sourceUrl?.includes('127.0.0.1')}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageGallery;

