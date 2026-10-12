import { notFound } from "next/navigation";
import { isLang } from "@/i18n/config";
import { process } from "@/content/company";
import { site } from "@/content/site";
import { contactIsLive } from "@/lib/contact";
import { pageMeta } from "@/lib/meta";
import { PageHero } from "@/components/ui/PageHero";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactLines, SampleTag } from "@/components/contact/ContactLines";
import { ServiceMap } from "@/components/contact/ServiceMap";

const copy = {
  title: { en: "Book a site visit", ar: "احجز معاينة" },
  intro: {
    en: "Tell us about your project. We'll visit, take precise measurements and prepare a detailed quotation.",
    ar: "أخبرنا عن مشروعك. نزورك، ونرفع المقاسات بدقة، ونجهّز لك عرض سعر تفصيليًا.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMeta(lang, "/contact", copy.title[lang], copy.intro[lang]);
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = (s: { en: string; ar: string }) => s[lang];
  const { contact } = site;
  const next = process.steps.slice(0, 3);

  return (
    <>
      <PageHero eyebrow={lang === "ar" ? "تواصل معنا" : "Contact"} title={copy.title[lang]} intro={copy.intro[lang]} size="display" />

      {/* Direct lines — pulled up so the channels show on the first screen. */}
      <section className="theme-white section pt-[clamp(3.5rem,6vw,6rem)]" data-header="light" aria-labelledby="lines-title">
        <div className="wrap">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow as="h2" id="lines-title">
              {lang === "ar" ? "تواصل مباشر" : "Direct lines"}
            </Eyebrow>
            {contact.sample && <SampleTag lang={lang} />}
          </div>
          <Reveal>
            <ContactLines lang={lang} className="mt-8" />
          </Reveal>
        </div>
      </section>

      {/* Request form */}
      <section className="theme-white section" data-header="light" aria-label={copy.title[lang]}>
        <div className="wrap grid gap-y-16 lg:grid-cols-12 lg:gap-x-8">
          <aside className="lg:col-span-4" aria-labelledby="next-title">
            <Eyebrow as="h2" id="next-title">
              {lang === "ar" ? "ماذا يحدث بعد ذلك" : "What happens next"}
            </Eyebrow>
            <Reveal as="ol" items="li" className="mt-8 border-t border-[var(--line)]">
              {next.map((s, i) => (
                <li key={s.title.en} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-[var(--line)] py-6">
                  <span className="t-label pt-1 text-red" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="t-h3">{t(s.title)}</h3>
                    <p className="t-small mt-2 text-ink-2">{t(s.text)}</p>
                  </div>
                </li>
              ))}
            </Reveal>
          </aside>

          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Where we work */}
      <section className="theme-dark section" data-header="dark" aria-labelledby="areas-title">
        <ServiceMap
          intro={
            <>
              <Eyebrow>{lang === "ar" ? "مناطق العمل" : "Where we work"}</Eyebrow>
              <SplitReveal as="h2" id="areas-title" className="t-h1 mt-6 max-w-[14ch]">
                {lang === "ar" ? "من التجمع الخامس إلى أكتوبر" : "From New Cairo to October"}
                <span className="dot">.</span>
              </SplitReveal>
              <p className="t-body mt-6 max-w-[38ch] text-mist">
                {lang === "ar"
                  ? "مشروعاتنا الأخيرة في التجمع الخامس والشيخ زايد و6 أكتوبر. مشروعك في منطقة أخرى بالقاهرة الكبرى؟ اسألنا."
                  : "Our recent projects are in New Cairo, Sheikh Zayed and 6th of October. Somewhere else in Greater Cairo? Ask us."}
              </p>
            </>
          }
          details={
            (contact.address || contact.hours) && (
              <div className="mt-12">
                <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                  {contact.address && (
                    <div>
                      <dt className="t-label flex items-center gap-2 text-mist">
                        <Icon name="pin" className="h-4 w-4" />
                        {lang === "ar" ? "العنوان" : "Address"}
                      </dt>
                      <dd className="t-body mt-2">{t(contact.address)}</dd>
                    </div>
                  )}
                  {contact.hours && (
                    <div>
                      <dt className="t-label flex items-center gap-2 text-mist">
                        <Icon name="clock" className="h-4 w-4" />
                        {lang === "ar" ? "مواعيد العمل" : "Opening hours"}
                      </dt>
                      <dd className="t-body mt-2">{t(contact.hours)}</dd>
                    </div>
                  )}
                </dl>
                {contact.sample && <SampleTag lang={lang} className="mt-8" />}
                {contactIsLive && contact.mapsUrl && (
                  <div className="mt-8">
                    <Button href={contact.mapsUrl} external variant="light">
                      {lang === "ar" ? "الاتجاهات على الخريطة" : "Get directions"}
                    </Button>
                  </div>
                )}
              </div>
            )
          }
        />
      </section>
    </>
  );
}
