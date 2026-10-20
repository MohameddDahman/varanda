import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { applyContent, type Overrides } from "@/content/editable";

/** Cache tag the dashboard expires whenever texts or contact details change. */
export const CONTENT_TAG = "content";

// Static until an admin saves: the server action expires CONTENT_TAG.
const fromDatabase = unstable_cache(async (): Promise<Overrides> => fetchQuery(api.content.get, {}), ["site-content"], { tags: [CONTENT_TAG] });

/**
 * The texts and contact details changed in the dashboard, written into the site's content.
 * Every page and layout awaits this before it renders, so what they import is up to date; the
 * root layout hands the same changes to the browser (ContentSync). Without a database, or if it
 * doesn't answer, the site shows the content written in src/content.
 */
export const ensureContent = cache(async (): Promise<Overrides> => {
  let overrides: Overrides = {};
  if (process.env.NEXT_PUBLIC_CONVEX_URL) {
    try {
      overrides = await fromDatabase();
    } catch (error) {
      console.error("Content: the database didn't answer, so the built-in texts are shown.", error);
    }
  }
  applyContent(overrides);
  return overrides;
});
