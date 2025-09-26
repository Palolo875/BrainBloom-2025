/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only ignore build errors in development
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  images: {
    unoptimized: true,
  },
  // Allow Replit dev origins for proxy compatibility
  allowedDevOrigins: [
    '*.replit.dev', 
    '*.replit.com', 
    '*.repl.co',
    '*.riker.replit.dev',
    '*.janeway.replit.dev',
    '*.worf.replit.dev',
    '127.0.0.1',
    'localhost'
  ],
  // Configure security headers for both development and production
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDevelopment 
              ? "frame-ancestors 'self' *.replit.dev *.replit.com;" 
              : "frame-ancestors 'self';",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

export default nextConfig
