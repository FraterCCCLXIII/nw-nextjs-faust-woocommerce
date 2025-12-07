import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout.component';

const AboutUs: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Us | Molecule</title>
        <meta
          name="description"
          content="Learn about Molecule - your trusted source for quality products and exceptional service."
        />
      </Head>
      <Layout title="About Us">
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              About Us
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Molecule is a trusted online retailer committed to providing quality products and exceptional 
                customer service. We carefully curate our selection to offer products that meet high standards 
                of quality, reliability, and value.
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our mission is to provide customers with access to quality products at competitive prices, 
                backed by outstanding customer service. We understand the importance of reliability and 
                customer satisfaction, and we are dedicated to ensuring that every purchase meets your 
                expectations.
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                Quality Assurance
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We work with trusted suppliers and manufacturers to ensure all products meet our quality 
                standards. Our team carefully reviews products before adding them to our catalog, and we 
                stand behind everything we sell.
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                Customer Focus
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Your satisfaction is our priority. We're committed to providing a seamless shopping 
                experience, from browsing our catalog to receiving your order. Our customer support team 
                is here to help with any questions or concerns you may have.
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6">
                Fast Shipping
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We ship from our warehouse facilities, ensuring fast delivery times and secure packaging. 
                Our professional packaging and tracking updates ensure your orders arrive safely and on time.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AboutUs;

