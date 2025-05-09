import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Enable gzip compression
  compress: true,
  // Increase memory limit for builds
  staticPageGenerationTimeout: 120,
  // Optimize loading of third-party scripts
  poweredByHeader: false,
};

export default nextConfig;
