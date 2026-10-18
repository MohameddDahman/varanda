"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { a } from "@/content/admin";
import { cn } from "@/lib/cn";
import { moveProject, setProjectFlags } from "@/app/admin/actions";
import { AdminIcon } from "./AdminIcon";
import { useAdminLang } from "./AdminLang";
import { useToast } from "./Toaster";

export type AdminProjectRow = {
  id: Id<"projects">;
  title: string;
  subtitle: string;
  meta: string;
  published: boolean;
  featured: boolean;
  cover: { url: string; blurDataURL: string; focus?: string } | null;
};

/** Projects in site order, with quick switches and reordering; the title opens the editor. */
export function ProjectsAdminList({ rows }: { rows: AdminProjectRow[] }) {
  const { t } = useAdminLang();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [shown, change] = useOptimistic(rows, (list, update: { id: string; patch: Partial<AdminProjectRow> }) =>
    list.map((r) => (r.id === update.id ? { ...r, ...update.patch } : r)),
  );

  const report = (result: { ok: boolean; error?: string }) => {
    if (!result.ok) toast(t(a.errors[result.error as keyof typeof a.errors] ?? a.failed), "error");
  };
  const flag = (row: AdminProjectRow, patch: { published?: boolean; featured?: boolean }) =>
    start(async () => {
      change({ id: row.id, patch });
      report(await setProjectFlags(row.id, patch));
    });
  const move = (row: AdminProjectRow, direction: "up" | "down") => start(async () => report(await moveProject(row.id, direction)));

  return (
    <ol className={cn("mt-6 space-y-3", pending && "cursor-progress")}>
      {shown.map((row, i) => (
        <li key={row.id} className="adm-card flex flex-col sm:flex-row">
          <Link href={`/admin/projects/${row.id}`} className="group flex min-w-0 flex-1 items-center gap-4 p-3 hover:bg-paper/60">
            <span className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-paper-2 sm:w-32">
              {row.cover ? (
                <Image src={row.cover.url} alt="" fill sizes="128px" className="object-cover" placeholder="blur" blurDataURL={row.cover.blurDataURL} style={{ objectPosition: row.cover.focus }} />
              ) : (
                <AdminIcon name="image" className="absolute inset-0 m-auto text-ink-2" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold group-hover:underline">{row.title}</span>
              <span className="block truncate text-sm text-ink-2" dir="auto">
                {row.subtitle}
              </span>
              <span className="mt-1 block text-xs text-ink-2">{row.meta}</span>
              <span className="mt-2 flex flex-wrap gap-1.5">
                <span className={cn("adm-pill", row.published ? "adm-pill-live" : "adm-pill-draft")}>{t(row.published ? a.projects.published : a.projects.draft)}</span>
                {row.featured && <span className="adm-pill adm-pill-new">{t(a.projects.featured)}</span>}
              </span>
            </span>
          </Link>

          <div className="flex items-center justify-between gap-1 border-t border-[var(--line)] px-1 sm:flex-col sm:justify-center sm:border-t-0 sm:border-s sm:px-2">
            <div className="flex sm:flex-col">
              <button type="button" className="adm-icon-btn" disabled={i === 0 || pending} onClick={() => move(row, "up")} aria-label={`${t(a.projects.moveUp)}: ${row.title}`}>
                <AdminIcon name="up" />
              </button>
              <button type="button" className="adm-icon-btn" disabled={i === shown.length - 1 || pending} onClick={() => move(row, "down")} aria-label={`${t(a.projects.moveDown)}: ${row.title}`}>
                <AdminIcon name="down" />
              </button>
            </div>
            <div className="flex sm:flex-col">
              <button
                type="button"
                className={cn("adm-icon-btn", row.published && "text-navy-900")}
                aria-pressed={row.published}
                onClick={() => flag(row, { published: !row.published })}
                aria-label={`${t(a.projects.publish)}: ${row.title}`}
                title={t(a.projects.publish)}
              >
                <AdminIcon name={row.published ? "eye" : "eyeOff"} />
              </button>
              <button
                type="button"
                className={cn("adm-icon-btn", row.featured && "text-red")}
                aria-pressed={row.featured}
                onClick={() => flag(row, { featured: !row.featured })}
                aria-label={`${t(a.projects.feature)}: ${row.title}`}
                title={t(a.projects.feature)}
              >
                <AdminIcon name="star" className={cn(row.featured && "fill-current")} />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
