import { query } from "./_generated/server";

/** The texts and contact details changed in the dashboard (public: it's what the site shows). */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("content").withIndex("by_key", (q) => q.eq("key", "site")).unique();
    return Object.fromEntries((doc?.values ?? []).map((e) => [e.path, e.value])) as Record<string, unknown>;
  },
});
