"use client";

/**
 * Recharts wrappers with the platform palette. Single-measure charts use ONE hue;
 * categorical series use CHART_SERIES in fixed order (validated colorblind-safe).
 * Text always uses ink tokens, never the series colour.
 */
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export const CHART = {
  brand: "#1e4fa3",
  forest: "#1b7f4f",
  saffron: "#b07200",
  purple: "#7c5cbf",
  red: "#b91c1c",
  slate: "#94a3b8",
  grid: "#e2e8f0",
  ink: "#334155",
  muted: "#64748b",
};

/** Fixed categorical order — never cycle or re-assign by rank. */
export const CHART_SERIES = [CHART.brand, CHART.saffron, CHART.purple, CHART.forest, CHART.red];

/** Status colours: correct / incorrect / unattempted (always paired with a label). */
export const STATUS = { correct: CHART.forest, incorrect: CHART.red, unattempted: CHART.slate };

const axisProps = { tick: { fill: CHART.muted, fontSize: 12 }, axisLine: false, tickLine: false } as const;

interface TooltipEntry { dataKey?: string | number; name?: string; value?: number | string; color?: string }
function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: TooltipEntry[]; label?: string | number; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs shadow-card">
      {label !== undefined && <p className="mb-1 font-semibold text-ink-900">{label}</p>}
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center gap-2 text-ink-700">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} aria-hidden="true" />
          {p.name}: <span className="font-semibold text-ink-900">{typeof p.value === "number" ? Math.round(p.value * 10) / 10 : p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
}

export function ChartFrame({ title, description, children, className, aside }: { title?: string; description?: string; children: React.ReactNode; className?: string; aside?: React.ReactNode }) {
  return (
    <div className={cn("rounded-card border border-ink-200 bg-white p-5 shadow-card", className)}>
      {(title || aside) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-ink-900">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </div>
  );
}

export interface Point { label: string; value: number; [key: string]: string | number }

/** Score history / improvement over time (single series line + soft area). */
export function TrendChart({ data, unit = "%", height = 240, name = "Score", color = CHART.brand }: { data: Point[]; unit?: string; height?: number; name?: string; color?: string }) {
  if (!data.length) return <ChartEmpty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={24} />
        <YAxis {...axisProps} domain={[0, 100]} unit={unit} width={48} />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: CHART.slate, strokeDasharray: "3 3" }} />
        <Area type="monotone" dataKey="value" name={name} stroke={color} strokeWidth={2} fill="url(#trendFill)" dot={{ r: 3, fill: "#fff", stroke: color, strokeWidth: 2 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Multi-series line (e.g. score vs accuracy). Max 5 series; fixed colour order. */
export function MultiLineChart({ data, series, height = 240, unit = "%" }: { data: Record<string, string | number>[]; series: { key: string; name: string }[]; height?: number; unit?: string }) {
  if (!data.length) return <ChartEmpty height={height} />;
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" {...axisProps} minTickGap={24} />
          <YAxis {...axisProps} domain={[0, 100]} unit={unit} width={48} />
          <Tooltip content={<ChartTooltip unit={unit} />} />
          {series.slice(0, 5).map((s, i) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={CHART_SERIES[i]} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <Legend items={series.slice(0, 5).map((s, i) => ({ label: s.name, color: CHART_SERIES[i] }))} />
    </div>
  );
}

/** Vertical bars for a single measure across categories (weekly activity, tests per exam). */
export function BarsChart({ data, unit = "", height = 220, name = "Value", color = CHART.brand, max }: { data: Point[]; unit?: string; height?: number; name?: string; color?: string; max?: number }) {
  if (!data.length) return <ChartEmpty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={14} />
        <YAxis {...axisProps} width={48} unit={unit} domain={max ? [0, max] : undefined} allowDecimals={false} />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="value" name={name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bars for subject accuracy. Bars below `threshold` are coloured "serious" and get a label. */
export function SubjectBars({ data, threshold = 60, height, unit = "%" }: { data: Point[]; threshold?: number; height?: number; unit?: string }) {
  if (!data.length) return <ChartEmpty height={height ?? 200} />;
  const h = height ?? Math.max(160, data.length * 36 + 24);
  return (
    <div>
      <ResponsiveContainer width="100%" height={h}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, left: 8, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke={CHART.grid} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} {...axisProps} unit={unit} />
          <YAxis type="category" dataKey="label" {...axisProps} width={120} />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: "#f1f5f9" }} />
          <Bar dataKey="value" name="Accuracy" radius={[0, 4, 4, 0]} maxBarSize={22} label={{ position: "right", fill: CHART.ink, fontSize: 11, formatter: (v: unknown) => `${Math.round(Number(v))}${unit}` }}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.value < threshold ? CHART.red : CHART.brand} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Legend items={[{ label: `≥ ${threshold}${unit} on track`, color: CHART.brand }, { label: `< ${threshold}${unit} needs work`, color: CHART.red }]} />
    </div>
  );
}

/** Donut for attempt breakdown: correct / incorrect / unattempted. */
export function ResultDonut({ correct, incorrect, unattempted, size = 180 }: { correct: number; incorrect: number; unattempted: number; size?: number }) {
  const data = [
    { name: "Correct", value: correct, color: STATUS.correct },
    { name: "Incorrect", value: incorrect, color: STATUS.incorrect },
    { name: "Unattempted", value: unattempted, color: STATUS.unattempted },
  ];
  const total = correct + incorrect + unattempted;
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={size * 0.34} outerRadius={size * 0.46} paddingAngle={2} stroke="#fff" strokeWidth={2}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink-900">{total ? Math.round((correct / total) * 100) : 0}%</span>
          <span className="text-[11px] text-ink-500">correct</span>
        </div>
      </div>
      <ul className="grid gap-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-ink-700">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} aria-hidden="true" />
            {d.name} <span className="ml-auto font-semibold text-ink-900">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} aria-hidden="true" /> {it.label}
        </li>
      ))}
    </ul>
  );
}

export function ChartEmpty({ height = 200, message = "Not enough data yet. Attempt a test to see this chart." }: { height?: number; message?: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50 text-center text-xs text-ink-500" style={{ height }}>
      <p className="max-w-xs px-4">{message}</p>
    </div>
  );
}
