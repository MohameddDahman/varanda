import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { LOCKUP_VIEWBOX, MARK, TAGLINE, WORDMARK } from "./logo-paths";

// Colours from the master artwork.
const RED = "#d71920";
const INK = "#231f20";

/**
 * The parts of the V mark, drawn in the artwork's order. They carry data attributes so
 * the intro can reveal the white panel and the red slab separately.
 */
function MarkParts() {
  return (
    <>
      <path data-vm="white" d={MARK.outline} fill={INK} />
      <path data-vm="white" d={MARK.panel} fill="#ffffff" />
      <path data-vm="red" d={MARK.slab} fill={RED} />
      <path data-vm="red" d={MARK.bottomEdge} fill="#9e270e" />
      <path data-vm="red" d={MARK.sideEdge} fill="#8c1f03" />
    </>
  );
}

/** A path's place in its row, which staggers the intro's CSS animation (globals.css). */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

/** "VARANDA" letters: the V in brand red, the rest in the surrounding text colour. */
function WordmarkLetters() {
  return WORDMARK.letters.map((d, i) => <path key={i} data-wm={i} d={d} fill={i === 0 ? RED : "currentColor"} style={order(i)} />);
}

/** The V mark from the client's logo. */
export function VMark({ className }: { className?: string }) {
  return (
    <svg viewBox={MARK.viewBox} className={cn("overflow-visible", className)} aria-hidden="true">
      <MarkParts />
    </svg>
  );
}

/**
 * The "VARANDA" wordmark. The artwork sets the letters after the V in #231f20; here they
 * follow the text colour so the logo reverses to white on dark sections.
 */
export function Wordmark({ className, title = "VARANDA" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={WORDMARK.viewBox} className={className} role="img" aria-label={title}>
      <WordmarkLetters />
    </svg>
  );
}

/**
 * The full stacked logo exactly as laid out on the artboard: mark, wordmark and the
 * "WINDOW & DOOR SYSTEMS" line. The wordmark is clipped to its own box so its letters
 * can rise into place.
 */
export function LogoLockup({ className, title = "VARANDA — Window & door systems" }: { className?: string; title?: string }) {
  const [x, y, w, h] = WORDMARK.viewBox.split(" ").map(Number);
  return (
    <svg viewBox={LOCKUP_VIEWBOX} className={className} role="img" aria-label={title}>
      <defs>
        <clipPath id="lockup-word-clip">
          <rect x={x - 20} y={y - 40} width={w + 40} height={h + 40} />
        </clipPath>
      </defs>
      <MarkParts />
      <g clipPath="url(#lockup-word-clip)">
        <WordmarkLetters />
      </g>
      {TAGLINE.map((d, i) => (
        <path key={i} data-c d={d} fill={RED} style={order(i)} />
      ))}
    </svg>
  );
}

/** Mark + wordmark side by side, for the header. */
export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    // A logo never mirrors: mark first, then the wordmark, on Arabic pages too.
    <span dir="ltr" className={cn("inline-flex shrink-0 items-center gap-2.5", className)}>
      <VMark className={cn("h-[1.25em] w-auto shrink-0", markClassName)} />
      <Wordmark className="h-[0.82em] w-auto shrink-0" />
    </span>
  );
}
