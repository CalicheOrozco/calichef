import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.tmecosys.com' },
      { protocol: 'https', hostname: 'patternlib-all.prod.external.eu-tm-prod.vorwerk-digital.com' },
      { protocol: 'https', hostname: 'cdn.gtranslate.net' }
    ]
  }
}

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})(nextConfig)
