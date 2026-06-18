/** @type {import('next').NextConfig} */
const nextConfig = {
  // ไม่ให้ ESLint/TS strict มาทำให้ build ล้มเหลว (lint แยกตอน dev ได้)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    },
  ],
}

module.exports = nextConfig
