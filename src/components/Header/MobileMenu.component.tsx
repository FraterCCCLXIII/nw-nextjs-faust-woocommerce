"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import SearchIcon from "@/components/UI/icons/SearchIcon.component";
import AccountIcon from "@/components/UI/icons/AccountIcon.component";
import CartIcon from "@/components/UI/icons/CartIcon.component";
import { GET_CURRENT_USER, GET_PAGES } from "@/utils/gql/GQL_QUERIES";

// Simple close icon component
const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const menuItems = [
  { name: "Overview", href: "#top" },
  { name: "Features", href: "#features" },
  { name: "Results", href: "#results" },
  { name: "Get Started", href: "/catalog", isButton: true },
];

const resourcesItems = [
  { name: "Components", href: "/pages/components" },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

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

  // Build pages list
  const pages = pagesData?.pages?.nodes || [];
  const pageItems = pages
    .filter((page: { slug: string }) => 
      !['about-us', 'contact', 'components', 'terms-of-service', 'privacy-policy', 'returns-and-refunds'].includes(page.slug)
    )
    .map((page: { title: string; uri: string }) => ({
      name: page.title,
      href: page.uri || `/pages/${page.title.toLowerCase().replace(/\s+/g, '-')}`,
    }));

  const menuContent = isOpen ? (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={() => setIsOpen(false)}
      />
      <div
        id="header-sidebar-menu"
        className="fixed left-0 top-0 bottom-0 z-[61] w-80 max-w-[85vw] bg-white shadow-xl lg:hidden border-r border-tether-beige/30"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-tether-beige/30 bg-white">
            <span className="text-lg font-semibold text-tether-dark">Menu</span>
            <button
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-tether-cream rounded transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-8 bg-tether-cream">
            <ul className="space-y-6">
              {menuItems.map((item) => {
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                    setIsOpen(false);
                    setTimeout(() => {
                      const targetId = item.href.replace('#', '');
                      const element = document.getElementById(targetId);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else if (targetId === 'top') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }, 100);
                  } else {
                    setIsOpen(false);
                  }
                };

                return (
                  <li key={item.name}>
                    {item.isButton ? (
                      <Link
                        href={item.href}
                        onClick={handleClick}
                        className="inline-flex items-center px-6 py-3 bg-tether-dark text-tether-cream text-base font-medium rounded-full hover:bg-tether-dark/90 transition-all duration-200"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={handleClick}
                        className="block w-full text-lg font-medium text-tether-dark/70 hover:text-tether-dark transition-colors"
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
              {pageItems.length > 0 && (
                <li className="pt-6 border-t border-tether-beige/30">
                  <div className="mb-4 text-sm font-semibold text-tether-dark/70 uppercase tracking-wider">Pages</div>
                  <ul className="space-y-3">
                    {pageItems.map((item: { name: string; href: string }) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="block w-full text-base text-tether-dark/70 hover:text-tether-dark transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              <li className="pt-6 border-t border-tether-beige/30">
                <div className="mb-4 text-sm font-semibold text-tether-dark/70 uppercase tracking-wider">Resources</div>
                <ul className="space-y-3">
                  {resourcesItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="block w-full text-base text-tether-dark/70 hover:text-tether-dark transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
          <div className="border-t border-tether-beige/30 p-6 space-y-3 bg-white">
            <Link
              href="/catalog"
              className="flex items-center gap-3 text-sm font-medium text-tether-dark/70 hover:text-tether-dark transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <SearchIcon className="w-5 h-5" />
              Search
            </Link>
            <Link
              href={loggedIn ? "/account" : "/login"}
              className="flex items-center gap-3 text-sm font-medium text-tether-dark/70 hover:text-tether-dark transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <AccountIcon className="w-5 h-5" />
              {loggedIn ? "Account" : "Login"}
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-3 text-sm font-medium text-tether-dark/70 hover:text-tether-dark transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <CartIcon className="w-5 h-5" />
              Cart
            </Link>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="tap-area lg:hidden"
        aria-controls="header-sidebar-menu"
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">Menu</span>
        <svg
          role="presentation"
          strokeWidth="2"
          focusable="false"
          width="22"
          height="22"
          className="icon icon-hamburger"
          viewBox="0 0 22 22"
        >
          <path
            d="M1 5h20M1 11h20M1 17h20"
            stroke="currentColor"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {/* Use portal to render menu at body level, escaping any parent constraints */}
      {typeof window !== "undefined" && menuContent && createPortal(menuContent, document.body)}
    </>
  );
}

