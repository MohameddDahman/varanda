/*
 * The 70 mm casement section as solids (mm, y up), extruded into a cut sample seen from the
 * front, a little above and to the right. Each edge whose outer side faces the extrusion
 * gets a side wall, shaded by the way it faces, darker inside the chambers and toward the
 * back, and the walls are painted far to near. It is all worked out once, when the module
 * loads, into static SVG paths: scrolling only moves and recolours a few of them.
 */

export type Pt = [number, number];
export type R = [number, number, number, number]; // x1, y1, x2, y2
/** Drawing height in mm; SVG y runs down, so y' = H - y. */
export const H = 180;
/** Where the back of the sample lands, relative to its cut face (mm: right and up). */
export const D: Pt = [18, 12.6];

const num = (n: number) => +n.toFixed(2);
const svg = ([x, y]: Pt) => `${num(x)} ${num(H - y)}`;
const pathOf = (pts: Pt[]) => `M${pts.map(svg).join("L")}Z`;
const add = ([x, y]: Pt, [dx, dy]: Pt, k = 1): Pt => [x + dx * k, y + dy * k];

export const rectPts = ([x1, y1, x2, y2]: R): Pt[] => [
  [x1, y1],
  [x2, y1],
  [x2, y2],
  [x1, y2],
];
/** A U-shaped steel channel of wall thickness t, open at the top. */
export const channelPts = ([x1, y1, x2, y2]: R, t = 1.6): Pt[] => [
  [x1, y1],
  [x2, y1],
  [x2, y2],
  [x2 - t, y2],
  [x2 - t, y1 + t],
  [x1 + t, y1 + t],
  [x1 + t, y2],
  [x1, y2],
];

const area = (pts: Pt[]) =>
  pts.reduce((s, [x, y], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length];
    return s + x * y2 - x2 * y;
  }, 0) / 2;
const ccw = (pts: Pt[]) => (area(pts) < 0 ? [...pts].reverse() : pts);

type Material = "upvc" | "steel" | "glass" | "gasket" | "seal" | "spacer";

export type Solid = {
  outline: Pt[];
  holes?: Pt[][];
  mat: Material;
  /** data-* attributes for the scroll timeline, put on its face and walls. */
  attrs?: Record<string, string>;
  /** Highlighted on its step: flat fills, which can animate (gradients can't). */
  hot?: boolean;
  /** How far it runs back, as a share of the sample's depth (a keeper is a short block). */
  depth?: number;
};

type Wall = { a: Pt; b: Pt; n: Pt; hole: boolean; solid: Solid };

/** The side walls the viewer can see: those whose outer side faces the extrusion. */
function wallsOf(solid: Solid): Wall[] {
  const out: Wall[] = [];
  const edges = (poly: Pt[], hole: boolean) => {
    const pts = ccw(poly);
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy);
      if (len < 1e-6) return;
      // Out of the material: right of the edge on an outline, left of it inside a hole.
      const n: Pt = hole ? [-dy / len, dx / len] : [dy / len, -dx / len];
      if (n[0] * D[0] + n[1] * D[1] > 1e-6) out.push({ a, b, n, hole, solid });
    });
  };
  edges(solid.outline, false);
  solid.holes?.forEach((h) => edges(h, true));
  return out;
}

/**
 * Painter's order for walls swept along D. Where two walls cover the same spot, the one whose
 * edge lies further along D (measured at the same position across D) is nearer the viewer.
 * Edges of separate solids never cross, so this order has no cycles.
 */
function depthOrder(walls: Wall[]): Wall[] {
  const len = Math.hypot(D[0], D[1]);
  const u: Pt = [D[0] / len, D[1] / len];
  const v: Pt = [-u[1], u[0]];
  const along = (p: Pt) => p[0] * u[0] + p[1] * u[1];
  const across = (p: Pt) => p[0] * v[0] + p[1] * v[1];
  const n = walls.length;
  const span = walls.map((w) => [Math.min(across(w.a), across(w.b)), Math.max(across(w.a), across(w.b))]);
  const at = (w: Wall, c: number) => {
    const ca = across(w.a);
    const cb = across(w.b);
    const t = Math.abs(cb - ca) < 1e-9 ? 0.5 : (c - ca) / (cb - ca);
    return along(w.a) + (along(w.b) - along(w.a)) * t;
  };
  const later: number[][] = walls.map(() => []);
  const blockers = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const lo = Math.max(span[i][0], span[j][0]);
      const hi = Math.min(span[i][1], span[j][1]);
      if (hi - lo < 1e-3) continue;
      const di = at(walls[i], (lo + hi) / 2);
      const dj = at(walls[j], (lo + hi) / 2);
      if (di > dj + 1e-3) {
        later[j].push(i);
        blockers[i]++;
      } else if (dj > di + 1e-3) {
        later[i].push(j);
        blockers[j]++;
      }
    }
  const order: number[] = [];
  const ready = walls.map((_, i) => i).filter((i) => blockers[i] === 0);
  while (ready.length) {
    const i = ready.shift()!;
    order.push(i);
    for (const j of later[i]) if (--blockers[j] === 0) ready.push(j);
  }
  // A cycle would leave walls out; keep them, in source order, rather than lose them.
  if (order.length < n) walls.forEach((_, i) => order.includes(i) || order.push(i));
  return order.map((i) => walls[i]);
}

