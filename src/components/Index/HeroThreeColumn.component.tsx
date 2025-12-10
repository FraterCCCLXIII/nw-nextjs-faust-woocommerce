import Image from 'next/image';
import Badge from './Badge.component';

/**
 * Three-column hero section matching Tether design
 * Left: Dark background with text and badges
 * Middle: Phone mockup image
 * Right: Smile/face image
 */
const HeroThreeColumn = () => {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column - Dark Background */}
          <div className="bg-tether-dark rounded-tether p-8 md:p-10 text-tether-cream flex flex-col justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
                Keep everyone aligned and engaged with tools designed for real-time collaboration.
              </h2>
              <div className="h-6"></div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="border"
                  textColor="#F4F2EF"
                  borderColor="#F4F2EF75"
                  bgColor="transparent"
                >
                  Employee workflow
                </Badge>
                <Badge
                  variant="blur"
                  textColor="#F9F4E9"
                  bgColor="#FFFFFF1A"
                >
                  Generate invoices
                </Badge>
                <Badge
                  variant="blur"
                  textColor="#F9F4E9"
                  bgColor="#FFFFFF1A"
                >
                  Connections
                </Badge>
              </div>
            </div>
          </div>

          {/* Middle Column - Phone Mockup */}
          <div className="relative rounded-tether overflow-hidden bg-gradient-to-b from-yellow-200 to-tether-beige flex items-end justify-center">
            <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
              <Image
                src="/images/pexels-tara-winstead-7723355.jpg"
                alt="Phone mockup"
                fill
                className="object-contain object-bottom"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>

          {/* Right Column - Smile Image */}
          <div className="relative rounded-tether overflow-hidden">
            <div className="relative w-full aspect-square">
              <Image
                src="/images/pexels-ron-lach-10534008.jpg"
                alt="Team member"
                fill
                className="object-cover rounded-tether"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroThreeColumn;

