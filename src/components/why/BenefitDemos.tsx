"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { cn } from "@/lib/cn";
import { startWind, type Wind } from "./wind";

/**
 * Heat from the street against two kinds of window. An ordinary frame lets it stream
 * through and the room warms; the multi-chamber uPVC profile stops it at the frame.
 */
export function ThermalDemo() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const [upvc, setUpvc] = useState(false);
  const lines = [0, 1, 2, 3, 4];
  return (
    <div className={cn("demo-thermal-wrap", upvc && "is-upvc")}>
      <div className="demo demo-thermal" aria-hidden="true">
        <div className="demo-side demo-hot">
          <span className="t-label">{ar ? "الخارج" : "Outside"}</span>
          {lines.map((i) => (
            <span key={i} className="heat-line" style={{ top: `${22 + i * 13}%`, animationDelay: `${i * 0.45}s` }} />
          ))}
        </div>
        <div className="demo-wall">
          {/* Ordinary frame: one thin solid section. */}
          <svg viewBox="0 0 40 120" className="demo-wall-plain">
            <rect x="15" y="2" width="10" height="116" fill="#a9b2bd" />
          </svg>
          {/* uPVC: a deep profile full of insulating air chambers. */}
          <svg viewBox="0 0 40 120" className="demo-wall-upvc">
            <rect x="2" y="2" width="36" height="116" fill="#eef0f3" />
            {[8, 30, 52, 74, 96].map((y) => (
              <rect key={y} x="7" y={y} width="26" height="16" fill="#d5dae1" />
            ))}
          </svg>
        </div>
        <div className="demo-side demo-cool">
          <span className="demo-warmth" />
          <span className="t-label relative">{ar ? "الداخل" : "Inside"}</span>
          {lines.map((i) => (
            <span key={i} className="heat-line heat-leak" style={{ top: `${22 + i * 13}%`, animationDelay: `${0.9 + i * 0.45}s` }} />
          ))}
          <span className="demo-room-state t-label">
            {upvc ? (ar ? "الغرفة تبقى مريحة" : "Room stays comfortable") : ar ? "الحرارة تتسرب للداخل" : "Heat gets in"}
          </span>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={ar ? "نوع الشباك" : "Window type"}>
        <button type="button" className={cn("chip", !upvc && "is-active")} aria-pressed={!upvc} onClick={() => setUpvc(false)}>
          {ar ? "شباك عادي" : "Ordinary window"}
        </button>
        <button type="button" className={cn("chip", upvc && "is-active")} aria-pressed={upvc} onClick={() => setUpvc(true)}>
          {ar ? "شباك uPVC" : "uPVC window"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {upvc ? (ar ? "شباك uPVC: الحرارة تتوقف عند الإطار." : "uPVC window: the heat stops at the frame.") : ar ? "شباك عادي: الحرارة تعبر إلى الداخل." : "Ordinary window: the heat passes inside."}
      </p>
    </div>
  );
}

// Resting heights for the bars when motion is reduced (they don't bounce then).
const BAR_HEIGHTS = [0.45, 0.8, 0.55, 1, 0.65, 0.35, 0.9, 0.5, 0.7];
const barStyle = (i: number) =>
  ({ animationDelay: `${(i % 6) * 0.13}s`, "--h": BAR_HEIGHTS[i % BAR_HEIGHTS.length] }) as React.CSSProperties;

/**
 * Street noise on one side; toggle the window to see what reaches the room. With the
 * sound on, a generated wind plays and the bars follow it: open, it comes straight in;
 * closed, it turns into a soft, dull hush.
 */
