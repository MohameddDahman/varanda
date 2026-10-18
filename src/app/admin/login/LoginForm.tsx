"use client";

import { useActionState, useState } from "react";
import { a, fill } from "@/content/admin";
import { signIn, type SignInState } from "@/app/admin/actions";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { useAdminLang } from "@/components/admin/AdminLang";

export function LoginForm() {
  const { t } = useAdminLang();
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { status: "idle" });
  const [show, setShow] = useState(false);
  const error =
    state.status === "wrong"
      ? t(a.login.wrong)
      : state.status === "locked"
        ? fill(t(a.login.locked), { m: state.minutes ?? 15 })
        : state.status === "failed"
          ? t(a.failed)
          : state.status === "not-set-up"
            ? t(a.login.notSetUp)
            : null;

  return (
    <form action={action} className="mt-6">
      <label htmlFor="password" className="adm-label">
        {t(a.login.password)}
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          required
          autoFocus
          dir="ltr"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "password-error" : undefined}
          className="adm-input pe-12"
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="adm-icon-btn absolute inset-y-0 end-0 h-full" aria-label={t(show ? a.login.hide : a.login.show)} aria-pressed={show}>
          <AdminIcon name={show ? "eyeOff" : "eye"} />
        </button>
      </div>
      {error && (
        <p id="password-error" role="alert" className="mt-2 text-sm text-red-deep">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="adm-btn adm-btn-primary mt-5 w-full">
        {t(pending ? a.login.submitting : a.login.submit)}
      </button>
    </form>
  );
}
