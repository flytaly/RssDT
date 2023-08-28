/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
};

nextConfig.redirects = async () => {
  return [
    {
      source: '/manage',
      destination: '/feed/manage',
      permanent: false,
    },
    {
      source: '/import-export',
      destination: '/feed/import-export',
      permanent: false,
    },
  ];
};

nextConfig.webpack = (config) => {
  // Grab the existing rule that handles SVG imports
  const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'));

  config.module.rules.push(
    // Reapply the existing rule, but only for svg imports ending in ?url
    {
      ...fileLoaderRule,
      test: /\.svg$/i,
      resourceQuery: /url/, // *.svg?url
    },
    // https://github.com/vercel/next.js/issues/48177#issuecomment-1557354538
    // Convert all other *.svg imports to React components
    {
      test: /\.svg$/i,
      issuer: fileLoaderRule.issuer,
      resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
      use: [{ loader: '@svgr/webpack', options: { dimensions: false } }],
    },
  );

  // Modify the file loader rule to ignore *.svg, since we have it handled now.
  fileLoaderRule.exclude = /\.svg$/i;

  return config;
};

module.exports = nextConfig;
