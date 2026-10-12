import { notFound } from "next/navigation";
import { isLang, path, type L, type Lang } from "@/i18n/config";
import { getSystem, systems, type SystemCategory } from "@/content/systems";
import { projects, projectTypes } from "@/content/projects";
import { photos } from "@/content/photos";
import { ui } from "@/content/site";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TLink } from "@/components/transition/TLink";
import { ShutterImage } from "@/components/motion/ShutterImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { OpeningShowcase } from "@/components/systems/OpeningShowcase";
import { GlassSwitcher } from "@/components/systems/GlassSwitcher";
import { ScreenDiagram, ShutterDemo, SlatProfile } from "@/components/systems/ShutterDemo";
import { HomeCTA } from "@/components/home/HomeCTA";
import { Arrow } from "@/components/ui/Button";

export const dynamicParams = false;

export async function generateStaticParams() {
  return systems.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/systems/[slug]">) {
  const { lang, slug } = await params;
  const system = getSystem(slug);
  if (!isLang(lang) || !system) return {};
  return pageMeta(lang, `/systems/${slug}`, system.name[lang], system.intro[lang]);
}

const T = (lang: Lang) => (s: { en: string; ar: string }) => s[lang];

export default async function SystemPage({ params }: PageProps<"/[lang]/systems/[slug]">) {
  const { lang, slug } = await params;
  const system = getSystem(slug);
  if (!isLang(lang) || !system) notFound();
  const t = T(lang);
  const related = projects.filter((p) => p.systems.includes(system.slug));
  const others = systems.filter((s) => s.slug !== system.slug);
  const lists = [
    system.features && { eyebrow: { en: "Benefits", ar: "المميزات" }, ...system.features },
    system.details && { eyebrow: { en: "Details", ar: "التفاصيل" }, ...system.details },
  ].filter((list) => !!list);

  return (
    <>
      {/* Hero */}
      <section className="theme-dark relative pt-[calc(var(--header-h)+clamp(3rem,9vh,7rem))] pb-[var(--section-y)]" data-header="dark">
        <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-6">
            <Reveal trigger="enter" delay={0.15}>
              <TLink href={path(lang, "/systems")} className="t-label inline-flex items-center gap-2 text-mist hover:text-white">
                <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
                  ←
                </span>
                {t(ui.allSystems)}
              </TLink>
            </Reveal>
            <SplitReveal as="h1" trigger="enter" widen className="t-display mt-10">
              {t(system.name)}
            </SplitReveal>
            {system.tagline && (
              <Reveal trigger="enter" delay={0.35} className="t-h3 mt-6 text-white">
                {t(system.tagline)}
              </Reveal>
            )}
            <Reveal trigger="enter" delay={0.45} className="mt-8 max-w-[44ch]">
              <p className="t-lead text-mist">{t(system.intro)}</p>
              <p className="t-label mt-8 text-white/80">{t(system.count)}</p>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <ShutterImage
              photo={photos[system.cover]}
              sizes="(min-width: 1024px) 40vw, 100vw"
              trigger="enter"
              preload
              className="aspect-[4/5] w-full"
            />
          </div>
        </div>
      </section>

      {/* System-specific showcase */}
      <Showcase system={system} lang={lang} />

      {/* Features + details */}
      {lists.length > 0 && (
        <section className="theme-dark section" data-header="dark">
          <div className={cn("wrap grid lg:grid-cols-12 lg:gap-x-8", lists.length === 2 ? "gap-y-16" : "gap-y-10")}>
            {lists.length === 2 ? (
              lists.map((list, i) => (
                <div key={list.eyebrow.en} className={i === 0 ? "lg:col-span-5" : "lg:col-span-6 lg:col-start-7"}>
                  <ListHeading list={list} t={t} />
                  <Points items={list.items} t={t} columns={i === 1} className="mt-10" />
                </div>
              ))
            ) : (
              // A single list sits beside its heading rather than leaving half the row empty.
              <>
                <div className="lg:col-span-5">
                  <ListHeading list={lists[0]} t={t} />
                </div>
                <Points items={lists[0].items} t={t} columns className="lg:col-span-6 lg:col-start-7 lg:self-end" />
              </>
            )}
          </div>
          {system.warranty && (
            <div className="wrap mt-20">
              <dl className="grid gap-px border-t border-[var(--line)] sm:grid-cols-2">
                {system.warranty.map((w) => (
                  <div key={w.label.en} className="border-b border-[var(--line)] py-8 sm:pe-8">
                    <dt className="t-label text-mist">{t(w.label)}</dt>
                    <dd className="warranty-value t-num mt-4 !text-white" dir="ltr">
                      <CountUp to={w.value.en.replace(" years", "")} />
                      <span className="t-label ms-3 align-middle text-mist">{lang === "ar" ? "سنوات" : "years"}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>
      )}

      {/* Projects that use it */}
      {related.length > 0 && (
        <section className="theme-light section" data-header="light">
          <div className="wrap">
            <Eyebrow>{lang === "ar" ? "في مشروعاتنا" : "In our projects"}</Eyebrow>
            <ul className="mt-10 grid gap-10 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <TLink href={path(lang, `/projects/${p.slug}`)} className="group block" data-cursor={t(ui.view)}>
                    <ShutterImage photo={photos[p.cover]} sizes="(min-width: 768px) 30vw, 100vw" className="aspect-[4/3] w-full" />
                    <h3 className="t-h3 mt-5">{t(p.title)}</h3>
                    <p className="t-label mt-2 text-ink-2">
                      {t(projectTypes[p.type])} · {p.year}
                    </p>
                  </TLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Other systems */}
      <section className="theme-white section" data-header="light">
        <div className="wrap">
          <Eyebrow>{lang === "ar" ? "أنظمة أخرى" : "Other systems"}</Eyebrow>
          <ul className="mt-10 border-t border-[var(--line)]">
            {others.map((s) => (
              <li key={s.slug} className="border-b border-[var(--line)]">
                <TLink href={path(lang, `/systems/${s.slug}`)} className="group flex items-center justify-between gap-6 py-6">
                  <span className="t-h2 transition-transform duration-500 group-hover:translate-x-2 rtl:group-hover:-translate-x-2">
                    {t(s.name)}
                  </span>
                  <span className="flex items-center gap-6 text-ink-2">
                    <span className="t-label hidden sm:inline">{t(s.count)}</span>
                    <Arrow className="h-4 w-8" />
                  </span>
                </TLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HomeCTA lang={lang} />
    </>
  );
}

/** The range sections show no heading of their own; this keeps the outline h1 → h2 → h3. */
function RangeTitle({ children }: { children: string }) {
  return (
    <h2 id="range-title" className="sr-only">
      {children}
    </h2>
  );
}

type PointList = { eyebrow: L; title: L; items: L[] };

function ListHeading({ list, t }: { list: PointList; t: (s: L) => string }) {
  return (
    <>
      <Eyebrow>{t(list.eyebrow)}</Eyebrow>
      <SplitReveal as="h2" className="t-h1 mt-6 max-w-[16ch]">
        {t(list.title)}
      </SplitReveal>
    </>
  );
}

function Points({
  items,
  t,
  columns = false,
  className,
}: {
  items: L[];
  t: (s: L) => string;
  columns?: boolean;
  className?: string;
}) {
  return (
    <Reveal as="ul" items="li" className={cn("grid gap-x-8", columns && "sm:grid-cols-2", className)}>
      {items.map((item) => (
        <li key={item.en} className="t-body flex items-start gap-4 border-b border-[var(--line)] py-4">
          {/* One line tall, so the bullet stays level with the first line when the text wraps. */}
          <span className="flex h-[1lh] shrink-0 items-center" aria-hidden="true">
            <span className="h-1.5 w-1.5 bg-red" />
          </span>
          <span>{t(item)}</span>
        </li>
      ))}
    </Reveal>
  );
}

function Showcase({ system, lang }: { system: SystemCategory; lang: Lang }) {
  const t = T(lang);

  if (system.slug === "windows-doors") {
    return (
      <section className="theme-white section" data-header="light" aria-labelledby="range-title">
        <div className="wrap">
          <RangeTitle>{t(system.count)}</RangeTitle>
          <OpeningShowcase />
        </div>
      </section>
    );
  }

  if (system.slug === "glass") {
    return (
      <section className="theme-white section" data-header="light" aria-labelledby="glass-title">
        <div className="wrap">
          <Eyebrow>{lang === "ar" ? "قارن بنفسك" : "See the difference"}</Eyebrow>
          <SplitReveal as="h2" id="glass-title" className="t-h1 mb-14 mt-6 max-w-[18ch]">
            {lang === "ar" ? "الإطلالة نفسها، بزجاج مختلف." : "The same view, through different glass."}
          </SplitReveal>
          <GlassSwitcher />
        </div>
      </section>
    );
  }

  if (system.slug === "roller-shutters") {
    return (
      <>
        <section className="theme-white" data-header="light" aria-labelledby="shutter-title">
          <ShutterDemo />
        </section>
        <section className="theme-light section" data-header="light" aria-labelledby="slats-title">
          <div className="wrap">
            <Eyebrow>{lang === "ar" ? "أنواع الشرائح" : "Slat types"}</Eyebrow>
            <SplitReveal as="h2" id="slats-title" className="t-h1 mt-6 max-w-[16ch]">
              {lang === "ar" ? "ثلاث شرائح لثلاثة احتياجات." : "Three slats for three needs."}
            </SplitReveal>
            <Reveal as="ul" items="li" className="mt-14 grid gap-px border-t border-[var(--line)] md:grid-cols-3">
              {system.items.map((s) => (
                <li key={s.id} className="border-b border-[var(--line)] py-10 md:pe-10">
                  <div className="max-w-[16rem] text-navy-700">
                    <SlatProfile kind={s.id as "perforated" | "ngs" | "bk"} />
                  </div>
                  <h3 className="t-h2 mt-10">{t(s.name)}</h3>
                  <p className="t-body mt-3 max-w-[32ch] text-ink-2">{t(s.text)}</p>
                </li>
              ))}
            </Reveal>
          </div>
        </section>
      </>
    );
  }

  if (system.slug === "fly-screens") {
    return (
      <section className="theme-white section" data-header="light" aria-labelledby="range-title">
        <div className="wrap">
          <RangeTitle>{t(system.count)}</RangeTitle>
          <ul className="grid gap-16 md:grid-cols-3 md:gap-8">
            {system.items.map((s) => (
              <li key={s.id}>
                <ScreenDiagram kind={s.id as "fixed" | "sliding" | "pleated"} />
                <h3 className="t-h2 mt-8">{t(s.name)}</h3>
                <p className="t-body mt-3 text-ink-2">{t(s.text)}</p>
                {s.points && (
                  <ul className="mt-6">
                    {s.points.map((pt) => (
                      <li key={pt.en} className="flex gap-3 border-t border-[var(--line)] py-3 text-[0.9375rem]">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-red" aria-hidden="true" />
                        {t(pt)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  // hardware
  return (
    <section className="theme-white section" data-header="light" aria-labelledby="range-title">
      <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <RangeTitle>{t(system.count)}</RangeTitle>
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <figure>
              <ShutterImage photo={photos.tiltTurn} sizes="(min-width: 1024px) 30vw, 100vw" className="aspect-[4/5] w-full" decorative />
              <figcaption className="t-label mt-4 text-ink-2">{t(photos.tiltTurn.alt)}</figcaption>
            </figure>
          </div>
        </div>
        <Reveal as="ul" items="li" className="grid gap-px border-t border-[var(--line)] sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {system.items.map((h) => (
            <li key={h.id} className="border-b border-[var(--line)] py-8 sm:pe-8">
              <h3 className="t-h3">{t(h.name)}</h3>
              <p className="t-body mt-3 text-ink-2">{t(h.text)}</p>
              {h.id === "handles" && (
                <div className="mt-5 flex gap-2" aria-hidden="true">
                  {["#f4f4f1", "#e2d3b6", "#7f858d", "#1f2125", "#8a5a32"].map((c) => (
                    <span key={c} className="h-6 w-6 rounded-full border border-[var(--line)]" style={{ background: c }} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
