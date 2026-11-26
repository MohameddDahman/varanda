import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { site } from "@/content/site";
import { getSiteProjects } from "@/lib/site-projects";
import { systems } from "@/content/systems";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getSiteProjects();
  const routes = [
    "",
    "/systems",
    ...systems.map((s) => `/systems/${s.slug}`),
    "/projects",
    ...projects.map((p) => `/projects/${p.slug}`),
    "/why-upvc",
    "/about",
    "/contact",
    "/book-a-visit",
  ];
  // When this build went out: tells crawlers the pages changed and are worth a visit.
  const lastModified = new Date();
  return routes.flatMap((route) =>
    locales.map((lang) => ({
      url: `${site.url}/${lang}${route}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : route.split("/").length > 2 ? 0.6 : 0.8,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${site.url}/${l}${route}`])) },
    })),
  );
}
