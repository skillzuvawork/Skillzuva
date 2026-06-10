import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the Next.js dev tools indicator (bottom-left logo)
  devIndicators: false,

  // Turbopack root to silence the lockfile warning
  turbopack: {
    root: __dirname,
  },

  // Image optimisation
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mxwmckqiamakaqidfmhc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Compress responses
  compress: true,

  // Strip console.logs in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
