import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const alt = "VARANDA — uPVC window & door systems. Made for life.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "src/assets/photos/hero-river-sliding.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#040c17" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560, padding: "72px 64px" }}>
          <svg width="96" height="77" viewBox="0 0 100 80">
            <polygon points="52,80 69,80 100,0 79,0" fill="#ffffff" />
            <polygon points="0,0 31,0 67,80 36,80" fill="#e11b22" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, color: "#ffffff", letterSpacing: 10, fontWeight: 500 }}>VARANDA</div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 24, color: "#a3b1c6", letterSpacing: 6 }}>
              MADE FOR LIFE<span style={{ color: "#e11b22" }}>.</span>
            </div>
          </div>
          <div style={{ fontSize: 22, color: "#a3b1c6" }}>uPVC window &amp; door systems</div>
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
