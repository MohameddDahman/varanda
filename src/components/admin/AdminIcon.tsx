import { cn } from "@/lib/cn";

// The dashboard's icons: a heavier stroke than the site's, so they stay legible at 20px.
const paths = {
  overview: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" />
      <rect x="13.5" y="3.5" width="7" height="7" />
      <rect x="3.5" y="13.5" width="7" height="7" />
      <rect x="13.5" y="13.5" width="7" height="7" />
    </>
  ),
  requests: (
    <>
      <path d="M3.5 13.5 6 5.5h12l2.5 8v5h-17Z" />
      <path d="M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5" />
    </>
  ),
  projects: (
    <>
      <rect x="4" y="3.5" width="16" height="17" />
      <path d="M12 3.5v17M4 12h16" />
    </>
  ),
  contact: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" />
      <circle cx="9" cy="11" r="2" />
      <path d="M5.5 16c.7-1.6 2-2.5 3.5-2.5s2.8.9 3.5 2.5M14.5 10h3.5M14.5 13.5h3.5" />
    </>
  ),
  texts: <path d="M4.5 5.5h15M12 5.5v13M9 18.5h6" />,
  external: <path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v5.5H4.5V6H10" />,
  signOut: <path d="M14.5 4.5h5v15h-5M10.5 16.5 6 12l4.5-4.5M6 12h10" />,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" />,
  whatsapp: (
    <>
      <path d="M7.6 18.1 4 19.5l1.2-3.5A8 8 0 1 1 7.6 18.1Z" />
      <path d="M9 9.5c0 2.5 2 4.8 4.6 5.4l1.4-1.4-1.8-1-1 .8a4 4 0 0 1-2-2l.8-1-1-1.8Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" />
      <path d="m4 6.5 8 6 8-6" />
    </>
  ),
  note: (
    <>
      <path d="M5.5 3.5h9l4 4v13h-13Z" />
      <path d="M14.5 3.5v4h4M8.5 12h7M8.5 15.5h5" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" />
      <path d="M15.5 8.5v-4h-11v11h4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  next: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  up: <path d="M5.5 14.5 12 8l6.5 6.5" />,
  down: <path d="M5.5 9.5 12 16l6.5-6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M4.5 6.5h15M9.5 6.5v-2h5v2M6.5 6.5l1 13h9l1-13M10 10.5v6M14 10.5v6" />,
  star: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6Z" />,
  upload: <path d="M12 15.5v-11M7.5 9 12 4.5 16.5 9M4.5 15.5v4h15v-4" />,
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" />
      <circle cx="9" cy="10" r="1.75" />
      <path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5c1.6 0 3 .5 4.2 1.1M21.5 12s-3.5 6.5-9.5 6.5c-1.7 0-3.1-.5-4.4-1.2" />
      <path d="M4 20 20 4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5Z" />
    </>
  ),
};

export type AdminIconName = keyof typeof paths;

/** Icons that point along the reading direction flip in Arabic. */
const directional = new Set<AdminIconName>(["back", "next", "signOut"]);

export function AdminIcon({ name, className }: { name: AdminIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5 shrink-0", directional.has(name) && "rtl:-scale-x-100", className)}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
