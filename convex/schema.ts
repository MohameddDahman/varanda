import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Text in both site languages. */
export const bilingual = v.object({ en: v.string(), ar: v.string() });

export const projectType = v.union(v.literal("residential"), v.literal("commercial"), v.literal("education"), v.literal("outdoor"));

export const inquiryStatus = v.union(v.literal("new"), v.literal("contacted"), v.literal("closed"));

export default defineSchema({
  /** Site-visit requests from the contact form, worked through in /admin. */
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
    status: inquiryStatus,
    /** The team's private note on the request. */
    note: v.optional(v.string()),
  }).index("by_status", ["status"]),

  /** Uploaded project photos. */
  photos: defineTable({
    storageId: v.id("_storage"),
    width: v.number(),
    height: v.number(),
    /** A tiny JPEG shown blurred while the photo loads. */
    blurDataURL: v.string(),
    alt: bilingual,
    /** CSS object-position kept when a wide frame crops the photo. */
    focus: v.optional(v.string()),
  }),

  /** Projects shown on the site. The first photo is the cover. */
  projects: defineTable({
    slug: v.string(),
    title: bilingual,
    type: projectType,
    year: v.number(),
    location: v.optional(bilingual),
    summary: bilingual,
    body: v.array(bilingual),
    systems: v.array(v.string()),
    photos: v.array(v.id("photos")),
    order: v.number(),
    published: v.boolean(),
    featured: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["order"]),

  /**
   * The site's texts and contact details as changed in the dashboard: one document, a list of
   * content path and value (see src/content/editable.ts). Checked by the Next server before saving.
   */
  content: defineTable({
    key: v.literal("site"),
    values: v.array(v.object({ path: v.string(), value: v.any() })),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  /** Failed admin sign-ins per client, to slow down password guessing. */
  loginAttempts: defineTable({
    key: v.string(),
    failures: v.number(),
    since: v.number(),
  }).index("by_key", ["key"]),
});
