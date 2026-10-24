/**
 * A number with its noun, as Arabic grammar wants it: the noun's form depends on the count.
 *   one   — 1 (written without the number): "مشروع واحد معروض"
 *   two   — 2 (written without the number): "مشروعان معروضان"
 *   few   — 3–10, and 0:                   "مشروعات معروضة"
 *   many  — 11–99:                          "مشروعًا معروضًا"
 *   other — 100, 101, 102, 200…:            "مشروع معروض"
 */
export function arCount(n: number, forms: { one: string; two: string; few: string; many: string; other: string }) {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  const r = n % 100;
  if (n === 0 || (r >= 3 && r <= 10)) return `${n} ${forms.few}`;
  if (r >= 11) return `${n} ${forms.many}`;
  return `${n} ${forms.other}`;
}
