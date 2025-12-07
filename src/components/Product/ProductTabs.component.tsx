"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface ProductTabsProps {
  product: {
    material?: string;
    origin_country?: string;
    type?: string;
    weight?: string;
    length?: string;
    width?: string;
    height?: string;
    [key: string]: unknown; // Allow additional properties
  };
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [openTabs, setOpenTabs] = useState<string[]>(['Product Information']);

  const toggleTab = (tabLabel: string) => {
    setOpenTabs((prev) =>
      prev.includes(tabLabel)
        ? prev.filter((t) => t !== tabLabel)
        : [...prev, tabLabel]
    );
  };

  return (
    <div className="w-full">
      <div className="border-t border-gray-200">
        {/* Product Information Tab */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleTab('Product Information')}
            className={`w-full flex justify-between py-4 text-left ${
              openTabs.includes('Product Information') ? 'items-start' : 'items-center'
            }`}
            aria-expanded={openTabs.includes('Product Information')}
          >
            <span className="text-base font-medium text-gray-900">
              Product Information
            </span>
            <span
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center transition-all duration-200 ${
                openTabs.includes('Product Information')
                  ? 'rotate-45 bg-gray-900 text-white'
                  : 'bg-transparent text-gray-900'
              } hover:bg-gray-900 hover:text-white`}
            >
              <Plus className="w-3 h-3" />
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openTabs.includes('Product Information')
                ? 'max-h-[1000px] opacity-100 pb-6'
                : 'max-h-0 opacity-0 pb-0'
            }`}
          >
            <div className="text-sm text-gray-700 py-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex flex-col gap-y-4">
                  <div>
                    <span className="font-semibold">Material</span>
                    <p className="mt-1">{product.material || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Country of origin</span>
                    <p className="mt-1">{product.origin_country || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Type</span>
                    <p className="mt-1">{product.type || '-'}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-y-4">
                  <div>
                    <span className="font-semibold">Weight</span>
                    <p className="mt-1">{product.weight ? `${product.weight} g` : '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Dimensions</span>
                    <p className="mt-1">
                      {product.length && product.width && product.height
                        ? `${product.length}L x ${product.width}W x ${product.height}H`
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Returns Tab */}
        <div>
          <button
            onClick={() => toggleTab('Shipping & Returns')}
            className={`w-full flex justify-between py-4 text-left ${
              openTabs.includes('Shipping & Returns') ? 'items-start' : 'items-center'
            }`}
            aria-expanded={openTabs.includes('Shipping & Returns')}
          >
            <span className="text-base font-medium text-gray-900">
              Shipping & Returns
            </span>
            <span
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center transition-all duration-200 ${
                openTabs.includes('Shipping & Returns')
                  ? 'rotate-45 bg-gray-900 text-white'
                  : 'bg-transparent text-gray-900'
              } hover:bg-gray-900 hover:text-white`}
            >
              <Plus className="w-3 h-3" />
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openTabs.includes('Shipping & Returns')
                ? 'max-h-[1000px] opacity-100 pb-6'
                : 'max-h-0 opacity-0 pb-0'
            }`}
          >
            <div className="text-sm text-gray-700 py-4">
              <div className="grid grid-cols-1 gap-y-8">
                <div className="flex items-start gap-x-2">
                  <svg
                    className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <div>
                    <span className="font-semibold block mb-1">Fast delivery</span>
                    <p className="max-w-sm text-gray-600">
                      Your package will arrive in 3-5 business days at your pick up
                      location or in the comfort of your home.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-x-2">
                  <svg
                    className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <div>
                    <span className="font-semibold block mb-1">Simple exchanges</span>
                    <p className="max-w-sm text-gray-600">
                      Is the fit not quite right? No worries - we&apos;ll exchange your
                      product for a new one.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-x-2">
                  <svg
                    className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <div>
                    <span className="font-semibold block mb-1">Easy returns</span>
                    <p className="max-w-sm text-gray-600">
                      Just return your product and we&apos;ll refund your money. No
                      questions asked – we&apos;ll do our best to make sure your return
                      is hassle-free.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;

