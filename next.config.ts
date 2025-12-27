import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  // Disable trailing slash
  trailingSlash: false,
};

export default nextConfig;
