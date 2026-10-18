"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { a } from "@/content/admin";
import { cn } from "@/lib/cn";
import { deleteRequest, updateRequest, type Result } from "@/app/admin/actions";
import { AdminIcon } from "./AdminIcon";
import { useAdminLang } from "./AdminLang";
import { ConfirmButton } from "./ConfirmDialog";
import { useToast } from "./Toaster";

type Status = "new" | "contacted" | "closed";

/** Shows "Saved" or the error in words. */
function useReport() {
  const { t } = useAdminLang();
  const toast = useToast();
  return (result: Result<unknown>, done = t(a.saved)) => {
    if (result.ok) toast(done);
    else toast(t(a.errors[result.error as keyof typeof a.errors] ?? a.failed), "error");
    return result.ok;
  };
}

export function StatusSwitch({ id, status }: { id: Id<"inquiries">; status: Status }) {
  const { t } = useAdminLang();
  const report = useReport();
  const [pending, start] = useTransition();
  // The switch moves at once; the server confirms (or the toast says it didn't).
  const [shown, show] = useOptimistic(status);

  return (
    <div role="group" aria-label={t(a.requests.status)} className={cn("adm-segment", pending && "opacity-80")}>
      {(["new", "contacted", "closed"] as const).map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={shown === s}
          onClick={() =>
            s !== shown &&
            start(async () => {
              show(s);
              report(await updateRequest(id, { status: s }));
            })
          }
        >
          {t(a.status[s])}
        </button>
      ))}
    </div>
  );
}

export function NoteForm({ id, note }: { id: Id<"inquiries">; note: string }) {
  const { t } = useAdminLang();
  const report = useReport();
  const [value, setValue] = useState(note);
  const [saved, setSaved] = useState(note);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          if (report(await updateRequest(id, { note: value }))) setSaved(value);
        });
      }}
    >
      <label htmlFor="note" className="adm-label">
        {t(a.requests.note)}
      </label>
      <textarea id="note" value={value} onChange={(e) => setValue(e.target.value)} maxLength={3000} rows={4} placeholder={t(a.requests.notePlaceholder)} className="adm-input" dir="auto" />
      <button type="submit" disabled={pending || value === saved} className="adm-btn adm-btn-dark mt-3 w-full">
        {t(pending ? a.saving : a.requests.saveNote)}
      </button>
    </form>
  );
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const { t } = useAdminLang();
  const toast = useToast();
  return (
    <button
      type="button"
      className={cn("adm-btn adm-btn-outline", className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast(t(a.requests.copied));
        } catch {
          toast(t(a.failed), "error");
        }
      }}
    >
      <AdminIcon name="copy" />
      {t(a.requests.copy)}
    </button>
  );
}

export function DeleteRequest({ id }: { id: Id<"inquiries"> }) {
  const { t } = useAdminLang();
  const report = useReport();
  const [pending, start] = useTransition();
  return (
    <ConfirmButton
      label={t(a.delete)}
      question={t(a.requests.deleteConfirm)}
      confirmLabel={t(a.delete)}
      disabled={pending}
      className="adm-btn adm-btn-danger w-full"
      // On success the action redirects to the list; a failure stays here and says so.
      onConfirm={() => start(async () => void report(await deleteRequest(id), t(a.requests.deleted)))}
    />
  );
}
