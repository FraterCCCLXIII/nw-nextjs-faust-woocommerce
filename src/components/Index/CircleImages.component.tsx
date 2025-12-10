import Image from 'next/image';

interface CircleImagesProps {
  images: string[];
  size?: 'small' | 'medium' | 'large';
  position?: 'overlapping' | 'standard';
  borderColor?: string;
}

/**
 * Circle Images component matching Tether design
 * Displays circular profile images in overlapping or standard layout
 */
const CircleImages = ({ 
  images, 
  size = 'medium',
  position = 'overlapping',
  borderColor = '#EBE9E5'
}: CircleImagesProps) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-11 h-11',
    large: 'w-14 h-14',
  };

  const spacing = position === 'overlapping' ? '-ml-2' : 'ml-2';

  return (
    <div className="flex items-center">
      {images.map((image, index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} rounded-full border-2 overflow-hidden flex-shrink-0 bg-tether-beige ${index > 0 ? spacing : ''}`}
          style={{ 
            borderColor,
            zIndex: images.length - index,
          }}
        >
          {image && (
            <Image
              src={image}
              alt={`Profile ${index + 1}`}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CircleImages;

