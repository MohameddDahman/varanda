import type { L } from "@/i18n/config";
import type { Photo, PhotoKey } from "./photos";
import type { SystemSlug } from "./systems";

export type ProjectType = "residential" | "commercial" | "education" | "outdoor";

export type Project = {
  slug: string;
  title: L;
  type: ProjectType;
  /** Year taken from the photo dates. */
  year: number;
  /** Fill in once the client confirms; hidden while null. */
  location: L | null;
  summary: L;
  body: L[];
  systems: SystemSlug[];
  cover: PhotoKey;
  gallery: PhotoKey[];
};

/**
 * A project as pages receive it, with its photos resolved. It comes from the database once one
 * is connected and holds projects (see src/lib/site-projects.ts), otherwise from the list below.
 */
export type SiteProject = Omit<Project, "cover" | "gallery"> & {
  /** Stacked on the home page (the first four). */
  featured: boolean;
  cover: Photo;
  gallery: Photo[];
};

export const projectTypes: Record<ProjectType, L> = {
  residential: { en: "Residential", ar: "سكني" },
  commercial: { en: "Administrative", ar: "إداري" },
  education: { en: "Educational", ar: "تعليمي" },
  outdoor: { en: "Outdoor", ar: "خارجي" },
};

/**
 * Grouped from the client's photos (the Drive folder and the 2017–2025 photo archive) by
 * shoot date, best work first.
 * TODO(client): confirm project names, areas and the systems used.
 */
