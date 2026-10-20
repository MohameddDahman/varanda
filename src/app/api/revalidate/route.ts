import { revalidateTag } from "next/cache";
import { PROJECTS_TAG } from "@/lib/site-projects";
import { CONTENT_TAG } from "@/lib/site-content";

const TAGS = new Set([PROJECTS_TAG, CONTENT_TAG]);

/** Constant-time comparison, so the token can't be guessed a character at a time. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Refreshes the site after a change made outside the dashboard (scripts/compress-photos.mjs,
 * seed-projects.mjs). POST { tags: ["projects"] } with "Authorization: Bearer <ADMIN_TOKEN>".
 */
export async function POST(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  const sent = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!token || !safeEqual(sent, token)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { tags?: unknown };
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string" && TAGS.has(t)) : [];
  // The old photo files are about to be deleted, so stale pages must not be served.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}
