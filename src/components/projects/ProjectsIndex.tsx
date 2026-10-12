"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Flip } from "gsap/Flip";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { projects, projectTypes, type ProjectType } from "@/content/projects";
import { photos } from "@/content/photos";
import { getSystem } from "@/content/systems";
import { ui } from "@/content/site";
import { TLink } from "@/components/transition/TLink";
import { ShutterImage } from "@/components/motion/ShutterImage";
import { Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

type Filter = "all" | ProjectType;
type View = "grid" | "list";

/**
 * Filterable project index. Changing the filter or the view re-lays the
 * cards with GSAP Flip so they glide to their new places instead of jumping.
 */
export function ProjectsIndex() {
  const { lang, t, href } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("grid");
  const [hovered, setHovered] = useState<string | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: projects.length, residential: 0, commercial: 0, outdoor: 0 };
    projects.forEach((p) => c[p.type]++);
    return c;
  }, []);

  const capture = () => {
    if (reducedMotion() || !root.current) return;
    flipState.current = Flip.getState(root.current.querySelectorAll("[data-flip]"));
  };

  useGSAP(
    () => {
      const state = flipState.current;
      if (!state) return;
      flipState.current = null;
      Flip.from(state, {
        duration: 0.85,
        ease: "power3.inOut",
        absolute: true,
        scale: true,
        nested: true,
        prune: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.25 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.94, duration: 0.4 }),
        // The grid now has a new order and height, so re-measure every scroll trigger:
        // a card that moved into view would otherwise stay behind its closed shutter.
        onComplete: () => ScrollTrigger.refresh(),
      });
    },
    { dependencies: [filter, view], scope: root },
  );

  // List view: a photo follows the pointer over the rows.
  useGSAP(
    () => {
      if (view !== "list" || !preview.current || reducedMotion()) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const xTo = gsap.quickTo(preview.current, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(preview.current, "y", { duration: 0.6, ease: "power3" });
      const move = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    { dependencies: [view], scope: root },
  );

  useGSAP(
    () => {
      if (!preview.current) return;
      gsap.to(preview.current, {
        autoAlpha: hovered && view === "list" ? 1 : 0,
        scale: hovered && view === "list" ? 1 : 0.85,
        duration: 0.45,
        ease: "power3.out",
      });
    },
    { dependencies: [hovered, view], scope: root },
  );

  const visible = projects.filter((p) => filter === "all" || p.type === filter);
  const filters: Filter[] = ["all", "residential", "commercial", "outdoor"];

  return (
    <div ref={root}>
      <div className="flex flex-col gap-6 border-y border-[var(--line)] py-5 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label={lang === "ar" ? "تصفية المشروعات" : "Filter projects"} className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => {
                if (f === filter) return;
                capture();
                setFilter(f);
              }}
              className={cn("chip", filter === f && "is-active")}
            >
              {f === "all" ? (lang === "ar" ? "الكل" : "All") : t(projectTypes[f])}
              <span className="chip-count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div role="group" aria-label={lang === "ar" ? "طريقة العرض" : "View"} className="flex gap-2">
          {(["grid", "list"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => {
                if (v === view) return;
                capture();
                setView(v);
              }}
              className={cn("chip", view === v && "is-active")}
            >
              {v === "grid" ? (lang === "ar" ? "شبكة" : "Grid") : lang === "ar" ? "قائمة" : "List"}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {lang === "ar" ? `${visible.length} مشروعات معروضة` : `${visible.length} projects shown`}
      </p>

      {view === "grid" ? (
        <ul className="projects-grid mt-12">
          {visible.map((p, i) => (
            <li key={p.slug} data-flip data-flip-id={p.slug} className={cn("projects-grid-item", i % 3 === 0 && "is-wide")}>
              <TLink href={href(`/projects/${p.slug}`)} className="group block" data-cursor={t(ui.view)}>
                <div className="relative overflow-hidden">
                  <ShutterImage
                    photo={photos[p.cover]}
                    sizes={i % 3 === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                    className={cn("w-full transition-transform duration-700 group-hover:scale-[1.02]", i % 3 === 0 ? "aspect-[16/10]" : "aspect-[4/5]")}
                  />
                </div>
                <div className="mt-5 flex items-start justify-between gap-6">
                  <div>
                    <h2 className="t-h3">{t(p.title)}</h2>
                    <p className="t-label mt-2 text-ink-2">
                      {t(projectTypes[p.type])} · {p.year}
                    </p>
                  </div>
                  <span className="mt-1 text-ink-2 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <Arrow />
                  </span>
                </div>
              </TLink>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6" onPointerLeave={() => setHovered(null)}>
          {visible.map((p) => (
            <li key={p.slug} data-flip data-flip-id={p.slug} className="border-b border-[var(--line)]">
              <TLink
                href={href(`/projects/${p.slug}`)}
                className="projects-row group"
                onPointerEnter={() => setHovered(p.slug)}
                onFocus={() => setHovered(p.slug)}
                onBlur={() => setHovered(null)}
              >
                <h2 className="t-h2 transition-transform duration-500 group-hover:translate-x-3 rtl:group-hover:-translate-x-3">
                  {t(p.title)}
                </h2>
                <span className="t-small text-ink-2">{t(projectTypes[p.type])}</span>
                <span className="t-small hidden text-ink-2 md:block">
                  {p.systems.map((s) => getSystem(s) && t(getSystem(s)!.name)).filter(Boolean).join(" · ") || "—"}
                </span>
                <span className="t-label text-ink-2">{p.year}</span>
              </TLink>
            </li>
          ))}
        </ul>
      )}

      {/* Pointer-following preview for list view */}
      <div ref={preview} className="projects-preview" aria-hidden="true">
        {projects.map((p) => (
          <div key={p.slug} className={cn("absolute inset-0 transition-opacity duration-300", hovered === p.slug ? "opacity-100" : "opacity-0")}>
            <Image src={photos[p.cover].src} alt="" fill sizes="340px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
