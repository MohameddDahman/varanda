import { NextResponse, type NextRequest } from "next/server";
import { defaultLang, isLang, LANG_COOKIE, locales, type Lang } from "@/i18n/config";

function preferredLang(request: NextRequest): Lang {
  const saved = request.cookies.get(LANG_COOKIE)?.value;
  if (isLang(saved)) return saved;

  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { base } of ranked) if (isLang(base)) return base;
  return defaultLang;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLang = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLang) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLang(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, generated icons and anything that looks like a file.
  matcher: ["/((?!_next|api|icon|apple-icon|.*\\..*).*)"],
};
