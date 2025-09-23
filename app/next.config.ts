import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Unable to import const
      bodySizeLimit: 100 * 1024 * 1024, // 100MB
    },
  },
};

export default nextConfig;
