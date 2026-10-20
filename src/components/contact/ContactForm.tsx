"use client";

import { useActionState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useLang } from "@/components/providers/LangProvider";
import { systems } from "@/content/systems";
import type { L } from "@/i18n/config";
import { submitInquiry, type FieldError, type InquiryState } from "@/app/[lang]/contact/actions";
import { site } from "@/content/site";
import { contactIsLive, whatsappHref } from "@/lib/contact";
import { Arrow, Button } from "@/components/ui/Button";

// Fallback channel while online requests are off — never a sample number.
/** The main WhatsApp line, read at render time (the dashboard can change it). */
const mainWhatsapp = () => (contactIsLive ? site.contact.whatsapp : null);

const projectTypes: { id: string; label: L }[] = [
  { id: "villa", label: { en: "Villa", ar: "فيلا" } },
  { id: "apartment", label: { en: "Apartment", ar: "شقة" } },
  { id: "building", label: { en: "Building", ar: "عمارة" } },
  { id: "commercial", label: { en: "Commercial", ar: "تجاري / إداري" } },
  { id: "other", label: { en: "Other", ar: "أخرى" } },
];

const contactOptions: { id: string; label: L }[] = [
  { id: "phone", label: { en: "Phone call", ar: "مكالمة" } },
  { id: "whatsapp", label: { en: "WhatsApp", ar: "واتساب" } },
  { id: "email", label: { en: "Email", ar: "بريد إلكتروني" } },
];

type FieldName = "name" | "phone" | "email" | "projectType";

const messages: Record<FieldName, Record<FieldError, L>> = {
  name: {
    required: { en: "Tell us your name.", ar: "اكتب اسمك من فضلك." },
    invalid: { en: "Check your name.", ar: "راجع الاسم." },
  },
  phone: {
    required: { en: "Add a phone number so we can arrange the visit.", ar: "أضف رقم هاتف لنرتّب موعد المعاينة." },
    invalid: {
      en: "Use digits only, with the country code if outside Egypt.",
      ar: "استخدم أرقامًا فقط، مع كود الدولة إن كنت خارج مصر.",
    },
  },
  email: {
    required: { en: "Add an email.", ar: "أضف بريدًا إلكترونيًا." },
    invalid: { en: "That email doesn't look complete — check it.", ar: "البريد الإلكتروني غير مكتمل — راجعه." },
  },
  projectType: {
    required: { en: "Choose the type of project.", ar: "اختر نوع المشروع." },
    invalid: { en: "Choose the type of project.", ar: "اختر نوع المشروع." },
  },
};

const initial: InquiryState = { status: "idle" };

