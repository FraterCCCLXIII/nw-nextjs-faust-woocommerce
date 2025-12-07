"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

type FAQProps = {
  faqs: FAQItem[];
  title?: string;
  className?: string;
};

export default function FAQ({ faqs, title, className = "" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`w-full ${className}`}>
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {title}
        </h2>
      )}
      <div className="accordion-box rounded-lg bg-white p-6 border border-gray-200">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="accordion group border-b border-gray-200 last:border-b-0"
            >
              <button
                onClick={() => toggleItem(index)}
                className={`accordion__toggle w-full flex gap-4 py-6 font-semibold text-xl hover:text-gray-700 transition-colors text-left ${
                  isOpen ? "items-start" : "items-center"
                }`}
                aria-expanded={isOpen}
              >
                <span
                  className={`circle-plus flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center transition-all duration-200 ${
                    isOpen ? "rotate-45 bg-gray-900 text-white" : "bg-transparent text-gray-900"
                  } hover:bg-gray-900 hover:text-white`}
                >
                  <Plus className="w-3 h-3" />
                </span>
                <h4 className="flex-1">{faq.question}</h4>
              </button>

              <div
                className={`accordion__content overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-[1000px] opacity-100 pb-6" : "max-h-0 opacity-0 pb-0"
                }`}
              >
                <div className="prose pl-12">
                  <div className="text-base leading-relaxed text-gray-700">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

