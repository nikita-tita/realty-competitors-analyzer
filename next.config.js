/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['cdn.jsdelivr.net'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'RealtyCompetitors',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  }
}

module.exports = nextConfig
