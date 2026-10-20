import type { Metadata } from "next";
import { contentGroups, currentAt, originalAt, textFields } from "@/content/editable";
import { ensureContent } from "@/lib/site-content";
import { TextsEditor, type EditorText } from "@/components/admin/TextsEditor";

export const metadata: Metadata = { title: "Texts" };

export default async function TextsPage() {
  await ensureContent();
  const fields: EditorText[] = textFields.map((f) => {
    const value = currentAt(f.path) as EditorText["value"];
    const original = originalAt(f.path) as EditorText["value"];
    // The original only travels when it differs: it's what "Restore" puts back.
    return { ...f, value, ...(JSON.stringify(value) !== JSON.stringify(original) && { original }) };
  });
  return <TextsEditor fields={fields} groups={contentGroups} />;
}
