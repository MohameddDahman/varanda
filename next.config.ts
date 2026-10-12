import type { NextConfig } from "next";

// Cache Components / Partial Prefetching are left off on purpose: every page is
// static content, and keeping hidden routes mounted (Activity) would fight the
// GSAP scroll scenes and the door page transition.
const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75, 85],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
