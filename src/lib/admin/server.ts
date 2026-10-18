import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { isLang, LANG_COOKIE, type Lang } from "@/i18n/config";
import { ADMIN_COOKIE, adminConfigured, isValidSession } from "./session";

/** True when this request carries a valid admin session. Checked again in every action. */
export const isSignedIn = cache(async () => isValidSession((await cookies()).get(ADMIN_COOKIE)?.value));

/** For admin pages and actions: back to the sign-in page unless signed in. */
export async function requireAdmin() {
  if (!adminConfigured() || !(await isSignedIn())) redirect("/admin/login");
}

/** The dashboard's language: the visitor's site language, else their browser's, else English. */
export const getAdminLang = cache(async (): Promise<Lang> => {
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(saved)) return saved;
  const accept = (await headers()).get("accept-language") ?? "";
  return /^\s*ar\b/i.test(accept) ? "ar" : "en";
});

type AdminQuery = FunctionReference<"query", "public", { token: string }>;
type AdminMutation = FunctionReference<"mutation", "public", { token: string }>;

// Admin functions in Convex check this token. It lives only in server environments.
const token = () => process.env.ADMIN_TOKEN ?? "";

// Convex's helpers type their arguments per function; these wrappers add the token for any admin one.
const query = fetchQuery as <F extends AdminQuery>(fn: F, args: FunctionArgs<F>) => Promise<FunctionReturnType<F>>;
const mutation = fetchMutation as <F extends AdminMutation>(fn: F, args: FunctionArgs<F>) => Promise<FunctionReturnType<F>>;

export function adminQuery<F extends AdminQuery>(fn: F, args: Omit<FunctionArgs<F>, "token">): Promise<FunctionReturnType<F>> {
  return query(fn, { ...args, token: token() } as FunctionArgs<F>);
}

export function adminMutation<F extends AdminMutation>(fn: F, args: Omit<FunctionArgs<F>, "token">): Promise<FunctionReturnType<F>> {
  return mutation(fn, { ...args, token: token() } as FunctionArgs<F>);
}
