import type { L } from "@/i18n/config";
import { nav, site, ui } from "./site";
import { about, anatomy, benefits, counters, process, warranty } from "./company";
import { finishes, systems } from "./systems";

/*
 * The site's content that the dashboard can change. The text lives in the files of this
 * folder; the database keeps only what the team changed, as a flat map of path → value
 * ("about.title", "site.contact.address", "systems.0.items.2.name"). applyContent() writes
 * those values into the objects the site imports, and puts back the original for anything
 * no longer changed. Only text is editable: ids, links, photos and structure stay in code.
 */

/** The objects the site imports, by name: the first segment of every path. */
const roots = { site, nav, ui, about, process, warranty, counters, benefits, anatomy, systems, finishes } as Record<string, unknown>;

/** How the dashboard groups them. */
export const contentGroups: { id: string; label: L; roots: string[] }[] = [
  { id: "general", label: { en: "Brand, menus and buttons", ar: "العلامة والقوائم والأزرار" }, roots: ["site", "nav", "ui"] },
  { id: "company", label: { en: "Home and About", ar: "الرئيسية ومن نحن" }, roots: ["about", "process", "warranty", "counters"] },
  { id: "why", label: { en: "Why uPVC", ar: "لماذا uPVC" }, roots: ["benefits", "anatomy"] },
  { id: "systems", label: { en: "Systems and finishes", ar: "الأنظمة والألوان" }, roots: ["systems", "finishes"] },
];

export type ContactPerson = { name: L; role: L; phone: string; whatsapp: string | null };
export type Overrides = Record<string, unknown>;

/** Contact details: edited on their own screen, not as texts. */
export const CONTACT_PATHS = [
  "site.contact.people",
  "site.contact.phone",
  "site.contact.whatsapp",
  "site.contact.email",
  "site.contact.address",
  "site.contact.hours",
  "site.contact.mapsUrl",
  "site.contact.mapQuery",
] as const;

const isL = (v: unknown): v is L =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 2 && typeof (v as L).en === "string" && typeof (v as L).ar === "string";

const clone = <T,>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

const split = (path: string) => path.split(".");
function getAt(obj: unknown, path: string): unknown {
  return split(path).reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}
function setAt(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = split(path);
  const last = keys.pop()!;
  const parent = keys.reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj) as Record<string, unknown> | undefined;
  if (!parent) return;
  const current = parent[last];
  // Arrays are filled in place: other modules may hold the same array (openingSystems).
  if (Array.isArray(current) && Array.isArray(value)) current.splice(0, current.length, ...clone(value));
  else parent[last] = clone(value);
}

/** One editable text, as the dashboard lists it. */
export type TextField = { path: string; root: string; label: string; kind: "l" | "text" };

/** "systems.0.items.2.name" → "Windows & doors › Sliding › name": named by their content. */
function labelFor(path: string, at: (p: string) => unknown) {
  const keys = split(path);
  const parts: string[] = [];
  for (let i = 1; i < keys.length; i++) {
    const key = keys[i];
    if (/^\d+$/.test(key)) {
      const item = at(keys.slice(0, i + 1).join(".")) as Record<string, unknown> | undefined;
      const named = item && (isL(item.name) ? item.name.en : isL(item.title) ? item.title.en : isL(item.label) ? item.label.en : null);
      parts.push(named ? named.slice(0, 40) : `#${Number(key) + 1}`);
    } else {
      parts.push(key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase());
    }
  }
  return parts.join(" › ") || keys[0];
}

// The original content, before anything is applied.
const defaults = clone(roots);
const defaultAt = (path: string) => getAt(defaults, path);

/** Every editable text: bilingual text anywhere, and the plain "value" figures (20+, 1000+). */
export const textFields: TextField[] = (() => {
  const out: TextField[] = [];
  const walk = (v: unknown, path: string, root: string) => {
    if (path.startsWith("site.contact") || path === "site.url" || path === "site.launched") return;
    if (isL(v)) {
      out.push({ path, root, label: labelFor(path, defaultAt), kind: "l" });
      return;
    }
    if (Array.isArray(v)) v.forEach((item, i) => walk(item, `${path}.${i}`, root));
    else if (v && typeof v === "object") for (const [k, item] of Object.entries(v)) walk(item, `${path}.${k}`, root);
    else if (path.endsWith(".value") && (typeof v === "string" || v === null) && (root === "about" || root === "counters"))
      out.push({ path, root, label: labelFor(path, defaultAt), kind: "text" });
  };
  for (const [root, value] of Object.entries(defaults as Record<string, unknown>)) walk(value, root, root);
  return out;
})();

const textKinds = new Map(textFields.map((f) => [f.path, f.kind]));
const contactPaths = new Set<string>(CONTACT_PATHS);
const editablePaths = [...textFields.map((f) => f.path), ...CONTACT_PATHS];

/** The value a path shows now (with changes applied). */
export const currentAt = (path: string) => clone(getAt(roots, path));
/** The value written in the code. */
export const originalAt = (path: string) => clone(defaultAt(path));

let applied: string | null = null;
/** Writes the changes into the site's content, and the original back where nothing changed. */
export function applyContent(overrides: Overrides) {
  const key = JSON.stringify(overrides);
  if (key === applied) return;
  applied = key;
  for (const path of editablePaths) setAt(roots as Record<string, unknown>, path, path in overrides ? overrides[path] : defaultAt(path));
}

// ── Checks, for the server before saving ──

const str = (v: unknown, max: number) => typeof v === "string" && v.length <= max;
const lOk = (v: unknown, max = 4000) => isL(v) && v.en.length <= max && v.ar.length <= max;
const optStr = (v: unknown, max: number) => v === null || str(v, max);
const digits = (v: unknown) => v === null || (typeof v === "string" && /^\d{8,15}$/.test(v));

/** Whether a value fits the path; anything else is refused. */
export function validContent(path: string, value: unknown): boolean {
  const kind = textKinds.get(path);
  if (kind === "l") return lOk(value) && !!(value as L).en.trim() && !!(value as L).ar.trim();
  if (kind === "text") return optStr(value, 20);
  if (!contactPaths.has(path)) return false;
  switch (path) {
    case "site.contact.people":
      return (
        Array.isArray(value) &&
        value.length <= 6 &&
        value.every(
          (p) =>
            p && typeof p === "object" && lOk(p.name, 120) && lOk(p.role, 120) && !!p.name.en.trim() && str(p.phone, 30) && /\d{6,}/.test(p.phone.replace(/\D/g, "")) && digits(p.whatsapp),
        )
      );
    case "site.contact.phone":
      return value === null || (str(value, 30) && /\d{6,}/.test((value as string).replace(/\D/g, "")));
    case "site.contact.whatsapp":
      return digits(value);
    case "site.contact.email":
      return value === null || (str(value, 120) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string));
    case "site.contact.address":
    case "site.contact.hours":
      return value === null || (lOk(value, 300) && !!(value as L).en.trim() && !!(value as L).ar.trim());
    case "site.contact.mapsUrl":
      return value === null || (str(value, 500) && /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[a-z.]+)/.test(value as string));
    case "site.contact.mapQuery":
      return optStr(value, 200);
  }
  return false;
}

/** Same as the code? Then it's no change at all, and the override is dropped. */
export const isOriginal = (path: string, value: unknown) => JSON.stringify(value) === JSON.stringify(defaultAt(path));
