import type { L } from "@/i18n/config";
import type { PhotoKey } from "./photos";

export type OpeningKind = "sliding" | "hinged" | "hinged-double" | "tilt-turn" | "fixed" | "tilt" | "folding";
export type GlassKind = "clear" | "reflective" | "fume" | "double";
export type ScreenKind = "fixed" | "sliding" | "pleated";
export type SlatKind = "perforated" | "ngs" | "bk";

export type SystemItem = {
  id: string;
  name: L;
  text: L;
  tags?: L[];
  points?: L[];
  /** Product photo for the item. */
  image?: PhotoKey;
};

export type SystemSlug = "windows-doors" | "glass" | "roller-shutters" | "fly-screens" | "hardware";

export type SystemCategory = {
  slug: SystemSlug;
  name: L;
  /** One line for lists and cards. */
  short: L;
  /** Paragraph that opens the system page. */
  intro: L;
  /** Short count shown next to the name, e.g. "6 opening systems". */
  count: L;
  tagline?: L;
  cover: PhotoKey;
  gallery: PhotoKey[];
  items: SystemItem[];
  features?: { title: L; items: L[] };
  details?: { title: L; items: L[] };
  warranty?: { value: L; label: L }[];
};

const tag = (en: string, ar: string): L => ({ en, ar });

