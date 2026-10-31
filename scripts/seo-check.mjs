// Checks what search engines see on the live site, the way a crawler does: robots.txt, the
// sitemap, the other ways of typing the address (http://, www.), then on every page in the
// sitemap the status, language, title, description, canonical link, language alternates,
// robots tags, main heading, business data, share image and image alt text, and finally
// every internal link the pages make.
//
//   node scripts/seo-check.mjs https://varandasystems.com
//
// It can't tell whether Google has indexed the site yet: Search Console's URL Inspection does.
const site = (process.argv[2] ?? "https://varandasystems.com").replace(/\/$/, "");
const { host, hostname } = new URL(site);

const problems = [];
const warnings = [];
const ok = (msg) => console.log(`  ok    ${msg}`);

const entities = { amp: "&", quot: '"', lt: "<", gt: ">", "#x27": "'", "#39": "'", apos: "'" };
const decode = (s) => s.replace(/&(amp|quot|lt|gt|#x27|#39|apos);/g, (_, e) => entities[e]);
const path = (url) => new URL(url).pathname;

/** The attributes of every <name …> tag in the page, attribute names lower-cased. */
const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map(([, body]) =>
    Object.fromEntries(
      [...body.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map((a) => [
        a[1].toLowerCase(),
        decode(a[2] ?? a[3] ?? a[4] ?? ""),
      ]),
    ),
  );

/** One request with redirects not followed, so a redirect shows up as one. */
async function get(url, { body = true } = {}) {
  const t0 = Date.now();
  const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "varanda-seo-check" } });
  let text = "";
  if (body && res.status === 200) text = await res.text();
  else await res.body?.cancel();
  return { status: res.status, headers: res.headers, location: res.headers.get("location"), text, ms: Date.now() - t0 };
}

console.log(`SEO check of ${site}\n`);

const robots = await get(`${site}/robots.txt`);
if (robots.status !== 200) problems.push(`robots.txt answers ${robots.status}`);
else if (/^disallow:\s*\/\s*$/im.test(robots.text)) problems.push("robots.txt blocks the whole site (Disallow: /)");
else if (!robots.text.includes(`Sitemap: ${site}/sitemap.xml`)) warnings.push("robots.txt doesn't point to the sitemap");
else ok("robots.txt lets search engines in and points to the sitemap");

const sitemap = await get(`${site}/sitemap.xml`);
const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
const elsewhere = urls.filter((u) => new URL(u).host !== host);
if (!urls.length) problems.push(`sitemap.xml lists no pages (it answers ${sitemap.status})`);
else if (elsewhere.length) problems.push(`sitemap.xml lists ${elsewhere.length} pages on another address, e.g. ${elsewhere[0]}`);
else ok(`sitemap.xml lists ${urls.length} pages`);

// The other ways of typing the address should all land on the site.
for (const from of [`http://${host}/`, `https://www.${hostname}/`]) {
  const fix = from.includes("www.") ? `: add www.${hostname} in Vercel → Settings → Domains, redirecting to ${hostname}` : "";
  try {
    const r = await get(from, { body: false });
    const to = r.location && new URL(r.location, from);
    if (r.status >= 300 && r.status < 400 && to.origin === site) ok(`${from} redirects to ${site}`);
    else problems.push(`${from} answers ${r.status}${to ? ` → ${to}` : ""} instead of redirecting to ${site}${fix}`);
  } catch (e) {
    problems.push(`${from} doesn't open (${e.cause?.code ?? e.message})${fix}`);
  }
}
const root = await get(`${site}/`, { body: false });
if (root.status >= 300 && root.status < 400) ok(`${site}/ sends visitors to ${path(new URL(root.location, site))}`);
else if (root.status !== 200) problems.push(`${site}/ answers ${root.status}`);

const inSitemap = new Set(urls);
const titles = new Map(); // title → the first page using it
const descriptions = new Map();
const shareImages = new Map(); // image → a page using it
const internal = new Map(); // linked address → a page linking to it
const snippets = [];
const times = [];

