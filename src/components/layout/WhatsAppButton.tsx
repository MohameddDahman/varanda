import type { Lang } from "@/i18n/config";
import { site, ui } from "@/content/site";
import { contactIsLive, whatsappHref } from "@/lib/contact";
import { SocialIcon } from "@/components/ui/SocialIcon";

/**
 * WhatsApp one tap away on every page: a chat with the sales line, the greeting already typed.
 * Plain HTML and CSS, so it costs no script and never shifts the layout.
 */
export function WhatsAppButton({ lang }: { lang: Lang }) {
  const number = site.contact.whatsapp;
  if (!number || !contactIsLive) return null;
  // A landmark of its own, so screen readers list it with the page's other regions.
  return (
    <aside aria-label="WhatsApp">
      <a
        className="whatsapp-fab"
        href={whatsappHref(number, ui.whatsappGreeting[lang])}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ui.whatsappChat[lang]}
      >
        <SocialIcon name="whatsapp" />
      </a>
    </aside>
  );
}
