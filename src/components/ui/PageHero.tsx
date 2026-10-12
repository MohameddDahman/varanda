import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Small figure set beside the title, e.g. the number of projects. */
  count?: number;
  theme?: "light" | "dark" | "white";
  size?: "hero" | "display";
  children?: React.ReactNode;
};

/** Opening block of an inner page: the title rises into place as the doors part. */
export function PageHero({ eyebrow, title, intro, count, theme = "light", size = "hero", children }: Props) {
  return (
    <section
      className={cn(
        theme === "dark" ? "theme-dark" : theme === "white" ? "theme-white" : "theme-light",
        "relative pt-[calc(var(--header-h)+clamp(4rem,12vh,9rem))] pb-[clamp(3rem,7vw,6rem)]",
      )}
      data-header={theme === "dark" ? "dark" : "light"}
    >
      <div className="wrap">
        <Reveal trigger="enter" delay={0.15}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <div className="mt-8 flex items-start gap-3 md:gap-5">
          <SplitReveal as="h1" trigger="enter" className={size === "hero" ? "t-hero" : "t-display"}>
            {title}
          </SplitReveal>
          {count !== undefined && (
            <Reveal trigger="enter" delay={0.6} className="t-label mt-2 text-[var(--fg-2)] md:mt-4">
              <span dir="ltr">({String(count).padStart(2, "0")})</span>
            </Reveal>
          )}
        </div>
        {intro && (
          <Reveal trigger="enter" delay={0.35} className="mt-10 max-w-[46ch] md:ms-[calc(100%/12*5)] md:mt-14">
            <p className="t-lead text-[var(--fg-2)]">{intro}</p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
