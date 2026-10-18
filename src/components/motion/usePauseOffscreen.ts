"use client";

import { useEffect, type RefObject } from "react";

/**
 * Pauses an element's looping CSS animations while it is off screen, where they would
 * still cost a style update on every frame. It marks the element with `data-offscreen`
 * (an attribute React doesn't manage, so re-renders keep it); see globals.css.
 */
export function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => el.toggleAttribute("data-offscreen", !entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
