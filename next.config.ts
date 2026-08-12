import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compiler: {
    // Keep console.error/warn in production; strip the dev diagnostics.
    removeConsole: process.env.NODE_ENV === "production" && {
      exclude: ["error", "warn"],
    },
  },
};

export default nextConfig;
