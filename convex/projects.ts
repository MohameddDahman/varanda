import { query } from "./_generated/server";
import { resolvePhotos } from "./lib/photos";

/** Published projects for the site, in the admin's order. Drafts and projects without photos are left out. */
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").withIndex("by_order").collect();
    const out = [];
    for (const p of projects) {
      if (!p.published) continue;
      const photos = await resolvePhotos(ctx, p.photos);
      if (!photos.length) continue;
      out.push({
        slug: p.slug,
        title: p.title,
        type: p.type,
        year: p.year,
        location: p.location ?? null,
        summary: p.summary,
        body: p.body,
        systems: p.systems,
        featured: p.featured,
        photos,
      });
    }
    return out;
  },
});
