import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';

const ReturnsAndRefunds: NextPage = () => {
  return (
    <Layout title="Returns & Refunds">
      <Head>
        <title>Returns & Refunds | Molecule</title>
        <meta
          name="description"
          content="Learn about Molecule's returns and refunds policy."
        />
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Returns & Refunds
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                Returns Policy
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We want you to be completely satisfied with your purchase. If you're
                not happy with your order, please contact us within 30 days of receipt.
                Some items may be non-returnable due to their nature (e.g., personalized
                items, perishables, or items that cannot be resold). If your order arrives
                with missing, incorrect, or damaged items, we are here to help. Please
                email{' '}
                <a
                  href="mailto:support@molecule.com"
                  className="text-gray-900 font-medium hover:text-gray-700 underline"
                >
                  support@molecule.com
                </a>{' '}
                for assistance.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                Cancellations
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Cancellations must be requested by email before the order has
                shipped. Once the order has shipped, cancellations are no longer
                possible. If you need to cancel your order, please contact us at{' '}
                <a
                  href="mailto:support@molecule.com"
                  className="text-gray-900 font-medium hover:text-gray-700 underline"
                >
                  support@molecule.com
                </a>{' '}
                as soon as possible.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                Customer Support
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Our customer support team is dedicated to ensuring your
                satisfaction with our product quality, delivery, and service.
                If you have any questions or concerns about your order, please
                don't hesitate to reach out to us at{' '}
                <a
                  href="mailto:support@molecule.com"
                  className="text-gray-900 font-medium hover:text-gray-700 underline"
                >
                  support@molecule.com
                </a>
                .
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We will do our best to assist you quickly and satisfactorily.
                Thank you for choosing Molecule.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReturnsAndRefunds;

