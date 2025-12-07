"use client";

import { useState } from "react";
import Image from "next/image";
import { Zap, Link2, ShoppingCart } from "lucide-react";

type Feature = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  imageAlt: string;
};

const getFeatures = (): Feature[] => [
  {
    id: 1,
    title: "Next.js Powered",
    description:
      "Built on Next.js 16 with React 19 for lightning-fast performance and SEO optimization. Server-side rendering ensures your store loads quickly and ranks well in search results.",
    icon: <Zap className="w-6 h-6" />,
    image: "/images/pexels-fotios-photos-734973.jpg",
    imageAlt: "Next.js Powered",
  },
  {
    id: 2,
    title: "WooCommerce Integration",
    description:
      "Seamlessly integrated with WordPress and WooCommerce. Manage your products, orders, and inventory from the familiar WordPress admin panel while delivering a modern frontend experience.",
    icon: <Link2 className="w-6 h-6" />,
    image: "/images/pexels-polina-tankilevitch-3735769.jpg",
    imageAlt: "WooCommerce Integration",
  },
  {
    id: 3,
    title: "Modern E-Commerce",
    description:
      "A fully-featured commerce solution with cart management, checkout, user accounts, and payment processing. Built with TypeScript for type safety and maintainability.",
    icon: <ShoppingCart className="w-6 h-6" />,
    image: "/images/pexels-thirdman-8940517.jpg",
    imageAlt: "Modern E-Commerce",
  },
];

export default function FeaturesList() {
  const [activeFeature, setActiveFeature] = useState(1); // Start with the first feature active
  const features = getFeatures();

  return (
    <section className="features-list relative bg-white/50 py-12 md:py-16 -mt-10 md:-mt-0">
      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[20px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="features-list__container">
          <div className="features-list__content-container grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-[50px] items-center">
            {/* Text Area - Buttons */}
            <div className="features-list__text-area flex flex-col gap-3 order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Why Choose This Solution
              </h2>
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`features-list__button text-left bg-white/70 p-4 md:p-6 md:px-8 rounded-lg transition-all duration-200 w-full relative ${
                    activeFeature === feature.id
                      ? "opacity-100 border border-gray-900 bg-[#EAEAEA]"
                      : "opacity-50 border border-transparent"
                  } hover:transform hover:-translate-y-0.5 hover:border-gray-900 hover:bg-[#EAEAEA]`}
                  aria-pressed={activeFeature === feature.id}
                >
                  {/* Backdrop blur for button */}
                  <div className="absolute inset-0 backdrop-blur-[10px] rounded-lg bg-[#EAEAEA] -z-10" />

                  <div className={`features-list__button-content flex gap-2 md:gap-4 relative z-10 ${
                    activeFeature === feature.id ? "items-start" : "items-center"
                  }`}>
                    {/* Icon */}
                    <div className="features-list__icon flex-shrink-0 w-12 md:w-14 rounded-lg p-3 flex items-center justify-center">
                      <div className="text-gray-900">{feature.icon}</div>
                    </div>

                    {/* Text Content */}
                    <div className="features-list__text-content flex flex-col gap-2 flex-1">
                      <span className="features-list__button-title text-xl md:text-2xl font-medium tracking-tight">
                        {feature.title}
                      </span>
                      <div
                        className={`features-list__text text-base leading-relaxed transition-all duration-300 overflow-hidden ${
                          activeFeature === feature.id
                            ? "h-auto opacity-100 mt-2"
                            : "h-0 opacity-0 mt-0"
                        }`}
                      >
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Image Area */}
            <div className="features-list__image-area relative aspect-[3/4] bg-white rounded-3xl overflow-hidden order-1 md:order-2 mb-2 md:mb-0 md:h-full flex items-center">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`features-list__image-wrapper absolute inset-0 transition-opacity duration-300 ${
                    activeFeature === feature.id
                      ? "opacity-100 visible z-10"
                      : "opacity-0 invisible z-0"
                  }`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    className="features-list__main-image object-cover"
                    sizes="(max-width: 699px) 100vw, 479px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

