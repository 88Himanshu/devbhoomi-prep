import Link from "next/link";
import { BookOpen, ClipboardList, CreditCard, FileQuestion, Sparkles, UserPlus, Users, Wallet } from "lucide-react";
import { adminDb } from "@/lib/data";
import { formatINR } from "@/lib/plans";
import { formatDate, formatNumber } from "@/lib/utils";
import { Stat, Table, Td, Th, PageHeader } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BarsChart, ChartFrame } from "@/components/charts";
import { ADMIN_NAV } from "@/components/admin/nav";


export const metadata = { title: "Admin overview" };

export default async function AdminOverview() {
  const store = await adminDb();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const [users, profiles, subs, payments, attemptsWeek, books, notes, questions, tests] = await Promise.all([
    store.select("users"),
    store.select("profiles"),
    store.select("subscriptions", { eq: { status: "active" } }),
    store.select("payments", { order: [{ column: "created_at", ascending: false }] }),
    store.count("test_attempts", { eq: { status: "submitted" }, gte: { created_at: weekAgo } }),
    store.count("books"), store.count("notes"), store.count("questions"), store.count("mock_tests"),
  ]);
  const umap = new Map(users.map((u) => [u.id, u]));
  const students = users.filter((u) => u.role === "student");
  const newThisWeek = students.filter((u) => u.created_at >= weekAgo).length;
  const activeTrials = profiles.filter((p) => new Date(p.trial_ends_at) > now && umap.get(p.user_id)?.role === "student").length;
  const activeSubs = subs.filter((s) => new Date(s.ends_at) > now).length;
  const paid = payments.filter((p) => p.status === "paid");
  const revenueMonth = paid.filter((p) => (p.paid_at ?? p.created_at) >= monthStart).reduce((s, p) => s + p.amount, 0) / 100;

  // Signups per day (last 14 days)
  const signups = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getTime() - (13 - i) * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value: students.filter((u) => u.created_at.slice(0, 10) === key).length };
  });
  // Revenue per month (last 6 months)
  const revenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }), value: paid.filter((p) => (p.paid_at ?? p.created_at).slice(0, 7) === key).reduce((s, p) => s + p.amount, 0) / 100 };
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Overview" description="Platform health at a glance." actions={<ButtonLink href="/admin/questions/import" size="sm" variant="secondary">Bulk import questions</ButtonLink>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Students" value={formatNumber(students.length)} hint={`+${newThisWeek} this week`} icon={Users} />
        <Stat label="Active trials" value={formatNumber(activeTrials)} icon={Sparkles} tone="saffron" />
        <Stat label="Active subscriptions" value={formatNumber(activeSubs)} icon={Wallet} tone="forest" />
        <Stat label="Revenue this month" value={formatINR(revenueMonth)} hint={`${paid.length} paid payments total`} icon={CreditCard} tone="forest" />
        <Stat label="Tests attempted (7d)" value={formatNumber(attemptsWeek)} icon={ClipboardList} />
        <Stat label="Study materials" value={formatNumber(books + notes)} hint={`${books} books · ${notes} notes`} icon={BookOpen} tone="neutral" />
        <Stat label="Questions in bank" value={formatNumber(questions)} icon={FileQuestion} tone="neutral" />
        <Stat label="Mock tests" value={formatNumber(tests)} icon={ClipboardList} tone="neutral" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame title="New student signups" description="Last 14 days"><BarsChart data={signups} name="Signups" height={200} /></ChartFrame>
        <ChartFrame title="Revenue" description="Paid Razorpay payments per month, ₹"><BarsChart data={revenue} name="Revenue" color="#1b7f4f" height={200} /></ChartFrame>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent payments</CardTitle><Link href="/admin/payments" className="text-sm font-medium text-brand-700">View all</Link></CardHeader>
          <CardContent className="px-0 pb-0">
            <Table className="min-w-0">
              <thead><tr><Th>Student</Th><Th>Plan</Th><Th>Amount</Th><Th>Status</Th></tr></thead>
              <tbody>
                {payments.slice(0, 6).map((p) => (
                  <tr key={p.id}>
                    <Td><span className="font-medium text-ink-900">{umap.get(p.user_id)?.full_name ?? "—"}</span><span className="block text-xs text-ink-500">{formatDate(p.created_at)}</span></Td>
                    <Td className="capitalize">{p.plan_id}</Td>
                    <Td>{formatINR(p.amount / 100)}</Td>
                    <Td><Badge tone={p.status === "paid" ? "forest" : p.status === "failed" ? "red" : "neutral"}>{p.status}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent signups</CardTitle><Link href="/admin/students" className="text-sm font-medium text-brand-700">View all</Link></CardHeader>
          <CardContent>
            <ul className="divide-y divide-ink-100">
              {students.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 6).map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span><Link href={`/admin/students/${u.id}`} className="font-medium text-ink-900 hover:text-brand-700">{u.full_name}</Link><span className="block text-xs text-ink-500">{u.email}</span></span>
                  <span className="flex items-center gap-1 text-xs text-ink-500"><UserPlus className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(u.created_at)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Quick links</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {ADMIN_NAV.filter((n) => !n.exact).map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-800"><Icon className="h-4 w-4 text-ink-500" aria-hidden="true" />{label}</Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
