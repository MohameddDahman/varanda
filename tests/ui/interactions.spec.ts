import { expect, test } from "@playwright/test";
import { open, watchConsole } from "./helpers";

test("the doors carry you to the next page", async ({ page, isMobile }) => {
  test.skip(isMobile, "the header links live in the menu on phones");
  const problems = watchConsole(page);
  await open(page, "/en");
  await page.locator("header nav").getByRole("link", { name: "Projects" }).click();
  await expect(page.locator("[data-doors]")).toBeVisible();
  await expect(page).toHaveURL(/\/en\/projects$/);
  await expect(page.locator("[data-doors]")).toBeHidden({ timeout: 15_000 });
  await expect(page.locator("h1")).toBeVisible();
  expect(problems).toEqual([]);
});

test("the phone menu opens, and Escape closes it", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the menu button only shows on small screens");
  await open(page, "/en");
  const button = page.locator(".menu-button");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#site-menu").getByRole("link", { name: "Contact" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
});

test("the language switch is a real link and lands on the Arabic page", async ({ page }) => {
  await open(page, "/en/systems/glass");
  const link = page.locator("header .header-lang");
  await expect(link).toHaveAttribute("href", "/ar/systems/glass");
  await expect(link).toHaveAttribute("hreflang", "ar");
  await link.click();
  await page.waitForURL("**/ar/systems/glass", { timeout: 20_000 });
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("[data-doors]")).toBeHidden({ timeout: 15_000 });
});

test("filtering projects uncovers every photo in view", async ({ page }) => {
  // Cards that moved into view used to stay behind their closed shutter.
  await open(page, "/en/projects");
  await page.evaluate(() => window.scrollTo(0, 560));
  await page.waitForTimeout(1200);
  for (const name of [/Residential/, /Outdoor/, /All/]) {
    await page.getByRole("button", { name }).first().click();
    await page.waitForTimeout(2000);
    const shuttered = await page.evaluate(() =>
      [...document.querySelectorAll(".shutter")].filter((s) => {
        const r = s.getBoundingClientRect();
        const inView = r.width > 0 && r.bottom > 80 && r.top < window.innerHeight - 40;
        const closed = [...s.querySelectorAll("[data-slat]")].some((slat) => new DOMMatrix(getComputedStyle(slat).transform).d > 0.05);
        return inView && closed;
      }).length,
    );
    expect(shuttered, `photos still shuttered after filtering ${name}`).toBe(0);
  }
});

test("the wind sound plays, follows the window, and stops when you scroll away", async ({ page, isMobile }) => {
  test.skip(isMobile, "one viewport is enough for the audio logic");
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    (window as unknown as { __ctx: AudioContext[] }).__ctx = [];
    window.AudioContext = class extends Native {
      constructor(options?: AudioContextOptions) {
        super(options);
        (window as unknown as { __ctx: AudioContext[] }).__ctx.push(this);
      }
    };
  });
  await open(page, "/en/why-upvc");
  const demo = page.locator(".demo-acoustic");
  await demo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const contexts = () => page.evaluate(() => (window as unknown as { __ctx: AudioContext[] }).__ctx.map((c) => c.state));
  const roomLevel = () => demo.locator(".wave-bars.is-inside").evaluate((el) => parseFloat(el.style.getPropertyValue("--amp")) || 0);

  expect(await contexts(), "no audio before the visitor asks for it").toEqual([]);
  await demo.getByRole("button", { name: /Hear the difference/ }).click();
  await expect(demo).toHaveClass(/is-live/);
  await page.waitForTimeout(1200);
  expect(await contexts()).toEqual(["running"]);
  // The window starts open; closing it is the visitor's first move.
  // Wait for the bars to follow the open-window sound before closing it (slow under load).
  await expect.poll(roomLevel, { message: "the open window lets the wind in", timeout: 8000 }).toBeGreaterThan(0.5);

  await demo.getByRole("button", { name: /Window open/ }).click();
  await expect.poll(roomLevel, { message: "closing the window shuts the noise out", timeout: 8000 }).toBeLessThan(0.25);

  await page.evaluate(() => window.scrollBy(0, 2500));
  await expect(demo).not.toHaveClass(/is-live/, { timeout: 5_000 });
  await expect.poll(contexts, { timeout: 5_000 }).toEqual(["closed"]);
});

test("the request form explains what's missing and what happens next", async ({ page }) => {
  await open(page, "/en/contact", { reduced: true });
  const form = page.locator("form.contact-form");
  await form.getByRole("button", { name: /Request a site visit/ }).click();
  await expect(form.locator("#name")).toHaveAttribute("aria-invalid", "true");
  await expect(form.locator("#name-error")).toBeVisible();
  await expect(form.locator("#phone-error")).toBeVisible();

  await form.locator("#name").fill("Test Person");
  await form.locator("#phone").fill("+20 111 222 3333");
  await form.locator("label.choice", { hasText: "Villa" }).click();
  await form.getByRole("button", { name: /Request a site visit/ }).click();
  // Without the inquiry store connected the form says so plainly; once connected it thanks the visitor.
  await expect(page.locator(".form-notice, .contact-done").first()).toBeVisible({ timeout: 15_000 });
});

