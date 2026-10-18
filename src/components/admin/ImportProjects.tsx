"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { a, fill } from "@/content/admin";
import { importSiteProject } from "@/app/admin/actions";
import { AdminIcon } from "./AdminIcon";
import { useAdminLang } from "./AdminLang";
import { useToast } from "./Toaster";

/** Copies the projects built into the site into the database, one at a time, with progress. */
export function ImportProjects({ slugs }: { slugs: string[] }) {
  const { t } = useAdminLang();
  const toast = useToast();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const run = async () => {
    for (const [i, slug] of slugs.entries()) {
      setStep(i + 1);
      const result = await importSiteProject(slug);
      if (!result.ok) {
        toast(t(a.errors[result.error as keyof typeof a.errors] ?? a.failed), "error");
        setStep(0);
        router.refresh();
        return;
      }
    }
    toast(t(a.projects.imported));
    setStep(0);
    router.refresh();
  };

  return (
    <div className="mt-6">
      <button type="button" disabled={step > 0} onClick={run} className="adm-btn adm-btn-dark">
        <AdminIcon name="upload" />
        {step ? fill(t(a.projects.importing), { i: step, n: slugs.length }) : t(a.projects.import)}
      </button>
      {step > 0 && (
        <div className="mt-3 h-1 max-w-xs bg-paper-2" role="progressbar" aria-valuemin={0} aria-valuemax={slugs.length} aria-valuenow={step}>
          <div className="h-full bg-red transition-[width] duration-500" style={{ width: `${(step / slugs.length) * 100}%` }} />
        </div>
      )}
    </div>
  );
}
