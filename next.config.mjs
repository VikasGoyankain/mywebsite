/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Force a clean build
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

export default nextConfig