import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Disable floating dev indicators (N button)
  devIndicators: false,

  // Suppress hydration warnings from browser extensions
  reactStrictMode: false,

  // Optimize package imports — avoids compiling thousands of unused modules
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
  },

  // Transpile Three.js to avoid ESM issues
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // Webpack config optimization
  webpack: (config, { isServer }) => {
    // Exclude heavy 3D canvas libraries from server-side render bundle
    if (isServer) {
      config.externals = [
        ...(config.externals as any[]),
        'three',
        '@react-three/fiber',
        '@react-three/drei',
      ];
    }

    return config;
  },

  // Allow remote image URLs for product images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.chronex.com' },
    ],
  },

  // Suppress "outputFileTracingRoot" warnings
  outputFileTracingRoot: path.resolve(process.cwd(), '../../'),
};

export default nextConfig;
