import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/selection",
        destination: "/mysection",
      },
    ];
  },
};

export default nextConfig;
