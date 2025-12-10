import Link from 'next/link';
import CircleImages from './CircleImages.component';

/**
 * Renders Hero section for Index page matching Tether design
 * @function Hero
 * @returns {JSX.Element} - Rendered component
 */
const Hero = () => {
  // Sample profile images - replace with actual images
  const profileImages = [
    '/images/pexels-jonathanborba-3076509.jpg',
    '/images/pexels-polina-tankilevitch-3735766.jpg',
    '/images/pexels-polina-tankilevitch-3735769.jpg',
    '/images/pexels-polina-tankilevitch-3735782.jpg',
    '/images/pexels-thirdman-8940517.jpg',
  ];

  return (
    <section className="w-full relative bg-tether-cream py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust Badge - matching Tether style */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-[16px] border border-tether-beige/50 rounded-full mb-8">
            <span className="text-sm font-medium text-tether-dark/80">+8k Happy users</span>
          </div>

          {/* Main Heading - exact Tether styling */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-tether-dark mb-6 leading-tight">
            Building stronger, more connected teams
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-tether-dark/70 mb-10 max-w-2xl mx-auto">
            Keep everyone aligned and engaged with tools designed for real-time collaboration.
          </p>

          {/* CTA Buttons - matching Tether button style */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/catalog"
              className="inline-flex items-center px-6 py-3 bg-tether-dark text-tether-cream text-base font-medium rounded-full hover:bg-tether-dark/90 transition-all duration-200"
            >
              Get started — it's free
            </Link>
            <Link
              href="/pages/about-us"
              className="inline-flex items-center px-6 py-3 bg-white text-tether-dark text-base font-medium rounded-full border border-tether-dark/20 hover:border-tether-dark/40 transition-all duration-200"
            >
              Explore more
            </Link>
          </div>

          {/* Circle Images - overlapping profile pictures */}
          <div className="flex justify-center mb-4">
            <CircleImages
              images={profileImages}
              size="medium"
              position="overlapping"
              borderColor="#EBE9E5"
            />
          </div>

          {/* +8k Happy users text */}
          <p className="text-sm text-tether-dark/70">+8k Happy users</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
