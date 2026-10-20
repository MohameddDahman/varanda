"use client";

import { applyContent, type Overrides } from "@/content/editable";

/**
 * Puts the dashboard's text and contact changes into the browser's copy of the content before
 * anything below it renders, so the page hydrates with exactly what the server rendered.
 */
export function ContentSync({ value, children }: { value: Overrides; children: React.ReactNode }) {
  applyContent(value);
  return children;
}
