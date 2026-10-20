// Shared by the photo scripts: which Convex deployment to talk to, and how photos are encoded.
import sharp from "sharp";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");

/** NEXT_PUBLIC_CONVEX_URL and ADMIN_TOKEN from .env.local, or from the file after --env. */
export function convexEnv(argv = process.argv) {
  const file = argv.includes("--env") ? argv[argv.indexOf("--env") + 1] : ".env.local";
  const env = Object.fromEntries(
    readFileSync(path.resolve(root, file), "utf8")
      .split(/\r?\n/)
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
  );
  if (!env.NEXT_PUBLIC_CONVEX_URL || !env.ADMIN_TOKEN) throw new Error(`${file} needs NEXT_PUBLIC_CONVEX_URL and ADMIN_TOKEN`);
  return { url: env.NEXT_PUBLIC_CONVEX_URL, token: env.ADMIN_TOKEN };
}

/**
 * The site's photo format: at most 2400px on the long side, WebP at quality 82 (about 41 dB
 * PSNR against the original: no visible difference, about half the bytes of a JPEG), upright,
 * without metadata. The dashboard's browser uploads use the same settings.
 */
export async function encodePhoto(input) {
  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, type: "image/webp" };
}

export { root };
