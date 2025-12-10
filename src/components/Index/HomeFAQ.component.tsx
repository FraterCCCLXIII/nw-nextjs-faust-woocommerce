"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

const faqs: FAQItem[] = [
  {
    question: "What exactly is Tether?",
    answer: (
      <p>
        Tether is a SaaS platform designed to help teams build stronger connections through real-time collaboration, guided team-building exercises, and meaningful rituals. It keeps everyone aligned and engaged, whether working remotely or in person.
      </p>
    ),
  },
  {
    question: "How does Tether improve team collaboration?",
    answer: (
      <p>
        Tether provides tools for real-time communication, shared rituals, and structured team-building activities. By integrating these into daily workflows, Tether ensures teams stay in sync, feel connected, and work together more effectively.
      </p>
    ),
  },
  {
    question: "Can Tether work with remote or hybrid teams?",
    answer: (
      <p>
        Absolutely. Tether is designed with flexibility in mind, making it ideal for remote, hybrid, and in-office teams. The platform helps bridge distance by creating shared experiences that keep people engaged no matter where they're working from.
      </p>
    ),
  },
  {
    question: "What makes Tether different from other collaboration tools?",
    answer: (
      <p>
        Unlike standard productivity tools, Tether focuses on strengthening human connection. It combines collaboration features with rituals and team-building practices that nurture culture, trust, and alignment—not just task management.
      </p>
    ),
  },
  {
    question: "Does Tether integrate with the tools we already use?",
    answer: (
      <p>
        Yes. Tether is designed to fit seamlessly into your existing workflow. It integrates with popular workplace tools so your team can stay connected without adding extra complexity.
      </p>
    ),
  },
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-16 md:py-24 bg-tether-cream text-tether-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Intro Section */}
          <div className="section-stack__intro">
            <div className="flex flex-col gap-10">
              <div className="prose">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-chakra-petch text-tether-dark">
                  Everything you need to know
                </h3>
              </div>
            </div>
          </div>

          {/* Accordion Section */}
          <div className="section-stack__main">
            <div className="accordion-box rounded-tether p-6 bg-white border border-tether-beige/30">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className="accordion group border-b border-tether-beige/30 last:border-b-0"
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className={`accordion__toggle w-full flex gap-4 py-6 font-semibold text-xl hover:text-tether-dark/70 transition-colors text-left ${
                        isOpen ? "items-start" : "items-center"
                      }`}
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`circle-plus flex-shrink-0 w-8 h-8 rounded-full border-2 border-tether-dark flex items-center justify-center transition-all duration-200 ${
                          isOpen ? "rotate-45 bg-tether-dark text-tether-cream" : "bg-transparent text-tether-dark"
                        } hover:bg-tether-dark hover:text-tether-cream`}
                      >
                        <Plus className="w-3 h-3" />
                      </span>
                      <h4 className="flex-1 text-tether-dark">{faq.question}</h4>
                    </button>

                    <div
                      className={`accordion__content overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[1000px] opacity-100 pb-6" : "max-h-0 opacity-0 pb-0"
                      }`}
                    >
                      <div className="prose pl-12">
                        <div className="text-base leading-relaxed text-tether-dark/70">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

