"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { onPageEnter } from "@/components/transition/store";
import { useLang } from "@/components/providers/LangProvider";
import type { Photo } from "@/content/photos";
import { cn } from "@/lib/cn";

type Props = {
  photo: Photo;
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** Number of shutter slats that roll up to reveal the photo. */
  slats?: number;
  /** Drift the photo inside its frame while scrolling. */
  parallax?: boolean;
  trigger?: "scroll" | "enter";
  preload?: boolean;
  /** Cursor label, e.g. "View". */
  cursor?: string;
  /** Empty alt text, for when a visible caption or the parent's label already describes the photo. */
  decorative?: boolean;
};

/**
 * A photo revealed by a roller shutter: horizontal slats in the section's
 * colour roll up from the bottom, then the image settles and drifts.
 */
export function ShutterImage({
  photo,
  sizes,
  className,
  imgClassName,
  slats = 8,
  parallax = true,
  trigger = "scroll",
  preload = false,
  cursor,
  decorative = false,
}: Props) {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      if (reducedMotion()) {
        gsap.set(q("[data-slat]"), { scaleY: 0 });
        return;
      }

      const tl = gsap.timeline({ paused: true });
      tl.to(q("[data-slat]"), {
        scaleY: 0,
        duration: 0.9,
        ease: "power3.inOut",
        stagger: { each: 0.06, from: "end" },
      }).fromTo(q("[data-img]"), { scale: 1.18 }, { scale: 1, duration: 1.8, ease: "soft" }, 0);

      if (parallax) {
        gsap.fromTo(
          q("[data-drift]"),
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }

      if (trigger === "enter") return onPageEnter(() => tl.play());
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => tl.play() });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("shutter relative overflow-hidden", className)} data-cursor={cursor}>
      <div data-drift className="absolute inset-x-0 -inset-y-[7%]">
        <div data-img className="absolute inset-0">
          <Image
            src={photo.src}
            alt={decorative ? "" : t(photo.alt)}
            fill
            sizes={sizes}
            preload={preload}
            placeholder="blur"
            className={cn("object-cover", imgClassName)}
          />
        </div>
      </div>
      <div className="shutter-slats" aria-hidden="true" style={{ gridTemplateRows: `repeat(${slats}, 1fr)` }}>
        {Array.from({ length: slats }, (_, i) => (
          <span key={i} data-slat className="shutter-slat" />
        ))}
      </div>
    </div>
  );
}
