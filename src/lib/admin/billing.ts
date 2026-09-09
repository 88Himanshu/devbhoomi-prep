"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/data";
import { requireAdmin } from "@/lib/auth/session";
import { expireLapsedSubscriptions } from "@/lib/services/subscriptions";
import { str, toastRedirect } from "./helpers";

export async function runExpireLapsed() {
  await requireAdmin();
  const n = await expireLapsedSubscriptions();
  revalidatePath("/admin/subscriptions");
  toastRedirect("/admin/subscriptions", "ok", `${n} subscription(s) marked expired`);
}

export async function markRefund(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "refund_status");
  const store = await adminDb();
  const p = await store.getById("payments", id);
  if (!p) toastRedirect("/admin/payments", "err", "Payment not found");
  if (!status) toastRedirect("/admin/payments", "err", "Enter a refund status");
  const refunded = /refunded|processed|complete/i.test(status);
  await store.update("payments", id, { refund_status: status, ...(refunded ? { status: "refunded" } : {}) });
  if (refunded) {
    const subs = await store.select("subscriptions", { eq: { payment_id: id, status: "active" } });
    for (const s of subs) await store.update("subscriptions", s.id, { status: "cancelled", ends_at: new Date().toISOString(), note: "Payment refunded" });
  }
  revalidatePath("/admin/payments");
  toastRedirect("/admin/payments", "ok", refunded ? "Marked refunded; linked subscription cancelled" : "Refund status updated");
}
