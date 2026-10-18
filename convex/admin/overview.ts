import { query } from "../_generated/server";
import { assertAdmin, tokenArg } from "../lib/admin";

const DAY = 24 * 60 * 60 * 1000;

/** Counts and the latest requests for the dashboard's first screen. */
export const get = query({
  args: tokenArg,
  handler: async (ctx, { token }) => {
    assertAdmin(token);
    const inquiries = await ctx.db.query("inquiries").order("desc").take(1000);
    const projects = await ctx.db.query("projects").collect();
    const since = Date.now() - 30 * DAY;
    return {
      requests: {
        new: inquiries.filter((i) => i.status === "new").length,
        contacted: inquiries.filter((i) => i.status === "contacted").length,
        closed: inquiries.filter((i) => i.status === "closed").length,
        last30: inquiries.filter((i) => i._creationTime >= since).length,
      },
      latest: inquiries.slice(0, 5),
      projects: {
        published: projects.filter((p) => p.published).length,
        drafts: projects.filter((p) => !p.published).length,
        photos: projects.reduce((n, p) => n + p.photos.length, 0),
      },
    };
  },
});
