// Imports
import Router from 'next/router';
import NProgress from 'nprogress';
import { ApolloProvider } from '@apollo/client';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import { WordPressBlocksProvider } from '@faustwp/blocks';

import client from '@/utils/apollo/ApolloClient';
import CartInitializer from '@/components/Cart/CartInitializer.component';
import AgeVerificationModal from '@/components/Layout/AgeVerificationModal.component';
import '../faust.config.js';
import blocks from '../wp-blocks';

// Types
import type { AppProps } from 'next/app';

// Styles
import '@/styles/globals.css';
import '@/styles/wp-blocks.css';
import 'nprogress/nprogress.css';

// NProgress
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <FaustProvider pageProps={pageProps}>
      <WordPressBlocksProvider
        config={{
          blocks,
        }}
      >
        <ApolloProvider client={client}>
          <CartInitializer />
          <Component {...pageProps} key={router.asPath} />
          <AgeVerificationModal />
        </ApolloProvider>
      </WordPressBlocksProvider>
    </FaustProvider>
  );
}

export default MyApp;
