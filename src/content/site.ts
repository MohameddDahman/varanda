import type { L } from "@/i18n/config";

/**
 * Brand + contact details. Anything set to null is hidden.
 */
export const site = {
  name: "Varanda",
  wordmark: "VARANDA",
  // True once the real domain is configured. Until then the site asks search engines not to
  // index it, so previews with sample details don't end up in search results.
  launched: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  // Canonical origin for metadata/sitemap. Falls back to Vercel's production URL, then localhost.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  tagline: { en: "Made for life.", ar: "صُنعت لتدوم." } satisfies L,
  descriptor: { en: "Window & door systems", ar: "أنظمة الأبواب والشبابيك" } satisfies L,
  descriptorFull: { en: "uPVC window & door systems", ar: "أنظمة أبواب وشبابيك uPVC" } satisfies L,
  description: {
    en: "VARANDA designs, manufactures and installs uPVC windows and doors, roller shutters and fly screens in Greater Cairo. Visit us at Hala Mall, New Cairo.",
    ar: "فاراندا تصمم وتصنّع وتركّب أبواب وشبابيك uPVC والشاتر (شيش الحصيرة) وسلك الحشرات في القاهرة الكبرى، من فرعنا في مول هلا بالتجمع الخامس.",
  } satisfies L,
  contact: {
    // Real details from the client (2026-10-16; branch address and map 2026-10-24). Opening
    // hours are still to come: anything null is hidden.
    sample: false,
    /** People a visitor can call or message directly. */
    people: [
      {
        name: { en: "Mohamed Mahrous Soliman", ar: "محمد محروس سليمان" },
        role: { en: "Sales manager", ar: "مدير المبيعات" },
        phone: "+20 106 116 6677",
        whatsapp: "201061166677",
      },
      {
        name: { en: "Haitham Mohamed El-Halawany", ar: "هيثم محمد الحلواني" },
        role: { en: "Sales supervisor", ar: "مشرف مبيعات" },
        phone: "+20 111 001 8160",
        whatsapp: "201110018160",
      },
    ] as { name: L; role: L; phone: string; whatsapp: string | null }[],
    // The main line (sales) — used in the footer and by the request form's WhatsApp fallback.
    phone: "+20 106 116 6677" as string | null,
    whatsapp: "201061166677" as string | null, // international format without +
    email: null as string | null, // the company address, once it exists
    address: {
      en: "Shops 224 & 225, 2nd floor, Building 314, Hala Mall, South 90th Street, Fifth Settlement, New Cairo",
      ar: "محل رقم 224 و225، الدور الثاني، مبنى 314، مول هلا، شارع التسعين الجنوبي، التجمع الخامس",
    } as L | null,
    // The pin the client shared (their Google Maps link is labelled with a neighbouring shop,
    // so the site points at the coordinates rather than that shop).
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=30.0258429%2C31.4646865" as string | null,
    mapQuery: "30.0258429,31.4646865" as string | null, // what the embedded map shows
    hours: null as L | null,
  },
  social: [] as { label: string; href: string }[],
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
  backToTop: { en: "Back to top", ar: "العودة إلى الأعلى" },
} satisfies Record<string, L>;
