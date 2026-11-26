"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { systems } from "@/content/systems";
import type { L } from "@/i18n/config";
import { submitInquiry, type InquiryState } from "@/app/[lang]/book-a-visit/actions";
import { isBot, readInquiry, type FieldError, type InquiryField, type InquiryValues } from "@/lib/inquiry";
import { site } from "@/content/site";
import { contactIsLive, whatsappHref } from "@/lib/contact";
import { Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/ui/SocialIcon";

/** The main WhatsApp line, where requests go; read at render time (the dashboard can change it). */
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

const messages: Record<InquiryField, Record<FieldError, L>> = {
  name: {
    required: { en: "Tell us your name.", ar: "اكتب اسمك من فضلك." },
    invalid: { en: "Check your name.", ar: "راجع الاسم." },
  },
  phone: {
    required: { en: "Add a phone number so we can arrange the visit.", ar: "أضف رقم هاتف لنرتّب موعد المعاينة." },
    invalid: {
      en: "Use digits only, with the country code if outside Egypt.",
      ar: "استخدم أرقامًا فقط، مع رمز الدولة إن كنت خارج مصر.",
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

/** The server's answer, or (with a WhatsApp line) the request handed over to WhatsApp. */
type FormState = InquiryState | { status: "whatsapp"; values: InquiryValues; href: string; opened: boolean };

const initial: InquiryState = { status: "idle" };

export function ContactForm() {
  const { lang, t } = useLang();
  const ar = lang === "ar";
  const whatsapp = mainWhatsapp();
  const [serverState, action, pending] = useActionState(submitInquiry, initial);
  const [ownState, setOwnState] = useState<FormState>(initial);
  // With a WhatsApp line the browser sends the request there; without one the server keeps it.
  const state: FormState = whatsapp ? ownState : serverState;
  const form = useRef<HTMLFormElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const v = (key: Exclude<keyof InquiryValues, "systems">) => state.values?.[key] ?? "";
  const vs = () => state.values?.systems ?? [];
  const err = (name: InquiryField) => (state.status === "whatsapp" ? undefined : state.errors?.[name]);
  const optional = <span className="field-optional">{ar ? "(اختياري)" : "(optional)"}</span>;

  // The filled-in request as a WhatsApp message, in the visitor's language.
  const summary = (values: InquiryValues) => {
    const type = projectTypes.find((p) => p.id === values.projectType);
    const needs = systems.filter((s) => values.systems.includes(s.slug)).map((s) => t(s.name));
    const by = contactOptions.find((c) => c.id === values.contactBy);
    const lines: (string | null)[] = [
      ar ? "مرحبًا VARANDA، أود حجز معاينة." : "Hello VARANDA, I'd like to book a site visit.",
      "",
      `${ar ? "الاسم" : "Name"}: ${values.name}`,
      // A left-to-right mark keeps the + in front of the number inside Arabic text.
      `${ar ? "الهاتف" : "Phone"}: ${ar ? "\u200E" : ""}${values.phone}`,
      values.email ? `${ar ? "البريد الإلكتروني" : "Email"}: ${values.email}` : null,
      values.area ? `${ar ? "المنطقة" : "Area"}: ${values.area}` : null,
      type ? `${ar ? "نوع المشروع" : "Project"}: ${t(type.label)}` : null,
      needs.length > 0 ? `${ar ? "المطلوب" : "Needs"}: ${needs.join(ar ? "، " : ", ")}` : null,
      by ? `${ar ? "التواصل المفضل" : "Reach me by"}: ${t(by.label)}` : null,
      values.message ? `\n${values.message}` : null,
    ];
    return lines.filter((line) => line !== null).join("\n");
  };

  // With a WhatsApp line: check the fields here, then open WhatsApp with the request written out.
  // It runs straight from the click, so the browser lets the new tab (or the app) open.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!whatsapp) return; // the server action takes it
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (isBot(data)) return setOwnState({ status: "success" });
    const { values, errors } = readInquiry(data);
    if (Object.keys(errors).length) return setOwnState({ status: "invalid", errors, values });
    const href = whatsappHref(whatsapp, summary(values));
    if (!href) return;
    const tab = window.open(href, "_blank");
    if (tab) tab.opener = null;
    setOwnState({ status: "whatsapp", values, href, opened: Boolean(tab) });
    // A copy on the dashboard too, in case the visitor never presses Send; nobody waits for it.
    submitInquiry(initial, data).catch(() => {});
  };

  useEffect(() => {
    if (state.status === "invalid" && form.current) {
      form.current.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    }
    // The message rises in by CSS (.contact-done in globals.css): it settles even while the tab
    // sits behind WhatsApp, and with reduced motion it simply shows.
    if ((state.status === "success" || state.status === "whatsapp") && done.current) {
      done.current.focus();
    }
  }, [state]);

  if (state.status === "whatsapp") {
    return (
      <div ref={done} tabIndex={-1} className="contact-done" role="status">
        <p className="t-label text-red">{ar ? "خطوة أخيرة" : "One last step"}</p>
        <p className="t-h1 mt-6 max-w-[16ch]">{ar ? "اضغط «إرسال» في واتساب ليصلنا طلبك." : "Press Send in WhatsApp to get your request to us."}</p>
        <p className="t-lead mt-6 max-w-[40ch] text-ink-2">
          {state.opened
            ? ar
              ? "فتحنا واتساب وفيه تفاصيل طلبك جاهزة. بعد الإرسال يتواصل معك فريقنا لتحديد موعد المعاينة."
              : "WhatsApp is open with your request written out. Once you send it, our team will contact you to arrange the visit."
            : ar
              ? "تفاصيل طلبك جاهزة. افتح واتساب لإرسالها، ثم يتواصل معك فريقنا لتحديد موعد المعاينة."
              : "Your request is written out. Open WhatsApp to send it, and our team will contact you to arrange the visit."}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Button href={state.href} external size="lg">
            {ar ? "افتح واتساب" : "Open WhatsApp"}
          </Button>
          <button
            type="button"
            className="t-label underline-offset-4 hover:underline"
            onClick={() => setOwnState({ status: "idle", values: state.values })}
          >
            {ar ? "تعديل الطلب" : "Change the request"}
          </button>
        </div>
      </div>
    );
  }

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

  const invalid = (name: InquiryField) => ({
    "aria-invalid": err(name) ? true : undefined,
    "aria-describedby": err(name) ? `${name}-error` : undefined,
  });

  const errorFor = (name: InquiryField) => {
    const e = err(name);
    return e ? (
      <p id={`${name}-error`} className="field-error" role="alert">
        {t(messages[name][e])}
      </p>
    ) : null;
  };

  return (
    <form ref={form} action={whatsapp ? undefined : action} onSubmit={onSubmit} noValidate className="contact-form">
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
              <input type="checkbox" name="systems" value={s.slug} defaultChecked={vs().includes(s.slug)} />
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

      {(state.status === "unavailable" || state.status === "failed") && (
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
          {pending ? (
            ar ? "جارٍ الإرسال…" : "Sending…"
          ) : whatsapp ? (
            <span className="inline-flex items-center gap-3">
              <SocialIcon name="whatsapp" />
              {ar ? "أرسل عبر واتساب" : "Send on WhatsApp"}
            </span>
          ) : ar ? (
            "اطلب المعاينة"
          ) : (
            "Request a site visit"
          )}
        </Button>
        <p className="t-small max-w-[34ch] text-ink-2">
          {whatsapp
            ? ar
              ? "يفتح واتساب وتفاصيلك مكتوبة وجاهزة للإرسال. الحقول المعلّمة بـ * مطلوبة."
              : "Opens WhatsApp with your details written out, ready to send. Fields marked * are required."
            : ar
              ? "الحقول المعلّمة بـ * مطلوبة."
              : "Fields marked * are required."}
        </p>
      </div>
    </form>
  );
}
