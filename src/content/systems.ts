import type { L } from "@/i18n/config";
import type { PhotoKey } from "./photos";

export type OpeningKind = "sliding" | "hinged" | "hinged-double" | "tilt-turn" | "fixed" | "tilt" | "folding";
export type GlassKind = "clear" | "reflective" | "fume" | "double";
export type ScreenKind = "fixed" | "sliding" | "pleated";
export type SlatKind = "tera" | "bk" | "zinc" | "safe" | "ngss" | "ngs";

export type SystemItem = {
  id: string;
  name: L;
  text: L;
  tags?: L[];
  points?: L[];
  /** Product photo for the item. */
  image?: PhotoKey;
  /** Roller-shutter slats: the slat's height in mm, for its drawn section. */
  slatHeight?: number;
};

export type SystemSlug = "windows-doors" | "glass" | "roller-shutters" | "fly-screens" | "hardware";

export type SystemCategory = {
  slug: SystemSlug;
  name: L;
  /** One line for lists and cards. */
  short: L;
  /** Paragraph that opens the system page. */
  intro: L;
  tagline?: L;
  cover: PhotoKey;
  gallery: PhotoKey[];
  items: SystemItem[];
  /** The profiles cut open, to show what's inside. */
  profiles?: { title: L; items: { image: PhotoKey; name: L; text: L }[] };
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
      en: "Opening systems for every room, view and use.",
      ar: "أنظمة فتح تناسب كل مساحة وكل استخدام.",
    },
    intro: {
      en: "A range of opening systems that suit different architectural needs and give the highest level of comfort and flexibility in everyday use.",
      ar: "مجموعة متنوعة من أنظمة الفتح لتناسب مختلف الاحتياجات المعمارية، وتوفر أعلى درجات الراحة والمرونة في الاستخدام.",
    },
    cover: "apartmentLiving",
    gallery: ["classicFrenchDoor", "homeWindow1", "tiltTurn", "slidingDoor2020", "classicTilt"],
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
        name: { en: "Tilt & turn", ar: "المفصلي قلاب" },
        text: {
          en: "Full flexibility: a secure ventilation position and a full opening, both with a tight seal.",
          ar: "مرونة كاملة في الاستخدام، يوفر وضعية تهوية آمنة وإمكانية الفتح الكامل مع إحكام عالٍ.",
        },
        tags: [tag("Flexible use", "استخدام مرن"), tag("Tight seal", "إحكام عالٍ"), tag("Safe ventilation", "تهوية آمنة")],
      },
      {
        id: "hinged-double",
        name: { en: "Double casement", ar: "المفصلي بضلفتين" },
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
    profiles: {
      title: { en: "The profile, from the inside", ar: "شكل القطاع من الداخل" },
      items: [
        {
          image: "profileHinged",
          name: { en: "Hinged profile", ar: "القطاع المفصلي" },
          text: {
            en: "Several insulating chambers inside the frame and sash, holding double glazing.",
            ar: "عدة غرف عازلة داخل الحلق والضلفة، مع زجاج مزدوج.",
          },
        },
        {
          image: "profileSliding",
          name: { en: "Sliding profile", ar: "القطاع الجرار" },
          text: {
            en: "Two sashes running on their own tracks in one frame, each with insulating chambers.",
            ar: "ضلفتان تتحركان على مسارين في حلق واحد، ولكل منهما غرف عازلة.",
          },
        },
      ],
    },
    details: {
      title: { en: "Details that make the difference", ar: "تفاصيل تصنع الفرق" },
      items: [
        tag("High-sealing gaskets", "جوانات إحكام عالية"),
        tag("Modern handles", "مقابض بتصميم عصري"),
        tag("Strong, durable hinges", "مفصلات قوية ومتينة"),
        tag("High-quality rollers", "عجلات عالية الجودة"),
        tag("High-quality, high-insulation glass", "زجاج عالي الجودة والعزل"),
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
    cover: "seaView",
    gallery: ["apartmentBedroom"],
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
        text: { en: "Reduces heat gain and gives more privacy.", ar: "يقلل الحرارة ويوفر خصوصية أعلى." },
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
        tag("A choice of glass thickness — single, double or triple", "سُمك زجاج متعدد الخيارات (مفرد - مزدوج - ثلاثي)"),
        tag("Insulating layers can be added", "إمكانية إضافة طبقات عازلة"),
        tag("Works with all our opening systems", "مناسب لجميع أنظمة الفتح لدينا"),
        tag("High quality and a long service life", "جودة عالية وطول عمر افتراضي"),
      ],
    },
  },
  {
    slug: "roller-shutters",
    name: { en: "Roller shutters", ar: "الشاتر (شيش الحصيرة)" },
    short: {
      en: "Protection, privacy and insulation — operated by switch, remote or phone.",
      ar: "حماية وخصوصية وعزل — بالمفتاح أو الريموت أو الهاتف.",
    },
    intro: {
      en: "An ideal solution for protection and privacy that adds thermal insulation and cuts noise, with a choice of designs, materials and operating systems.",
      ar: "حل مثالي للحماية والخصوصية وتوفير العزل الحراري وتقليل الضوضاء، مع خيارات متعددة من التصميمات والخامات وأنظمة التشغيل.",
    },
    cover: "villaShuttersFacade",
    gallery: ["archedShutter"],
    items: [
      {
        id: "tera",
        image: "slatTera",
        slatHeight: 58,
        name: { en: "TERA", ar: "شيش TERA" },
        text: {
          en: "A 58 mm slat.",
          ar: "شريحة بارتفاع 58 مم.",
        },
        points: [
          tag("Maximum width: 4.5 m (5 m with high-density foam)", "أقصى عرض: 4.5 م (5 م بالفوم عالي الكثافة)"),
          tag("Weight: 2.85 kg/m² (4.1 kg/m² high density)", "الوزن: 2.85 كجم/م² (4.1 كجم/م² عالي الكثافة)"),
        ],
      },
      {
        id: "bk",
        image: "slatBk",
        slatHeight: 50,
        name: { en: "BK", ar: "شيش BK" },
        text: {
          en: "A 50 mm slat.",
          ar: "شريحة بارتفاع 50 مم.",
        },
        points: [
          tag("Maximum width: 3.5 m (4.5 m with high-density foam)", "أقصى عرض: 3.5 م (4.5 م بالفوم عالي الكثافة)"),
          tag("Weight: 2.5 kg/m² (3.3 kg/m² high density)", "الوزن: 2.5 كجم/م² (3.3 كجم/م² عالي الكثافة)"),
        ],
      },
      {
        id: "zinc",
        image: "slatZinc",
        slatHeight: 55,
        name: { en: "ZINC protection", ar: "شيش حماية ZINC" },
        text: {
          en: "A 55 mm protection slat.",
          ar: "شريحة حماية بارتفاع 55 مم.",
        },
        points: [
          tag("Maximum width: 4 m (5 m with high-density foam)", "أقصى عرض: 4 م (5 م بالفوم عالي الكثافة)"),
          tag("Weight: 8.6 kg/m² (9.33 kg/m² high density)", "الوزن: 8.6 كجم/م² (9.33 كجم/م² عالي الكثافة)"),
        ],
      },
      {
        id: "safe",
        image: "slatSafe",
        slatHeight: 55,
        name: { en: "SAFE", ar: "شيش SAFE" },
        text: {
          en: "A 55 mm slat.",
          ar: "شريحة بارتفاع 55 مم.",
        },
        points: [
          tag("Maximum width: 5 m", "أقصى عرض: 5 م"),
          tag("Weight: 8.5 kg/m²", "الوزن: 8.5 كجم/م²"),
        ],
      },
      {
        id: "ngss",
        image: "slatNgss",
        slatHeight: 50,
        name: { en: "NGSS", ar: "شيش NGSS" },
        text: {
          en: "A 50 mm slat.",
          ar: "شريحة بارتفاع 50 مم.",
        },
        points: [
          tag("Maximum width: 5 m with high-density foam", "أقصى عرض: 5 م بالفوم عالي الكثافة"),
          tag("Weight: 10.8 kg/m² (high density)", "الوزن: 10.8 كجم/م² (عالي الكثافة)"),
        ],
      },
      {
        id: "ngs",
        image: "slatNgs",
        slatHeight: 50,
        name: { en: "NGS", ar: "شيش NGS" },
        text: {
          en: "A 50 mm slat.",
          ar: "شريحة بارتفاع 50 مم.",
        },
        points: [
          tag("Maximum width: 4 m (5 m with high-density foam)", "أقصى عرض: 4 م (5 م بالفوم عالي الكثافة)"),
          tag("Weight: 5 kg/m² (5.6 kg/m² high density)", "الوزن: 5 كجم/م² (5.6 كجم/م² عالي الكثافة)"),
        ],
      },
    ],
    features: {
      title: { en: "Why fit a shutter", ar: "مميزات الشاتر (شيش الحصيرة)" },
      items: [
        tag("Thermal insulation that saves energy", "عزل حراري يقلل استهلاك الطاقة"),
        tag("Less noise from outside", "تقليل الضوضاء من الخارج"),
        tag("Complete privacy at home", "خصوصية كاملة للمنزل"),
        tag("Protection from the weather", "حماية من العوامل الجوية"),
        tag("Control light and air (depending on type)", "التحكم في الإضاءة والتهوية (حسب النوع)"),
      ],
    },
    details: {
      title: { en: "Operation & details", ar: "التشغيل والتفاصيل" },
      items: [
        tag("Wall switch: on, off and stop — Somfy or Schneider", "مفتاح جداري (سويتش) للتشغيل والإيقاف — Somfy / Schneider"),
        tag("Remote control", "ريموت كنترول"),
        tag("Smart control from your phone", "نظام ذكي (سمارت) للتحكم من الموبايل"),
        tag("Manual, by strap or crank", "يدوي بشريط أو منفلة"),
        tag("Concealed or exposed box", "صندوق مخفي أو ظاهر"),
        tag("Rubber bottom seal for a tight close", "جلب مطاطي سفلي لإحكام الغلق"),
      ],
    },
    warranty: [
      { value: { en: "3 years", ar: "3 سنوات" }, label: { en: "Warranty on the shutter", ar: "ضمان على الشاتر (شيش الحصيرة)" } },
    ],
  },
  {
    slug: "fly-screens",
    name: { en: "Fly screens", ar: "سلك الحشرات" },
    short: {
      en: "Fresh air, kept clear of insects — fixed, sliding or pleated.",
      ar: "هواء نقي بلا حشرات — ثابت أو جرار أو بليسيه.",
    },
    tagline: { en: "Fresh air. Better protection.", ar: "هواء نقي.. وحماية دون تنازل." },
    intro: {
      en: "Fly screen systems that fit all our window and door systems — practical, durable and easy to use.",
      ar: "مجموعة متنوعة من أنظمة سلك الحشرات لتناسب جميع أنظمة الشبابيك والأبواب بتصميم عملي ومتانة عالية وسهولة في الاستخدام.",
    },
    cover: "apartmentBedroom",
    gallery: [],
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
        name: { en: "Sliding screen", ar: "السلك الجرار" },
        text: {
          en: "Runs on its own track and moves easily left and right.",
          ar: "يعمل على مسار مستقل ويتحرك بسهولة يمينًا ويسارًا.",
        },
        points: [tag("For 2- and 4-sash sliding windows", "يناسب الشبابيك الجرار ذات الضلفتين أو الأربع ضلف")],
      },
      {
        id: "pleated",
        name: { en: "Pleated screen", ar: "السلك البليسيه (أكورديون)" },
        text: {
          en: "A modern design that folds away like an accordion, protecting with an elegant look.",
          ar: "تصميم عصري يُطوى على شكل أكورديون، ويوفر حماية مع مظهر أنيق.",
        },
        points: [
          tag("High-quality American fibre mesh", "خامة سلك Fiber عالية الجودة (أمريكية)"),
          tag("Weather resistant", "مقاوم للعوامل الجوية"),
          tag("Folds away completely when open", "يُجمع بالكامل عند الفتح"),
          tag(
            "For hinged and sliding windows and doors, especially 3-sash sliding",
            "مناسب للشبابيك والأبواب المفصلية والجرار، ولا سيما الجرار بثلاث ضلف",
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
    cover: "accHandles",
    gallery: ["tiltTurn"],
    items: [
      {
        id: "handles",
        image: "accWindowHandles",
        name: { en: "Handles", ar: "المقابض" },
        text: {
          en: "For doors and windows, in white, beige, grey, black, wood, gold and silver.",
          ar: "للأبواب والشبابيك، بألوان الأبيض والبيج والرمادي والأسود والخشبي والذهبي والفضي.",
        },
      },
      {
        id: "flush-handle",
        image: "accFlushHandle",
        name: { en: "Flush handle", ar: "مقبض غاطس" },
        text: { en: "A flat handle that sits within the sash.", ar: "مقبض مسطح يُركّب داخل الضلفة." },
      },
      {
        id: "hinges",
        image: "acc3dHinge",
        name: { en: "Hinges", ar: "المفصلات" },
        text: {
          en: "uPVC door and window hinges, including the 3D adjustable door hinge rated to 130 kg.",
          ar: "مفصلات PVC للأبواب والشبابيك، منها مفصلة الباب 3D القابلة للضبط التي تتحمل حتى 130 كجم.",
        },
      },
      {
        id: "roller-concealed",
        image: "accRollerConcealed",
        name: { en: "Concealed sliding roller", ar: "عجل دفن للجرار" },
        text: {
          en: "A twin-wheel roller hidden inside the sliding sash, for smooth, quiet movement.",
          ar: "عجل بعجلتين يُركّب مدفونًا داخل الضلفة الجرار، لحركة سلسة وهادئة.",
        },
      },
      {
        id: "roller-flat",
        image: "accRollerFlat",
        name: { en: "Flat track roller", ar: "عجل مسطرة للجرار" },
        text: {
          en: "A slim roller on a flat bar, for sliding sashes.",
          ar: "عجل على مسطرة رفيعة للضلف الجرار.",
        },
      },
      {
        id: "door-espagnolette",
        image: "accDoorEspagnolette",
        name: { en: "Hinged-door espagnolette", ar: "سبليونة باب مفصلي" },
        text: {
          en: "Multi-point locking with a lock cylinder to open and lock the door.",
          ar: "غلق متعدد النقاط مع كالون لفتح الباب وقفله.",
        },
      },
      {
        id: "sliding-espagnolette",
        image: "accSlidingEspagnolette",
        name: { en: "Sliding espagnolette", ar: "سبليونة جرار" },
        text: {
          en: "Locks the sliding sash at several points along its edge.",
          ar: "تُحكم غلق الضلفة الجرار من أكثر من نقطة على طول حافتها.",
        },
      },
      {
        id: "strikers",
        image: "accStrikerSet",
        name: { en: "Strikers", ar: "السكاكات" },
        text: {
          en: "uPVC strikers for sliding sashes, single hinged sashes and double hinged sashes, for a tight close.",
          ar: "سكاكات PVC للجرار، وللمفصلي ضلفة واحدة، وللمفصلي ضلفتين، لغلق محكم.",
        },
      },
      {
        id: "extras",
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
