import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { systems } from "@/content/systems";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/systems",
    ...systems.map((s) => `/systems/${s.slug}`),
    "/projects",
    ...projects.map((p) => `/projects/${p.slug}`),
    "/why-upvc",
    "/about",
    "/contact",
  ];
  return routes.flatMap((route) =>
    locales.map((lang) => ({
      url: `${site.url}/${lang}${route}`,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : route.split("/").length > 2 ? 0.6 : 0.8,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${site.url}/${l}${route}`])) },
    })),
  );
}
