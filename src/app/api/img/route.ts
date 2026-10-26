import sharp from "sharp";

/*
 * Resizes the site's photos for next/image (see src/lib/image-loader.ts): the build's own
 * static photos and the ones uploaded to Convex, nothing else. WebP at the width asked for,
 * never larger than the original, cached by the CDN and browsers for a year.
 */

// next/image's default device and image sizes, and the qualities the site uses.
const WIDTHS = new Set([16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]);
const QUALITIES = new Set([60, 75, 85]);

const convex = process.env.NEXT_PUBLIC_CONVEX_URL ? new URL(process.env.NEXT_PUBLIC_CONVEX_URL) : null;

function allowed(src: string): boolean {
  if (src.startsWith("/_next/static/media/")) return !src.includes("..");
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
  const width = Number(params.get("w"));
  const quality = Number(params.get("q") ?? 75);
  if (!allowed(src)) return fail(400, "src not allowed");
  if (!WIDTHS.has(width) || !QUALITIES.has(quality)) return fail(400, "bad size");

  const source = await fetch(new URL(src, request.url), { cache: "force-cache" });
  if (!source.ok) return fail(source.status === 404 ? 404 : 502, "source unavailable");

  const image = await sharp(Buffer.from(await source.arrayBuffer()))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
