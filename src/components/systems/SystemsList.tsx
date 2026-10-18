"use client";

import Image from "next/image";
import { useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { systems } from "@/content/systems";
import { photos } from "@/content/photos";
import { TLink } from "@/components/transition/TLink";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import { coverSizes } from "@/lib/sizes";

/** Big list of product lines; the photo beside it follows the row you point at. */
export function SystemsList() {
  const { t, href, lang } = useLang();
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
      <Reveal as="ol" items="li" className="lg:col-span-7">
        {systems.map((s, i) => (
          <li key={s.slug} className="border-b border-[var(--line)] first:border-t">
            <TLink
              href={href(`/systems/${s.slug}`)}
              className="systems-row group"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              data-cursor={lang === "ar" ? "افتح" : "Open"}
            >
              <div className="relative mb-6 aspect-[16/10] overflow-hidden lg:hidden">
                <Image src={photos[s.cover].src} alt="" fill sizes={coverSizes(photos[s.cover].src, "100vw", 16 / 10)} className="object-cover" placeholder="blur" style={{ objectPosition: photos[s.cover].focus }} />
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <h2 className={cn("t-h1 transition-colors duration-300", active === i ? "lg:text-[var(--fg)]" : "lg:text-[var(--fg-2)]")}>
                  {t(s.name)}
                </h2>
                <span className="t-label shrink-0 text-[var(--fg-2)]">{t(s.count)}</span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-6">
                <p className="t-body max-w-[46ch] text-[var(--fg-2)]">{t(s.short)}</p>
                <span className="shrink-0 transition-transform duration-500 group-hover:translate-x-2 rtl:group-hover:-translate-x-2">
                  <Arrow className="h-4 w-8" />
                </span>
              </div>
            </TLink>
          </li>
        ))}
      </Reveal>

      <div className="hidden lg:col-span-4 lg:col-start-9 lg:block">
        <div className="sticky top-[calc(var(--header-h)+2rem)] aspect-[4/5] overflow-hidden bg-navy-900">
          {systems.map((s, i) => (
            <div
              key={s.slug}
              className={cn(
                "absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out)]",
                active === i ? "scale-100 opacity-100" : "scale-[1.06] opacity-0",
              )}
              aria-hidden={active !== i}
            >
              <Image src={photos[s.cover].src} alt={t(photos[s.cover].alt)} fill sizes={coverSizes(photos[s.cover].src, "34vw", 4 / 5, 1.06)} className="object-cover" placeholder="blur" style={{ objectPosition: photos[s.cover].focus }} />
            </div>
          ))}
          <span className="t-label absolute bottom-4 start-4 bg-navy-950/70 px-3 py-2 text-white backdrop-blur">
            {t(systems[active].name)}
          </span>
        </div>
      </div>
    </div>
  );
}
