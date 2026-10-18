"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import type { L } from "@/i18n/config";
import { a, fill } from "@/content/admin";
import { cn } from "@/lib/cn";
import { preparePhoto } from "@/lib/admin/prepare-photo";
import { addPhoto, getUploadUrl } from "@/app/admin/actions";
import { AdminIcon } from "./AdminIcon";
import { useAdminLang } from "./AdminLang";
import { BilingualField } from "./fields";
import { useToast } from "./Toaster";

export type EditorPhoto = {
  id: Id<"photos">;
  url: string;
  width: number;
  height: number;
  blurDataURL: string;
  alt: L;
  focus?: string;
};

/**
 * The project's photos in site order (the first is the cover). Uploads are attached to the
 * project as soon as they finish; order, descriptions and removals are saved with the project.
 */
export function PhotoManager({
  project,
  photos,
  onChange,
  onUploaded,
  invalid,
}: {
  project: Id<"projects">;
  photos: EditorPhoto[];
  onChange: (photos: EditorPhoto[]) => void;
  /** New photos, already attached on the server. */
  onUploaded: (photo: EditorPhoto) => void;
  invalid?: boolean;
}) {
  const { t } = useAdminLang();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ i: number; n: number } | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const upload = async (files: File[]) => {
    for (const [i, file] of files.entries()) {
      setProgress({ i: i + 1, n: files.length });
      try {
        const photo = await preparePhoto(file);
        const target = await getUploadUrl();
        if (!target.ok) throw new Error(target.error);
        const sent = await fetch(target.value, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: photo.blob });
        if (!sent.ok) throw new Error(`upload ${sent.status}`);
        const { storageId } = (await sent.json()) as { storageId: Id<"_storage"> };
        const alt = { en: "", ar: "" };
        const added = await addPhoto(project, { storageId, width: photo.width, height: photo.height, blurDataURL: photo.blurDataURL, alt });
        if (!added.ok) throw new Error(added.error);
        // Shown from the local file until the next page load brings the stored copy.
        onUploaded({ id: added.value.id, url: URL.createObjectURL(photo.blob), width: photo.width, height: photo.height, blurDataURL: photo.blurDataURL, alt });
      } catch (error) {
        console.error(error);
        toast(fill(t(a.editor.uploadFailed), { name: file.name }), "error");
      }
    }
    setProgress(null);
  };

  return (
    <div>
      {photos.length > 0 && (
        <ul className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", invalid && "outline outline-2 outline-offset-4 outline-red-deep")}>
          {photos.map((p, i) => (
            <li key={p.id} className="border border-[var(--line)] bg-paper/50">
              <div className="relative aspect-[4/3] bg-paper-2">
                <Image
                  src={p.url}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 90vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={p.blurDataURL}
                  unoptimized={p.url.startsWith("blob:")}
                  style={{ objectPosition: p.focus }}
                />
                {i === 0 && <span className="adm-pill absolute start-2 top-2 bg-navy-900 text-white">{t(a.editor.cover)}</span>}
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-[var(--line)] bg-white px-1">
                <div className="flex">
                  <button type="button" className="adm-icon-btn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={t(a.editor.moveEarlier)}>
                    <AdminIcon name="back" />
                  </button>
                  <button type="button" className="adm-icon-btn" onClick={() => move(i, i + 1)} disabled={i === photos.length - 1} aria-label={t(a.editor.moveLater)}>
                    <AdminIcon name="next" />
                  </button>
                </div>
                {i > 0 && (
                  <button type="button" className="adm-btn adm-btn-ghost min-h-11 px-3 text-sm" onClick={() => move(i, 0)}>
                    {t(a.editor.makeCover)}
                  </button>
                )}
                <button type="button" className="adm-icon-btn hover:text-red-deep" onClick={() => onChange(photos.filter((x) => x.id !== p.id))} aria-label={t(a.editor.removePhoto)}>
                  <AdminIcon name="trash" />
                </button>
              </div>
              <div className="border-t border-[var(--line)] bg-white p-3">
                <BilingualField label={t(a.editor.alt)} value={p.alt} multiline stacked rows={2} maxLength={200} onChange={(alt) => onChange(photos.map((x) => (x.id === p.id ? { ...x, alt } : x)))} />
                <p className="adm-hint mt-1.5">{t(a.editor.altHint)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) upload(files);
        }}
      />
      <button type="button" disabled={!!progress} onClick={() => input.current?.click()} className={cn("adm-btn adm-btn-outline w-full sm:w-auto", photos.length > 0 && "mt-4")}>
        <AdminIcon name="upload" />
        {progress ? fill(t(a.editor.uploading), progress) : t(a.editor.upload)}
      </button>
    </div>
  );
}
