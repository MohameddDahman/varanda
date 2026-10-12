"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export type FieldError = "required" | "invalid";
export type InquiryErrors = Partial<Record<"name" | "phone" | "email" | "projectType", FieldError>>;

export type InquiryState = {
  /** idle: untouched · success: stored · invalid: fix fields · unavailable: backend not connected · failed: try again */
  status: "idle" | "success" | "invalid" | "unavailable" | "failed";
  errors?: InquiryErrors;
  values?: Record<string, string | string[]>;
};

const PHONE = /^[+\d][\d\s()-]{6,}$/;
const EMAIL = /^\S+@\S+\.\S+$/;

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim();

  // Bots fill every field, people never see this one.
  if (get("company")) return { status: "success" };

  const values = {
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
  if (Object.keys(errors).length) return { status: "invalid", errors, values };

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return { status: "unavailable", values };

  try {
    await fetchMutation(api.inquiries.create, {
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      area: values.area || undefined,
      projectType: values.projectType,
      systems: values.systems,
      message: values.message || undefined,
      contactBy: values.contactBy,
      locale: values.locale,
    });
    return { status: "success" };
  } catch {
    return { status: "failed", values };
  }
}
