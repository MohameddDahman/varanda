"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { a } from "@/content/admin";
import { cn } from "@/lib/cn";
import { AdminIcon } from "./AdminIcon";
import { useAdminLang } from "./AdminLang";

export type StatusFilter = "all" | "new" | "contacted" | "closed";

export type RequestRow = {
  id: string;
  name: string;
  phone: string;
  status: "new" | "contacted" | "closed";
  project: string;
  area: string;
  systems: string[];
  hasNote: boolean;
  when: string;
  whenFull: string;
  /** Lowercased text the search box looks through. */
  search: string;
};

export function StatusPill({ status }: { status: RequestRow["status"] }) {
  const { t } = useAdminLang();
  return (
    <span className={`adm-pill adm-pill-${status}`}>
      {status === "new" && <span className="h-1.5 w-1.5 bg-red" aria-hidden="true" />}
      {t(a.status[status])}
    </span>
  );
}

/** The inbox: filter by status (kept in the URL), search as you type, open a request. */
export function RequestsList({ rows, initial }: { rows: RequestRow[]; initial: StatusFilter }) {
  const { t } = useAdminLang();
  const [filter, setFilter] = useState<StatusFilter>(initial);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const counts = { all: rows.length, new: 0, contacted: 0, closed: 0 };
  for (const r of rows) counts[r.status]++;

  const terms = deferred.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = rows.filter((r) => (filter === "all" || r.status === filter) && terms.every((term) => r.search.includes(term.replace(/[\s-]/g, "")) || r.search.includes(term)));

  const choose = (f: StatusFilter) => {
    setFilter(f);
    const url = new URL(window.location.href);
    if (f === "all") url.searchParams.delete("status");
    else url.searchParams.set("status", f);
    window.history.replaceState(null, "", url);
  };

  return (
    <>
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={t(a.requests.status)} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          {(["new", "contacted", "closed", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => choose(f)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 border px-4 text-sm font-medium transition-colors",
                filter === f ? "border-navy-900 bg-navy-900 text-white" : "border-[var(--line-strong)] bg-white text-ink-2 hover:border-ink hover:text-ink",
              )}
            >
              {f === "all" ? t(a.requests.all) : t(a.status[f])}
              <span className={cn("text-xs tabular-nums", filter === f ? "text-white/70" : "text-ink-2")}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <label className="relative block lg:w-80">
          <span className="sr-only">{t(a.requests.search)}</span>
          <AdminIcon name="search" className="pointer-events-none absolute inset-y-0 start-3 my-auto text-ink-2" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(a.requests.search)} className="adm-input ps-10" />
        </label>
      </div>

      {visible.length ? (
        <ul className="adm-card mt-4 divide-y divide-[var(--line)]">
          {visible.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/requests/${r.id}`}
                className="grid gap-x-4 gap-y-1.5 px-4 py-3.5 transition-colors hover:bg-paper/70 lg:grid-cols-[7rem_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.2fr)_7rem] lg:items-center lg:py-3"
              >
                <span className="flex items-center justify-between gap-3 lg:contents">
                  <span className="lg:order-1">
                    <StatusPill status={r.status} />
                  </span>
                  <time title={r.whenFull} className="text-xs text-ink-2 lg:order-5 lg:text-end lg:text-sm">
                    {r.when}
                  </time>
                </span>
                <span className="min-w-0 lg:order-2">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="truncate">{r.name}</span>
                    {r.hasNote && (
                      <>
                        <AdminIcon name="note" className="h-3.5 w-3.5 text-ink-2" />
                        <span className="sr-only">{t(a.requests.note)}</span>
                      </>
                    )}
                  </span>
                  {r.systems.length > 0 && <span className="mt-0.5 block truncate text-xs text-ink-2">{r.systems.join(" · ")}</span>}
                </span>
                <span dir="ltr" className="text-sm text-ink-2 rtl:text-end lg:order-3">
                  {r.phone}
                </span>
                <span className="truncate text-sm text-ink-2 lg:order-4">{[r.project, r.area].filter(Boolean).join(" · ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="adm-card mt-4 px-4 py-10 text-center text-ink-2">{terms.length ? t(a.requests.noMatch) : t(a.requests.empty)}</p>
      )}
    </>
  );
}
