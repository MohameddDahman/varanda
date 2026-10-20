/**
 * A roller-shutter slat seen in section: a foam-filled aluminium shell with its curved face,
 * the hook that links it to the slat above and the socket for the one below, drawn to its
 * real height (taller slats draw taller) beside a dimension line.
 */
const TALLEST = 58; // mm: TERA, the tallest slat offered

export function SlatSection({ height }: { height: number }) {
  const h = height;
  // Section of a slat h mm tall and 14 mm deep (face at the left).
  const shell = `M4 5 C0.5 ${h * 0.3} 0.5 ${h * 0.7} 4 ${h - 3} L11 ${h - 3} L11 ${h - 8} L13.5 ${h - 8} L13.5 ${h} L15.5 ${h} L15.5 ${h - 10} L12.5 ${h - 10} L12.5 8 L10.5 5 L10.5 2 C10.5 -0.5 7 -0.5 7 2 L7 5 Z`;
  const foam = `M5.2 7 C2.4 ${h * 0.32} 2.4 ${h * 0.68} 5.2 ${h - 5} L10.4 ${h - 5} L10.4 9 Z`;
  return (
    <div className="slat-section" aria-hidden="true">
      <svg viewBox={`-6 -4 40 ${TALLEST + 8}`} className="slat-section-svg">
        <g transform={`translate(0 ${(TALLEST - h) / 2})`}>
          <path d={shell} className="slat-shell" />
          <path d={foam} className="slat-foam" />
          {/* Dimension line */}
          <path d={`M22 0 V${h} M19.5 0 H24.5 M19.5 ${h} H24.5`} className="slat-dim" />
          <text x="26" y={h / 2} dominantBaseline="middle" className="slat-dim-text" direction="ltr">
            {h} mm
          </text>
        </g>
      </svg>
    </div>
  );
}
