import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  // The dashboard is never crawled (its pages also carry noindex).
  const rules = { userAgent: "*", allow: "/", disallow: "/admin" };
  // Before launch crawlers may still fetch pages (so they see the noindex tag), but no
  // sitemap is advertised.
  if (!site.launched) return { rules };
  return {
    rules,
    sitemap: `${site.url}/sitemap.xml`,
  };
}
