import LogoCarousel from './LogoCarousel.component';

/**
 * Trust Indicators section matching Tether design
 * @function TrustIndicators
 * @returns {JSX.Element} - Rendered component
 */
const TrustIndicators = () => {
  // Sample logos - replace with actual brand logos
  const logos = [
    { src: '/images/pexels-fotios-photos-734973.jpg', alt: 'Brand 1', width: 120, height: 35 },
    { src: '/images/pexels-polina-tankilevitch-3735769.jpg', alt: 'Brand 2', width: 120, height: 35 },
    { src: '/images/pexels-thirdman-8940517.jpg', alt: 'Brand 3', width: 120, height: 35 },
    { src: '/images/pexels-polina-tankilevitch-3735766.jpg', alt: 'Brand 4', width: 120, height: 35 },
    { src: '/images/pexels-polina-tankilevitch-3735782.jpg', alt: 'Brand 5', width: 120, height: 35 },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-tether-dark mb-12">
            Trusted by the world's top brands
          </h2>
          
          {/* Logo Carousel */}
          <div className="mb-16">
            <LogoCarousel logos={logos} />
          </div>

          {/* Rating Badge */}
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full border border-tether-dark/20 mb-12">
            <span className="text-2xl font-bold text-tether-dark">4.9/5</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-tether-dark fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-tether-dark/70">From <strong>2k+</strong> reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-tether-dark mb-2">+8k</div>
            <div className="text-tether-dark/70">Happy users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-tether-dark mb-2">+4x</div>
            <div className="text-tether-dark/70">Average increase in team productivity</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-tether-dark mb-2">92%</div>
            <div className="text-tether-dark/70">Of clients report measurable ROI within 90 days</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;

