import { useId } from "react";

/** A calm, stylised view behind the glass: sky, skyline, river. */
export function ViewScene() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c3cfdc" />
          <stop offset="0.55" stopColor="#e6e3dc" />
          <stop offset="1" stopColor="#efe5d5" />
        </linearGradient>
        <linearGradient id={`${id}river`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9eb0c1" />
          <stop offset="1" stopColor="#6a8096" />
        </linearGradient>
        <radialGradient id={`${id}sun`} cx="0.7" cy="0.52" r="0.38">
          <stop offset="0" stopColor="#fff5e4" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff5e4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${id}sky)`} />
      <rect width="400" height="500" fill={`url(#${id}sun)`} />
      <g fill="#8b9aac" opacity="0.72">
        <rect x="8" y="232" width="26" height="78" />
        <rect x="38" y="214" width="18" height="96" />
        <rect x="60" y="246" width="34" height="64" />
        <rect x="98" y="190" width="16" height="120" />
        <rect x="118" y="228" width="40" height="82" />
        <rect x="190" y="206" width="22" height="104" />
        <rect x="216" y="240" width="46" height="70" />
        <rect x="270" y="176" width="14" height="134" />
        <rect x="288" y="224" width="36" height="86" />
        <rect x="330" y="198" width="22" height="112" />
        <rect x="356" y="236" width="40" height="74" />
      </g>
      <rect y="306" width="400" height="194" fill={`url(#${id}river)`} />
      <g stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5">
        <line x1="40" y1="352" x2="120" y2="352" />
        <line x1="220" y1="378" x2="330" y2="378" />
        <line x1="90" y1="420" x2="200" y2="420" />
        <line x1="260" y1="452" x2="370" y2="452" />
      </g>
    </svg>
  );
}
