import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { open, routes, scrollThrough, watchConsole } from "./helpers";

// Regression checks for UI bugs found while building the site.

test("the header blurs what scrolls under it", async ({ page }) => {
  // The CSS minifier once dropped the unprefixed backdrop-filter, so Chrome never blurred.
  await open(page, "/en/why-upvc");
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.evaluate(() => window.scrollBy(0, -200)); // scrolling up brings the header back
  await expect(page.locator(".site-header")).toHaveAttribute("data-scrolled", "true");
  const bar = await page.evaluate(() => {
    const s = getComputedStyle(document.querySelector(".site-header")!, "::before");
    return { blur: s.backdropFilter, alpha: Number(s.backgroundColor.match(/[\d.]+(?=\)$)/)?.[0] ?? 1) };
  });
  expect(bar.blur).toContain("blur");
  expect(bar.alpha, "header background opacity").toBeGreaterThanOrEqual(0.8);
});

test("hero labels stay on their own door panel", async ({ page }) => {
  // The "uPVC window & door systems" label once ran across the seam on phones.
  await open(page, "/en");
  await page.waitForTimeout(1200);
  const boxes = await page.evaluate(() => {
    const rect = (el: Element | null) => el?.getBoundingClientRect().toJSON();
    const [left, right] = document.querySelectorAll(".hero-meta > *");
    return {
      left: rect(left),
      right: rect(right),
      leftPanel: rect(document.querySelector(".hero-panel-left")),
      rightPanel: rect(document.querySelector(".hero-panel-right")),
    };
  });
  expect(boxes.left.right, "left label inside the left panel").toBeLessThanOrEqual(boxes.leftPanel.right);
  expect(boxes.right.left, "right label inside the right panel").toBeGreaterThanOrEqual(boxes.rightPanel.left);
});

test("the logo keeps its order on Arabic pages", async ({ page }) => {
  await open(page, "/ar");
  const [mark, word] = await page.locator(".header-logo svg").evaluateAll((svgs) => svgs.map((s) => s.getBoundingClientRect().left));
  expect(mark, "mark sits to the left of the wordmark").toBeLessThan(word);
});

test("paragraph tracking: open in English, joins intact in Arabic", async ({ page }) => {
  await open(page, "/en/about", { reduced: true });
  const en = await page.locator(".t-lead, .t-body").first().evaluate((el) => parseFloat(getComputedStyle(el).letterSpacing) || 0);
  expect(en, "English paragraphs are tracked open").toBeGreaterThan(0);

  await open(page, "/ar/about", { reduced: true });
  const ar = await page.locator(".t-lead, .t-body").first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { letter: parseFloat(s.letterSpacing) || 0, word: parseFloat(s.wordSpacing) || 0 };
  });
  // Letter-spacing breaks the joins between Arabic letters in some browsers; space words instead.
  expect(ar.letter, "no letter-spacing on Arabic").toBe(0);
  expect(ar.word, "Arabic words spaced open").toBeGreaterThan(0);
});

test("sections on the same background don't stack two gaps", async ({ page }) => {
  for (const route of routes.filter((r) => !r.status)) {
    await open(page, `/en${route.path}`, { reduced: true });
    const doubled = await page.evaluate(() => {
      const theme = (el: Element) => [...el.classList].find((c) => c.startsWith("theme-"));
      const sections = [...document.querySelectorAll("main > section, main > div > section")];
      const out: string[] = [];
      for (let i = 1; i < sections.length; i++) {
        const [a, b] = [sections[i - 1], sections[i]];
        if (!theme(a) || theme(a) !== theme(b)) continue;
        const bottom = parseFloat(getComputedStyle(a).paddingBottom);
        const top = parseFloat(getComputedStyle(b).paddingTop);
        if (bottom > 0 && top > 0) out.push(`${a.getAttribute("aria-labelledby") ?? i - 1} → ${b.getAttribute("aria-labelledby") ?? i}: ${bottom}+${top}px`);
      }
      return out;
    });
    expect(doubled, `doubled gaps on /en${route.path}`).toEqual([]);
  }
});

test("sample contact details never dial anyone", async ({ page }) => {
  await open(page, "/en/contact", { reduced: true });
  const sample = (await page.locator(".sample-tag").count()) > 0;
  const linked = await page.locator(".contact-line[href]").count();
  const cards = await page.locator(".contact-line").count();
  const footerLinks = await page.locator('.site-footer a[href^="tel:"], .site-footer a[href^="mailto:"], .site-footer a[href*="wa.me"]').count();
  if (sample) {
    expect(linked, "no linked contact cards while the details are samples").toBe(0);
    expect(footerLinks, "no contact links in the footer while the details are samples").toBe(0);
  } else {
    expect(linked, "every contact card links once the details are real").toBe(cards);
  }
});

test("split text stays readable to screen readers while animating", async ({ page }) => {
  // SplitText once put aria-label on paragraphs and hid the words, so they read as nothing.
  const problems = watchConsole(page);
  for (const url of ["/en", "/ar/projects/nile-view-apartment"]) {
    await open(page, url);
    await scrollThrough(page);
    const axe = await new AxeBuilder({ page }).withRules(["aria-prohibited-attr", "aria-allowed-attr", "aria-hidden-focus"]).analyze();
    expect(axe.violations.map((v) => `${url} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  }
  expect(problems, "console problems with motion on").toEqual([]);
});