export function ContactForm() {
  const { lang, t } = useLang();
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const form = useRef<HTMLFormElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const v = (key: string) => (state.values?.[key] as string | undefined) ?? "";
  const vs = (key: string) => (state.values?.[key] as string[] | undefined) ?? [];
  const err = (name: FieldName) => state.errors?.[name];
  const optional = <span className="field-optional">{lang === "ar" ? "(اختياري)" : "(optional)"}</span>;

  // The filled-in request as a WhatsApp message.
  const summary = () => {
    const ar = lang === "ar";
    const type = projectTypes.find((p) => p.id === v("projectType"));
    const needs = systems.filter((s) => vs("systems").includes(s.slug)).map((s) => t(s.name));
    return [
      ar ? "مرحبًا VARANDA، أود حجز معاينة." : "Hello VARANDA, I'd like to book a site visit.",
      `${ar ? "الاسم" : "Name"}: ${v("name")}`,
      `${ar ? "الهاتف" : "Phone"}: ${v("phone")}`,
      v("area") && `${ar ? "المنطقة" : "Area"}: ${v("area")}`,
      type && `${ar ? "نوع المشروع" : "Project"}: ${t(type.label)}`,
      needs.length > 0 && `${ar ? "المطلوب" : "Needs"}: ${needs.join(ar ? "، " : ", ")}`,
      v("message"),
    ]
      .filter(Boolean)
      .join("\n");
  };

  useEffect(() => {
    if (state.status === "invalid" && form.current) {
      form.current.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    }
    if (state.status === "success" && done.current) {
      gsap.from(done.current.children, { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "soft" });
      done.current.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={done} tabIndex={-1} className="contact-done" role="status">
        <p className="t-label text-red">{lang === "ar" ? "تم الإرسال" : "Request sent"}</p>
        <p className="t-h1 mt-6 max-w-[16ch]">
          {lang === "ar" ? "شكرًا لك. سنتواصل معك لترتيب المعاينة." : "Thank you. We'll be in touch to arrange your site visit."}
        </p>
        <p className="t-lead mt-6 max-w-[40ch] text-ink-2">
          {lang === "ar"
            ? "سيتصل بك أحد أفراد فريقنا لتحديد موعد مناسب لرفع المقاسات."
            : "Someone from our team will contact you to book a convenient time for measurements."}
        </p>
      </div>
    );
  }

  const invalid = (name: FieldName) => ({
    "aria-invalid": err(name) ? true : undefined,
    "aria-describedby": err(name) ? `${name}-error` : undefined,
  });

  const errorFor = (name: FieldName) => {
    const e = err(name);
    return e ? (
      <p id={`${name}-error`} className="field-error" role="alert">
        {t(messages[name][e])}
      </p>
    ) : null;
  };

  return (
    <form ref={form} action={action} noValidate className="contact-form">
      <input type="hidden" name="locale" value={lang} />
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-x-6 gap-y-8 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            {lang === "ar" ? "الاسم" : "Name"} <span className="text-red">*</span>
          </label>
          <input id="name" name="name" autoComplete="name" defaultValue={v("name")} className="field" required {...invalid("name")} />
          {errorFor("name")}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            {lang === "ar" ? "رقم الهاتف" : "Phone"} <span className="text-red">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            defaultValue={v("phone")}
            className="field rtl:text-right"
            required
            {...invalid("phone")}
          />
          {errorFor("phone")}
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            {lang === "ar" ? "البريد الإلكتروني" : "Email"} {optional}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            defaultValue={v("email")}
            className="field rtl:text-right"
            {...invalid("email")}
          />
          {errorFor("email")}
        </div>
        <div>
          <label htmlFor="area" className="field-label">
            {lang === "ar" ? "المنطقة" : "Area"} {optional}
          </label>
          <input
            id="area"
            name="area"
            autoComplete="address-level2"
            placeholder={lang === "ar" ? "مثال: التجمع الخامس" : "e.g. New Cairo"}
            defaultValue={v("area")}
            className="field"
          />
        </div>
      </div>

      <fieldset className="mt-10" aria-describedby={err("projectType") ? "projectType-error" : undefined}>
        <legend className="field-label">
          {lang === "ar" ? "نوع المشروع" : "Type of project"} <span className="text-red">*</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {projectTypes.map((p, i) => (
            <label key={p.id} className="choice">
              <input
                type="radio"
                name="projectType"
                value={p.id}
                defaultChecked={v("projectType") === p.id}
                aria-invalid={i === 0 && err("projectType") ? true : undefined}
              />
              <span>{t(p.label)}</span>
            </label>
          ))}
        </div>
        {errorFor("projectType")}
      </fieldset>

      <fieldset className="mt-10">
        <legend className="field-label">
          {lang === "ar" ? "ما الذي تحتاجه؟" : "What do you need?"}{" "}
          <span className="field-optional">{lang === "ar" ? "(اختر ما يناسبك)" : "(choose any)"}</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {systems.map((s) => (
            <label key={s.slug} className="choice">
              <input type="checkbox" name="systems" value={s.slug} defaultChecked={vs("systems").includes(s.slug)} />
              <span>{t(s.name)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-10">
        <label htmlFor="message" className="field-label">
          {lang === "ar" ? "تفاصيل المشروع" : "About the project"} {optional}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          defaultValue={v("message")}
          placeholder={lang === "ar" ? "عدد الفتحات، المقاسات التقريبية، الموعد المناسب…" : "Number of openings, rough sizes, timing…"}
          className="field resize-y"
        />
      </div>

      <fieldset className="mt-10">
        <legend className="field-label">{lang === "ar" ? "كيف نتواصل معك؟" : "How should we reach you?"}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {contactOptions.map((c) => (
            <label key={c.id} className="choice">
              <input type="radio" name="contactBy" value={c.id} defaultChecked={(v("contactBy") || "phone") === c.id} />
              <span>{t(c.label)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.status === "unavailable" && mainWhatsapp() ? (
        // Until the inquiry store is connected, hand the same details over to WhatsApp.
        <div className="form-notice mt-10" role="alert">
          <p>
            {lang === "ar"
              ? "الطلبات الإلكترونية لم تُفعَّل بعد. أرسل التفاصيل نفسها عبر واتساب."
              : "Online requests aren't switched on yet. Send the same details on WhatsApp instead."}
          </p>
          <a
            href={whatsappHref(mainWhatsapp()!, summary())}
            target="_blank"
            rel="noopener noreferrer"
            className="t-label mt-4 inline-flex items-center gap-3 underline-offset-4 hover:underline"
          >
            {lang === "ar" ? "أرسل عبر واتساب" : "Send on WhatsApp"}
            <Arrow />
          </a>
        </div>
      ) : (state.status === "unavailable" || state.status === "failed") && (
        <p className="form-notice mt-10" role="alert">
          {state.status === "unavailable"
            ? lang === "ar"
              ? "الطلبات الإلكترونية لم تُفعَّل بعد — سيعمل هذا النموذج فور إطلاق الموقع."
              : "Online requests aren't switched on yet — this form will start working when the site goes live."
            : lang === "ar"
              ? "تعذّر إرسال الطلب. تحقق من اتصالك ثم أرسله مرة أخرى."
              : "Your request couldn't be sent. Check your connection and send it again."}
        </p>
      )}

      <div className="mt-12 flex flex-wrap items-center gap-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (lang === "ar" ? "جارٍ الإرسال…" : "Sending…") : lang === "ar" ? "اطلب المعاينة" : "Request a site visit"}
        </Button>
        <p className="t-small text-ink-2">{lang === "ar" ? "الحقول المعلّمة بـ * مطلوبة." : "Fields marked * are required."}</p>
      </div>
    </form>
  );
}
