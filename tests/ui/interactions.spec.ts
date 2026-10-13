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
  const closed = await roomLevel();

  await demo.getByRole("button", { name: /Window closed/ }).click();
  await page.waitForTimeout(1500);
  expect(await roomLevel(), "opening the window lets more sound in").toBeGreaterThan(closed + 0.3);

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

test("phones get a floating 'Book a site visit' after the first screen", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the header shows the button on larger screens");
  await open(page, "/en/systems");
  const cta = page.locator(".cta-float");
  await expect(cta).toHaveAttribute("data-hidden", "true");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await expect(cta).toHaveAttribute("data-hidden", "false");
  await expect(cta).toHaveAttribute("href", "/en/contact");
  await open(page, "/en/contact");
  await expect(page.locator(".cta-float")).toHaveCount(0);
});
