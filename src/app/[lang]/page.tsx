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

/**
 * This page is the route for any single-segment address, so without this a
 * request for /wp-login.php, /.env or /apple-touch-icon.png was treated as a
 * language and rendered by a server function, only to end as a 404. Only the
 * built languages exist; anything else gets the static 404.
 *
 * Set here, not on the [lang] layout: a layout passes it to every route below
 * it, and project pages must keep rendering projects added after a build.
 */
export const dynamicParams = false;

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
  const heroProject = homeHero.project && (await getSiteProject(homeHero.project)) ? homeHero.project : null;

  return (
    <>
      <HomeHero photo={photos[homeHero.photo]} project={heroProject} link={homeHero.link} caption={homeHero.caption} />
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
