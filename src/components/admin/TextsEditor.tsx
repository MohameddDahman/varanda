"use client";

import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { L } from "@/i18n/config";
import { a, fill } from "@/content/admin";
import type { TextField } from "@/content/editable";
import { saveContent } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { useAdminLang } from "./AdminLang";
import { AdminIcon } from "./AdminIcon";
import { BilingualField } from "./fields";
import { useToast } from "./Toaster";

export type EditorText = TextField & { value: L | string | null; original?: L | string | null };
type Group = { id: string; label: L; roots: string[] };

/** What each part of the content is, in words. */
const rootLabels: Record<string, L> = {
  site: { en: "Brand and site description", ar: "العلامة ووصف الموقع" },
  nav: { en: "Menu", ar: "القائمة" },
  ui: { en: "Buttons and small labels", ar: "الأزرار والعناوين الصغيرة" },
  about: { en: "About the company", ar: "عن الشركة" },
  process: { en: "From idea to handover", ar: "من الفكرة إلى التسليم" },
  warranty: { en: "Warranty", ar: "الضمان" },
  counters: { en: "Figures", ar: "الأرقام" },
  benefits: { en: "Why uPVC: benefits", ar: "لماذا uPVC: المزايا" },
  anatomy: { en: "Inside every frame", ar: "داخل كل إطار" },
  systems: { en: "Systems", ar: "الأنظمة" },
  finishes: { en: "Colour finishes", ar: "الألوان والتشطيبات" },
};

const key = (v: EditorText["value"]) => JSON.stringify(v);
const isLong = (v: L) => v.en.length > 70 || v.ar.length > 70;

function FigureField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="adm-label">
        {label}
      </label>
      <input id={id} dir="ltr" maxLength={20} value={value} onChange={(e) => onChange(e.target.value)} className="adm-input max-w-40" />
    </div>
  );
}

/** Every text on the site, grouped by page; only what changed is saved. */
export function TextsEditor({ fields, groups }: { fields: EditorText[]; groups: Group[] }) {
  const { lang, t } = useAdminLang();
  const toast = useToast();
  const router = useRouter();
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.path, f.value])));
  const [saved, setSaved] = useState(() => Object.fromEntries(fields.map((f) => [f.path, key(f.value)])));
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [saving, startSave] = useTransition();
  const byPath = useMemo(() => new Map(fields.map((f) => [f.path, f])), [fields]);
  const changes = fields.filter((f) => key(values[f.path]) !== saved[f.path]);
  const dirty = changes.length > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const q = query.trim().toLowerCase();
  const matches = (f: EditorText) => {
    if (!q) return true;
    const v = values[f.path];
    const hay = [f.label, typeof v === "string" ? v : v ? `${v.en} ${v.ar}` : ""].join(" ").toLowerCase();
    return hay.includes(q);
  };
  const errorText = (code: string) => t(a.errors[code as keyof typeof a.errors] ?? a.failed);

  const save = () =>
    startSave(async () => {
      const list = changes.map((f) => ({ path: f.path, value: values[f.path] }));
      const result = await saveContent(list);
      if (!result.ok) {
        toast(errorText(result.error), "error");
        return;
      }
      setSaved((s) => ({ ...s, ...Object.fromEntries(list.map((c) => [c.path, key(c.value)])) }));
      toast(t(a.saved));
      router.refresh();
    });

  const field = (f: EditorText) => {
    const v = values[f.path];
    const original = byPath.get(f.path)?.original;
    const changedFromCode = original !== undefined ? key(v) !== key(original) : key(v) !== key(f.value);
    const restore = original !== undefined ? original : f.value;
    return (
      <div key={f.path} className="space-y-2 border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0">
        {f.kind === "l" ? (
          <BilingualField label={f.label} value={v as L} multiline={isLong(v as L)} rows={isLong(v as L) ? 4 : 2} maxLength={4000} required onChange={(nv) => setValues((s) => ({ ...s, [f.path]: nv }))} />
        ) : (
          <FigureField label={`${f.label} (${t(a.texts.figure)})`} value={(v as string | null) ?? ""} onChange={(nv) => setValues((s) => ({ ...s, [f.path]: nv.trim() ? nv : null }))} />
        )}
        {changedFromCode && (
          <button type="button" className="adm-btn adm-btn-ghost -ms-2 min-h-9 text-sm" onClick={() => setValues((s) => ({ ...s, [f.path]: restore }))}>
            <AdminIcon name="back" className="h-4 w-4" />
            {t(a.texts.restore)}
          </button>
        )}
      </div>
    );
  };

  const anyMatch = fields.some(matches);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-2xl font-semibold lg:text-3xl">{t(a.texts.heading)}</h1>
        <p className="mt-1 max-w-[60ch] text-ink-2">{t(a.texts.intro)}</p>
      </div>

      <div className="relative">
        <AdminIcon name="search" className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-2" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(a.texts.search)} aria-label={t(a.texts.search)} className="adm-input ps-10" />
      </div>

      {!anyMatch && <p className="text-ink-2">{t(a.texts.noMatch)}</p>}

      {groups.map((g) => {
        const roots = g.roots.filter((r) => fields.some((f) => f.root === r && matches(f)));
        if (!roots.length) return null;
        return (
          <section key={g.id} className="space-y-2" aria-labelledby={`g-${g.id}`}>
            <h2 id={`g-${g.id}`} className="adm-label pt-2">
              {g.label[lang]}
            </h2>
            {roots.map((r) => {
              const list = fields.filter((f) => f.root === r && matches(f));
              const edited = list.filter((f) => key(values[f.path]) !== saved[f.path]).length;
              const isOpen = open === r || q.length > 1;
              return (
                <div key={r} className="adm-card">
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(open === r ? null : r)} className="flex min-h-14 w-full items-center gap-3 px-4 text-start sm:px-6">
                    <span className="flex-1 font-semibold">{rootLabels[r]?.[lang] ?? r}</span>
                    {edited > 0 && <span className="adm-badge">{edited}</span>}
                    <span className="text-sm text-ink-2">{fill(t(a.texts.count), { n: list.length })}</span>
                    <AdminIcon name={isOpen ? "up" : "down"} className="h-4 w-4 text-ink-2" />
                  </button>
                  {isOpen && <div className="space-y-4 border-t border-[var(--line)] p-4 sm:p-6">{list.slice(0, q ? 60 : undefined).map(field)}</div>}
                </div>
              );
            })}
          </section>
        );
      })}

      <div className="sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+0.75rem)] z-10 lg:bottom-6">
        <div className="flex items-center justify-between gap-3 border border-[var(--line)] bg-white/95 p-2 ps-4 shadow-[0_8px_30px_rgb(4_12_23/0.12)] backdrop-blur-md">
          <span className={cn("text-sm", dirty ? "font-medium text-red-deep" : "text-ink-2")} aria-live="polite">
            {dirty ? fill(t(a.texts.unsaved), { n: changes.length }) : t(a.saved)}
          </span>
          <button type="submit" disabled={saving || !dirty} className="adm-btn adm-btn-primary min-w-32">
            {t(saving ? a.saving : a.save)}
          </button>
        </div>
      </div>
    </form>
  );
}
