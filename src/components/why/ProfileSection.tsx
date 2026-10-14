"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { scroller } from "@/components/transition/store";
import { anatomy } from "@/content/company";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";

/*
 * A 2D technical drawing of a real 70 mm uPVC casement, scrubbed by scroll. It replaces a
 * WebGL scene: plain SVG, only transform / opacity / fill tweens, and nothing runs unless
 * the visitor is scrolling through it, so it stays smooth on low-end phones and quiet on
 * powerful machines.
 *
 * Steps: 1 chambers · 2 steel core · 3 gaskets · 4 glass unit · 5 multi-point locking.
 */

type R = [number, number, number, number]; // x1, y1, x2, y2 in mm, y measured up
const H = 180; // drawing height in mm; SVG y runs down, so y' = H - y
const rect = ([x1, y1, x2, y2]: R) => `M${x1} ${H - y2}H${x2}V${H - y1}H${x1}Z`;
const poly = (pts: [number, number][]) => `M${pts.map(([x, y]) => `${x} ${H - y}`).join("L")}Z`;

const FRAME_OUTLINE = poly([[0, 0], [70, 0], [70, 56], [62, 56], [62, 48], [6, 48], [6, 60], [0, 60]]);
const FRAME_CHAMBERS: R[] = [
  [2.5, 2.5, 11, 22.5],
  [2.5, 24.5, 11, 45.5],
  [13, 2.5, 19, 45.5],
  [21, 2.5, 49, 45.5],
  [51, 2.5, 57, 45.5],
  [59, 2.5, 67.5, 22.5],
  [59, 24.5, 67.5, 45.5],
];
const SASH_OUTLINE = poly([
  [9, 50], [60, 50], [60, 61], [58, 61], [58, 59.5], [56, 59.5], [56, 75.5], [58, 75.5], [58, 74], [60, 74],
  [60, 92], [17, 92], [17, 112], [9, 112],
]);
const SASH_CHAMBERS: R[] = [
  [11.5, 52.5, 20, 70],
  [11.5, 72, 20, 89.5],
  [22, 52.5, 32, 89.5],
  [34, 52.5, 54, 89.5],
  [11.4, 95, 14.6, 108],
];
const BEAD = poly([[43, 92], [56, 92], [56, 103], [47, 108], [43, 108]]) + rect([45.5, 94.5, 53.5, 100.5]);
const channel = ([x1, y1, x2, y2]: R, t = 1.6) =>
  poly([[x1, y1], [x2, y1], [x2, y2], [x2 - t, y2], [x2 - t, y1 + t], [x1 + t, y1 + t], [x1 + t, y2], [x1, y2]]);
const GASKETS: R[] = [
  [17, 104, 18.4, 111],
  [41.6, 99, 43, 106],
  [12, 48, 15.5, 50],
  [52, 48, 55.5, 50],
  [6, 53, 9, 58],
  [60, 50, 62.2, 54],
];
const CAMS = [86, 156, 264, 334];

/** A spur gear outline centred on (cx, cy). */
function gearPath(cx: number, cy: number, r: number, teeth: number, depth: number) {
  const step = (Math.PI * 2) / teeth;
  const at = (a: number, rad: number) => `${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    pts.push(at(a, r - depth), at(a + step * 0.15, r), at(a + step * 0.5, r), at(a + step * 0.65, r - depth));
  }
  return `M${pts.join("L")}Z`;
}

const RED = "#d71920";

// Depth: the profile is extruded backwards as a stack of offset layers (up and to the right),
// shaded darker with distance. Static SVG, so it costs nothing while scrolling.
const DEPTH = 18;
const STEP_X = 0.55;
const STEP_Y = 0.42;
const shade = (k: number) => {
  const t = k / DEPTH; // 0 = just behind the face, 1 = far end
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(198, 92)} ${mix(205, 103)} ${mix(214, 118)})`;
};
const LAYERS = Array.from({ length: DEPTH }, (_, i) => DEPTH - i); // back to front
const PROFILE = [FRAME_OUTLINE + FRAME_CHAMBERS.map(rect).join(""), SASH_OUTLINE + SASH_CHAMBERS.map(rect).join(""), BEAD];

