import { lang as rootLang } from "next/root-params";
import { isLang, path } from "@/i18n/config";
import { OpeningDrawing } from "@/components/systems/OpeningDrawing";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ensureContent } from "@/lib/site-content";

export default async function NotFound() {
  await ensureContent();
  const value = await rootLang();
  const lang = isLang(value) ? value : "en";
  return (
    <section className="theme-light flex min-h-[100svh] items-center pt-[var(--header-h)]" data-header="light">
      <div className="wrap grid items-center gap-12 py-20 md:grid-cols-12 md:gap-x-8">
        <div className="md:col-span-7">
          <Eyebrow>404</Eyebrow>
          <h1 className="t-display mt-6 max-w-[12ch]">
            {lang === "ar" ? "هذه الفتحة غير موجودة" : "There's no opening here"}
            <span className="dot">.</span>
          </h1>
          <p className="t-lead mt-6 max-w-[38ch] text-ink-2">
            {lang === "ar"
              ? "لم نجد هذه الصفحة — ربما نُقلت. ابدأ من الصفحة الرئيسية أو تصفّح مشروعاتنا."
              : "We couldn't find that page — it may have moved. Start from the home page or browse our projects."}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href={path(lang, "/")}>{lang === "ar" ? "الصفحة الرئيسية" : "Back to home"}</Button>
            <Button href={path(lang, "/projects")} variant="outline">
              {lang === "ar" ? "المشروعات" : "See projects"}
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[20rem] md:col-span-4 md:col-start-9">
          <OpeningDrawing kind="fixed" mode="loop" />
        </div>
      </div>
    </section>
  );
}
