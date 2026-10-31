import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { langs, open, routes, scrollThrough, watchConsole } from "./helpers";

// Every page, in both languages, on desktop and phone. Reduced motion puts every
// animated section in its final state, so the checks see the page as it settles.
for (const lang of langs) {
  for (const route of routes) {
    const url = `/${lang}${route.path}`;

    test(`${url} renders cleanly`, async ({ page }) => {
      const problems = watchConsole(page, { allow404: route.status === 404 });
      const response = await open(page, url, { reduced: true });
      expect(response?.status(), "HTTP status").toBe(route.status ?? 200);

      // Language and direction.
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");

      // The company profile's typefaces are the ones actually in use.
      const family = lang === "ar" ? "Tajawal" : "Montserrat";
      const fonts = await page.evaluate(async () => {
        await document.fonts.ready;
        return {
          body: getComputedStyle(document.body).fontFamily,
          loaded: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")),
        };
      });
      expect(fonts.body.replace(/"/g, ""), "body font").toMatch(new RegExp(`^${family}`));
      expect(fonts.loaded, "loaded fonts").toContain(family);

      await scrollThrough(page);

      // Nothing pushes the page sideways (a common phone bug with long words and wide type).
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(1);

      // No broken images.
      const broken = await page.evaluate(() =>
        [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
      );
      expect(broken, "broken images").toEqual([]);

      // One page title.
      await expect(page.locator("h1")).toHaveCount(1);

      // What search engines and link previews read: a canonical link to the page itself and a
      // share picture that loads (a page's own openGraph once dropped the layout's).
      if (!route.status) {
        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
        expect(canonical && new URL(canonical).pathname, "canonical link").toBe(url);
        const image = await page.locator('meta[property="og:image"]').getAttribute("content");
        expect(image, "share image (og:image)").toBeTruthy();
        const { pathname, search } = new URL(image!);
        const shared = await page.request.get(pathname + search);
        expect(shared.headers()["content-type"], "share image type").toMatch(/^image\//);
      }

      // Accessibility: WCAG 2.2 AA plus best practices, no violations.
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      const violations = axe.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
      expect(violations, "accessibility violations").toEqual([]);

      expect(problems, "console problems").toEqual([]);
    });
  }
}
