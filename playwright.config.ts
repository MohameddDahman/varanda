import { defineConfig } from "@playwright/test";

/**
 * UI tests. By default they build the site and run it on a local production server;
 * set BASE_URL to test a deployed site instead (e.g. https://varanda-kappa.vercel.app).
 *
 * On Windows they drive the installed Microsoft Edge, so no browser download is needed.
 * Elsewhere run `npx playwright install chromium` once (or set PW_CHANNEL).
 */
const PORT = 3100;
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const channel = process.env.PW_CHANNEL ?? (process.platform === "win32" ? "msedge" : undefined);

export default defineConfig({
  testDir: "tests/ui",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "tests/ui/report" }]],
  outputDir: "tests/ui/results",
  use: {
    baseURL,
    channel,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run start -- --port ${PORT}`,
        url: `${baseURL}/en`,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
      },
});
