/**
 * The site-visit request form's fields, read and checked the same way in the browser (before the
 * request goes to WhatsApp) and on the server (before it's kept on the dashboard).
 */

export type FieldError = "required" | "invalid";
export type InquiryField = "name" | "phone" | "email" | "projectType";
export type InquiryErrors = Partial<Record<InquiryField, FieldError>>;

export type InquiryValues = {
  name: string;
  phone: string;
  email: string;
  area: string;
  projectType: string;
  message: string;
  contactBy: string;
  locale: "en" | "ar";
  systems: string[];
};

const PHONE = /^[+\d][\d\s()-]{6,}$/;
const EMAIL = /^\S+@\S+\.\S+$/;

/** True when the hidden field only bots fill in has something in it. */
export const isBot = (formData: FormData) => Boolean(String(formData.get("company") ?? "").trim());

export function readInquiry(formData: FormData): { values: InquiryValues; errors: InquiryErrors } {
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  const values: InquiryValues = {
    name: get("name").slice(0, 120),
    phone: get("phone").slice(0, 32),
    email: get("email").slice(0, 160),
    area: get("area").slice(0, 160),
    projectType: get("projectType"),
    message: get("message").slice(0, 3000),
    contactBy: get("contactBy") || "phone",
    locale: get("locale") === "ar" ? "ar" : "en",
    systems: formData.getAll("systems").map(String).slice(0, 10),
  };

  const errors: InquiryErrors = {};
  if (values.name.length < 2) errors.name = "required";
  if (!values.phone) errors.phone = "required";
  else if (!PHONE.test(values.phone)) errors.phone = "invalid";
  if (values.email && !EMAIL.test(values.email)) errors.email = "invalid";
  if (!values.projectType) errors.projectType = "required";
  return { values, errors };
}
