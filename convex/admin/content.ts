import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertAdmin, tokenArg } from "../lib/admin";

/** Replaces the changed texts and contact details. The Next server has checked every value. */
export const save = mutation({
  args: { ...tokenArg, values: v.array(v.object({ path: v.string(), value: v.any() })) },
  handler: async (ctx, { token, values }) => {
    assertAdmin(token);
    if (JSON.stringify(values).length > 600_000) throw new ConvexError("too-large");
    const doc = await ctx.db.query("content").withIndex("by_key", (q) => q.eq("key", "site")).unique();
    if (doc) await ctx.db.patch(doc._id, { values, updatedAt: Date.now() });
    else await ctx.db.insert("content", { key: "site", values, updatedAt: Date.now() });
  },
});
