import { notFound } from "next/navigation";
import { isLang, path } from "@/i18n/config";
import { benefits } from "@/content/company";
import { pageMeta } from "@/lib/meta";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { AcousticDemo, ThermalDemo } from "@/components/why/BenefitDemos";
import { LockMechanism } from "@/components/why/LockMechanism";
import { ProfileSection } from "@/components/why/ProfileSection";
import { HomeCTA } from "@/components/home/HomeCTA";
import { ensureContent } from "@/lib/site-content";

export async function generateMetadata({ params }: PageProps<"/[lang]/why-upvc">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMeta(lang, "/why-upvc", benefits.title[lang], benefits.intro[lang]);
}

export default async function WhyPage({ params }: PageProps<"/[lang]/why-upvc">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = (s: { en: string; ar: string }) => s[lang];
  const [thermal, acoustic, durable, maintenance, finishes, security] = benefits.items;

  const featured = [
    { item: thermal, demo: <ThermalDemo /> },
    { item: acoustic, demo: <AcousticDemo /> },
    { item: security, demo: <LockMechanism /> },
  ];

  return (
    <>
      <PageHero
        eyebrow={lang === "ar" ? "لماذا uPVC" : "Why uPVC"}
        title={t(benefits.title)}
        intro={t(benefits.intro)}
        size="display"
      />

      <section className="theme-light pb-[var(--section-y)]" data-header="light" aria-label={t(benefits.title)}>
        <div className="wrap space-y-[clamp(5rem,10vw,9rem)]">
          {featured.map(({ item, demo }, i) => (
            <article key={item.id} className="grid items-center gap-10 md:grid-cols-12 md:gap-x-8" aria-labelledby={`b-${item.id}`}>
              <div className={i % 2 === 1 ? "md:order-2 md:col-span-6 md:col-start-7" : "md:col-span-6"}>{demo}</div>
              <Reveal className={i % 2 === 1 ? "md:order-1 md:col-span-5" : "md:col-span-5 md:col-start-8"}>
                <Icon name={item.id} className="h-8 w-8 text-navy-700" />
                <h2 id={`b-${item.id}`} className="t-h1 mt-6">
                  {t(item.title)}
                </h2>
                <p className="t-lead mt-5 max-w-[36ch] text-ink-2">{t(item.text)}</p>
              </Reveal>
            </article>
          ))}

          <Reveal as="ul" items="li" className="grid gap-px border-t border-[var(--line)] md:grid-cols-3">
            {[durable, maintenance, finishes].map((item) => (
              <li key={item.id} className="border-b border-[var(--line)] py-10 md:pe-10">
                <Icon name={item.id} className="h-7 w-7 text-navy-700" />
                <h2 className="t-h2 mt-8">{t(item.title)}</h2>
                <p className="t-body mt-3 text-ink-2">{t(item.text)}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <ProfileSection />

      <section className="theme-white section" data-header="light" aria-labelledby="glass-teaser">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <div className="lg:col-span-7">
            <Eyebrow>{lang === "ar" ? "الزجاج" : "Glass"}</Eyebrow>
            <SplitReveal as="h2" id="glass-teaser" className="t-display mt-6 max-w-[13ch]">
              {lang === "ar" ? "والزجاج نصف الحكاية." : "Glass is the other half."}
            </SplitReveal>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="t-lead text-ink-2">
              {lang === "ar"
                ? "شفاف أو عاكس أو فوميه أو مزدوج — قارن بينها على إطلالة حقيقية."
                : "Clear, reflective, fumé or double glazed — compare them on a real view."}
            </p>
            <div className="mt-8">
              <Button href={path(lang, "/systems/glass")} variant="outline">
                {lang === "ar" ? "قارن أنواع الزجاج" : "Compare glass"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <HomeCTA lang={lang} />
    </>
  );
}