// ── Shading ──

type RGB = [number, number, number];
/** Darkest and lightest tone of each material's walls. */
const TONES: Record<Material, [RGB, RGB]> = {
  upvc: [[92, 104, 120], [244, 246, 249]],
  steel: [[70, 80, 94], [214, 220, 228]],
  glass: [[0, 0, 0], [0, 0, 0]],
  gasket: [[12, 14, 18], [62, 69, 80]],
  seal: [[12, 14, 18], [58, 64, 74]],
  spacer: [[96, 106, 120], [196, 204, 213]],
};
/** Light from the upper left, in the plane of the section. */
const LIGHT: Pt = [-0.55, 0.835];
/** The section's background: walls fade toward it with depth. */
const FAR: RGB = [10, 22, 38];

const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as RGB;
const css = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`;

export type Gradient = { id: string; x2: number; y2: number; y1: number; stops: [number, string][] };
export type Shape = { d: string; fill: string; attrs?: Record<string, string>; base?: string; hot?: string };

const gradients = new Map<string, Gradient>();

/** A wall's fill: lit by the way it faces, darker in a chamber, fading toward the back. */
function wallFill(w: Wall): { fill: string; flat: string } {
  const { mat } = w.solid;
  const lambert = Math.max(0, w.n[0] * LIGHT[0] + w.n[1] * LIGHT[1]);
  // Quantised so walls that face alike share a gradient.
  const k = Math.round((0.38 + 0.62 * lambert) * (w.hole ? 0.74 : 1) * 16) / 16;
  const [dark, light] = TONES[mat];
  const front = mix(dark, light, k);
  if (w.solid.hot) return { fill: css(front), flat: css(front) };
  // The edge runs mostly across (the wall recedes upward) or mostly up (it recedes right).
  const horizontal = Math.abs(w.b[0] - w.a[0]) >= Math.abs(w.b[1] - w.a[1]);
  const id = `ps-${mat}-${Math.round(k * 16)}-${w.hole ? "in" : "out"}-${horizontal ? "v" : "h"}`;
  if (!gradients.has(id)) {
    const back = mix(front, FAR, w.hole ? 0.62 : 0.42);
    const stops: [number, string][] =
      mat === "steel"
        ? [
            [0, css(mix(front, [255, 255, 255], 0.25))],
            [0.18, css(front)],
            [0.55, css(mix(front, back, 0.35))],
            [0.7, css(mix(front, [255, 255, 255], 0.12))],
            [1, css(back)],
          ]
        : [
            [0, css(front)],
            [1, css(back)],
          ];
    // Bounding-box units: the front edge is the bottom (or left) side of the wall's box.
    gradients.set(id, horizontal ? { id, x2: 0, y1: 1, y2: 0, stops } : { id, x2: 1, y1: 0, y2: 0, stops });
  }
  return { fill: `url(#${id})`, flat: css(front) };
}

const RED_FACE = "#d71920";
const RED_WALL = "#9e1218";

function wallShapes(w: Wall): Shape[] {
  const k = w.solid.depth ?? 1;
  const d = pathOf([w.a, w.b, add(w.b, D, k), add(w.a, D, k)]);
  const attrs = w.solid.attrs;
  if (w.solid.mat === "glass") {
    // A pane's face seen at an angle: tinted, fading up (the glass carries on above the cut),
    // with a streak of reflected light.
    return [
      { d, fill: "url(#ps-glass-side)", attrs },
      { d, fill: "url(#ps-glass-streak)", attrs },
    ];
  }
  const { fill, flat } = wallFill(w);
  return [{ d, fill, attrs, ...(w.solid.hot && { base: flat, hot: RED_WALL }) }];
}

/** Walls of these solids, far to near, as paths. */
export function extrude(solids: Solid[], filter: (w: Wall) => boolean = () => true): Shape[] {
  return depthOrder(solids.flatMap(wallsOf).filter(filter)).flatMap(wallShapes);
}

/** A solid's cut face (holes cut out). */
export function face(solid: Solid, fill: string): Shape {
  const d = pathOf(solid.outline) + (solid.holes ?? []).map(pathOf).join("");
  return { d, fill, attrs: solid.attrs, ...(solid.hot && { base: fill, hot: RED_FACE }) };
}

export const rectPath = (r: R) => pathOf(rectPts(r));
export const polyPath = pathOf;
export const allGradients = () => [...gradients.values()];
