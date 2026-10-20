import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
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

/**
 * Swaps a photo's file for a re-encoded one (same picture, smaller). The old file stays until
 * deleteFiles, so pages cached with its URL keep working until they're refreshed.
 */
export const replaceFile = mutation({
  args: { ...tokenArg, id: v.id("photos"), storageId: v.id("_storage"), width: v.number(), height: v.number() },
  handler: async (ctx, { token, id, storageId, width, height }) => {
    assertAdmin(token);
    const photo = await ctx.db.get(id);
    if (!photo) throw new ConvexError("not-found");
    const meta = await ctx.db.system.get(storageId);
    if (!meta?.contentType?.startsWith("image/")) {
      if (meta) await ctx.storage.delete(storageId);
      throw new ConvexError("not-an-image");
    }
    if (width < 1 || height < 1) throw new ConvexError("bad-photo");
    await ctx.db.patch(id, { storageId, width, height });
    return photo.storageId;
  },
});

/** Deletes stored files that no photo uses any more. */
export const deleteFiles = mutation({
  args: { ...tokenArg, storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, { token, storageIds }) => {
    assertAdmin(token);
    const used = new Set((await ctx.db.query("photos").collect()).map((p) => p.storageId));
    let deleted = 0;
    for (const id of storageIds) {
      if (used.has(id) || !(await ctx.db.system.get(id))) continue;
      await ctx.storage.delete(id);
      deleted++;
    }
    return deleted;
  },
});

/** Every photo with its file's size and type, for upkeep scripts. */
export const files = query({
  args: tokenArg,
  handler: async (ctx, { token }) => {
    assertAdmin(token);
    const photos = await ctx.db.query("photos").collect();
    return await Promise.all(
      photos.map(async (p) => {
        const meta = await ctx.db.system.get(p.storageId);
        return { id: p._id, url: await ctx.storage.getUrl(p.storageId), size: meta?.size ?? 0, contentType: meta?.contentType ?? null, width: p.width, height: p.height };
      }),
    );
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
