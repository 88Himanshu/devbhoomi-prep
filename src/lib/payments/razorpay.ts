import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { env, isRazorpayConfigured } from "@/lib/env";

function client() {
  if (!isRazorpayConfigured()) throw new Error("Razorpay is not configured");
  return new Razorpay({ key_id: env.RAZORPAY_KEY_ID!, key_secret: env.RAZORPAY_KEY_SECRET! });
}

export interface RazorpayOrder { id: string; amount: number; currency: string; receipt?: string }

/** Create a Razorpay order. `amount` is in paise. */
export async function createOrder(amount: number, receipt: string, notes: Record<string, string> = {}): Promise<RazorpayOrder> {
  const order = await client().orders.create({ amount, currency: "INR", receipt, notes });
  return { id: order.id, amount: Number(order.amount), currency: order.currency, receipt: order.receipt ?? undefined };
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Checkout callback signature: HMAC-SHA256(order_id|payment_id, key_secret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

/** Webhook signature: HMAC-SHA256(raw body, webhook secret) sent as X-Razorpay-Signature. */
export function verifyWebhookSignature(rawBody: string, signature: string | null, secret = env.RAZORPAY_WEBHOOK_SECRET): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
