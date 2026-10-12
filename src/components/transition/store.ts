import type Lenis from "lenis";

/**
 * Tiny shared state for the door transition. Kept outside React so GSAP
 * timelines inside effects can subscribe without re-rendering anything.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export const pageEnter = {
  /** True once the current page has been revealed (doors open). */
  entered: false,

  reset() {
    this.entered = false;
  },

  emit() {
    this.entered = true;
    for (const fn of [...listeners]) fn();
    listeners.clear();
  },
};

/**
 * Run `fn` when the page is revealed. If it already has been (e.g. a section
 * mounted later), run it on the next frame. Returns an unsubscribe function.
 */
export function onPageEnter(fn: Listener) {
  if (pageEnter.entered) {
    const id = requestAnimationFrame(fn);
    return () => cancelAnimationFrame(id);
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export const scroller: { lenis: Lenis | null } = { lenis: null };

export function scrollToTop() {
  scroller.lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}
