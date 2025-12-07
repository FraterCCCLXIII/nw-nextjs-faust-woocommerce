import Link from 'next/link';
import { useQuery } from '@apollo/client';
import Logo from '@/components/UI/Logo.component';
import FooterDisclaimer from './FooterDisclaimer.component';
import { FETCH_ALL_CATEGORIES_QUERY } from '@/utils/gql/GQL_QUERIES';

/**
 * Renders Footer of the application matching Medusa design.
 * @function Footer
 * @returns {JSX.Element} - Rendered component
 */
const Footer = () => {
  // Fetch categories dynamically from WordPress/WooCommerce
  const { data, loading, error } = useQuery(FETCH_ALL_CATEGORIES_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  });

  const categories = data?.productCategories?.nodes || [];

  return (
    <footer className="border-t border-gray-200 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div className="flex items-start">
            <Link
              href="/"
              className="flex items-center"
            >
              <Logo className="h-6 w-auto" />
            </Link>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 ml-auto">
            {!loading && categories && categories.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-small-semi text-gray-900">
                  Collections
                </span>
                <ul
                  className="grid grid-cols-1 gap-2 text-gray-600 text-small-regular"
                  data-testid="footer-categories"
                >
                  {categories.slice(0, 6).map((category: { id: string; name: string; slug: string }) => (
                    <li key={category.id}>
                      <Link
                        className="hover:text-gray-900 transition-colors"
                        href={`/category/${category.slug}`}
                        data-testid="category-link"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="text-small-semi text-gray-900">Company</span>
              <ul className="grid grid-cols-1 gap-y-2 text-gray-600 text-small-regular">
                <li>
                  <Link
                    href="/pages/about-us"
                    className="hover:text-gray-900 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/contact"
                    className="hover:text-gray-900 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/terms-of-service"
                    className="hover:text-gray-900 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/privacy-policy"
                    className="hover:text-gray-900 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/returns-and-refunds"
                    className="hover:text-gray-900 transition-colors"
                  >
                    Returns & Refunds
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full mb-16">
          <div className="flex w-full justify-between items-start text-gray-600">
            <p className="text-small-regular">
              © {new Date().getFullYear()} NW. All rights reserved.
            </p>
          </div>
          <div className="flex justify-start">
            <FooterDisclaimer />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

