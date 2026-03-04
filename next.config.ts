import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@react-pdf/renderer'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@napi-rs/canvas': false,
    };
    return config;
  },
};

export default nextConfig;
