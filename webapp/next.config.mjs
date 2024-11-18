/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        stream: false,
        crypto: false
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['googleapis', 'gaxios', 'googleapis-common']
  }
};

export default nextConfig;
