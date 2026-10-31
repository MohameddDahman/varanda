import type { Lang } from "@/i18n/config";
import { site } from "@/content/site";

/** What search engines show for the home page, and the name every other page ends with. */
export const seoTitle: Record<Lang, string> = {
  en: "VARANDA | uPVC Windows & Doors in Cairo",
  ar: "فاراندا VARANDA | أبواب وشبابيك uPVC في القاهرة",
};
export const seoBrand: Record<Lang, string> = { en: "VARANDA", ar: "فاراندا VARANDA" };

/** Where the company works (from the company profile). */
const AREAS = ["New Cairo", "Fifth Settlement", "Sheikh Zayed", "6th of October City", "Cairo"];

/**
 * schema.org data for search engines: the business (name in both scripts, address, map pin,
 * phones, the areas it serves) and the website. It's read from the same content the dashboard
 * edits, so a changed phone or address reaches search engines too.
 */
export function structuredData(lang: Lang) {
  const c = site.contact;
  const business = {
    "@type": "HomeAndConstructionBusiness",
    "@id": `${site.url}/#business`,
    name: "VARANDA",
    alternateName: ["فاراندا", "Varanda Systems", "Varanda uPVC"],
    description: site.description[lang],
    url: `${site.url}/${lang}`,
    logo: `${site.url}/apple-icon`,
    image: `${site.url}/${lang}/opengraph-image`,
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(c.email ? { email: c.email } : {}),
    ...(c.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: c.address.en,
            addressLocality: "New Cairo",
            addressRegion: "Cairo Governorate",
            postalCode: "11865",
            addressCountry: "EG",
          },
        }
      : {}),
    ...(c.mapQuery && /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(c.mapQuery)
      ? { geo: { "@type": "GeoCoordinates", latitude: Number(c.mapQuery.split(",")[0]), longitude: Number(c.mapQuery.split(",")[1]) } }
      : {}),
    ...(c.mapsUrl ? { hasMap: c.mapsUrl } : {}),
    areaServed: AREAS.map((name) => ({ "@type": "City", name })),
    contactPoint: c.people.map((p) => ({
      "@type": "ContactPoint",
      telephone: p.phone,
      contactType: "sales",
      name: p.name[lang],
      areaServed: "EG",
      availableLanguage: ["Arabic", "English"],
    })),
    ...(site.social.length ? { sameAs: site.social.map((s) => s.href) } : {}),
  };
  const website = {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: "VARANDA",
    alternateName: ["فاراندا", "Varanda Systems"],
    url: site.url,
    inLanguage: ["ar", "en"],
    publisher: { "@id": `${site.url}/#business` },
  };
  return { "@context": "https://schema.org", "@graph": [business, website] };
}
