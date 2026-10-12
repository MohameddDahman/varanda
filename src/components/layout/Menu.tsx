"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { nav, site, ui } from "@/content/site";
import { useLang } from "@/components/providers/LangProvider";
import { TLink } from "@/components/transition/TLink";
import { LangSwitch } from "./LangSwitch";
import { scroller } from "@/components/transition/store";

/**
 * Small-screen menu. It rolls down like a roller shutter — slats and all —
 * then the links rise into place.
 */
export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, href } = useLang();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(root.current, { visibility: "visible" })
        .fromTo(
          root.current,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "door" },
        )
        .fromTo(
          "[data-menu-item]",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, stagger: 0.05, ease: "lift" },
          0.35,
        )
        .fromTo("[data-menu-foot]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.6);
    },
    { scope: root },
  );

  useEffect(() => {
    const t1 = tl.current;
    if (!t1) return;
    if (open) {
      scroller.lenis?.stop();
      t1.timeScale(1).play();
      const first = root.current?.querySelector<HTMLElement>("a, button");
      window.setTimeout(() => first?.focus(), 300);
    } else {
      scroller.lenis?.start();
      t1.timeScale(1.6).reverse();
    }
  }, [open]);

  // Escape closes; Tab stays inside the open menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !root.current) return;
      const items = root.current.querySelectorAll<HTMLElement>("a, button");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={root}
      id="site-menu"
      className="site-menu theme-deep"
      role="dialog"
      aria-modal="true"
      aria-label={t(ui.menu)}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="site-menu-slats" aria-hidden="true" />
      <div className="wrap flex min-h-full flex-col justify-between pt-[calc(var(--header-h)+2rem)] pb-8">
        <nav aria-label={t(ui.menu)}>
          <ul className="flex flex-col gap-1">
            {[{ key: "home", href: "/", label: ui.home }, ...nav].map((n) => (
              <li key={n.key} className="overflow-hidden">
                <TLink
                  href={href(n.href)}
                  data-menu-item
                  className="menu-link t-display block py-1"
                  aria-current={pathname === href(n.href) ? "page" : undefined}
                  // Other pages: the doors close over the menu and the route
                  // change folds it away unseen. Same page: just close it.
                  onClick={() => pathname === href(n.href) && onClose()}
                >
                  {t(n.label)}
                </TLink>
              </li>
            ))}
          </ul>
        </nav>
        <div data-menu-foot className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-[var(--line)] pt-6">
          <p className="t-label text-mist">
            {t(site.tagline).replace(".", "")}
            <span className="dot">.</span>
          </p>
          <LangSwitch className="t-label text-white underline-offset-4 hover:underline" />
        </div>
      </div>
    </div>
  );
}
