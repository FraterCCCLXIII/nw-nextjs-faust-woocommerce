"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Badge from './Badge.component';
import CircleImages from './CircleImages.component';

interface StickySection {
  id: string;
  label: string;
  title: string;
  description: string;
  bgColor: string;
  image?: string;
  content: React.ReactNode;
}

/**
 * Sticky Media Sections component matching Tether design
 * Scroll-pinned sections with changing backgrounds
 */
const StickyMediaSections = () => {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections: StickySection[] = [
    {
      id: 'workflow',
      label: 'Meaning',
      title: 'Strengthen connection',
      description: 'Bring your people together through meaningful rituals, guided team-building exercises, and shared experiences.',
      bgColor: '#FFFFFF',
      content: (
        <div className="bg-white rounded-tether p-6 md:p-8 border border-tether-beige/30">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="default"
              textColor="#161514"
              bgColor="#F6F4F0"
              size="small"
            >
              8:30 am
            </Badge>
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-tether-beige">
              <Image
                src="/images/pexels-jonathanborba-3076509.jpg"
                alt="User"
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="h-5"></div>
          <h5 className="text-lg font-semibold text-tether-dark mb-2">
            Action Items for Backend Team
          </h5>
          <p className="text-sm text-tether-dark/70 mb-4">
            Task created on 7 Sep 2025
          </p>
          <div className="h-5"></div>
          <CircleImages
            images={[
              '/images/pexels-polina-tankilevitch-3735766.jpg',
              '/images/pexels-polina-tankilevitch-3735769.jpg',
              '/images/pexels-polina-tankilevitch-3735782.jpg',
            ]}
            size="medium"
            position="standard"
          />
        </div>
      ),
    },
    {
      id: 'insights',
      label: 'Insight',
      title: 'Culture pulse & insights',
      description: 'Stay in tune with your team through lightweight check-ins and clear engagement data, giving leaders visibility.',
      bgColor: '#DBD7D1',
      content: (
        <div className="bg-tether-cream/5 backdrop-blur-[20px] rounded-tether p-6 md:p-8 border border-tether-beige/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-tether-dark">Overview</span>
            <Badge
              variant="border"
              textColor="#EBE9E5"
              borderColor="#EBE9E582"
              size="small"
            >
              +4 new
            </Badge>
          </div>
          <div className="text-5xl md:text-6xl font-bold text-tether-dark mb-8">
            23 insights
          </div>
          <div className="h-12"></div>
          <div className="grid grid-cols-3 gap-2 text-sm text-tether-dark/70">
            <div className="text-center">
              <div className="font-bold text-tether-dark">16</div>
              <div>Key Events</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-tether-dark">5</div>
              <div>General</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-tether-dark">2</div>
              <div>External</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'recognition',
      label: 'Culture',
      title: 'Recognition & shared wins',
      description: 'Create a culture of appreciation with built-in recognition tools that make it easy to celebrate milestones.',
      bgColor: '#FFFF00',
      content: (
        <div className="bg-tether-cream/10 backdrop-blur-[20px] rounded-tether p-6 md:p-8">
          <div className="space-y-3">
            <Badge
              variant="blur"
              textColor="#F4F2EF"
              bgColor="#EBE9E51C"
              size="small"
              className="block w-fit"
            >
              • Slack Champion
            </Badge>
            <Badge
              variant="blur"
              textColor="#F4F2EF"
              bgColor="#EBE9E51C"
              size="small"
              className="block w-fit ml-auto"
            >
              • New Certification
            </Badge>
            <Badge
              variant="blur"
              textColor="#F4F2EF"
              bgColor="#EBE9E51C"
              size="small"
              className="block w-fit mx-auto"
            >
              • 4 Year Milestone
            </Badge>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionHeight = windowHeight * 0.75;

      // Calculate which section should be active based on scroll
      const newActiveSection = Math.min(
        Math.floor(scrollPosition / sectionHeight),
        sections.length - 1
      );

      if (newActiveSection !== activeSection) {
        setActiveSection(newActiveSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, sections.length]);

  return (
    <section className="w-full py-16 md:py-24 bg-tether-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`transition-opacity duration-500 ${
                  activeSection === index ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className="text-xs uppercase tracking-wider text-tether-dark/70 mb-2">
                  {section.label}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-tether-dark mb-4">
                  {section.title}
                </h2>
                <p className="text-lg text-tether-dark/70 mb-6">
                  {section.description}
                </p>
                <Link
                  href="/catalog"
                  className="inline-flex items-center px-6 py-3 bg-tether-dark text-tether-cream text-base font-medium rounded-full hover:bg-tether-dark/90 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>

          {/* Right Column - Sticky Media */}
          <div
            ref={containerRef}
            className="relative lg:sticky lg:top-24 h-[600px] md:h-[800px]"
          >
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`absolute inset-0 transition-opacity duration-500 rounded-tether ${
                  activeSection === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                style={{ backgroundColor: section.bgColor }}
              >
                <div className="h-full flex items-center justify-center p-6">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StickyMediaSections;

