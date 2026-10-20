import type { Lang } from "@/i18n/config";
import { path } from "@/i18n/config";
import { about } from "@/content/company";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/motion/CountUp";
import { ScrubText } from "@/components/motion/ScrubText";
import { Reveal } from "@/components/motion/Reveal";

export function HomeIntro({ lang }: { lang: Lang }) {
  const t = (s: { en: string; ar: string }) => s[lang];
  return (
    <section className="theme-light section" data-header="light" aria-labelledby="intro-title">
      <div className="wrap grid gap-y-16 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-4">
          <Eyebrow>{lang === "ar" ? "عن VARANDA" : "About VARANDA"}</Eyebrow>
          <div className="mt-10 lg:mt-14">
            <p className="intro-stat t-num" dir="ltr">
              <CountUp to={about.stat.value} />
            </p>
            <p className="t-label mt-4 max-w-[24ch] text-ink-2">
              {t(about.stat.unit)} — {t(about.stat.label)}
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <h2 id="intro-title" className="sr-only">
            {t(about.title)}
          </h2>
          <ScrubText className="t-h1 max-w-[22ch]">
            {lang === "ar"
              ? "خبرة راسخة ورؤية جديدة، من القياس حتى التركيب."
              : "Experienced hands, a new vision — from measuring to installation."}
          </ScrubText>

          <Reveal as="ul" items="li" className="intro-pillars mt-16 lg:mt-24">
            {about.pillars.map((p) => (
              <li key={p.id} className="intro-pillar">
                <Icon name={p.id === "comfort" ? "thermal" : p.id} className="h-7 w-7 text-navy-700" />
                <h3 className="t-h3 mt-8">{t(p.title)}</h3>
                <p className="t-small mt-2 text-ink-2">{t(p.text)}</p>
              </li>
            ))}
          </Reveal>

          <div className="mt-14">
            <Button href={path(lang, "/about")} variant="outline">
              {lang === "ar" ? "تعرّف علينا" : "Meet VARANDA"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
