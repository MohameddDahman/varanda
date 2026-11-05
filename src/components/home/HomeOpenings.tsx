"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { openingSystems, type OpeningKind } from "@/content/systems";
import { ui } from "@/content/site";
import { OpeningDrawing, type OpeningHandle } from "@/components/systems/OpeningDrawing";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Pinned horizontal rail of the six opening systems. Vertical scroll drives
 * the track sideways; each window opens as its card reaches the centre.
 */
export function HomeOpenings() {
  const { lang, t, href, rtl } = useLang();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drawings = useRef<(OpeningHandle | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tr = track.current!;
        const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth);
        const sign = rtl ? 1 : -1;

        const rail = gsap.to(tr, {
          x: () => sign * distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-card]", root.current).forEach((card, i) => {
          const tl = drawings.current[i]?.timeline();
          if (!tl) return;
          ScrollTrigger.create({
            trigger: card,
            containerAnimation: rail,
            start: rtl ? "right 12%" : "left 88%",
            end: rtl ? "center 48%" : "center 52%",
            scrub: 0.6,
            animation: tl,
          });
        });

        gsap.fromTo(
          "[data-progress]",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [rtl] },
  );

  return (
    <section ref={root} className="rail theme-dark" data-header="dark" aria-labelledby="openings-title">
      <div ref={track} className="rail-track">
        <div className="rail-intro">
          <Eyebrow>{lang === "ar" ? "أنظمة الفتح" : "Opening systems"}</Eyebrow>
          <h2 id="openings-title" className="t-display fit-display mt-6">
            {lang === "ar" ? "طرق ذكية لفتح المساحات." : "Smart ways to open a space."}
          </h2>
          <p className="t-lead mt-6 max-w-[34ch] text-mist">
            {lang === "ar"
              ? "لكل فتحة طريقتها في الحركة. اختر ما يناسب المساحة والإطلالة والاستخدام اليومي."
              : "Every opening moves differently. Choose the one that suits the space, the view and how you live with it."}
          </p>
          <div className="mt-10">
            <Button href={href("/systems/windows-doors")} variant="light">
              {t(ui.allSystems)}
            </Button>
          </div>
        </div>

        {openingSystems.map((item, i) => (
          <article key={item.id} data-card className="rail-card" aria-labelledby={`opening-${item.id}`}>
            <OpeningDrawing
              ref={(h) => {
                drawings.current[i] = h;
              }}
              kind={item.id as OpeningKind}
            />
            <div className="mt-4 md:mt-6">
              <h3 id={`opening-${item.id}`} className="t-h2">
                {t(item.name)}
              </h3>
              <p className="t-small mt-3 max-w-[36ch] text-mist">{t(item.text)}</p>
              {item.tags && (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label={lang === "ar" ? "المميزات" : "Features"}>
                  {item.tags.map((tag) => (
                    <li key={tag.en} className="rail-tag">
                      {t(tag)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="rail-progress wrap" aria-hidden="true">
        <span className="rail-progress-bar">
          <span data-progress className="rail-progress-fill" />
        </span>
      </div>
    </section>
  );
}
