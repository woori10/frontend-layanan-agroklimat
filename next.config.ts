import type { NextConfig } from "next";
import os from "os";

process.env.NEXT_PUBLIC_SERVER_SESSION_ID = Date.now().toString();

const getLocalOrigins = () => {
  const interfaces = os.networkInterfaces();
  const origins: string[] = ["localhost", "localhost:3001", "127.0.0.1", "127.0.0.1:3001"];
  for (const key of Object.keys(interfaces)) {
    for (const iface of interfaces[key] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        origins.push(iface.address);
        origins.push(`${iface.address}:3001`);
      }
    }
  }
  return origins;
};

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalOrigins(),
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: "http://127.0.0.1:3000/:path*",
      },
    ];
  },
};

export default nextConfig;

