import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Receipt } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/data";
import { getPlan, formatINR } from "@/lib/plans";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/ui/misc";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Payment successful", robots: { index: false } };

export default async function CheckoutSuccessPage(props: PageProps<"/checkout/success">) {
  const [user, sp] = await Promise.all([requireUser(), props.searchParams]);
  const paymentId = typeof sp.payment === "string" ? sp.payment : "";
  const store = await db();
  const payment = paymentId ? await store.getById("payments", paymentId) : null;
  if (!payment || payment.user_id !== user.id || payment.status !== "paid") notFound();
  const subscription = await store.selectOne("subscriptions", { eq: { payment_id: payment.id } });
  const plan = getPlan(payment.plan_id);

  return (
    <Container className="max-w-xl py-12 sm:py-16">
      <Card className="animate-fade-up text-center">
        <CardContent className="grid gap-5 pt-8 pb-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 text-forest-600">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">You&apos;re now Premium 🎉</h1>
            <p className="mt-2 text-sm text-ink-500">Thanks, {user.full_name.split(" ")[0]}. Your {plan.name} plan is active.</p>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 rounded-xl bg-ink-50 p-4 text-left text-sm">
            <dt className="text-ink-500">Plan</dt><dd className="font-semibold text-ink-900">{plan.name}</dd>
            <dt className="text-ink-500">Amount paid</dt><dd className="font-semibold text-ink-900">{formatINR(payment.amount / 100)}</dd>
            <dt className="text-ink-500">Premium until</dt><dd className="font-semibold text-ink-900">{formatDate(subscription?.ends_at)}</dd>
            <dt className="text-ink-500">Invoice</dt><dd className="font-mono text-xs text-ink-900">{payment.invoice_number ?? payment.receipt}</dd>
          </dl>
          <div className="grid gap-2 sm:grid-cols-2">
            <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
            <ButtonLink href={`/profile/receipt/${payment.id}`} variant="outline"><Receipt className="h-4 w-4" aria-hidden="true" /> View receipt</ButtonLink>
          </div>
          <p className="text-xs text-ink-500">All premium books, notes, previous-year papers and mock tests are unlocked. A receipt is available anytime from your profile.</p>
        </CardContent>
      </Card>
    </Container>
  );
}
