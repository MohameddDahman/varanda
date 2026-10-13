import Image from "next/image";
import type { Lang } from "@/i18n/config";
import type { Photo } from "@/content/photos";
import { cn } from "@/lib/cn";

/** A product shot on a light ground, shown whole (contain) so wide parts aren't cropped. */
export function ProductPhoto({ photo, lang, className, fit = "contain" }: { photo: Photo; lang: Lang; className?: string; fit?: "contain" | "cover" }) {
  return (
    <div className={cn("product-photo relative overflow-hidden", className)}>
      <Image
        src={photo.src}
        alt={photo.alt[lang]}
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        placeholder="blur"
        className={fit === "contain" ? "object-contain" : "object-cover"}
      />
    </div>
  );
}
