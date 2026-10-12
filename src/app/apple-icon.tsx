import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#081a2f" }}>
        <svg width="110" height="88" viewBox="0 0 100 80">
          <polygon points="52,80 69,80 100,0 79,0" fill="#ffffff" />
          <polygon points="0,0 31,0 67,80 36,80" fill="#e11b22" />
          <polygon points="52,80 67,80 59.6,63.6" fill="#8f0d13" opacity="0.55" />
        </svg>
      </div>
    ),
    size,
  );
}
