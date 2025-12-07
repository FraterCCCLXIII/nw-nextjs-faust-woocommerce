// Imports
import Head from 'next/head';
import Link from 'next/link';
import { ReactNode } from 'react';

// Components
import Logo from '@/components/UI/Logo.component';

interface ICheckoutLayoutProps {
  children?: ReactNode;
  title: string;
}

/**
 * Renders a minimal layout specifically for checkout pages.
 * Features a minimal header with logo and cart icon, and a two-column layout.
 * @function CheckoutLayout
 * @param {ReactNode} children - Children to be rendered by CheckoutLayout component
 * @param {string} title - Title for the page. Is set in <title>{title}</title>
 * @returns {JSX.Element} - Rendered component
 */
const CheckoutLayout = ({ children, title }: ICheckoutLayoutProps) => {
  return (
    <>
      <Head>
        <title>{`${title} - Molecule`}</title>
        <meta name="description" content="Complete your order" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="flex flex-col min-h-screen w-full bg-gray-50">
        {/* Minimal Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <span className="sr-only">Molecule</span>
                  <Logo className="h-6 w-auto" />
                </Link>
              </div>

              {/* Back to Homepage Button */}
              <div className="flex items-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full transition-colors text-sm font-medium"
                  aria-label="Back to homepage"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to homepage
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Two Column Layout */}
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
};

export default CheckoutLayout;

