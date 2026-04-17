import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  basePath: "/skillmap",
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === "production" ? "/skillmap" : "",
  },
};

export default nextConfig;
