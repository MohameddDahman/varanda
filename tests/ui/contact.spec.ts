import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { open, watchConsole } from "./helpers";

// The contact page: in the menu, and what the printed portfolio's QR code opens.

test("the QR code's addresses, old and new, open the contact page", async ({ page }) => {
  const cases: [string, RegExp][] = [
    ["/contact", /\/(en|ar)\/contact$/],
    ["/links", /\/(en|ar)\/contact$/],
    ["/links/ar", /\/ar\/contact$/],
    ["/en/links", /\/en\/contact$/],
    ["/ar/links", /\/ar\/contact$/],
  ];
  for (const [from, to] of cases) {
    await page.goto(from);
    await expect(page, from).toHaveURL(to);
  }
});

const names = { en: "Mohamed Mahrous Soliman", ar: "محمد محروس سليمان" };

for (const lang of ["en", "ar"] as const) {
  test(`contact page (${lang}): job titles, WhatsApp and calls, social pages, the form one tap away`, async ({ page }) => {
    const problems = watchConsole(page);
    await open(page, `/${lang}/contact`, { reduced: true });
    const main = page.locator(".links");

    // The site's own header and footer around it, but no floating WhatsApp button over its own.
    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator(".site-footer")).toBeAttached();
    await expect(page.locator(".whatsapp-fab")).toBeHidden();

    // People by job title only.
    await expect(main).toContainText(lang === "en" ? "Sales manager" : "مدير المبيعات");
    await expect(main).not.toContainText(names[lang]);
    expect(await main.locator('a[href^="https://wa.me/"]').count()).toBeGreaterThan(0);
    expect(await main.locator('a[href^="tel:"]').count()).toBeGreaterThan(0);

    for (const host of ["facebook.com", "instagram.com", "tiktok.com"]) {
      await expect(main.locator(`a[href^="https://www.${host}/"]`)).toHaveCount(1);
    }
    await expect(main.locator(`a[href="/${lang}/book-a-visit"]`)).toBeVisible();

    const a11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(a11y.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    expect(problems).toEqual([]);
  });
}

test("the menu's Contact opens the contact page; Book a site visit opens the form", async ({ page, isMobile }) => {
  await open(page, "/en");
  if (isMobile) {
    await page.locator(".menu-button").click();
    const menu = page.locator("#site-menu");
    await expect(menu.getByRole("link", { name: /Contact/ })).toHaveAttribute("href", "/en/contact");
    await expect(menu.getByRole("link", { name: /Book a site visit/ })).toHaveAttribute("href", "/en/book-a-visit");
  } else {
    await expect(page.locator("header nav").getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/en/contact");
    await expect(page.locator("header").getByRole("link", { name: /Book a site visit/ })).toHaveAttribute("href", "/en/book-a-visit");
  }
});
