import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { adminDb } from "@/lib/data";
import { PLANS, formatINR } from "@/lib/plans";
import { formatDate } from "@/lib/utils";
import { daysLeft, nowMs, userMap } from "@/lib/admin/queries";
import { manualActivate, manualDeactivate } from "@/lib/admin/students";
import { runExpireLapsed } from "@/lib/admin/billing";
import { sp1 } from "@/lib/admin/helpers";
import { PageHeader, Stat, Table, Td, Th } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/form";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Subscriptions" };

export default async function SubscriptionsAdmin(props: PageProps<"/admin/subscriptions">) {
  const sp = await props.searchParams;
  const tab = sp1(sp.tab) || "active";
  const store = await adminDb();
  const [subs, users] = await Promise.all([store.select("subscriptions", { order: [{ column: "created_at", ascending: false }] }), userMap()]);
  const now = nowMs();
  const lapsed = subs.filter((s) => s.status === "active" && new Date(s.ends_at).getTime() <= now).length;
  const rows = subs.filter((s) => (tab === "active" ? s.status === "active" && new Date(s.ends_at).getTime() > now : tab === "expired" ? s.status === "expired" || (s.status === "active" && new Date(s.ends_at).getTime() <= now) : s.status === "cancelled"));
  const mrr = subs.filter((s) => s.status === "active" && new Date(s.ends_at).getTime() > now).reduce((sum, s) => { const p = PLANS.find((x) => x.id === s.plan_id)!; return sum + (p.price / p.duration_days) * 30; }, 0);
  const tabs = [["active", "Active"], ["expired", "Expired"], ["cancelled", "Cancelled"]] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Premium access from Razorpay payments and manual activations." actions={<form action={runExpireLapsed}><SubmitButton variant="outline" size="sm"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Expire lapsed now{lapsed ? ` (${lapsed})` : ""}</SubmitButton></form>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active subscriptions" value={subs.filter((s) => s.status === "active" && new Date(s.ends_at).getTime() > now).length} tone="forest" />
        <Stat label="Normalised monthly revenue" value={formatINR(Math.round(mrr))} hint="Active plans prorated to 30 days" />
        <Stat label="Manual activations" value={subs.filter((s) => s.source === "manual").length} tone="neutral" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 flex gap-1 rounded-xl bg-ink-100 p-1">
            {tabs.map(([v, l]) => <Link key={v} href={`/admin/subscriptions?tab=${v}`} className={cn("rounded-lg px-3.5 py-2 text-sm font-medium", tab === v ? "bg-white text-brand-800 shadow-card" : "text-ink-500")}>{l}</Link>)}
          </div>
          <Table>
            <thead><tr><Th>Student</Th><Th>Plan</Th><Th>Source</Th><Th>Period</Th><Th>{tab === "active" ? "Days left" : "Status"}</Th><Th className="text-right">Actions</Th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><Td colSpan={6} className="text-center text-ink-500">Nothing here.</Td></tr>}
              {rows.map((s) => {
                const u = users.get(s.user_id);
                return (
                  <tr key={s.id}>
                    <Td>{u ? <Link href={`/admin/students/${u.id}`} className="font-medium text-ink-900 hover:text-brand-700">{u.full_name}</Link> : s.user_id}<span className="block text-xs text-ink-500">{u?.email}</span></Td>
                    <Td className="capitalize">{s.plan_id}</Td>
                    <Td><Badge tone={s.source === "manual" ? "brand" : "neutral"}>{s.source}</Badge>{s.note && <span className="block max-w-40 truncate text-xs text-ink-500" title={s.note}>{s.note}</span>}</Td>
                    <Td className="text-xs">{formatDate(s.starts_at)} → {formatDate(s.ends_at)}</Td>
                    <Td>{tab === "active" ? `${daysLeft(s.ends_at)}d` : <Badge>{s.status}</Badge>}</Td>
                    <Td className="text-right">{tab === "active" && <form action={manualDeactivate}><input type="hidden" name="subscription_id" value={s.id} /><ConfirmButton confirmLabel="Deactivate">Deactivate</ConfirmButton></form>}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
        <Card className="h-fit">
          <CardHeader><CardTitle>Manually activate</CardTitle></CardHeader>
          <CardContent>
            <form action={manualActivate} className="space-y-3">
              <input type="hidden" name="return" value="/admin/subscriptions" />
              <div><Label htmlFor="user_id">Student</Label><Select id="user_id" name="user_id" defaultValue="">
                <option value="">Select a student…</option>
                {Array.from(users.values()).filter((u) => u.role === "student").sort((a, b) => a.full_name.localeCompare(b.full_name)).map((u) => <option key={u.id} value={u.id}>{u.full_name} — {u.email}</option>)}
              </Select></div>
              <div><Label htmlFor="plan_id">Plan</Label><Select id="plan_id" name="plan_id">{PLANS.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.duration_days} days</option>)}</Select></div>
              <div><Label htmlFor="note">Note</Label><Input id="note" name="note" placeholder="Reason (scholarship, offline payment…)" /></div>
              <SubmitButton variant="forest" className="w-full">Activate access</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
