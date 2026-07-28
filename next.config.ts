import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A lockfile higher up the tree makes Next guess the wrong workspace root.
  turbopack: { root: path.resolve(__dirname) },

  // Project artwork lives in /public. If you later point `Project.image` at a
  // remote host, whitelist that exact hostname here — never a wildcard, or the
  // image optimizer becomes an open proxy.
  // images: { remotePatterns: [{ protocol: "https", hostname: "cdn.example.com" }] },
};

export default nextConfig;
