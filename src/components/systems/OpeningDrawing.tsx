"use client";

import { forwardRef, useId, useImperativeHandle, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import type { OpeningKind } from "@/content/systems";
import { cn } from "@/lib/cn";

export type OpeningHandle = { timeline: () => gsap.core.Timeline | null };

type Props = {
  kind: OpeningKind;
  /** "external": a parent scrubs the timeline. "loop": plays by itself while visible. */
  mode?: "external" | "loop";
  className?: string;
  /** Frame colour (uPVC finish). */
  frame?: string;
};

/** A calm, stylised view behind the glass: sky, skyline, river. */
function ViewScene() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c3cfdc" />
          <stop offset="0.55" stopColor="#e6e3dc" />
          <stop offset="1" stopColor="#efe5d5" />
        </linearGradient>
        <linearGradient id={`${id}river`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9eb0c1" />
          <stop offset="1" stopColor="#6a8096" />
        </linearGradient>
        <radialGradient id={`${id}sun`} cx="0.7" cy="0.52" r="0.38">
          <stop offset="0" stopColor="#fff5e4" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff5e4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${id}sky)`} />
      <rect width="400" height="500" fill={`url(#${id}sun)`} />
      <g fill="#8b9aac" opacity="0.72">
        <rect x="8" y="232" width="26" height="78" />
        <rect x="38" y="214" width="18" height="96" />
        <rect x="60" y="246" width="34" height="64" />
        <rect x="98" y="190" width="16" height="120" />
        <rect x="118" y="228" width="40" height="82" />
        <rect x="190" y="206" width="22" height="104" />
        <rect x="216" y="240" width="46" height="70" />
        <rect x="270" y="176" width="14" height="134" />
        <rect x="288" y="224" width="36" height="86" />
        <rect x="330" y="198" width="22" height="112" />
        <rect x="356" y="236" width="40" height="74" />
      </g>
      <rect y="306" width="400" height="194" fill={`url(#${id}river)`} />
      <g stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5">
        <line x1="40" y1="352" x2="120" y2="352" />
        <line x1="220" y1="378" x2="330" y2="378" />
        <line x1="90" y1="420" x2="200" y2="420" />
        <line x1="260" y1="452" x2="370" y2="452" />
      </g>
    </svg>
  );
}

/** Opening symbols as drawn on architectural elevations (apex = hinge side). */
function Symbol({ kind }: { kind: OpeningKind }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 0.55 };
  return (
    <svg viewBox="0 0 80 100" preserveAspectRatio="none" className="od-symbol" aria-hidden="true">
      {(kind === "hinged" || kind === "tilt-turn") && <path data-sym d="M80 0 L0 50 L80 100" {...s} />}
      {(kind === "tilt" || kind === "tilt-turn") && (
        <path data-sym d="M0 0 L40 100 L80 0" {...s} strokeDasharray={kind === "tilt-turn" ? "2.5 2" : undefined} />
      )}
      {kind === "sliding" && <path data-sym d="M48 50 H22 M28 44 L22 50 L28 56" {...s} strokeWidth={0.8} />}
      {kind === "folding" && <path data-sym d="M6 66 L23 34 L40 66 L57 34 L74 66" {...s} />}
    </svg>
  );
}

const Glass = () => <span className="od-glass" />;

/**
 * Elevation of a window that shows how it opens — sliding, hinged, tilt &
 * turn, fixed, tilt or folding — built in CSS 3D so sashes swing in perspective.
 */
export const OpeningDrawing = forwardRef<OpeningHandle, Props>(function OpeningDrawing(
  { kind, mode = "external", className, frame },
  ref,
) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useImperativeHandle(ref, () => ({ timeline: () => tl.current }));

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const t = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
      const sym = q("[data-sym]");
      if (sym.length) t.fromTo(sym, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, ease: "power1.inOut" }, 0);

      switch (kind) {
        case "sliding":
          t.to(q("[data-front]"), { xPercent: -86, duration: 2 }, 0.2);
          break;
        // Sashes swing away from the viewer so the open sash reads as a clean
        // trapezoid inside its frame (toward the viewer it balloons past it).
        case "hinged":
          t.to(q("[data-swing]"), { rotateY: 60, duration: 2 }, 0.2);
          break;
        case "tilt-turn": {
          // Tilt pivots on the bottom rail, turn on the hinge side: swap the
          // origin while the sash is square so the change is invisible.
          const sash = q("[data-swing]");
          t.set(sash, { transformOrigin: "50% 100%" }, 0)
            .to(sash, { rotateX: 15, duration: 0.9 }, 0.2)
            .to(sash, { rotateX: 0, duration: 0.5 })
            .set(sash, { transformOrigin: "0% 50%" })
            .to(sash, { rotateY: 56, duration: 1.1 });
          break;
        }
        case "fixed":
          t.fromTo(q("[data-sweep]"), { xPercent: -160 }, { xPercent: 260, duration: 2, ease: "power1.inOut" }, 0.2).fromTo(
            q("[data-view]"),
            { scale: 1.08 },
            { scale: 1, duration: 2.2, ease: "power1.out" },
            0,
          );
          break;
        case "tilt":
          t.to(q("[data-swing]"), { rotateX: 17, duration: 2 }, 0.2);
          break;
        case "folding":
          t.to(q("[data-fold]"), { rotateY: (i: number) => (i === 0 ? 70 : i % 2 ? -140 : 140), duration: 2 }, 0.2);
          break;
      }
      if (sym.length) t.to(sym, { opacity: 0.3, duration: 0.6 }, ">-0.6");
      tl.current = t;

      if (reducedMotion()) {
        t.progress(0.6);
        return;
      }
      if (mode === "loop") {
        t.repeat(-1).yoyo(true).repeatDelay(1.1);
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 92%",
          end: "bottom 8%",
          onToggle: (self) => (self.isActive ? t.play() : t.pause()),
        });
      }
    },
    { scope: root, dependencies: [kind, mode] },
  );

  return (
    <div
      ref={root}
      className={cn("od", className)}
      style={frame ? ({ "--od-frame": frame } as React.CSSProperties) : undefined}
      aria-hidden="true"
    >
      <div data-view className="od-view">
        <ViewScene />
      </div>
      <div className="od-frame">
        <div className="od-stage">
          {kind === "sliding" && (
            <>
              <div className="od-sash od-slide-back">
                <Glass />
                <span className="od-handle" />
              </div>
              <div data-front className="od-sash od-slide-front">
                <Glass />
                <span className="od-handle od-handle-start" />
              </div>
            </>
          )}
          {(kind === "hinged" || kind === "tilt-turn") && (
            <div data-swing className="od-sash od-origin-left">
              <Glass />
              <span className="od-handle" />
            </div>
          )}
          {kind === "tilt" && (
            <div data-swing className="od-sash od-origin-bottom">
              <Glass />
              <span className="od-handle od-handle-top" />
            </div>
          )}
          {kind === "fixed" && (
            <div className="od-sash od-fixed">
              <Glass />
              <span data-sweep className="od-sweep" />
            </div>
          )}
          {kind === "folding" && (
            <div data-fold className="od-fold">
              <Glass />
              <div data-fold className="od-fold od-fold-next">
                <Glass />
                <div data-fold className="od-fold od-fold-next">
                  <Glass />
                  <div data-fold className="od-fold od-fold-next">
                    <Glass />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Symbol kind={kind} />
      </div>
    </div>
  );
});
