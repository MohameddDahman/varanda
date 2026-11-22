"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { L } from "@/i18n/config";
import { a } from "@/content/admin";
import { validSocialUrl, type ContactPerson } from "@/content/editable";
import { socialNetworks, type SocialNetwork } from "@/content/site";
import { saveContent } from "@/app/admin/actions";
import { internationalDigits } from "@/lib/admin/phone";
import { cn } from "@/lib/cn";
import { useAdminLang } from "./AdminLang";
import { AdminIcon } from "./AdminIcon";
import { BilingualField, Section } from "./fields";
import { useToast } from "./Toaster";

export type ContactValues = {
  "site.contact.people": ContactPerson[];
  "site.contact.phone": string | null;
  "site.contact.whatsapp": string | null;
  "site.contact.email": string | null;
  "site.contact.address": L | null;
  "site.contact.hours": L | null;
  "site.contact.mapsUrl": string | null;
  "site.contact.mapQuery": string | null;
  "site.social": Record<SocialNetwork, string | null>;
};

// In the form every field is plain text; empty means "not shown".
type Person = { name: L; role: L; phone: string; whatsapp: string };
type Form = { people: Person[]; phone: string; whatsapp: string; email: string; address: L; hours: L; mapsUrl: string; mapQuery: string; social: Record<SocialNetwork, string> };
const networks = Object.keys(socialNetworks) as SocialNetwork[];

const emptyL: L = { en: "", ar: "" };
const toForm = (v: ContactValues): Form => ({
  people: v["site.contact.people"].map((p) => ({ ...p, whatsapp: p.whatsapp ?? "" })),
  phone: v["site.contact.phone"] ?? "",
  whatsapp: v["site.contact.whatsapp"] ?? "",
  email: v["site.contact.email"] ?? "",
  address: v["site.contact.address"] ?? emptyL,
  hours: v["site.contact.hours"] ?? emptyL,
  mapsUrl: v["site.contact.mapsUrl"] ?? "",
  mapQuery: v["site.contact.mapQuery"] ?? "",
  social: Object.fromEntries(networks.map((n) => [n, v["site.social"]?.[n] ?? ""])) as Record<SocialNetwork, string>,
});

const text = (s: string) => s.trim() || null;
const digits = (s: string) => (s.trim() ? internationalDigits(s) : null);
const bilingual = (l: L) => (l.en.trim() || l.ar.trim() ? { en: l.en.trim(), ar: l.ar.trim() } : null);

const toValues = (f: Form): ContactValues => ({
  "site.contact.people": f.people.map((p) => ({
    name: { en: p.name.en.trim(), ar: p.name.ar.trim() },
    role: { en: p.role.en.trim(), ar: p.role.ar.trim() },
    phone: p.phone.trim(),
    whatsapp: digits(p.whatsapp),
  })),
  "site.contact.phone": text(f.phone),
  "site.contact.whatsapp": digits(f.whatsapp),
  "site.contact.email": text(f.email),
  "site.contact.address": bilingual(f.address),
  "site.contact.hours": bilingual(f.hours),
  "site.contact.mapsUrl": text(f.mapsUrl),
  "site.contact.mapQuery": text(f.mapQuery),
  "site.social": Object.fromEntries(networks.map((n) => [n, text(f.social[n])])) as Record<SocialNetwork, string | null>,
});

