"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { a } from "@/content/admin";
import { cn } from "@/lib/cn";
import { setLanguage, signOut } from "@/app/admin/actions";
import { Logo, VMark } from "@/components/brand/Logo";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import { useAdminLang } from "./AdminLang";

type Item = { href: string; icon: AdminIconName; label: { en: string; ar: string }; badge?: number };

/**
 * The dashboard frame. Desktop: a navy sidebar. Phones and tablets: a slim top bar and a bottom
 * tab bar within thumb reach. New requests are counted on the Requests item in both.
 */
export function AdminShell({ newRequests, children }: { newRequests: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, t } = useAdminLang();
  const [switching, startSwitch] = useTransition();
  const items: Item[] = [
    { href: "/admin", icon: "overview", label: a.nav.overview },
    { href: "/admin/requests", icon: "requests", label: a.nav.requests, badge: newRequests },
    { href: "/admin/projects", icon: "projects", label: a.nav.projects },
    { href: "/admin/contact", icon: "contact", label: a.nav.contact },
    { href: "/admin/texts", icon: "texts", label: a.nav.texts },
  ];
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const otherLang = lang === "ar" ? "en" : "ar";
  const switchLanguage = () => startSwitch(() => setLanguage(otherLang));
  const siteHref = `/${lang}`;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col bg-navy-900 text-white lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-6 pt-7 pb-8" aria-label={t(a.title)}>
          <Logo className="text-[1.35rem] text-white" />
        </Link>
        <nav aria-label={t(a.title)} className="flex flex-col gap-1 px-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 px-3 text-[0.9375rem] transition-colors",
                active(item.href) ? "bg-white/10 text-white" : "text-mist hover:bg-white/5 hover:text-white",
              )}
            >
              <AdminIcon name={item.icon} />
              <span className="flex-1">{t(item.label)}</span>
              {!!item.badge && <span className="adm-badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-white/10 px-3 py-4">
          <a href={siteHref} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-3 px-3 text-sm text-mist hover:bg-white/5 hover:text-white">
            <AdminIcon name="external" />
            {t(a.viewSite)}
          </a>
          <button type="button" onClick={switchLanguage} disabled={switching} lang={otherLang} className="flex min-h-11 items-center gap-3 px-3 text-sm text-mist hover:bg-white/5 hover:text-white" aria-label={t(a.languageLabel)}>
            <AdminIcon name="globe" />
            {t(a.language)}
          </button>
          <form action={signOut}>
            <button type="submit" className="flex min-h-11 w-full items-center gap-3 px-3 text-sm text-mist hover:bg-white/5 hover:text-white">
              <AdminIcon name="signOut" />
              {t(a.signOut)}
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Phone and tablet top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--line)] bg-white/95 ps-4 pe-1 backdrop-blur-md lg:hidden">
          <Link href="/admin" className="flex items-center gap-2.5" aria-label={t(a.title)}>
            <VMark className="h-6 w-auto" />
            <span className="text-sm font-semibold tracking-wide">{t(a.title)}</span>
          </Link>
          <div className="flex items-center">
            <a href={siteHref} target="_blank" rel="noreferrer" className="adm-icon-btn" aria-label={t(a.viewSite)}>
              <AdminIcon name="external" />
            </a>
            <button type="button" onClick={switchLanguage} disabled={switching} className="adm-icon-btn text-sm font-semibold" lang={otherLang} aria-label={t(a.languageLabel)}>
              {lang === "ar" ? "EN" : "ع"}
            </button>
            <form action={signOut}>
              <button type="submit" className="adm-icon-btn" aria-label={t(a.signOut)}>
                <AdminIcon name="signOut" />
              </button>
            </form>
          </div>
        </header>

        <main id="main" className="px-4 pt-5 pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+2rem)] sm:px-6 lg:px-10 lg:pt-10 lg:pb-14">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Phone and tablet tab bar */}
      <nav className="adm-tabbar lg:hidden" aria-label={t(a.title)}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="adm-tab" aria-current={active(item.href) ? "page" : undefined}>
            <span className="relative">
              <AdminIcon name={item.icon} className="h-6 w-6" />
              {!!item.badge && <span className="adm-badge absolute -top-1.5 -end-3">{item.badge}</span>}
            </span>
            {t(item.label)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
