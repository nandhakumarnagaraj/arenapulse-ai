import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Enable React strict mode for better development experience */
  reactStrictMode: true,

  /** Performance: compress responses */
  compress: true,

  /** Optimize package imports for faster bundling */
  experimental: {
    optimizePackageImports: ["@google/generative-ai"],
  },

  /** Security & performance headers */
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
    {
      source: "/api/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Cache-Control", value: "no-store, max-age=0" },
      ],
    },
  ],
};

export default nextConfig;
