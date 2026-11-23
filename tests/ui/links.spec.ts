import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { watchConsole } from "./helpers";

// The page the printed QR code opens: its own layout, none of the site's chrome.

test("the QR code's address opens the links page in the visitor's language", async ({ page }) => {
  await page.goto("/links");
  await expect(page).toHaveURL(/\/links\/(en|ar)$/);
  await page.goto("/en/links");
  await expect(page).toHaveURL(/\/links\/en$/);
  await page.goto("/ar/links");
  await expect(page).toHaveURL(/\/links\/ar$/);
});

for (const lang of ["en", "ar"] as const) {
  test(`links page (${lang}) stands alone and links everywhere`, async ({ page }) => {
    const problems = watchConsole(page);
    const response = await page.goto(`/links/${lang}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    // None of the site's header, footer, door transition or floating WhatsApp button.
    await expect(page.locator(".site-header, .site-main, [data-doors], .whatsapp-fab")).toHaveCount(0);

    await expect(page.locator('a[href^="https://www.facebook.com/"]')).toHaveCount(1);
    await expect(page.locator('a[href^="https://www.instagram.com/"]')).toHaveCount(1);
    await expect(page.locator('a[href^="https://www.tiktok.com/"]')).toHaveCount(1);
    expect(await page.locator('a[href^="https://wa.me/"]').count()).toBeGreaterThan(0);
    expect(await page.locator('a[href^="tel:"]').count()).toBeGreaterThan(0);
    await expect(page.locator(`a[href="/${lang}"]`).first()).toBeVisible();
    await expect(page.locator(`a[href="/links/${lang === "en" ? "ar" : "en"}"]`)).toBeVisible();

    // The sash and the fade-in settle first; half-faded text would fail the contrast check.
    await page.waitForFunction(() => document.getAnimations().every((a) => a.playState === "finished"));
    const a11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(a11y.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    expect(problems).toEqual([]);
  });
}
