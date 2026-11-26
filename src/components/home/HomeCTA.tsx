import type { Lang } from "@/i18n/config";
import { path } from "@/i18n/config";
import { ui } from "@/content/site";
import { VMark } from "@/components/brand/Logo";
import { Marquee } from "@/components/motion/Marquee";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Button } from "@/components/ui/Button";

export function HomeCTA({ lang }: { lang: Lang }) {
  return (
    <section className="theme-deep overflow-hidden pt-[var(--section-y)]" data-header="dark" aria-labelledby="cta-title">
      <Marquee className="cta-marquee">
        <span className="cta-marquee-item" lang="en">
          Made for life<span className="dot">.</span>
        </span>
        <VMark className="cta-marquee-mark" />
        <span className="cta-marquee-item cta-marquee-ar" lang="ar" dir="rtl">
          صُنعت لتدوم<span className="dot">.</span>
        </span>
        <VMark className="cta-marquee-mark" />
      </Marquee>

      <div className="wrap grid gap-y-10 pb-[var(--section-y)] pt-[clamp(4rem,9vw,8rem)] lg:grid-cols-12 lg:items-end lg:gap-x-8">
        <div className="lg:col-span-7">
          <SplitReveal as="h2" id="cta-title" className="t-h1 max-w-[16ch]">
            {lang === "ar" ? "كل مشروع يبدأ بزيارة للموقع." : "Every project starts with a site visit."}
          </SplitReveal>
          <p className="t-lead mt-6 max-w-[42ch] text-mist">
            {lang === "ar"
              ? "نأتي إليك، نفهم احتياجاتك، ونرفع المقاسات بدقة — ثم نرسل لك عرض سعر تفصيليًا."
              : "We come to you, understand what you need and take precise measurements — then send you a detailed quotation."}
          </p>
        </div>
        <div className="lg:col-span-5 lg:flex lg:justify-end">
          <Button href={path(lang, "/book-a-visit")} size="lg">
            {ui.bookVisit[lang]}
          </Button>
        </div>
      </div>
    </section>
  );
}
