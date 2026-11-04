"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollTrigger, reducedMotion } from "@/lib/gsap";
import { LANG_COOKIE, switchLangPath, type L, type Lang } from "@/i18n/config";
import { routeLabel } from "@/content/routes";
import { ui } from "@/content/site";
import { Doors, type DoorsHandle } from "./Doors";
import { pageEnter, scroller, scrollToTop } from "./store";

type Phase = "boot" | "idle" | "closing" | "closed" | "opening";

type TransitionApi = {
  navigate: (href: string, label?: L) => void;
  switchLang: (to: Lang) => void;
};

const TransitionContext = createContext<TransitionApi>({
  navigate: () => {},
  switchLang: () => {},
});

export const useTransitionNav = () => useContext(TransitionContext);

// Also read by the layout's inline script, which marks a first visit before the first paint.
const INTRO_KEY = "varanda:intro";

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const doors = useRef<DoorsHandle>(null);
  const phase = useRef<Phase>("boot");
  const failsafe = useRef<number | undefined>(undefined);

  const focusMain = () => document.getElementById("main")?.focus({ preventScroll: true });

  const reveal = useCallback(async (firstLoad = false) => {
    window.clearTimeout(failsafe.current);
    scrollToTop();
    scroller.lenis?.start();
    // A new page's scroll scenes are measured before it's shown. On the first load ScrollTrigger
    // already did that when the page finished loading (fonts included), so measuring the whole
    // page again is only needed if it's still loading.
    if (!firstLoad || document.readyState !== "complete") ScrollTrigger.refresh();
    phase.current = "opening";
    const opening = doors.current?.open();
    // Let the panels start parting before the page plays its entrance.
    window.setTimeout(() => pageEnter.emit(), 160);
    await opening;
    phase.current = "idle";
  }, []);

  const navigate = useCallback(
    async (href: string, label?: L) => {
      const url = new URL(href, window.location.href);
      if (phase.current !== "idle") return;

      if (url.pathname === window.location.pathname) {
        const target = url.hash || 0;
        if (scroller.lenis) scroller.lenis.scrollTo(target, { offset: url.hash ? -80 : 0 });
        else if (url.hash) document.querySelector(url.hash)?.scrollIntoView();
        else window.scrollTo({ top: 0 });
        return;
      }

      if (reducedMotion() || !doors.current) {
        router.push(href);
        return;
      }

      phase.current = "closing";
      pageEnter.reset();
      router.prefetch(href);
      scroller.lenis?.stop();
      await doors.current.close(label ?? routeLabel(url.pathname));
      phase.current = "closed";
      router.push(href, { scroll: false });
      // If the route never commits (offline, error), never leave the doors shut.
      failsafe.current = window.setTimeout(() => {
        if (phase.current === "closed") reveal().then(focusMain);
      }, 5000);
    },
    [router, reveal],
  );

  const switchLang = useCallback(async (to: Lang) => {
    document.cookie = `${LANG_COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`;
    const next = switchLangPath(window.location.pathname, to) + window.location.hash;
    // A language change swaps <html lang/dir> and fonts, so do a real page load
    // behind closed doors; the new page boots with the doors still shut.
    sessionStorage.setItem(INTRO_KEY, "1");
    if (!reducedMotion() && doors.current && phase.current === "idle") {
      phase.current = "closing";
      scroller.lenis?.stop();
      await doors.current.close(ui.langName);
    }
    window.location.assign(next);
  }, []);

  // A new route has committed.
  useEffect(() => {
    if (phase.current === "closed") {
      // Two frames: let the new page paint and lay out before measuring.
      let id = requestAnimationFrame(() => {
        id = requestAnimationFrame(() => reveal().then(focusMain));
      });
      return () => cancelAnimationFrame(id);
    }
    if (phase.current === "idle") {
      // Browser back/forward: no doors, just bring the page in.
      ScrollTrigger.refresh();
      pageEnter.emit();
    }
  }, [pathname, reveal]);

  // First load: the doors arrive closed from the server.
  useEffect(() => {
    let cancelled = false;
    const root = document.documentElement;
    (async () => {
      await document.fonts?.ready;
      if (cancelled || !doors.current) return;
      if (reducedMotion()) {
        doors.current.hide();
        root.removeAttribute("data-intro");
        phase.current = "idle";
        pageEnter.emit();
        return;
      }
      if (root.hasAttribute("data-intro")) {
        sessionStorage.setItem(INTRO_KEY, "1");
        await doors.current.intro();
        if (cancelled) return;
      }
      await reveal(true);
      root.removeAttribute("data-intro");
    })();
    return () => {
      cancelled = true;
    };
  }, [reveal]);

  const api = useMemo(() => ({ navigate, switchLang }), [navigate, switchLang]);

  return (
    <TransitionContext.Provider value={api}>
      {children}
      <Doors ref={doors} />
    </TransitionContext.Provider>
  );
}
