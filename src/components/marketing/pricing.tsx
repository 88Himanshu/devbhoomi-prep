import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { PLANS, formatINR } from "@/lib/plans";
import type { AccessState, PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function planHref(planId: PlanId, signedIn: boolean) {
  const checkout = `/checkout?plan=${planId}`;
  return signedIn ? checkout : `/signup?next=${encodeURIComponent(checkout)}`;
}

/** The three paid plans. Shared by landing page and /pricing. */
export function PricingCards({ signedIn, access, compact }: { signedIn: boolean; access?: AccessState | null; compact?: boolean }) {
  const currentPlan = access?.subscriptionActive ? access.subscription?.plan_id : null;
  return (
    <div className={cn("grid gap-5", compact ? "md:grid-cols-3" : "md:grid-cols-3")}>
      {PLANS.map((plan) => {
        const isCurrent = currentPlan === plan.id;
        return (
          <PlanCard
            key={plan.id}
            name={plan.name}
            price={formatINR(plan.price)}
            period={plan.period_label}
            badge={plan.badge}
            highlight={plan.badge === "Popular"}
            features={plan.features}
            note={plan.savings ? `Save ${formatINR(plan.savings)} vs monthly` : "Cancel anytime"}
            cta={
              isCurrent ? (
                <span className="flex h-11 w-full items-center justify-center rounded-xl bg-forest-50 text-sm font-semibold text-forest-700">Current plan</span>
              ) : (
                <ButtonLink href={planHref(plan.id, signedIn)} variant={plan.badge === "Popular" ? "primary" : "secondary"} className="w-full">
                  {access?.subscriptionActive ? "Extend with this plan" : `Choose ${plan.name}`}
                </ButtonLink>
              )
            }
          />
        );
      })}
    </div>
  );
}

function PlanCard({ name, price, period, badge, highlight, features, cta, note }: {
  name: string; price: string; period: string; badge?: string | null; highlight?: boolean; features: string[]; cta: React.ReactNode; note?: string;
}) {
  return (
    <div className={cn(
      "relative flex flex-col rounded-2xl border bg-white p-6 shadow-card",
      highlight ? "border-brand-600 ring-4 ring-brand-100" : "border-ink-200",
    )}>
      {badge && (
        <Badge tone={badge === "Popular" ? "brand" : "saffron"} className="absolute -top-3 left-6 shadow-card">{badge}</Badge>
      )}
      <p className="text-sm font-semibold text-ink-700">{name}</p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-ink-900">{price}</span>
        <span className="text-sm text-ink-500">{period}</span>
      </p>
      {note && <p className="mt-1 text-xs text-forest-700">{note}</p>}
      <ul className="mt-5 space-y-2.5 text-sm text-ink-700">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-2">{cta}</div>
    </div>
  );
}

export const COMPARISON_ROWS: { feature: string; paid: string | boolean }[] = [
  { feature: "Notes library", paid: "Full library" },
  { feature: "Previous year papers", paid: "All papers + attempt as mock" },
  { feature: "Mock tests", paid: "Unlimited" },
  { feature: "Detailed solutions", paid: true },
  { feature: "Performance analytics", paid: "Full (subject-wise, trends)" },
  { feature: "Bookmarks & progress tracking", paid: true },
  { feature: "Downloads (PDF)", paid: true },
  { feature: "Support", paid: "Priority email" },
];

export function ComparisonTable() {
  const cols = ["Monthly", "3 Months", "Yearly"];
  return (
    <div id="compare" className="overflow-x-auto rounded-2xl border border-ink-200 bg-white shadow-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <th className="px-5 py-3">Feature</th>
            {cols.map((c) => <th key={c} className="px-5 py-3">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr key={row.feature} className="border-t border-ink-100">
              <td className="px-5 py-3 font-medium text-ink-900">{row.feature}</td>
              <Cell value={row.paid} />
              <Cell value={row.paid} />
              <Cell value={row.paid} />
            </tr>
          ))}
          <tr className="border-t border-ink-100 bg-ink-50/60">
            <td className="px-5 py-3 font-medium text-ink-900">Price</td>
            {PLANS.map((p) => <td key={p.id} className="px-5 py-3 font-semibold text-ink-900">{formatINR(p.price)}{p.period_label}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Cell({ value }: { value: string | boolean }) {
  return (
    <td className="px-5 py-3 text-ink-700">
      {value === true ? <Check className="h-4 w-4 text-forest-600" aria-label="Included" /> : value === false ? <span className="text-ink-300">—</span> : value}
    </td>
  );
}

export function SecurePaymentNote() {
  return (
    <p className="flex items-center justify-center gap-2 text-center text-xs text-ink-500">
      <ShieldCheck className="h-4 w-4 text-forest-600" aria-hidden="true" />
      Payments are processed securely by Razorpay (UPI, cards, net banking). See our <Link href="/refund-policy" className="underline">refund policy</Link>.
    </p>
  );
}
