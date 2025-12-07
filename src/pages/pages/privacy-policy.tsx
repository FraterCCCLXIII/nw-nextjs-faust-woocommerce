import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';

const PrivacyPolicy: NextPage = () => {
  return (
    <Layout title="Privacy Policy">
      <Head>
        <title>Privacy Policy | Molecule</title>
        <meta
          name="description"
          content="Read the Privacy Policy for Molecule - how we collect, use, and protect your personal information."
        />
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Privacy Policy
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
                1. Information We Collect
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We collect information that you provide directly to us,
                including:
              </p>
              <ul className="list-disc pl-6 text-lg text-gray-700 leading-relaxed space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Shipping and billing addresses</li>
                <li>
                  Payment information (processed securely through our payment
                  processor)
                </li>
                <li>Order history and preferences</li>
                <li>Communications with our customer support team</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                2. How We Use Your Information
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-lg text-gray-700 leading-relaxed space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send you order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
                <li>
                  Send you marketing communications (only with your consent)
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                3. Information Sharing
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </p>
              <ul className="list-disc pl-6 text-lg text-gray-700 leading-relaxed space-y-2">
                <li>
                  With service providers who assist us in operating our website
                  and conducting our business
                </li>
                <li>With shipping carriers to deliver your orders</li>
                <li>With payment processors to process your transactions</li>
                <li>When required by law or to protect our rights</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                4. Data Security
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the Internet or electronic storage is 100% secure, and we
                cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                5. Cookies and Tracking
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your
                browsing experience, analyze site traffic, and understand where
                our visitors are coming from. You can control cookie preferences
                through your browser settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                6. Your Rights
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-lg text-gray-700 leading-relaxed space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at{' '}
                <a
                  href="mailto:privacy@molecule.com"
                  className="text-gray-900 font-medium hover:text-gray-700 underline"
                >
                  privacy@molecule.com
                </a>
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                7. Children's Privacy
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Our services are not intended for individuals under the age of
                21. We do not knowingly collect personal information from
                children. If you believe we have collected information from a
                child, please contact us immediately.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                8. Changes to This Policy
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                9. Contact Us
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please
                contact us at{' '}
                <a
                  href="mailto:privacy@molecule.com"
                  className="text-gray-900 font-medium hover:text-gray-700 underline"
                >
                  privacy@molecule.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;

