import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Unable to import const
      bodySizeLimit: 100 * 1024 * 1024, // 100MB
    },
  },
  images: {
    remotePatterns: [
      new URL(
        "https://trntzbrcsounzjaprdnc.supabase.co/storage/v1/object/public/assets/**"
      ),
    ],
  },
};

export default nextConfig;
