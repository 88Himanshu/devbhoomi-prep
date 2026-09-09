"use client";

import { Flame, Target, Trophy } from "lucide-react";
import { SubjectBars, TrendChart, ChartFrame } from "@/components/charts";
import { Progress } from "@/components/ui/misc";

const trend = [
  { label: "Wk 1", value: 46 }, { label: "Wk 2", value: 52 }, { label: "Wk 3", value: 58 },
  { label: "Wk 4", value: 57 }, { label: "Wk 5", value: 66 }, { label: "Wk 6", value: 72 },
];
const subjects = [
  { label: "Uttarakhand GK", value: 81 }, { label: "General Studies", value: 74 }, { label: "Hindi", value: 69 },
  { label: "Mathematics", value: 55 }, { label: "Reasoning", value: 48 },
];

/** Static preview of the student dashboard for the landing page. */
export function DashboardPreview() {
  return (
    <div className="rounded-3xl border border-ink-200 bg-ink-50 p-3 shadow-pop sm:p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Tile icon={Trophy} label="Average score" value="66%" hint="+9% this month" />
        <Tile icon={Target} label="Overall accuracy" value="72%" hint="Last 10 tests" />
        <Tile icon={Flame} label="Study streak" value="12 days" hint="Keep it going" />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <ChartFrame title="Score improvement" description="Weekly average across mock tests">
          <TrendChart data={trend} height={190} />
        </ChartFrame>
        <ChartFrame title="Accuracy by subject" description="Red bars are your weak subjects">
          <SubjectBars data={subjects} height={190} />
        </ChartFrame>
      </div>
      <div className="mt-3 rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-ink-900">Continue learning · Uttarakhand Geography Quick Revision</p>
          <span className="text-xs text-ink-500">Page 42 / 96</span>
        </div>
        <Progress value={44} className="mt-3" tone="forest" />
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, hint }: { icon: typeof Trophy; label: string; value: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-lg font-bold text-ink-900">{value}</p>
        <p className="text-[11px] text-forest-700">{hint}</p>
      </div>
    </div>
  );
}
