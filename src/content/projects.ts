import type { L } from "@/i18n/config";
import type { PhotoKey } from "./photos";
import type { SystemSlug } from "./systems";

export type ProjectType = "residential" | "commercial" | "outdoor";

export type Project = {
  slug: string;
  title: L;
  type: ProjectType;
  /** Year taken from the photo dates in the client's Drive. */
  year: number;
  /** Fill in once the client confirms; hidden while null. */
  location: L | null;
  summary: L;
  body: L[];
  systems: SystemSlug[];
  cover: PhotoKey;
  gallery: PhotoKey[];
};

export const projectTypes: Record<ProjectType, L> = {
  residential: { en: "Residential", ar: "سكني" },
  commercial: { en: "Administrative", ar: "إداري" },
  outdoor: { en: "Outdoor", ar: "خارجي" },
};

/**
 * Grouped from the client's Drive photos by shoot date.
 * TODO(client): confirm project names, areas and the systems used.
 */
export const projects: Project[] = [
  {
    slug: "nile-view-apartment",
    title: { en: "Nile-view apartment", ar: "شقة بإطلالة على النيل" },
    type: "residential",
    year: 2026,
    location: null,
    summary: {
      en: "Floor-to-ceiling sliding doors open the living room onto the river, with matching sliding windows through the apartment.",
      ar: "أبواب سحاب من الأرض حتى السقف تفتح غرفة المعيشة على النيل، مع شبابيك سحاب متناسقة في أرجاء الشقة.",
    },
    body: [
      {
        en: "A four-panel sliding system spans the full width of the living room, so the river reads as one uninterrupted picture — with the street's noise and dust kept outside.",
        ar: "نظام سحاب من أربع ضلف يمتد بعرض غرفة المعيشة بالكامل، فتظهر الإطلالة على النيل كلوحة واحدة متصلة، بينما تبقى ضوضاء الشارع وأتربته في الخارج.",
      },
      {
        en: "Bedrooms and the kitchen use the same white profile, so every opening in the apartment shares one line and one finish.",
        ar: "واستُخدم نفس القطاع الأبيض في غرف النوم والمطبخ، لتتشارك كل فتحات الشقة الخطوط نفسها والتشطيب نفسه.",
      },
    ],
    systems: ["windows-doors", "glass"],
    cover: "heroRiverSliding",
    gallery: ["apartmentLiving", "apartmentBedroom", "apartmentKitchen", "apartmentWindow"],
  },
  {
    slug: "office-building",
    title: { en: "Office building", ar: "مبنى إداري" },
    type: "commercial",
    year: 2026,
    location: null,
    summary: {
      en: "A full façade of dark-framed uPVC windows for an administrative building — one consistent line across every floor.",
      ar: "واجهة كاملة من شبابيك uPVC بإطارات داكنة لمبنى إداري، بخطوط متناسقة في جميع الأدوار.",
    },
    body: [
      {
        en: "Dozens of identical openings, each one measured on site. Dark frames keep the rhythm of the façade calm and even, day and night.",
        ar: "عشرات الفتحات المتطابقة، رُفعت مقاسات كل منها في الموقع. الإطارات الداكنة تحافظ على إيقاع الواجهة هادئًا ومتناسقًا ليلًا ونهارًا.",
      },
    ],
    systems: ["windows-doors"],
    cover: "officeNight1",
    gallery: ["officeNight2", "officeNight3"],
  },
  {
    slug: "villa-roller-shutters",
    title: { en: "Villa roller shutters", ar: "شاتر لفيلا سكنية" },
    type: "residential",
    year: 2026,
    location: null,
    summary: {
      en: "Roller shutters with matching boxes, sized to each villa window for privacy, shade and a quieter house.",
      ar: "شاتر بصناديق متناسقة بمقاس كل شباك في الفيلا، للخصوصية والظل وهدوء أكبر داخل المنزل.",
    },
    body: [
      {
        en: "Each shutter runs in sealed side rails and closes onto a rubber bottom seal, so it shuts out light, heat and dust when it is down — and disappears into its box when it is up.",
        ar: "يتحرك كل شاتر في مجارٍ جانبية محكمة ويُغلق على جلبة مطاطية سفلية، فيحجب الضوء والحرارة والأتربة عند إغلاقه، ويختفي داخل صندوقه عند فتحه.",
      },
    ],
    systems: ["roller-shutters"],
    cover: "villaShutter",
    gallery: ["villaShuttersFacade"],
  },
  {
    slug: "garden-fencing",
    title: { en: "Garden fencing", ar: "أسوار حدائق" },
    type: "outdoor",
    year: 2025,
    location: null,
    summary: {
      en: "Wood-effect slatted fences and a matching gate for villa gardens — warm to look at and easy to maintain.",
      ar: "أسوار بشرائح بمظهر الخشب وبوابة متناسقة لحدائق الفيلات، بمظهر دافئ وصيانة سهلة.",
    },
    body: [
      {
        en: "Horizontal slats run continuously from wall to wall and carry on through the gate, so the boundary reads as one piece of joinery.",
        ar: "تمتد الشرائح الأفقية بشكل متصل من سور إلى آخر وتستمر عبر البوابة، ليبدو الحد الخارجي كقطعة واحدة متكاملة.",
      },
    ],
    systems: [],
    cover: "fence2",
    gallery: ["fence1", "fence5", "fence3", "fence4", "fence6"],
  },
  {
    slug: "classic-apartment",
    title: { en: "Apartment with classic bars", ar: "شقة بتقسيمات كلاسيكية" },
    type: "residential",
    year: 2020,
    location: null,
    summary: {
      en: "Hinged and tilt windows and a balcony door with classic glazing bars, for a traditional look with modern performance.",
      ar: "شبابيك مفصلية وقلابة وباب شرفة بتقسيمات زجاج كلاسيكية، بمظهر تقليدي وأداء عصري.",
    },
    body: [
      {
        en: "Classic glazing bars give the windows their traditional pattern, while tilt sashes let the rooms breathe without opening fully.",
        ar: "تمنح التقسيمات الكلاسيكية الشبابيك شكلها التقليدي، بينما تسمح الضلف القلابة بتهوية الغرف دون فتح كامل.",
      },
    ],
    systems: ["windows-doors"],
    cover: "classicFrenchDoor",
    gallery: ["classicWindow", "classicTilt"],
  },
  {
    slug: "family-home",
    title: { en: "Family home", ar: "منزل عائلي" },
    type: "residential",
    year: 2021,
    location: null,
    summary: {
      en: "Hinged uPVC windows throughout a finished family home — quiet rooms, tight seals and nothing to repaint.",
      ar: "شبابيك uPVC مفصلية في أرجاء منزل عائلي — غرف هادئة وإحكام عالٍ دون حاجة لإعادة الدهان.",
    },
    body: [
      {
        en: "White frames sit flush with the plaster and fine cornices of each room, so the windows feel built in rather than added.",
        ar: "تستقر الإطارات البيضاء بانسجام مع الحوائط والكرانيش الدقيقة في كل غرفة، فتبدو الشبابيك جزءًا من البناء لا إضافة عليه.",
      },
    ],
    systems: ["windows-doors"],
    cover: "homeWindow2",
    gallery: ["homeWindow1", "homeWindow3"],
  },
];

/** Site photos that are not tied to one project, shown as "From the site". */
export const sitePhotos: { photo: PhotoKey; label: L }[] = [
  { photo: "slidingDoor2020", label: { en: "Sliding door", ar: "باب سحاب" } },
  { photo: "tiltTurn", label: { en: "Tilt & turn", ar: "قلاب ومفصلي" } },
  { photo: "buildingProgress", label: { en: "Residential building", ar: "عمارة سكنية" } },
  { photo: "entranceDoor", label: { en: "Entrance door", ar: "باب مدخل" } },
  { photo: "archedShutter", label: { en: "Arched shutter", ar: "شاتر مقوس" } },
  { photo: "apartmentWindow", label: { en: "Kitchen window", ar: "شباك مطبخ" } },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** The projects stacked on the home page, in order. */
export const featuredProjects = ["nile-view-apartment", "office-building", "villa-roller-shutters", "garden-fencing"];
