"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { AdminIcon } from "./AdminIcon";

type Toast = { id: number; text: string; kind: "done" | "error" };
const ToastContext = createContext<(text: string, kind?: Toast["kind"]) => void>(() => {});

/** Short confirmations ("Saved") and errors, announced to screen readers. */
export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(0);

  const show = useCallback((text: string, kind: Toast["kind"] = "done") => {
    const id = ++next.current;
    setToasts((list) => [...list.slice(-2), { id, text, kind }]);
    // Errors stay a little longer: they usually need reading.
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), kind === "error" ? 6000 : 3500);
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div
        aria-live="polite"
        // Phones: under the top bar, clear of the tab bar and the editor's Save bar.
        className="pointer-events-none fixed inset-x-4 top-[4.25rem] z-50 flex flex-col items-center gap-2 lg:top-auto lg:bottom-6 lg:items-end"
      >
        {toasts.map((t) => (
          <p
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex max-w-md items-center gap-2.5 px-4 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgb(4_12_23/0.25)]",
              t.kind === "error" ? "bg-red-deep" : "bg-navy-900",
            )}
          >
            <AdminIcon name={t.kind === "error" ? "close" : "check"} className="h-4 w-4" />
            {t.text}
          </p>
        ))}
      </div>
    </ToastContext>
  );
}

export const useToast = () => useContext(ToastContext);
