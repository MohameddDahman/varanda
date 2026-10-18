"use client";

import { useId } from "react";
import type { L } from "@/i18n/config";
import { a } from "@/content/admin";
import { useAdminLang } from "./AdminLang";

/** A titled block of the editor. */
export function Section({ title, hint, error, children, id }: { title: string; hint?: string; error?: string | null; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="adm-card scroll-mt-20 p-4 sm:p-6" aria-labelledby={id ? `${id}-title` : undefined}>
      <h2 id={id ? `${id}-title` : undefined} className="text-lg font-semibold">
        {title}
      </h2>
      {hint && <p className="adm-hint mt-1">{hint}</p>}
      {error && (
        <p role="alert" className="mt-3 border-s-2 border-red-deep ps-3 text-sm text-red-deep">
          {error}
        </p>
      )}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

/**
 * One piece of text in both languages: side by side on wide screens, stacked on phones. The
 * Arabic box writes right to left whatever the dashboard's language.
 */
export function BilingualField({
  label,
  value,
  onChange,
  multiline,
  required,
  invalid,
  optional,
  maxLength,
  rows = 3,
  stacked,
}: {
  label: string;
  value: L;
  onChange: (value: L) => void;
  multiline?: boolean;
  required?: boolean;
  invalid?: boolean;
  optional?: boolean;
  maxLength?: number;
  rows?: number;
  /** Always one above the other (for narrow spots like photo cards). */
  stacked?: boolean;
}) {
  const { t } = useAdminLang();
  const id = useId();
  return (
    <fieldset>
      <legend className="adm-label">
        {label}
        {optional && <span className="ms-1.5 font-normal text-ink-2">({t(a.optional)})</span>}
      </legend>
      <div className={stacked ? "grid gap-3" : "grid gap-3 md:grid-cols-2"}>
        {(["en", "ar"] as const).map((lng) => {
          const props = {
            id: `${id}-${lng}`,
            value: value[lng],
            dir: lng === "ar" ? "rtl" : "ltr",
            lang: lng,
            required,
            maxLength,
            "aria-invalid": invalid && !value[lng].trim() ? true : undefined,
            className: "adm-input",
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [lng]: e.target.value }),
          } as const;
          return (
            <div key={lng}>
              <label htmlFor={`${id}-${lng}`} className="mb-1 block text-xs font-medium text-ink-2">
                {t(lng === "en" ? a.english : a.arabic)}
              </label>
              {multiline ? <textarea rows={rows} {...props} /> : <input type="text" {...props} />}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Switch({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (on: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {hint && <p className="adm-hint mt-0.5">{hint}</p>}
      </div>
      {/* The 44px tap area is wider than the drawn switch. */}
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className="-m-2.5 grid shrink-0 place-items-center p-2.5 disabled:opacity-50">
        <span className="adm-switch" data-on={checked} aria-hidden="true" />
      </button>
    </div>
  );
}
