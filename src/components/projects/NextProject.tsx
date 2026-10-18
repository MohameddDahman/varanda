"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { screenSizes } from "@/lib/sizes";
import { projectTypes, type SiteProject } from "@/content/projects";
import { ui } from "@/content/site";
import { TLink } from "@/components/transition/TLink";
import { Arrow } from "@/components/ui/Button";

/** The next project waits behind a closing frame that opens as you arrive. */
export function NextProject({ project }: { project: SiteProject }) {
  const { t, href } = useLang();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-next-frame]",
          { clipPath: "inset(14% 18% 14% 18%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: true },
          },
        );
        gsap.fromTo(
          "[data-next-img]",
          { scale: 1.3 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="theme-deep" data-header="dark" aria-label={t(ui.nextProject)}>
      <TLink href={href(`/projects/${project.slug}`)} label={project.title} className="group relative block h-[100svh] min-h-[32rem]" data-cursor={t(ui.next)}>
        <div data-next-frame className="absolute inset-0 overflow-hidden">
          <div data-next-img className="absolute inset-0">
            <Image src={project.cover.src} alt="" fill sizes={screenSizes(project.cover.src, 100, 1.15)} placeholder="blur" className="object-cover" style={{ objectPosition: project.cover.focus }} />
          </div>
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(4_12_23/0.55),rgb(4_12_23/0.25)_40%,rgb(4_12_23/0.8))]" />
        </div>
        <div className="wrap relative flex h-full flex-col justify-end pb-[clamp(2rem,6vh,4rem)]">
          <p className="t-label text-white/75">
            {t(ui.nextProject)} · {t(projectTypes[project.type])} · {project.year}
          </p>
          <p className="t-display mt-4 flex items-end gap-6 text-white">
            <span>{t(project.title)}</span>
            <span className="mb-3 hidden transition-transform duration-500 group-hover:translate-x-2 md:block rtl:group-hover:-translate-x-2">
              <Arrow className="h-5 w-10" />
            </span>
          </p>
        </div>
      </TLink>
    </section>
  );
}
