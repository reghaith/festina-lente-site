import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  // Disable trailing slash
  trailingSlash: false,
  // Set correct workspace root
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
