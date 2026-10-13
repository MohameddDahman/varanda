"use client";

import Image from "next/image";
import { useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { getSystem, type GlassKind } from "@/content/systems";
import { photos } from "@/content/photos";
import type { L } from "@/i18n/config";
import { cn } from "@/lib/cn";

const traits: Record<GlassKind, L[]> = {
  clear: [
    { en: "Most natural light", ar: "أكبر قدر من الضوء" },
    { en: "Clearest view", ar: "أوضح رؤية" },
  ],
  reflective: [
    { en: "Less heat", ar: "حرارة أقل" },
    { en: "More privacy", ar: "خصوصية أعلى" },
  ],
  fume: [
    { en: "Modern tint", ar: "مظهر عصري" },
    { en: "Ideal privacy", ar: "خصوصية مثالية" },
  ],
  double: [
    { en: "Thermal insulation", ar: "عزل حراري" },
    { en: "Acoustic insulation", ar: "عزل صوتي" },
    { en: "Lower energy use", ar: "توفير في الطاقة" },
  ],
};

/** Each glass option, photographed; picking one fades its photo in. */
export function GlassSwitcher() {
  const { t, lang } = useLang();
  const glass = getSystem("glass")!;
  const [active, setActive] = useState<GlassKind>("clear");
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-8">
      <div className="lg:col-span-5">
        {/* The glass itself, photographed: pick a type and its photo fades in. */}
        <div className="glass-stage relative aspect-[4/5] overflow-hidden bg-paper">
          {glass.items.map((item) =>
            item.image ? (
              <div key={item.id} className={cn("glass-photo", active === item.id && "is-active")} aria-hidden={active !== item.id}>
                <Image src={photos[item.image].src} alt={t(photos[item.image].alt)} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" placeholder="blur" />
              </div>
            ) : null,
          )}
        </div>
      </div>

      <div className="lg:col-span-6 lg:col-start-7 lg:self-center">
        <div role="tablist" aria-label={lang === "ar" ? "خيارات الزجاج" : "Glass options"} className="flex flex-col">
          {glass.items.map((item) => {
            const kind = item.id as GlassKind;
            const on = active === kind;
            return (
              <button
                key={item.id}
                role="tab"
                id={`glass-tab-${kind}`}
                aria-selected={on}
                aria-controls="glass-panel"
                onClick={() => setActive(kind)}
                className={cn("glass-tab", on && "is-active")}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className="t-h2">{t(item.name)}</span>
                  <span className="glass-tab-dot" aria-hidden="true" />
                </span>
                <span className="t-body mt-2 block text-[var(--fg-2)]">{t(item.text)}</span>
              </button>
            );
          })}
        </div>
        <div id="glass-panel" role="tabpanel" aria-labelledby={`glass-tab-${active}`} className="mt-8 flex flex-wrap gap-2">
          {traits[active].map((tr) => (
            <span key={tr.en} className="rail-tag !text-[var(--fg)]">
              {t(tr)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
