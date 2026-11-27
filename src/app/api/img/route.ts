import sharp from "sharp";
import { SHARE_SIZE } from "@/lib/meta";
import { CROP_ASPECT, CROP_WIDTHS } from "@/lib/crop";

/*
 * Resizes the site's photos for next/image (see src/lib/image-loader.ts): the build's own
 * static photos and the ones uploaded to Convex, nothing else. WebP at the width asked for,
 * never larger than the original, cached by the CDN and browsers for a year.
 * With `share`, it makes a page's link preview instead (og:image, see src/lib/meta.ts): a
 * 1200×630 crop as a JPEG, the one format WhatsApp, Facebook and X all read. With
 * `crop=x-y` it first cuts the portrait crop full-screen frames use on phones (src/lib/crop.ts),
 * keeping the point at x%, y% where object-position would.
 */

// next/image's default device and image sizes, and the qualities the site uses.
const WIDTHS = new Set([16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]);
const QUALITIES = new Set([60, 75, 85]);

const convex = process.env.NEXT_PUBLIC_CONVEX_URL ? new URL(process.env.NEXT_PUBLIC_CONVEX_URL) : null;

function allowed(src: string): boolean {
  // The build's own images (…/media/ locally, …/immutable/media/ on Vercel).
  if (src.startsWith("/_next/static/")) return !src.includes("..") && /\/media\/[^/]+\.(jpe?g|png|webp|avif)$/i.test(src);
  try {
    const u = new URL(src);
    if (!u.pathname.startsWith("/api/storage/")) return false;
    if (u.protocol === "https:" && u.hostname.endsWith(".convex.cloud")) return true;
    return Boolean(convex && u.origin === convex.origin);
  } catch {
    return false;
  }
}

const fail = (status: number, message: string) =>
  new Response(message, { status, headers: { "Cache-Control": "public, max-age=60" } });

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const src = params.get("src") ?? "";
  const share = params.has("share");
  const crop = params.get("crop")?.match(/^(\d{1,3})-(\d{1,3})$/);
  const width = Number(params.get("w"));
  const quality = Number(params.get("q") ?? 75);
  if (!allowed(src)) return fail(400, "src not allowed");
  if (params.has("crop") && (!crop || Number(crop[1]) > 100 || Number(crop[2]) > 100)) return fail(400, "bad crop");
  const widths = crop ? new Set(CROP_WIDTHS) : WIDTHS;
  if (!share && (!widths.has(width) || !QUALITIES.has(quality))) return fail(400, "bad size");

  const source = await fetch(new URL(src, request.url), { cache: "force-cache" });
  if (!source.ok) return fail(source.status === 404 ? 404 : 502, "source unavailable");

  const input = Buffer.from(await source.arrayBuffer());
  const photo = sharp(input).rotate();
  if (crop) {
    const meta = await sharp(input).metadata();
    // Upright size: EXIF orientations 5–8 turn the photo on its side.
    const [w, h] = (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
    const cw = Math.min(w, Math.round(h * CROP_ASPECT));
    const ch = Math.min(h, Math.round(cw / CROP_ASPECT));
    const left = Math.round(((w - cw) * Number(crop[1])) / 100);
    const top = Math.round(((h - ch) * Number(crop[2])) / 100);
    photo.extract({ left, top, width: cw, height: ch });
  }
  const image = share
    ? await photo.resize({ ...SHARE_SIZE, fit: "cover", position: "attention" }).jpeg({ quality: 80, mozjpeg: true }).toBuffer()
    : // Effort 2, not sharp's default 4: half the CPU time per photo for files about 7% larger.
      // Every deploy clears the CDN, so each size is made again, on the free plan's CPU allowance.
      await photo.resize({ width, withoutEnlargement: true }).webp({ quality, effort: 2 }).toBuffer();

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": share ? "image/jpeg" : "image/webp",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
