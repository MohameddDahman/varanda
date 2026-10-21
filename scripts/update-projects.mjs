// Brings edits made to the built-in projects (src/content/projects.ts) into a Convex deployment
// that already holds them, without touching anything else the team changed in the dashboard.
//
//   --text slug,slug          copy title, summary, body and location from the code
//   --alts slug,slug          copy the photos' alt texts from the code (by position: cover first)
//   --drop-photo slug:key     remove that photo (a key from src/content/photos.ts) from the project
//   --site <origin>           the site using this database, refreshed afterwards (/api/revalidate)
//   --env <file>              another deployment than the one in .env.local
//
//   node scripts/update-projects.mjs --site http://localhost:3000 --text stone-villa --drop-photo garden-fencing:fence3
import { ConvexHttpClient } from "convex/browser";
import { convexEnv } from "./lib/photos.mjs";
import { loadContent } from "./lib/content.mjs";

const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
const { url, token } = convexEnv();
const site = arg("--site");
if (!site) throw new Error("Pass --site <origin> so the site is refreshed after the change.");
const textSlugs = (arg("--text") ?? "").split(",").filter(Boolean);
const altSlugs = (arg("--alts") ?? "").split(",").filter(Boolean);
const drops = (arg("--drop-photo") ?? "").split(",").filter(Boolean).map((d) => d.split(":"));

const { projects, photos } = await loadContent();
const client = new ConvexHttpClient(url);
const list = await client.query("admin/projects:list", { token });
const bySlug = (slug) => {
  const row = list.find((p) => p.slug === slug);
  if (!row) throw new Error(`${slug} isn't in ${url}`);
  return row;
};

for (const slug of textSlugs) {
  const code = projects.find((p) => p.slug === slug);
  if (!code) throw new Error(`${slug} isn't in src/content/projects.ts`);
  const p = await client.query("admin/projects:get", { token, id: bySlug(slug)._id });
  await client.mutation("admin/projects:update", {
    token,
    id: p._id,
    slug: p.slug,
    title: code.title,
    type: p.type,
    year: p.year,
    ...(code.location ? { location: code.location } : p.location ? { location: p.location } : {}),
    summary: code.summary,
    body: code.body,
    systems: p.systems,
    photos: p.photos.map((x) => x._id),
    published: p.published,
    featured: p.featured,
  });
  console.log(`  text   ${slug}`);
}

for (const slug of altSlugs) {
  const code = projects.find((p) => p.slug === slug);
  const p = await client.query("admin/projects:get", { token, id: bySlug(slug)._id });
  const keys = [code.cover, ...code.gallery];
  for (const [i, photo] of p.photos.entries()) {
    if (keys[i]) await client.mutation("admin/photos:update", { token, id: photo._id, alt: photos[keys[i]].alt });
  }
  console.log(`  alts   ${slug}`);
}

for (const [slug, key] of drops) {
  const alt = photos[key]?.alt.en;
  if (!alt) throw new Error(`no photo ${key} in src/content/photos.ts`);
  const p = await client.query("admin/projects:get", { token, id: bySlug(slug)._id });
  const photo = p.photos.find((x) => x.alt.en === alt);
  if (!photo) {
    console.log(`  (${key} isn't on ${slug})`);
    continue;
  }
  await client.mutation("admin/photos:remove", { token, id: photo._id });
  console.log(`  photo  ${slug}: removed ${key}`);
}

const res = await fetch(new URL("/api/revalidate", site), {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify({ tags: ["projects"] }),
}).catch(() => ({ ok: false, status: "not reachable" }));
console.log(res.ok ? `refreshed ${site}` : `couldn't refresh ${site} (${res.status}); save any project in the dashboard to refresh it`);
