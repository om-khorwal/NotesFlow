import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Enable strict mode for better React practices
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Output standalone build for Docker deployment
  // This creates a minimal production build with all dependencies included
  output: 'standalone',

  // Generate source maps in production for debugging (optional)
  // productionBrowserSourceMaps: false,
};

export default nextConfig;