export const projects: Project[] = [
  {
    slug: "modern-villa",
    title: { en: "Modern villa", ar: "فيلا مودرن" },
    type: "residential",
    year: 2019,
    location: null,
    summary: {
      en: "Wide glazed sliding doors onto the lawn, with roller shutters that close the ground floor completely.",
      ar: "أبواب جرار زجاجية عريضة على الحديقة، مع شاتر (شيش الحصيرة) يُغلق الدور الأرضي بالكامل.",
    },
    body: [
      {
        en: "With the roller shutters down, the ground floor closes up completely; with them up, wide glazed sliding doors open the rooms onto the lawn. Inside, a wide sliding window sits above a built-in window seat.",
        ar: "عند إنزال الشاتر يُغلق الدور الأرضي بالكامل، وعند رفعه تفتح الأبواب الجرار الزجاجية العريضة الغرف على الحديقة. ومن الداخل يعلو شباك جرار عريض مقعدًا مدمجًا.",
      },
    ],
    systems: ["windows-doors", "roller-shutters"],
    cover: "modernVilla",
    gallery: ["modernVillaFront", "modernVillaWindow"],
  },
  {
    slug: "garden-villa",
    title: { en: "Garden villa", ar: "فيلا بحديقة" },
    type: "residential",
    year: 2020,
    location: null,
    summary: {
      en: "Roller shutters and an awning over the garden doors, and tall windows with glazing bars inside.",
      ar: "شاتر (شيش الحصيرة) وتندة فوق أبواب الحديقة، وشبابيك طويلة بتقسيمات من الداخل.",
    },
    body: [
      {
        en: "Outside, the terrace doors close behind roller shutters; inside, tall windows with glazing bars and a decorative grille frame the garden.",
        ar: "من الخارج تُغلق أبواب التراس خلف الشاتر، ومن الداخل تؤطر الشبابيك الطويلة ذات التقسيمات والحماية الزخرفية مشهد الحديقة.",
      },
    ],
    systems: ["windows-doors", "roller-shutters"],
    cover: "gardenVilla",
    gallery: ["gardenVillaWindow"],
  },
  {
    slug: "nile-view-apartment",
    title: { en: "Nile-view apartment", ar: "شقة بإطلالة على النيل" },
    type: "residential",
    year: 2026,
    location: null,
    summary: {
      en: "Floor-to-ceiling sliding doors open the living room onto the river, with matching sliding windows through the apartment.",
      ar: "أبواب جرار من الأرض حتى السقف تفتح غرفة المعيشة على النيل، مع شبابيك جرار متناسقة في أرجاء الشقة.",
    },
    body: [
      {
        en: "A four-panel sliding system spans the full width of the living room, so the river reads as one uninterrupted picture — with the street's noise and dust kept outside.",
        ar: "نظام جرار من أربع ضلف يمتد بعرض غرفة المعيشة بالكامل، فتظهر الإطلالة على النيل كلوحة واحدة متصلة، بينما تبقى ضوضاء الشارع وأتربته في الخارج.",
      },
      {
        en: "Bedrooms and the kitchen use the same white profile, so every opening in the apartment shares one line and one finish.",
        ar: "واستُخدم القطاع الأبيض نفسه في غرف النوم والمطبخ، لتتشارك كل فتحات الشقة الخطوط نفسها والتشطيب نفسه.",
      },
    ],
    systems: ["windows-doors", "glass"],
    cover: "heroRiverSliding",
    gallery: ["apartmentLiving", "apartmentBedroom", "apartmentKitchen", "apartmentWindow"],
  },
  {
    slug: "sea-view-house",
    title: { en: "Sea-view house", ar: "منزل بإطلالة على البحر" },
    type: "residential",
    year: 2017,
    location: null,
    summary: {
      en: "Cream sliding windows and doors that frame the sea, set into a stone-clad facade.",
      ar: "شبابيك وأبواب جرار بلون كريمي تؤطر البحر، في واجهة مكسوة بالحجر.",
    },
    body: [
      {
        en: "Wide sliding windows look straight out to the beach, and their cream frames sit quietly against the stone cladding.",
        ar: "تطل الشبابيك الجرار العريضة مباشرة على الشاطئ، وينسجم اللون الكريمي لإطاراتها مع الكسوة الحجرية.",
      },
    ],
    systems: ["windows-doors"],
    cover: "seaView",
    gallery: ["seaViewFacade", "seaViewDoor", "seaView2"],
  },
  {
    slug: "pool-villa",
    title: { en: "Pool villa", ar: "فيلا بحمام سباحة" },
    type: "residential",
    year: 2017,
    location: null,
    summary: {
      en: "A curved bay of windows that turns the ground floor toward the pool, with arched windows on the floors above.",
      ar: "واجهة شبابيك منحنية تفتح الدور الأرضي على حمام السباحة، مع شبابيك مقوسة في الأدوار العلوية.",
    },
    body: [
      {
        en: "The bay's panels follow the curve of the wall, so from inside the pool and garden read as one wide view.",
        ar: "تتبع ضلف الواجهة انحناء الحائط، فيظهر حمام السباحة والحديقة من الداخل كمشهد واحد واسع.",
      },
    ],
    systems: ["windows-doors"],
    cover: "poolVilla",
    gallery: ["poolVillaBay"],
  },
  {
    slug: "red-villa",
    title: { en: "Villa", ar: "فيلا" },
    type: "residential",
    year: 2018,
    location: null,
    summary: {
      en: "Sliding doors along the ground floor and a tall window set into a round tower.",
      ar: "أبواب جرار على امتداد الدور الأرضي، وشباك طويل في برج دائري.",
    },
    body: [
      {
        en: "White frames stand out crisply against the render, from the wide sliding doors on the ground floor to the tall window in the tower.",
        ar: "تبرز الإطارات البيضاء بوضوح على الواجهة، من الأبواب الجرار العريضة في الدور الأرضي إلى الشباك الطويل في البرج.",
      },
    ],
    systems: ["windows-doors"],
    cover: "redVilla",
    gallery: ["redVillaTower", "redVillaEntrance"],
  },
  {
    slug: "round-windows-villa",
    title: { en: "Villa with round windows", ar: "فيلا بشبابيك دائرية" },
    type: "residential",
    year: 2021,
    location: null,
    summary: {
      en: "Round windows with glazing bars, made to fit the openings of a classic reception room.",
      ar: "شبابيك دائرية بتقسيمات، مصنوعة بمقاس فتحات غرفة استقبال كلاسيكية.",
    },
    body: [
      {
        en: "Each frame follows its circular opening exactly, and the glazing bars keep the classic lines of the room.",
        ar: "يتبع كل إطار فتحته الدائرية بدقة، وتحافظ التقسيمات على الطابع الكلاسيكي للغرفة.",
      },
    ],
    systems: ["windows-doors"],
    cover: "roundWindows",
    gallery: ["roundWindow", "roundWindow2"],
  },
  {
    // Named after the client's own folder label for these photos — TODO(client): confirm it can be shown.
    slug: "american-university",
    title: { en: "American University site", ar: "موقع الجامعة الأمريكية" },
    type: "education",
    year: 2025,
    location: null,
    summary: {
      en: "Dark and wood-finish windows fitted along every floor of the university's administrative building.",
      ar: "شبابيك بإطار داكن وبلون الخشب رُكّبت على امتداد أدوار المبنى الإداري للجامعة.",
    },
    body: [
      {
        en: "The windows run along every floor of the facade, lit up at night; inside, wood-finish sashes with diamond glazing bars line the offices and corridors.",
        ar: "تمتد الشبابيك على كل أدوار الواجهة وتضيء ليلًا، ومن الداخل تصطف ضلف بلون الخشب بتقسيمات معينات على امتداد المكاتب والممرات.",
      },
    ],
    systems: ["windows-doors"],
    cover: "universityWoodgrain",
    gallery: ["universityStreet", "universityBuilding", "officeNight3", "universityCorridor"],
  },
  {
    slug: "french-doors-apartment",
    title: { en: "Apartment with French doors", ar: "شقة بأبواب فرنسية" },
    type: "residential",
    year: 2019,
    location: null,
    summary: {
      en: "White French doors onto the balcony, and windows with glazing bars in the dining room and kitchen.",
      ar: "باب فرنسي أبيض على الشرفة، وشبابيك بتقسيمات في غرفة الطعام والمطبخ.",
    },
    body: [
      {
        en: "Glazing bars carry the same pattern from the French doors to the dining-room window, so the rooms share one classic detail: clear double glazing with Georgian bars.",
        ar: "تتكرر التقسيمات نفسها من الباب الفرنسي إلى شباك غرفة الطعام، فتتشارك الغرف تفصيلة كلاسيكية واحدة: زجاج دبل شفاف بجورجيا.",
      },
    ],
    systems: ["windows-doors"],
    cover: "frenchDoors",
    gallery: ["frenchDoorsWindow", "frenchDoorsKitchen"],
  },
  {
    slug: "arched-doors-apartment",
    title: { en: "Apartment with arched doors", ar: "شقة بأبواب مقوسة" },
    type: "residential",
    year: 2017,
    location: null,
    summary: {
      en: "Arched folding doors under a fanlight, and folding doors that open the rooms onto the balcony and terrace.",
      ar: "أبواب طي مقوسة أسفل شباك علوي مروحي، وأبواب طي تفتح الغرف على الشرفة والتراس.",
    },
    body: [
      {
        en: "The doors fold back to open the room onto the balcony; closed, their glazing bars and arched fanlight keep its classic look.",
        ar: "تُطوى الأبواب لتفتح الغرفة على الشرفة، وعند غلقها تحافظ التقسيمات والشباك العلوي المقوس على طابعها الكلاسيكي.",
      },
    ],
    systems: ["windows-doors"],
    cover: "archedDoorsOpen",
    gallery: ["archedDoors", "foldingDoors"],
  },
  {
    slug: "stone-villa",
    title: { en: "Villa with arched windows", ar: "فيلا بشبابيك مقوسة" },
    type: "residential",
    year: 2020,
    location: null,
    summary: {
      en: "Arched double windows, made to measure.",
      ar: "شبابيك مقوسة بضلفتين مصنوعة بالمقاس.",
    },
    body: [
      {
        en: "Outside, an arched window; inside, an arched double window opens above built-in drawers.",
        ar: "من الخارج شباك مقوس، ومن الداخل يُفتح شباك مقوس بضلفتين فوق أدراج مدمجة.",
      },
    ],
    systems: ["windows-doors"],
    cover: "stoneVilla",
    gallery: ["stoneVillaWindow"],
  },
  {
    slug: "villa-roller-shutters",
    title: { en: "Villa roller shutters", ar: "شاتر (شيش الحصيرة) لفيلا سكنية" },
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
    slug: "pergolas",
    title: { en: "Pergolas & outdoor living", ar: "برجولات ومساحات خارجية" },
    type: "outdoor",
    year: 2023,
    location: null,
    summary: {
      en: "Wood-effect pergolas beside the pool and in the garden, with a matching fence and gate.",
      ar: "برجولات بمظهر الخشب بجوار حمام السباحة وفي الحديقة، مع سور وبوابة بالطابع نفسه.",
    },
    body: [
      {
        en: "Slatted roofs and screens give shade without closing the space in, and the same wood-effect finish carries on to the fence along the garden path.",
        ar: "تمنح الأسقف والسواتر الشرائحية الظل دون أن تُغلق المساحة، ويمتد التشطيب نفسه بمظهر الخشب إلى السور على امتداد ممر الحديقة.",
      },
    ],
    systems: [],
    cover: "pergolaPool",
    gallery: ["pergolaGarden", "pergolaNight", "pergolaDeck", "gardenGate"],
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
    gallery: ["fence1", "fence5", "fence4", "fence6"],
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
      ar: "شبابيك uPVC مفصلية في أرجاء منزل عائلي — غرف هادئة وإحكام عالٍ دون حاجة إلى إعادة الدهان.",
    },
    body: [
      {
        en: "White frames sit flush with the plaster and fine cornices of each room, so the windows feel built in rather than added.",
        ar: "تستقر الإطارات البيضاء بانسجام مع الحوائط والكرانيش الدقيقة في كل غرفة، فتبدو الشبابيك جزءًا من البناء لا إضافةً إليه.",
      },
    ],
    systems: ["windows-doors"],
    cover: "homeWindow2",
    gallery: ["homeWindow1", "homeWindow3"],
  },
];

