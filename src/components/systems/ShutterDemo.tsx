"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";

/**
 * A roller shutter you lower by scrolling: the curtain slides out of its box,
 * the room dims and the light/privacy meters follow.
 */
export function ShutterDemo() {
  const { lang } = useLang();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (reducedMotion()) {
        gsap.set(q("[data-curtain]"), { y: 0, yPercent: -45 });
        return;
      }
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      // `y: 0` clears the CSS start position (translateY(-100%), which keeps
      // the curtain up before JS runs) so only yPercent drives the motion.
      tl.to({}, { duration: 0.12 })
        .fromTo(q("[data-curtain]"), { y: 0, yPercent: -100 }, { yPercent: 0, duration: 0.76 })
        .fromTo(q("[data-dim]"), { opacity: 0 }, { opacity: 0.72, duration: 0.76 }, "<")
        .fromTo(q("[data-light]"), { scaleX: 1 }, { scaleX: 0.12, duration: 0.76 }, "<")
        .fromTo(q("[data-privacy]"), { scaleX: 0.15 }, { scaleX: 1, duration: 0.76 }, "<")
        .to({}, { duration: 0.12 });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="wrap grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-6 lg:col-start-1">
            <div className="shutter-window">
              <div className="shutter-box" aria-hidden="true" />
              <div className="shutter-opening">
                <div className="shutter-view" aria-hidden="true" />
                <div data-dim className="absolute inset-0 bg-navy-950 opacity-0" aria-hidden="true" />
                <div data-curtain className="shutter-curtain" aria-hidden="true">
                  <span className="shutter-bottom-bar" />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="t-label text-[var(--fg-2)]">{lang === "ar" ? "مرّر لإنزال الشاتر" : "Scroll to lower the shutter"}</p>
            <h2 id="shutter-title" className="t-h1 mt-5 max-w-[14ch]">
              {lang === "ar" ? "الضوء والخصوصية بيدك." : "Light and privacy, in your hands."}
            </h2>
            <dl className="mt-10 space-y-6">
              <div>
                <dt className="t-label text-[var(--fg-2)]">{lang === "ar" ? "الضوء" : "Light"}</dt>
                <dd className="meter mt-3">
                  <span data-light className="meter-fill" />
                </dd>
              </div>
              <div>
                <dt className="t-label text-[var(--fg-2)]">{lang === "ar" ? "الخصوصية" : "Privacy"}</dt>
                <dd className="meter mt-3">
                  <span data-privacy className="meter-fill is-red" />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cross-sections of the three slat types, drawn like a technical sheet. */
export function SlatProfile({ kind }: { kind: "perforated" | "ngs" | "bk" }) {
  const id = `hatch-${kind}`;
  return (
    <svg viewBox="0 0 120 64" className="h-auto w-full" aria-hidden="true">
      <defs>
        <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.45" />
        </pattern>
      </defs>
      {/* hook at the top, profile body, hook at the bottom */}
      <path
        d={
          kind === "bk"
            ? "M14 14 H104 Q110 14 110 20 V40 Q110 46 104 46 H14 Q8 46 8 40 V20 Q8 14 14 14 Z"
            : "M12 10 H106 Q114 10 114 18 V42 Q114 50 106 50 H12 Q4 50 4 42 V18 Q4 10 12 10 Z"
        }
        fill={kind === "ngs" ? `url(#${id})` : "none"}
        stroke="currentColor"
        strokeWidth="1.3"
      />
      {kind !== "bk" && <path d="M10 15 H108 Q109 15 109 17 V43 Q109 45 107 45 H11 Q9 45 9 43 V17 Q9 15 10 15 Z" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.6" />}
      <path d="M30 10 V4 H40 V10 M80 50 V58 H90 V50" fill="none" stroke="currentColor" strokeWidth="1.3" />
      {kind === "perforated" &&
        [18, 32, 46, 60, 74, 88].map((x) => <rect key={x} x={x} y="27" width="8" height="6" fill="currentColor" fillOpacity="0.85" />)}
    </svg>
  );
}

/** Small looping diagrams for the three fly-screen types. */
export function ScreenDiagram({ kind }: { kind: "fixed" | "sliding" | "pleated" }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      const q = gsap.utils.selector(root);
      if (kind === "sliding") {
        gsap.fromTo(q("[data-mesh]"), { xPercent: 0 }, { xPercent: 96, duration: 2.2, ease: "power2.inOut", repeat: -1, yoyo: true, repeatDelay: 0.8 });
      }
      if (kind === "pleated") {
        gsap.fromTo(q("[data-pleats]"), { scaleX: 1 }, { scaleX: 0.08, duration: 2.2, ease: "power2.inOut", repeat: -1, yoyo: true, repeatDelay: 0.8 });
      }
    },
    { scope: root },
  );
  return (
    <div ref={root} className="screen-diagram" aria-hidden="true">
      <div className="screen-view" />
      {kind === "fixed" && <div className="screen-mesh absolute inset-[6%]" />}
      {kind === "sliding" && (
        <>
          <span className="absolute inset-y-[6%] start-[6%] w-[44%] border-[3px] border-[#eef0f3]" />
          <div data-mesh className="screen-mesh absolute inset-y-[6%] start-[6%] w-[44%] border-[3px] border-[#d9dee5]" />
        </>
      )}
      {kind === "pleated" && (
        <div data-pleats className="screen-pleats absolute inset-y-[6%] start-[6%] w-[88%]" style={{ transformOrigin: "left center" }} />
      )}
      <span className="absolute inset-0 shadow-[inset_0_0_0_6px_#eef0f3]" />
    </div>
  );
}
