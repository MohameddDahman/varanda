"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { gsap } from "@/lib/gsap";
import type { L } from "@/i18n/config";
import { VMark, Wordmark } from "@/components/brand/Logo";

export type DoorsHandle = {
  /** Slide both panels shut, showing the destination name on the glass. */
  close: (label: L) => Promise<void>;
  /** Slide the panels apart and hide the overlay. */
  open: () => Promise<void>;
  /** First-visit brand intro played on the closed doors. */
  intro: () => Promise<void>;
  /** Remove the overlay without motion (reduced motion). */
  hide: () => void;
};

const TAGLINE = "MADE FOR LIFE";

/** Resolve once a timeline has finished. */
const finished = (tl: gsap.core.Timeline) => new Promise<void>((resolve) => void tl.then(() => resolve()));

/**
 * Full-screen bi-parting sliding door. Server-rendered CLOSED so the first
 * paint is covered while JS prepares the page, then opened by the provider.
 */
export const Doors = forwardRef<DoorsHandle>(function Doors(_, ref) {
  const root = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const seam = useRef<HTMLSpanElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const brand = useRef<HTMLDivElement>(null);
  const labelEn = useRef<HTMLSpanElement>(null);
  const labelAr = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => {
    const show = () => gsap.set(root.current, { visibility: "visible", pointerEvents: "auto" });
    const labels = () => [labelEn.current, labelAr.current];

    return {
      close(label) {
        if (labelEn.current) labelEn.current.textContent = label.en;
        if (labelAr.current) labelAr.current.textContent = label.ar;
        show();
        gsap.set(brand.current, { autoAlpha: 0 });
        gsap.set(gsap.utils.toArray(".door-handle", root.current), { autoAlpha: 1 });
        const tl = gsap.timeline();
        // The route is pushed when this resolves, so only the doors gate it;
        // the seam and mark finish while the next page is already loading.
        tl.fromTo(left.current, { xPercent: -101 }, { xPercent: 0, duration: 0.8, ease: "door" }, 0)
          .fromTo(right.current, { xPercent: 101 }, { xPercent: 0, duration: 0.8, ease: "door" }, 0.04)
          .fromTo(labels(), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "lift" }, 0.38)
          .fromTo(seam.current, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "soft" }, 0.62)
          .fromTo(mark.current, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "back.out(2.4)" }, 0.78);
        return new Promise<void>((resolve) => void tl.call(resolve, [], 0.86));
      },

      open() {
        show();
        // close() resolves as the panels meet; stop its decorative tail first.
        gsap.killTweensOf([seam.current, mark.current, labelEn.current, labelAr.current]);
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(root.current, { visibility: "hidden", pointerEvents: "none" });
          },
        });
        tl.to(mark.current, { autoAlpha: 0, y: 8, duration: 0.28, ease: "power2.in" }, 0)
          .to(brand.current, { autoAlpha: 0, y: -18, duration: 0.4, ease: "power2.in" }, 0)
          .to(seam.current, { scaleY: 0, duration: 0.32, ease: "power2.in" }, 0)
          .to(left.current, { xPercent: -101, duration: 1.05, ease: "door" }, 0.14)
          .to(right.current, { xPercent: 101, duration: 1.05, ease: "door" }, 0.14);
        return finished(tl);
      },

      intro() {
        show();
        const q = gsap.utils.selector(brand.current);
        const handles = gsap.utils.toArray<HTMLElement>(".door-handle", root.current);
        gsap.set(brand.current, { autoAlpha: 1 });
        gsap.set([labelEn.current, labelAr.current, mark.current, ...handles], { autoAlpha: 0 });
        gsap.set(seam.current, { scaleY: 0 });
        // Handles stay hidden through the reveal; close() brings them back.
        const tl = gsap.timeline();
        tl.fromTo(
          q("[data-vm=red]"),
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power3.inOut" },
          0.1,
        )
          .fromTo(
            q("[data-vm=white]"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.inOut" },
            0.6,
          )
          .fromTo(q("[data-vm=fold]"), { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.3 }, 1)
          .fromTo(q("[data-wm]"), { yPercent: 120 }, { yPercent: 0, duration: 0.85, stagger: 0.055, ease: "lift" }, 0.75)
          .fromTo(
            q("[data-c]"),
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.03, ease: "soft" },
            1.15,
          )
          .fromTo(
            q("[data-tagline-dot]"),
            { autoAlpha: 0, y: -20 },
            { autoAlpha: 1, y: 0, duration: 0.55, ease: "bounce.out" },
            1.55,
          )
          .to({}, { duration: 0.5 });
        return finished(tl);
      },

      hide() {
        gsap.set(left.current, { xPercent: -101 });
        gsap.set(right.current, { xPercent: 101 });
        gsap.set(root.current, { visibility: "hidden", pointerEvents: "none" });
      },
    };
  });

  return (
    <div ref={root} data-doors className="doors" aria-hidden="true">
      <div ref={left} className="door door-left">
        <span className="door-pane" />
        <span className="door-sheen" />
        <span className="door-stile">
          <span className="door-handle" />
        </span>
        <span ref={labelEn} className="door-label door-label-en" lang="en" dir="ltr" />
      </div>
      <div ref={right} className="door door-right">
        <span className="door-pane" />
        <span className="door-sheen" />
        <span className="door-stile">
          <span className="door-handle" />
        </span>
        <span ref={labelAr} className="door-label door-label-ar" lang="ar" dir="rtl" />
      </div>

      <span ref={seam} className="door-seam" />
      <div ref={mark} className="door-mark">
        <VMark className="h-full w-full" />
      </div>

      <div ref={brand} className="door-brand" dir="ltr">
        <VMark className="door-brand-mark" />
        <span className="door-brand-word-wrap">
          <Wordmark className="door-brand-word" />
        </span>
        <span className="door-brand-tagline t-label" aria-hidden="true">
          {TAGLINE.split("").map((c, i) => (
            <span key={i} data-c>
              {c === " " ? " " : c}
            </span>
          ))}
          <span data-tagline-dot className="dot">
            .
          </span>
        </span>
      </div>
    </div>
  );
});
