import withBundleAnalyzer from '@next/bundle-analyzer';

const isAnalyze = process.env.ANALYZE === 'true';

const nextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/Philosophical-Toys' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Philosophical-Toys/' : '',
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Disable ESLint during build to allow it to complete
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@react-three/drei',
      '@react-three/fiber',
      'three',
      'zustand',
      'p5',
      'react-p5'
    ],
    // Reduce memory usage during build
  },

  // Transpile Three.js packages
  transpilePackages: ['three'],

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    formats: ['image/webp', 'image/avif'],
    unoptimized: true
  },
};

export default isAnalyze ? withBundleAnalyzer({ enabled: true })(nextConfig) : nextConfig;
