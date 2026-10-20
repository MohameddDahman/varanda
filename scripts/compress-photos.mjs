// Re-encodes the photos already in a Convex deployment into the site's photo format (see
// lib/photos.mjs), replacing each file only when that saves at least 10%. Safe to run again.
// Pages cached with the old photo addresses are refreshed (/api/revalidate) before the old files
// are deleted, so the site never shows a missing photo.
//
//   node scripts/compress-photos.mjs --site http://localhost:3000
//   node scripts/compress-photos.mjs --env <file> --site https://your-site
import { ConvexHttpClient } from "convex/browser";
import { convexEnv, encodePhoto } from "./lib/photos.mjs";

const { url, token } = convexEnv();
const site = process.argv.includes("--site") ? process.argv[process.argv.indexOf("--site") + 1] : null;
if (!site) throw new Error("Pass --site <origin> (the site using this database) so it can be refreshed.");

const client = new ConvexHttpClient(url);
const files = await client.query("admin/photos:files", { token });
const old = [];
let before = 0;
let after = 0;
for (const f of files) {
  before += f.size;
  if (!f.url) continue;
  const original = Buffer.from(await (await fetch(f.url)).arrayBuffer());
  const photo = await encodePhoto(original);
  if (photo.data.length > f.size * 0.9) {
    after += f.size;
    console.log(`  keep    ${f.id} ${(f.size / 1024) | 0}KB`);
    continue;
  }
  const uploadUrl = await client.mutation("admin/photos:generateUploadUrl", { token });
  const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": photo.type }, body: photo.data });
  if (!res.ok) throw new Error(`upload failed: ${res.status}`);
  const { storageId } = await res.json();
  old.push(await client.mutation("admin/photos:replaceFile", { token, id: f.id, storageId, width: photo.width, height: photo.height }));
  after += photo.data.length;
  console.log(`  smaller ${f.id} ${(f.size / 1024) | 0}KB -> ${(photo.data.length / 1024) | 0}KB`);
}
console.log(`${url}: ${files.length} photos, ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);

if (old.length) {
  const res = await fetch(new URL("/api/revalidate", site), {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ tags: ["projects"] }),
  });
  if (!res.ok) throw new Error(`Couldn't refresh ${site} (${res.status}); the old files are kept. Fix it and run again.`);
  console.log(`refreshed ${site}; deleted ${await client.mutation("admin/photos:deleteFiles", { token, storageIds: old })} old files`);
}
