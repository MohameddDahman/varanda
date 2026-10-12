import { cn } from "@/lib/cn";

/** Line icons drawn in one stroke weight to sit with the technical-drawing language. */
const paths: Record<string, React.ReactNode> = {
  comfort: (
    <>
      <path d="M9 14.5V5a2 2 0 1 1 4 0v9.5a3.5 3.5 0 1 1-4 0Z" />
      <path d="M11 10v6.5" />
      <path d="M17 6.5h3M17 10h2" />
    </>
  ),
  thermal: (
    <>
      <path d="M9 14.5V5a2 2 0 1 1 4 0v9.5a3.5 3.5 0 1 1-4 0Z" />
      <path d="M11 10v6.5" />
      <path d="M17 6.5h3M17 10h2" />
    </>
  ),
  acoustic: (
    <>
      <path d="M4 9.5h3l4-3.5v12l-4-3.5H4Z" />
      <path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  durable: (
    <>
      <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 9 4.1-1.6 7-4.8 7-9V6Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  tailored: (
    <>
      <path d="M3.5 15.5 15.5 3.5l5 5-12 12Z" />
      <path d="m7 12 2 2M9.5 9.5l1.5 1.5M12 7l2 2" />
    </>
  ),
  install: (
    <>
      <path d="M14.5 6.5a3.5 3.5 0 0 0 4.6 4.6l1.4 1.4-3 3-1.4-1.4L8 22.2 4.8 19 12.9 11l-1.4-1.4 3-3Z" />
    </>
  ),
  maintenance: (
    <>
      <path d="M5 19 19 5" />
      <path d="M15.5 4.5 19.5 8.5M4.5 15.5l4 4" />
      <circle cx="17.5" cy="6.5" r="0.01" />
    </>
  ),
  finishes: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="9" cy="9" r="1.2" />
      <circle cx="14.5" cy="8" r="1.2" />
      <circle cx="8" cy="14" r="1.2" />
      <path d="M13.5 16.5a2 2 0 0 0 3-2.6" />
    </>
  ),
  security: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14v2.5" />
    </>
  ),
  arrowUpRight: <path d="M7 17 17 7M9 7h8v8" />,
  plus: <path d="M12 5v14M5 12h14" />,
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" />
  ),
  chat: (
    <>
      <path d="M7.6 17.6 4.5 19.5l1-3.4A7.5 7.5 0 1 1 7.6 17.6Z" />
      <path d="M8.75 11.5h.01M12 11.5h.01M15.25 11.5h.01" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" />
      <path d="m4 6.5 8 6 8-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({ name, className }: { name: IconName | string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6 shrink-0", className)}
      aria-hidden="true"
    >
      {paths[name] ?? paths.plus}
    </svg>
  );
}
