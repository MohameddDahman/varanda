"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, reducedMotion } from "@/lib/gsap";

/**
 * A small dot plus a trailing ring. Elements opt into a labelled state with
 * data-cursor="View" (any short text). Fine pointers only.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || reducedMotion()) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });

    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    let current = "";
    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, [role=button], input, select, textarea, label");
      const state = labelled ? `label:${labelled.dataset.cursor ?? ""}` : interactive ? "hover" : "";
      if (state === current) return;
      current = state;
      const r = ring.current!;
      r.classList.toggle("is-hover", state === "hover");
      r.classList.toggle("is-label", state.startsWith("label:"));
      if (label.current) label.current.textContent = state.startsWith("label:") ? state.slice(6) : "";
      gsap.to(dot.current, { scale: state ? 0 : 1, duration: 0.25 });
    };

    const leave = () => {
      shown = false;
      gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.3 });
    };
    const down = () => gsap.to(ring.current, { scale: 0.86, duration: 0.2 });
    const up = () => gsap.to(ring.current, { scale: 1, duration: 0.4, ease: "back.out(3)" });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  // Reset any label state when the page changes under the pointer.
  useEffect(() => {
    ring.current?.classList.remove("is-hover", "is-label");
    if (label.current) label.current.textContent = "";
    gsap.set(dot.current, { scale: 1 });
  }, [pathname]);

  return (
    <div aria-hidden="true" className="cursor">
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
