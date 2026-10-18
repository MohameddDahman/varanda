import { api } from "@convex/_generated/api";
import { adminQuery, requireAdmin } from "@/lib/admin/server";
import { AdminShell } from "@/components/admin/AdminShell";

/** Every page behind sign-in. The count of new requests feeds the badge in the navigation. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const overview = await adminQuery(api.admin.overview.get, {}).catch(() => null);
  return <AdminShell newRequests={overview?.requests.new ?? 0}>{children}</AdminShell>;
}
