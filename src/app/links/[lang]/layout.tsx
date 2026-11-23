import type { Viewport } from "next";
import { notFound } from "next/navigation";
import "../links.css";

import { dirOf, isLang, locales } from "@/i18n/config";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { montserrat, tajawal } from "@/lib/fonts";
import { ensureContent } from "@/lib/site-content";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata = {
  metadataBase: new URL(site.url),
  // A doorway for the printed QR code, not a page to rank.
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e9edf2",
  width: "device-width",
  initialScale: 1,
};

/**
 * The QR code's page has a root layout of its own: none of the site's header, footer, door
 * transition or smooth scroll, so it opens instantly on a phone and looks like a card of its own.
 */
export default async function LinksLayout({ children, params }: LayoutProps<"/links/[lang]">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang} dir={dirOf(lang)} className={cn(montserrat.variable, tajawal.variable)}>
      <body>{children}</body>
    </html>
  );
}
