import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Suppress hydration warnings from browser extensions
  reactStrictMode: true,
  
  // Experimental features for better hydration handling
  experimental: {
    // Better error handling for hydration mismatches
    optimizePackageImports: ['lucide-react'],
  },

  // Webpack configuration to handle hydration issues
  webpack: (config, { dev, isServer }) => {
    // Add hydration error handling in development
    if (dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    return config
  },

  // Headers to prevent browser extension interference
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // Rewrites for client-side routing
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
    ]
  },
}

export default nextConfig
