import type { NextConfig } from 'next';
const nextConfig: NextConfig = { reactStrictMode: true, poweredByHeader: false, eslint: { ignoreDuringBuilds: false }, experimental: { cpus: 2 } };
export default nextConfig;
