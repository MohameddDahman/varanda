import type { Metadata } from "next";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return <ProjectEditor initial={null} />;
}
