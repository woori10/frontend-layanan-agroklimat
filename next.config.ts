import type { NextConfig } from "next";

process.env.NEXT_PUBLIC_SERVER_SESSION_ID = Date.now().toString();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
