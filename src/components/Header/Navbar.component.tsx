"use client";

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import MobileMenu from './MobileMenu.component';
import NavDropdown from './NavDropdown.component';
import SearchTrigger from './SearchTrigger.component';
import Logo from '@/components/UI/Logo.component';
import AccountIcon from '@/components/UI/icons/AccountIcon.component';
import CartIcon from '@/components/UI/icons/CartIcon.component';
import { useCartStore } from '@/stores/cartStore';
import { GET_CURRENT_USER, GET_PAGES } from '@/utils/gql/GQL_QUERIES';
import styles from './nav.module.css';

type NavItemLink = {
  name: string;
  href: string;
  type?: never;
  items?: never;
};

type NavItemDropdown = {
  name: string;
  type: "dropdown";
  items: Array<{ name: string; href: string }>;
  href?: never;
};

type NavItem = NavItemLink | NavItemDropdown;

// Static nav items - Pages dropdown will be added dynamically
const staticNavItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Catalog", href: "/catalog" },
  { name: "Articles", href: "/articles" },
  {
    name: "Resources",
    type: "dropdown",
    items: [
      { name: "Components", href: "/pages/components" },
    ],
  },
  { name: "Contact Us", href: "/pages/contact" },
];


/**
 * Navigation for the application.
 * Includes mobile menu and desktop navigation matching Medusa theme.
 */
const Navbar = () => {
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart?.totalProductsCount || 0;

  // Check if user is authenticated
  // Use network-only to ensure we always check current authentication status
  // This prevents showing stale cached data after logout
  const { data, loading, error } = useQuery(GET_CURRENT_USER, {
    errorPolicy: 'all',
    fetchPolicy: 'network-only', // Always check server for current auth status
  });

  // Fetch pages from WordPress
  const { data: pagesData } = useQuery(GET_PAGES, {
    errorPolicy: 'all',
  });

  // Only consider logged in if we have customer data and no error
  // If loading or error, default to not logged in (show login link)
  const loggedIn = !loading && !error && !!data?.customer;

  // Build navigation items with pages dropdown
  const pages = pagesData?.pages?.nodes || [];
  const pageItems = pages
    .filter((page: { slug: string }) => 
      !['about-us', 'contact', 'components', 'terms-of-service', 'privacy-policy', 'returns-and-refunds'].includes(page.slug)
    )
    .map((page: { title: string; uri: string }) => ({
      name: page.title,
      href: page.uri || `/pages/${page.title.toLowerCase().replace(/\s+/g, '-')}`,
    }));

  const mainNavItems: NavItem[] = [
    ...staticNavItems,
    ...(pageItems.length > 0 ? [{
      name: "Pages",
      type: "dropdown" as const,
      items: pageItems,
    }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-[20px] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout: main-nav | logo | secondary-nav on mobile/tablet, logo | main-nav | secondary-nav on desktop */}
        <div className={styles.headerGrid}>
          {/* Main Navigation */}
          <div className={`${styles.mainNav} flex items-center gap-4`}>
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <MobileMenu />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center justify-center w-full" role="navigation">
              <ul className="flex items-center gap-6" role="list">
                {mainNavItems.map((item) => (
                  <li key={item.name}>
                    {item.type === "dropdown" ? (
                      <NavDropdown label={item.name} items={item.items} />
                    ) : (
                      <Link
                        href={item.href}
                        className="text-sm hover:text-gray-900 transition-colors font-space-mono"
                        style={{ fontFamily: "var(--font-space-mono), monospace" }}
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Logo */}
          <div className={`${styles.logo} flex items-center justify-start`}>
            <Link href="/" className="flex items-center">
              <span className="sr-only">Molecule</span>
              <Logo className="h-6 w-auto" />
            </Link>
          </div>

          {/* Secondary Navigation */}
          <div className={`${styles.secondaryNav} flex items-center justify-end gap-4`}>
            {/* Search - Always visible */}
            <SearchTrigger />

            {/* Account - Always visible */}
            <Link
              href={loggedIn ? "/account" : "/login"}
              className="p-2 hover:text-gray-900 transition-colors"
              aria-label={loggedIn ? "Account" : "Login"}
            >
              <span className="sr-only">{loggedIn ? "Account" : "Login"}</span>
              <AccountIcon />
            </Link>

            {/* Cart - Always visible */}
            <Link
              href="/cart"
              className="relative p-2 hover:text-gray-900 transition-colors"
              aria-label="Cart"
            >
              <span className="sr-only">Cart</span>
              <CartIcon />
              {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
