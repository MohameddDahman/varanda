import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { a, fill } from "@/content/admin";
import { projects as codeProjects, projectTypes } from "@/content/projects";
import { adminQuery, getAdminLang } from "@/lib/admin/server";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ImportProjects } from "@/components/admin/ImportProjects";
import { ProjectsAdminList, type AdminProjectRow } from "@/components/admin/ProjectsAdminList";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsAdminPage() {
  const lang = await getAdminLang();
  const list = await adminQuery(api.admin.projects.list, {});
  const other = lang === "ar" ? "en" : "ar";
  const rows: AdminProjectRow[] = list.map((p) => ({
    id: p._id,
    title: p.title[lang] || p.title.en,
    subtitle: p.title[other],
    meta: `${projectTypes[p.type][lang]} · ${p.year} · ${p.photoCount} ${a.projects.photos[lang]}`,
    published: p.published,
    featured: p.featured,
    cover: p.cover && { url: p.cover.url, blurDataURL: p.cover.blurDataURL, focus: p.cover.focus },
  }));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold lg:text-3xl">{a.projects.heading[lang]}</h1>
          <p className="adm-hint mt-1">{a.projects.intro[lang]}</p>
        </div>
        <Link href="/admin/projects/new" className="adm-btn adm-btn-primary">
          <AdminIcon name="plus" />
          {a.projects.add[lang]}
        </Link>
      </div>

      {rows.length ? (
        <ProjectsAdminList rows={rows} />
      ) : (
        <section className="adm-card mt-6 p-5 sm:p-8">
          <h2 className="text-lg font-semibold">{a.projects.empty[lang]}</h2>
          <p className="adm-hint mt-1.5 max-w-prose">{fill(a.projects.usingCode[lang], { n: codeProjects.length })}</p>
          <p className="adm-hint mt-1 max-w-prose">{a.projects.importHint[lang]}</p>
          <ImportProjects slugs={codeProjects.map((p) => p.slug)} />
        </section>
      )}
    </>
  );
}
