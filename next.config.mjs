/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 🚀 Added for Docker optimization
  
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
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
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
    ];
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 🔒 STRICT BUILD ENFORCEMENT
  // ─────────────────────────────────────────────────────────────────────────
  // These settings ensure that TypeScript and ESLint errors block the build.
  // This prevents type-unsafe or poorly-linted code from reaching production.
  //
  // 📊 Current status (as of August 9, 2026):
  // - ESLint: 0 errors ✓
  // - TypeScript: 0 errors ✓
  // ─────────────────────────────────────────────────────────────────────────
  eslint: {
    ignoreDuringBuilds: false,  // ✅ Enforce ESLint on every build
  },
  
  typescript: {
    ignoreBuildErrors: false,   // ✅ Enforce TypeScript on every build
  },
};

export default nextConfig;
