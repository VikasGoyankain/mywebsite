/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Allow cross-origin requests during development
  allowedDevOrigins: ['http://192.168.0.101:3000', 'http://localhost:3000'],
}

export default nextConfig