export function ProfileSection() {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [step, setStep] = useState(0);
  const parts = anatomy.parts;
  const STEPS = parts.length + 1; // an opening beat, then one per part

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut", duration: 0.45 } });

      // 1 · Chambers fill red one after another: the air pockets that slow heat and sound.
      tl.to(q("[data-chamber]"), { opacity: 0.9, stagger: 0.035 }, 1)
        .to(q("[data-chamber]"), { opacity: 0, duration: 0.3 }, 1.85)
        // 2 · The steel slides into the main chambers.
        .fromTo(q("[data-steel]"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, fill: RED, stagger: 0.12 }, 2.05)
        .to(q("[data-steel]"), { fill: "#8a95a3", duration: 0.3 }, 2.85)
        // 3 · Gaskets light up and swell slightly.
        .to(q("[data-gasket]"), { fill: RED, scale: 1.25, transformOrigin: "50% 50%", stagger: 0.04 }, 3.05)
        .to(q("[data-gasket]"), { fill: "#2a2f37", scale: 1, duration: 0.3 }, 3.85)
        // 4 · The glass unit opens up to show the spacer and seals between the panes.
        .to(q("[data-pane=out]"), { x: -5 }, 4.05)
        .to(q("[data-pane=in]"), { x: 5 }, 4.05)
        .to(q("[data-igu]"), { fill: RED, stagger: 0.05 }, 4.15)
        .to(q("[data-pane]"), { x: 0, duration: 0.3 }, 4.85)
        .to(q("[data-igu]"), { fill: (i: number, el: Element) => el.getAttribute("data-base") ?? "#8a95a3", duration: 0.3 }, 4.85)
        // 5 · Locking: the section steps aside and the lock edge of the window appears.
        .to(q("[data-section]"), { x: -250, duration: 0.5 }, 5.0)
        .fromTo(q("[data-elevation]"), { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5 }, 5.05)
        .fromTo(q("[data-handle]"), { rotation: 90, transformOrigin: "50% 14px" }, { rotation: 0, transformOrigin: "50% 14px", duration: 0.5 }, 5.35)
        .fromTo(q("[data-pinion]"), { rotation: 90, transformOrigin: "50% 50%" }, { rotation: 0, transformOrigin: "50% 50%", duration: 0.5 }, 5.35)
        .fromTo(q("[data-rack]"), { y: 0 }, { y: -40, duration: 0.5 }, 5.35)
        .fromTo(q("[data-rod]"), { y: 0 }, { y: 18, duration: 0.5 }, 5.35)
        .fromTo(q("[data-icam]"), { y: -60 }, { y: 0, duration: 0.5 }, 5.35)
        .to(q("[data-keeper]"), { fill: RED, duration: 0.2 }, 5.75)
        .to(q("[data-sec-lock]"), { fill: RED, opacity: 1, duration: 0.3 }, 5.75)
        .to({}, { duration: 0.25 });
      tlRef.current = tl;

      const toStep = (time: number) => Math.min(parts.length, Math.max(0, Math.floor(time)));

      if (reducedMotion()) {
        tl.seek(0);
        return;
      }
      // Scrubbed by scroll; nothing animates while the visitor isn't scrolling.
      stRef.current = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: `+=${STEPS * 90}%`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.6,
        animation: tl,
        onUpdate: (self) => setStep(toStep(self.progress * tl.duration())),
      });
    },
    { scope: root },
  );

  // Jump to a part: scroll to it when pinned, or seek the drawing when motion is reduced.
  const go = (i: number) => {
    const tl = tlRef.current;
    const st = stRef.current;
    const time = i + 0.9;
    if (st && tl) {
      const y = st.start + (st.end - st.start) * (time / tl.duration());
      if (scroller.lenis) scroller.lenis.scrollTo(y, { duration: 1.1 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    } else if (tl) {
      tl.seek(time);
      setStep(i);
    }
  };

  return (
    <section ref={root} className="anatomy theme-deep" data-header="dark" aria-labelledby="anatomy-title">
      <div className="anatomy-inner wrap">
        <div className="anatomy-copy">
          <Eyebrow>{lang === "ar" ? "مقطع في القطاع" : "Section view"}</Eyebrow>
          <h2 id="anatomy-title" className="t-h1 mt-6 max-w-[12ch]">
            {t(anatomy.title)}
            <span className="dot">.</span>
          </h2>
          <p className="t-body mt-5 max-w-[40ch] text-mist">{t(anatomy.intro)}</p>
          {/* Phones show a progress bar and only the current part, so it all fits on screen. */}
          <div className="anatomy-progress" aria-hidden="true">
            {parts.map((p, i) => (
              <span key={p.id} className={cn(step > i && "is-on")} />
            ))}
          </div>
          <ol className="mt-10 border-t border-[var(--line)]">
            {parts.map((p, i) => (
              <li key={p.id} className={cn("border-b border-[var(--line)]", step === i + 1 && "is-current")}>
                <button
                  type="button"
                  aria-pressed={step === i + 1}
                  onClick={() => go(i + 1)}
                  className={cn("anatomy-part", step === i + 1 && "is-active")}
                >
                  <span className="t-label text-red-bright" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="t-h3 block">{t(p.title)}</span>
                    <span className="anatomy-part-text t-small text-mist">
                      <span className="min-h-0">{t(p.text)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="anatomy-stage">
          <svg viewBox="0 0 800 600" className="profile-svg" style={{ direction: "ltr" }} aria-hidden="true">
            {/* ── Cross-section of the frame, sash and glass ── */}
            <g data-section>
              <g transform="translate(270 34) scale(3)">
                {/* Back end of the glass and the extruded body */}
                <rect x={18.4 + DEPTH * STEP_X} y={H - 172 - DEPTH * STEP_Y} width="4.2" height="78" className="ps-glass" />
                <rect x={37.4 + DEPTH * STEP_X} y={H - 172 - DEPTH * STEP_Y} width="4.2" height="78" className="ps-glass" />
                {LAYERS.map((k) => (
                  <g key={k} transform={`translate(${k * STEP_X} ${-k * STEP_Y})`} fill={shade(k)}>
                    {PROFILE.map((d, i) => (
                      <path key={i} d={d} fillRule="evenodd" />
                    ))}
                  </g>
                ))}
                {/* Glass unit (drawn first: the profile overlaps its edge) */}
                <rect data-pane="out" x="18.4" y={H - 172} width="4.2" height="78" className="ps-glass" />
                <rect data-pane="in" x="37.4" y={H - 172} width="4.2" height="78" className="ps-glass" />
                <path data-igu data-base="#a7b0ba" d={rect([23.4, 95, 36.6, 101])} fill="#a7b0ba" />
                <path data-igu data-base="#d8cdb4" d={rect([24.6, 96.2, 35.4, 99.8])} fill="#d8cdb4" />
                <path data-igu data-base="#26292e" d={rect([22.6, 93.4, 37.4, 95])} fill="#26292e" />
                <path data-igu data-base="#3b4250" d={rect([18, 92, 42, 93.4])} fill="#3b4250" />

                {/* Frame and sash: holes are the insulating chambers */}
                <path d={FRAME_OUTLINE + FRAME_CHAMBERS.map(rect).join("")} fillRule="evenodd" className="ps-upvc" />
                <path d={SASH_OUTLINE + SASH_CHAMBERS.map(rect).join("")} fillRule="evenodd" className="ps-upvc" />
                <path d={BEAD} fillRule="evenodd" className="ps-upvc" />
                <circle cx="49.5" cy={H - 103.2} r="1.1" className="ps-hole" />
                {[...FRAME_CHAMBERS, ...SASH_CHAMBERS.slice(0, 4)].map((r, i) => (
                  <path key={i} data-chamber d={rect(r)} fill={RED} opacity="0" />
                ))}

                {/* Steel reinforcement */}
                <path data-steel d={channel([22.6, 4.1, 47.4, 43.9])} fill="#8a95a3" opacity="0" />
                <path data-steel d={channel([35.4, 54, 52.6, 88])} fill="#8a95a3" opacity="0" />

                {/* Gaskets */}
                {GASKETS.map((g, i) => (
                  <path key={i} data-gasket d={rect(g)} fill="#2a2f37" />
                ))}

                {/* Lock hardware: espagnolette rod in the groove, cam and frame keeper */}
                <path data-sec-lock d={rect([56.4, 60.4, 57.8, 74.6])} fill="#9aa4b1" />
                <path data-sec-lock d={rect([62.8, 56, 64.4, 70])} fill="#7f8894" opacity="0.6" />
                <circle data-sec-lock cx="61.2" cy={H - 67.5} r="1.6" fill="#7f8894" opacity="0" />

                {/* Width dimension */}
                <g className="ps-dim">
                  <path d={`M0 ${H + 6}H70M0 ${H + 3}V${H + 9}M70 ${H + 3}V${H + 9}`} />
                </g>
              </g>
              <text x="375" y="594" textAnchor="middle" className="ps-dim-text">
                70 mm
              </text>
            </g>

            {/* ── Lock edge of the window, shown in step 5 ── */}
            <g data-elevation opacity="0">
              <g transform="translate(300 60) scale(0.95)">
                <rect x="40" y="20" width="270" height="380" rx="2" fill="#16243a" stroke="#3a4a60" />
                {CAMS.map((y) => (
                  <rect key={y} data-keeper x="290" y={y + 4} width="12" height="24" rx="1.5" fill="#7f8894" />
                ))}
                <rect x="60" y="40" width="232" height="340" fill="#eef1f4" stroke="#9aa4b1" strokeWidth="2" />
                <rect x="78" y="58" width="186" height="304" fill="#b9cad9" opacity="0.55" />
                <rect x="276" y="46" width="10" height="328" fill="#cdd4dc" />
                <g data-rod>
                  <rect x="278" y="50" width="6" height="320" fill="#9aa4b1" />
                  {CAMS.map((y) => (
                    <rect key={y} x="282" y={y - 6} width="14" height="12" rx="4" fill="#4d5562" />
                  ))}
                </g>
                <g data-handle>
                  <rect x="252" y="196" width="20" height="30" rx="5" fill="#ffffff" stroke="#9aa4b1" />
                  <rect x="258" y="205" width="8" height="64" rx="4" fill="#ffffff" stroke="#9aa4b1" />
                </g>
              </g>
              {/* Close-ups: the gearbox and one locking point */}
              <g>
                <circle cx="700" cy="170" r="76" fill="#0b1626" stroke="#3a4a60" />
                <clipPath id="ps-gear">
                  <circle cx="700" cy="170" r="75" />
                </clipPath>
                <g clipPath="url(#ps-gear)">
                  <g data-rack>
                    <rect x="645" y="40" width="20" height="320" fill="#5c6878" />
                    {Array.from({ length: 22 }, (_, i) => (
                      <rect key={i} x="665" y={42 + i * 14} width="6" height="7" fill="#5c6878" />
                    ))}
                  </g>
                  <path data-pinion d={gearPath(700, 170, 30, 12, 6)} fill="#9aa4b1" />
                  <circle cx="700" cy="170" r="8" fill="#0b1626" stroke="#9aa4b1" />
                </g>
                <text x="700" y="268" textAnchor="middle" className="ps-caption">
                  {lang === "ar" ? "علبة التروس" : "Gearbox"}
                </text>

                <circle cx="700" cy="420" r="76" fill="#0b1626" stroke="#3a4a60" />
                <clipPath id="ps-pin">
                  <circle cx="700" cy="420" r="75" />
                </clipPath>
                <g clipPath="url(#ps-pin)">
                  <g data-icam>
                    <rect x="693" y="250" width="14" height="190" fill="#9aa4b1" />
                    <circle cx="700" cy="432" r="11" fill="#cdd4dc" />
                  </g>
                  <path data-keeper fillRule="evenodd" d="M662 392 H738 V500 H662 Z M689 392 V442 A11 11 0 0 0 711 442 V392 Z" fill="#7f8894" />
                </g>
                <text x="700" y="518" textAnchor="middle" className="ps-caption">
                  {lang === "ar" ? "نقطة الغلق" : "Locking point"}
                </text>
              </g>
            </g>
          </svg>
          <p className="anatomy-hint t-label text-mist" aria-hidden="true">
            {lang === "ar" ? "مقطع توضيحي" : "Illustrative section"}
          </p>
        </div>
      </div>
    </section>
  );
}
