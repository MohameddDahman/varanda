"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { process } from "@/content/company";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SplitReveal } from "@/components/motion/SplitReveal";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The six real steps of a Varanda job. A sticky counter rolls to the step in
 * focus and a rule fills as you move down the list.
 */
export function HomeProcess({ id = "process" }: { id?: string }) {
  const { lang, t } = useLang();
  const root = useRef<HTMLElement>(null);
  const steps = process.steps;

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-step]", root.current);
      const roll = root.current?.querySelector<HTMLElement>("[data-roll]");
      const fill = root.current?.querySelector<HTMLElement>("[data-fill]");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(items, { opacity: 0.32 });
        items.forEach((item, i) => {
          ScrollTrigger.create({
            trigger: item,
            start: "top 62%",
            end: "bottom 62%",
            // A step lights up when it reaches the reading line and stays lit once read;
            // only the steps still ahead are dimmed.
            onEnter: () => gsap.to(item, { opacity: 1, duration: 0.5 }),
            onLeaveBack: () => gsap.to(item, { opacity: 0.32, duration: 0.5 }),
            onToggle: (self) => {
              // The strip holds every number; move it by one number's height per step.
              if (self.isActive && roll) gsap.to(roll, { yPercent: (-100 * i) / items.length, duration: 0.8, ease: "lift" });
            },
          });
        });
        if (fill) {
          gsap.fromTo(
            fill,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: items[0], endTrigger: items[items.length - 1], start: "top 62%", end: "bottom 62%", scrub: true },
            },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id={id} className="theme-dark section" data-header="dark" aria-labelledby="process-title">
      <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
            <Eyebrow>{lang === "ar" ? "خطوات العمل" : "How we work"}</Eyebrow>
            <SplitReveal as="h2" id="process-title" className="t-display mt-6 max-w-[11ch]">
              {t(process.title)}
              <span className="dot">.</span>
            </SplitReveal>
            <p className="t-lead mt-6 max-w-[38ch] text-mist">{t(process.intro)}</p>

            <div className="mt-14 hidden items-end gap-6 lg:flex" aria-hidden="true">
              <span className="process-roll t-num">
                <span data-roll className="process-roll-strip">
                  {steps.map((_, i) => (
                    <span key={i}>{pad(i + 1)}</span>
                  ))}
                </span>
              </span>
              <span className="t-label pb-3 text-mist">/ {pad(steps.length)}</span>
            </div>
          </div>
        </div>

        <ol className="relative lg:col-span-6 lg:col-start-7">
          <span className="process-rule" aria-hidden="true">
            <span data-fill className="process-rule-fill" />
          </span>
          {steps.map((step, i) => (
            <li key={step.title.en} data-step className="process-step">
              <span className="t-label text-red-bright">{pad(i + 1)}</span>
              <h3 className="t-h2 mt-5">{t(step.title)}</h3>
              <p className="t-lead mt-4 max-w-[40ch] text-mist">{t(step.text)}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="wrap mt-24 lg:mt-32">
        <ul className="process-commitments">
          {process.commitments.map((c) => (
            <li key={c.en} className="t-label">
              {t(c)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
