import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

const limits = { name: 120, phone: 32, email: 160, area: 160, message: 3000 } as const;

/**
 * Store a site-visit request. The only function here that needs no admin token: requests are
 * read back only through convex/admin/*, which the team reaches through /admin.
 */
export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    area: v.optional(v.string()),
    projectType: v.string(),
    systems: v.array(v.string()),
    message: v.optional(v.string()),
    contactBy: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const phone = args.phone.trim();
    if (name.length < 2 || name.length > limits.name) throw new ConvexError("invalid-name");
    if (!/^[+\d][\d\s()-]{6,}$/.test(phone) || phone.length > limits.phone) throw new ConvexError("invalid-phone");
    if (args.email && (args.email.length > limits.email || !/^\S+@\S+\.\S+$/.test(args.email))) {
      throw new ConvexError("invalid-email");
    }
    if ((args.area?.length ?? 0) > limits.area || (args.message?.length ?? 0) > limits.message) {
      throw new ConvexError("too-long");
    }
    if (args.systems.length > 10) throw new ConvexError("too-many-systems");

    return await ctx.db.insert("inquiries", {
      ...args,
      name,
      phone,
      email: args.email?.trim() || undefined,
      area: args.area?.trim() || undefined,
      message: args.message?.trim() || undefined,
      status: "new",
    });
  },
});
