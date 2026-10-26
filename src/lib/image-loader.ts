/**
 * next/image loader: photos are resized by the site's own /api/img route instead of Vercel's
 * Image Optimization, whose free monthly allowance runs out (it answered 402 once it did).
 * The route's responses are cached by the CDN for a year, so each size is made only once.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("data:") || src.endsWith(".svg")) return src;
  return `/api/img?src=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}
