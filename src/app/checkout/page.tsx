import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { isRazorpayConfigured } from "@/lib/env";
import { getPlan, isPlanId, formatINR, PLANS } from "@/lib/plans";
import { formatDate } from "@/lib/utils";
import { Container, PageHeader } from "@/components/ui/misc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RazorpayCheckout } from "@/components/payments/razorpay-checkout";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage(props: PageProps<"/checkout">) {
  const sp = await props.searchParams;
  const planParam = typeof sp.plan === "string" ? sp.plan : "";
  if (!isPlanId(planParam)) redirect("/pricing");
  const user = await requireUser(`/checkout?plan=${planParam}`);
  const access = await getAccess();
  const plan = getPlan(planParam);

  const base = access.subscriptionActive && access.subscription && new Date(access.subscription.ends_at) > new Date()
    ? new Date(access.subscription.ends_at)
    : new Date();
  const newExpiry = new Date(base.getTime() + plan.duration_days * 86_400_000);
  const perMonth = Math.round(plan.price / (plan.duration_days / 30));

  return (
    <Container className="max-w-5xl py-8 sm:py-12">
      <PageHeader eyebrow="Secure checkout" title={`Upgrade to Premium — ${plan.name}`} description={`Signed in as ${user.email}`} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardContent className="grid gap-6 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink-500">Plan</p>
                <p className="text-xl font-bold text-ink-900">{plan.name} {plan.badge && <Badge tone={plan.badge === "Popular" ? "brand" : "forest"} className="ml-1 align-middle">{plan.badge}</Badge>}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-ink-900">{formatINR(plan.price)}</p>
                <p className="text-xs text-ink-500">{plan.duration_days} days · ≈ {formatINR(perMonth)}/month</p>
              </div>
            </div>
            <ul className="grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
              {(plan.id === "monthly" ? plan.features : [...PLANS[0].features, ...plan.features.slice(1)]).map((f) => (
                <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" /> {f}</li>
              ))}
            </ul>
            <div className="rounded-xl bg-ink-50 p-4 text-sm">
              <p className="font-semibold text-ink-900">Access period</p>
              {access.subscriptionActive && access.subscription ? (
                <p className="mt-1 text-ink-700">Your current plan ends on {formatDate(access.subscription.ends_at)}. This purchase extends premium access until <span className="font-semibold text-ink-900">{formatDate(newExpiry.toISOString())}</span>.</p>
              ) : (
                <p className="mt-1 text-ink-700">Premium starts immediately and runs until <span className="font-semibold text-ink-900">{formatDate(newExpiry.toISOString())}</span>.{access.trialActive ? ` Your remaining trial (${access.trialDaysLeft} days) is replaced by full premium access.` : ""}</p>
              )}
            </div>
            <p className="text-xs text-ink-500">
              Prices include applicable taxes. Access ends automatically at the end of the period — no auto-renewal. See our{" "}
              <Link href="/refund-policy" className="font-medium text-brand-700 hover:underline">Refund Policy</Link>. Want a different plan?{" "}
              <Link href="/pricing" className="font-medium text-brand-700 hover:underline">Compare plans</Link>.
            </p>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="grid gap-4 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">Total due today</span>
                <span className="text-xl font-bold text-ink-900">{formatINR(plan.price)}</span>
              </div>
              <RazorpayCheckout planId={plan.id} planName={plan.name} amountLabel={formatINR(plan.price)} sandbox={!isRazorpayConfigured()} />
            </CardContent>
          </Card>
          <p className="flex items-start gap-2 px-1 text-xs text-ink-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
            Every payment is verified on our servers before your subscription is activated. We never store card details.
          </p>
        </div>
      </div>
    </Container>
  );
}
