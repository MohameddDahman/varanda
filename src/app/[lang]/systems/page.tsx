import { notFound } from "next/navigation";
import { isLang } from "@/i18n/config";
import { systems } from "@/content/systems";
import { pageMeta } from "@/lib/meta";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { SystemsList } from "@/components/systems/SystemsList";
import { FinishPicker } from "@/components/systems/FinishPicker";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { HomeCTA } from "@/components/home/HomeCTA";
import { ensureContent } from "@/lib/site-content";

const copy = {
  title: { en: "Systems", ar: "أنظمتنا" },
  intro: {
    en: "A complete range of uPVC door and window systems, combining high performance and modern design with the flexibility to suit homes and commercial projects.",
    ar: "تقدم VARANDA مجموعة متكاملة من أنظمة الأبواب والشبابيك uPVC، تجمع بين الأداء العالي والتصميم العصري والمرونة لتناسب مختلف الاحتياجات السكنية والتجارية.",
  },
};

const strengths = [
  {
    icon: "tailored",
    title: { en: "A solution for every space", ar: "حلول لكل المساحات" },
    text: { en: "Residential, commercial and hospitality.", ar: "سكنية - تجارية - فندقية." },
  },
  {
    icon: "durable",
    title: { en: "Quality in the details", ar: "جودة في التفاصيل" },
    text: { en: "From profiles to accessories and installation.", ar: "من القطاعات إلى الإكسسوارات والتركيب." },
  },
  {
    icon: "finishes",
    title: { en: "Many designs", ar: "تصميمات متعددة" },
    text: { en: "To meet every architectural requirement.", ar: "تلبي جميع المتطلبات المعمارية." },
  },
  {
    icon: "thermal",
    title: { en: "Reliable performance", ar: "أداء موثوق" },
    text: {
      en: "High thermal and acoustic insulation, resistant to the weather.",
      ar: "عزل حراري وصوتي عالٍ ومقاومة للعوامل الجوية.",
    },
  },
];

export async function generateMetadata({ params }: PageProps<"/[lang]/systems">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMeta(lang, "/systems", copy.title[lang], copy.intro[lang]);
}

export default async function SystemsPage({ params }: PageProps<"/[lang]/systems">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = (s: { en: string; ar: string }) => s[lang];

  return (
    <>
      <PageHero
        eyebrow={lang === "ar" ? "أنظمة الأبواب والشبابيك uPVC" : "uPVC window & door systems"}
        title={copy.title[lang]}
        count={systems.length}
        intro={copy.intro[lang]}
      />

      <section className="theme-light pb-[var(--section-y)]" data-header="light" aria-label={copy.title[lang]}>
        <div className="wrap">
          <SystemsList />
        </div>
      </section>

      <section className="theme-dark section" data-header="dark" aria-labelledby="strengths-title">
        <div className="wrap">
          <Eyebrow>{lang === "ar" ? "ما يجمع أنظمتنا" : "What every system shares"}</Eyebrow>
          <SplitReveal as="h2" id="strengths-title" className="t-display mt-6 max-w-[14ch]">
            {lang === "ar" ? "أكثر من مجرد شباك." : "More than just a window."}
          </SplitReveal>
          <p className="t-lead mt-6 max-w-[40ch] text-mist">
            {lang === "ar" ? "منظومة متكاملة صُممت لتدوم." : "An integrated system, designed to last."}
          </p>
          <Reveal as="ul" items="li" className="mt-16 grid gap-px border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((s) => (
              <li key={s.title.en} className="border-b border-[var(--line)] py-8 sm:pe-8">
                <Icon name={s.icon} className="h-7 w-7 text-mist" />
                <h3 className="t-h3 mt-8">{t(s.title)}</h3>
                <p className="t-small mt-2 text-mist">{t(s.text)}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="theme-white section" data-header="light" aria-labelledby="finish-title">
        <div className="wrap">
          <Eyebrow>{lang === "ar" ? "خيارات الألوان والتشطيبات" : "Colours & finishes"}</Eyebrow>
          <SplitReveal as="h2" id="finish-title" className="t-h1 mb-16 mt-6 max-w-[16ch]">
            {lang === "ar" ? "اختر لون الإطار." : "Choose your frame."}
          </SplitReveal>
          <FinishPicker />
        </div>
      </section>

      <HomeCTA lang={lang} />
    </>
  );
}
