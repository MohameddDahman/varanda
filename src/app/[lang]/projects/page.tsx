import { notFound } from "next/navigation";
import { isLang } from "@/i18n/config";
import { sitePhotos } from "@/content/projects";
import { getSiteProjects } from "@/lib/site-projects";
import { pageMeta } from "@/lib/meta";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProjectsIndex } from "@/components/projects/ProjectsIndex";
import { DragStrip } from "@/components/projects/DragStrip";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { HomeCTA } from "@/components/home/HomeCTA";
import { ensureContent } from "@/lib/site-content";

const copy = {
  title: { en: "Projects", ar: "المشروعات" },
  intro: {
    en: "We're proud to be part of residential and administrative projects across Greater Cairo — uPVC work that combines quality, modern design and reliable performance.",
    ar: "نفخر بأن نكون جزءًا من مشروعات سكنية وإدارية متنوعة، مقدمين حلول uPVC تجمع بين الجودة والتصميم العصري والأداء الموثوق.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMeta(lang, "/projects", copy.title[lang], copy.intro[lang]);
}

export default async function ProjectsPage({ params }: PageProps<"/[lang]/projects">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  // Only what the index shows, so the client bundle doesn't carry every project's text.
  const items = (await getSiteProjects()).map(({ slug, title, type, year, systems, cover }) => ({ slug, title, type, year, systems, cover }));

  return (
    <>
      <PageHero
        eyebrow={lang === "ar" ? "أعمالنا" : "Our work"}
        title={copy.title[lang]}
        count={items.length}
        intro={copy.intro[lang]}
      />

      <section className="theme-light pb-[var(--section-y)]" data-header="light">
        <div className="wrap">
          <ProjectsIndex items={items} />
        </div>
      </section>

      <section className="theme-dark section overflow-hidden" data-header="dark" aria-labelledby="site-title">
        <div className="wrap grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-6">
            <Eyebrow>{lang === "ar" ? "من الموقع" : "From the site"}</Eyebrow>
            <SplitReveal as="h2" id="site-title" className="t-h1 mt-6 max-w-[14ch]">
              {lang === "ar" ? "قبل أن تكتمل التشطيبات." : "Before the finishing touches."}
            </SplitReveal>
          </div>
          <Reveal className="lg:col-span-5 lg:col-start-8 lg:pt-4">
            <p className="t-lead text-mist">
              {lang === "ar"
                ? "لقطات من مواقع التركيب: شبابيك بغلافها الواقي، وشاتر بمقاسات خاصة، وأبواب في انتظار التسليم."
                : "Shots from installation days: windows still in their protective film, made-to-measure shutters and doors waiting for handover."}
            </p>
          </Reveal>
        </div>
        <div className="mt-16">
          <DragStrip items={sitePhotos} label={lang === "ar" ? "صور من المواقع" : "Photos from the site"} />
        </div>
      </section>

      <HomeCTA lang={lang} />
    </>
  );
}
