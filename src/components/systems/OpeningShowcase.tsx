"use client";

import { useLang } from "@/components/providers/LangProvider";
import { openingSystems, type OpeningKind } from "@/content/systems";
import { OpeningDrawing } from "./OpeningDrawing";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

/** Each opening system on its own row, the window opening and closing on loop. */
export function OpeningShowcase() {
  const { t, lang } = useLang();
  return (
    <div className="space-y-[clamp(5rem,10vw,9rem)]">
      {openingSystems.map((item, i) => (
        <article key={item.id} id={item.id} className="grid items-center gap-10 md:grid-cols-12 md:gap-x-8" aria-labelledby={`os-${item.id}`}>
          <div className={cn("md:col-span-5", i % 2 === 1 && "md:order-2 md:col-start-8")}>
            <div className="mx-auto max-w-[26rem]">
              <OpeningDrawing kind={item.id as OpeningKind} mode="loop" />
            </div>
          </div>
          <Reveal className={cn("md:col-span-6", i % 2 === 1 ? "md:order-1 md:col-start-1" : "md:col-start-7")}>
            <p className="t-label text-[var(--fg-2)]">{lang === "ar" ? "نظام فتح" : "Opening system"}</p>
            <h3 id={`os-${item.id}`} className="t-display mt-4">
              {t(item.name)}
            </h3>
            <p className="t-lead mt-6 max-w-[38ch] text-[var(--fg-2)]">{t(item.text)}</p>
            {item.tags && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li key={tag.en} className="chip pointer-events-none">
                    {t(tag)}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </article>
      ))}
    </div>
  );
}
