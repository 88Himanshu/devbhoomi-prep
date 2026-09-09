"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
import { FlaskConical, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/misc";

interface OrderResponse {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string | null;
  sandbox: boolean;
  plan: { id: string; name: string; price: number };
  prefill: { name: string; email: string; contact: string };
  error?: string;
}

interface RazorpaySuccess { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
interface RazorpayInstance { open: () => void; on: (event: string, cb: (resp: { error?: { description?: string } }) => void) => void }
declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance }
}

export function RazorpayCheckout({ planId, planName, amountLabel, sandbox }: { planId: string; planName: string; amountLabel: string; sandbox: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);

  async function createOrder(): Promise<OrderResponse | null> {
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planId }),
    });
    const data = (await res.json()) as OrderResponse;
    if (!res.ok) {
      setError(data.error ?? "Could not start payment.");
      return null;
    }
    return data;
  }

  async function verify(body: Record<string, unknown>) {
    const res = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) throw new Error(data.error ?? "Payment could not be verified.");
  }

  async function payLive() {
    setBusy(true);
    setError(null);
    try {
      const o = await createOrder();
      if (!o) return;
      setOrder(o);
      if (!window.Razorpay || !o.key_id) throw new Error("Razorpay checkout failed to load. Refresh and try again.");
      const rzp = new window.Razorpay({
        key: o.key_id,
        amount: o.amount,
        currency: o.currency,
        name: "Devbhoomi Prep",
        description: `${o.plan.name} plan`,
        order_id: o.order_id,
        prefill: o.prefill,
        theme: { color: "#163e86" },
        modal: {
          ondismiss: () => {
            setBusy(false);
            void fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ payment_id: o.payment_id, failed: true, reason: "Checkout closed before payment" }),
            });
          },
        },
        handler: async (resp: RazorpaySuccess) => {
          try {
            await verify({ payment_id: o.payment_id, ...resp });
            router.push(`/checkout/success?payment=${o.payment_id}`);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Verification failed");
            setBusy(false);
          }
        },
      });
      rzp.on("payment.failed", (resp) => {
        setError(resp.error?.description ?? "Payment failed. You have not been charged.");
        setBusy(false);
        void fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_id: o.payment_id, failed: true, reason: resp.error?.description ?? "Payment failed" }),
        });
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  async function paySandbox(outcome: "success" | "fail") {
    setBusy(true);
    setError(null);
    try {
      const o = order ?? (await createOrder());
      if (!o) return;
      setOrder(o);
      if (outcome === "fail") {
        await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_id: o.payment_id, failed: true, reason: "Simulated failure (test mode)" }),
        });
        setOrder(null);
        setError("Simulated failure recorded. No subscription was activated.");
        return;
      }
      await verify({ payment_id: o.payment_id, sandbox: true, method: "upi" });
      router.push(`/checkout/success?payment=${o.payment_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (sandbox) {
    return (
      <div className="grid gap-4">
        {error && <Alert tone="error">{error}</Alert>}
        <div className="rounded-xl border border-dashed border-saffron-300 bg-saffron-50 p-4 text-sm text-ink-800">
          <p className="flex items-center gap-2 font-semibold"><FlaskConical className="h-4 w-4 text-saffron-700" aria-hidden="true" /> Test mode: Razorpay keys not configured</p>
          <p className="mt-1 text-ink-700">
            Payments are simulated so you can try the full upgrade flow. Add <code className="rounded bg-white px-1">NEXT_PUBLIC_RAZORPAY_KEY_ID</code> and{" "}
            <code className="rounded bg-white px-1">RAZORPAY_KEY_SECRET</code> to accept real payments.
          </p>
        </div>
        <Button type="button" size="lg" loading={busy} onClick={() => paySandbox("success")} className="w-full">
          Simulate successful payment · {amountLabel}
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => paySandbox("fail")} className="w-full">
          Simulate failed payment
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {error && <Alert tone="error">{error}</Alert>}
      <Button type="button" size="lg" loading={busy} onClick={payLive} className="w-full">
        <Lock className="h-4 w-4" aria-hidden="true" /> Pay {amountLabel} securely
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
        <ShieldCheck className="h-3.5 w-3.5 text-forest-600" aria-hidden="true" /> UPI, cards, net banking & wallets via Razorpay. {planName} activates instantly after verification.
      </p>
    </div>
  );
}
