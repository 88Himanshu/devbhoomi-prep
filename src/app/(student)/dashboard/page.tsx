import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CalendarClock, ClipboardCheck, Crown, Percent, Target } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { getDashboardData, touchStudyStreak } from "@/lib/services/dashboard";
import { getExamMap } from "@/lib/services/catalog";
import { getPlan } from "@/lib/plans";
import { formatDate } from "@/lib/utils";
import { Alert, PageHeader, Stat } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { ResendVerificationButton } from "@/components/auth/resend-verification";
import { DashboardCharts } from "@/components/dashboard/charts";
import { ContinueLearning, RecentTests, RecommendedTests, SavedMaterials, StudyStreak, WeakSubjects } from "@/components/dashboard/sections";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const [user, sp] = await Promise.all([requireUser("/dashboard"), props.searchParams]);
  await touchStudyStreak(user.id);
  const [access, data, examMap] = await Promise.all([getAccess(), getDashboardData(user.id), getExamMap()]);
  const examNames = new Map(Array.from(examMap.values()).map((e) => [e.id, e.short_name]));
  const firstName = user.full_name.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const subscriptionLabel = access.subscriptionActive && access.subscription
    ? getPlan(access.subscription.plan_id).name
    : access.trialActive ? "Free trial" : "Free";

  return (
    <div className="grid gap-6">
      <PageHeader
        title={`Welcome, ${firstName}`}
        description={`${today}${data.profile?.preferred_exam_id && examMap.get(data.profile.preferred_exam_id) ? ` · Preparing for ${examMap.get(data.profile.preferred_exam_id)!.short_name}` : ""}`}
        actions={<ButtonLink href="/mock-tests" size="sm">Take a mock test</ButtonLink>}
      />

      {sp.welcome === "1" && (
        <Alert tone="success" title="Your 30-day free trial has started 🎉">
          Explore books, notes, previous-year papers and mock tests. Your trial ends on {formatDate(access.trialEndsAt)}.
        </Alert>
      )}
      {sp.reset === "1" && <Alert tone="success">Your password has been updated.</Alert>}
      {!user.email_verified && (
        <Alert tone="warning" title="Verify your email address">
          <div className="mt-2"><ResendVerificationButton /></div>
        </Alert>
      )}
      {!access.isAdmin && !access.subscriptionActive && !access.trialActive && (
        <div className="flex flex-col gap-3 rounded-card border border-saffron-200 bg-saffron-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-ink-900">Your trial has ended — premium content is locked</p>
            <p className="mt-0.5 text-sm text-ink-700">Free books, papers and tests stay open. Upgrade from ₹199/month for full access.</p>
          </div>
          <ButtonLink href="/pricing" variant="saffron">Upgrade to Premium</ButtonLink>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Active subscription" value={subscriptionLabel} icon={Crown} tone={access.subscriptionActive ? "forest" : "saffron"}
          hint={access.subscriptionActive && access.subscription ? `Until ${formatDate(access.subscription.ends_at)}` : <Link href="/pricing" className="font-medium text-brand-700 hover:underline">View plans</Link>} />
        {!access.subscriptionActive && !access.isAdmin && (
          <Stat label="Trial days remaining" value={access.trialActive ? access.trialDaysLeft : 0} icon={CalendarClock} tone="saffron"
            hint={access.trialActive ? `Your free trial ends in ${access.trialDaysLeft} ${access.trialDaysLeft === 1 ? "day" : "days"}.` : <Link href="/pricing" className="font-medium text-brand-700 hover:underline">Upgrade now</Link>} />
        )}
        <Stat label="Tests attempted" value={data.testsAttempted} icon={ClipboardCheck} tone="brand" hint={data.inProgress ? "1 in progress" : undefined} />
        <Stat label="Average score" value={`${data.averageScore}%`} icon={Percent} tone="brand" />
        <Stat label="Overall accuracy" value={`${data.overallAccuracy}%`} icon={Target} tone="forest" />
        <Stat label="Study progress" value={`${data.studyProgress}%`} icon={BookOpen} tone="neutral" hint={`${data.continueLearning.length} in progress`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ContinueLearning items={data.continueLearning} inProgress={data.inProgress} />
        <RecommendedTests tests={data.recommendedTests} examNames={examNames} canAccessPremium={access.canAccess("mock_tests")} />
      </div>

      <DashboardCharts
        scoreTrend={data.scoreTrend}
        weeklyActivity={data.weeklyActivity}
        subjects={data.subjectStats.map((s) => ({ label: s.subject.name, value: s.accuracy }))}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <RecentTests attempts={data.recentTests} />
        <div className="grid content-start gap-5">
          <StudyStreak days={data.streakDays} weekly={data.weeklyActivity} />
          <WeakSubjects weak={data.weakSubjects} strong={data.strongSubjects} />
        </div>
        <SavedMaterials items={data.savedMaterials} questionCount={data.bookmarkedQuestionCount} testCount={data.bookmarkedTestCount} />
      </div>
    </div>
  );
}
