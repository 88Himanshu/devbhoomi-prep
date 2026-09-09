import "server-only";
import { randomBytes } from "node:crypto";
import { adminDb } from "@/lib/data";
import { getPlan } from "@/lib/plans";
import type { Payment, PlanId, Subscription } from "@/lib/types";
import { activateSubscription, nextInvoiceNumber } from "./subscriptions";

export const newReceipt = () => `rcpt_${Date.now().toString(36)}${randomBytes(2).toString("hex")}`;
export const sandboxOrderId = () => `order_sandbox_${randomBytes(6).toString("hex")}`;

export async function createPaymentRecord(opts: { userId: string; planId: PlanId; razorpayOrderId: string; receipt: string }): Promise<Payment> {
  const plan = getPlan(opts.planId);
  return (await adminDb()).insert("payments", {
    user_id: opts.userId,
    plan_id: opts.planId,
    amount: plan.price * 100,
    currency: "INR",
    receipt: opts.receipt,
    razorpay_order_id: opts.razorpayOrderId,
    razorpay_payment_id: null,
    razorpay_signature: null,
    status: "created",
    method: null,
    failure_reason: null,
    refund_status: null,
    invoice_number: null,
    paid_at: null,
  });
}

/**
 * Mark a payment paid and activate the subscription. Idempotent: a payment that is
 * already paid returns its existing subscription without creating another one.
 */
export async function settlePayment(payment: Payment, details: { razorpayPaymentId: string | null; signature?: string | null; method?: string | null }): Promise<{ payment: Payment; subscription: Subscription }> {
  const store = await adminDb();
  if (payment.status === "paid") {
    const existing = await store.selectOne("subscriptions", { eq: { payment_id: payment.id } });
    if (existing) return { payment, subscription: existing };
  }
  const paidCount = await store.count("payments", { eq: { status: "paid" } });
  const updated = await store.update("payments", payment.id, {
    status: "paid",
    razorpay_payment_id: details.razorpayPaymentId,
    razorpay_signature: details.signature ?? null,
    method: details.method ?? payment.method ?? null,
    failure_reason: null,
    invoice_number: payment.invoice_number ?? nextInvoiceNumber(paidCount + 1),
    paid_at: new Date().toISOString(),
  });
  const subscription = await activateSubscription({ userId: payment.user_id, planId: payment.plan_id, source: "razorpay", paymentId: payment.id });
  return { payment: updated, subscription };
}

export async function failPayment(payment: Payment, reason: string, razorpayPaymentId?: string | null): Promise<Payment> {
  if (payment.status === "paid") return payment; // never downgrade a settled payment
  return (await adminDb()).update("payments", payment.id, {
    status: "failed",
    failure_reason: reason.slice(0, 200),
    ...(razorpayPaymentId ? { razorpay_payment_id: razorpayPaymentId } : {}),
  });
}

export async function refundPayment(payment: Payment, refundStatus = "refunded"): Promise<Payment> {
  return (await adminDb()).update("payments", payment.id, { status: "refunded", refund_status: refundStatus });
}
