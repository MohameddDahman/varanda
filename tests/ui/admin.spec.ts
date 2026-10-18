import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// The dashboard needs the database and its secrets. Without them (a fresh checkout, or a server
// where it isn't set up) these tests skip.
function adminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (!existsSync(".env.local")) return undefined;
  const line = readFileSync(".env.local", "utf8")
    .split("\n")
    .find((l) => l.startsWith("ADMIN_PASSWORD="));
  return line?.slice("ADMIN_PASSWORD=".length).trim() || undefined;
}
const password = adminPassword();

async function signIn(page: Page) {
  await page.goto("/admin/login");
  test.skip(!(await page.locator("#password").count()), "the dashboard isn't set up on this server");
  await page.fill("#password", password!);
  await Promise.all([page.waitForURL(/\/admin$/), page.click('button[type="submit"]')]);
}

test.describe("admin dashboard", () => {
  test.skip(!password, "no ADMIN_PASSWORD here");
  // Each test changes shared data; one at a time keeps them from tripping over each other.
  test.describe.configure({ mode: "serial" });

  test("is locked behind the password", async ({ page }) => {
    await page.goto("/admin/projects");
    await expect(page).toHaveURL(/\/admin\/login$/);
    test.skip(!(await page.locator("#password").count()), "the dashboard isn't set up on this server");
    await page.fill("#password", "not-the-password");
    await page.click('button[type="submit"]');
    await expect(page.getByRole("alert")).toBeVisible();
    await signIn(page); // a success also clears the failed attempt
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("a request from the contact form reaches the inbox and can be worked through", async ({ page, isMobile }) => {
    test.skip(isMobile, "one pass is enough for the data flow");
    const name = `Test visitor ${Date.now() % 100000}`;
    await page.goto("/en/contact");
    await page.fill("#name", name);
    await page.fill('input[name="phone"]', "+20 100 000 0000");
    // The radios are drawn by their labels.
    await page.locator('label:has(input[name="projectType"])').first().click();
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator(".contact-done")).toBeVisible({ timeout: 20_000 });

    await signIn(page);
    await page.goto("/admin/requests");
    await page.getByRole("link", { name: new RegExp(name) }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    await page.locator('.adm-segment:visible button:has-text("Contacted")').click();
    await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
    await page.reload();
    await expect(page.locator('.adm-segment:visible button[aria-pressed="true"]')).toHaveText("Contacted");

    // Clean up: delete it.
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
    await expect(page).toHaveURL(/\/admin\/requests$/);
    await expect(page.getByText(name)).toHaveCount(0);
  });

  test("a project edit shows on the site, and photos upload", async ({ page, isMobile }) => {
    test.skip(isMobile, "one pass is enough for the data flow");
    await signIn(page);
    await page.goto("/admin/projects");
    test.skip(!(await page.locator("ol > li").count()), "no projects in the database to edit");
    await page.locator("ol > li a").first().click();
    await page.waitForURL(/\/admin\/projects\/.+/);
    const slug = await page.inputValue("#slug");
    const title = page.locator('input[lang="en"]').first();
    const original = await title.inputValue();
    const save = page.getByRole("button", { name: "Save", exact: true });

    await title.fill(`${original} (test)`);
    await save.click();
    await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
    const site = await page.context().newPage();
    await site.goto(`/en/projects/${slug}`);
    await expect(site.locator("h1")).toContainText(`${original} (test)`);

    // Upload a photo, then take it out again.
    const photos = page.locator("#photos li");
    const before = await photos.count();
    await page.setInputFiles('input[type="file"]', path.resolve("src/assets/photos/round-window.jpg"));
    await expect(photos).toHaveCount(before + 1, { timeout: 60_000 });
    await photos.last().getByRole("button", { name: "Remove photo" }).click();
    await title.fill(original);
    await save.click();
    await expect(page.getByRole("status").filter({ hasText: "Saved" }).last()).toBeVisible();
    await expect(photos).toHaveCount(before);
    await site.reload();
    await expect(site.locator("h1")).not.toContainText("(test)");
  });

  test("every screen fits the device and passes accessibility checks", async ({ page, isMobile }) => {
    await signIn(page);
    const screens = ["/admin", "/admin/requests", "/admin/projects", "/admin/projects/new"];
    await page.goto("/admin/projects");
    const firstProject = await page.locator("ol > li a").first().getAttribute("href");
    if (firstProject) screens.push(firstProject);
    for (const url of screens) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${url}: sideways overflow in px`).toBeLessThanOrEqual(1);
      // Phones navigate with the bottom tab bar, desktops with the sidebar.
      await expect(page.locator(isMobile ? ".adm-tabbar" : "aside nav")).toBeVisible();
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
      expect(axe.violations.map((v) => `${url} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    }
  });
});
