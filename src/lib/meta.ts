import type { Metadata } from "next";
import type { Lang } from "@/i18n/config";

/** Per-page metadata with canonical + hreflang alternates for both languages. */
export function pageMeta(lang: Lang, route: string, title: string, description: string): Metadata {
  const to = route === "/" ? "" : route;
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}${to}`,
      languages: { en: `/en${to}`, ar: `/ar${to}`, "x-default": `/en${to}` },
    },
    openGraph: { title: `${title} — VARANDA`, description },
  };
}
