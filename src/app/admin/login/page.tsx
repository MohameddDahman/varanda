import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { a } from "@/content/admin";
import { adminConfigured } from "@/lib/admin/session";
import { getAdminLang, isSignedIn } from "@/lib/admin/server";
import { LogoLockup } from "@/components/brand/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const lang = await getAdminLang();
  const ready = adminConfigured();
  if (ready && (await isSignedIn())) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center bg-navy-900 px-4 py-10">
      <div className="w-full max-w-sm">
        <LogoLockup className="mx-auto mb-10 h-auto w-44 text-white" />
        <div className="adm-card p-6 sm:p-8">
          <h1 className="text-xl font-semibold">{a.login.heading[lang]}</h1>
          <p className="adm-hint mt-1.5">{a.login.intro[lang]}</p>
          {ready ? (
            <LoginForm />
          ) : (
            <div role="status" className="mt-6 border-s-2 border-red ps-4">
              <p className="font-semibold">{a.login.notSetUp[lang]}</p>
              <p className="adm-hint mt-1">{a.login.notSetUpBody[lang]}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
