const path = require('path');
const { withFaust } = require('@faustwp/core');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Set Turbopack root to current directory to avoid permission issues
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'swewoocommerce.dfweb.no',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'store.moleculepeptides.com',
        pathname: '**',
      },
    ],
  },
};

module.exports = withFaust(nextConfig);
