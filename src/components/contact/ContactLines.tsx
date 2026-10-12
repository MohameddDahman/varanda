import type { L, Lang } from "@/i18n/config";
import { site } from "@/content/site";
import { mailHref, prettyWhatsapp, telHref, whatsappHref } from "@/lib/contact";
import { Icon } from "@/components/ui/Icon";
import { Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Line = { id: string; icon: string; label: L; value: string; note?: L; action: L; href?: string; external?: boolean };

const greeting: L = {
  en: "Hello VARANDA, I'd like to ask about windows and doors.",
  ar: "مرحبًا VARANDA، أود الاستفسار عن الأبواب والشبابيك.",
};

/**
 * The direct ways to reach the team, one column each. While the details are samples the
 * cards render without links or calls to action, so nobody dials a made-up number.
 */
export function ContactLines({ lang, className }: { lang: Lang; className?: string }) {
  const t = (s: L) => s[lang];
  const { contact } = site;

  const lines: Line[] = [];
  if (contact.phone) {
    lines.push({
      id: "phone",
      icon: "phone",
      label: { en: "Call", ar: "اتصل بنا" },
      value: contact.phone,
      note: contact.hours ?? undefined,
      action: { en: "Call now", ar: "اتصل الآن" },
      href: telHref(contact.phone),
    });
  }
  if (contact.whatsapp) {
    lines.push({
      id: "whatsapp",
      icon: "chat",
      label: { en: "WhatsApp", ar: "واتساب" },
      value: prettyWhatsapp(contact.whatsapp),
      note: { en: "Send photos and rough sizes of your openings.", ar: "أرسل صورًا ومقاسات تقريبية لفتحاتك." },
      action: { en: "Start a chat", ar: "ابدأ المحادثة" },
      href: whatsappHref(contact.whatsapp, t(greeting)),
      external: true,
    });
  }
  if (contact.email) {
    lines.push({
      id: "email",
      icon: "mail",
      label: { en: "Email", ar: "البريد الإلكتروني" },
      value: contact.email,
      note: { en: "For drawings, plans and quotations.", ar: "للرسومات والمخططات وعروض الأسعار." },
      action: { en: "Write to us", ar: "راسلنا" },
      href: mailHref(contact.email),
    });
  }
  if (!lines.length) return null;

  return (
    <ul className={cn("contact-lines", className)}>
      {lines.map((line) => (
        <li key={line.id}>
          <a
            href={line.href}
            className="contact-line"
            data-cursor={line.href ? t(line.action) : undefined}
            {...(line.external && line.href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <span className="contact-line-head">
              <span className="t-label">{t(line.label)}</span>
              <Icon name={line.icon} className="h-5 w-5" />
            </span>
            {/* The number reads left to right; the block still aligns with the page direction. */}
            <span className="contact-line-value t-num">
              <span dir="ltr">{line.value}</span>
            </span>
            {line.note && <span className="contact-line-note t-small">{t(line.note)}</span>}
            {line.href && (
              <span className="contact-line-cta t-label">
                {t(line.action)}
                <Arrow />
              </span>
            )}
          </a>
        </li>
      ))}
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
