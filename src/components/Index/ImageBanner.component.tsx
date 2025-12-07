import Image from 'next/image';

/**
 * Renders Image Banner section for Index page
 * @function ImageBanner
 * @returns {JSX.Element} - Rendered component
 */
const ImageBanner = () => {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden">
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
            <Image
              src="/images/pexels-bamboo-ave-677926128-29205121.jpg"
              alt="Premium Products"
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageBanner;

