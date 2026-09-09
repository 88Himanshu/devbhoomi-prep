"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getBackend } from "@/lib/env";
import { db } from "@/lib/data";
import { getSessionUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { ActionResult } from "@/lib/auth/actions";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  mobile: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/, "Enter a valid Indian mobile number").or(z.literal("")),
  preferred_exam_id: z.string().trim().max(64).optional().nullable(),
  education_level: z.string().trim().max(64).optional().nullable(),
});

function zodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) { const k = String(i.path[0] ?? "form"); if (!out[k]) out[k] = i.message; }
  return out;
}

export async function updateProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    mobile: formData.get("mobile") ?? "",
    preferred_exam_id: formData.get("preferred_exam_id") || null,
    education_level: formData.get("education_level") || null,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodErrors(parsed.error) };
  const store = await db();
  if (parsed.data.preferred_exam_id) {
    const exam = await store.getById("exams", parsed.data.preferred_exam_id);
    if (!exam) return { ok: false, fieldErrors: { preferred_exam_id: "Unknown exam" } };
  }
  await store.update("users", user.id, { full_name: parsed.data.full_name, mobile: parsed.data.mobile || null });
  const profile = await store.getById("profiles", user.id);
  if (profile) {
    await store.update("profiles", user.id, {
      preferred_exam_id: parsed.data.preferred_exam_id ?? null,
      education_level: parsed.data.education_level ?? null,
      updated_at: new Date().toISOString(),
    });
  }
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile updated." };
}

const passwordSchema = z
  .object({
    current_password: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, { path: ["confirm_password"], message: "Passwords do not match" });

export async function changePassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const parsed = passwordSchema.safeParse({
    current_password: formData.get("current_password") ?? "",
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodErrors(parsed.error) };

  if (getBackend() === "demo") {
    const store = await db();
    const row = await store.getById("users", user.id);
    if (!row || !verifyPassword(parsed.data.current_password ?? "", row.password_hash)) {
      return { ok: false, fieldErrors: { current_password: "Current password is incorrect" } };
    }
    await store.update("users", user.id, { password_hash: hashPassword(parsed.data.password) });
    return { ok: true, message: "Password changed." };
  }
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Password changed." };
}
