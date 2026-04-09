import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upskwbjxrzykgtanqxsp.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    // Exclude SVGs from the default Next.js file/url loader
    const fileLoaderRule = config.module.rules.find(
      (rule: { test?: { test?: (s: string) => boolean } }) => rule.test?.test?.('.svg'),
    );
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Process SVGs as React components (mirrors the turbopack rule above)
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
