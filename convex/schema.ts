import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /** Site-visit requests from the contact form. Read them in the Convex dashboard. */
  inquiries: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    area: v.optional(v.string()),
    projectType: v.string(),
    systems: v.array(v.string()),
    message: v.optional(v.string()),
    contactBy: v.string(),
    locale: v.string(),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("closed")),
  }).index("by_status", ["status"]),
});
