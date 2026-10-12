import { site } from "@/content/site";

/** False while the contact details are samples: they're shown, but never linked. */
export const contactIsLive = !site.contact.sample;

/** A link target, or undefined while the details are samples (an <a> without href is inert). */
const live = (href: string) => (contactIsLive ? href : undefined);

export const telHref = (phone: string) => live(`tel:${phone.replace(/[^\d+]/g, "")}`);

export const mailHref = (email: string) => live(`mailto:${email}`);

export const whatsappHref = (number: string, text?: string) =>
  live(`https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`);

/** "201000000000" → "+20 100 000 0000" for Egyptian numbers; other countries are left as "+…". */
export const prettyWhatsapp = (number: string) =>
  number.startsWith("20") && number.length === 12
    ? `+20 ${number.slice(2, 5)} ${number.slice(5, 8)} ${number.slice(8)}`
    : `+${number}`;
