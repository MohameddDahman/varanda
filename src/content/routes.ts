import type { L } from "@/i18n/config";
import { nav, ui } from "./site";
import { getProject } from "./projects";
import { getSystem } from "./systems";

/** The bilingual name of a route, printed on the doors during a transition. */
export function routeLabel(pathname: string): L {
  const [, , section, slug] = pathname.split("/");
  if (!section) return ui.home;
  if (section === "projects" && slug) return getProject(slug)?.title ?? ui.allProjects;
  if (section === "systems" && slug) return getSystem(slug)?.name ?? nav[0].label;
  return nav.find((n) => n.href === `/${section}`)?.label ?? { en: "Varanda", ar: "فاراندا" };
}
