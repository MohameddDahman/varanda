"use client";

import { createContext, useContext } from "react";
import type { L, Lang } from "@/i18n/config";

const AdminLangContext = createContext<Lang>("en");

export function AdminLangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <AdminLangContext value={lang}>{children}</AdminLangContext>;
}

/** The dashboard's language in client components, with a picker for bilingual text. */
export function useAdminLang() {
  const lang = useContext(AdminLangContext);
  return { lang, t: (text: L) => text[lang] };
}
