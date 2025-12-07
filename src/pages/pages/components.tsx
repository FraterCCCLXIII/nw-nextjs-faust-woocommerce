import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Layout from '@/components/Layout/Layout.component';
import Button from '@/components/UI/Button.component';
import Checkbox from '@/components/UI/Checkbox.component';
import Logo from '@/components/UI/Logo.component';
import Hero from '@/components/Index/Hero.component';
import HomeFAQ from '@/components/Index/HomeFAQ.component';
import ImageBanner from '@/components/Index/ImageBanner.component';
import TextSection from '@/components/Index/TextSection.component';
import FeaturesList from '@/components/Index/FeaturesList.component';
import ProductCarousel from '@/components/Index/ProductCarousel.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

const Components: NextPage = () => {
  const [checkboxState, setCheckboxState] = useState({
    option1: false,
    option2: true,
    option3: false,
  });

  const handleCheckboxChange = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxState((prev) => ({ ...prev, [id]: e.target.checked }));
  };

  return (
    <>
      <Head>
        <title>Components | Molecule</title>
        <meta
          name="description"
          content="Browse our component library and design system showcase."
        />
      </Head>
      <Layout title="Components">
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            {/* Header */}
            <div className="mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Component Library
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Explore our design system components, UI elements, and page sections. 
                All components are built with accessibility, responsiveness, and reusability in mind.
              </p>
            </div>

            {/* Logo */}
            <section className="mb-16 pb-16 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Logo</h2>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <Logo className="h-12 w-auto" />
              </div>
            </section>

            {/* Buttons */}
            <section className="mb-16 pb-16 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Buttons</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Primary</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="primary" buttonDisabled>Disabled</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Secondary</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="secondary">Secondary Button</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Hero</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="hero">Hero Button</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="filter">Filter Button</Button>
                    <Button variant="filter" selected>Selected Filter</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Danger</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="danger">Danger Button</Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Form Elements */}
            <section className="mb-16 pb-16 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Form Elements</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Input Fields</h3>
                  <div className="max-w-md space-y-4">
                    <div>
                      <label htmlFor="email-demo" className="block text-sm text-gray-600 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email-demo"
                        type="email"
                        placeholder="Enter your email"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-black focus:border-black block w-full px-3 py-2 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="password-demo" className="block text-sm text-gray-600 mb-1">
                        Password
                      </label>
                      <input
                        id="password-demo"
                        type="password"
                        placeholder="Enter your password"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-black focus:border-black block w-full px-3 py-2 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Checkboxes</h3>
                  <div className="space-y-2">
                    <Checkbox
                      id="option1"
                      label="Option 1"
                      checked={checkboxState.option1}
                      onChange={handleCheckboxChange('option1')}
                    />
                    <Checkbox
                      id="option2"
                      label="Option 2 (Checked)"
                      checked={checkboxState.option2}
                      onChange={handleCheckboxChange('option2')}
                    />
                    <Checkbox
                      id="option3"
                      label="Option 3"
                      checked={checkboxState.option3}
                      onChange={handleCheckboxChange('option3')}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Loading States */}
            <section className="mb-16 pb-16 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Loading States</h2>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <LoadingSpinner />
              </div>
            </section>

            {/* Typography */}
            <section className="mb-16 pb-16 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Typography</h2>
              <div className="space-y-6">
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Heading 1</h1>
                  <p className="text-sm text-gray-500">text-5xl font-bold</p>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">Heading 2</h2>
                  <p className="text-sm text-gray-500">text-4xl font-bold</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Heading 3</h3>
                  <p className="text-sm text-gray-500">text-3xl font-bold</p>
                </div>
                <div>
                  <h4 className="text-2xl font-semibold text-gray-900 mb-2">Heading 4</h4>
                  <p className="text-sm text-gray-500">text-2xl font-semibold</p>
                </div>
                <div>
                  <p className="text-lg text-gray-700 mb-2">
                    Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <p className="text-sm text-gray-500">text-lg text-gray-700</p>
                </div>
                <div>
                  <p className="text-base text-gray-700 mb-2">
                    Body - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <p className="text-sm text-gray-500">text-base text-gray-700</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Small - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <p className="text-sm text-gray-500">text-sm text-gray-600</p>
                </div>
              </div>
            </section>

            {/* Colors */}
            <section className="mb-16 pb-16 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Color Palette</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="h-24 bg-black rounded-lg mb-2"></div>
                  <p className="text-sm font-semibold">Black</p>
                  <p className="text-xs text-gray-500">bg-black</p>
                </div>
                <div>
                  <div className="h-24 bg-gray-900 rounded-lg mb-2"></div>
                  <p className="text-sm font-semibold">Gray 900</p>
                  <p className="text-xs text-gray-500">bg-gray-900</p>
                </div>
                <div>
                  <div className="h-24 bg-gray-700 rounded-lg mb-2"></div>
                  <p className="text-sm font-semibold">Gray 700</p>
                  <p className="text-xs text-gray-500">bg-gray-700</p>
                </div>
                <div>
                  <div className="h-24 bg-gray-600 rounded-lg mb-2"></div>
                  <p className="text-sm font-semibold">Gray 600</p>
                  <p className="text-xs text-gray-500">bg-gray-600</p>
                </div>
                <div>
                  <div className="h-24 bg-gray-200 rounded-lg mb-2"></div>
                  <p className="text-sm font-semibold">Gray 200</p>
                  <p className="text-xs text-gray-500">bg-gray-200</p>
                </div>
                <div>
                  <div className="h-24 bg-gray-100 rounded-lg mb-2"></div>
                  <p className="text-sm font-semibold">Gray 100</p>
                  <p className="text-xs text-gray-500">bg-gray-100</p>
                </div>
                <div>
                  <div className="h-24 bg-gray-50 rounded-lg mb-2"></div>
                  <p className="text-sm font-semibold">Gray 50</p>
                  <p className="text-xs text-gray-500">bg-gray-50</p>
                </div>
                <div>
                  <div className="h-24 bg-white border-2 border-gray-200 rounded-lg mb-2"></div>
                  <p className="text-sm font-semibold">White</p>
                  <p className="text-xs text-gray-500">bg-white</p>
                </div>
              </div>
            </section>

            {/* Page Sections */}
            <section className="mb-16 pb-16 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Page Sections</h2>
              <div className="space-y-12">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Hero Section</h3>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <Hero />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Image Banner</h3>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <ImageBanner />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Text Section</h3>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <TextSection />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Features List</h3>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <FeaturesList />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">FAQ Section</h3>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <HomeFAQ />
                  </div>
                </div>
              </div>
            </section>

            {/* Spacing */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Spacing Scale</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 6, 8, 12, 16, 24].map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">p-{size}</div>
                    <div className={`bg-gray-200 h-8`} style={{ width: `${size * 0.25}rem` }}></div>
                    <div className="text-xs text-gray-500">{size * 0.25}rem / {size * 4}px</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Components;

