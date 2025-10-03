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

  // Webpack configuration for TensorFlow.js and MediaPipe
  webpack: (config, { isServer }) => {
    // Ignore node-specific modules when bundling for the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Handle .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
};

export default nextConfig;
