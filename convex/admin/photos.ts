import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { bilingual } from "../schema";
import { assertAdmin, tokenArg } from "../lib/admin";

/** A short-lived URL the admin's browser posts the (already resized) file to. */
export const generateUploadUrl = mutation({
  args: tokenArg,
  handler: async (ctx, { token }) => {
    assertAdmin(token);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    ...tokenArg,
    storageId: v.id("_storage"),
    width: v.number(),
    height: v.number(),
    blurDataURL: v.string(),
    alt: bilingual,
    focus: v.optional(v.string()),
  },
  handler: async (ctx, { token, ...photo }) => {
    assertAdmin(token);
    const meta = await ctx.db.system.get(photo.storageId);
    if (!meta) throw new ConvexError("upload-missing");
    if (!meta.contentType?.startsWith("image/")) {
      await ctx.storage.delete(photo.storageId);
      throw new ConvexError("not-an-image");
    }
    if (photo.width < 1 || photo.height < 1 || !photo.blurDataURL.startsWith("data:image/")) throw new ConvexError("bad-photo");
    return await ctx.db.insert("photos", photo);
  },
});

export const update = mutation({
  args: { ...tokenArg, id: v.id("photos"), alt: v.optional(bilingual), focus: v.optional(v.string()) },
  handler: async (ctx, { token, id, alt, focus }) => {
    assertAdmin(token);
    if (!(await ctx.db.get(id))) throw new ConvexError("not-found");
    await ctx.db.patch(id, { ...(alt ? { alt } : {}), ...(focus !== undefined ? { focus: focus || undefined } : {}) });
  },
});

/** Deletes the photo and its file, and takes it out of any project that still lists it. */
export const remove = mutation({
  args: { ...tokenArg, id: v.id("photos") },
  handler: async (ctx, { token, id }) => {
    assertAdmin(token);
    const photo = await ctx.db.get(id);
    if (!photo) return;
    for (const p of await ctx.db.query("projects").collect()) {
      if (p.photos.includes(id)) await ctx.db.patch(p._id, { photos: p.photos.filter((x) => x !== id) });
    }
    await ctx.storage.delete(photo.storageId);
    await ctx.db.delete(id);
  },
});
