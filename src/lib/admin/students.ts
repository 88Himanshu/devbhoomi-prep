"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminDb } from "@/lib/data";
import { requireAdmin } from "@/lib/auth/session";
import { isPlanId } from "@/lib/plans";
import { activateSubscription, deactivateSubscription } from "@/lib/services/subscriptions";
import { num, str, toastRedirect } from "./helpers";

const back = (id: string) => `/admin/students/${id}`;

export async function setBlocked(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "user_id");
  const blocked = str(formData, "blocked") === "1";
  const store = await adminDb();
  const user = await store.getById("users", id);
  if (!user) toastRedirect("/admin/students", "err", "Student not found");
  if (user.role === "admin") toastRedirect(back(id), "err", "Admins cannot be blocked");
  await store.update("users", id, { is_blocked: blocked });
  revalidatePath("/admin/students");
  toastRedirect(str(formData, "return") || back(id), "ok", blocked ? `${user.full_name} has been blocked` : `${user.full_name} has been unblocked`);
}

export async function setRole(formData: FormData) {
  const me = await requireAdmin();
  const id = str(formData, "user_id");
  const role = str(formData, "role") === "admin" ? "admin" : "student";
  if (id === me.id) toastRedirect(back(id), "err", "You cannot change your own role");
  const store = await adminDb();
  await store.update("users", id, { role });
  revalidatePath("/admin/students");
  toastRedirect(back(id), "ok", `Role updated to ${role}`);
}

export async function extendTrial(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "user_id");
  const days = num(formData, "days");
  if (!Number.isInteger(days) || days < -365 || days > 365 || days === 0) toastRedirect(back(id), "err", "Enter a number of days between -365 and 365");
  const store = await adminDb();
  const profile = await store.getById("profiles", id);
  if (!profile) toastRedirect(back(id), "err", "Profile not found");
  const base = new Date(Math.max(Date.now(), new Date(profile.trial_ends_at).getTime()));
  const ends = new Date(base.getTime() + days * 86_400_000);
  await store.update("profiles", id, { trial_ends_at: ends.toISOString(), updated_at: new Date().toISOString() });
  toastRedirect(back(id), "ok", `Trial now ends on ${ends.toLocaleDateString("en-IN")}`);
}

export async function manualActivate(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({ user_id: z.string().min(1), plan_id: z.string().refine(isPlanId, "Pick a plan"), note: z.string().max(200).optional() }).safeParse({
    user_id: str(formData, "user_id"), plan_id: str(formData, "plan_id"), note: str(formData, "note"),
  });
  const ret = str(formData, "return") || back(str(formData, "user_id"));
  if (!parsed.success) toastRedirect(ret, "err", parsed.error.issues[0].message);
  const store = await adminDb();
  const user = await store.getById("users", parsed.data.user_id);
  if (!user) toastRedirect(ret, "err", "Student not found");
  if (!isPlanId(parsed.data.plan_id)) toastRedirect(ret, "err", "Invalid plan");
  await activateSubscription({ userId: user.id, planId: parsed.data.plan_id, source: "manual", note: parsed.data.note || "Activated by admin" });
  revalidatePath("/admin/subscriptions");
  toastRedirect(ret, "ok", `${parsed.data.plan_id} subscription activated for ${user.full_name}`);
}

export async function manualDeactivate(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "subscription_id");
  const ret = str(formData, "return") || "/admin/subscriptions";
  const store = await adminDb();
  const sub = await store.getById("subscriptions", id);
  if (!sub) toastRedirect(ret, "err", "Subscription not found");
  await deactivateSubscription(id, str(formData, "note") || "Deactivated by admin");
  revalidatePath("/admin/subscriptions");
  toastRedirect(ret, "ok", "Subscription deactivated");
}