for (const url of urls) {
  const p = path(url);
  const page = await get(url);
  times.push(page.ms);
  if (page.status !== 200) {
    problems.push(`${p} answers ${page.status}${page.location ? ` → ${page.location}` : ""}`);
    continue;
  }
  const html = page.text;
  const lang = p.split("/")[1];
  const metas = tags(html, "meta");
  const meta = (key) => metas.find((m) => m.name === key || m.property === key)?.content?.trim();
  const links = tags(html, "link");

  if (tags(html, "html")[0]?.lang !== lang) problems.push(`${p}: <html lang> isn't "${lang}"`);

  const noindex = [meta("robots"), meta("googlebot"), page.headers.get("x-robots-tag")].find((v) => /noindex|none/i.test(v ?? ""));
  if (noindex) problems.push(`${p}: tells search engines not to list it (${noindex})`);

  const title = decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim();
  if (!title) problems.push(`${p}: no <title>`);
  else if (titles.has(title)) warnings.push(`${p}: same title as ${titles.get(title)} ("${title}")`);
  else titles.set(title, p);
  if (title.length > 70) warnings.push(`${p}: the title is ${title.length} characters; Google shows about 60`);

  const description = meta("description");
  if (!description) problems.push(`${p}: no meta description`);
  else if (descriptions.has(description)) warnings.push(`${p}: same description as ${descriptions.get(description)}`);
  else descriptions.set(description, p);
  if (description && (description.length < 50 || description.length > 170))
    warnings.push(`${p}: the description is ${description.length} characters; 50–160 reads best in results`);
  if (p.split("/").length === 2) snippets.push({ p, title, description });

  const canonical = links.find((l) => l.rel === "canonical")?.href;
  if (canonical !== url) problems.push(`${p}: the canonical link is ${canonical ?? "missing"}, not the page itself`);

  const alternates = Object.fromEntries(links.filter((l) => l.rel === "alternate" && l.hreflang).map((l) => [l.hreflang, l.href]));
  const missing = ["en", "ar", "x-default"].filter((l) => !alternates[l]);
  if (missing.length) problems.push(`${p}: no hreflang link for ${missing.join(", ")}`);
  else if (alternates[lang] !== url) problems.push(`${p}: its "${lang}" hreflang link points to ${alternates[lang]}`);
  for (const [l, href] of Object.entries(alternates))
    if (!inSitemap.has(href)) problems.push(`${p}: hreflang "${l}" points to ${href}, which isn't in the sitemap`);

  const h1s = (html.match(/<h1\b/gi) ?? []).length;
  if (h1s !== 1) (h1s ? warnings : problems).push(`${p}: ${h1s} main headings (<h1>), expected 1`);

  try {
    const graph = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].flatMap(([, json]) => {
      const data = JSON.parse(json);
      return data["@graph"] ?? [data];
    });
    const business = graph.find((n) => /Business/.test(n["@type"]));
    if (!business) problems.push(`${p}: no business data (schema.org)`);
    else for (const key of ["address", "telephone", "geo"]) if (!business[key]) warnings.push(`${p}: the business data has no ${key}`);
  } catch (e) {
    problems.push(`${p}: the business data isn't valid JSON (${e.message})`);
  }

  const image = meta("og:image");
  if (!image) problems.push(`${p}: no share image (og:image)`);
  else if (!shareImages.has(image)) shareImages.set(image, p);

  const noAlt = tags(html, "img").filter((img) => !("alt" in img)).length;
  if (noAlt) problems.push(`${p}: ${noAlt} image(s) without alt text`);

  for (const { href } of tags(html, "a")) {
    if (!href) continue;
    const to = new URL(href, url);
    to.hash = "";
    if (to.host === host && !to.pathname.startsWith("/admin") && !internal.has(to.href)) internal.set(to.href, p);
  }
}

for (const [image, p] of shareImages) {
  const r = await get(image, { body: false });
  const type = r.headers.get("content-type") ?? "";
  if (r.status !== 200 || !type.startsWith("image/")) problems.push(`${p}: its share image answers ${r.status} ${type} (${image})`);
}

for (const [link, from] of internal) {
  if (inSitemap.has(link)) continue; // already fetched above
  const r = await get(link, { body: false });
  if (r.status >= 300 && r.status < 400) warnings.push(`${from} links to ${path(link)}, which redirects to ${r.location}`);
  else if (r.status !== 200) problems.push(`${from} links to ${path(link)}, which answers ${r.status}`);
}

const average = Math.round(times.reduce((a, b) => a + b, 0) / (times.length || 1));
ok(`${urls.length} pages checked (${average} ms on average, slowest ${Math.max(0, ...times)} ms), ${shareImages.size} share images, ${internal.size} internal links`);

console.log("\nWhat a search result shows for the home pages:");
for (const { p, title, description } of snippets) console.log(`\n  ${p}\n  ${title}\n  ${description}`);

console.log(`\nProblems: ${problems.length}`);
for (const m of problems) console.log(`  FAIL  ${m}`);
console.log(`Warnings: ${warnings.length}`);
for (const m of warnings) console.log(`  warn  ${m}`);
process.exitCode = problems.length ? 1 : 0;
