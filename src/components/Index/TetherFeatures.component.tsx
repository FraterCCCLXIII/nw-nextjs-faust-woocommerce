"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Link2, TrendingUp, Award } from "lucide-react";

type Feature = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  imageAlt: string;
  badge?: string;
};

const getFeatures = (): Feature[] => [
  {
    id: 1,
    title: "Employee workflow",
    description: "Streamline your team's daily operations with intuitive workflow tools that keep everyone on track and productive.",
    icon: <Users className="w-6 h-6" />,
    image: "/images/pexels-fotios-photos-734973.jpg",
    imageAlt: "Employee workflow",
  },
  {
    id: 2,
    title: "Connections",
    description: "Build meaningful relationships across your organization with tools designed to strengthen team bonds and collaboration.",
    icon: <Link2 className="w-6 h-6" />,
    image: "/images/pexels-polina-tankilevitch-3735769.jpg",
    imageAlt: "Connections",
  },
  {
    id: 3,
    title: "Culture pulse & insights",
    description: "Stay in tune with your team through lightweight check-ins and clear engagement data, giving leaders visibility.",
    icon: <TrendingUp className="w-6 h-6" />,
    image: "/images/pexels-thirdman-8940517.jpg",
    imageAlt: "Culture pulse",
    badge: "+4 new",
  },
  {
    id: 4,
    title: "Recognition & shared wins",
    description: "Create a culture of appreciation with built-in recognition tools that make it easy to celebrate milestones.",
    icon: <Award className="w-6 h-6" />,
    image: "/images/pexels-polina-tankilevitch-3735766.jpg",
    imageAlt: "Recognition",
  },
];

export default function TetherFeatures() {
  const [activeFeature, setActiveFeature] = useState(1);
  const features = getFeatures();

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-tether-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-tether-dark mb-4">
            Strengthen connection
          </h2>
          <p className="text-xl text-tether-dark/70 max-w-2xl mx-auto">
            Bring your people together through meaningful rituals, guided team-building exercises, and shared experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-tether p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-tether-beige/30"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-tether-dark flex items-center justify-center text-tether-cream flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-tether-dark">{feature.title}</h3>
                    {feature.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-tether-cream-light-opacity text-tether-dark rounded-full backdrop-blur-[16px]">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-tether-dark/70 leading-relaxed">{feature.description}</p>
                </div>
              </div>
              <div className="relative aspect-video rounded-tether overflow-hidden mt-6">
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

