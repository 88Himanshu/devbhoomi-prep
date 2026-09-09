import type { Metadata } from "next";
import { BarChart3, Clock, Flame, Target, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { getStudentAnalytics } from "@/lib/services/analytics";
import { getSubjects } from "@/lib/services/catalog";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, PremiumLock, Stat } from "@/components/ui/misc";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import { formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "Performance analytics", robots: { index: false } };

export default async function AnalyticsPage() {
  const user = await requireUser("/analytics");
  const [access, data, subjects] = await Promise.all([getAccess(), getStudentAnalytics(user.id), getSubjects()]);
  const subjectSlugs: Record<string, string> = {};
  for (const s of subjects) subjectSlugs[s.id] = s.slug;
  const t = data.totals;

  return (
    <div>
      <PageHeader
        eyebrow="My learning"
        title="Performance analytics"
        description="Where you stand, what is improving, and which subjects need attention."
        actions={<ButtonLink href="/tests/new" variant="forest"><BarChart3 className="h-4 w-4" aria-hidden="true" /> Practise weak areas</ButtonLink>}
      />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Tests attempted" value={t.attempts} icon={BarChart3} />
        <Stat label="Average score" value={`${t.avg_score_pct}%`} icon={Trophy} tone="saffron" hint={`best ${t.best_pct}%`} />
        <Stat label="Overall accuracy" value={`${t.avg_accuracy}%`} icon={Target} tone="forest" />
        <Stat label="Time practised" value={formatDuration(t.total_time_seconds)} icon={Clock} tone="neutral" hint={`${t.questions_answered} questions answered`} />
        <Stat label="Active days" value={`${data.study_days_last_14} / 14`} icon={Flame} tone="saffron" hint="last two weeks" />
      </div>
      <div className="mt-6">
        {access.canAccess("analytics") ? (
          <AnalyticsView data={data} subjectSlugs={subjectSlugs} />
        ) : (
          <div className="relative">
            <div className="pointer-events-none select-none blur-[3px]" aria-hidden="true">
              <AnalyticsView data={data} subjectSlugs={subjectSlugs} />
            </div>
            <div className="absolute inset-0 flex items-start justify-center pt-10">
              <PremiumLock className="max-w-md shadow-pop" title="Analytics are a Premium feature" description="Score history, subject accuracy, weak-area detection and time management insights update after every test." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
