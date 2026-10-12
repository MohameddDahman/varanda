"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { anatomy } from "@/content/company";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";
import type { ProfileState } from "./ProfileScene";

const ProfileScene = dynamic(() => import("./ProfileScene"), {
  ssr: false,
  loading: () => <div className="anatomy-loading" aria-hidden="true" />,
});

let webglSupport: boolean | undefined;
const hasWebGL = () => {
  if (webglSupport === undefined) {
    try {
      const c = document.createElement("canvas");
      webglSupport = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
};
const noop = () => () => {};

/**
 * Pinned 3D cross-section of a uPVC window. Scrolling walks through the
 * parts; the list doubles as buttons for keyboard and reduced-motion users.
 */
export function ProfileAnatomy() {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  // Shared with the WebGL frame loop, which reads it every frame.
  const sceneState = useRef<ProfileState>({ step: 0, progress: 0 });
  const [step, setStep] = useState(0);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const webgl = useSyncExternalStore(noop, hasWebGL, () => true);
  const parts = anatomy.parts;

  // Mount the canvas when close; render only while on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
        setVisible(e.isIntersecting);
      },
      { rootMargin: "60% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (s: number) => {
    sceneState.current.step = s;
    setStep(s);
  };

  useGSAP(
    () => {
      if (reducedMotion()) return;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=420%",
        pin: true,
        anticipatePin: 1,
        onUpdate(self) {
          sceneState.current.progress = self.progress;
          const s = self.progress < 0.12 ? 0 : Math.min(parts.length, 1 + Math.floor(((self.progress - 0.12) / 0.88) * parts.length));
          if (s !== sceneState.current.step) go(s);
        },
      });
    },
    { scope: root },
  );

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

          <ol className="mt-10 border-t border-[var(--line)]">
            {parts.map((p, i) => (
              <li key={p.id} className="border-b border-[var(--line)]">
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
                    <span className="anatomy-part-text t-small block text-mist">{t(p.text)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="anatomy-stage">
          {webgl ? (
            near && <ProfileScene stateRef={sceneState} active={visible} />
          ) : (
            <p className="t-small text-mist">{lang === "ar" ? "يتطلب العرض ثلاثي الأبعاد دعم WebGL." : "The 3D view needs WebGL."}</p>
          )}
          <p className="anatomy-hint t-label text-mist" aria-hidden="true">
            {lang === "ar" ? "مقطع توضيحي" : "Illustrative section"}
          </p>
        </div>
      </div>
    </section>
  );
}
