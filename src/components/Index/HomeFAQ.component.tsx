"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

const faqs: FAQItem[] = [
  {
    question: "Are your products quality tested?",
    answer: (
      <p>
        Absolutely. All our products undergo rigorous quality testing to ensure they meet our high standards. We work with trusted suppliers and conduct quality checks to verify product integrity and specifications.
      </p>
    ),
  },
  {
    question: "What are typical delivery times?",
    answer: (
      <p>
        Delivery for our standard shipping option typically takes 3-5 business days. We ship from our warehouse to addresses across the country. We also provide expedited shipping options for faster delivery. Please allow 24 hours for order processing. <br /><br />
        Every package comes with professional packaging, tracking updates via email, and secure delivery.
      </p>
    ),
  },
  {
    question: "How should products be stored?",
    answer: (
      <p>
        Storage instructions vary by product type. Please refer to the product description and packaging for specific storage requirements. Most products should be stored in a cool, dry place away from direct sunlight.
      </p>
    ),
  },
  {
    question: "Are products safe during shipping?",
    answer: (
      <p>
        Yes, we take great care in packaging all products to ensure they arrive in perfect condition. Our packaging is designed to protect items during transit and is resistant to normal shipping conditions. Each order is carefully packed and sealed to maintain product integrity.
      </p>
    ),
  },
  {
    question: "What are your bulk ordering options?",
    answer: (
      <p>
        For bulk inquiries and volume pricing, please <Link href="/pages/contact" title="Contact" className="underline hover:no-underline">contact us</Link>. We're happy to work with you on custom orders and special pricing for larger quantities.
      </p>
    ),
  },
  {
    question: "What is your return/refund policy?",
    answer: (
      <p>
        We want you to be completely satisfied with your purchase. If you're not happy with your order, please <Link href="/pages/contact" title="Contact" className="underline hover:no-underline">contact us</Link> within 30 days of receipt. We'll work with you to resolve any issues or process a return if eligible.<br /><br />
        Some items may be non-returnable due to their nature. Please check product descriptions for specific return policies.
      </p>
    ),
  },
  {
    question: "What payment methods do you accept?",
    answer: (
      <>
        <p>
          We accept all major credit and debit cards, as well as PayPal. All payments are processed securely through our encrypted payment gateway.
        </p>
        <p>
          If you experience any issues with payment, please contact our support team and we'll be happy to assist.
        </p>
      </>
    ),
  },
  {
    question: "Do you ship internationally?",
    answer: (
      <>
        <p>
          Currently, we primarily ship within the United States. For international shipping inquiries, please <Link href="/pages/contact" title="Contact" className="underline hover:no-underline">contact us</Link> and we'll see what options are available for your location.
        </p>
        <p>
          International orders may be subject to customs fees and import duties, which are the responsibility of the customer.
        </p>
      </>
    ),
  },
  {
    question: "Do I need an account to place an order?",
    answer: (
      <p>
        While you can browse our catalog without an account, you'll need to create an account to complete a purchase. Creating an account allows you to track orders, save your shipping information, and access order history. The checkout process is quick and secure.
      </p>
    ),
  },
  {
    question: "How can I track my order?",
    answer: (
      <p>
        Once your order ships, you'll receive a confirmation email with a tracking number. You can use this tracking number on the carrier's website to monitor your package's progress. You can also log into your account to view order status and tracking information.
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
    <section className="w-full py-16 md:py-24 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Intro Section */}
          <div className="section-stack__intro">
            <div className="flex flex-col gap-10">
              <div className="prose">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-chakra-petch">
                  Got questions?<br />
                  We've got <span className="underline">answers.</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Accordion Section */}
          <div className="section-stack__main">
            <div className="accordion-box rounded-lg p-6">
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
          </div>
        </div>
      </div>
    </section>
  );
}

