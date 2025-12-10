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
    <footer className="border-t border-tether-beige/30 w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col w-full">
        <div className="flex flex-col gap-y-12 lg:flex-row items-start justify-between py-16 lg:py-20">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center mb-4"
            >
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="text-tether-dark/70 max-w-md">
              Building stronger, more connected teams through real-time collaboration and meaningful connections.
            </p>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 lg:grid-cols-4">
            {!loading && categories && categories.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <span className="text-small-semi text-tether-dark font-semibold">
                  Collections
                </span>
                <ul
                  className="grid grid-cols-1 gap-2 text-tether-dark/70 text-small-regular"
                  data-testid="footer-categories"
                >
                  {categories.slice(0, 6).map((category: { id: string; name: string; slug: string }) => (
                    <li key={category.id}>
                      <Link
                        className="hover:text-tether-dark transition-colors"
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
            <div className="flex flex-col gap-y-3">
              <span className="text-small-semi text-tether-dark font-semibold">Company</span>
              <ul className="grid grid-cols-1 gap-y-2 text-tether-dark/70 text-small-regular">
                <li>
                  <Link
                    href="/pages/about-us"
                    className="hover:text-tether-dark transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/contact"
                    className="hover:text-tether-dark transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-3">
              <span className="text-small-semi text-tether-dark font-semibold">Legal</span>
              <ul className="grid grid-cols-1 gap-y-2 text-tether-dark/70 text-small-regular">
                <li>
                  <Link
                    href="/pages/terms-of-service"
                    className="hover:text-tether-dark transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/privacy-policy"
                    className="hover:text-tether-dark transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/returns-and-refunds"
                    className="hover:text-tether-dark transition-colors"
                  >
                    Returns & Refunds
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-3">
              <span className="text-small-semi text-tether-dark font-semibold">Resources</span>
              <ul className="grid grid-cols-1 gap-y-2 text-tether-dark/70 text-small-regular">
                <li>
                  <Link
                    href="/articles"
                    className="hover:text-tether-dark transition-colors"
                  >
                    Articles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/catalog"
                    className="hover:text-tether-dark transition-colors"
                  >
                    Catalog
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 w-full py-8 border-t border-tether-beige/30">
          <div className="flex-1">
            <p className="text-small-regular text-tether-dark/70">
              © {new Date().getFullYear()} Tether. All rights reserved.
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

