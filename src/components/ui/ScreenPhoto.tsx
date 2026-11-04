import Image, { getImageProps } from "next/image";
import { preload as preloadResource } from "react-dom";
import type { Photo } from "@/content/photos";
import { CROP_ASPECT, LANDSCAPE, PORTRAIT, cropSrcSet } from "@/lib/crop";
import { screenSizes } from "@/lib/sizes";

type Props = {
  photo: Photo;
  alt: string;
  /** `sizes` for the landscape file (wide screens). */
  sizes: string;
  /** The frame's height in vh on portrait screens, and the zoom it's drawn at there. */
  height?: number;
  zoom?: number;
  /** The frame's object-position; the portrait crop keeps the same point. */
  position?: string;
  /** Load it first: the page's main photo. */
  preload?: boolean;
  quality?: number;
  className?: string;
};

/**
 * A photo filling a full-screen frame (next/image, fill). Portrait screens load a portrait
 * crop of it (see src/lib/crop.ts) instead of a landscape file sized by the frame's height.
 */
export function ScreenPhoto({ photo, alt, sizes, height = 100, zoom = 1, position, preload = false, quality = 75, className }: Props) {
  const portrait = cropSrcSet(photo.src, position, quality);
  const portraitSizes = screenSizes(CROP_ASPECT, height, zoom);

  if (preload) {
    // next/image's own preload ignores <source>, so a phone would fetch the landscape file too.
    const { props } = getImageProps({ src: photo.src, alt, fill: true, sizes, quality });
    const options = { as: "image", fetchPriority: "high" } as const;
    preloadResource(props.src, { ...options, imageSrcSet: props.srcSet, imageSizes: props.sizes, media: portrait ? LANDSCAPE : undefined });
    if (portrait) preloadResource(props.src, { ...options, imageSrcSet: portrait, imageSizes: portraitSizes, media: PORTRAIT });
  }

  return (
    <picture>
      {portrait && <source media={PORTRAIT} srcSet={portrait} sizes={portraitSizes} />}
      <Image
        src={photo.src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        loading={preload ? "eager" : undefined}
        fetchPriority={preload ? "high" : undefined}
        placeholder="blur"
        className={className}
        style={position ? { objectPosition: position } : undefined}
      />
    </picture>
  );
}
