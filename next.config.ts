import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return ["/brand/:path*", "/diagram/:path*", "/author/:path*"].map((source) => ({
      source,
      headers: [{
        key: "Cache-Control",
        value: "public, max-age=3600, stale-while-revalidate=86400",
      }],
    }));
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
