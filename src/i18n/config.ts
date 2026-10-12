export const locales = ["en", "ar"] as const;

export type Lang = (typeof locales)[number];

export const defaultLang: Lang = "en";

/** A string in every supported language. Content files keep both side by side. */
export type L = Record<Lang, string>;

export const isLang = (value: string | undefined | null): value is Lang =>
  !!value && (locales as readonly string[]).includes(value);

export const dirOf = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");

export const tr = (text: L, lang: Lang) => text[lang];

/** Build an in-site path for a language: path("ar", "/projects") → "/ar/projects". */
export const path = (lang: Lang, to = "") => `/${lang}${to === "/" ? "" : to}`;

/** Swap the language prefix of a pathname, keeping the rest of the route. */
export const switchLangPath = (pathname: string, to: Lang) => {
  const parts = pathname.split("/");
  if (isLang(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
};

export const LANG_COOKIE = "lang";
