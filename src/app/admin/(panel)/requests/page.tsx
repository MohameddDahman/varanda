import type { Metadata } from "next";
import { api } from "@convex/_generated/api";
import { a, requestLabels } from "@/content/admin";
import { getSystem } from "@/content/systems";
import { adminQuery, getAdminLang } from "@/lib/admin/server";
import { fullDate, timeAgo } from "@/lib/admin/format";
import { RequestsList, type RequestRow, type StatusFilter } from "@/components/admin/RequestsList";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const metadata: Metadata = { title: "Requests" };

const filters: StatusFilter[] = ["all", "new", "contacted", "closed"];

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const lang = await getAdminLang();
  const { status } = await searchParams;
  const requests = await adminQuery(api.admin.inquiries.list, {});

  // Labels and times are settled here, so the client only filters.
  const rows: RequestRow[] = requests.map((r) => ({
    id: r._id,
    name: r.name,
    phone: r.phone,
    status: r.status,
    project: requestLabels.projectType[r.projectType]?.[lang] ?? r.projectType,
    area: r.area ?? "",
    systems: r.systems.map((s) => getSystem(s)?.name[lang] ?? s),
    hasNote: Boolean(r.note),
    when: timeAgo(r._creationTime, lang),
    whenFull: fullDate(r._creationTime, lang),
    search: [r.name, r.phone, r.phone.replace(/\D/g, ""), r.area, r.email, r.message, r.note].filter(Boolean).join(" ").toLowerCase(),
  }));

  return (
    <>
      <AutoRefresh />
      <h1 className="text-2xl font-semibold lg:text-3xl">{a.requests.heading[lang]}</h1>
      <p className="adm-hint mt-1">{a.requests.intro[lang]}</p>
      <RequestsList rows={rows} initial={filters.includes(status as StatusFilter) ? (status as StatusFilter) : "all"} />
    </>
  );
}
