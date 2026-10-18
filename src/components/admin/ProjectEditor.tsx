"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Id } from "@convex/_generated/dataModel";
import type { L } from "@/i18n/config";
import { a } from "@/content/admin";
import { projectTypes, type ProjectType } from "@/content/projects";
import { systems } from "@/content/systems";
import { cn } from "@/lib/cn";
import { deleteProject, saveProject } from "@/app/admin/actions";
import { AdminIcon } from "./AdminIcon";
import { useAdminLang } from "./AdminLang";
import { ConfirmButton } from "./ConfirmDialog";
import { BilingualField, Section, Switch } from "./fields";
import { PhotoManager, type EditorPhoto } from "./PhotoManager";
import { useToast } from "./Toaster";

export type EditorProject = {
  id?: Id<"projects">;
  slug: string;
  title: L;
  type: ProjectType;
  year: number;
  location: L;
  summary: L;
  body: L[];
  systems: string[];
  published: boolean;
  featured: boolean;
  photos: EditorPhoto[];
};

const empty: EditorProject = {
  slug: "",
  title: { en: "", ar: "" },
  type: "residential",
  year: new Date().getFullYear(),
  location: { en: "", ar: "" },
  summary: { en: "", ar: "" },
  body: [{ en: "", ar: "" }],
  systems: [],
  published: false,
  featured: false,
  photos: [],
};

/** "Garden Villa, New Cairo" → "garden-villa-new-cairo". */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80);

/** Which part of the form a server error is about. */
const errorSection: Record<string, string> = {
  "invalid-slug": "basics",
  "slug-taken": "basics",
  "missing-title": "basics",
  "invalid-year": "basics",
  "missing-summary": "text",
  "needs-photo": "photos",
};

// What decides "unsaved": everything the save sends.
const snapshot = (p: EditorProject) =>
  JSON.stringify({ ...p, photos: p.photos.map((x) => ({ id: x.id, alt: x.alt, focus: x.focus })) });

