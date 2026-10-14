"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import type { L } from "@/i18n/config";
import { cn } from "@/lib/cn";

type Mode = "locked" | "turn" | "tilt";

/** Handle angle (0 = pointing down) and how far the locking rod travels (px, + = down). */
const POSE: Record<Mode, { angle: number; rod: number }> = {
  locked: { angle: 0, rod: 18 },
  turn: { angle: 90, rod: 0 },
  tilt: { angle: 180, rod: -18 },
};

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
      en: "Handle across: the pins slide out of the keepers and the sash swings open on its side hinges.",
      ar: "المقبض أفقي: تخرج نقاط الغلق من المقابلات وتُفتح الضلفة على مفصلاتها الجانبية.",
    },
  },
  {
    id: "tilt",
    label: { en: "Tilt", ar: "قلاب" },
    text: {
      en: "Handle up: the rod moves further and the sash tilts in at the top for safe ventilation.",
      ar: "المقبض لأعلى: يتحرك الذراع أكثر فتميل الضلفة من أعلى لتهوية آمنة.",
    },
  },
];

const CAMS = [86, 156, 264, 334];

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
 * How a multi-point lock works: turn the handle and watch the gearbox move the rod,
 * the pins enter the keepers and the sash open or tilt. Plays itself until the
 * visitor takes over.
 */
export function LockMechanism({ className }: { className?: string }) {
  const { lang, t } = useLang();
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("locked");
  const [touched, setTouched] = useState(false);
  const [inView, setInView] = useState(false);

  // Animate to the chosen handle position.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const { angle, rod } = POSE[mode];
      const d = reducedMotion() ? 0 : 0.9;
      const ease = "power3.inOut";
      gsap.to(q("[data-handle]"), { rotation: angle, svgOrigin: "262 210", duration: d, ease });
      gsap.to(q("[data-pinion]"), { rotation: angle, svgOrigin: "430 118", duration: d, ease });
      gsap.to(q("[data-rack]"), { y: rod * 2.4, duration: d, ease });
      gsap.to(q("[data-rod]"), { y: rod, duration: d, ease });
      // The close-up magnifies the travel into the keeper; upward travel is shown shorter so the pin stays in view.
      gsap.to(q("[data-icam]"), { y: rod >= 0 ? rod * 3.6 : rod * 0.8, duration: d, ease });
      gsap.to(q("[data-keeper]"), { fill: mode === "locked" ? "#d71920" : "#7f8894", duration: d * 0.5, delay: mode === "locked" ? d * 0.6 : 0 });
      // Turn swings the sash on its side hinges, tilt leans it in from the top: two nested
      // groups, each with its own fixed pivot, so switching between them never jumps.
      const late = mode === "locked" ? 0 : d * 0.5;
      gsap.to(q("[data-sash-turn]"), { scaleX: mode === "turn" ? 0.84 : 1, svgOrigin: "60 210", duration: d, delay: late, ease });
      gsap.to(q("[data-sash-tilt]"), { scaleY: mode === "tilt" ? 0.93 : 1, svgOrigin: "176 380", duration: d, delay: late, ease });
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
    }, 2600);
    return () => window.clearInterval(id);
  }, [inView, touched]);

  const choose = (m: Mode) => {
    setTouched(true);
    setMode(m);
  };
  const current = MODES.find((m) => m.id === mode)!;

  return (
    <div ref={root} className={cn("lock-mech", className)}>
      <svg viewBox="0 0 600 420" className="lock-mech-svg" style={{ direction: "ltr" }} aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#dfe9f2" />
            <stop offset="1" stopColor="#b9cad9" />
          </linearGradient>
          <clipPath id={`${uid}-gear`}>
            <circle cx="430" cy="118" r="88" />
          </clipPath>
          <clipPath id={`${uid}-pin`}>
            <circle cx="480" cy="306" r="88" />
          </clipPath>
        </defs>

        {/* Window elevation */}
        <rect x="40" y="20" width="270" height="380" rx="2" fill="#dfe5ec" stroke="#aab4c0" />
        {CAMS.map((y) => (
          <rect key={y} data-keeper x="290" y={y + 4} width="12" height="24" rx="1.5" fill="#7f8894" />
        ))}
        <g data-sash-turn>
        <g data-sash-tilt>
          <rect x="60" y="40" width="232" height="340" fill="#f6f7f8" stroke="#b9c2cd" strokeWidth="2" />
          <rect x="78" y="58" width="186" height="304" fill={`url(#${uid}-glass)`} />
          <rect x="276" y="46" width="10" height="328" fill="#cdd4dc" />
          <g data-rod>
            <rect x="278" y="50" width="6" height="320" fill="#9aa4b1" />
            {CAMS.map((y) => (
              <rect key={y} x="282" y={y - 6} width="14" height="12" rx="4" fill="#4d5562" />
            ))}
          </g>
          <g data-handle>
            <rect x="252" y="196" width="20" height="30" rx="5" fill="#eef0f3" stroke="#aab4c0" />
            <rect x="258" y="205" width="8" height="64" rx="4" fill="#ffffff" stroke="#9aa4b1" />
          </g>
        </g>
        </g>

        {/* Leader lines to the two close-ups */}
        <path d="M272 210 C330 210 330 140 342 128" fill="none" stroke="#7f8894" strokeDasharray="3 4" />
        <path d="M302 280 C340 280 360 300 392 304" fill="none" stroke="#7f8894" strokeDasharray="3 4" />

        {/* Close-up 1: the gearbox turns the handle's rotation into rod travel */}
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

        {/* Close-up 2: a locking pin dropping into its keeper */}
        <circle cx="480" cy="306" r="90" fill="#ffffff" stroke="#aab4c0" />
        <g clipPath={`url(#${uid}-pin)`}>
          <g data-icam>
            <rect x="472" y="140" width="16" height="200" fill="#9aa4b1" />
            <circle cx="480" cy="244" r="12" fill="#4d5562" />
          </g>
          <path
            data-keeper
            fillRule="evenodd"
            d="M440 262 H520 V400 H440 Z M468 262 V330 A12 12 0 0 0 492 330 V262 Z"
            fill="#7f8894"
          />
        </g>

        <text x="430" y="226" textAnchor="middle" className="lock-mech-caption">
          {lang === "ar" ? "علبة التروس" : "Gearbox"}
        </text>
        <text x="480" y="414" textAnchor="middle" className="lock-mech-caption">
          {lang === "ar" ? "نقطة الغلق" : "Locking point"}
        </text>
      </svg>

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
