"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
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

/** See the same view through each glass option. */
export function GlassSwitcher() {
  const { t, lang } = useLang();
  const glass = getSystem("glass")!;
  const [active, setActive] = useState<GlassKind>("clear");
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const d = reducedMotion() ? 0 : 0.9;
      gsap.to(q("[data-layer]"), { autoAlpha: 0, duration: d, ease: "power2.inOut" });
      gsap.to(q(`[data-layer=${active}]`), { autoAlpha: 1, duration: d, ease: "power2.inOut" });
      gsap.to(q("[data-scene]"), {
        filter:
          active === "reflective"
            ? "brightness(0.78) saturate(0.7)"
            : active === "fume"
              ? "brightness(0.62) saturate(0.55) sepia(0.15)"
              : "brightness(1) saturate(1)",
        duration: d,
      });
      if (!reducedMotion()) {
        gsap.fromTo(q("[data-glare]"), { x: 0, skewX: -14, xPercent: -140 }, { xPercent: 260, duration: 1.4, ease: "power2.inOut" });
      }
    },
    { dependencies: [active], scope: root },
  );

  return (
    <div ref={root} className="grid gap-12 lg:grid-cols-12 lg:gap-x-8">
      <div className="lg:col-span-7">
        <div className="glass-stage relative aspect-[4/3] overflow-hidden bg-navy-900">
          <div data-scene className="absolute inset-0">
            <Image src={photos.heroRiverSliding.src} alt={t(photos.heroRiverSliding.alt)} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" placeholder="blur" />
          </div>
          <span data-layer="reflective" className="glass-layer glass-reflective" />
          <span data-layer="fume" className="glass-layer glass-fume" />
          <div data-layer="double" className="glass-layer glass-double">
            <svg viewBox="0 0 120 160" className="glass-section" aria-hidden="true">
              <rect x="34" y="8" width="10" height="144" fill="rgb(200 225 235 / 0.85)" stroke="#fff" strokeWidth="0.8" />
              <rect x="76" y="8" width="10" height="144" fill="rgb(200 225 235 / 0.85)" stroke="#fff" strokeWidth="0.8" />
              <rect x="44" y="140" width="32" height="10" fill="#9aa4b1" />
              <path d="M48 30 Q60 22 72 30 M48 50 Q60 42 72 50 M48 70 Q60 62 72 70" stroke="#fff" strokeOpacity="0.6" fill="none" />
            </svg>
            <p className="glass-section-note t-label">
              {lang === "ar" ? "زجاج · فراغ محكم · زجاج" : "Glass · sealed gap · glass"}
            </p>
          </div>
          <span data-glare className="glass-glare" />
          <span className="absolute inset-0 shadow-[inset_0_0_0_10px_#eef0f3]" aria-hidden="true" />
        </div>
      </div>

      <div className="lg:col-span-5">
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
