import { notFound } from "next/navigation";
import { isLang, path } from "@/i18n/config";
import { projectTypes } from "@/content/projects";
import { getSystem } from "@/content/systems";
import { ui } from "@/content/site";
import { pageMeta } from "@/lib/meta";
import { TLink } from "@/components/transition/TLink";
import { ShutterImage } from "@/components/motion/ShutterImage";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Gallery } from "@/components/projects/Gallery";
import { NextProject } from "@/components/projects/NextProject";
import { DRIFT, screenSizes } from "@/lib/sizes";
import { getSiteProject, getSiteProjects } from "@/lib/site-projects";

// Projects added in the admin after a build are rendered on their first visit, then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getSiteProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  const project = await getSiteProject(slug);
  if (!isLang(lang) || !project) return {};
  return pageMeta(lang, `/projects/${slug}`, project.title[lang], project.summary[lang]);
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  const all = await getSiteProjects();
  const project = all.find((p) => p.slug === slug);
  if (!isLang(lang) || !project) notFound();
  const t = (s: { en: string; ar: string }) => s[lang];
  const next = all[(all.indexOf(project) + 1) % all.length];
  const photoCount = project.gallery.length + 1;

  return (
    <>
      <section className="theme-deep relative h-[100svh] min-h-[36rem]" data-header="dark">
        <ShutterImage
          photo={project.cover}
          sizes={screenSizes(project.cover.src, 100, DRIFT)}
          trigger="enter"
          preload
          slats={10}
          className="absolute inset-0"
        />
        <span
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(4_12_23/0.55),transparent_35%,transparent_50%,rgb(4_12_23/0.85))]"
          aria-hidden="true"
        />
        <div className="wrap relative flex h-full flex-col justify-end pb-[clamp(2.5rem,7vh,5rem)]">
          <Reveal trigger="enter" delay={0.4}>
            <TLink href={path(lang, "/projects")} className="t-label inline-flex items-center gap-2 text-white/80 hover:text-white">
              <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
                ←
              </span>
              {t(ui.allProjects)}
            </TLink>
          </Reveal>
          <SplitReveal as="h1" trigger="enter" delay={0.2} className="t-display mt-6 max-w-[16ch] text-white">
            {t(project.title)}
          </SplitReveal>
          <Reveal trigger="enter" delay={0.55} className="t-label mt-6 text-white/80">
            {t(projectTypes[project.type])} · {project.year}
          </Reveal>
        </div>
      </section>

      <section className="theme-light section" data-header="light">
        <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-7">
            <Eyebrow>{lang === "ar" ? "عن المشروع" : "About the project"}</Eyebrow>
            <SplitReveal as="p" className="t-h2 mt-8 max-w-[26ch]">
              {t(project.summary)}
            </SplitReveal>
            <Reveal items="p" className="mt-10 max-w-[56ch] space-y-6">
              {project.body.map((para, i) => (
                <p key={i} className="t-lead text-ink-2">
                  {t(para)}
                </p>
              ))}
            </Reveal>
          </div>

          <Reveal as="dl" items="div" className="project-facts lg:col-span-4 lg:col-start-9">
            <div>
              <dt>{t(ui.type)}</dt>
              <dd>{t(projectTypes[project.type])}</dd>
            </div>
            <div>
              <dt>{t(ui.year)}</dt>
              <dd>{project.year}</dd>
            </div>
            {project.location && (
              <div>
                <dt>{t(ui.location)}</dt>
                <dd>{t(project.location)}</dd>
              </div>
            )}
            {project.systems.length > 0 && (
              <div>
                <dt>{t(ui.systems)}</dt>
                <dd className="flex flex-col gap-1">
                  {project.systems.map((s) => {
                    const sys = getSystem(s);
                    return sys ? (
                      <TLink key={s} href={path(lang, `/systems/${s}`)} className="underline decoration-[var(--line)] underline-offset-4 hover:decoration-current">
                        {t(sys.name)}
                      </TLink>
                    ) : null;
                  })}
                </dd>
              </div>
            )}
            <div>
              <dt>{t(ui.photos)}</dt>
              <dd>{photoCount}</dd>
            </div>
          </Reveal>
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section className="theme-light pb-[var(--section-y)]" data-header="light" aria-label={t(ui.photos)}>
          <div className="wrap">
            <Gallery items={[project.cover, ...project.gallery]} />
          </div>
        </section>
      )}

      {next !== project && <NextProject project={next} />}
    </>
  );
}
