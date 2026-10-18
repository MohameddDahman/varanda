import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { inquiryStatus } from "../schema";
import { assertAdmin, tokenArg } from "../lib/admin";

/** Newest first; optionally one status. Enough for a small team's inbox. */
export const list = query({
  args: { ...tokenArg, status: v.optional(inquiryStatus) },
  handler: async (ctx, { token, status }) => {
    assertAdmin(token);
    const q = status
      ? ctx.db.query("inquiries").withIndex("by_status", (i) => i.eq("status", status))
      : ctx.db.query("inquiries");
    return await q.order("desc").take(500);
  },
});

export const get = query({
  args: { ...tokenArg, id: v.id("inquiries") },
  handler: async (ctx, { token, id }) => {
    assertAdmin(token);
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: { ...tokenArg, id: v.id("inquiries"), status: v.optional(inquiryStatus), note: v.optional(v.string()) },
  handler: async (ctx, { token, id, status, note }) => {
    assertAdmin(token);
    if (!(await ctx.db.get(id))) throw new ConvexError("not-found");
    if (note !== undefined && note.length > 3000) throw new ConvexError("too-long");
    await ctx.db.patch(id, {
      ...(status ? { status } : {}),
      ...(note !== undefined ? { note: note.trim() || undefined } : {}),
    });
  },
});

export const remove = mutation({
  args: { ...tokenArg, id: v.id("inquiries") },
  handler: async (ctx, { token, id }) => {
    assertAdmin(token);
    if (await ctx.db.get(id)) await ctx.db.delete(id);
  },
});
