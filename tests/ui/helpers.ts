import { expect, type Page } from "@playwright/test";

export const langs = ["en", "ar"] as const;
export type Lang = (typeof langs)[number];

/** Every page on the site, with the status it should answer with. */
export const routes: { path: string; status?: number }[] = [
  { path: "" },
  { path: "/systems" },
  { path: "/systems/windows-doors" },
  { path: "/systems/glass" },
  { path: "/systems/roller-shutters" },
  { path: "/systems/fly-screens" },
  { path: "/systems/hardware" },
  { path: "/projects" },
  { path: "/projects/modern-villa" },
  { path: "/projects/garden-villa" },
  { path: "/projects/nile-view-apartment" },
  { path: "/projects/sea-view-house" },
  { path: "/projects/pool-villa" },
  { path: "/projects/red-villa" },
  { path: "/projects/round-windows-villa" },
  { path: "/projects/american-university" },
  { path: "/projects/french-doors-apartment" },
  { path: "/projects/arched-doors-apartment" },
  { path: "/projects/stone-villa" },
  { path: "/projects/villa-roller-shutters" },
  { path: "/projects/pergolas" },
  { path: "/projects/garden-fencing" },
  { path: "/projects/classic-apartment" },
  { path: "/projects/family-home" },
  { path: "/why-upvc" },
  { path: "/about" },
  { path: "/contact" },
  { path: "/book-a-visit" },
  { path: "/missing-page", status: 404 },
];

/** Console output that means something is broken, not just chatty. */
const PROBLEM = /Invalid property|Missing plugin|target .* not found|not a valid|Hydration|did not match|Warning:/i;

/**
 * Records page errors, console errors and animation-library warnings (a missing GSAP
 * plugin only ever shows up as a console warning).
 */
export function watchConsole(page: Page, { allow404 = false } = {}) {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
  page.on("console", (m) => {
    // Embedded third-party frames (the Google map) log their own noise; only our pages count.
    const from = m.location().url;
    if (from && page.url() && new URL(from).origin !== new URL(page.url()).origin) return;
    const text = m.text();
    if (m.type() === "error") {
      if (allow404 && /status of 404/.test(text)) return;
      problems.push(`console error: ${text}`);
    } else if (m.type() === "warning" && PROBLEM.test(text)) {
      problems.push(`console warning: ${text}`);
    }
  });
  return problems;
}

/**
 * Opens a page the way a returning visitor sees it: the first-visit logo intro is
 * skipped, and the call waits until the transition doors have opened.
 */
export async function open(page: Page, url: string, { reduced = false } = {}) {
  await page.addInitScript(() => sessionStorage.setItem("varanda:intro", "1"));
  if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });
  const response = await page.goto(url, { waitUntil: "networkidle" });
  await expect(page.locator("[data-doors]")).toBeHidden({ timeout: 15_000 });
  return response;
}

/** Scrolls to the bottom in steps so lazy images and scroll scenes run, then back up. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 70));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}
