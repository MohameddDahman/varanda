// The site's built-in projects and photos (src/content), loaded outside Next: image imports
// become { file, width, height, blurDataURL }, like Next's static imports with a file path.
import { build } from "esbuild";
import sharp from "sharp";
import { rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { root } from "./photos.mjs";

export async function loadContent() {
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
  try {
    return await import(pathToFileURL(out).href);
  } finally {
    rmSync(out);
  }
}
