import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  basePath: "/skillmap",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
