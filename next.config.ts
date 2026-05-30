import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow embedding Scratch project players inside lesson pages.
        source: "/learn/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://scratch.mit.edu;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
