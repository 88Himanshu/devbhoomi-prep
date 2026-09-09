"use server";

import { z } from "zod";

export interface ContactResult { ok: boolean; message?: string; fieldErrors?: Record<string, string> }

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  subject: z.string().trim().min(3, "Enter a subject").max(120),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(2000),
});

export async function submitContact(_prev: ContactResult | null, formData: FormData): Promise<ContactResult> {
  const parsed = schema.safeParse({
    name: formData.get("name"), email: formData.get("email"), subject: formData.get("subject"), message: formData.get("message"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }
  // Honeypot: bots fill hidden fields.
  if (formData.get("website")) return { ok: true, message: "Thanks! We will get back to you soon." };
  console.info("[contact]", parsed.data.email, parsed.data.subject);
  return { ok: true, message: "Thanks! Your message has been received. We usually reply within one working day." };
}
