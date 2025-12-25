import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Skip static generation for API routes when DATABASE_URL is not available
  output: 'standalone',
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  // Disable trailing slash
  trailingSlash: false,
};

export default nextConfig;
