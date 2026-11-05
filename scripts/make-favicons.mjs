// Makes the raster favicons from src/app/icon.svg (the V mark on navy): favicon.ico, holding
// 16 to 192 px, and icon1.png at 192 px. Google Search won't use an SVG favicon, only formats such
// as ICO and PNG, so without these search results showed a blank globe instead of the logo.
//
//   node scripts/make-favicons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const app = path.resolve(import.meta.dirname, "../src/app");
const svg = readFileSync(path.join(app, "icon.svg"));
const png = (size) => sharp(svg, { density: 1200 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// An ICO file is a small directory followed by the images; modern readers take PNG images.
// Larger than 48 px too: Google recommends that, and may read this file rather than icon1.png.
const sizes = [16, 32, 48, 96, 192];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((img, i) => {
  const at = 6 + 16 * i;
  header.writeUInt8(sizes[i], at); // width
  header.writeUInt8(sizes[i], at + 1); // height
  header.writeUInt8(0, at + 2); // palette size
  header.writeUInt8(0, at + 3); // reserved
  header.writeUInt16LE(1, at + 4); // colour planes
  header.writeUInt16LE(32, at + 6); // bits per pixel
  header.writeUInt32LE(img.length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += img.length;
});
writeFileSync(path.join(app, "favicon.ico"), Buffer.concat([header, ...images]));
writeFileSync(path.join(app, "icon1.png"), await png(192));
console.log("wrote src/app/favicon.ico (16 to 192 px) and src/app/icon1.png (192 px)");
