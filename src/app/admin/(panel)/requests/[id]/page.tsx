import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { a, fill, requestLabels } from "@/content/admin";
import { isLang } from "@/i18n/config";
import { getSystem } from "@/content/systems";
import { cn } from "@/lib/cn";
import { adminQuery, getAdminLang } from "@/lib/admin/server";
import { fullDate, timeAgo } from "@/lib/admin/format";
import { telLink, whatsappLink } from "@/lib/admin/phone";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { StatusPill } from "@/components/admin/RequestsList";
import { CopyButton, DeleteRequest, NoteForm, StatusSwitch } from "@/components/admin/RequestPanel";

export const metadata: Metadata = { title: "Request" };

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const lang = await getAdminLang();
  const { id } = await params;
  // A malformed id fails Convex's validation; treat it like a deleted request.
  const r = await adminQuery(api.admin.inquiries.get, { id: id as Id<"inquiries"> }).catch(() => null);

  const back = (
    <Link href="/admin/requests" className="-ms-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-ink-2 hover:text-ink">
      <AdminIcon name="back" className="h-4 w-4" />
      {a.requests.heading[lang]}
    </Link>
  );
  if (!r) {
    return (
      <>
        {back}
        <p className="adm-card mt-4 px-4 py-10 text-center text-ink-2">{a.requests.notFound[lang]}</p>
      </>
    );
  }

  const visitorLang = isLang(r.locale) ? r.locale : "ar";
  const greeting = fill(a.requests.greeting[visitorLang], { name: r.name.split(/\s+/)[0] });
  const prefersWhatsapp = r.contactBy === "whatsapp";
  const details = [
    { label: a.requests.projectType, value: requestLabels.projectType[r.projectType]?.[lang] ?? r.projectType },
    { label: a.requests.systems, value: r.systems.map((s) => getSystem(s)?.name[lang] ?? s).join(lang === "ar" ? "، " : ", ") },
    { label: a.requests.area, value: r.area },
    { label: a.requests.contactBy, value: requestLabels.contactBy[r.contactBy]?.[lang] ?? r.contactBy },
    { label: a.requests.language, value: requestLabels.locale[r.locale]?.[lang] ?? r.locale },
  ].filter((d) => d.value);

  return (
    <>
      {back}
      <div className="mt-2 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-5">
          <header>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusPill status={r.status} />
              <time className="text-sm text-ink-2" title={fullDate(r._creationTime, lang)}>
                {fullDate(r._creationTime, lang)} · {timeAgo(r._creationTime, lang)}
              </time>
            </p>
            <h1 className="mt-3 text-2xl font-semibold break-words lg:text-3xl">{r.name}</h1>
            <p dir="ltr" className="mt-1 text-lg text-ink-2 rtl:text-end">
              {r.phone}
            </p>
          </header>

          {/* Phones: the ways to reach them come first, then the status they lead to. */}
          <div className="grid grid-cols-2 gap-2 lg:hidden">
            <ContactButtons phone={r.phone} email={r.email} greeting={greeting} prefersWhatsapp={prefersWhatsapp} lang={lang} />
          </div>
          <section className="adm-card p-4 lg:hidden" aria-labelledby="status-phone">
            <h2 id="status-phone" className="mb-3 font-semibold">
              {a.requests.status[lang]}
            </h2>
            <StatusSwitch id={r._id} status={r.status} />
          </section>

          <section className="adm-card p-4 lg:p-6" aria-labelledby="details">
            <h2 id="details" className="font-semibold">
              {a.requests.details[lang]}
            </h2>
            <dl className="mt-3 divide-y divide-[var(--line)]">
              {details.map((d) => (
                <div key={d.label.en} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-ink-2">{d.label[lang]}</dt>
                  <dd className="break-words">{d.value}</dd>
                </div>
              ))}
              {r.email && (
                <div className="grid gap-1 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm text-ink-2">{a.requests.email[lang]}</dt>
                  <dd dir="ltr" className="break-all rtl:text-end">
                    {r.email}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {r.message && (
            <section className="adm-card p-4 lg:p-6" aria-labelledby="message">
              <h2 id="message" className="font-semibold">
                {a.requests.message[lang]}
              </h2>
              <p className="mt-3 leading-relaxed break-words whitespace-pre-line" dir="auto">
                {r.message}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-10">
          <div className="hidden grid-cols-2 gap-2 lg:grid">
            <ContactButtons phone={r.phone} email={r.email} greeting={greeting} prefersWhatsapp={prefersWhatsapp} lang={lang} />
          </div>
          <section className="adm-card hidden p-5 lg:block" aria-labelledby="status">
            <h2 id="status" className="mb-3 font-semibold">
              {a.requests.status[lang]}
            </h2>
            <StatusSwitch id={r._id} status={r.status} />
          </section>
          <section className="adm-card p-4 lg:p-5">
            <NoteForm id={r._id} note={r.note ?? ""} />
          </section>
          <DeleteRequest id={r._id} />
        </aside>
      </div>
    </>
  );
}

function ContactButtons({ phone, email, greeting, prefersWhatsapp, lang }: { phone: string; email?: string; greeting: string; prefersWhatsapp: boolean; lang: "en" | "ar" }) {
  return (
    <>
      <a href={telLink(phone)} className={cn("adm-btn", prefersWhatsapp ? "adm-btn-outline" : "adm-btn-primary")}>
        <AdminIcon name="phone" />
        {a.requests.call[lang]}
      </a>
      <a href={whatsappLink(phone, greeting)} target="_blank" rel="noreferrer" className={cn("adm-btn", prefersWhatsapp ? "adm-btn-primary" : "adm-btn-outline")}>
        <AdminIcon name="whatsapp" />
        {a.requests.whatsapp[lang]}
      </a>
      {email && (
        <a href={`mailto:${email}`} className="adm-btn adm-btn-outline">
          <AdminIcon name="mail" />
          {a.requests.email[lang]}
        </a>
      )}
      <CopyButton text={phone} className={email ? undefined : "col-span-2"} />
    </>
  );
}
