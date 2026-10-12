import type { L } from "@/i18n/config";

const t = (en: string, ar: string): L => ({ en, ar });

export const about = {
  title: t("A new vision. Backed by years of experience.", "رؤية جديدة.. تدعمها سنوات من الخبرة."),
  motto: t("Experienced hands. A new vision. Made for life.", "خبرة راسخة. رؤية جديدة. صُنعت لتدوم."),
  body: [
    t(
      "VARANDA is a specialised uPVC windows and doors company, built by a team with 15–20 years of hands-on industry experience.",
      "VARANDA شركة متخصصة في أنظمة الأبواب والشبابيك uPVC، أسسها فريق يمتلك خبرة عملية تتراوح بين 15 و20 عامًا في هذا المجال.",
    ),
    t(
      "That experience covers every stage of the work — from technical consultation and site measurement to manufacturing, installation and after-sales support.",
      "تغطي خبرتنا كل مراحل العمل، من الاستشارة الفنية ورفع المقاسات بالموقع، إلى التصنيع والتركيب وخدمات ما بعد البيع.",
    ),
    t(
      "We bring it together under VARANDA to deliver modern window and door solutions built on quality, performance, durability and attention to detail.",
      "وتجتمع هذه الخبرة تحت اسم VARANDA لنقدّم حلولًا عصرية للأبواب والشبابيك ترتكز على الجودة والأداء والمتانة والاهتمام بأدق التفاصيل.",
    ),
  ],
  stat: {
    value: "15–20",
    unit: t("years", "عامًا"),
    label: t("Combined team experience in uPVC", "خبرة مجمّعة لفريق العمل في uPVC"),
  },
  pillars: [
    {
      id: "comfort",
      title: t("Thermal & acoustic comfort", "راحة حرارية وصوتية"),
      text: t("Rooms that stay cooler and quieter.", "غرف أبرد وأكثر هدوءًا."),
    },
    {
      id: "durable",
      title: t("Durable uPVC systems", "أنظمة uPVC متينة"),
      text: t("Profiles and hardware built to last.", "قطاعات وإكسسوارات مصممة لتدوم."),
    },
    {
      id: "tailored",
      title: t("Tailored solutions", "حلول حسب الطلب"),
      text: t("Every opening measured and made to fit.", "كل فتحة تُقاس وتُصنّع بمقاسها."),
    },
    {
      id: "install",
      title: t("Professional installation", "تركيب احترافي"),
      text: t("A specialised team and a clean finish.", "فريق متخصص وتشطيب نظيف."),
    },
  ],
};

export const process = {
  title: t("From idea to handover", "من الفكرة إلى التسليم"),
  intro: t(
    "We stay with you at every step, so your project is delivered with the highest level of quality, precision and commitment.",
    "نرافقك في كل خطوة لنضمن تنفيذ مشروعك بأعلى مستوى من الجودة والدقة والالتزام.",
  ),
  steps: [
    {
      title: t("Site visit & measurement", "معاينة ورفع مقاسات"),
      text: t(
        "We inspect the site, understand what you need and take precise measurements.",
        "معاينة الموقع وفهم احتياجاتك ورفع المقاسات بأعلى دقة.",
      ),
    },
    {
      title: t("Quotation", "عرض سعر"),
      text: t(
        "A detailed quotation covering every detail, material and system suited to your project.",
        "تقديم عرض سعر تفصيلي يشمل جميع التفاصيل والخامات والأنظمة المناسبة لمشروعك.",
      ),
    },
    {
      title: t("Contract", "تعاقد"),
      text: t(
        "We sign once every term is reviewed and the dates and schedule are confirmed.",
        "توقيع التعاقد بعد مراجعة كافة البنود وتأكيد المواعيد وجدول التنفيذ.",
      ),
    },
    {
      title: t("Manufacturing", "تصنيع"),
      text: t(
        "Your doors and windows are made to the approved specification, in high-quality materials.",
        "تصنيع الأبواب والشبابيك طبقًا للمواصفات المعتمدة وباستخدام خامات عالية الجودة.",
      ),
    },
    {
      title: t("Installation", "تركيب"),
      text: t(
        "Professional installation by a specialised team, to our quality and finishing standards.",
        "تركيب احترافي بواسطة فريق متخصص مع الالتزام بمعايير الجودة والتشطيب.",
      ),
    },
    {
      title: t("Final handover", "تسليم نهائي"),
      text: t(
        "We hand over after a final inspection, once everything runs perfectly and you are satisfied.",
        "تسليم المشروع بعد الفحص والتأكد من كفاءة التشغيل ورضا العميل.",
      ),
    },
  ],
  commitments: [
    t("High-quality materials", "خامات عالية الجودة"),
    t("Precise, professional work", "تنفيذ دقيق ومحترف"),
    t("On-time delivery", "التزام بالمواعيد"),
    t("Ongoing support", "دعم مستمر"),
  ],
};

