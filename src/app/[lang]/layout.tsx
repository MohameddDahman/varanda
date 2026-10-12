import type { Metadata, Viewport } from "next";
import { Alexandria, Fragment_Mono, Mona_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

import { dirOf, isLang, locales } from "@/i18n/config";
import { site, ui } from "@/content/site";
import { cn } from "@/lib/cn";
import { BrandDefs } from "@/components/brand/Logo";
import { LangProvider } from "@/components/providers/LangProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/layout/Cursor";

const mona = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
});

const fragment = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fragment",
  display: "swap",
});

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  display: "swap",
  preload: false,
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const title = `VARANDA — ${site.descriptorFull[lang]}`;
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: "%s — VARANDA" },
    description: site.description[lang],
    applicationName: "VARANDA",
    alternates: { canonical: `/${lang}`, languages: { en: "/en", ar: "/ar", "x-default": "/en" } },
    openGraph: {
      type: "website",
      siteName: "VARANDA",
      title,
      description: site.description[lang],
      locale: lang === "ar" ? "ar_EG" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description: site.description[lang] },
  };
}

export const viewport: Viewport = {
  themeColor: "#040c17",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang} dir={dirOf(lang)} className={cn(mona.variable, fragment.variable, alexandria.variable)}>
      <body>
        <noscript>
          <style>{`[data-doors],[data-slat]{display:none!important}`}</style>
        </noscript>
        <BrandDefs />
        <LangProvider lang={lang}>
          <SmoothScroll />
          <TransitionProvider>
            <a href="#main" className="skip-link">
              {ui.skip[lang]}
            </a>
            <Header />
            <main id="main" tabIndex={-1} className="site-main">
              {children}
            </main>
            <Footer lang={lang} />
            <Cursor />
          </TransitionProvider>
        </LangProvider>
      </body>
    </html>
  );
}
