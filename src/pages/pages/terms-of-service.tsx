import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';

const TermsOfService: NextPage = () => {
  return (
    <Layout title="Terms of Service">
      <Head>
        <title>Terms of Service | Molecule</title>
        <meta
          name="description"
          content="Read the Terms of Service for Molecule - your trusted online retailer."
        />
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              Last updated:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                1. Acceptance of Terms
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                By accessing and using the Molecule website and purchasing
                products, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                2. Product Usage
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                All products are sold for their intended use as described in product
                listings. Please refer to product documentation for specific usage
                instructions, safety information, and recommended applications. By
                purchasing our products, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 text-lg text-gray-700 leading-relaxed space-y-2">
                <li>
                  You will use products according to their intended purpose and
                  manufacturer guidelines
                </li>
                <li>
                  You will follow all safety instructions and warnings provided
                  with products
                </li>
                <li>
                  You understand that product descriptions and images are for
                  informational purposes
                </li>
                <li>
                  You will comply with all applicable federal, state, and local
                  regulations regarding product use
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                3. Product Information
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We strive to provide accurate product information, but we cannot
                guarantee that all information is complete, current, or error-free.
                Product images are for illustrative purposes and may not reflect the
                exact appearance of the product. The buyer assumes responsibility
                for reviewing product specifications before purchase.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                4. Order Acceptance and Payment
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                All orders are subject to acceptance by Molecule. We reserve the
                right to refuse or cancel any order for any reason, including
                but not limited to product availability, errors in pricing, or
                suspected fraudulent activity. Payment must be completed within
                48 hours of order placement. Unpaid orders will be automatically
                canceled.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                5. Return and Refund Policy
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Please refer to our Returns & Refunds policy for detailed information
                about returns, exchanges, and refunds. Some products may be
                non-returnable due to their nature. If you have questions about your
                order, please contact our customer support team.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                6. Limitation of Liability
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Molecule shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from the
                use or inability to use our products. Our liability is limited to
                the purchase price of the product.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                7. Compliance with Laws
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                The buyer is responsible for knowing and complying with all
                applicable federal, state, and local laws and regulations
                regarding the purchase, possession, and use of products. Some
                products may be restricted in certain jurisdictions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                8. Changes to Terms
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Molecule reserves the right to modify these terms at any time.
                Your continued use of the website and services after any changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                9. Contact Information
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please
                contact us at{' '}
                <a
                  href="mailto:hello@molecule.com"
                  className="text-gray-900 font-medium hover:text-gray-700 underline"
                >
                  hello@molecule.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;

