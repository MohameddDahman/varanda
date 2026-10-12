"use client";

import { scroller } from "@/components/transition/store";

export function BackToTop({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (scroller.lenis) scroller.lenis.scrollTo(0, { duration: 1.6 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
    >
      {children}
    </button>
  );
}
