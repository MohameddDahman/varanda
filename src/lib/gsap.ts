import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

// Only the plugins every page uses are registered here; page-specific ones (Flip on the
// projects index) are imported where they're needed so other pages don't ship them.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

  // "door": a sliding panel that accelerates away, then glides into a soft close.
  CustomEase.create("door", "M0,0 C0.72,0 0.12,1 1,1");
  // "soft": long, calm deceleration used for most reveals.
  CustomEase.create("soft", "M0,0 C0.16,1 0.3,1 1,1");
  // "lift": quick start, gentle settle — for text rising into place.
  CustomEase.create("lift", "M0,0 C0.25,0.9 0.25,1 1,1");

  gsap.defaults({ ease: "soft", duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Dev aid: ?pin=transform pins with transforms so screenshot tools that
  // mis-draw fixed elements can capture pinned scenes. Never on by default.
  if (process.env.NODE_ENV !== "production" && window.location.search.includes("pin=transform")) {
    ScrollTrigger.defaults({ pinType: "transform" });
  }
}

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isRTL = () => typeof document !== "undefined" && document.documentElement.dir === "rtl";

/**
 * SplitText's default aria mode moves the text into an aria-label and hides the pieces,
 * which only works on elements that may carry a label (headings). On a paragraph the
 * label is ignored, so leave the split words themselves readable instead.
 */
export const splitAria = (el: Element): "auto" | "none" => (/^H[1-6]$/.test(el.tagName) ? "auto" : "none");
