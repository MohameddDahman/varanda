import { ImageResponse } from "next/og";
import { MARK } from "@/components/brand/logo-paths";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#081a2f" }}>
        <svg width="138" height="80" viewBox={MARK.viewBox}>
          <path d={MARK.outline} fill="#231f20" />
          <path d={MARK.panel} fill="#ffffff" />
          <path d={MARK.slab} fill="#d71920" />
          <path d={MARK.bottomEdge} fill="#9e270e" />
          <path d={MARK.sideEdge} fill="#8c1f03" />
        </svg>
      </div>
    ),
    size,
  );
}
