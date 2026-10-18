/**
 * International digits for wa.me. Visitors type numbers many ways: "+20 100…", "0020 100…" or
 * the local "0100…", which is Egyptian, so it gets the 20 country code.
 */
export function internationalDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `20${digits.slice(1)}`;
  return digits;
}

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const whatsappLink = (phone: string, text: string) =>
  `https://wa.me/${internationalDigits(phone)}?text=${encodeURIComponent(text)}`;
