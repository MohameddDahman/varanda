"use client";

import { useRef } from "react";
import type { L } from "@/i18n/config";
import type { Photo } from "@/content/photos";
import { gsap, useGSAP } from "@/lib/gsap";
import { DRIFT, screenSizes } from "@/lib/sizes";
import { useLang } from "@/components/providers/LangProvider";
import { ui } from "@/content/site";
import { TLink } from "@/components/transition/TLink";
import { ShutterImage } from "@/components/motion/ShutterImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Button, Arrow } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** What a stacked card shows; the page passes only these, so the photo library stays on the server. */
export type FeaturedProject = { slug: string; title: L; typeLabel: L; year: number; summary: L; photo: Photo };

/**
 * Selected work as a stack: each project sticks under the header and the next
 * slides over it while the previous one settles back.
 */
export function HomeProjects({ items }: { items: FeaturedProject[] }) {
  const { lang, t, href } = useLang();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", root.current);
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap.to(card.querySelector("[data-stack-inner]"), {
            scale: 0.9,
            filter: "brightness(0.55)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 12%", scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="theme-white section" data-header="light" aria-labelledby="work-title">
      <div className="wrap">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>{lang === "ar" ? "أعمال مختارة" : "Selected work"}</Eyebrow>
            <SplitReveal as="h2" id="work-title" className="t-display mt-6 max-w-[12ch]">
              {lang === "ar" ? "مشاريعنا." : "Our projects."}
            </SplitReveal>
          </div>
          <Button href={href("/projects")} variant="outline">
            {t(ui.allProjects)}
          </Button>
        </div>

        <div className="mt-16 lg:mt-24">
          {items.map((p, i) => (
            <article key={p.slug} data-stack-card className="stack-card" style={{ zIndex: i + 1 }}>
              <div data-stack-inner className="stack-inner">
                <TLink href={href(`/projects/${p.slug}`)} label={p.title} className="stack-link" data-cursor={t(ui.view)}>
                  <ShutterImage
                    photo={p.photo}
                    sizes={`(min-width: 1680px) 1600px, ${screenSizes(p.photo.src, 78, DRIFT)}`}
                    className="absolute inset-0"
                    slats={9}
                  />
                  <span className="stack-shade" aria-hidden="true" />
                  <div className="stack-info">
                    <p className="t-label text-white/80">
                      {t(p.typeLabel)} · {p.year}
                    </p>
                    <h3 className="t-h1 mt-3 text-white">{t(p.title)}</h3>
                    <p className="t-small mt-4 hidden max-w-[44ch] text-white/80 md:block">{t(p.summary)}</p>
                    <span className="stack-cta t-label mt-6 text-white">
                      {lang === "ar" ? "شاهد المشروع" : "See the project"}
                      <Arrow />
                    </span>
                  </div>
                </TLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
