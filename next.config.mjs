/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/hacking-dorks' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/hacking-dorks/' : '',
}

export default nextConfig