export const systems: SystemCategory[] = [
  {
    slug: "windows-doors",
    name: { en: "Windows & doors", ar: "الأبواب والشبابيك" },
    short: {
      en: "Six opening systems for every room, view and use.",
      ar: "ستة أنظمة فتح تناسب كل مساحة وكل استخدام.",
    },
    intro: {
      en: "A range of opening systems that suit different architectural needs and give the highest level of comfort and flexibility in everyday use.",
      ar: "مجموعة متنوعة من أنظمة الفتح لتناسب مختلف الاحتياجات المعمارية، وتوفر أعلى درجات الراحة والمرونة في الاستخدام.",
    },
    count: { en: "6 opening systems", ar: "6 أنظمة فتح" },
    cover: "frenchDoors",
    gallery: ["apartmentLiving", "classicFrenchDoor", "homeWindow1", "tiltTurn", "slidingDoor2020", "classicTilt"],
    items: [
      {
        id: "sliding",
        name: { en: "Sliding", ar: "نظام الجرار" },
        text: {
          en: "Suited to wide openings, easy to use and smooth in motion.",
          ar: "مناسب للمساحات الواسعة وسهل الاستخدام ويوفر انسيابية في الحركة.",
        },
        tags: [
          tag("Smooth movement", "انسيابية في الحركة"),
          tag("Made for wide openings", "مثالي للمساحات الواسعة"),
          tag("Modern design", "تصميم عصري"),
        ],
      },
      {
        id: "hinged",
        name: { en: "Hinged", ar: "النظام المفصلي" },
        text: {
          en: "The most used system in homes and projects — durable, easy to operate and tightly sealed.",
          ar: "الأكثر استخدامًا في المنازل والمشروعات، يوفر متانة وسهولة في التشغيل وإحكامًا عاليًا.",
        },
        tags: [tag("Easy to operate", "سهولة التشغيل"), tag("Tight seal", "إحكام عالٍ"), tag("Durable", "متانة عالية")],
      },
      {
        id: "tilt-turn",
        name: { en: "Tilt & turn", ar: "القلاب والمفصلي" },
        text: {
          en: "Full flexibility: a secure ventilation position and a full opening, both with a tight seal.",
          ar: "مرونة كاملة في الاستخدام، يوفر وضعية تهوية آمنة وإمكانية الفتح الكامل مع إحكام عالٍ.",
        },
        tags: [tag("Flexible use", "استخدام مرن"), tag("Tight seal", "إحكام عالٍ"), tag("Safe ventilation", "تهوية آمنة")],
      },
      {
        id: "hinged-double",
        name: { en: "Double casement", ar: "المفصلي ضلفتين" },
        text: {
          en: "Two hinged sashes that open from the middle for a full, wide opening — the most common choice in homes.",
          ar: "ضلفتان مفصليتان تُفتحان من المنتصف لفتحة كاملة وواسعة، وهو الاختيار الأكثر استخدامًا في المنازل.",
        },
        tags: [tag("Full opening", "فتحة كاملة"), tag("Most used", "الأكثر استخدامًا"), tag("Tight seal", "إحكام عالٍ")],
      },
      {
        id: "tilt",
        name: { en: "Tilt", ar: "النظام القلاب" },
        text: {
          en: "Secure ventilation without a full opening — ideal for kitchens and bathrooms, and tightly sealed.",
          ar: "يوفر تهوية آمنة دون فتح كامل، مناسب للمطابخ والحمامات بإحكام عالٍ.",
        },
        tags: [
          tag("Kitchens & bathrooms", "للمطابخ والحمامات"),
          tag("More privacy", "خصوصية أعلى"),
          tag("Constant ventilation", "تهوية مستمرة"),
        ],
      },
      {
        id: "folding",
        name: { en: "Folding", ar: "نظام الطي" },
        text: {
          en: "Opens up large spaces — suited to restaurants and projects, smooth in motion with a modern design.",
          ar: "يفتح مساحات كبيرة، مناسب للمطاعم والمشروعات، ويوفر انسيابية في الحركة بتصميم عصري.",
        },
        tags: [tag("Modern design", "تصميم عصري"), tag("Smooth movement", "انسيابية عالية"), tag("Wide spaces", "مساحات واسعة")],
      },
    ],
    details: {
      title: { en: "Details that make the difference", ar: "تفاصيل تصنع الفرق" },
      items: [
        tag("High-sealing gaskets", "جوانات إحكام عالية"),
        tag("Modern handles", "مقابض بتصميم عصري"),
        tag("Strong, durable hinges", "مفصلات قوية ومتينة"),
        tag("High-quality rollers", "عجلات عالية الجودة"),
        tag("High-insulation glass", "زجاج عالي العزل"),
      ],
    },
  },
  {
    slug: "glass",
    name: { en: "Glass", ar: "الزجاج" },
    short: {
      en: "Clear, reflective, fumé or double glazed — chosen for light, heat and privacy.",
      ar: "شفاف أو عاكس أو فاميه أو مزدوج — حسب الإضاءة والحرارة والخصوصية.",
    },
    intro: {
      en: "A range of glass to suit different needs, adding thermal and acoustic insulation with a high degree of clarity and privacy.",
      ar: "مجموعة متنوعة من أنظمة الزجاج لتناسب مختلف الاحتياجات، وتوفر العزل الحراري والصوتي مع درجات عالية من الوضوح والخصوصية.",
    },
    count: { en: "4 glass options", ar: "4 خيارات للزجاج" },
    cover: "seaViewFacade",
    gallery: ["heroRiverSliding", "apartmentBedroom", "homeWindow2"],
    items: [
      {
        id: "clear",
        image: "glassClear",
        name: { en: "Clear", ar: "شفاف" },
        text: { en: "The most clarity and natural light.", ar: "أقصى درجات الوضوح ودخول الإضاءة الطبيعية." },
      },
      {
        id: "reflective",
        image: "glassReflective",
        name: { en: "Reflective", ar: "عاكس" },
        text: { en: "Reduces heat gain and gives more privacy.", ar: "يقلل من الحرارة ويوفر خصوصية أعلى." },
      },
      {
        id: "fume",
        image: "glassFume",
        name: { en: "Fumé", ar: "فاميه" },
        text: { en: "A modern tinted look with ideal privacy.", ar: "مظهر عصري مع خصوصية مثالية." },
      },
      {
        id: "double",
        image: "glassDouble",
        name: { en: "Double glazing", ar: "زجاج مزدوج" },
        text: {
          en: "Better thermal and acoustic insulation, with lower energy use.",
          ar: "عزل حراري وصوتي أفضل مع توفير في استهلاك الطاقة.",
        },
      },
    ],
    features: {
      title: { en: "What the right glass gives you", ar: "ما يمنحك إياه الزجاج المناسب" },
      items: [
        tag("Thermal insulation", "عزل حراري مميز"),
        tag("Effective sound insulation", "عزل صوتي فعّال"),
        tag("More privacy", "خصوصية أعلى"),
        tag("Comfortable natural light", "إضاءة طبيعية مريحة"),
        tag("Safety and strength", "أمان ومتانة عالية"),
      ],
    },
    details: {
      title: { en: "Glass details", ar: "تفاصيل الزجاج" },
      items: [
        tag("A choice of glass thickness — single or double", "سُمك زجاج متعدد الخيارات (مفرد - مزدوج)"),
        tag("Insulating layers can be added", "إمكانية إضافة طبقات عازلة"),
        tag("Works with all our opening systems", "مناسب لجميع أنظمة الفتح لدينا"),
        tag("High quality and a long service life", "جودة عالية وطول عمر افتراضي"),
      ],
    },
  },
  {
    slug: "roller-shutters",
    name: { en: "Roller shutters", ar: "الشاتر" },
    short: {
      en: "Protection, privacy and insulation — operated by switch, remote or phone.",
      ar: "حماية وخصوصية وعزل — بالمفتاح أو الريموت أو الهاتف.",
    },
    intro: {
      en: "An ideal solution for protection and privacy that adds thermal insulation and cuts noise, with a choice of designs, materials and operating systems.",
      ar: "حل مثالي للحماية والخصوصية وتوفير العزل الحراري وتقليل الضوضاء، مع خيارات متعددة من التصميمات والخامات وأنظمة التشغيل.",
    },
    count: { en: "3 slat types", ar: "3 أنواع شرائح" },
    cover: "villaShutter",
    gallery: ["villaShuttersFacade", "archedShutter"],
    items: [
      {
        id: "perforated",
        image: "slatPerforated",
        name: { en: "Perforated slat", ar: "شريحة مثقّبة (بفراغات)" },
        text: {
          en: "Lets light and air through while keeping your privacy.",
          ar: "تسمح بمرور الضوء والهواء مع الحفاظ على الخصوصية.",
        },
      },
      {
        id: "ngs",
        image: "slatNgs",
        name: { en: "NGS slat", ar: "شريحة NGS" },
        text: {
          en: "Higher thermal insulation and greater strength, with a modern design.",
          ar: "عزل حراري أعلى ومتانة أكبر مع تصميم عصري.",
        },
      },
      {
        id: "bk",
        image: "slatBk",
        name: { en: "BK slat", ar: "شريحة BK" },
        text: { en: "The economical, widely used option.", ar: "الخيار الاقتصادي والشائع الاستخدام." },
      },
    ],
    features: {
      title: { en: "Why fit a shutter", ar: "مميزات الشاتر" },
      items: [
        tag("Thermal insulation that saves energy", "عزل حراري يوفر في استهلاك الطاقة"),
        tag("Less noise from outside", "تقليل الضوضاء من الخارج"),
        tag("Complete privacy at home", "خصوصية كاملة للمنزل"),
        tag("Protection from the weather", "حماية من العوامل الجوية"),
        tag("Control light and air (depending on type)", "التحكم في الإضاءة والتهوية (حسب النوع)"),
      ],
    },
    details: {
      title: { en: "Operation & details", ar: "التشغيل والتفاصيل" },
      items: [
        tag("Wall switch — Somfy or Schneider", "مفتاح جداري (Somfy / Schneider)"),
        tag("Somfy remote control", "ريموت كنترول Somfy"),
        tag("Phone control (optional)", "تحكم عبر الهاتف (اختياري)"),
        tag("Concealed or exposed box", "صندوق مخفي أو ظاهر"),
        tag("Sealed side guide rails", "مجرى جانبي محكم"),
        tag("Rubber bottom seal for a tight close", "جلب مطاطي سفلي لإحكام الغلق"),
      ],
    },
    warranty: [
      { value: { en: "10 years", ar: "10 سنوات" }, label: { en: "Warranty on the shutter", ar: "ضمان على الشاتر" } },
      {
        value: { en: "3–5 years", ar: "3–5 سنوات" },
        label: { en: "Warranty on the motor, by type", ar: "ضمان على الموتور حسب النوع" },
      },
    ],
  },
  {
    slug: "fly-screens",
    name: { en: "Fly screens", ar: "سلك الحشرات" },
    short: {
      en: "Fresh air, kept clear of insects — fixed, sliding or pleated.",
      ar: "هواء نقي بلا حشرات — ثابت أو جرار أو بليسيه.",
    },
    tagline: { en: "Fresh air. Better protection.", ar: "هواء نقي.. وحماية بدون تنازل." },
    intro: {
      en: "Fly screen systems that fit all our window and door systems — practical, durable and easy to use.",
      ar: "مجموعة متنوعة من أنظمة سلك الحشرات لتناسب جميع أنظمة الشبابيك والأبواب بتصميم عملي ومتانة عالية وسهولة في الاستخدام.",
    },
    count: { en: "3 screen types", ar: "3 أنواع سلك" },
    cover: "classicWindow",
    gallery: ["apartmentBedroom"],
    items: [
      {
        id: "fixed",
        name: { en: "Fixed screen", ar: "السلك الثابت" },
        text: {
          en: "Fitted directly to the window frame and fixed inside the sash.",
          ar: "يُركّب مع إطارات الشباك مباشرة ويكون ثابتًا داخل الضلفة.",
        },
        points: [
          tag("Weather-resistant, high-quality mesh", "سلك عالي الجودة ومقاوم للعوامل الخارجية"),
          tag("Fitted with the matching profile", "تركيب السلك مع القطاع المناسب"),
        ],
      },
      {
        id: "sliding",
        name: { en: "Sliding screen", ar: "السلك الجرار (سلايد)" },
        text: {
          en: "Runs on its own track and moves easily left and right.",
          ar: "يعمل على مسار مستقل ويتحرك بسهولة يمينًا ويسارًا.",
        },
        points: [tag("For 2- and 4-sash sliding windows", "يناسب الشبابيك السحاب ذات الضلفتين والأربع ضلف")],
      },
      {
        id: "pleated",
        name: { en: "Pleated screen", ar: "السلك البليسيه (أكورديون)" },
        text: {
          en: "A modern design that folds away like an accordion, protecting with an elegant look.",
          ar: "تصميم عصري يُجمع بشكل أكورديون ويوفر حماية مع مظهر أنيق.",
        },
        points: [
          tag("High-quality American fibre mesh", "خامة سلك Fiber عالية الجودة (أمريكية)"),
          tag("Weather resistant", "مقاوم للعوامل الجوية"),
          tag("Folds away completely when open", "يُجمع بالكامل عند الفتح"),
          tag(
            "For hinged and sliding windows and doors, especially 3-sash sliding",
            "مناسب للشبابيك والأبواب المفصلية والسلايد، خصوصًا 3 ضلف سلايد",
          ),
          tag("Single or double opening", "متوفر بفتحة واحدة أو ضلفتين"),
        ],
      },
    ],
    features: {
      title: { en: "Built for daily use", ar: "مصمم للاستخدام اليومي" },
      items: [
        tag("Effective insect protection", "حماية فعالة من الحشرات"),
        tag("Natural, comfortable ventilation", "تهوية طبيعية ومريحة"),
        tag("Practical and easy to use", "تصميم عملي وسهل الاستخدام"),
        tag("High-quality, weather-resistant materials", "خامات عالية الجودة ومقاومة للعوامل الجوية"),
      ],
    },
  },
  {
    slug: "hardware",
    name: { en: "Hardware & accessories", ar: "الإكسسوارات وملحقات التشغيل" },
    short: {
      en: "Handles, hinges, rollers and locks for smooth, secure operation.",
      ar: "مقابض ومفصلات وعجل وأنظمة غلق لتشغيل سلس وآمن.",
    },
    intro: {
      en: "A complete range of high-quality hardware for smooth operation, a tight seal, strength and long-term use.",
      ar: "مجموعة متكاملة من الإكسسوارات عالية الجودة لضمان سهولة التشغيل والإحكام والمتانة والاستخدام طويل الأمد.",
    },
    count: { en: "7 component groups", ar: "7 مجموعات" },
    cover: "accHandles",
    gallery: ["entranceDoor", "tiltTurn"],
    items: [
      {
        id: "handles",
        image: "accHandles",
        name: { en: "Handles", ar: "المقابض" },
        text: {
          en: "For doors and windows, in white, beige, grey, black, wood, gold and silver.",
          ar: "للأبواب والشبابيك، بألوان الأبيض والبيج والرمادي والأسود والخشبي والذهبي والفضي.",
        },
      },
      {
        id: "hinges",
        image: "accHinges",
        name: { en: "Hinges", ar: "المفصلات" },
        text: {
          en: "Sizes for every use: 7.5 cm standard, 10 cm heavy-duty and adjustable 3D hinges.",
          ar: "مقاسات تناسب جميع الاستخدامات: مفصلة 7.5 سم (قياسية)، ومفصلة 10 سم (كبيرة التحمل)، ومفصلة 3D.",
        },
      },
      {
        id: "rollers",
        image: "accSlidingRollers",
        name: { en: "Sliding rollers", ar: "عجل السلايد" },
        text: {
          en: "Roller carriages with twin Teflon wheels for smooth, quiet movement.",
          ar: "عجل بعجلتين من التفلون لضمان حركة سلسة وهادئة.",
        },
      },
      {
        id: "concealed",
        image: "accConcealedRollers",
        name: { en: "Concealed heavy rollers", ar: "عجل دفن كبير" },
        text: {
          en: "Large concealed rollers used in some heavy systems.",
          ar: "عجل كبير (دفن) يُستخدم في بعض الأنظمة الثقيلة.",
        },
      },
      {
        id: "espagnolette",
        image: "accEspagnolette",
        name: { en: "Espagnolette", ar: "السبليونة" },
        text: {
          en: "A multi-point locking system for security and a tight seal.",
          ar: "نظام غلق متعدد النقاط للأمان والإحكام.",
        },
      },
      {
        id: "strikers",
        image: "accStrikers",
        name: { en: "Strikers", ar: "المقابلات" },
        text: {
          en: "Strikers for sliding, hinged and door systems, for a secure close.",
          ar: "مقابلات متنوعة للسلايد والمفصلي والأبواب لضمان غلق محكم.",
        },
      },
      {
        id: "extras",
        image: "accExtras",
        name: { en: "Extra accessories", ar: "إكسسوارات إضافية" },
        text: {
          en: "Dust brushes, opening restrictors and the small parts that keep everything working.",
          ar: "فرش مانع للأتربة ومحدد فتح وملحقات أخرى لضمان أفضل أداء.",
        },
      },
    ],
    features: {
      title: { en: "What good hardware gives you", ar: "ما توفره الإكسسوارات الجيدة" },
      items: [
        tag("Easy, smooth operation", "سهولة التشغيل وسلاسة الحركة"),
        tag("Security and a tight seal", "أمان وإحكام عالٍ"),
        tag("Quality to high standards", "جودة بمعايير عالية"),
      ],
    },
    warranty: [
      { value: { en: "5 years", ar: "5 سنوات" }, label: { en: "Warranty on accessories", ar: "ضمان على الإكسسوارات" } },
    ],
  },
];

export const getSystem = (slug: string) => systems.find((s) => s.slug === slug);

export const openingSystems = systems[0].items;

/** Frame colours offered across the range (from the company profile). */
export const finishes: { id: string; name: L; color: string; texture?: "wood" }[] = [
  { id: "white", name: { en: "White", ar: "أبيض" }, color: "#f4f4f1" },
  { id: "beige", name: { en: "Beige", ar: "بيج" }, color: "#e2d3b6" },
  { id: "grey", name: { en: "Grey", ar: "رمادي" }, color: "#7f858d" },
  { id: "black", name: { en: "Black", ar: "أسود" }, color: "#1f2125" },
  { id: "wood", name: { en: "Wood", ar: "خشبي" }, color: "#8a5a32", texture: "wood" },
];
