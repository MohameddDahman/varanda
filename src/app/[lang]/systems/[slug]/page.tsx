import { notFound } from "next/navigation";
import { isLang, path, type L, type Lang } from "@/i18n/config";
import { getSystem, systems, type SystemCategory } from "@/content/systems";
import { projectTypes } from "@/content/projects";
import { getSiteProjects } from "@/lib/site-projects";
import { photos } from "@/content/photos";
import { ui } from "@/content/site";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/cn";
import { coverSizes, DRIFT } from "@/lib/sizes";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TLink } from "@/components/transition/TLink";
import { ShutterImage } from "@/components/motion/ShutterImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { OpeningShowcase } from "@/components/systems/OpeningShowcase";
import { GlassSwitcher } from "@/components/systems/GlassSwitcher";
import { ScreenDiagram, ShutterDemo } from "@/components/systems/ShutterDemo";
import { SlatSection } from "@/components/systems/SlatSection";
import { ProductPhoto } from "@/components/systems/ProductPhoto";
import { LockMechanism } from "@/components/why/LockMechanism";
import { HomeCTA } from "@/components/home/HomeCTA";
import { Arrow, Button } from "@/components/ui/Button";
import { ensureContent } from "@/lib/site-content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return systems.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/systems/[slug]">) {
  await ensureContent();
  const { lang, slug } = await params;
  const system = getSystem(slug);
  if (!isLang(lang) || !system) return {};
  return pageMeta(lang, `/systems/${slug}`, system.name[lang], system.intro[lang], photos[system.cover]);
}

const T = (lang: Lang) => (s: { en: string; ar: string }) => s[lang];

