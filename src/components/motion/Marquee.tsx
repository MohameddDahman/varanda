"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * Endless band of text. It drifts on its own and speeds up (or reverses)
 * with the reader's scroll velocity. Static under reduced motion.
 */
export function Marquee({ children, className, speed = 60 }: { children: React.ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const track = el.querySelector<HTMLElement>("[data-track]")!;
      const setX = gsap.quickSetter(track, "x", "px");
      const rtl = document.documentElement.dir === "rtl";
      const sign = rtl ? 1 : -1;
      let x = 0;
      let boost = 0;
      let direction = 1;
      // Measured on refresh: reading layout in the ticker would force a reflow every frame.
      let half = track.scrollWidth / 2;

      const tick = (_time: number, dt: number) => {
        if (!half) return;
        boost *= 0.94;
        x += (sign * direction * (speed + boost * speed) * dt) / 1000;
        if (sign * x > half) x -= sign * half;
        if (sign * x < 0) x += sign * half;
        setX(x);
      };

      // It only drifts while on screen; off screen it would still cost a style and layer
      // update on every frame of every animation on the page.
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onRefresh: () => {
          half = track.scrollWidth / 2;
        },
        onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
        onUpdate(self) {
          const v = self.getVelocity();
          direction = self.direction;
          boost = Math.min(Math.abs(v) / 120, 14);
        },
      });
      if (st.isActive) gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        st.kill();
      };
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("overflow-hidden", className)} aria-hidden="true">
      <div data-track className="flex w-max">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </div>
    </div>
  );
}
