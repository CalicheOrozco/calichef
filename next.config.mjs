import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.tmecosys.com'],
  }
}

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})(nextConfig)
