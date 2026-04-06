/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    devIndicators: false,

    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },

    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`,
            },
        ];
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3001',
                pathname: '/**',
            },
        ],
        formats: ['image/webp', 'image/avif'],
    },
}

module.exports = nextConfig
