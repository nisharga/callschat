/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://backend:3001/api/v1/:path*',
      },
    ];
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      '@components': './src/components',
      '@pages': './src/pages',
      '@hooks': './src/hooks',
      '@services': './src/services',
      '@utils': './src/utils',
      '@types': './src/types',
      '@constants': './src/constants',
      '@store': './src/store',
      '@shared': '../shared',
    };
    return config;
  },
};

module.exports = nextConfig;
