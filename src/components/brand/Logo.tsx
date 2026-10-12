import { cn } from "@/lib/cn";

/**
 * Vector redraw of the VARANDA mark from the company profile: a red ribbon and
 * a white ribbon folding into a V. Replace with the client's master artwork
 * when it arrives — the parts keep their data attributes for the intro animation.
 */
export function VMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={cn("overflow-visible", className)} aria-hidden="true">
      {/* white ribbon sits behind the red one and rises to the right */}
      <polygon data-vm="white" points="52,80 69,80 100,0 79,0" fill="url(#vm-white)" />
      <polygon data-vm="red" points="0,0 31,0 67,80 36,80" fill="url(#vm-red)" />
      {/* fold shadow where the ribbons cross */}
      <polygon data-vm="fold" points="52,80 67,80 59.6,63.6" fill="#8f0d13" opacity="0.55" />
    </svg>
  );
}

/**
 * Gradients for the mark, rendered once in the root layout. Kept in a
 * zero-size (not display:none) SVG so Chrome still paints the references.
 */
export function BrandDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }} focusable="false">
      <defs>
        <linearGradient id="vm-red" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#f0242c" />
          <stop offset="1" stopColor="#c8141c" />
        </linearGradient>
        <linearGradient id="vm-white" x1="1" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d5dbe4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const S = 8.6; // stroke weight of the wordmark letters

/** Geometric "VΛRΛNDΛ" wordmark, letters drawn as solid shapes on a 60-unit cap height. */
export function Wordmark({ className, title = "VARANDA" }: { className?: string; title?: string }) {
  // letter advance positions
  const x = [0, 60, 120, 178, 238, 293, 355];
  return (
    <svg viewBox="0 0 399 60" className={className} role="img" aria-label={title} fill="currentColor">
      <g data-wm="0" transform={`translate(${x[0]} 0)`}>
        <polygon points={`0,0 ${S + 1},0 22,${60 - 15} ${44 - S - 1},0 44,0 ${22 + S / 2 + 0.6},60 ${22 - S / 2 - 0.6},60`} />
      </g>
      {[1, 3, 6].map((i) => (
        <g key={i} data-wm={i} transform={`translate(${x[i]} 0)`}>
          <polygon points={`${22 - S / 2 - 0.6},0 ${22 + S / 2 + 0.6},0 44,60 ${44 - S - 1},60 22,15 ${S + 1},60 0,60`} />
        </g>
      ))}
      <g data-wm="2" transform={`translate(${x[2]} 0)`}>
        <path
          fillRule="evenodd"
          d={`M0,0 H21 A17,17 0 0 1 21,34 H${S} V60 H0 Z M${S},${S} H21 A8.4,8.4 0 0 1 21,${34 - S} H${S} Z`}
        />
        <polygon points={`17,32 ${17 + S + 1.6},32 42,60 ${42 - S - 1.6},60`} />
      </g>
      <g data-wm="4" transform={`translate(${x[4]} 0)`}>
        <polygon
          points={`0,60 0,0 ${S + 1},0 ${39 - S},${60 - 17} ${39 - S},0 39,0 39,60 ${39 - S - 1},60 ${S},17 ${S},60`}
        />
      </g>
      <g data-wm="5" transform={`translate(${x[5]} 0)`}>
        <path
          fillRule="evenodd"
          d={`M0,0 H18 A30,30 0 0 1 18,60 H0 Z M${S},${S} H18 A21.4,21.4 0 0 1 18,${60 - S} H${S} Z`}
        />
      </g>
    </svg>
  );
}

/** Mark + wordmark lock-up used in the header and footer. */
export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-3", className)}>
      <VMark className={cn("h-[1.35em] w-auto shrink-0", markClassName)} />
      <Wordmark className="h-[0.78em] w-auto shrink-0" />
    </span>
  );
}
