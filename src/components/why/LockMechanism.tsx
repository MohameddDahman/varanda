"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { ViewScene } from "@/components/systems/ViewScene";
import type { L } from "@/i18n/config";
import { cn } from "@/lib/cn";

type Mode = "locked" | "turn" | "tilt";

/** Handle angle (0 = pointing down) and locking-rod position (1 = down, locked). */
const POSE: Record<Mode, { angle: number; rod: number }> = {
  locked: { angle: 0, rod: 1 },
  turn: { angle: 90, rod: 0 },
  tilt: { angle: 180, rod: -1 },
};

/** Open swings the sash on its side hinges; tilt leans it in on its bottom ones (degrees). */
const SWING = -30;
const LEAN = -13;
/** The rod's travel either way, as a percentage of its length (4cqw of 117.54cqw). */
const ROD_TRAVEL = 3.4;
/** Locking cams along the rod, as fractions of its length. Their keepers sit on the frame. */
const CAMS = [0.08, 0.32, 0.68, 0.92];

const MODES: { id: Mode; label: L; text: L }[] = [
  {
    id: "locked",
    label: { en: "Locked", ar: "مغلق" },
    text: {
      en: "Handle down: the gearbox drives the rod down and four locking pins hook into the keepers on the frame.",
      ar: "المقبض لأسفل: علبة التروس تدفع الذراع لأسفل فتدخل أربع نقاط غلق في المقابلات المثبتة على الإطار.",
    },
  },
  {
    id: "turn",
    label: { en: "Open", ar: "فتح" },
    text: {
      en: "Handle across: the pins slide out of the keepers and the whole sash swings into the room on its side hinges, like a door.",
      ar: "المقبض أفقي: تخرج نقاط الغلق من المقابلات وتُفتح الضلفة بالكامل للداخل على مفصلاتها الجانبية مثل الباب.",
    },
  },
  {
    id: "tilt",
    label: { en: "Tilt", ar: "قلاب" },
    text: {
      en: "Handle up: the sash leans in from the top on its bottom hinges, held by a stay arm, for secure ventilation.",
      ar: "المقبض لأعلى: تميل الضلفة للداخل من أعلى على مفصلاتها السفلية ويثبتها ذراع، لتهوية آمنة.",
    },
  },
];

/** A spur gear outline centred on (cx, cy). */
function gearPath(cx: number, cy: number, r: number, teeth: number, depth: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const at = (ang: number, rad: number) => `${(cx + Math.cos(ang) * rad).toFixed(1)} ${(cy + Math.sin(ang) * rad).toFixed(1)}`;
    pts.push(at(a, r - depth), at(a + step * 0.15, r), at(a + step * 0.5, r), at(a + step * 0.65, r - depth));
  }
  return `M${pts.join(" L")} Z`;
}

/**
 * How a tilt & turn window works. The window is a small CSS 3D model seen from above and to
 * the right: a frame with depth and a sash with thickness that swings on its side hinges
 * (open) or leans in on its bottom ones (tilt), closing in between, with its pivot line and
 * the path of its corner drawn in. Close-ups show the gearbox and a locking point. Only
 * transforms and opacity animate, and it plays itself while on screen until the visitor
 * picks a position.
 */
