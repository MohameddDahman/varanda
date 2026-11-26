import { notFound } from "next/navigation";
import { isLang, path, type L } from "@/i18n/config";
import { site, socialNetworks, ui, type SocialNetwork } from "@/content/site";
import { contactIsLive, mailHref, telHref, whatsappHref } from "@/lib/contact";
import { pageMeta } from "@/lib/meta";
import { ensureContent } from "@/lib/site-content";
import { LogoLockup } from "@/components/brand/Logo";
import { TLink } from "@/components/transition/TLink";
import { Icon } from "@/components/ui/Icon";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { Arrow } from "@/components/ui/Button";

/*
 * The contact page, in the menu and opened by the QR code on the company's printed portfolio
 * (varandasystems.com/contact): every way to reach VARANDA on one phone screen. Everything comes
 * from the contact details and social pages edited on the dashboard, so it never goes out of date.
 * The site-visit request form has a page of its own (/book-a-visit).
 */

const copy = {
  meta: { en: "Contact", ar: "تواصل معنا" },
  title: { en: "Contact VARANDA", ar: "تواصل مع VARANDA" },
  intro: {
    en: "Message or call our sales team, follow us, visit the branch, or explore the website.",
    ar: "راسل فريق المبيعات أو اتصل به، تابعنا، زر الفرع، أو تصفح الموقع.",
  },
  sales: { en: "Sales team", ar: "فريق المبيعات" },
  call: { en: "Call", ar: "اتصال" },
  whatsapp: { en: "WhatsApp", ar: "واتساب" },
  follow: { en: "Follow us", ar: "تابعنا" },
  more: { en: "More", ar: "المزيد" },
  website: { en: "Visit the website", ar: "زيارة الموقع" },
  projects: { en: "See our projects", ar: "شاهد مشروعاتنا" },
  email: { en: "Email us", ar: "راسلنا بالبريد" },
  branch: { en: "Our branch on Google Maps", ar: "فرعنا على خرائط جوجل" },
} satisfies Record<string, L>;

/**
 * The account's name from its address: "tiktok.com/@varanda452" → "@varanda452",
 * "facebook.com/people/Varanda/615…" → "Varanda"; the site's address when there's no name.
 */
function handle(url: string) {
  const u = new URL(url);
  const [first, second] = u.pathname.split("/").filter(Boolean);
  if (first === "people" && second) return decodeURIComponent(second).replace(/-/g, " ");
  return first && !first.includes(".php") ? `@${first.replace(/^@/, "")}` : u.host.replace(/^www\./, "");
}

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMeta(lang, "/contact", copy.meta[lang], copy.intro[lang]);
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = (s: L) => s[lang];
  const { contact } = site;
  const live = contactIsLive;
  const social = (Object.keys(socialNetworks) as SocialNetwork[]).filter((n) => site.social[n]);

  return (
    <section className="links theme-deep" data-header="dark" aria-labelledby="links-title">
      <div className="links-inner">
        <LogoLockup className="links-logo" />
        <h1 id="links-title" className="t-h2 mt-10 text-white">
          {t(copy.title)}
        </h1>
        <p className="t-small mt-3 text-mist">{t(copy.intro)}</p>

        {live && contact.people.length > 0 && (
          <div className="mt-10">
            <h2 className="t-label text-mist">{t(copy.sales)}</h2>
            <ul className="mt-4 space-y-3">
              {/* By job title: the names stay on the dashboard. */}
              {contact.people.map((p) => (
                <li key={p.phone} className="links-person">
                  <p className="text-white">{t(p.role)}</p>
                  <div className="mt-4 grid gap-2">
                    {p.whatsapp && (
                      <a className="links-btn links-btn-whatsapp" href={whatsappHref(p.whatsapp, t(ui.whatsappGreeting))} target="_blank" rel="noopener noreferrer">
                        <SocialIcon name="whatsapp" />
                        {t(copy.whatsapp)}
                      </a>
                    )}
                    <a className="links-btn" href={telHref(p.phone)}>
                      <Icon name="phone" className="h-5 w-5" />
                      <span>
                        {t(copy.call)}{" "}
                        <span dir="ltr" className="t-num whitespace-nowrap">
                          {p.phone}
                        </span>
                      </span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {social.length > 0 && (
          <div className="mt-10">
            <h2 className="t-label text-mist">{t(copy.follow)}</h2>
            <ul className="mt-4 space-y-2">
              {social.map((n) => (
                <li key={n}>
                  <a href={site.social[n]!} target="_blank" rel="noopener noreferrer" className="links-row">
                    <span className="flex min-w-0 items-center gap-4">
                      <SocialIcon name={n} className="h-6 w-6" />
                      <span className="min-w-0">
                        {socialNetworks[n].label}
                        <span className="links-row-sub">
                          <span dir="ltr">{handle(site.social[n]!)}</span>
                        </span>
                      </span>
                    </span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10">
          <h2 className="t-label text-mist">{t(copy.more)}</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <TLink href={path(lang, "/book-a-visit")} className="links-row links-row-primary">
                {t(ui.bookVisit)}
                <Arrow />
              </TLink>
            </li>
            <li>
              <TLink href={path(lang)} className="links-row">
                <span>
                  {t(copy.website)}
                  <span className="links-row-sub">
                    <span dir="ltr">{new URL(site.url).host}</span>
                  </span>
                </span>
                <Arrow />
              </TLink>
            </li>
            <li>
              <TLink href={path(lang, "/projects")} className="links-row">
                {t(copy.projects)}
                <Arrow />
              </TLink>
            </li>
            {live && contact.email && (
              <li>
                <a href={mailHref(contact.email)} className="links-row">
                  <span className="min-w-0">
                    {t(copy.email)}
                    <span className="links-row-sub">
                      <span dir="ltr">{contact.email}</span>
                    </span>
                  </span>
                  <Icon name="mail" className="h-5 w-5 shrink-0" />
                </a>
              </li>
            )}
            {live && contact.mapsUrl && (
              <li>
                <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="links-row">
                  <span>
                    {t(copy.branch)}
                    {contact.address && <span className="links-row-sub">{t(contact.address)}</span>}
                  </span>
                  <Icon name="pin" className="h-5 w-5 shrink-0" />
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
