/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ADMIN_API_KEY: process.env.ADMIN_API_KEY
  }
}

module.exports = nextConfig 