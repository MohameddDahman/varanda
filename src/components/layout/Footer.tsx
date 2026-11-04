import type { Lang } from "@/i18n/config";
import { path } from "@/i18n/config";
import { nav, site, ui } from "@/content/site";
import { systems } from "@/content/systems";
import { contactIsLive, mailHref, telHref, whatsappHref } from "@/lib/contact";
import { TLink } from "@/components/transition/TLink";
import { VMark, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { BackToTop } from "./BackToTop";

export function Footer({ lang }: { lang: Lang }) {
  const t = (text: { en: string; ar: string }) => text[lang];
  const { contact } = site;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer theme-deep" data-header="dark">
      <div className="wrap pt-[clamp(5rem,10vw,9rem)] pb-[var(--fab-room)]">
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <VMark className="h-10 w-auto" />
            <p className="t-h3 mt-8 max-w-[22ch] text-white">
              {t({
                en: "Windows and doors, measured, made and installed to last.",
                ar: "أبواب وشبابيك تُقاس وتُصنّع وتُركّب لتدوم.",
              })}
            </p>
            <div className="mt-10">
              <Button href={path(lang, "/contact")} variant="light">
                {t(ui.bookVisit)}
              </Button>
            </div>
          </div>

          {/* Below 1280px the spacer column goes to Contact, so the phone numbers fit on one line. */}
          <nav aria-label={t(ui.systems)} className="lg:col-span-3 lg:col-start-5 xl:col-start-6">
            <h2 className="t-label text-mist">{t(ui.systems)}</h2>
            <ul className="mt-6 space-y-3">
              {systems.map((s) => (
                <li key={s.slug}>
                  <TLink href={path(lang, `/systems/${s.slug}`)} className="footer-link">
                    {t(s.name)}
                  </TLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="VARANDA" className="lg:col-span-2">
            <h2 className="t-label text-mist">VARANDA</h2>
            <ul className="mt-6 space-y-3">
              {nav
                .filter((n) => n.key !== "systems")
                .map((n) => (
                  <li key={n.key}>
                    <TLink href={path(lang, n.href)} className="footer-link">
                      {t(n.label)}
                    </TLink>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="lg:col-span-3 xl:col-span-2">
            <h2 className="t-label text-mist">{t({ en: "Contact", ar: "تواصل معنا" })}</h2>
            {/* Plain text while the details are samples; links once they're real. */}
            <ul className="mt-6 space-y-4 text-white/85">
              {contact.people.map((person) => (
                <li key={person.phone}>
                  <span className="t-label block text-mist">{t(person.role)}</span>
                  <a className="footer-link mt-1 inline-block whitespace-nowrap" href={telHref(person.phone)} dir="ltr">
                    {person.phone}
                  </a>
                </li>
              ))}
              {contact.whatsapp && contactIsLive && (
                <li>
                  <a className="footer-link" href={whatsappHref(contact.whatsapp)} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  {/* Long addresses wrap at the @ instead of running off the page. */}
                  <a className="footer-link" href={mailHref(contact.email)}>
                    {contact.email.split("@")[0]}
                    <wbr />@{contact.email.split("@")[1]}
                  </a>
                </li>
              )}
              {contact.address && <li>{t(contact.address)}</li>}
            </ul>
          </div>
        </div>

        <div className="footer-word" aria-hidden="true">
          <Wordmark className="h-auto w-full" />
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label text-mist">
            © {year} VARANDA. {t(ui.rights)}
          </p>
          <p className="t-label text-mist">
            {t(site.tagline).replace(".", "")}
            <span className="dot">.</span>
          </p>
          <BackToTop className="t-label text-left text-white/85 transition-colors hover:text-white rtl:text-right">
            {t(ui.backToTop)} ↑
          </BackToTop>
        </div>
      </div>
    </footer>
  );
}
