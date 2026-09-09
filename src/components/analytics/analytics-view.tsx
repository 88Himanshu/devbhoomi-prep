"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { StudentAnalytics } from "@/lib/services/analytics";
import { BarsChart, ChartEmpty, ChartFrame, Legend, MultiLineChart, SubjectBars, TrendChart, CHART } from "@/components/charts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AnalyticsView({ data, subjectSlugs }: { data: StudentAnalytics; subjectSlugs: Record<string, string> }) {
  const imp = data.improvement;
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame title="Score history" description="Percentage per attempt, oldest to newest">
          <TrendChart data={data.score_history.map((p) => ({ label: p.label, value: p.value }))} name="Score" />
        </ChartFrame>
        <ChartFrame title="Score vs accuracy" description="Accuracy = correct ÷ attempted">
          <MultiLineChart data={data.score_history.map((p) => ({ label: p.label, score: p.value, accuracy: p.accuracy }))} series={[{ key: "score", name: "Score %" }, { key: "accuracy", name: "Accuracy %" }]} />
        </ChartFrame>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ChartFrame title="Accuracy by subject" description="Across all graded answers; subjects under 60% are flagged">
          <SubjectBars data={data.subject_accuracy.map((s) => ({ label: s.subject.name, value: s.accuracy }))} />
        </ChartFrame>
        <div className="grid gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-semibold text-ink-900">Weak subjects</p>
              <p className="text-xs text-ink-500">Below 60% accuracy with at least 5 questions attempted</p>
              {data.weak_subjects.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">{data.subject_accuracy.length ? "No weak subjects detected. Keep it up." : "Attempt a few tests to find out."}</p>
              ) : (
                <ul className="mt-3 grid gap-2">
                  {data.weak_subjects.map((s) => (
                    <li key={s.subject.id} className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/60 px-3 py-2 text-sm">
                      <span className="font-medium text-ink-900">{s.subject.name} <span className="text-xs text-red-700">{s.accuracy}%</span></span>
                      <span className="flex gap-2 text-xs">
                        <Link href={`/notes?subject=${subjectSlugs[s.subject.id] ?? s.subject.id}`} className="font-medium text-brand-700 hover:underline">Notes</Link>
                        <Link href={`/mock-tests?subject=${s.subject.id}`} className="font-medium text-brand-700 hover:underline">Tests</Link>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm font-semibold text-ink-900">Strong subjects</p>
              <p className="text-xs text-ink-500">75% accuracy or better</p>
              {data.strong_subjects.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">Nothing above 75% yet — consistency comes with practice.</p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {data.strong_subjects.map((s) => <Badge key={s.subject.id} tone="forest">{s.subject.name} · {s.accuracy}%</Badge>)}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame title="Time management" description="Average seconds per question in your last 10 attempts (grey marker = allotted)">
          {data.time_management.length === 0 ? <ChartEmpty height={220} /> : (
            <>
              <BarsChart data={data.time_management.map((t) => ({ label: t.label, value: t.value }))} name="Seconds / question" unit="s" color={CHART.purple} max={Math.max(...data.time_management.map((t) => Math.max(t.value, t.allotted))) + 10} />
              <Legend items={[{ label: `Your pace (allotted ≈ ${data.time_management[data.time_management.length - 1]?.allotted ?? 72}s/question)`, color: CHART.purple }]} />
            </>
          )}
        </ChartFrame>
        <ChartFrame title="Weekly study activity" description="Tests submitted per day, last 14 days">
          <BarsChart data={data.weekly_activity.map((d) => ({ label: d.label.split(" ")[0], value: d.value }))} name="Tests" color={CHART.forest} />
        </ChartFrame>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">Test improvement</p>
            <p className="text-xs text-ink-500">Average of your first {imp?.sample ?? 3} attempts vs your latest {imp?.sample ?? 3}</p>
          </div>
          {imp ? (
            <div className="flex items-center gap-6">
              <div><p className="text-xs text-ink-500">Early</p><p className="text-xl font-bold text-ink-900">{imp.first_avg}%</p></div>
              <div><p className="text-xs text-ink-500">Recent</p><p className="text-xl font-bold text-ink-900">{imp.last_avg}%</p></div>
              <div className={imp.delta > 0 ? "text-forest-700" : imp.delta < 0 ? "text-red-700" : "text-ink-500"}>
                <p className="text-xs">Change</p>
                <p className="flex items-center gap-1 text-xl font-bold">
                  {imp.delta > 0 ? <ArrowUpRight className="h-5 w-5" aria-hidden="true" /> : imp.delta < 0 ? <ArrowDownRight className="h-5 w-5" aria-hidden="true" /> : <Minus className="h-5 w-5" aria-hidden="true" />}
                  {imp.delta > 0 ? "+" : ""}{imp.delta} pts
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-500">Attempt at least 4 tests to track improvement.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
