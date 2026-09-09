"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminDb } from "@/lib/data";
import { requireAdmin } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/env";
import type { TrialSettings } from "@/lib/types";
import { bool, fail, num, opt, str, toastRedirect, zodErrors, type ActionState } from "./helpers";

const annSchema = z.object({
  type: z.enum(["banner", "announcement"]),
  title: z.string().min(3).max(140),
  body: z.string().max(1000),
  link_url: z.string().max(300).nullable(),
  link_label: z.string().max(60).nullable(),
});

const toIso = (v: string | null) => (v ? new Date(v).toISOString() : null);

export async function saveAnnouncement(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData, "id") || null;
  const parsed = annSchema.safeParse({ type: str(formData, "type") || "announcement", title: str(formData, "title"), body: str(formData, "body"), link_url: opt(formData, "link_url"), link_label: opt(formData, "link_label") });
  if (!parsed.success) return fail(zodErrors(parsed.error));
  const store = await adminDb();
  const payload = { ...parsed.data, is_active: bool(formData, "is_active"), starts_at: toIso(opt(formData, "starts_at")), ends_at: toIso(opt(formData, "ends_at")) };
  if (id) await store.update("announcements", id, payload); else await store.insert("announcements", payload);
  revalidatePath("/");
  revalidatePath("/admin/homepage");
  toastRedirect("/admin/homepage", "ok", `Announcement ${id ? "updated" : "created"}`);
}

export async function deleteAnnouncement(formData: FormData) {
  await requireAdmin();
  await (await adminDb()).delete("announcements", str(formData, "id"));
  revalidatePath("/");
  toastRedirect("/admin/homepage", "ok", "Announcement deleted");
}

export async function toggleAnnouncement(formData: FormData) {
  await requireAdmin();
  await (await adminDb()).update("announcements", str(formData, "id"), { is_active: str(formData, "value") === "1" });
  revalidatePath("/");
  toastRedirect("/admin/homepage", "ok", "Updated");
}

export async function saveTrialSettings(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const days = num(formData, "trial_days", 30);
  if (!Number.isInteger(days) || days < 0 || days > 365) return fail({ trial_days: "Enter 0–365 days" });
  const value: TrialSettings = {
    trial_days: days,
    books: bool(formData, "books"), notes: bool(formData, "notes"), papers: bool(formData, "papers"),
    mock_tests: bool(formData, "mock_tests"), solutions: bool(formData, "solutions"), analytics: bool(formData, "analytics"),
  };
  await (await adminDb()).upsert("settings", { key: "trial", value, updated_at: new Date().toISOString() });
  revalidatePath("/", "layout");
  toastRedirect("/admin/settings", "ok", "Trial settings saved");
}

export async function saveSiteSettings(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.object({ support_email: z.string().email(), support_phone: z.string().min(6).max(20), address: z.string().min(2).max(200) })
    .safeParse({ support_email: str(formData, "support_email"), support_phone: str(formData, "support_phone"), address: str(formData, "address") });
  if (!parsed.success) return fail(zodErrors(parsed.error));
  await (await adminDb()).upsert("settings", { key: "site", value: parsed.data, updated_at: new Date().toISOString() });
  revalidatePath("/", "layout");
  toastRedirect("/admin/settings", "ok", "Site settings saved");
}

export async function resetDemoDatabase() {
  await requireAdmin();
  if (!isDemoMode()) toastRedirect("/admin/settings", "err", "Reset is only available in demo mode");
  const { resetDemoDb } = await import("@/lib/data/demo-store");
  resetDemoDb();
  revalidatePath("/", "layout");
  toastRedirect("/admin/settings", "ok", "Demo database reset to seed data");
}
