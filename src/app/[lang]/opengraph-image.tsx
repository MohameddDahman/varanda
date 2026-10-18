import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { locales } from "@/i18n/config";
import { MARK, TAGLINE, WORDMARK } from "@/components/brand/logo-paths";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const alt = "VARANDA — uPVC window & door systems. Made for life.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The tagline glyphs sit on the artboard below the wordmark; this box frames just them.
const TAGLINE_VIEWBOX = "688 764 1134 62";

export default async function OpengraphImage() {
  // The home hero's photo.
  const photo = await readFile(join(process.cwd(), "src/assets/photos/garden-villa-window.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
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
}