export const warranty = {
  title: t("Warranty & after-sales", "الضمان وخدمات ما بعد البيع"),
  text: t(
    "We believe in the quality of our products, so we give you a real warranty and after-sales service that keep everything performing for years.",
    "نؤمن بجودة منتجاتنا، لذلك نقدم لك ضمانًا حقيقيًا وخدمات ما بعد البيع لضمان استمرار الأداء والكفاءة لفترات طويلة.",
  ),
  figures: [
    { value: 5, suffix: t("years", "سنوات"), label: t("Warranty of up to 5 years", "ضمان يصل إلى 5 سنوات") },
    { value: 10, suffix: t("years", "سنوات"), label: t("On roller shutters", "على الشاتر") },
    { value: 5, suffix: t("years", "سنوات"), label: t("On accessories", "على الإكسسوارات") },
  ],
  services: [
    t("Original spare parts", "توفير قطع غيار أصلية"),
    t("Fast technical support", "دعم فني سريع"),
    t("Periodic maintenance when needed", "صيانة دورية عند الحاجة"),
  ],
  install: t("A specialised team. A fine finish. Results that last.", "فريق متخصص.. تشطيب متميز.. نتائج تدوم."),
};

export const benefits = {
  title: t("Why choose uPVC?", "لماذا uPVC؟"),
  intro: t(
    "uPVC is an ideal material for modern windows and doors, combining high performance, durability, comfort and design flexibility for homes and commercial projects.",
    "توفر أنظمة uPVC حلًا مثاليًا للأبواب والشبابيك الحديثة، فهي تجمع بين الأداء العالي والمتانة والراحة ومرونة التصميم للمشروعات السكنية والتجارية.",
  ),
  items: [
    {
      id: "thermal",
      title: t("Thermal insulation", "عزل حراري ممتاز"),
      text: t(
        "Helps keep a comfortable indoor temperature and improves energy efficiency.",
        "يساعد في الحفاظ على درجة حرارة داخلية مريحة ويحسّن كفاءة استهلاك الطاقة.",
      ),
    },
    {
      id: "acoustic",
      title: t("Sound insulation", "عزل صوتي فعّال"),
      text: t(
        "Cuts outside noise for quieter, more comfortable rooms.",
        "يقلل الضوضاء الخارجية لمساحات داخلية أكثر هدوءًا وراحة.",
      ),
    },
    {
      id: "durable",
      title: t("Durability & long life", "متانة وعمر طويل"),
      text: t(
        "Highly resistant to weather, moisture and corrosion for reliable long-term performance.",
        "مقاوم بدرجة عالية للعوامل الجوية والرطوبة والتآكل لأداء موثوق على المدى الطويل.",
      ),
    },
    {
      id: "maintenance",
      title: t("Easy maintenance", "سهولة الصيانة"),
      text: t(
        "No painting or regular treatment. Easy to clean and look after.",
        "لا يحتاج إلى دهان أو معالجة دورية، وسهل التنظيف والصيانة.",
      ),
    },
    {
      id: "finishes",
      title: t("Designs & finishes", "تصميمات وتشطيبات متنوعة"),
      text: t(
        "A wide choice of colours and finishes to suit different architectural styles.",
        "تشكيلة واسعة من الألوان والتشطيبات تناسب مختلف الطرز المعمارية.",
      ),
    },
    {
      id: "security",
      title: t("Tight sealing & security", "إحكام عالٍ وأمان"),
      text: t(
        "Precision-engineered systems seal tightly and support advanced locking.",
        "أنظمة مصممة بدقة توفر إحكامًا ممتازًا وتدعم حلول غلق متطورة.",
      ),
    },
  ],
};

/** Callouts for the profile cross-section (from the company profile render). */
export const anatomy = {
  title: t("Inside every frame", "داخل كل إطار"),
  intro: t(
    "What you see is a slim white line. What you get is an engineered section — chambers, reinforcement, seals and glass working together.",
    "ما تراه خط أبيض رفيع، وما تحصل عليه قطاع هندسي متكامل: غرف عزل وتقوية وجوانات وزجاج تعمل معًا.",
  ),
  parts: [
    {
      id: "chambers",
      title: t("Multi-chamber profile", "قطاع متعدد الغرف"),
      text: t(
        "Air chambers inside the uPVC slow heat and sound on their way through the frame.",
        "غرف الهواء داخل قطاع uPVC تحدّ من انتقال الحرارة والصوت عبر الإطار.",
      ),
    },
    {
      id: "steel",
      title: t("Reinforced core", "قلب مُقوّى"),
      text: t(
        "A steel reinforcement runs through the main chamber for rigidity over long spans.",
        "تقوية معدنية داخل الغرفة الرئيسية تمنح الإطار صلابة في الفتحات الكبيرة.",
      ),
    },
    {
      id: "gaskets",
      title: t("High-sealing gaskets", "جوانات إحكام عالية"),
      text: t(
        "Continuous seals close the gap between sash and frame against dust, wind and water.",
        "جوانات متصلة تُحكم الفراغ بين الضلفة والإطار ضد الأتربة والرياح والمياه.",
      ),
    },
    {
      id: "glass",
      title: t("Double glazing", "زجاج مزدوج"),
      text: t(
        "Two panes and a sealed gap for better thermal and acoustic insulation.",
        "لوحان من الزجاج وفراغ محكم بينهما لعزل حراري وصوتي أفضل.",
      ),
    },
  ],
};