export default async function SystemPage({ params }: PageProps<"/[lang]/systems/[slug]">) {
  await ensureContent();
  const { lang, slug } = await params;
  const system = getSystem(slug);
  if (!isLang(lang) || !system) notFound();
  const t = T(lang);
  const related = (await getSiteProjects()).filter((p) => p.systems.includes(system.slug));
  const RELATED_MAX = 6;
  const others = systems.filter((s) => s.slug !== system.slug);
  const lists = [
    system.features && { eyebrow: { en: "Benefits", ar: "المميزات" }, ...system.features },
    system.details && { eyebrow: { en: "Details", ar: "التفاصيل" }, ...system.details },
  ].filter((list) => !!list);

  return (
    <>
      {/* Hero */}
      <section className="theme-dark relative pt-[calc(var(--header-h)+clamp(3rem,9vh,7rem))] pb-[var(--section-y)]" data-header="dark">
        {/* Words only: the client preferred no photo here; the drawings below show each system. */}
        <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-9">
            <Reveal trigger="enter" delay={0.15}>
              <TLink href={path(lang, "/systems")} className="t-label inline-flex items-center gap-2 text-mist hover:text-white">
                <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
                  ←
                </span>
                {t(ui.allSystems)}
              </TLink>
            </Reveal>
            <SplitReveal as="h1" trigger="enter" className="t-display mt-10">
              {t(system.name)}
            </SplitReveal>
            {system.tagline && (
              <Reveal trigger="enter" delay={0.35} className="t-h3 mt-6 text-white">
                {t(system.tagline)}
              </Reveal>
            )}
            <Reveal trigger="enter" delay={0.45} className="mt-8 max-w-[44ch]">
              <p className="t-lead text-mist">{t(system.intro)}</p>
            </Reveal>
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
              {related.slice(0, RELATED_MAX).map((p) => (
                <li key={p.slug}>
                  <TLink href={path(lang, `/projects/${p.slug}`)} label={p.title} className="group block" data-cursor={t(ui.view)}>
                    <ShutterImage photo={p.cover} sizes={coverSizes(p.cover.src, "(min-width: 768px) 30vw, 100vw", 4 / 3, DRIFT)} className="aspect-[4/3] w-full" />
                    <h3 className="t-h3 mt-5">{t(p.title)}</h3>
                    <p className="t-label mt-2 text-ink-2">
                      {t(projectTypes[p.type])} · {p.year}
                    </p>
                  </TLink>
                </li>
              ))}
            </ul>
            {related.length > RELATED_MAX && (
              <div className="mt-14">
                <Button href={path(lang, "/projects")} variant="outline">
                  {t(ui.allProjects)}
                </Button>
              </div>
            )}
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
          <RangeTitle>{t(system.name)}</RangeTitle>
          <OpeningShowcase />
        </div>
        {system.profiles && (
          <div className="wrap mt-[var(--section-y)]">
            <Eyebrow>{lang === "ar" ? "القطاعات" : "Profiles"}</Eyebrow>
            <SplitReveal as="h2" className="t-h1 mt-6 max-w-[16ch]">
              {t(system.profiles.title)}
            </SplitReveal>
            <Reveal as="ul" items="li" className="mt-14 grid gap-10 md:grid-cols-2 md:gap-8">
              {system.profiles.items.map((p) => (
                <li key={p.image}>
                  <ProductPhoto photo={photos[p.image]} lang={lang} fit="cover" className="aspect-[4/3] bg-navy-950" />
                  <h3 className="t-h2 mt-8">{t(p.name)}</h3>
                  <p className="t-body mt-3 max-w-[40ch] text-ink-2">{t(p.text)}</p>
                </li>
              ))}
            </Reveal>
          </div>
        )}
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
              {lang === "ar" ? "شريحة لكل احتياج." : "A slat for every need."}
            </SplitReveal>
            <Reveal as="ul" items="li" className="mt-14 grid gap-px border-t border-[var(--line)] md:grid-cols-3">
              {system.items.map((s) => (
                <li key={s.id} className="border-b border-[var(--line)] py-10 md:pe-10">
                  {s.image ? (
                    <ProductPhoto photo={photos[s.image]} lang={lang} className="aspect-[6/5] bg-white" />
                  ) : (
                    s.slatHeight && <SlatSection height={s.slatHeight} />
                  )}
                  <h3 className="t-h2 mt-8">{t(s.name)}</h3>
                  <p className="t-body mt-3 max-w-[32ch] text-ink-2">{t(s.text)}</p>
                  {s.points && (
                    <ul className="mt-5">
                      {s.points.map((pt) => (
                        <li key={pt.en} className="t-small border-t border-[var(--line)] py-2.5 text-ink-2">
                          {t(pt)}
                        </li>
                      ))}
                    </ul>
                  )}
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
          <RangeTitle>{t(system.name)}</RangeTitle>
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

  // hardware: every part with its own photo
  const handleColours = ["#f4f4f1", "#e2d3b6", "#7f858d", "#1f2125", "#8a5a32", "#c9a450", "#c4c9ce"];
  return (
    <section className="theme-white section" data-header="light" aria-labelledby="range-title">
      <div className="wrap">
        <RangeTitle>{t(system.name)}</RangeTitle>
        <Reveal as="ul" items="li" className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {system.items.map((h) => (
            <li key={h.id}>
              {h.image && <ProductPhoto photo={photos[h.image]} lang={lang} className="aspect-[16/10] bg-paper" />}
              <h3 className="t-h3 mt-6">{t(h.name)}</h3>
              <p className="t-body mt-3 text-ink-2">{t(h.text)}</p>
              {h.id === "handles" && (
                <div className="mt-5 flex gap-2" aria-hidden="true">
                  {handleColours.map((c) => (
                    <span key={c} className="h-6 w-6 rounded-full border border-[var(--line)]" style={{ background: c }} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </Reveal>

        {/* How the espagnolette locks the sash */}
        <div className="mt-24 grid gap-y-10 border-t border-[var(--line)] pt-16 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-4">
            <Eyebrow>{lang === "ar" ? "كيف يعمل الغلق" : "How the lock works"}</Eyebrow>
            <h3 className="t-h1 mt-6 max-w-[12ch]">{lang === "ar" ? "حركة واحدة، من 2 إلى 5 نقاط غلق" : "One turn, two to five locking points"}<span className="dot">.</span></h3>
            <p className="t-body mt-6 max-w-[38ch] text-ink-2">
              {lang === "ar"
                ? "اختر وضع المقبض وشاهد كيف تتحرك ذراع السبليونة لتُدخل نقاط الغلق في السكاكات."
                : "Pick a handle position and watch the espagnolette rod drive the locking points into their strikers."}
            </p>
          </div>
          <LockMechanism className="lg:col-span-8" />
        </div>
      </div>
    </section>
  );
}
