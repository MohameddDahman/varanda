import { notFound } from "next/navigation";
import { isLang } from "@/i18n/config";
import { photos } from "@/content/photos";
import { featuredProjects, getProject, projectTypes } from "@/content/projects";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HomeOpenings } from "@/components/home/HomeOpenings";
import { HomeProjects, type FeaturedProject } from "@/components/home/HomeProjects";
import { HomeProcess } from "@/components/home/HomeProcess";
import { HomeWarranty } from "@/components/home/HomeWarranty";
import { HomeCTA } from "@/components/home/HomeCTA";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  // Hand the client components only the photos they show, not the whole library.
  const featured: FeaturedProject[] = featuredProjects.flatMap((slug) => {
    const p = getProject(slug);
    return p ? [{ slug: p.slug, title: p.title, typeLabel: projectTypes[p.type], year: p.year, summary: p.summary, photo: photos[p.cover] }] : [];
  });

  return (
    <>
      <HomeHero photo={photos.heroRiverSliding} />
      <HomeIntro lang={lang} />
      <HomeOpenings />
      <HomeProjects items={featured} />
      <HomeProcess />
      <HomeWarranty lang={lang} />
      <HomeCTA lang={lang} />
    </>
  );
}