export function ProjectEditor({ initial }: { initial: EditorProject | null }) {
  const { lang, t } = useAdminLang();
  const toast = useToast();
  const router = useRouter();
  const [project, setProject] = useState<EditorProject>(initial ?? empty);
  const [saved, setSaved] = useState(() => snapshot(initial ?? empty));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  // Photos attached to the project on the server: the ones it had, plus uploads since.
  const [attached, setAttached] = useState<Id<"photos">[]>(() => initial?.photos.map((p) => p.id) ?? []);
  const isNew = !project.id;
  const dirty = snapshot(project) !== saved;
  const removed = useMemo(() => attached.filter((id) => !project.photos.some((x) => x.id === id)), [attached, project.photos]);

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof EditorProject>(key: K, value: EditorProject[K]) => setProject((p) => ({ ...p, [key]: value }));
  const errorText = (code: string) => t(a.errors[code as keyof typeof a.errors] ?? a.failed);
  const sectionError = (section: string) => (error && errorSection[error] === section ? errorText(error) : null);

  const save = () =>
    startSave(async () => {
      setError(null);
      const p = project;
      const location = p.location.en.trim() || p.location.ar.trim() ? p.location : undefined;
      const result = await saveProject({
        id: p.id,
        slug: p.slug,
        title: p.title,
        type: p.type,
        year: Number(p.year) || 0,
        location,
        summary: p.summary,
        body: p.body,
        systems: p.systems,
        published: p.published,
        featured: p.featured,
        photos: p.photos.map((x) => ({ id: x.id, alt: x.alt, focus: x.focus })),
        removed,
      });
      if (!result.ok) {
        setError(result.error);
        toast(errorText(result.error), "error");
        document.getElementById(errorSection[result.error] ?? "")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      setSaved(snapshot(p));
      setAttached(p.photos.map((x) => x.id));
      toast(t(a.saved));
      // A new project opens in its own editor, where photos can be added.
      if (isNew) router.replace(`/admin/projects/${result.value}`);
      else router.refresh();
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-5"
    >
      <div>
        <Link href="/admin/projects" className="-ms-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-ink-2 hover:text-ink">
          <AdminIcon name="back" className="h-4 w-4" />
          {t(a.projects.heading)}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold break-words lg:text-3xl">{isNew ? t(a.editor.newHeading) : project.title[lang] || project.title.en}</h1>
      </div>

      <Section id="basics" title={t(a.editor.basics)} error={sectionError("basics")}>
        <BilingualField
          label={t(a.editor.title)}
          value={project.title}
          required
          maxLength={120}
          invalid={error === "missing-title"}
          onChange={(title) =>
            setProject((p) => ({ ...p, title, ...(slugTouched ? {} : { slug: slugify(title.en) }) }))
          }
        />
        <div>
          <label htmlFor="slug" className="adm-label">
            {t(a.editor.slug)}
          </label>
          <div dir="ltr" className="flex items-stretch">
            <span className="hidden items-center border border-e-0 border-[var(--line-strong)] bg-paper px-3 text-sm text-ink-2 sm:flex">/{lang}/projects/</span>
            <input
              id="slug"
              value={project.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              required
              maxLength={80}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              aria-invalid={error === "invalid-slug" || error === "slug-taken" ? true : undefined}
              aria-describedby="slug-hint"
              className="adm-input"
            />
          </div>
          <p id="slug-hint" className="adm-hint mt-1.5">
            {t(a.editor.slugHint)}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="adm-label">
              {t(a.editor.type)}
            </label>
            <select id="type" value={project.type} onChange={(e) => set("type", e.target.value as ProjectType)} className="adm-input">
              {(Object.keys(projectTypes) as ProjectType[]).map((key) => (
                <option key={key} value={key}>
                  {t(projectTypes[key])}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="adm-label">
              {t(a.editor.year)}
            </label>
            <input
              id="year"
              type="number"
              inputMode="numeric"
              min={1990}
              max={new Date().getFullYear() + 1}
              value={project.year || ""}
              onChange={(e) => set("year", Number(e.target.value))}
              required
              aria-invalid={error === "invalid-year" ? true : undefined}
              className="adm-input"
            />
          </div>
        </div>
        <BilingualField label={t(a.editor.location)} value={project.location} optional maxLength={120} onChange={(location) => set("location", location)} />
      </Section>

      <Section id="text" title={t(a.editor.text)} error={sectionError("text")}>
        <div>
          <BilingualField label={t(a.editor.summary)} value={project.summary} multiline rows={3} maxLength={400} invalid={error === "missing-summary"} onChange={(summary) => set("summary", summary)} />
          <p className="adm-hint mt-1.5">{t(a.editor.summaryHint)}</p>
        </div>
        {project.body.map((para, i) => (
          <div key={i} className="relative">
            <BilingualField
              label={`${t(a.editor.paragraph)} ${i + 1}`}
              value={para}
              multiline
              rows={4}
              maxLength={2000}
              onChange={(value) => set("body", project.body.map((p, j) => (j === i ? value : p)))}
            />
            <button
              type="button"
              className="adm-icon-btn absolute -top-3 end-0 hover:text-red-deep"
              onClick={() => set("body", project.body.filter((_, j) => j !== i))}
              aria-label={`${t(a.editor.removeParagraph)} ${i + 1}`}
            >
              <AdminIcon name="trash" />
            </button>
          </div>
        ))}
        {project.body.length < 10 && (
          <button type="button" className="adm-btn adm-btn-outline" onClick={() => set("body", [...project.body, { en: "", ar: "" }])}>
            <AdminIcon name="plus" />
            {t(a.editor.addParagraph)}
          </button>
        )}
      </Section>

      <Section id="systems" title={t(a.editor.systems)}>
        <div className="grid gap-2 sm:grid-cols-2">
          {systems.map((s) => {
            const on = project.systems.includes(s.slug);
            return (
              <label key={s.slug} className={cn("flex min-h-11 items-center gap-3 border px-3 py-2", on ? "border-navy-900 bg-paper" : "border-[var(--line-strong)]")}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => set("systems", on ? project.systems.filter((x) => x !== s.slug) : [...project.systems, s.slug])}
                  className="h-5 w-5 accent-navy-900"
                />
                {t(s.name)}
              </label>
            );
          })}
        </div>
      </Section>

      <Section id="photos" title={t(a.editor.photos)} hint={t(isNew ? a.editor.saveFirst : a.editor.photosHint)} error={sectionError("photos")}>
        {project.id && (
          <PhotoManager
            project={project.id}
            photos={project.photos}
            invalid={error === "needs-photo"}
            onChange={(photos) => set("photos", photos)}
            onUploaded={(photo) => {
              setProject((p) => ({ ...p, photos: [...p.photos, photo] }));
              setAttached((ids) => [...ids, photo.id]);
              // Already attached on the server, so it isn't an unsaved change.
              setSaved((s) => {
                const parsed = JSON.parse(s) as EditorProject;
                return JSON.stringify({ ...parsed, photos: [...parsed.photos, { id: photo.id, alt: photo.alt, focus: photo.focus }] });
              });
            }}
          />
        )}
      </Section>

      <Section id="visibility" title={t(a.editor.visibility)}>
        <Switch label={t(a.projects.publish)} checked={project.published} onChange={(on) => set("published", on)} />
        <Switch label={t(a.projects.feature)} hint={t(a.projects.featureHint)} checked={project.featured} onChange={(on) => set("featured", on)} />
      </Section>

      {!isNew && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {initial?.published && (
            <a href={`/${lang}/projects/${initial.slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost">
              <AdminIcon name="external" />
              {t(a.editor.viewOnSite)}
            </a>
          )}
          <ConfirmButton
            label={t(a.editor.deleteProject)}
            question={t(a.editor.deleteConfirm)}
            confirmLabel={t(a.delete)}
            disabled={deleting}
            onConfirm={() =>
              startDelete(async () => {
                const result = await deleteProject(project.id!);
                if (!result.ok) toast(errorText(result.error), "error");
              })
            }
          />
        </div>
      )}

      {/* Save stays in reach while scrolling: above the tab bar on phones. */}
      <div className="sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+0.75rem)] z-10 lg:bottom-6">
        <div className="flex items-center justify-between gap-3 border border-[var(--line)] bg-white/95 p-2 ps-4 shadow-[0_8px_30px_rgb(4_12_23/0.12)] backdrop-blur-md">
          <span className={cn("text-sm", dirty ? "font-medium text-red-deep" : "text-ink-2")} aria-live="polite">
            {dirty ? t(a.editor.unsaved) : t(a.saved)}
          </span>
          <button type="submit" disabled={saving || (!dirty && !isNew)} className="adm-btn adm-btn-primary min-w-32">
            {t(saving ? a.saving : a.save)}
          </button>
        </div>
      </div>
    </form>
  );
}
