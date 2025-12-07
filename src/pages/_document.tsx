import { Html, Head, Main, NextScript } from 'next/document';
import { chakraPetch, gildaDisplay, spaceMono } from '@/lib/fonts';

export default function Document() {
  return (
    <Html lang="en" className={`${chakraPetch.variable} ${gildaDisplay.variable} ${spaceMono.variable}`}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