function TextField({
  label,
  value,
  onChange,
  hint,
  type = "text",
  dir = "ltr",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
  dir?: "ltr" | "rtl" | "auto";
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="adm-label">
        {label}
      </label>
      <input id={id} type={type} dir={dir} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className="adm-input" aria-describedby={hint ? `${id}-hint` : undefined} />
      {hint && (
        <p id={`${id}-hint`} className="adm-hint mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}

/** The people, phones, email and branch shown on the site. */
export function ContactEditor({ initial }: { initial: ContactValues }) {
  const { t } = useAdminLang();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState(() => toForm(initial));
  const [saved, setSaved] = useState(() => JSON.stringify(toValues(toForm(initial))));
  const [error, setError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const dirty = JSON.stringify(toValues(form)) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setPerson = (i: number, patch: Partial<Person>) => set("people", form.people.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const errorText = (code: string) => t(a.errors[code as keyof typeof a.errors] ?? a.failed);

  const save = () =>
    startSave(async () => {
      setError(null);
      const values = toValues(form);
      const result = await saveContent(Object.entries(values).map(([path, value]) => ({ path, value })));
      if (!result.ok) {
        setError(errorText(result.error));
        toast(errorText(result.error), "error");
        return;
      }
      setSaved(JSON.stringify(values));
      toast(t(a.saved));
      router.refresh();
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-2xl font-semibold lg:text-3xl">{t(a.contact.heading)}</h1>
        <p className="mt-1 max-w-[60ch] text-ink-2">{t(a.contact.intro)}</p>
      </div>
      {error && (
        <p role="alert" className="border-s-2 border-red-deep ps-3 text-sm text-red-deep">
          {error}
        </p>
      )}

      <Section id="people" title={t(a.contact.people)} hint={t(a.contact.peopleHint)}>
        {form.people.map((p, i) => (
          <div key={i} className="space-y-4 border-t border-[var(--line)] pt-5 first:border-t-0 first:pt-0">
            <BilingualField label={t(a.contact.name)} value={p.name} required maxLength={120} onChange={(name) => setPerson(i, { name })} />
            <BilingualField label={t(a.contact.role)} value={p.role} required maxLength={120} onChange={(role) => setPerson(i, { role })} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label={t(a.contact.phone)} type="tel" value={p.phone} onChange={(phone) => setPerson(i, { phone })} />
              <TextField label={t(a.contact.whatsapp)} type="tel" value={p.whatsapp} hint={t(a.contact.whatsappHint)} onChange={(whatsapp) => setPerson(i, { whatsapp })} />
            </div>
            <div className="flex flex-wrap gap-2">
              {i > 0 && (
                <button type="button" className="adm-btn adm-btn-ghost" onClick={() => set("people", [...form.people.slice(0, i - 1), p, form.people[i - 1], ...form.people.slice(i + 1)])}>
                  <AdminIcon name="up" className="h-4 w-4" />
                  {t(a.contact.moveUp)}
                </button>
              )}
              <button type="button" className="adm-btn adm-btn-ghost text-red-deep" onClick={() => set("people", form.people.filter((_, j) => j !== i))}>
                <AdminIcon name="trash" className="h-4 w-4" />
                {t(a.contact.removePerson)}
              </button>
            </div>
          </div>
        ))}
        {form.people.length < 6 && (
          <button
            type="button"
            className="adm-btn adm-btn-outline"
            onClick={() => set("people", [...form.people, { name: { ...emptyL }, role: { ...emptyL }, phone: "", whatsapp: "" }])}
          >
            <AdminIcon name="plus" className="h-4 w-4" />
            {t(a.contact.addPerson)}
          </button>
        )}
      </Section>

      <Section id="main" title={t(a.contact.main)} hint={t(a.contact.mainHint)}>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label={t(a.contact.phone)} type="tel" value={form.phone} onChange={(v) => set("phone", v)} />
          <TextField label={t(a.contact.whatsapp)} type="tel" value={form.whatsapp} hint={t(a.contact.whatsappHint)} onChange={(v) => set("whatsapp", v)} />
        </div>
        <TextField label={t(a.contact.email)} type="email" autoComplete="off" value={form.email} onChange={(v) => set("email", v)} />
      </Section>

      <Section id="branch" title={t(a.contact.branch)} hint={t(a.contact.branchHint)}>
        <BilingualField label={t(a.contact.address)} value={form.address} optional multiline rows={2} maxLength={300} onChange={(v) => set("address", v)} />
        <BilingualField label={t(a.contact.hours)} value={form.hours} optional maxLength={300} onChange={(v) => set("hours", v)} />
        <TextField label={t(a.contact.mapsUrl)} type="url" value={form.mapsUrl} hint={t(a.contact.mapsUrlHint)} onChange={(v) => set("mapsUrl", v)} />
        <TextField label={t(a.contact.mapQuery)} dir="auto" value={form.mapQuery} hint={t(a.contact.mapQueryHint)} onChange={(v) => set("mapQuery", v)} />
      </Section>

      <Section id="social" title={t(a.contact.social)} hint={t(a.contact.socialHint)}>
        <div className="grid gap-4 md:grid-cols-2">
          {networks.map((n) => {
            const value = form.social[n];
            const wrong = value.trim() !== "" && !validSocialUrl(n, value.trim());
            return (
              <TextField
                key={n}
                label={socialNetworks[n].label}
                type="url"
                value={value}
                hint={wrong ? `${t(a.contact.socialCheck)} https://www.${socialNetworks[n].hosts[0]}/…` : undefined}
                onChange={(v) => set("social", { ...form.social, [n]: v })}
              />
            );
          })}
        </div>
      </Section>

      <div className="sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+0.75rem)] z-10 lg:bottom-6">
        <div className="flex items-center justify-between gap-3 border border-[var(--line)] bg-white/95 p-2 ps-4 shadow-[0_8px_30px_rgb(4_12_23/0.12)] backdrop-blur-md">
          <span className={cn("text-sm", dirty ? "font-medium text-red-deep" : "text-ink-2")} aria-live="polite">
            {dirty ? t(a.editor.unsaved) : t(a.saved)}
          </span>
          <button type="submit" disabled={saving || !dirty} className="adm-btn adm-btn-primary min-w-32">
            {t(saving ? a.saving : a.save)}
          </button>
        </div>
      </div>
    </form>
  );
}
