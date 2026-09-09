"use client";

import { BarsChart, ChartFrame, SubjectBars, TrendChart } from "@/components/charts";

export function DashboardCharts({ scoreTrend, weeklyActivity, subjects }: {
  scoreTrend: { label: string; value: number }[];
  weeklyActivity: { label: string; value: number }[];
  subjects: { label: string; value: number }[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ChartFrame title="Score improvement" description="Percentage score across your last 10 tests">
        <TrendChart data={scoreTrend} name="Score" />
      </ChartFrame>
      <ChartFrame title="Weekly study activity" description="Tests submitted and materials studied per day">
        <BarsChart data={weeklyActivity} name="Activities" color="#1b7f4f" />
      </ChartFrame>
      <ChartFrame title="Subject performance" description="Accuracy per subject from recent tests" className="lg:col-span-2">
        <SubjectBars data={subjects} />
      </ChartFrame>
    </div>
  );
}
