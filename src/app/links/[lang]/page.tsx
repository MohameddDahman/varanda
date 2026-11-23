import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLang, path, type L, type Lang } from "@/i18n/config";
import { site, socialNetworks, ui, type SocialNetwork } from "@/content/site";
import { photos } from "@/content/photos";
import { contactIsLive, telHref, whatsappHref } from "@/lib/contact";
import { shareImage } from "@/lib/meta";
import { ensureContent } from "@/lib/site-content";
import { VMark, Wordmark } from "@/components/brand/Logo";
import { SocialIcon } from "@/components/ui/SocialIcon";

/*
 * What the QR code on the company's printed portfolio opens (varandasystems.com/links): the
 * social pages, the sales team and the website on one phone screen. Its look is its own, a
 * light card rather than the site's dark pages, and the sunset terrace is framed as a sliding
 * window that opens as the page loads. Everything comes from the dashboard's contact details.
 */

const copy = {
  title: { en: "VARANDA — Social media & contact", ar: "VARANDA — التواصل الاجتماعي والاتصال" },
  intro: {
    en: "uPVC windows and doors, designed, made and installed in Greater Cairo.",
    ar: "أبواب وشبابيك uPVC، تصميم وتصنيع وتركيب في القاهرة الكبرى.",
  },
  follow: { en: "Follow us", ar: "تابعنا" },
  sales: { en: "Talk to sales", ar: "كلّم فريق المبيعات" },
  call: { en: "Call", ar: "اتصال" },
  whatsapp: { en: "WhatsApp", ar: "واتساب" },
  more: { en: "More from VARANDA", ar: "المزيد من VARANDA" },
  website: { en: "Visit the website", ar: "زيارة الموقع" },
  projects: { en: "See our projects", ar: "شاهد مشروعاتنا" },
  branch: { en: "Our branch on Google Maps", ar: "فرعنا على خرائط جوجل" },
  other: { en: "عربي", ar: "English" },
  otherLabel: { en: "اقرأ الصفحة بالعربية", ar: "Read this page in English" },
} satisfies Record<string, L>;

const other = (lang: Lang): Lang => (lang === "en" ? "ar" : "en");

/** "https://www.tiktok.com/@varanda452" → "@varanda452"; the site's address when there's no name. */
function handle(url: string) {
  const u = new URL(url);
  const name = u.pathname.split("/").filter(Boolean)[0];
  return name && !name.includes(".php") ? `@${name.replace(/^@/, "")}` : u.host.replace(/^www\./, "");
}

export async function generateMetadata({ params }: PageProps<"/links/[lang]">): Promise<Metadata> {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const title = copy.title[lang];
  return {
    title,
    description: copy.intro[lang],
    alternates: { canonical: `/links/${lang}`, languages: { en: "/links/en", ar: "/links/ar" } },
    openGraph: { type: "website", siteName: "VARANDA", title, description: copy.intro[lang], images: shareImage(lang, photos.terraceSunset) },
    twitter: { card: "summary_large_image" },
  };
}

/** Line icons for the link rows, drawn like the site's own (24px grid, round joins). */
const glyphs = {
  calendar: "M7 3v3M17 3v3M4 9h16M5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5ZM8 13h2M14 13h2M8 16.5h2",
  globe: "M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM3.5 12h17M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5s-1.1 6.2-3.3 8.5c-2.2-2.3-3.3-5.1-3.3-8.5S9.8 5.8 12 3.5Z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  pin: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11ZM12 12.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z",
  phone: "M8.6 3.5H6A1.5 1.5 0 0 0 4.5 5c0 8.3 6.2 14.5 14.5 14.5a1.5 1.5 0 0 0 1.5-1.5v-2.6l-3.8-1.4-1.9 1.9a11 11 0 0 1-4.7-4.7l1.9-1.9Z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  out: "M8 16 16 8M9.5 8H16v6.5",
};

function Glyph({ name, className }: { name: keyof typeof glyphs; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={glyphs[name]} />
    </svg>
  );
}

/** Staggers the content's fade-in, top to bottom. */
const rise = (i: number) => ({ "--d": i }) as CSSProperties;

function Row({ href, icon, title, sub, primary, external }: { href: string; icon: keyof typeof glyphs; title: string; sub?: string; primary?: boolean; external?: boolean }) {
  return (
    <a href={href} className={primary ? "lp-row lp-row-primary" : "lp-row"} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      <span className="lp-row-ic">
        <Glyph name={icon} />
      </span>
      <span className="lp-row-t">
        {title}
        {sub && <span className="lp-row-sub">{sub}</span>}
      </span>
      <Glyph name={external ? "out" : "arrow"} className="lp-row-go" />
    </a>
  );
}

