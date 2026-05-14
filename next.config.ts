import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@blocknote/react', '@blocknote/core'],
  },
  // Ensure proper image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Set powered by header to false for security
  poweredByHeader: false,
  // Enable strict mode for better production behavior
  reactStrictMode: true,
};

export default nextConfig;
