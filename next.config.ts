import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Fixed at build time and inlined into server and browser code alike, so the home page
    // footer hydrates without a mismatch before switching to the visitor's current year.
    NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()),
  },
};

export default nextConfig;
