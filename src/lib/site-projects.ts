import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { featuredProjects, projects, type SiteProject } from "@/content/projects";
import { photos, type Photo } from "@/content/photos";
import { systems, type SystemSlug } from "@/content/systems";

/** Cache tag the admin expires whenever projects or their photos change. */
export const PROJECTS_TAG = "projects";

/** The projects written in src/content/projects.ts. */
function fromCode(): SiteProject[] {
  return projects.map(({ cover, gallery, ...p }) => ({
    ...p,
    featured: featuredProjects.includes(p.slug),
    cover: photos[cover],
    gallery: gallery.map((key) => photos[key]),
  }));
}

type Row = FunctionReturnType<typeof api.projects.listPublished>[number];

const toPhoto = (p: Row["photos"][number]): Photo => ({
  src: { src: p.url, width: p.width, height: p.height, blurDataURL: p.blurDataURL },
  alt: p.alt,
  focus: p.focus,
});

const knownSystems = new Set<string>(systems.map((s) => s.slug));

// Static until an admin saves: their server actions expire PROJECTS_TAG.
const fromDatabase = unstable_cache(
  async (): Promise<SiteProject[]> => {
    const rows = await fetchQuery(api.projects.listPublished, {});
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      type: r.type,
      year: r.year,
      location: r.location,
      summary: r.summary,
      body: r.body,
      systems: r.systems.filter((s): s is SystemSlug => knownSystems.has(s)),
      featured: r.featured,
      cover: toPhoto(r.photos[0]),
      gallery: r.photos.slice(1).map(toPhoto),
    }));
  },
  ["site-projects"],
  { tags: [PROJECTS_TAG] },
);

/**
 * Published projects in site order: from the database once it's connected and holds any,
 * otherwise from the code. A database error falls back to the code too, so the site never breaks.
 */
export const getSiteProjects = cache(async (): Promise<SiteProject[]> => {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return fromCode();
  try {
    const list = await fromDatabase();
    return list.length ? list : fromCode();
  } catch (error) {
    console.error("Projects: the database didn't answer, so the built-in list is shown.", error);
    return fromCode();
  }
});

export async function getSiteProject(slug: string) {
  return (await getSiteProjects()).find((p) => p.slug === slug);
}

/** The projects stacked on the home page: the first four marked as featured. */
export async function getFeaturedProjects() {
  return (await getSiteProjects()).filter((p) => p.featured).slice(0, 4);
}
