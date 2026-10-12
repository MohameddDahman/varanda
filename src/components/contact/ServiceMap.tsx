"use client";

import { useId, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { serviceAreas } from "@/content/site";
import { cn } from "@/lib/cn";

// Equirectangular projection of a box around Greater Cairo (30.84–31.56°E, 29.84–30.16°N).
// Both axes use the same km scale, so the drawing is to scale and can carry a scale bar.
const W = 1000;
const H = 512;
const project = (lat: number, lon: number) => ({ x: (lon - 30.84) * (W / 0.72), y: (30.16 - lat) * (H / 0.32) });
const KM = W / 0.72 / 96.4; // map units per kilometre at 30°N

const CAIRO = project(30.044, 31.236);
const PYRAMIDS = project(29.979, 31.134);
// The Nile through Cairo, traced from the south edge of the box to the north edge.
const NILE = "M578 512 C572 450 556 360 546 300 S532 220 540 180 S556 90 569 0";

// Label placement in map units, in physical directions: maps don't mirror for RTL.
type Align = "start" | "end" | "center";
const placement: Record<string, { dx: number; dy: number; align: Align }> = {
  "new-cairo": { dx: -20, dy: 0, align: "end" },
  "sheikh-zayed": { dx: 20, dy: 0, align: "start" },
  october: { dx: 20, dy: 0, align: "start" },
};
const zoneRadius: Record<string, number> = { "new-cairo": 74, "sheikh-zayed": 50, october: 62 };

const shift: Record<Align, string> = {
  start: "translate(0, -50%)",
  end: "translate(-100%, -50%)",
  center: "translate(-50%, -50%)",
};

/**
 * "Where we work": the three areas from the company profile, listed beside a schematic
 * map of Greater Cairo. Pointing at an area in either place highlights it in both.
 */
export function ServiceMap({ intro, details }: { intro: React.ReactNode; details?: React.ReactNode }) {
  const { lang, t } = useLang();
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  const points = serviceAreas.map((a) => ({ ...a, ...project(a.lat, a.lon) }));
  const hover = (id: string | null) => () => setActive(id);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const q = gsap.utils.selector(root);
      const rivers = [...(root.current?.querySelectorAll<SVGPathElement>("[data-river]") ?? [])];
      rivers.forEach((p) => {
        const length = p.getTotalLength();
        gsap.set(p, { strokeDasharray: length, strokeDashoffset: length });
      });
      gsap.set(q("[data-pop]"), { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(q("[data-label]"), { autoAlpha: 0, y: 8 });

      const tl = gsap.timeline({ paused: true });
      tl.from(q("[data-grid]"), { opacity: 0, duration: 1.4 })
        .to(rivers, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }, 0.1)
        .to(q("[data-pop]"), { scale: 1, duration: 0.9, stagger: 0.14, ease: "back.out(1.8)" }, 0.7)
        .to(q("[data-label]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 1);

      ScrollTrigger.create({ trigger: q(".area-map")[0], start: "top 80%", once: true, onEnter: () => tl.play() });
    },
    { scope: root },
  );

  // "ref" labels (landmarks) are dropped on phones; the areas and the scale always show.
  const labels: { id: string; x: number; y: number; align: Align; text: string; kind: "area" | "ref" | "scale" }[] = [
    ...points.map((p) => ({
      id: p.id,
      x: p.x + placement[p.id].dx,
      y: p.y + placement[p.id].dy,
      align: placement[p.id].align,
      text: t(p.short),
      kind: "area" as const,
    })),
    { id: "cairo", x: CAIRO.x + 14, y: CAIRO.y, align: "start", text: lang === "ar" ? "القاهرة" : "Cairo", kind: "ref" },
    { id: "pyramids", x: PYRAMIDS.x, y: PYRAMIDS.y + 26, align: "center", text: lang === "ar" ? "الأهرامات" : "Pyramids", kind: "ref" },
    { id: "nile", x: 586, y: 440, align: "start", text: lang === "ar" ? "النيل" : "Nile", kind: "ref" },
    { id: "scale", x: 40 + KM * 5, y: 452, align: "center", text: lang === "ar" ? "10 كم" : "10 km", kind: "scale" },
  ];

  return (
    <div ref={root} className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
      <div className="lg:col-span-4">
        {intro}
        <ul className="area-list mt-10">
          {serviceAreas.map((a) => (
            <li
              key={a.id}
              className={cn("area-item", active === a.id && "is-active")}
              onPointerEnter={hover(a.id)}
              onPointerLeave={hover(null)}
            >
              <span className="area-item-mark" aria-hidden="true" />
              {t(a.name)}
            </li>
          ))}
        </ul>
        {details}
      </div>

      <div className="lg:col-span-8 lg:self-center">
        <div
          className="area-map"
          role="img"
          aria-label={
            lang === "ar"
              ? "خريطة توضيحية للقاهرة الكبرى تبيّن مناطق عمل VARANDA: التجمع الخامس شرقًا، ومدينة الشيخ زايد والسادس من أكتوبر غربًا."
              : "Schematic map of Greater Cairo showing where VARANDA works: New Cairo (Fifth Settlement) in the east, Sheikh Zayed City and 6th of October in the west."
          }
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="area-map-svg" aria-hidden="true">
            <defs>
              <pattern id={`${uid}-grid`} width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M50 0H0V50" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect data-grid width={W} height={H} fill={`url(#${uid}-grid)`} className="area-map-grid" />

            <path data-river d={NILE} className="area-map-river" />
            <path data-river d={NILE} className="area-map-river-core" />

            <g transform={`translate(${CAIRO.x} ${CAIRO.y})`} className="area-map-ref">
              <g data-pop>
                <circle r="6" />
                <circle r="1.6" className="area-map-ref-fill" />
              </g>
            </g>
            <g transform={`translate(${PYRAMIDS.x} ${PYRAMIDS.y})`} className="area-map-ref">
              <path data-pop d="M-9 6 0-9 9 6Z" />
            </g>

            {points.map((p, i) => (
              <g
                key={p.id}
                transform={`translate(${p.x} ${p.y})`}
                className={cn("area-map-point", active === p.id && "is-active")}
                onPointerEnter={hover(p.id)}
                onPointerLeave={hover(null)}
              >
                <g data-pop>
                  <circle r={zoneRadius[p.id]} className="area-map-zone" />
                  <circle r="15" className="area-map-pulse" style={{ animationDelay: `${i * 0.7}s` }} />
                  <rect x="-6" y="-6" width="12" height="12" className="area-map-dot" />
                </g>
              </g>
            ))}

            <g transform="translate(958 30)" className="area-map-ref">
              <path d="M0 36V0M-6 10 0 0l6 10" />
              <text y="58" textAnchor="middle" className="area-map-north">
                N
              </text>
            </g>
            <g transform="translate(40 474)" className="area-map-ref">
              <path d={`M0 -7V7M0 0H${KM * 10}M${KM * 10} -7V7`} />
            </g>
          </svg>

          {labels.map((l) => (
            <span
              key={l.id}
              className={cn("area-map-label", l.kind !== "area" && `is-${l.kind}`, l.kind === "area" && active === l.id && "is-active")}
              style={{ left: `${(l.x / W) * 100}%`, top: `${(l.y / H) * 100}%`, transform: shift[l.align] }}
              aria-hidden="true"
            >
              <span data-label className="block">
                {l.text}
              </span>
            </span>
          ))}
        </div>
        <p className="t-label mt-4 text-mist">{lang === "ar" ? "مواقع تقريبية — الخريطة توضيحية" : "Approximate locations — schematic map"}</p>
      </div>
    </div>
  );
}
