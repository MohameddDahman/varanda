// Copies the site's built-in projects and their photos (src/content/projects.ts) into a Convex
// deployment, the same way the dashboard's "Import the site's projects" does. Projects already
// there (same slug) are skipped, so it is safe to run again.
//
//   node scripts/seed-projects.mjs                      # the deployment in .env.local
//   node scripts/seed-projects.mjs --env <file>         # another one: a file with
//                                                       # NEXT_PUBLIC_CONVEX_URL and ADMIN_TOKEN
import { build } from "esbuild";
import sharp from "sharp";
import { ConvexHttpClient } from "convex/browser";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const envFile = process.argv.includes("--env") ? process.argv[process.argv.indexOf("--env") + 1] : ".env.local";
const env = Object.fromEntries(
  readFileSync(path.resolve(root, envFile), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
if (!env.NEXT_PUBLIC_CONVEX_URL || !env.ADMIN_TOKEN) throw new Error(`${envFile} needs NEXT_PUBLIC_CONVEX_URL and ADMIN_TOKEN`);

// Bundle the content modules; image imports become { file, width, height, blurDataURL } like
// Next's static imports (file instead of a URL).
const out = path.join(root, ".seed-content.mjs");
await build({
  stdin: {
    contents: `export { projects, featuredProjects } from "@/content/projects"; export { photos } from "@/content/photos";`,
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out,
  alias: { "@": path.join(root, "src") },
  logLevel: "error",
  plugins: [
    {
      name: "images",
      setup(b) {
        b.onLoad({ filter: /\.(jpe?g|png|webp)$/ }, async ({ path: file }) => {
          const img = sharp(file);
          const { width, height } = await img.metadata();
          const blur = await img.clone().resize(16).webp({ quality: 60 }).toBuffer();
          const value = { file, width, height, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` };
          return { contents: `export default ${JSON.stringify(value)};`, loader: "js" };
        });
      },
    },
  ],
});
const { projects, featuredProjects, photos } = await import(pathToFileURL(out).href);
rmSync(out);

const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const token = env.ADMIN_TOKEN;
const existing = new Set((await client.query("admin/projects:list", { token })).map((p) => p.slug));
console.log(`${env.NEXT_PUBLIC_CONVEX_URL}: ${existing.size} projects already there`);

for (const project of projects) {
  if (existing.has(project.slug)) {
    console.log(`  skip   ${project.slug}`);
    continue;
  }
  const ids = [];
  for (const key of [project.cover, ...project.gallery]) {
    const photo = photos[key];
    const uploadUrl = await client.mutation("admin/photos:generateUploadUrl", { token });
    const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: readFileSync(photo.src.file) });
    if (!res.ok) throw new Error(`upload failed for ${key}: ${res.status}`);
    const { storageId } = await res.json();
    ids.push(
      await client.mutation("admin/photos:create", {
        token,
        storageId,
        width: photo.src.width,
        height: photo.src.height,
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
