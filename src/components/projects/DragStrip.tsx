"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { photos, type PhotoKey } from "@/content/photos";
import { ui } from "@/content/site";
import type { L } from "@/i18n/config";

/**
 * Horizontal photo strip. Native scrolling (touch, trackpad, keyboard) plus
 * mouse drag with a little momentum on release.
 */
export function DragStrip({ items, label }: { items: { photo: PhotoKey; label: L }[]; label: string }) {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, left: 0, v: 0, last: 0, moved: false });

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    gsap.killTweensOf(ref.current);
    drag.current = { active: true, x: e.clientX, left: ref.current.scrollLeft, v: 0, last: e.clientX, moved: false };
    ref.current.style.scrollSnapType = "none";
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || !ref.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    ref.current.scrollLeft = d.left - dx;
    d.v = e.clientX - d.last;
    d.last = e.clientX;
  };
  const onUp = () => {
    const d = drag.current;
    if (!d.active || !ref.current) return;
    d.active = false;
    const el = ref.current;
    gsap.to(el, {
      scrollLeft: el.scrollLeft - d.v * 14,
      duration: 0.9,
      ease: "power3.out",
      onComplete: () => {
        el.style.scrollSnapType = "";
      },
    });
  };

  return (
    <div
      ref={ref}
      className="drag-strip"
      data-cursor={t(ui.drag)}
      role="region"
      aria-label={label}
      tabIndex={0}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onClickCapture={(e) => {
        if (drag.current.moved) e.preventDefault();
      }}
    >
      {items.map((item) => (
        <figure key={item.photo} className="drag-strip-item">
          <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
            <Image
              src={photos[item.photo].src}
              alt={t(photos[item.photo].alt)}
              fill
              sizes="(min-width: 768px) 28vw, 70vw"
              placeholder="blur"
              draggable={false}
              className="object-cover"
            />
          </div>
          <figcaption className="t-label mt-4 text-[var(--fg-2)]">{t(item.label)}</figcaption>
        </figure>
      ))}
    </div>
  );
}
