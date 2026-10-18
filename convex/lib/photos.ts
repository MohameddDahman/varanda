import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/** A photo ready for the page: file URL plus what next/image needs. */
export async function resolvePhotos(ctx: QueryCtx, ids: Id<"photos">[]) {
  const out = [];
  for (const id of ids) {
    const photo = await ctx.db.get(id);
    if (!photo) continue;
    const url = await ctx.storage.getUrl(photo.storageId);
    if (!url) continue;
    out.push({
      _id: photo._id,
      url,
      width: photo.width,
      height: photo.height,
      blurDataURL: photo.blurDataURL,
      alt: photo.alt,
      focus: photo.focus,
    });
  }
  return out;
}
