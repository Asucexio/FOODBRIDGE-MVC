/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co'
      }
    ]
  }
};

module.exports = nextConfig;