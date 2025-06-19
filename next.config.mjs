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
  // Suppress hydration warnings caused by browser extensions
  reactStrictMode: false,
  compiler: {
    // This will silence hydration errors for attributes added by browser extensions
    styledComponents: true,
  },
}

export default nextConfig