import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { a } from "@/content/admin";
import { cn } from "@/lib/cn";
import { adminQuery, getAdminLang } from "@/lib/admin/server";
import { timeAgo } from "@/lib/admin/format";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const metadata: Metadata = { title: "Overview" };

/** First screen: what needs attention now, and a way into everything else. */
export default async function OverviewPage() {
  const lang = await getAdminLang();
  const data = await adminQuery(api.admin.overview.get, {});
  const stats = [
    { label: a.overview.newRequests, value: data.requests.new, href: "/admin/requests?status=new", accent: data.requests.new > 0 },
    { label: a.overview.last30, value: data.requests.last30, href: "/admin/requests" },
    { label: a.overview.published, value: data.projects.published, href: "/admin/projects" },
    { label: a.overview.drafts, value: data.projects.drafts, href: "/admin/projects" },
  ];

  return (
    <>
      <AutoRefresh />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold lg:text-3xl">{a.overview.heading[lang]}</h1>
        <Link href="/admin/projects/new" className="adm-btn adm-btn-dark">
          <AdminIcon name="plus" />
          {a.overview.addProject[lang]}
        </Link>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((s) => (
          <li key={s.label.en}>
            <Link href={s.href} className="adm-card group flex h-full flex-col p-4 transition-colors hover:border-[var(--line-strong)] lg:p-5">
              <span className="adm-hint">{s.label[lang]}</span>
              <span className={cn("mt-2 text-4xl font-light tabular-nums", s.accent && "text-red-deep")}>{s.value}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="adm-card mt-6" aria-labelledby="latest">
        <div className="flex items-center justify-between gap-3 px-4 pt-4 lg:px-6 lg:pt-5">
          <h2 id="latest" className="font-semibold">
            {a.overview.latest[lang]}
          </h2>
          <Link href="/admin/requests" className="inline-flex min-h-11 items-center gap-1 text-sm text-ink-2 hover:text-ink">
            {a.overview.allRequests[lang]}
            <AdminIcon name="next" className="h-4 w-4" />
          </Link>
        </div>
        {data.latest.length ? (
          <ul className="mt-1 divide-y divide-[var(--line)] border-t border-[var(--line)]">
            {data.latest.map((r) => (
              <li key={r._id}>
                <Link href={`/admin/requests/${r._id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-paper/70 lg:px-6">
                  <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
                  <span dir="ltr" className="text-sm text-ink-2">
                    {r.phone}
                  </span>
                  <span className="w-24 text-end text-xs text-ink-2">{timeAgo(r._creationTime, lang)}</span>
                  <span className={`adm-pill adm-pill-${r.status}`}>{a.status[r.status][lang]}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-hint px-4 pt-2 pb-5 lg:px-6">{a.overview.noRequests[lang]}</p>
        )}
      </section>
    </>
  );
}
