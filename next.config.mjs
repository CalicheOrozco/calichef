/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.tmecosys.com' },
      { protocol: 'https', hostname: 'patternlib-all.prod.external.eu-tm-prod.vorwerk-digital.com' },
      { protocol: 'https', hostname: 'cdn.gtranslate.net' }
    ],
    // Enable image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Reduce JS bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },
  // Ensure Turbopack is explicitly configured (silences webpack/turbopack conflict)
  turbopack: {},
  // Enable modern Partial Prerendering (PPR) and cache components
  experimental: {
    cacheComponents: true,
  },
}

export default nextConfig