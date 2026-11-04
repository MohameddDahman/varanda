import type { L, Lang } from "@/i18n/config";
import { site, ui } from "@/content/site";
import { mailHref, telHref, whatsappHref } from "@/lib/contact";
import { Icon } from "@/components/ui/Icon";
import { Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * The direct ways to reach the team: a card for each person (call or WhatsApp) and one for
 * email. While the details are samples the cards render without links, so nobody dials a
 * made-up number.
 */
export function ContactLines({ lang, className }: { lang: Lang; className?: string }) {
  const t = (s: L) => s[lang];
  const { contact } = site;
  if (!contact.people.length && !contact.email) return null;

  return (
    <ul className={cn("contact-lines", className)}>
      {contact.people.map((person) => {
        const call = telHref(person.phone);
        const chat = person.whatsapp ? whatsappHref(person.whatsapp, t(ui.whatsappGreeting)) : undefined;
        return (
          <li key={person.phone}>
            <div className="contact-line">
              <span className="contact-line-head">
                <span className="t-label">{t(person.role)}</span>
                <Icon name="phone" className="h-5 w-5" />
              </span>
              <span className="contact-line-name t-h3">{t(person.name)}</span>
              {/* The number reads left to right; the block still aligns with the page direction. */}
              <span className="contact-line-value t-num">
                <span dir="ltr" className="whitespace-nowrap">
                  {person.phone}
                </span>
              </span>
              {(call || chat) && (
                <span className="contact-line-actions">
                  {call && (
                    <a href={call} className="contact-action">
                      <Icon name="phone" className="h-4 w-4" />
                      {lang === "ar" ? "اتصال" : "Call"}
                    </a>
                  )}
                  {chat && (
                    <a href={chat} className="contact-action" target="_blank" rel="noopener noreferrer">
                      <Icon name="chat" className="h-4 w-4" />
                      {lang === "ar" ? "واتساب" : "WhatsApp"}
                    </a>
                  )}
                </span>
              )}
            </div>
          </li>
        );
      })}

      {contact.email && (
        <li>
          <a href={mailHref(contact.email)} className="contact-line">
            <span className="contact-line-head">
              <span className="t-label">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</span>
              <Icon name="mail" className="h-5 w-5" />
            </span>
            <span className="contact-line-name t-h3">{lang === "ar" ? "للرسومات وعروض الأسعار" : "Drawings & quotations"}</span>
            <span className="contact-line-value contact-line-email">
              <span dir="ltr">{contact.email}</span>
            </span>
            {mailHref(contact.email) && (
              <span className="contact-line-cta t-label">
                {lang === "ar" ? "راسلنا" : "Write to us"}
                <Arrow />
              </span>
            )}
          </a>
        </li>
      )}
    </ul>
  );
}

/** Marks placeholder content so nobody mistakes it for the client's real details. */
export function SampleTag({ lang, className }: { lang: Lang; className?: string }) {
  return (
    <p className={cn("sample-tag t-label", className)}>
      {lang === "ar" ? "بيانات تجريبية — ستُستبدل بالبيانات الفعلية" : "Sample details — to be replaced"}
    </p>
  );
}
