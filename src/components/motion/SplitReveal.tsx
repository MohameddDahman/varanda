"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, reducedMotion, splitAria, whenNear } from "@/lib/gsap";
import { onPageEnter } from "@/components/transition/store";
import type { Polymorphic, TagName } from "./Reveal";

type Props = {
  as?: TagName;
  children: React.ReactNode;
  className?: string;
  /** "scroll": when it enters the viewport. "enter": when the page is revealed. */
  trigger?: "scroll" | "enter";
  delay?: number;
  id?: string;
};

/**
 * Text that rises line by line from behind a mask. Lines are re-measured
 * after fonts load or the layout changes (SplitText autoSplit); once the
 * reveal has played it never replays.
 */
export function SplitReveal({ as: Tag = "p", children, className, trigger = "scroll", delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const arabic = document.documentElement.lang === "ar";
      let tl: gsap.core.Timeline | null = null;
      let played = false;
      let split: SplitText | undefined;

      const play = () => {
        played = true;
        tl?.play();
      };
      const setup = () => {
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          // masks become .split-line-mask, padded in CSS so descenders aren't clipped
          linesClass: "split-line",
          aria: splitAria(el),
          autoSplit: true,
          onSplit(self) {
            tl = gsap.timeline({ paused: true, delay });
            tl.from(self.lines, { yPercent: arabic ? 120 : 110, duration: 1.15, stagger: 0.085, ease: "lift" });
            if (played) tl.progress(1);
            return tl;
          },
        });
        if (trigger === "scroll") ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: play });
      };

      // "enter" text plays as the doors part, so it's split now; text revealed on scroll is
      // split only as it nears the viewport.
      let off: (() => void) | undefined;
      let stop: (() => void) | undefined;
      if (trigger === "enter") {
        setup();
        off = onPageEnter(play);
      } else {
        stop = whenNear(el, contextSafe ? contextSafe(setup) : setup);
      }

      return () => {
        off?.();
        stop?.();
        split?.revert();
      };
    },
    { scope: ref },
  );

  const El = Tag as unknown as Polymorphic;
  return (
    <El ref={ref} id={id} className={className}>
      {children}
    </El>
  );
}
