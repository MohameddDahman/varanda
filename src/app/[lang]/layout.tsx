import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";

import { dirOf, isLang, locales } from "@/i18n/config";
import { site, ui } from "@/content/site";
import { cn } from "@/lib/cn";
import { montserrat, tajawal } from "@/lib/fonts";
import { LangProvider } from "@/components/providers/LangProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ensureContent } from "@/lib/site-content";
import { ContentSync } from "@/components/providers/ContentSync";
import { googleSiteVerification, seoBrand, seoTitle, structuredData } from "@/lib/seo";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const title = seoTitle[lang];
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s — ${seoBrand[lang]}` },
    description: site.description[lang],
    applicationName: "VARANDA",
    // Previews (no real domain yet) stay out of search results.
    robots: site.launched ? undefined : { index: false, follow: false },
    // Search Console's ownership code; Bing Webmaster's when set in the environment.
    verification: {
      google: googleSiteVerification,
      ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
    },
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", ar: "/ar", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "VARANDA",
      title,
      description: site.description[lang],
      locale: lang === "ar" ? "ar_EG" : "en_US",
    },
    // Title, description and picture come from each page's openGraph (Next copies them over).
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#040c17",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const content = await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      className={cn(montserrat.variable, tajawal.variable)}
    >
      <body>
        {/* What search engines read about the business: name, address, map pin, phones. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(lang)).replace(/</g, "\\u003c") }}
        />
        <noscript>
          <style>{`[data-doors],[data-slat]{display:none!important}`}</style>
        </noscript>
        <ContentSync value={content}>
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
        </ContentSync>
      </body>
    </html>
  );
}
