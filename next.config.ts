import type { NextConfig } from "next";

// Photos uploaded in the admin are served from Convex file storage.
const convex = process.env.NEXT_PUBLIC_CONVEX_URL ? new URL(process.env.NEXT_PUBLIC_CONVEX_URL) : null;
// The account-free local backend (scripts/convex-local.mjs) serves from 127.0.0.1.
const localConvex = convex && ["127.0.0.1", "localhost"].includes(convex.hostname) ? convex : null;

// Cache Components / Partial Prefetching are left off on purpose: every page is
// static content, and keeping hidden routes mounted (Activity) would fight the
// GSAP scroll scenes and the door page transition.
const nextConfig: NextConfig = {
  images: {
    // Resized by our own /api/img route (cached by the CDN), not Vercel's paid optimizer.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    qualities: [60, 75, 85],
    remotePatterns: [
      { protocol: "https", hostname: "*.convex.cloud", pathname: "/api/storage/**" },
      ...(localConvex ? [{ protocol: "http" as const, hostname: localConvex.hostname, port: localConvex.port, pathname: "/api/storage/**" }] : []),
    ],
    // The optimizer refuses private addresses unless told otherwise; only ever for the local backend.
    dangerouslyAllowLocalIP: Boolean(localConvex),
  },
};

export default nextConfig;
