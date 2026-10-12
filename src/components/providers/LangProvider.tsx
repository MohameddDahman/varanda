"use client";

import { createContext, useContext } from "react";
import { type L, type Lang, path as langPath } from "@/i18n/config";

const LangContext = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Current language plus helpers for client components. */
export function useLang() {
  const lang = useContext(LangContext);
  return {
    lang,
    rtl: lang === "ar",
    t: (text: L) => text[lang],
    href: (to: string) => langPath(lang, to),
  };
}
