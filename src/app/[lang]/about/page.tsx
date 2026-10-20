import { notFound } from "next/navigation";
import { isLang } from "@/i18n/config";
import { about, process, warranty } from "@/content/company";
import { pageMeta } from "@/lib/meta";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { LogoLockup } from "@/components/brand/Logo";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { HomeProcess } from "@/components/home/HomeProcess";
import { HomeWarranty } from "@/components/home/HomeWarranty";
import { HomeCTA } from "@/components/home/HomeCTA";
import { ensureContent } from "@/lib/site-content";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMeta(lang, "/about", lang === "ar" ? "من نحن" : "About", about.body[0][lang]);
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = (s: { en: string; ar: string }) => s[lang];

  return (
    <>
      <PageHero eyebrow={lang === "ar" ? "من نحن" : "About VARANDA"} title={t(about.title)} size="display" />

      <section className="theme-light pb-[var(--section-y)]" data-header="light" aria-label={t(about.title)}>
        <div className="wrap grid gap-y-16 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-5">
            {/* The company's logo, as the client asked, in place of a photo */}
            <Reveal trigger="enter" className="about-logo">
              <LogoLockup className="about-logo-mark" />
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal items="p" className="space-y-6">
              {about.body.map((p) => (
                <p key={p.en} className="t-lead">
                  {t(p)}
                </p>
              ))}
            </Reveal>
            <div className="mt-16 border-t border-[var(--line)] pt-10">
              <p className="intro-stat t-num" dir="ltr">
                <CountUp to={about.stat.value} />
              </p>
              <p className="t-label mt-4 text-ink-2">
                {t(about.stat.unit)} — {t(about.stat.label)}
              </p>
            </div>
            <p className="t-h3 mt-16 max-w-[24ch]">
              {t(about.motto).replace(/\.$/, "")}
              <span className="dot">.</span>
            </p>
          </div>
        </div>
      </section>

      <section className="theme-white section" data-header="light" aria-labelledby="pillars-title">
        <div className="wrap">
          <Eyebrow>{lang === "ar" ? "ما نركز عليه" : "What we focus on"}</Eyebrow>
          <SplitReveal as="h2" id="pillars-title" className="t-display mt-6 max-w-[13ch]">
            {lang === "ar" ? "الجودة في كل مرحلة." : "Quality at every stage."}
          </SplitReveal>
          <Reveal as="ul" items="li" className="intro-pillars mt-16">
            {about.pillars.map((p) => (
              <li key={p.id} className="intro-pillar">
                <Icon name={p.id === "comfort" ? "thermal" : p.id} className="h-7 w-7 text-navy-700" />
                <h3 className="t-h3 mt-8">{t(p.title)}</h3>
                <p className="t-small mt-2 text-ink-2">{t(p.text)}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <HomeProcess id="process" />

      <section className="theme-light section" data-header="light" aria-labelledby="install-title">
        <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-5">
            <Eyebrow>{lang === "ar" ? "تركيب احترافي" : "Professional installation"}</Eyebrow>
            <SplitReveal as="h2" id="install-title" className="t-h1 mt-6 max-w-[14ch]">
              {t(warranty.install)}
            </SplitReveal>
            <p className="t-lead mt-6 max-w-[40ch] text-ink-2">
              {lang === "ar"
                ? "يركّب فريقنا المتخصص كل باب وشباك وفق معايير الجودة والتشطيب، ثم يتأكد من كفاءة التشغيل قبل التسليم."
                : "Our own specialised team fits every door and window to our quality and finishing standards, then checks everything runs perfectly before handover."}
            </p>
          </div>
          <Reveal as="ul" items="li" className="lg:col-span-6 lg:col-start-7 lg:self-end">
            {process.commitments.map((c) => (
              <li key={c.en} className="t-h3 flex items-center gap-5 border-b border-[var(--line)] py-6 first:border-t">
                <span className="h-2 w-2 shrink-0 bg-red" aria-hidden="true" />
                {t(c)}
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <HomeWarranty lang={lang} />
      <HomeCTA lang={lang} />
    </>
  );
}