export function LockMechanism({ className }: { className?: string }) {
  const { lang, t } = useLang();
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [mode, setMode] = useState<Mode>("locked");
  const [touched, setTouched] = useState(false);
  const [inView, setInView] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const [turn] = q("[data-sash-turn]");
      const [tilt] = q("[data-sash-tilt]");
      const { angle, rod } = POSE[mode];
      const quick = reducedMotion();
      const d = quick ? 0 : 0.85;
      const ease = "power3.inOut";
      tlRef.current?.kill();
      const tl = gsap.timeline();
      tlRef.current = tl;

      // 1 · A tilt & turn sash closes before its handle moves.
      const open = Number(gsap.getProperty(turn, "rotationY")) !== 0 || Number(gsap.getProperty(tilt, "rotationX")) !== 0;
      const close = open && !quick ? 0.75 : 0;
      tl.to(turn, { rotationY: 0, duration: close, ease: "power2.inOut" }, 0)
        .to(tilt, { rotationX: 0, duration: close, ease: "power2.inOut" }, 0)
        .to(q("[data-stay]"), { scaleY: 0, duration: close, ease: "power2.inOut" }, 0)
        .to(q("[data-dim]"), { opacity: 0, duration: close }, 0)
        .to(q("[data-axis]"), { opacity: 0, duration: quick ? 0 : 0.3 }, 0);

      // 2 · The handle turns the gearbox, which slides the rod and its locking cams.
      const locked = mode === "locked";
      tl.addLabel("mech", close)
        .to(q("[data-handle]"), { rotation: angle, duration: d, ease }, "mech")
        .to(q("[data-pinion]"), { rotation: angle, transformOrigin: "50% 50%", duration: d, ease }, "mech")
        .to(q("[data-rack]"), { y: rod * 43, duration: d, ease }, "mech")
        .to(q("[data-rod]"), { yPercent: rod * ROD_TRAVEL, duration: d, ease }, "mech")
        // The close-up magnifies the travel into the keeper; upward travel is shown shorter so the pin stays in view.
        .to(q("[data-icam]"), { y: rod >= 0 ? rod * 65 : rod * 14, duration: d, ease }, "mech")
        .to(q("[data-keeper]"), { fill: locked ? "#d71920" : "#7f8894", duration: d * 0.4 }, locked ? `mech+=${d * 0.6}` : "mech")
        .to(q("[data-keeper-3d]"), { backgroundColor: locked ? "#d71920" : "#8a939f", duration: d * 0.4 }, locked ? `mech+=${d * 0.6}` : "mech")
        .to(q("[data-leader]"), { opacity: locked ? 1 : 0, duration: d * 0.5 }, "mech");

      // 3 · Open swings the sash like a door; tilt leans its top into the room.
      if (!locked) {
        const at = `mech+=${d * 0.7}`;
        const move = quick ? 0 : 1.2;
        if (mode === "turn") tl.to(turn, { rotationY: SWING, duration: move, ease: "power2.inOut" }, at);
        else tl.to(tilt, { rotationX: LEAN, duration: move, ease: "power2.inOut" }, at).to(q("[data-stay]"), { scaleY: 1, duration: move, ease: "power2.inOut" }, at);
        tl.to(q("[data-dim]"), { opacity: 1, duration: move }, at).to(q(`[data-axis="${mode}"]`), { opacity: 1, duration: quick ? 0 : 0.45 }, `${at}+=${move * 0.35}`);
      }
    },
    { dependencies: [mode], scope: root },
  );

  // Play through the positions while on screen, until the visitor picks one.
  useGSAP(
    () => {
      ScrollTrigger.create({ trigger: root.current, start: "top 85%", end: "bottom 15%", onToggle: (self) => setInView(self.isActive) });
    },
    { scope: root },
  );
  useEffect(() => {
    if (!inView || touched || reducedMotion()) return;
    const order: Mode[] = ["locked", "turn", "locked", "tilt"];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setMode(order[i]);
    }, 3800);
    return () => window.clearInterval(id);
  }, [inView, touched]);

  const choose = (m: Mode) => {
    setTouched(true);
    setMode(m);
  };
  const current = MODES.find((m) => m.id === mode)!;

  return (
    <div ref={root} className={cn("lock-mech", className)}>
      <div className="lock-stage" style={{ direction: "ltr" }} aria-hidden="true">
        {/* ── The window, in 3D ── */}
        <div className="lw">
          <div className="lw-persp">
            <div className="lw-model">
              {/* The opening: the view outside, boxed in by the frame's depth */}
              <div className="lw-view">
                <ViewScene />
              </div>
              <span className="lw-plane lw-reveal-l" />
              <span className="lw-plane lw-reveal-b" />

              {/* The frame: its outer top and side, then its face (each side shaded, so the
                  welded mitres show) */}
              <span className="lw-plane lw-frame-t" />
              <span className="lw-plane lw-frame-r" />
              <span className="lw-frame" />
              <span className="lw-keepers">
                {CAMS.map((f) => (
                  <span key={f} data-keeper-3d className="lw-keeper" style={{ top: `${f * 100}%` }} />
                ))}
              </span>
              <span className="lw-hinge lw-hinge-t" />
              <span className="lw-hinge lw-hinge-b" />

              <div className="lw-sash-z">
                <div data-sash-turn className="lw-sash lw-turn">
                  <div data-sash-tilt className="lw-sash lw-tilt">
                    <span className="lw-plane lw-edge-t" />
                    <span className="lw-plane lw-edge-r" />
                    <span className="lw-plane lw-stay">
                      <span data-stay className="lw-stay-arm" />
                    </span>
                    <span className="lw-glass" />
                    <span className="lw-plane lw-bead-l" />
                    <span className="lw-plane lw-bead-b" />
                    <span className="lw-ring" />
                    <span data-dim className="lw-dim" />
                    {/* Cut-away: the espagnolette rod inside the sash edge, with its locking cams */}
                    <span className="lw-channel">
                      <span data-rod className="lw-rod">
                        {CAMS.map((f) => (
                          <span key={f} className="lw-cam" style={{ top: `${f * 100}%` }} />
                        ))}
                      </span>
                    </span>
                    <span className="lw-handle">
                      <span className="lw-rose" />
                      <span className="lw-lever-z">
                        <span data-handle className="lw-lever" />
                      </span>
                    </span>
                  </div>
                </div>

                {/* Where each movement pivots, and the path the sash's top corner takes */}
                <span data-axis="turn" className="lw-axis lw-axis-turn" />
                <span data-axis="tilt" className="lw-axis lw-axis-tilt" />
                <svg data-axis="turn" viewBox="0 0 26 52" className="lw-arc lw-arc-turn">
                  <path d="M24.8 0 A88.8 88.8 0 0 1 12.9 44.4" markerEnd={`url(#${uid}-arrow)`} />
                </svg>
                <svg data-axis="tilt" viewBox="0 0 32 12" className="lw-arc lw-arc-tilt">
                  <path d="M32 2 A129.54 129.54 0 0 0 2.86 5.32" markerEnd={`url(#${uid}-arrow)`} />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Close-ups ── */}
        <svg viewBox="0 0 600 420" className="lock-closeups">
          <defs>
            <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 Z" fill="#d71920" />
            </marker>
            <clipPath id={`${uid}-gear`}>
              <circle cx="430" cy="118" r="88" />
            </clipPath>
            <clipPath id={`${uid}-pin`}>
              <circle cx="480" cy="306" r="88" />
            </clipPath>
          </defs>
          {/* From the handle and a keeper (where the 3D window projects them) to their close-ups */}
          <g data-leader>
            <path d="M264 205 C302 205 318 172 338 159" fill="none" stroke="#7f8894" strokeDasharray="3 4" />
            <path d="M276 266 C326 266 374 290 412 293" fill="none" stroke="#7f8894" strokeDasharray="3 4" />
          </g>

          {/* The gearbox turns the handle's rotation into rod travel */}
          <g transform="translate(-16 -6)">
            <circle cx="430" cy="118" r="90" fill="#ffffff" stroke="#aab4c0" />
            <g clipPath={`url(#${uid}-gear)`}>
              <g data-rack>
                <rect x="372" y="-80" width="22" height="400" fill="#b9c2cd" />
                {Array.from({ length: 26 }, (_, i) => (
                  <rect key={i} x="394" y={-78 + i * 15.4} width="7" height="8" fill="#b9c2cd" />
                ))}
              </g>
              <path data-pinion d={gearPath(430, 118, 34, 12, 7)} fill="#7f8894" />
              <circle cx="430" cy="118" r="9" fill="#eef0f3" stroke="#4d5562" />
            </g>
            <text x="430" y="228" textAnchor="middle" className="lock-mech-caption">
              {lang === "ar" ? "علبة التروس" : "Gearbox"}
            </text>
          </g>

          {/* A locking pin dropping into its keeper */}
          <g transform="translate(20 4)">
            <circle cx="480" cy="306" r="90" fill="#ffffff" stroke="#aab4c0" />
            <g clipPath={`url(#${uid}-pin)`}>
              <g data-icam>
                <rect x="472" y="140" width="16" height="200" fill="#9aa4b1" />
                <circle cx="480" cy="244" r="12" fill="#4d5562" />
              </g>
              <path data-keeper fillRule="evenodd" d="M440 262 H520 V400 H440 Z M468 262 V330 A12 12 0 0 0 492 330 V262 Z" fill="#7f8894" />
            </g>
            <text x="480" y="414" textAnchor="middle" className="lock-mech-caption">
              {lang === "ar" ? "نقطة الغلق" : "Locking point"}
            </text>
          </g>
        </svg>
      </div>

      <div className="lock-mech-controls">
        <div className="flex flex-wrap gap-2" role="group" aria-label={lang === "ar" ? "وضع المقبض" : "Handle position"}>
          {MODES.map((m) => (
            <button key={m.id} type="button" className={cn("chip", mode === m.id && "is-active")} aria-pressed={mode === m.id} onClick={() => choose(m.id)}>
              {t(m.label)}
            </button>
          ))}
        </div>
        <p className="t-small mt-4 text-ink-2" aria-live="polite">
          {t(current.text)}
        </p>
      </div>
    </div>
  );
}
