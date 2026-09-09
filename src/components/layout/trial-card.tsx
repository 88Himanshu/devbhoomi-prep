import { Sparkles } from "lucide-react";
import type { AccessState } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";

/** Compact trial / subscription status with upgrade CTA. Used in sidebars and dashboard. */
export function TrialSidebarCard({ access, className }: { access: AccessState; className?: string }) {
  if (access.isAdmin) return null;
  if (access.subscriptionActive && access.subscription) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-forest-200 bg-forest-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-forest-800"><Sparkles className="h-4 w-4" aria-hidden="true" /> Premium active</p>
          <p className="mt-1 text-xs text-forest-700">Renews / ends {formatDate(access.subscription.ends_at)}</p>
        </div>
      </div>
    );
  }
  if (access.trialActive) {
    const total = 30;
    const used = Math.max(0, total - access.trialDaysLeft);
    return (
      <div className={className}>
        <div className="rounded-2xl border border-saffron-200 bg-saffron-50 p-4">
          <p className="text-sm font-semibold text-ink-900">Your free trial ends in {access.trialDaysLeft} {access.trialDaysLeft === 1 ? "day" : "days"}.</p>
          <Progress value={(used / total) * 100} tone="saffron" className="mt-3" label="Trial progress" />
          <ButtonLink href="/pricing" variant="saffron" size="sm" className="mt-3 w-full">Upgrade now</ButtonLink>
        </div>
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="rounded-2xl border border-ink-200 bg-white p-4">
        <p className="text-sm font-semibold text-ink-900">Trial ended</p>
        <p className="mt-1 text-xs text-ink-500">Premium books, papers and mock tests are locked. Free content stays open.</p>
        <ButtonLink href="/pricing" size="sm" className="mt-3 w-full">Upgrade to Premium</ButtonLink>
      </div>
    </div>
  );
}
