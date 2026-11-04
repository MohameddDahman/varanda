"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion, whenNear } from "@/lib/gsap";

/** Counts from 0 to `to` when scrolled into view. `to` may be a range like "15–20". */
export function CountUp({ to, className, duration = 1.8 }: { to: string | number; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const text = String(to);

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const parts = text.split(/(\d+)/);
      const numbers = parts.map((p) => (/^\d+$/.test(p) ? Number(p) : null));
      const state = { p: 0 };
      const render = () => {
        el.textContent = parts
          .map((p, i) => (numbers[i] === null ? p : String(Math.round((numbers[i] as number) * state.p))))
          .join("");
      };
      // Reset to zero and wait for it only as it nears the viewport (see whenNear).
      const setup = () => {
        render();
        const tween = gsap.to(state, { p: 1, duration, ease: "power3.out", paused: true, onUpdate: render });
        ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => tween.play() });
      };
      return whenNear(el, contextSafe ? contextSafe(setup) : setup);
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  );
}
