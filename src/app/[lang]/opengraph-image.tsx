import { ImageResponse } from "next/og";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { locales } from "@/i18n/config";
import { MARK, TAGLINE, WORDMARK } from "@/components/brand/logo-paths";
import { ensureContent } from "@/lib/site-content";
import { BRAND_CARD_ALT, SHARE_SIZE } from "@/lib/meta";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const alt = BRAND_CARD_ALT;
export const size = SHARE_SIZE;
export const contentType = "image/jpeg";

// The tagline glyphs sit on the artboard below the wordmark; this box frames just them.
const TAGLINE_VIEWBOX = "688 764 1134 62";

export default async function OpengraphImage() {
  await ensureContent();
  // The home hero's photo, cut to the frame on the right so both round windows show.
  const photo = await sharp(await readFile(join(process.cwd(), "src/assets/photos/round-windows.jpg")))
    .resize(592, 554, { fit: "cover", position: "left" })
    .jpeg({ quality: 90 })
    .toBuffer();
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  const card = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#040c17" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560, padding: "72px 64px" }}>
          <svg width="150" height="87" viewBox={MARK.viewBox}>
            <path d={MARK.outline} fill="#231f20" />
            <path d={MARK.panel} fill="#ffffff" />
            <path d={MARK.slab} fill="#d71920" />
            <path d={MARK.bottomEdge} fill="#9e270e" />
            <path d={MARK.sideEdge} fill="#8c1f03" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <svg width="420" height="61" viewBox={WORDMARK.viewBox}>
              {WORDMARK.letters.map((d, i) => (
                <path key={i} d={d} fill={i === 0 ? "#d71920" : "#ffffff"} />
              ))}
            </svg>
            <svg width="288" height="16" viewBox={TAGLINE_VIEWBOX} style={{ marginTop: 22 }}>
              {TAGLINE.map((d, i) => (
                <path key={i} d={d} fill="#d71920" />
              ))}
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#a3b1c6", letterSpacing: 4 }}>
            MADE FOR LIFE<span style={{ color: "#d71920" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, padding: 28, paddingLeft: 0 }}>
          <div style={{ display: "flex", flex: 1, border: "10px solid #eef0f3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
  // ImageResponse draws a PNG of about 600 KB; as a JPEG it's small enough for WhatsApp's previews.
  const jpeg = await sharp(Buffer.from(await card.arrayBuffer())).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": contentType, "Cache-Control": "public, immutable, no-transform, max-age=31536000" },
  });
}
