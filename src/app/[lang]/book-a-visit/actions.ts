"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { isBot, readInquiry, type InquiryErrors, type InquiryValues } from "@/lib/inquiry";

export type InquiryState = {
  /** idle: untouched · success: stored · invalid: fix fields · unavailable: backend not connected · failed: try again */
  status: "idle" | "success" | "invalid" | "unavailable" | "failed";
  errors?: InquiryErrors;
  values?: InquiryValues;
};

/**
 * Keeps a site-visit request on the dashboard (Requests). The form also hands each request to
 * WhatsApp; this copy means nothing is lost if the visitor never presses Send there.
 */
export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Bots fill every field, people never see this one.
  if (isBot(formData)) return { status: "success" };

  const { values, errors } = readInquiry(formData);
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
