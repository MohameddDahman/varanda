"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { nav, ui } from "@/content/site";
import { useLang } from "@/components/providers/LangProvider";
import { TLink } from "@/components/transition/TLink";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";
import { LangSwitch } from "./LangSwitch";
import { Menu } from "./Menu";

export function Header() {
  const { lang, t, href } = useLang();
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so any navigation closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean | ((v: boolean) => boolean)) =>
    setMenuPath((current) => {
      const next = typeof open === "function" ? open(current === pathname) : open;
      return next ? pathname : null;
    });
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = header.current;
    if (!el) return;
    let lastY = window.scrollY;
    let raf = 0;

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      if (goingDown && y > 160) el.dataset.hidden = "true";
      else if (goingUp || y < 160) el.dataset.hidden = "false";
      el.dataset.scrolled = y > 24 ? "true" : "false";
      lastY = y;

      // Match the colour of whatever section sits under the header.
      const host = document
        .elementsFromPoint(window.innerWidth / 2, 34)
        .find((node) => !el.contains(node) && node.closest("[data-header]"))
        ?.closest<HTMLElement>("[data-header]");
      el.dataset.theme = host?.dataset.header ?? "light";
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    const settle = window.setTimeout(update, 1400); // after the doors open
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  const isActive = (to: string) => pathname === href(to) || pathname.startsWith(`${href(to)}/`);

  return (
    <>
      <header
        ref={header}
        className="site-header"
        data-theme="dark"
        data-hidden="false"
        data-scrolled="false"
        data-menu={menuOpen ? "open" : "closed"}
      >
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
          <TLink href={href("/")} aria-label={`VARANDA — ${t(ui.home)}`} className="header-logo flex shrink-0 items-center text-[1.05rem] sm:text-[1.15rem]">
            <Logo />
          </TLink>

          {/* Kept to the end so it never sits on the hero's centre stile. */}
          <nav aria-label={lang === "ar" ? "القائمة الرئيسية" : "Main"} className="ms-auto me-[calc(clamp(1.5rem,2.6vw,2.75rem)-1.5rem)] hidden lg:block">
            <ul className="flex items-center gap-[clamp(1.5rem,2.6vw,2.75rem)]">
              {nav
                .filter((n) => n.key !== "contact")
                .map((n) => (
                  <li key={n.key}>
                    <TLink
                      href={href(n.href)}
                      className={cn("header-link", isActive(n.href) && "is-active")}
                      aria-current={isActive(n.href) ? "page" : undefined}
                    >
                      {t(n.label)}
                    </TLink>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <LangSwitch className="header-lang" />
            <TLink href={href("/contact")} className="btn btn-header hidden sm:inline-flex">
              {t(ui.bookVisit)}
            </TLink>
            <button
              ref={menuButton}
              type="button"
              className="menu-button lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="sr-only">{menuOpen ? t(ui.close) : t(ui.menu)}</span>
              <span className="menu-button-lines" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>
      <Menu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          menuButton.current?.focus();
        }}
      />
    </>
  );
}
