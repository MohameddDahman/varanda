import type { Lang } from "@/i18n/config";

// Times are formatted on the server, in Cairo time, so the page and its hydration agree.
const TZ = "Africa/Cairo";
// Arabic with Western digits, as on the site.
const locale = (lang: Lang) => (lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB");

/** "5 minutes ago", "yesterday", "3 Oct". */
export function timeAgo(ms: number, lang: Lang, now = Date.now()) {
  const seconds = Math.round((ms - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale(lang), { numeric: "auto" });
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(0, "second");
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 7 * 86400) return rtf.format(Math.round(seconds / 86400), "day");
  return new Intl.DateTimeFormat(locale(lang), { day: "numeric", month: "short", timeZone: TZ }).format(ms);
}

/** "Sat 18 Oct 2026, 15:42". */
export function fullDate(ms: number, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(ms);
}
