"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { ConvexError } from "convex/values";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { isLang, LANG_COOKIE, type L } from "@/i18n/config";
import { featuredProjects, projects as codeProjects, type ProjectType } from "@/content/projects";
import { photos as codePhotos } from "@/content/photos";
import { PROJECTS_TAG } from "@/lib/site-projects";
import { CONTENT_TAG } from "@/lib/site-content";
import { isOriginal, validContent } from "@/content/editable";
import { ADMIN_COOKIE, adminConfigured, createSessionValue, passwordMatches, SESSION_SECONDS } from "@/lib/admin/session";
import { adminMutation, adminQuery, requireAdmin } from "@/lib/admin/server";

export type Result<T = null> = { ok: true; value: T } | { ok: false; error: string };

/** Runs an admin change; Convex error codes come back as `error`, anything else as "failed". */
async function attempt<T>(run: () => Promise<T>): Promise<Result<T>> {
  await requireAdmin();
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    if (error instanceof ConvexError && typeof error.data === "string") return { ok: false, error: error.data };
    console.error("Admin action failed:", error);
    return { ok: false, error: "failed" };
  }
}

/** After any project change: the site's project pages and the dashboard pick it up. */
function projectsChanged() {
  updateTag(PROJECTS_TAG);
  revalidatePath("/admin", "layout");
}

// ─── Session ──────────────────────────────────────────────────────────────

export type SignInState = { status: "idle" | "wrong" | "locked" | "not-set-up" | "failed"; minutes?: number };

