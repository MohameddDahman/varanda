import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertAdmin, tokenArg } from "../lib/admin";

// After this many wrong passwords from one client, sign-in is paused for the rest of the window.
const MAX_FAILURES = 8;
const WINDOW = 15 * 60 * 1000;

/**
 * Called by the Next server around every sign-in attempt. `key` is a hash of the client's
 * address, so the database never stores the address itself.
 */
export const attempt = mutation({
  args: { ...tokenArg, key: v.string(), outcome: v.union(v.literal("check"), v.literal("failed"), v.literal("succeeded")) },
  handler: async (ctx, { token, key, outcome }) => {
    assertAdmin(token);
    const now = Date.now();
    const found = await ctx.db.query("loginAttempts").withIndex("by_key", (i) => i.eq("key", key)).first();
    // A window that has run out counts as no record at all.
    const row = found && now - found.since <= WINDOW ? found : null;

    if (outcome === "succeeded") {
      if (found) await ctx.db.delete(found._id);
      return { allowed: true, retryInSeconds: 0 };
    }

    let failures = row?.failures ?? 0;
    const since = row?.since ?? now;
    if (outcome === "failed") {
      failures += 1;
      if (found) await ctx.db.patch(found._id, { failures, since });
      else await ctx.db.insert("loginAttempts", { key, failures, since });
    }
    const allowed = failures < MAX_FAILURES;
    return { allowed, retryInSeconds: allowed ? 0 : Math.ceil((since + WINDOW - now) / 1000) };
  },
});
