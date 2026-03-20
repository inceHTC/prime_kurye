/** @type {import('next').NextConfig} */
const nextConfig = {
  // Görsel optimizasyonu
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 gün
  },

  // Performans
  compress: true,
  poweredByHeader: false,

  // Güvenlik headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
      {
        // Statik dosyalar için uzun cache
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Redirect'ler
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/giris',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/kayit',
        permanent: true,
      },
    ]
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig