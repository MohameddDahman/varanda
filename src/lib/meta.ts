import type { Metadata } from "next";
import type { Lang } from "@/i18n/config";
import type { Photo } from "@/content/photos";

/** Link previews (og:image) are this size: what WhatsApp, Facebook and X expect. */
export const SHARE_SIZE = { width: 1200, height: 630 };
export const BRAND_CARD_ALT = "VARANDA — uPVC window & door systems. Made for life.";

/**
 * The picture a shared link shows: the page's own photo, cropped by /api/img, or else the
 * language's brand card (src/app/[lang]/opengraph-image.tsx).
 */
export function shareImage(lang: Lang, photo?: Photo) {
  if (!photo) return { url: `/${lang}/opengraph-image`, ...SHARE_SIZE, alt: BRAND_CARD_ALT };
  return { url: `/api/img?src=${encodeURIComponent(photo.src.src)}&share`, ...SHARE_SIZE, alt: photo.alt[lang] };
}

/** Per-page metadata with canonical + hreflang alternates for both languages. */
export function pageMeta(lang: Lang, route: string, title: string, description: string, photo?: Photo): Metadata {
  const to = route === "/" ? "" : route;
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}${to}`,
      languages: { en: `/en${to}`, ar: `/ar${to}`, "x-default": `/en${to}` },
    },
    // A page's openGraph replaces the layout's, brand card included, so the image is set here.
    openGraph: { title: `${title} — VARANDA`, description, images: shareImage(lang, photo) },
  };
}
