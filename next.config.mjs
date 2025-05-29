import withBundleAnalyzer from '@next/bundle-analyzer';

const isAnalyze = process.env.ANALYZE === 'true';
const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.NODE_ENV === 'production';

const nextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  basePath: isGitHubPages ? '/Philosophical-Toys' : '',
  assetPrefix: isGitHubPages ? '/Philosophical-Toys/' : '',
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Disable ESLint during build to allow it to complete
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? '/Philosophical-Toys' : '',
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