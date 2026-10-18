import { ConvexError, v, type Infer } from "convex/values";
import { mutation, query, type MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { bilingual, projectType } from "../schema";
import { assertAdmin, tokenArg } from "../lib/admin";
import { resolvePhotos } from "../lib/photos";

const fields = {
  slug: v.string(),
  title: bilingual,
  type: projectType,
  year: v.number(),
  location: v.optional(bilingual),
  summary: bilingual,
  body: v.array(bilingual),
  systems: v.array(v.string()),
  photos: v.array(v.id("photos")),
  published: v.boolean(),
  featured: v.boolean(),
};
export const fieldsObject = v.object(fields);
type Fields = Infer<typeof fieldsObject>;
type Text = { en: string; ar: string };

const trim = (t: Text): Text => ({ en: t.en.trim(), ar: t.ar.trim() });
const tooLong = (t: Text, max: number) => t.en.length > max || t.ar.length > max;

/** Tidies the fields and enforces the rules the site depends on; throws a short error code. */
async function clean(ctx: MutationCtx, f: Fields, self?: Id<"projects">): Promise<Fields> {
  const slug = f.slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) throw new ConvexError("invalid-slug");
  const same = await ctx.db.query("projects").withIndex("by_slug", (i) => i.eq("slug", slug)).first();
  if (same && same._id !== self) throw new ConvexError("slug-taken");

  const title = trim(f.title);
  if (!title.en || !title.ar) throw new ConvexError("missing-title");
  const summary = trim(f.summary);
  const location = f.location && trim(f.location);
  const body = f.body.map(trim).filter((p) => p.en || p.ar);
  if (tooLong(title, 120) || tooLong(summary, 400) || (location && tooLong(location, 120)) || body.some((p) => tooLong(p, 2000))) {
    throw new ConvexError("too-long");
  }
  if (body.length > 10 || f.systems.length > 10 || f.photos.length > 40) throw new ConvexError("too-many");

  const year = Math.round(f.year);
  if (year < 1990 || year > new Date().getFullYear() + 1) throw new ConvexError("invalid-year");

  for (const id of f.photos) if (!(await ctx.db.get(id))) throw new ConvexError("photo-missing");
  if (f.published) {
    if (!f.photos.length) throw new ConvexError("needs-photo");
    if (!summary.en || !summary.ar) throw new ConvexError("missing-summary");
  }

  return {
    ...f,
    slug,
    title,
    summary,
    body,
    year,
    location: location && (location.en || location.ar) ? location : undefined,
    systems: [...new Set(f.systems)],
  };
}

/** Every project, drafts included, in site order, with its cover for the list. */
export const list = query({
  args: tokenArg,
  handler: async (ctx, { token }) => {
    assertAdmin(token);
    const projects = await ctx.db.query("projects").withIndex("by_order").collect();
    return await Promise.all(
      projects.map(async (p) => {
        const [cover] = await resolvePhotos(ctx, p.photos.slice(0, 1));
        return {
          _id: p._id,
          slug: p.slug,
          title: p.title,
          type: p.type,
          year: p.year,
          published: p.published,
          featured: p.featured,
          photoCount: p.photos.length,
          cover: cover ?? null,
        };
      }),
    );
  },
});

export const get = query({
  args: { ...tokenArg, id: v.id("projects") },
  handler: async (ctx, { token, id }) => {
    assertAdmin(token);
    const p = await ctx.db.get(id);
    if (!p) return null;
    return { ...p, photos: await resolvePhotos(ctx, p.photos) };
  },
});

export const create = mutation({
  args: { ...tokenArg, ...fields },
  handler: async (ctx, { token, ...f }) => {
    assertAdmin(token);
    const project = await clean(ctx, f);
    const last = await ctx.db.query("projects").withIndex("by_order").order("desc").first();
    return await ctx.db.insert("projects", { ...project, order: (last?.order ?? 0) + 1 });
  },
});

export const update = mutation({
  args: { ...tokenArg, id: v.id("projects"), ...fields },
  handler: async (ctx, { token, id, ...f }) => {
    assertAdmin(token);
    if (!(await ctx.db.get(id))) throw new ConvexError("not-found");
    await ctx.db.patch(id, await clean(ctx, f, id));
  },
});

/** Attaches freshly uploaded photos at once, so an upload is never lost to an unsaved form. */
export const addPhotos = mutation({
  args: { ...tokenArg, id: v.id("projects"), photos: v.array(v.id("photos")) },
  handler: async (ctx, { token, id, photos }) => {
    assertAdmin(token);
    const p = await ctx.db.get(id);
    if (!p) throw new ConvexError("not-found");
    for (const photoId of photos) if (!(await ctx.db.get(photoId))) throw new ConvexError("photo-missing");
    const next = [...p.photos, ...photos.filter((x) => !p.photos.includes(x))];
    if (next.length > 40) throw new ConvexError("too-many");
    await ctx.db.patch(id, { photos: next });
  },
});

/** Quick toggles from the list, without resending the whole project. */
export const setFlags = mutation({
  args: { ...tokenArg, id: v.id("projects"), published: v.optional(v.boolean()), featured: v.optional(v.boolean()) },
  handler: async (ctx, { token, id, published, featured }) => {
    assertAdmin(token);
    const p = await ctx.db.get(id);
    if (!p) throw new ConvexError("not-found");
    if (published && !p.photos.length) throw new ConvexError("needs-photo");
    if (published && (!p.summary.en.trim() || !p.summary.ar.trim())) throw new ConvexError("missing-summary");
    await ctx.db.patch(id, { ...(published !== undefined ? { published } : {}), ...(featured !== undefined ? { featured } : {}) });
  },
});

/** Swaps the project with its neighbour in site order. */
export const move = mutation({
  args: { ...tokenArg, id: v.id("projects"), direction: v.union(v.literal("up"), v.literal("down")) },
  handler: async (ctx, { token, id, direction }) => {
    assertAdmin(token);
    const p = await ctx.db.get(id);
    if (!p) throw new ConvexError("not-found");
    const neighbour = await ctx.db
      .query("projects")
      .withIndex("by_order", (i) => (direction === "up" ? i.lt("order", p.order) : i.gt("order", p.order)))
      .order(direction === "up" ? "desc" : "asc")
      .first();
    if (!neighbour) return;
    await ctx.db.patch(p._id, { order: neighbour.order });
    await ctx.db.patch(neighbour._id, { order: p.order });
  },
});

/** Deletes the project with its photos and their files. */
export const remove = mutation({
  args: { ...tokenArg, id: v.id("projects") },
  handler: async (ctx, { token, id }) => {
    assertAdmin(token);
    const p = await ctx.db.get(id);
    if (!p) return;
    const others = (await ctx.db.query("projects").collect()).filter((o) => o._id !== id);
    for (const photoId of p.photos) {
      if (others.some((o) => o.photos.includes(photoId))) continue;
      const photo = await ctx.db.get(photoId);
      if (photo) {
        await ctx.storage.delete(photo.storageId);
        await ctx.db.delete(photoId);
      }
    }
    await ctx.db.delete(id);
  },
});
