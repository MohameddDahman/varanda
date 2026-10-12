import type { Metadata, Viewport } from "next";
import { Montserrat, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

import { dirOf, isLang, locales } from "@/i18n/config";
import { site, ui } from "@/content/site";
import { cn } from "@/lib/cn";
import { LangProvider } from "@/components/providers/LangProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// The company profile's typefaces: Montserrat for English (headings, text and the
// letter-spaced labels), Tajawal for Arabic.
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
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
    // Previews (no real domain yet) stay out of search results.
    robots: site.launched ? undefined : { index: false, follow: false },
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
    <html lang={lang} dir={dirOf(lang)} className={cn(montserrat.variable, tajawal.variable)}>
      <body>
        <noscript>
          <style>{`[data-doors],[data-slat]{display:none!important}`}</style>
        </noscript>
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
          </TransitionProvider>
        </LangProvider>
      </body>
    </html>
  );
}
