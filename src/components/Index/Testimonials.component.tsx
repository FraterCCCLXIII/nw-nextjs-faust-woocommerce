"use client";

import { useState } from "react";

type Testimonial = {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
  highlight?: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Tether has completely transformed how our remote team connects. What used to feel like a scattered group of individuals now feels like a true culture we're proud of.",
    author: "Jordan Lee",
    role: "CFO",
    company: "Brightwave",
    highlight: "completely transformed",
  },
  {
    id: 2,
    quote: "Switching to Tether streamlined our operations overnight. Meetings are shorter, tasks are clearer, and our team finally feels aligned around the same goals.",
    author: "Sophia Reynolds",
    role: "Head of Operations",
    company: "Brightwave",
  },
  {
    id: 3,
    quote: "Before Tether, onboarding new hires was a headache. Now, training modules are automated, progress is tracked in real time, and new team members feel productive within days instead of weeks.",
    author: "Ethan Ramirez",
    role: "Director of IT",
    company: "Brightwave",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-tether-dark mb-4">
            Real stories of growth and productivity
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-tether-cream to-white rounded-tether p-8 md:p-12 shadow-lg border border-tether-beige/30">
            <blockquote className="text-2xl md:text-3xl font-medium text-tether-dark mb-8 leading-relaxed">
              {testimonials[activeIndex].highlight ? (
                <>
                  "{testimonials[activeIndex].quote.split(testimonials[activeIndex].highlight!)[0]}
                  <em className="not-italic font-bold">{testimonials[activeIndex].highlight}</em>
                  {testimonials[activeIndex].quote.split(testimonials[activeIndex].highlight!)[1]}"
                </>
              ) : (
                `"${testimonials[activeIndex].quote}"`
              )}
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-tether-dark flex items-center justify-center text-tether-cream font-semibold">
                {testimonials[activeIndex].author.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-tether-dark">{testimonials[activeIndex].author}</div>
                <div className="text-sm text-tether-dark/70">
                  {testimonials[activeIndex].role} at {testimonials[activeIndex].company}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  activeIndex === index
                    ? "bg-tether-dark w-8"
                    : "bg-tether-beige hover:bg-tether-dark/50"
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

