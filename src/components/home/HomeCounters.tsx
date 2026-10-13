import type { Lang } from "@/i18n/config";
import { counters } from "@/content/company";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";

/** VARANDA in numbers: each figure counts up as it comes into view. */
export function HomeCounters({ lang }: { lang: Lang }) {
  const shown = counters.filter((c) => c.value);
  return (
    <section className="theme-deep counters" data-header="dark" aria-label={lang === "ar" ? "VARANDA بالأرقام" : "VARANDA in numbers"}>
      <Reveal as="ul" items="li" className="wrap counters-grid">
        {shown.map((c) => (
          <li key={c.label.en} className="counter">
            <span className="counter-value t-num" dir="ltr">
              <CountUp to={c.value!} />
            </span>
            <span className="counter-label t-label">{c.label[lang]}</span>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