test("the lock demo opens the sash on its side hinges, tilts it on its bottom ones, and locks", async ({ page }) => {
  await open(page, "/en/systems/hardware");
  const lock = page.locator(".lock-mech");
  await lock.scrollIntoViewIfNeeded();
  const keeper = () => lock.locator("[data-keeper-3d]").first().evaluate((el) => getComputedStyle(el).backgroundColor);
  // The sash's two movements, in degrees: turned about its side (rotateY), leaned about its bottom (rotateX).
  const sash = () =>
    lock.evaluate((root) => {
      const m = (sel: string) => new DOMMatrix(getComputedStyle(root.querySelector(sel)!).transform);
      const turn = m("[data-sash-turn]");
      const tilt = m("[data-sash-tilt]");
      const deg = (r: number) => Math.round((r * 180) / Math.PI) || 0; // no -0
      return { turn: deg(Math.atan2(-turn.m13, turn.m11)), tilt: deg(Math.atan2(tilt.m23, tilt.m22)) };
    });

  await lock.getByRole("button", { name: "Open" }).click();
  await expect(lock.getByRole("button", { name: "Open" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(sash).toEqual({ turn: -30, tilt: 0 });
  expect(await keeper()).not.toBe("rgb(215, 25, 32)");

  // Tilt closes the open sash first, then leans it in from the top.
  await lock.getByRole("button", { name: "Tilt" }).click();
  await expect.poll(sash).toEqual({ turn: 0, tilt: -13 });
  await expect(lock.locator("[aria-live]")).toContainText("bottom hinges");

  await lock.getByRole("button", { name: "Locked" }).click();
  await expect.poll(sash).toEqual({ turn: 0, tilt: 0 });
  await expect.poll(keeper).toBe("rgb(215, 25, 32)");
  await expect(lock.locator("[aria-live]")).toContainText("locking points hook into the strikers");
});

test("looping animations rest while they are off screen", async ({ page }) => {
  await open(page, "/en/why-upvc");
  await page.waitForTimeout(1500);
  // At the top of the page the closing marquee and the demos' loops are all out of view: nothing
  // should be restyled frame after frame.
  const restyles = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let n = 0;
        const mo = new MutationObserver((list) => (n += list.length));
        mo.observe(document.body, { attributes: true, attributeFilter: ["style"], subtree: true });
        setTimeout(() => {
          mo.disconnect();
          resolve(n);
        }, 800);
      }),
  );
  expect(restyles).toBeLessThan(3);
  await expect(page.locator(".demo-acoustic")).toHaveAttribute("data-offscreen", "");
});

test("the thermal demo compares an ordinary window with uPVC", async ({ page }) => {
  await open(page, "/en/why-upvc");
  const demo = page.locator(".demo-thermal-wrap");
  await expect(demo).not.toHaveClass(/is-upvc/);
  await demo.getByRole("button", { name: "uPVC window" }).click();
  await expect(demo).toHaveClass(/is-upvc/);
});

test("the WhatsApp button opens a chat with the greeting typed", async ({ page }) => {
  await open(page, "/ar/projects");
  const button = page.getByRole("link", { name: "تواصل معنا عبر واتساب" });
  await expect(button).toBeVisible();
  const href = (await button.getAttribute("href")) ?? "";
  expect(href).toMatch(/^https:\/\/wa\.me\/\d{10,15}\?text=/);
  expect(decodeURIComponent(href.split("text=")[1])).toContain("أود الاستفسار");
  // Bottom right, in Arabic too, as the client asked.
  const box = await button.boundingBox();
  const view = page.viewportSize();
  expect(box && view && box.x > view.width / 2 && box.y > view.height / 2).toBe(true);
});

test("the hero's words are the home page's largest content, drawn in the first frame", async ({ page }) => {
  // PageSpeed's LCP: Chrome skips the full-screen photo as a background, so the hero's words must
  // be the largest thing drawn, in the very first frame. A bigger image winning instead, or the
  // hero being moved after it was drawn (ScrollTrigger's own pin spacer), cost seconds of LCP.
  type Paints = { fcp?: number; lcp: { t: number; word: boolean }[] };
  await page.addInitScript(() => {
    const paints: Paints = { lcp: [] };
    (window as unknown as { paints: Paints }).paints = paints;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (e.name === "first-contentful-paint") paints.fcp = e.startTime;
    }).observe({ type: "paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as (PerformanceEntry & { element?: Element })[])
        paints.lcp.push({ t: e.startTime, word: !!e.element?.closest(".hero-word") });
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  // A first visit, logo intro and all.
  await page.goto("/en", { waitUntil: "load" });
  await expect(page.locator("[data-doors]")).toBeHidden({ timeout: 15_000 });
  const paints = await page.evaluate(() => (window as unknown as { paints: Paints }).paints);
  const largest = paints.lcp.at(-1);
  expect(largest?.word, "largest content is a hero word").toBe(true);
  expect(largest?.t, "drawn in the first contentful frame").toBe(paints.fcp);
});
