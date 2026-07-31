import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A lockfile higher up the tree makes Next guess the wrong workspace root.
  turbopack: { root: path.resolve(__dirname) },

  // Admin uploads land in Vercel Blob (prod) or /public/uploads (dev).
  // Scoped to blob storage subdomains only — never a bare wildcard, or the
  // image optimizer becomes an open proxy.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
