import { notFound } from "next/navigation";

/** Any unknown path under a language renders the localized 404 inside the site chrome. */
export default function Missing() {
  notFound();
}
