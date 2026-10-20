import { notFound } from "next/navigation";
import { isLang } from "@/i18n/config";
import { photos } from "@/content/photos";
import { homeHero, projectTypes } from "@/content/projects";
import { getFeaturedProjects, getSiteProject } from "@/lib/site-projects";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HomeCounters } from "@/components/home/HomeCounters";
import { HomeOpenings } from "@/components/home/HomeOpenings";
import { HomeProjects, type FeaturedProject } from "@/components/home/HomeProjects";
import { HomeProcess } from "@/components/home/HomeProcess";
import { HomeWarranty } from "@/components/home/HomeWarranty";
import { HomeCTA } from "@/components/home/HomeCTA";
import { ensureContent } from "@/lib/site-content";

export default async function Home({ params }: PageProps<"/[lang]">) {
  await ensureContent();
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  // Hand the client components only the photos they show, not the whole library.
  const featured: FeaturedProject[] = (await getFeaturedProjects()).map((p) => ({
    slug: p.slug,
    title: p.title,
    typeLabel: projectTypes[p.type],
    year: p.year,
    summary: p.summary,
    photo: p.cover,
  }));
  // The hero links to its project while that project is on the site.
  const heroProject = (await getSiteProject(homeHero.project)) ? homeHero.project : null;

  return (
    <>
      <HomeHero photo={photos[homeHero.photo]} project={heroProject} caption={homeHero.caption} />
      <HomeIntro lang={lang} />
      <HomeCounters lang={lang} />
      <HomeOpenings />
      <HomeProjects items={featured} />
      <HomeProcess />
      <HomeWarranty lang={lang} />
      <HomeCTA lang={lang} />
    </>
  );
}
