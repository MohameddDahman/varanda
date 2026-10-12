"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { cn } from "@/lib/cn";

/** Heat drifts in from the street and fades out at the frame. */
export function ThermalDemo() {
  const { lang } = useLang();
  return (
    <div className="demo demo-thermal" aria-hidden="true">
      <div className="demo-side demo-hot">
        <span className="t-label">{lang === "ar" ? "الخارج" : "Outside"}</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="heat-line" style={{ top: `${22 + i * 13}%`, animationDelay: `${i * 0.45}s` }} />
        ))}
      </div>
      <div className="demo-wall">
        <svg viewBox="0 0 40 120" className="h-full w-full">
          <rect x="2" y="2" width="36" height="116" fill="#eef0f3" />
          {[8, 30, 52, 74, 96].map((y) => (
            <rect key={y} x="7" y={y} width="26" height="16" fill="#d5dae1" />
          ))}
        </svg>
      </div>
      <div className="demo-side demo-cool">
        <span className="t-label">{lang === "ar" ? "الداخل" : "Inside"}</span>
      </div>
    </div>
  );
}

/** Street noise on one side; toggle the window to hear what reaches the room. */
export function AcousticDemo() {
  const { lang } = useLang();
  const [closed, setClosed] = useState(true);
  const bars = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="demo demo-acoustic">
      <div className="demo-wave">
        <span className="t-label text-[var(--fg-2)]">{lang === "ar" ? "ضوضاء الشارع" : "Street noise"}</span>
        <div className="wave-bars" aria-hidden="true">
          {bars.map((i) => (
            <span key={i} style={{ animationDelay: `${(i % 6) * 0.13}s` }} />
          ))}
        </div>
      </div>
      <div className="demo-wave">
        <span className="t-label text-[var(--fg-2)]">{lang === "ar" ? "داخل الغرفة" : "In the room"}</span>
        <div className={cn("wave-bars is-inside", closed && "is-closed")} aria-hidden="true">
          {bars.map((i) => (
            <span key={i} style={{ animationDelay: `${(i % 6) * 0.13}s` }} />
          ))}
        </div>
      </div>
      <button type="button" className="chip mt-6" aria-pressed={closed} onClick={() => setClosed((c) => !c)}>
        {closed
          ? lang === "ar"
            ? "الشباك مغلق — افتحه"
            : "Window closed — open it"
          : lang === "ar"
            ? "الشباك مفتوح — أغلقه"
            : "Window open — close it"}
      </button>
    </div>
  );
}

/** Turn the handle and the locking points engage around the sash. */
export function SecurityDemo() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.4, defaults: { ease: "power3.inOut" } });
      tl.to(q("[data-handle]"), { rotate: 90, duration: 0.6 })
        .to(q("[data-cam]"), { y: (i: number) => (i % 2 ? 8 : -8), duration: 0.45, stagger: 0.08 }, "-=0.1")
        .to(q("[data-keeper]"), { backgroundColor: "#e11b22", duration: 0.25, stagger: 0.08 }, "<0.2")
        .to({}, { duration: 1.2 })
        .to(q("[data-keeper]"), { backgroundColor: "#9aa4b1", duration: 0.25 })
        .to(q("[data-cam]"), { y: 0, duration: 0.45, stagger: 0.05 }, "<")
        .to(q("[data-handle]"), { rotate: 0, duration: 0.6 }, "-=0.2");
      if (reducedMotion()) {
        tl.progress(0.45).pause();
        return;
      }
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 85%",
        end: "bottom 15%",
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className="demo demo-security" aria-hidden="true">
      <div className="lock-sash">
        <span data-handle className="lock-handle" />
        {[18, 50, 82].map((top, i) => (
          <span key={top} className="lock-point" style={{ top: `${top}%` }}>
            <span data-cam className="lock-cam" style={{ zIndex: i }} />
            <span data-keeper className="lock-keeper" />
          </span>
        ))}
      </div>
    </div>
  );
}
