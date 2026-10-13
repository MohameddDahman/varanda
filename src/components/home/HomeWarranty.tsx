import type { Lang } from "@/i18n/config";
import { warranty } from "@/content/company";
import { photos } from "@/content/photos";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ShutterImage } from "@/components/motion/ShutterImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";

export function HomeWarranty({ lang }: { lang: Lang }) {
  const t = (s: { en: string; ar: string }) => s[lang];
  return (
    <section className="theme-light section" data-header="light" aria-labelledby="warranty-title">
      <div className="wrap grid gap-y-16 lg:grid-cols-12 lg:gap-x-8">
        <figure className="lg:col-span-5">
          <ShutterImage photo={photos.installTeam} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[4/5] w-full" />
          <figcaption className="t-label mt-4 text-ink-2">
            {lang === "ar" ? "فريق التركيب — نتابع معك بعد التسليم" : "Our installation team — still with you after handover"}
          </figcaption>
        </figure>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
          <Eyebrow>{t(warranty.title)}</Eyebrow>
          <SplitReveal as="h2" id="warranty-title" className="t-h1 mt-6 max-w-[16ch]">
            {lang === "ar" ? "ضمان حقيقي، ودعم بعد التسليم." : "A real warranty, and support after handover."}
          </SplitReveal>
          <p className="t-lead mt-6 max-w-[44ch] text-ink-2">{t(warranty.text)}</p>

          <dl className="warranty-figures mt-14">
            {warranty.figures.map((f) => (
              <div key={f.label.en} className="warranty-figure">
                <dt className="t-small text-ink-2">{t(f.label)}</dt>
                <dd className="mt-3 flex items-baseline gap-2">
                  <span className="warranty-value t-num" dir="ltr">
                    <CountUp to={f.value} />
                  </span>
                  <span className="t-label text-ink-2">{t(f.suffix)}</span>
                </dd>
              </div>
            ))}
          </dl>

          <Reveal as="ul" items="li" className="mt-12 space-y-0">
            {warranty.services.map((s) => (
              <li key={s.en} className="warranty-service">
                <span className="h-1.5 w-1.5 shrink-0 bg-red" aria-hidden="true" />
                {t(s)}
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
