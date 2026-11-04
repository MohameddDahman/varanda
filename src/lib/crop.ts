import type { StaticImageData } from "next/image";

/*
 * Full-screen photos on portrait screens. A landscape photo filling a tall phone frame shows
 * only its middle third, yet the browser has to fetch it sized by the frame's height: about
 * three times the pixels it shows. Portrait screens get a portrait crop instead, cut by
 * /api/img around the same point the frame's object-position keeps.
 */

/** Screens this shape or taller get the crop… */
export const PORTRAIT = "(max-aspect-ratio: 3/4)";
/** …and everything else the landscape file. */
export const LANDSCAPE = "not all and (max-aspect-ratio: 3/4)";

/** The crop's shape (width / height): a 3:4 tablet fills it by width, tall phones trim its sides. */
export const CROP_ASPECT = 0.6;

/** The widths /api/img cuts crops at. */
export const CROP_WIDTHS = [480, 640, 750, 828, 960, 1080, 1440];

/** A CSS object-position ("68% 50%", "center top") as fractions; anything else is the middle. */
export function focusPoint(position?: string): [number, number] {
  const words: Record<string, number> = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
  const [x, y] = (position ?? "").trim().split(/\s+/);
  const read = (v?: string) => {
    if (!v) return 0.5;
    const n = v in words ? words[v] : Number.parseFloat(v) / 100;
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.5;
  };
  return [read(x), read(y)];
}

/** The portrait crop's srcset, or null when the photo is already that narrow. */
export function cropSrcSet(src: StaticImageData, position?: string, quality = 75): string | null {
  if (src.width / src.height <= CROP_ASPECT * 1.1) return null;
  const [fx, fy] = focusPoint(position).map((n) => Math.round(n * 100));
  const widest = Math.round(src.height * CROP_ASPECT);
  // Past the crop's own width the route would only send the same pixels again.
  const widths = CROP_WIDTHS.filter((w, i) => w <= widest || CROP_WIDTHS[i - 1] < widest);
  if (!widths.length) return null;
  return widths
    .map((w) => `/api/img?src=${encodeURIComponent(src.src)}&w=${w}&q=${quality}&crop=${fx},${fy} ${w}w`)
    .join(", ");
}
