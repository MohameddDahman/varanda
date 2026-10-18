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

test("contact details link only when they're real", async ({ page }) => {
  await open(page, "/en/contact", { reduced: true });
  const lines = page.locator(".contact-lines");
  const sample = (await page.locator(".sample-tag").count()) > 0;
  const links = lines.locator('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]');
  const footerLinks = page.locator('.site-footer a[href^="tel:"], .site-footer a[href^="mailto:"], .site-footer a[href*="wa.me"]');
  if (sample) {
    await expect(links, "nothing dials while the details are samples").toHaveCount(0);
    await expect(footerLinks).toHaveCount(0);
  } else {
    // Each person can be called and messaged, and the email opens a mail app.
    const people = await lines.locator(".contact-line-actions").count();
    expect(people).toBeGreaterThan(0);
    await expect(lines.locator('a[href^="tel:"]')).toHaveCount(people);
    await expect(lines.locator('a[href*="wa.me"]')).toHaveCount(people);
    await expect(footerLinks.first()).toBeVisible();
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

test("phone opening cards end above the rail's progress line", async ({ page, isMobile }) => {
  // The tags under each window once ran past the bottom of the pinned rail, under its progress line.
  test.skip(!isMobile, "the cards only run short of room on phones");
  for (const [width, height] of [
    [390, 726],
    [360, 560],
  ]) {
    await page.setViewportSize({ width, height });
    for (const lang of ["en", "ar"]) {
      await open(page, `/${lang}`);
      const rail = await page.evaluate(() => {
        const box = document.querySelector(".rail")!.getBoundingClientRect();
        const bar = document.querySelector(".rail-progress")!.getBoundingClientRect().top - box.top;
        const gaps = [...document.querySelectorAll("[data-card]")].map((c) => bar - (c.lastElementChild!.getBoundingClientRect().bottom - box.top));
        return { height: box.height, gap: Math.round(Math.min(...gaps)) };
      });
      expect(rail.height, `${lang} at ${width}x${height}: rail height`).toBeLessThanOrEqual(height);
      expect(rail.gap, `${lang} at ${width}x${height}: space between the lowest caption and the progress line`).toBeGreaterThanOrEqual(8);
    }
  }
});

test("photos stay sharp when a tall frame crops them", async ({ page, isMobile }) => {
  // `sizes` once described only the frame's width, so on phones a landscape photo filling a
  // tall frame was drawn from a file half the size it needed and looked soft.
  test.skip(!isMobile, "the frames are tallest on phones");
  const scale = (selector: string) =>
    page.evaluate(async (sel) => {
      const img = document.querySelector<HTMLImageElement>(sel)!;
      img.scrollIntoView({ block: "center" });
      await img.decode().catch(() => {});
      // naturalWidth is corrected for the srcset density, so load the chosen file on its own.
      const file = new Image();
      file.src = img.currentSrc;
      await file.decode();
      const r = img.getBoundingClientRect();
      return Math.max((r.width * devicePixelRatio) / file.naturalWidth, (r.height * devicePixelRatio) / file.naturalHeight);
    }, selector);
  await open(page, "/en/projects/modern-villa");
  expect(await scale(".shutter img"), "project header photo, enlarged by").toBeLessThanOrEqual(1.25);
  await open(page, "/en/projects");
  // The second card spans one column, so its frame is portrait (4:5).
  expect(await scale(".projects-grid-item:nth-child(2) .shutter img"), "portrait project card, enlarged by").toBeLessThanOrEqual(1.25);
});

test("the profile section's copy stays inside it on short laptop screens", async ({ page, isMobile }) => {
  // On 1280x720 and 1366x768 the open part's text once ran past the bottom of the pinned section.
  test.skip(isMobile, "laptops only");
  await page.setViewportSize({ width: 1280, height: 720 });
  await open(page, "/en/why-upvc");
  const top = await page.evaluate(() => document.querySelector(".anatomy")!.getBoundingClientRect().top + scrollY);
  let worst = -Infinity;
  for (let d = 0; d <= 720 * 6; d += 90) {
    await page.evaluate((y) => scrollTo(0, y), top + d);
    await page.waitForTimeout(90);
    const over = await page.evaluate(() => {
      const s = document.querySelector(".anatomy")!.getBoundingClientRect();
      const c = document.querySelector(".anatomy-copy")!.getBoundingClientRect();
      return Math.abs(s.top) < 2 ? Math.max(c.bottom - s.bottom, s.top - c.top) : -Infinity;
    });
    worst = Math.max(worst, over);
  }
  expect(worst, "copy past the section edge, in px").toBeLessThanOrEqual(0);
});

test("Arabic pages don't jump when the Arabic font arrives", async ({ page, isMobile }) => {
  // Tajawal wasn't preloaded, so Arabic text first set in the narrower fallback and reflowed.
  test.skip(isMobile, "one viewport is enough");
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.addInitScript(() => {
    (window as unknown as { cls: number }).cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) if (!e.hadRecentInput) (window as unknown as { cls: number }).cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await open(page, "/ar/about");
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => (window as unknown as { cls: number }).cls), "layout shift while loading").toBeLessThan(0.1);
});

test("phone numbers stay on one line inside their column", async ({ page, isMobile }) => {
  // At 1024px the footer's contact column was narrower than a number, which broke onto two lines.
  test.skip(isMobile, "the narrow footer column is a laptop layout");
  await page.setViewportSize({ width: 1024, height: 768 });
  await open(page, "/en/contact");
  const numbers = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('footer a[href^="tel:"], .contact-line-value span')].map((el) => {
      const r = el.getBoundingClientRect();
      const col = el.closest("li, .contact-line")!.getBoundingClientRect();
      return { text: el.textContent!.trim(), oneLine: r.height < parseFloat(getComputedStyle(el).fontSize) * 2, inside: r.right <= col.right + 1 && r.left >= col.left - 1 };
    }),
  );
  expect(numbers.length).toBeGreaterThan(0);
  for (const n of numbers) expect(n, n.text).toMatchObject({ oneLine: true, inside: true });
});