export function AcousticDemo() {
  const { lang } = useLang();
  const ar = lang === "ar";
  // Starts open, so the first thing the visitor does is close it and hear the difference.
  const [closed, setClosed] = useState(false);
  const [sound, setSound] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const outsideRow = useRef<HTMLDivElement>(null);
  const insideRow = useRef<HTMLDivElement>(null);
  const wind = useRef<Wind | null>(null);
  const bars = Array.from({ length: 18 }, (_, i) => i);

  const stopSound = useCallback(() => {
    wind.current?.stop();
    wind.current = null;
    setSound(false);
  }, []);

  // Started straight from the tap: browsers only allow sound that begins with a gesture.
  const toggleSound = () => {
    if (wind.current) {
      stopSound();
      return;
    }
    const started = startWind(!closed);
    if (!started) return;
    wind.current = started;
    setSound(true);
  };

  const toggleWindow = () => {
    const next = !closed;
    setClosed(next);
    wind.current?.setOpen(!next);
  };

  // While the sound plays the bars follow the live signal, and the sound stops when the
  // demo scrolls away, the tab is hidden or the page changes.
  useEffect(() => {
    if (!sound) return;
    const playing = wind.current;
    const rows = [outsideRow.current, insideRow.current];
    const amps = rows.map((row) => (row ? parseFloat(getComputedStyle(row).getPropertyValue("--amp")) || 1 : 1));
    let peak = 1e-4;
    let frame = 0;
    const draw = () => {
      if (playing) {
        const { outside, inside } = playing.read();
        // Scale to the loudest recent gust so the bars use their height on any device.
        peak = Math.max(peak * 0.995, outside);
        const targets = [Math.min(1, Math.max(0.2, outside / peak)), Math.min(1, Math.max(0.04, inside / peak))];
        rows.forEach((row, i) => {
          amps[i] += (targets[i] - amps[i]) * 0.2;
          row?.style.setProperty("--amp", amps[i].toFixed(3));
        });
      }
      frame = requestAnimationFrame(draw);
    };
    if (!reducedMotion()) frame = requestAnimationFrame(draw);

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stopSound();
    });
    if (root.current) io.observe(root.current);
    const onVisibility = () => {
      if (document.hidden) stopSound();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      rows.forEach((row) => row?.style.removeProperty("--amp"));
      playing?.stop();
    };
  }, [sound, stopSound]);

  return (
    <div ref={root} className={cn("demo demo-acoustic", sound && "is-live")}>
      <div className="demo-wave">
        <span className="t-label text-[var(--fg-2)]">{ar ? "ضوضاء الشارع" : "Street noise"}</span>
        <div ref={outsideRow} className="wave-bars" aria-hidden="true">
          {bars.map((i) => (
            <span key={i} style={barStyle(i)} />
          ))}
        </div>
      </div>
      <div className="demo-wave">
        <span className="t-label text-[var(--fg-2)]">{ar ? "داخل الغرفة" : "In the room"}</span>
        <div ref={insideRow} className={cn("wave-bars is-inside", closed && "is-closed")} aria-hidden="true">
          {bars.map((i) => (
            <span key={i} style={barStyle(i)} />
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" className="chip" aria-pressed={closed} onClick={toggleWindow}>
          {closed
            ? ar
              ? "الشباك مغلق — افتحه"
              : "Window closed — open it"
            : ar
              ? "الشباك مفتوح — أغلقه"
              : "Window open — close it"}
        </button>
        <button type="button" className={cn("chip", sound && "is-active")} aria-pressed={sound} onClick={toggleSound}>
          <SoundIcon playing={sound} />
          {ar ? "اسمع الفرق" : "Hear the difference"}
        </button>
      </div>
    </div>
  );
}

function SoundIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("sound-icon h-4 w-4 shrink-0", playing && "is-playing")}
      aria-hidden="true"
    >
      <path d="M4 9.5h3l4-3.5v12l-4-3.5H4Z" />
      <path className="sound-wave" d="M15 9a4 4 0 0 1 0 6" />
      <path className="sound-wave" d="M17.5 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
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
        .to(q("[data-keeper]"), { backgroundColor: "#d71920", duration: 0.25, stagger: 0.08 }, "<0.2")
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
