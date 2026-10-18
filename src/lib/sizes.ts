import type { StaticImageData } from "next/image";

// The browser picks an image file from `sizes`, which only describes width. A photo cropped with
// object-fit: cover is scaled until it fills its frame, so when the photo is wider than the frame
// it is sized by the frame's height and needs more pixels than the frame is wide. Without this a
// landscape photo in a tall phone frame is drawn from a file half the size it needs, and looks soft.

/** Scale applied by ShutterImage's parallax drift (the photo sits 7% past the frame top and bottom). */
export const DRIFT = 1.14;

const aspect = (src: StaticImageData) => src.width / src.height;

/** For a frame of fixed shape (`frame` = width / height): widens every size in `sizes` by the crop. */
export function coverSizes(src: StaticImageData, sizes: string, frame: number, zoom = 1) {
  const factor = (aspect(src) * zoom) / frame;
  if (factor < 1.05) return sizes;
  return sizes
    .split(",")
    .map((entry) => entry.replace(/(\d+(?:\.\d+)?)(vw|px)\s*$/, (_, n: string, unit: string) => `${Math.ceil(Number(n) * factor)}${unit}`))
    .join(",");
}

/** For a frame as wide as the screen and `height` vh tall (full-bleed heroes). */
export function screenSizes(src: StaticImageData, height = 100, zoom = 1) {
  // On screens narrower than this shape the photo is sized by the frame's height.
  const width = (height / 100) * zoom * aspect(src);
  return `(max-aspect-ratio: ${Math.round(width * 1000)}/1000) ${Math.ceil(width * 100)}vh, 100vw`;
}
