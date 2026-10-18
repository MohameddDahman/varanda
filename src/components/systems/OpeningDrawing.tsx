"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import type { OpeningKind } from "@/content/systems";
import { ViewScene } from "@/components/systems/ViewScene";
import { cn } from "@/lib/cn";

// The opening symbols are drawn on with DrawSVG; registered here, where it's used.
if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

export type OpeningHandle = { timeline: () => gsap.core.Timeline | null };

type Props = {
  kind: OpeningKind;
  /** "external": a parent scrubs the timeline. "loop": plays by itself while visible. */
  mode?: "external" | "loop";
  className?: string;
  /** Frame colour (uPVC finish). */
  frame?: string;
};

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 0.55 };

/**
 * Opening symbol drawn on a sash, so it moves with the sash as it opens. As on the
 * client's drawings, the triangle's point faces the handle: right for a side-hung sash,
 * top for a tilt sash; tilt & turn shows both, the tilt one dashed.
 */
function SashSymbol({ point }: { point: "right" | "left" | "top" | "both" }) {
  return (
    <svg viewBox="0 0 80 100" preserveAspectRatio="none" className="od-symbol" aria-hidden="true">
      {(point === "right" || point === "both") && <path data-sym d="M0 0 L80 50 L0 100" {...stroke} />}
      {point === "left" && <path data-sym d="M80 0 L0 50 L80 100" {...stroke} />}
      {(point === "top" || point === "both") && (
        <path data-sym d="M0 100 L40 0 L80 100" {...stroke} strokeDasharray={point === "both" ? "2.5 2" : undefined} />
      )}
    </svg>
  );
}

/** The sliding arrow belongs to the whole frame. */
function FrameSymbol({ kind }: { kind: OpeningKind }) {
  if (kind !== "sliding") return null;
  return (
    <svg viewBox="0 0 80 100" preserveAspectRatio="none" className="od-symbol" aria-hidden="true">
      {kind === "sliding" && <path data-sym d="M48 50 H22 M28 44 L22 50 L28 56" {...stroke} strokeWidth={0.8} />}
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
        case "hinged-double":
          t.to(q("[data-swing]"), { rotateY: (i: number) => (i === 0 ? 60 : -60), duration: 2 }, 0.2);
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
      if (sym.length) t.to(sym, { opacity: 0.75, duration: 0.6 }, ">-0.6");
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
              <SashSymbol point={kind === "tilt-turn" ? "both" : "right"} />
              <span className="od-handle" />
            </div>
          )}
          {kind === "hinged-double" && (
            <>
              <div data-swing className="od-sash od-half-left od-origin-left">
                <Glass />
                <SashSymbol point="right" />
                <span className="od-handle" />
              </div>
              <div data-swing className="od-sash od-half-right od-origin-right">
                <Glass />
                <SashSymbol point="left" />
                <span className="od-handle od-handle-start" />
              </div>
            </>
          )}
          {kind === "tilt" && (
            <div data-swing className="od-sash od-origin-bottom">
              <Glass />
              <SashSymbol point="top" />
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
              <SashSymbol point="right" />
              <div data-fold className="od-fold od-fold-next">
                <Glass />
                <SashSymbol point="left" />
                <div data-fold className="od-fold od-fold-next">
                  <Glass />
                  <SashSymbol point="right" />
                  <div data-fold className="od-fold od-fold-next">
                    <Glass />
                    <SashSymbol point="left" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <FrameSymbol kind={kind} />
      </div>
    </div>
  );
});
