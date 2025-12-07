import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';

const Contact: NextPage = () => {
  return (
    <>
      <Head>
        <title>Contact Us | Molecule</title>
        <meta
          name="description"
          content="Get in touch with Molecule for questions about our products, bulk orders, or customer support."
        />
      </Head>
      <Layout title="Contact Us">
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Contact Us
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Have questions about our products, need assistance with an order, or interested in bulk pricing? 
                We're here to help. Reach out to us through any of the following methods:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    General Inquiries
                  </h2>
                  <p className="text-gray-700 mb-2">
                    For general questions about our products or services:
                  </p>
                  <a
                    href="mailto:hello@example.com"
                    className="text-gray-900 font-medium hover:text-gray-700 underline"
                  >
                    hello@example.com
                  </a>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Bulk Orders
                  </h2>
                  <p className="text-gray-700 mb-2">
                    For bulk inquiries and volume pricing:
                  </p>
                  <a
                    href="mailto:sales@example.com"
                    className="text-gray-900 font-medium hover:text-gray-700 underline"
                  >
                    sales@example.com
                  </a>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Customer Support
                  </h2>
                  <p className="text-gray-700 mb-2">
                    For order questions or support:
                  </p>
                  <a
                    href="mailto:support@example.com"
                    className="text-gray-900 font-medium hover:text-gray-700 underline"
                  >
                    support@example.com
                  </a>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Business Hours
                  </h2>
                  <p className="text-gray-700">
                    Monday - Friday: 9:00 AM - 5:00 PM EST
                    <br />
                    Saturday - Sunday: Closed
                  </p>
                </div>
              </div>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Response Time
                </h2>
                <p className="text-gray-700">
                  We typically respond to all inquiries within 24-48 hours during business days. 
                  For urgent matters, please indicate "URGENT" in your subject line.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Contact;

