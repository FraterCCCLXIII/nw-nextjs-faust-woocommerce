"use client";

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import MobileMenu from './MobileMenu.component';
import SearchTrigger from './SearchTrigger.component';
import Logo from '@/components/UI/Logo.component';
import AccountIcon from '@/components/UI/icons/AccountIcon.component';
import CartIcon from '@/components/UI/icons/CartIcon.component';
import TextRevealButton from '@/components/UI/TextRevealButton.component';
import { useCartStore } from '@/stores/cartStore';
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';

type NavItem = {
  name: string;
  href: string;
};

// Static nav items matching Tether design
const staticNavItems: NavItem[] = [
  { name: "Overview", href: "#top" },
  { name: "Features", href: "#features" },
  { name: "Results", href: "#results" },
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

  // Only consider logged in if we have customer data and no error
  // If loading or error, default to not logged in (show login link)
  const loggedIn = !loading && !error && !!data?.customer;

  // Handle smooth scroll for anchor links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (targetId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header 
      id="top"
      className="sticky top-0 z-50 pt-4 pb-4"
      role="banner"
      aria-label="Main Menu"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Glass pill wrapper for entire header */}
        <div className="row flex flex-wrap items-center bg-white/80 backdrop-blur-[20px] rounded-full shadow-lg border border-white/20 px-6 py-3 md:px-8 md:py-4">
          {/* Logo - Left Column (span_3 equivalent) */}
          <div className="col span_3 flex-shrink-0 w-full md:w-1/4 lg:w-1/4">
            <Link href="/" id="logo" className="flex items-center no-image">
              <span className="sr-only">Tether</span>
              <Logo className="h-6 md:h-8 w-auto text-tether-dark font-semibold" />
            </Link>
          </div>

          {/* Navigation - Right Column (span_9 equivalent) */}
          <div className="col span_9 col_last flex-1 w-full md:w-3/4 lg:w-3/4 flex items-center justify-end gap-4">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileMenu />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center" role="navigation" aria-label="Main Menu">
              <ul className="flex items-center gap-6 lg:gap-8" role="list">
                {staticNavItems.map((item) => (
                  <li key={item.name} className="nectar-regular-menu-item">
                    <Link
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="text-sm font-medium text-tether-dark/70 hover:text-tether-dark transition-colors"
                    >
                      <span className="menu-title-text">
                        <TextRevealButton dataText={item.name}>
                          {item.name}
                        </TextRevealButton>
                      </span>
                    </Link>
                  </li>
                ))}
                {/* Get Started Button - Part of nav list */}
                <li className="menu-item-btn-style-button_accent-color menu-item-hover-text-reveal nectar-regular-menu-item">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center px-4 py-2 bg-tether-dark text-tether-cream text-sm font-medium rounded-full hover:bg-tether-dark/90 transition-all duration-200"
                  >
                    <span className="menu-title-text">
                      <TextRevealButton dataText="Get Started">
                        Get Started
                      </TextRevealButton>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Secondary Actions - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:flex items-center gap-3 ml-4 pl-4 border-l border-tether-beige/30">
              {/* Search */}
              <SearchTrigger />

              {/* Account */}
              <Link
                href={loggedIn ? "/account" : "/login"}
                className="p-2 hover:text-tether-dark transition-colors"
                aria-label={loggedIn ? "Account" : "Login"}
              >
                <span className="sr-only">{loggedIn ? "Account" : "Login"}</span>
                <AccountIcon />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 hover:text-tether-dark transition-colors"
                aria-label="Cart"
              >
                <span className="sr-only">Cart</span>
                <CartIcon />
                {cartCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-tether-dark text-tether-cream text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
