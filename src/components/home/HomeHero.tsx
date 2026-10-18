"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { onPageEnter } from "@/components/transition/store";
import { useLang } from "@/components/providers/LangProvider";
import { TLink } from "@/components/transition/TLink";
import type { L } from "@/i18n/config";
import type { Photo } from "@/content/photos";
import { site } from "@/content/site";

const WORDS = {
  en: ["Made", "for life"],
  ar: ["صُنعت", "لتدوم"],
} as const;

/**
 * Home hero: two frosted sliding panels in white uPVC frames sit over a real
 * Varanda installation. The headline straddles the meeting stile; scrolling
 * slides the panels apart and the clear view takes over.
 */
export function HomeHero({ photo, project, caption }: { photo: Photo; project: string; caption: L }) {
  const { lang, t, href, rtl } = useLang();
  const root = useRef<HTMLElement>(null);
  const [first, second] = WORDS[lang];

  // First word sits on the reading-start side of the seam, second word on the other, one line lower.
  const leftWord = rtl ? second : first;
  const rightWord = rtl ? first : second;
  const leftIsUpper = !rtl;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance, played as the transition doors part.
        // Entrance and scroll never animate the same element/property, so the
        // scrubbed timeline always records clean start values.
        const enter = gsap.timeline({ paused: true });
        enter
          .from(q("[data-photo-enter]"), { scale: 1.18, duration: 2.6, ease: "soft" }, 0)
          .from(q("[data-word] > span"), { yPercent: 112, duration: 1.4, stagger: 0.14, ease: "lift" }, 0.15)
          .from(q("[data-meta] > *"), { autoAlpha: 0, y: 18, duration: 1, stagger: 0.08 }, 0.6)
          .from(q("[data-seam]"), { autoAlpha: 0, duration: 1.2, ease: "soft" }, 0.7);
        const off = onPageEnter(() => enter.play());

        // Scroll: the panels slide apart, the frosted glass travels with them.
        const open = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=135%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
          },
        });
        open
          .to(q("[data-seam]"), { scaleY: 0, duration: 0.12 }, 0)
          .to(q("[data-meta]"), { autoAlpha: 0, y: -24, duration: 0.2 }, 0)
          .to(q("[data-panel=left]"), { xPercent: -101, duration: 1 }, 0.04)
          .to(q("[data-panel=right]"), { xPercent: 101, duration: 1 }, 0.04)
          .to(q("[data-panel=left] [data-glass]"), { xPercent: 50.5, duration: 1 }, 0.04)
          .to(q("[data-panel=right] [data-glass]"), { xPercent: -50.5, duration: 1 }, 0.04)
          .to(q("[data-photo]"), { scale: 1, duration: 1.1 }, 0)
          .fromTo(q("[data-caption]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.85);

        // The glass catches the light as the pointer moves.
        const sheen = (e: PointerEvent) => {
          root.current?.style.setProperty("--mx", String(e.clientX / window.innerWidth));
        };
        root.current?.addEventListener("pointermove", sheen);
        return () => {
          off();
          root.current?.removeEventListener("pointermove", sheen);
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [rtl] },
  );

  const glass = (
    <Image
      src={photo.src}
      alt=""
      fill
      sizes="100vw"
      quality={60}
      className="hero-glass-img object-cover"
      aria-hidden="true"
    />
  );

  return (
    <section ref={root} className="hero theme-deep" data-header="dark" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">
        {t(site.tagline)} {t(site.descriptorFull)}
      </h1>

      <div className="hero-view" aria-hidden="true">
        <div data-photo-enter className="absolute inset-0">
          <div data-photo className="absolute inset-0" style={{ transform: "scale(1.12)" }}>
            <Image src={photo.src} alt="" fill sizes="100vw" preload placeholder="blur" className="object-cover" />
          </div>
        </div>
        <div className="hero-view-shade" />
      </div>

      {/* Static composition for reduced motion. */}
      <div className="hero-static" aria-hidden="true">
        <p className="hero-word-static">
          {first} {second}
          <span className="dot">.</span>
        </p>
      </div>

      <div data-panel="left" className="hero-panel hero-panel-left" aria-hidden="true">
        <div data-glass className="hero-glass hero-glass-left">
          {glass}
        </div>
        <span className="hero-glass-tint" />
        <span className="hero-glass-sheen" />
        <span className="hero-frame" />
        <span className="hero-handle" />
        <p data-word className={`hero-word hero-word-left ${leftIsUpper ? "is-upper" : "is-lower"}`}>
          <span>
            {leftWord}
            {rtl && <span className="dot">.</span>}
          </span>
        </p>
      </div>

      <div data-panel="right" className="hero-panel hero-panel-right" aria-hidden="true">
        <div data-glass className="hero-glass hero-glass-right">
          {glass}
        </div>
        <span className="hero-glass-tint" />
        <span className="hero-glass-sheen" />
        <span className="hero-frame" />
        <span className="hero-handle" />
        <p data-word className={`hero-word hero-word-right ${leftIsUpper ? "is-lower" : "is-upper"}`}>
          <span>
            {rightWord}
            {!rtl && <span className="dot">.</span>}
          </span>
        </p>
      </div>

      <span data-seam className="hero-seam" aria-hidden="true" />

      <div data-meta className="hero-meta wrap">
        <p className="t-label text-white/80">{t(site.descriptorFull)}</p>
        <p className="hero-scroll t-label text-white/80">
          <span className="hero-scroll-line" aria-hidden="true" />
          {lang === "ar" ? "مرّر لفتح الباب" : "Scroll to open"}
        </p>
      </div>

      <div data-caption className="hero-caption wrap">
        <TLink href={href(`/projects/${project}`)} className="hero-caption-link" data-cursor={lang === "ar" ? "عرض" : "View"}>
          <span className="t-label text-red">/</span>
          <span className="t-label">{t(caption)}</span>
        </TLink>
      </div>
    </section>
  );
}
