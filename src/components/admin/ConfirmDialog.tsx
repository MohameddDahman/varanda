"use client";

import { useRef } from "react";
import { a } from "@/content/admin";
import { useAdminLang } from "./AdminLang";

/**
 * A button that asks before doing something that can't be undone. A native <dialog>, so focus
 * stays inside and Escape cancels.
 */
export function ConfirmButton({
  label,
  question,
  confirmLabel,
  onConfirm,
  disabled,
  className = "adm-btn adm-btn-danger",
  children,
}: {
  label: string;
  question: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { t } = useAdminLang();
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className={className} disabled={disabled} onClick={() => dialog.current?.showModal()} aria-label={children ? label : undefined}>
        {children ?? label}
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] border border-[var(--line)] bg-white p-0 text-ink backdrop:bg-navy-950/60"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        {/* Plain buttons, not <form method="dialog">: this can sit inside the project editor's form. */}
        <div className="p-6">
          <p className="text-[1.0625rem] leading-relaxed">{question}</p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button type="button" className="adm-btn adm-btn-outline" autoFocus onClick={() => dialog.current?.close()}>
              {t(a.cancel)}
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={() => {
                dialog.current?.close();
                onConfirm();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
