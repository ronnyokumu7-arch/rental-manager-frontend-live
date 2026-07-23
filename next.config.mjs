/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Image Optimization Configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rental-manager-backend-live.onrender.com',
        port: '',
        pathname: '/api/v1/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },

  // ── ADDED CONFIGURATION: REWRITE RULES FOR FASTAPI PROXY ─────────────────
  // Intercepts client-side requests matching '/api/v1/:path*' and silently 
  // proxies them to the local FastAPI development server running on port 8000.
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
    ];
  },
  // ──────────────────────────────────────────────────────────────────────────
  
  // ESLint Configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
