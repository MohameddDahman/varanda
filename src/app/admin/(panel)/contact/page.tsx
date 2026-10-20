import type { Metadata } from "next";
import { CONTACT_PATHS, currentAt } from "@/content/editable";
import { ensureContent } from "@/lib/site-content";
import { ContactEditor, type ContactValues } from "@/components/admin/ContactEditor";

export const metadata: Metadata = { title: "Contact details" };

export default async function ContactDetailsPage() {
  await ensureContent();
  const initial = Object.fromEntries(CONTACT_PATHS.map((path) => [path, currentAt(path)])) as ContactValues;
  return <ContactEditor initial={initial} />;
}
