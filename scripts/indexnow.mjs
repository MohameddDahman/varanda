// Tells search engines that support IndexNow (Bing, and through it DuckDuckGo and Yahoo;
// Yandex, Seznam, Naver…) about every page in the live sitemap, so they crawl it now instead
// of whenever they find it. Google doesn't take part: use Search Console for Google.
//
//   node scripts/indexnow.mjs https://varandasystems.com
//
// The key is the file in public/ named <key>.txt, which proves the site is ours.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const site = (process.argv[2] ?? "https://varandasystems.com").replace(/\/$/, "");
const root = path.resolve(import.meta.dirname, "..");
const keyFile = readdirSync(path.join(root, "public")).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("No IndexNow key file (public/<32 hex>.txt)");
const key = readFileSync(path.join(root, "public", keyFile), "utf8").trim();

const live = await fetch(`${site}/${keyFile}`).then((r) => (r.ok ? r.text() : ""));
if (live.trim() !== key) throw new Error(`${site}/${keyFile} doesn't serve the key yet: deploy first`);

const xml = await (await fetch(`${site}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${keyFile}`, urlList }),
});
console.log(`submitted ${urlList.length} URLs: ${res.status} ${res.statusText}`);