/** Site photos that are not tied to one project, shown as "From the site". */
export const sitePhotos: { photo: PhotoKey; label: L }[] = [
  { photo: "slidingDoor2020", label: { en: "Sliding door", ar: "باب جرار" } },
  { photo: "tiltTurn", label: { en: "Tilt & turn", ar: "مفصلي قلاب" } },
  { photo: "buildingProgress", label: { en: "Residential building", ar: "عمارة سكنية" } },
  { photo: "entranceDoor", label: { en: "Entrance door", ar: "باب مدخل" } },
  { photo: "archedShutter", label: { en: "Arched shutter", ar: "شاتر مقوس" } },
  { photo: "apartmentWindow", label: { en: "Kitchen window", ar: "شباك مطبخ" } },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/**
 * The photo behind the home page's sliding panels. Its caption links to the photo's project, or
 * to `link` when it isn't one (the portfolio's cover picture).
 */
export const homeHero: { project: string | null; link?: string; photo: PhotoKey; caption: L } = {
  project: null,
  link: "/systems/windows-doors",
  photo: "terraceSunset",
  caption: { en: "Wood-finish sliding doors onto a sunset terrace", ar: "أبواب جرار بلون الخشب تطل على تراس وقت الغروب" },
};

/** The projects stacked on the home page, in order (the hero's project is left out). */
export const featuredProjects = ["modern-villa", "sea-view-house", "pool-villa", "round-windows-villa"];
