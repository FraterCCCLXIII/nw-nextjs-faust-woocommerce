import Head from 'next/head';

import Navbar from './Navbar.component';

interface IHeaderProps {
  title: string;
}

/**
 * Renders header for each page.
 * @function Header
 * @param {string} title - Title for the page. Is set in <title>{title}</title>
 * @returns {JSX.Element} - Rendered component
 */

const Header = ({ title }: IHeaderProps) => (
  <>
    <Head>
      <title>{`Tether - Building stronger, more connected teams ${title !== 'Home' ? `| ${title}` : ''}`}</title>
      <meta name="description" content="Building stronger, more connected teams through real-time collaboration, guided team-building exercises, and meaningful rituals." />
      <meta name="keywords" content="Team collaboration, Team building, Employee engagement, Culture pulse, Recognition" />
      <meta
        property="og:title"
        content="Tether - Building stronger, more connected teams"
        key="pagetitle"
      />
    </Head>
    <Navbar />
  </>
);

export default Header;
