import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { a } from "@/content/admin";
import { adminQuery, getAdminLang } from "@/lib/admin/server";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const lang = await getAdminLang();
  const { id } = await params;
  // A malformed id fails Convex's validation; treat it like a deleted project.
  const p = await adminQuery(api.admin.projects.get, { id: id as Id<"projects"> }).catch(() => null);

  if (!p) {
    return (
      <>
        <Link href="/admin/projects" className="-ms-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-ink-2 hover:text-ink">
          <AdminIcon name="back" className="h-4 w-4" />
          {a.projects.heading[lang]}
        </Link>
        <p className="adm-card mt-4 px-4 py-10 text-center text-ink-2">{a.editor.notFound[lang]}</p>
      </>
    );
  }

  return (
    <ProjectEditor
      // A fresh editor per project, so state never leaks between them.
      key={p._id}
      initial={{
        id: p._id,
        slug: p.slug,
        title: p.title,
        type: p.type,
        year: p.year,
        location: p.location ?? { en: "", ar: "" },
        summary: p.summary,
        body: p.body.length ? p.body : [{ en: "", ar: "" }],
        systems: p.systems,
        published: p.published,
        featured: p.featured,
        photos: p.photos.map((ph) => ({ id: ph._id, url: ph.url, width: ph.width, height: ph.height, blurDataURL: ph.blurDataURL, alt: ph.alt, focus: ph.focus })),
      }}
    />
  );
}
