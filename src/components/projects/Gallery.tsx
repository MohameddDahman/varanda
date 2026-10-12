"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { photos, type PhotoKey } from "@/content/photos";
import { ShutterImage } from "@/components/motion/ShutterImage";
import { scroller } from "@/components/transition/store";
import { cn } from "@/lib/cn";

/**
 * Editorial gallery: landscape photos run wide, portrait photos pair up.
 * Any photo opens a full-screen viewer (arrows, Escape, swipe).
 */
export function Gallery({ items }: { items: PhotoKey[] }) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const touchX = useRef(0);

  const close = useCallback(() => {
    if (!viewer.current) return setOpen(null);
    gsap.to(viewer.current, {
      autoAlpha: 0,
      duration: 0.35,
      onComplete: () => {
        setOpen(null);
        scroller.lenis?.start();
        lastFocus.current?.focus();
      },
    });
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen || !viewer.current) return;
    scroller.lenis?.stop();
    gsap.fromTo(viewer.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
    viewer.current.querySelector<HTMLButtonElement>("[data-close]")?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(lang === "ar" ? -1 : 1);
      if (e.key === "ArrowLeft") go(lang === "ar" ? 1 : -1);
      if (e.key === "Tab" && viewer.current) {
        const f = viewer.current.querySelectorAll<HTMLElement>("button");
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, go, lang]);

  // Pair consecutive portrait photos; landscapes run full width.
  const rows: number[][] = [];
  items.forEach((key, i) => {
    const portrait = photos[key].src.height > photos[key].src.width;
    const prev = rows[rows.length - 1];
    if (portrait && prev && prev.length === 1 && photos[items[prev[0]]].src.height > photos[items[prev[0]]].src.width) prev.push(i);
    else rows.push([i]);
  });

  const openAt = (i: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    lastFocus.current = e.currentTarget;
    setOpen(i);
  };

  return (
    <>
      <div className="space-y-[clamp(1.5rem,4vw,4rem)]">
        {rows.map((row, r) => (
          <div key={r} className={cn("grid gap-[clamp(1.5rem,4vw,4rem)]", row.length === 2 && "md:grid-cols-2", row.length === 1 && r % 2 === 1 && "md:w-[78%] md:ms-auto")}>
            {row.map((i) => {
              const key = items[i];
              const p = photos[key];
              const portrait = p.src.height > p.src.width;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={openAt(i)}
                  className="group block w-full text-start"
                  aria-label={`${lang === "ar" ? "عرض الصورة" : "Open photo"}: ${t(p.alt)}`}
                >
                  <ShutterImage
                    photo={p}
                    sizes={row.length === 2 ? "(min-width: 768px) 45vw, 100vw" : "(min-width: 768px) 80vw, 100vw"}
                    className={cn("w-full", portrait ? "aspect-[4/5]" : "aspect-[3/2]")}
                    imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.03]"
                    cursor={lang === "ar" ? "تكبير" : "Enlarge"}
                    decorative
                  />
                  <span className="t-label mt-3 block text-ink-2">{t(p.alt)}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Portalled to <body> so it sits above the fixed header, outside <main>'s stacking context. */}
      {open !== null &&
        createPortal(
        <div
          ref={viewer}
          className="viewer"
          role="dialog"
          aria-modal="true"
          aria-label={lang === "ar" ? "عارض الصور" : "Photo viewer"}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? (lang === "ar" ? -1 : 1) : lang === "ar" ? 1 : -1);
          }}
        >
          <div className="relative h-full w-full">
            <Image
              key={items[open]}
              src={photos[items[open]].src}
              alt={t(photos[items[open]].alt)}
              fill
              sizes="100vw"
              quality={85}
              className="viewer-img object-contain"
            />
          </div>
          <div className="viewer-bar wrap">
            <p className="t-label text-white/80" aria-live="polite">
              <span dir="ltr">
                {String(open + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <span className="ms-4 hidden sm:inline">{t(photos[items[open]].alt)}</span>
            </p>
            <div className="flex gap-2">
              <button type="button" className="viewer-btn" onClick={() => go(-1)} aria-label={lang === "ar" ? "الصورة السابقة" : "Previous photo"}>
                <span aria-hidden="true" className="rtl:-scale-x-100 inline-block">←</span>
              </button>
              <button type="button" className="viewer-btn" onClick={() => go(1)} aria-label={lang === "ar" ? "الصورة التالية" : "Next photo"}>
                <span aria-hidden="true" className="rtl:-scale-x-100 inline-block">→</span>
              </button>
              <button type="button" data-close className="viewer-btn" onClick={close} aria-label={lang === "ar" ? "إغلاق" : "Close"}>
                ✕
              </button>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