/** A hash of the client's address, so attempts are counted without storing the address. */
async function clientKey() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`varanda-login:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  if (!adminConfigured()) return { status: "not-set-up" };
  const key = await clientKey();
  try {
    const gate = await adminMutation(api.admin.auth.attempt, { key, outcome: "check" });
    if (!gate.allowed) return { status: "locked", minutes: Math.ceil(gate.retryInSeconds / 60) };

    if (!(await passwordMatches(String(form.get("password") ?? "")))) {
      const after = await adminMutation(api.admin.auth.attempt, { key, outcome: "failed" });
      return after.allowed ? { status: "wrong" } : { status: "locked", minutes: Math.ceil(after.retryInSeconds / 60) };
    }
    await adminMutation(api.admin.auth.attempt, { key, outcome: "succeeded" });
  } catch (error) {
    console.error("Sign-in failed:", error);
    return { status: "failed" };
  }

  (await cookies()).set(ADMIN_COOKIE, await createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  redirect("/admin");
}

export async function signOut() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/** The dashboard follows the site's language cookie, so the choice carries over. */
export async function setLanguage(lang: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/admin", "layout");
}

// ─── Requests ─────────────────────────────────────────────────────────────

export async function updateRequest(id: Id<"inquiries">, patch: { status?: "new" | "contacted" | "closed"; note?: string }) {
  const result = await attempt(() => adminMutation(api.admin.inquiries.update, { id, ...patch }));
  revalidatePath("/admin", "layout");
  return result;
}

export async function deleteRequest(id: Id<"inquiries">) {
  const result = await attempt(() => adminMutation(api.admin.inquiries.remove, { id }));
  if (result.ok) {
    revalidatePath("/admin", "layout");
    redirect("/admin/requests");
  }
  return result;
}

// ─── Projects ─────────────────────────────────────────────────────────────

export type ProjectInput = {
  id?: Id<"projects">;
  slug: string;
  title: L;
  type: ProjectType;
  year: number;
  location?: L;
  summary: L;
  body: L[];
  systems: string[];
  published: boolean;
  featured: boolean;
  /** In order; the first is the cover. */
  photos: { id: Id<"photos">; alt: L; focus?: string }[];
  /** Photos taken out in the editor, deleted on save. */
  removed: Id<"photos">[];
};

export async function saveProject(input: ProjectInput) {
  const result = await attempt(async () => {
    const { id, photos, removed, ...fields } = input;
    for (const p of photos) await adminMutation(api.admin.photos.update, { id: p.id, alt: p.alt, focus: p.focus ?? "" });
    const data = { ...fields, photos: photos.map((p) => p.id) };
    const saved = id ?? (await adminMutation(api.admin.projects.create, data));
    if (id) await adminMutation(api.admin.projects.update, { id, ...data });
    for (const photoId of removed) await adminMutation(api.admin.photos.remove, { id: photoId });
    return saved;
  });
  if (result.ok) projectsChanged();
  return result;
}

export async function setProjectFlags(id: Id<"projects">, flags: { published?: boolean; featured?: boolean }) {
  const result = await attempt(() => adminMutation(api.admin.projects.setFlags, { id, ...flags }));
  if (result.ok) projectsChanged();
  return result;
}

export async function moveProject(id: Id<"projects">, direction: "up" | "down") {
  const result = await attempt(() => adminMutation(api.admin.projects.move, { id, direction }));
  if (result.ok) projectsChanged();
  return result;
}

export async function deleteProject(id: Id<"projects">) {
  const result = await attempt(() => adminMutation(api.admin.projects.remove, { id }));
  if (result.ok) {
    projectsChanged();
    redirect("/admin/projects");
  }
  return result;
}

/** A one-time upload URL; the browser sends the resized file straight to storage. */
export async function getUploadUrl() {
  return attempt(() => adminMutation(api.admin.photos.generateUploadUrl, {}));
}

/** Records an uploaded file as a photo of the project, straight away. */
export async function addPhoto(project: Id<"projects">, photo: { storageId: Id<"_storage">; width: number; height: number; blurDataURL: string; alt: L }) {
  const result = await attempt(async () => {
    const id = await adminMutation(api.admin.photos.create, photo);
    await adminMutation(api.admin.projects.addPhotos, { id: project, photos: [id] });
    return { id };
  });
  if (result.ok) projectsChanged();
  return result;
}

/**
 * Copies one project written in the code (src/content/projects.ts), with its photos, into the
 * database. Skips projects already there, so it can be re-run.
 */
export async function importSiteProject(slug: string) {
  const result = await attempt(async () => {
    const project = codeProjects.find((p) => p.slug === slug);
    if (!project) throw new ConvexError("not-found");
    const existing = await adminQuery(api.admin.projects.list, {});
    if (existing.some((p) => p.slug === slug)) return "skipped" as const;

    // The photos are the site's own static files; fetch them from this server.
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    const ids: Id<"photos">[] = [];
    for (const key of [project.cover, ...project.gallery]) {
      const photo = codePhotos[key];
      const file = await fetch(new URL(photo.src.src, origin));
      if (!file.ok) throw new Error(`Couldn't read ${photo.src.src}: ${file.status}`);
      const uploadUrl = await adminMutation(api.admin.photos.generateUploadUrl, {});
      const upload = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.headers.get("content-type") ?? "image/jpeg" },
        body: await file.arrayBuffer(),
      });
      if (!upload.ok) throw new Error(`Upload failed: ${upload.status}`);
      const { storageId } = (await upload.json()) as { storageId: Id<"_storage"> };
      ids.push(
        await adminMutation(api.admin.photos.create, {
          storageId,
          width: photo.src.width,
          height: photo.src.height,
          blurDataURL: photo.src.blurDataURL ?? "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
          alt: photo.alt,
          ...(photo.focus ? { focus: photo.focus } : {}),
        }),
      );
    }
    await adminMutation(api.admin.projects.create, {
      slug: project.slug,
      title: project.title,
      type: project.type,
      year: project.year,
      ...(project.location ? { location: project.location } : {}),
      summary: project.summary,
      body: project.body,
      systems: project.systems,
      photos: ids,
      published: true,
      featured: featuredProjects.includes(project.slug),
    });
    return "imported" as const;
  });
  if (result.ok) projectsChanged();
  return result;
}

// ─── Texts and contact details ────────────────────────────────────────────

export type ContentChange = { path: string; value: unknown };

/**
 * Saves changed texts or contact details. Each is checked against what that spot of the site
 * accepts; a value equal to the original drops the change, so the site shows the code's text.
 */
export async function saveContent(changes: ContentChange[]) {
  const result = await attempt(async () => {
    if (!Array.isArray(changes) || changes.length > 3000) throw new ConvexError("invalid-content");
    const next: Record<string, unknown> = { ...(await fetchQuery(api.content.get, {})) };
    for (const { path, value } of changes) {
      if (typeof path !== "string" || !validContent(path, value)) throw new ConvexError("invalid-content");
      if (isOriginal(path, value)) delete next[path];
      else next[path] = value;
    }
    await adminMutation(api.admin.content.save, { values: Object.entries(next).map(([path, value]) => ({ path, value })) });
  });
  if (result.ok) {
    updateTag(CONTENT_TAG);
    revalidatePath("/admin", "layout");
  }
  return result;
}
