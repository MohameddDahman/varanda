import type { L } from "@/i18n/config";

/** Areas named in the company profile, with approximate centres for the schematic map. */
export const serviceAreas: { id: string; name: L; short: L; lat: number; lon: number }[] = [
  {
    id: "new-cairo",
    name: { en: "New Cairo (Fifth Settlement)", ar: "التجمع الخامس" },
    short: { en: "New Cairo", ar: "التجمع الخامس" },
    lat: 30.02,
    lon: 31.47,
  },
  {
    id: "sheikh-zayed",
    name: { en: "Sheikh Zayed City", ar: "مدينة الشيخ زايد" },
    short: { en: "Sheikh Zayed", ar: "الشيخ زايد" },
    lat: 30.04,
    lon: 30.98,
  },
  {
    id: "october",
    name: { en: "6th of October", ar: "السادس من أكتوبر" },
    short: { en: "6th of October", ar: "6 أكتوبر" },
    lat: 29.94,
    lon: 30.93,
  },
];

/**
 * Brand + contact details. The contact details are samples until the client sends the
 * real ones (see `contact.sample`); anything set to null is hidden.
 */
export const site = {
  name: "Varanda",
  wordmark: "VARANDA",
  // Canonical origin for metadata/sitemap. Falls back to Vercel's production URL, then localhost.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  tagline: { en: "Made for life.", ar: "صُنعت لتدوم." } satisfies L,
  descriptor: { en: "Window & door systems", ar: "أنظمة الأبواب والشبابيك" } satisfies L,
  descriptorFull: { en: "uPVC window & door systems", ar: "أنظمة الأبواب والشبابيك uPVC" } satisfies L,
  description: {
    en: "Varanda designs, manufactures and installs uPVC windows, doors, roller shutters and fly screens — built for comfort, quiet rooms and a long life.",
    ar: "فاراندا تصمم وتصنّع وتركّب أنظمة الأبواب والشبابيك uPVC والشاتر وسلك الحشرات — لراحة أكبر وهدوء أكثر وعمر أطول.",
  } satisfies L,
  contact: {
    // TODO(client): SAMPLE values so the contact page shows its full layout. Replace every
    // value with the client's real details, then set `sample` to false. While it is true the
    // contact page labels the details as samples, nothing dials, opens WhatsApp or sends
    // mail, and the footer leaves them out.
    sample: true,
    phone: "+20 100 000 0000" as string | null,
    whatsapp: "201000000000" as string | null, // international format without +
    email: "info@varanda.example" as string | null, // .example is reserved: it never delivers
    address: { en: "Office address — Cairo, Egypt", ar: "عنوان المكتب — القاهرة، مصر" } as L | null,
    mapsUrl: null as string | null, // Google Maps link to the office
    hours: { en: "Saturday to Thursday, 10 am – 6 pm", ar: "السبت إلى الخميس، من 10 صباحًا إلى 6 مساءً" } as L | null,
  },
  social: [] as { label: string; href: string }[],
  areas: {
    en: serviceAreas.map((a) => a.name.en),
    ar: serviceAreas.map((a) => a.name.ar),
  },
};

export type NavKey = "systems" | "projects" | "why" | "about" | "contact";

export const nav: { key: NavKey; href: string; label: L }[] = [
  { key: "systems", href: "/systems", label: { en: "Systems", ar: "الأنظمة" } },
  { key: "projects", href: "/projects", label: { en: "Projects", ar: "المشروعات" } },
  { key: "why", href: "/why-upvc", label: { en: "Why uPVC", ar: "لماذا uPVC" } },
  { key: "about", href: "/about", label: { en: "About", ar: "من نحن" } },
  { key: "contact", href: "/contact", label: { en: "Contact", ar: "تواصل معنا" } },
];

/** Interface strings that are not part of any one content block. */
export const ui = {
  skip: { en: "Skip to content", ar: "تخطَّ إلى المحتوى" },
  menu: { en: "Menu", ar: "القائمة" },
  close: { en: "Close", ar: "إغلاق" },
  home: { en: "Home", ar: "الرئيسية" },
  langName: { en: "English", ar: "العربية" },
  switchTo: { en: "عربي", ar: "English" },
  bookVisit: { en: "Book a site visit", ar: "احجز معاينة" },
  viewProjects: { en: "View projects", ar: "شاهد المشروعات" },
  allProjects: { en: "All projects", ar: "كل المشروعات" },
  allSystems: { en: "All systems", ar: "كل الأنظمة" },
  explore: { en: "Explore", ar: "استكشف" },
  view: { en: "View", ar: "عرض" },
  drag: { en: "Drag", ar: "اسحب" },
  open: { en: "Open", ar: "افتح" },
  scroll: { en: "Scroll", ar: "مرّر" },
  next: { en: "Next", ar: "التالي" },
  nextProject: { en: "Next project", ar: "المشروع التالي" },
  back: { en: "Back", ar: "رجوع" },
  loading: { en: "Loading", ar: "جارٍ التحميل" },
  year: { en: "Year", ar: "السنة" },
  type: { en: "Type", ar: "النوع" },
  systems: { en: "Systems", ar: "الأنظمة" },
  location: { en: "Location", ar: "الموقع" },
  photos: { en: "Photos", ar: "الصور" },
  rights: { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
  backToTop: { en: "Back to top", ar: "العودة للأعلى" },
} satisfies Record<string, L>;