export default async function LinksPage({ params }: PageProps<"/links/[lang]">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = (s: L) => s[lang];
  const { contact } = site;
  const social = (Object.keys(socialNetworks) as SocialNetwork[]).filter((n) => site.social[n]);
  const photo = photos.terraceSunset;
  let d = 0;

  return (
    <main className="lp">
      {/* The view through a sliding window: one sash glides across as the page opens. */}
      <div className="lp-window">
        <div className="lp-glass">
          <Image src={photo.src} alt={t(photo.alt)} fill preload sizes="(min-width: 30rem) 28rem, 100vw" quality={75} style={{ objectFit: "cover", objectPosition: photo.focus }} />
          <span className="lp-sash lp-sash-fixed" aria-hidden="true" />
          <span className="lp-sash lp-sash-move" aria-hidden="true" />
        </div>
        <a href={`/links/${other(lang)}`} hrefLang={other(lang)} lang={other(lang)} className="lp-lang" aria-label={t(copy.otherLabel)}>
          {t(copy.other)}
        </a>
      </div>

      <header className="lp-head">
        <span className="lp-badge">
          <VMark className="lp-badge-mark" />
        </span>
        <h1 className="lp-rise" style={rise(d++)}>
          <Wordmark className="lp-word" />
        </h1>
        <p className="lp-tag lp-rise" lang="en" style={rise(d++)}>
          Window &amp; door systems
        </p>
        <p className="lp-intro lp-rise" style={rise(d++)}>
          {t(copy.intro)}
        </p>
      </header>

      {social.length > 0 && (
        <section className="lp-sec lp-rise" style={rise(d++)} aria-labelledby="lp-follow">
          <h2 id="lp-follow" className="lp-h">
            {t(copy.follow)}
          </h2>
          <ul className="lp-social">
            {social.map((n) => (
              <li key={n}>
                <a href={site.social[n]!} target="_blank" rel="noopener noreferrer" className="lp-soc">
                  <span className="lp-soc-top">
                    <span className={`lp-chip lp-chip-${n}`}>
                      {n === "tiktok" && (
                        <>
                          <SocialIcon name={n} className="lp-chip-cyan" />
                          <SocialIcon name={n} className="lp-chip-pink" />
                        </>
                      )}
                      <SocialIcon name={n} className="lp-chip-icon" />
                    </span>
                    <Glyph name="out" className="lp-soc-go" />
                  </span>
                  <span className="lp-soc-name">{socialNetworks[n].label}</span>
                  <span className="lp-soc-handle" dir="ltr">
                    {handle(site.social[n]!)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {contactIsLive && contact.people.length > 0 && (
        <section className="lp-sec lp-rise" style={rise(d++)} aria-labelledby="lp-sales">
          <h2 id="lp-sales" className="lp-h">
            {t(copy.sales)}
          </h2>
          <ul className="lp-people">
            {contact.people.map((p) => (
              <li key={p.phone} className="lp-person">
                <p className="lp-person-name">{t(p.name)}</p>
                <p className="lp-person-role">
                  {t(p.role)}
                  <span aria-hidden="true"> · </span>
                  <span dir="ltr" className="lp-num">
                    {p.phone}
                  </span>
                </p>
                <div className="lp-actions">
                  {p.whatsapp && (
                    <a className="lp-btn lp-btn-wa" href={whatsappHref(p.whatsapp, t(ui.whatsappGreeting))} target="_blank" rel="noopener noreferrer">
                      <SocialIcon name="whatsapp" className="lp-btn-ic" />
                      {t(copy.whatsapp)}
                    </a>
                  )}
                  <a className="lp-btn lp-btn-call" href={telHref(p.phone)}>
                    <Glyph name="phone" className="lp-btn-ic" />
                    {t(copy.call)}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="lp-sec lp-rise" style={rise(d++)} aria-labelledby="lp-more">
        <h2 id="lp-more" className="lp-h">
          {t(copy.more)}
        </h2>
        <div className="lp-rows">
          <Row href={path(lang, "/contact")} icon="calendar" title={t(ui.bookVisit)} primary />
          <Row href={path(lang)} icon="globe" title={t(copy.website)} sub={new URL(site.url).host} />
          <Row href={path(lang, "/projects")} icon="grid" title={t(copy.projects)} />
          {contactIsLive && contact.mapsUrl && (
            <Row href={contact.mapsUrl} icon="pin" title={t(copy.branch)} sub={contact.address ? t(contact.address) : undefined} external />
          )}
        </div>
      </section>

      <footer className="lp-foot lp-rise" style={rise(d++)}>
        <a href={path(lang)} dir="ltr">
          {new URL(site.url).host}
        </a>
      </footer>
    </main>
  );
}
