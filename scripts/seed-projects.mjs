// Copies the site's built-in projects and their photos (src/content/projects.ts) into a Convex
// deployment, the same way the dashboard's "Import the site's projects" does. Projects already
// there (same slug) are skipped, so it is safe to run again.
//
//   node scripts/seed-projects.mjs                      # the deployment in .env.local
//   node scripts/seed-projects.mjs --env <file>         # another one: a file with
//                                                       # NEXT_PUBLIC_CONVEX_URL and ADMIN_TOKEN
import { ConvexHttpClient } from "convex/browser";
import { readFileSync } from "node:fs";
import { convexEnv, encodePhoto } from "./lib/photos.mjs";
import { loadContent } from "./lib/content.mjs";

const { url, token } = convexEnv();

const { projects, featuredProjects, photos } = await loadContent();

const client = new ConvexHttpClient(url);
const existing = new Set((await client.query("admin/projects:list", { token })).map((p) => p.slug));
console.log(`${url}: ${existing.size} projects already there`);

for (const project of projects) {
  if (existing.has(project.slug)) {
    console.log(`  skip   ${project.slug}`);
    continue;
  }
  const ids = [];
  for (const key of [project.cover, ...project.gallery]) {
    const photo = photos[key];
    const uploadUrl = await client.mutation("admin/photos:generateUploadUrl", { token });
    const file = await encodePhoto(readFileSync(photo.src.file));
    const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file.data });
    if (!res.ok) throw new Error(`upload failed for ${key}: ${res.status}`);
    const { storageId } = await res.json();
    ids.push(
      await client.mutation("admin/photos:create", {
        token,
        storageId,
        width: file.width,
        height: file.height,
        blurDataURL: photo.src.blurDataURL,
        alt: photo.alt,
        ...(photo.focus ? { focus: photo.focus } : {}),
      }),
    );
  }
  await client.mutation("admin/projects:create", {
    token,
    slug: project.slug,
    title: project.title,
    type: project.type,
    year: project.year,
    ...(project.location ? { location: project.location } : {}),
    summary: project.summary,
    body: project.body,
    systems: project.systems,
    photos: ids,
    published: true,
    featured: featuredProjects.includes(project.slug),
  });
  console.log(`  added  ${project.slug} (${ids.length} photos)`);
}
console.log("done");
