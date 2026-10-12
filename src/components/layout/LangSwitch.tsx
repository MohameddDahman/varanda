"use client";

import { usePathname } from "next/navigation";
import { switchLangPath } from "@/i18n/config";
import { ui } from "@/content/site";
import { useLang } from "@/components/providers/LangProvider";
import { useTransitionNav } from "@/components/transition/TransitionProvider";

/**
 * A real link to this page in the other language, named in that language, so it can be
 * opened in a new tab or followed without JS. A plain click plays the door transition.
 */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, t } = useLang();
  const { switchLang } = useTransitionNav();
  const pathname = usePathname();
  const other = lang === "ar" ? "en" : "ar";

  return (
    <a
      href={switchLangPath(pathname, other)}
      hrefLang={other}
      lang={other}
      className={className}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        switchLang(other);
      }}
    >
      {t(ui.switchTo)}
    </a>
  );
}
