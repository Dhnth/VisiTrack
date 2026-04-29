import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    allowedDevOrigins: ['192.168.1.14', '10.22.26.132', '10.22.21.180', '192.168.137.109', '10.108.113.38'],

    images: {
    domains: ['api.qrserver.com'],
    // atau jika pakai remotePatterns (Next.js 14+)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
    ],
  },


};

export default nextConfig;
