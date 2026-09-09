import { notFound } from "next/navigation";
import { adminDb } from "@/lib/data";
import { getSessionUser } from "@/lib/auth/session";
import { PLANS, formatINR } from "@/lib/plans";
import { formatDate, formatDateTime } from "@/lib/utils";
import { daysLeft, nowMs } from "@/lib/admin/queries";
import { extendTrial, manualActivate, manualDeactivate, setBlocked, setRole } from "@/lib/admin/students";
import { Breadcrumbs, Stat, Table, Td, Th, Avatar } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/form";
import { ConfirmButton, SubmitButton } from "@/components/admin/confirm-button";
import { KeyValue } from "@/components/admin/shared";

export default async function StudentDetail(props: PageProps<"/admin/students/[id]">) {
  const { id } = await props.params;
  const me = await getSessionUser();
  const store = await adminDb();
  const user = await store.getById("users", id);
  if (!user) notFound();
  const [profile, subs, payments, attempts, bookmarks, exams] = await Promise.all([
    store.getById("profiles", id),
    store.select("subscriptions", { eq: { user_id: id }, order: [{ column: "created_at", ascending: false }] }),
    store.select("payments", { eq: { user_id: id }, order: [{ column: "created_at", ascending: false }] }),
    store.select("test_attempts", { eq: { user_id: id, status: "submitted" }, order: [{ column: "created_at", ascending: false }] }),
    store.count("bookmarks", { eq: { user_id: id } }),
    store.select("exams"),
  ]);
  const now = nowMs();
  const active = subs.find((s) => s.status === "active" && new Date(s.ends_at).getTime() > now) ?? null;
  const trialActive = profile ? new Date(profile.trial_ends_at).getTime() > now : false;
  const avg = attempts.length ? attempts.reduce((s, a) => s + Number(a.percentage), 0) / attempts.length : 0;
  const ret = `/admin/students/${id}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Students", href: "/admin/students" }, { label: user.full_name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.full_name} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-ink-900">{user.full_name}</h1>
            <p className="text-sm text-ink-500">{user.email} · {user.mobile ?? "no mobile"} · joined {formatDate(user.created_at)}</p>
            <div className="mt-1.5 flex gap-1.5">
              <Badge tone={user.role === "admin" ? "brand" : "neutral"} className="capitalize">{user.role}</Badge>
              {user.is_blocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="forest">Active</Badge>}
              {user.email_verified ? <Badge tone="outline">Email verified</Badge> : <Badge tone="saffron">Email unverified</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.role !== "admin" && (
            <form action={setBlocked}>
              <input type="hidden" name="user_id" value={id} /><input type="hidden" name="blocked" value={user.is_blocked ? "0" : "1"} />
              <ConfirmButton variant={user.is_blocked ? "outline" : "danger"} confirmLabel={user.is_blocked ? "Yes, unblock" : "Yes, block"}>{user.is_blocked ? "Unblock user" : "Block user"}</ConfirmButton>
            </form>
          )}
          {me?.id !== id && (
            <form action={setRole}>
              <input type="hidden" name="user_id" value={id} /><input type="hidden" name="role" value={user.role === "admin" ? "student" : "admin"} />
              <ConfirmButton variant="outline" confirmLabel="Confirm">{user.role === "admin" ? "Demote to student" : "Make admin"}</ConfirmButton>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Tests attempted" value={attempts.length} />
        <Stat label="Average score" value={`${avg.toFixed(1)}%`} />
        <Stat label="Bookmarks" value={bookmarks} tone="neutral" />
        <Stat label="Study streak" value={`${profile?.study_streak_days ?? 0} days`} tone="saffron" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profile & trial</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <KeyValue items={[
              { label: "Preferred exam", value: exams.find((e) => e.id === profile?.preferred_exam_id)?.short_name ?? "—" },
              { label: "Education", value: profile?.education_level ?? "—" },
              { label: "Trial started", value: formatDate(profile?.trial_started_at) },
              { label: "Trial ends", value: profile ? <span>{formatDate(profile.trial_ends_at)} {trialActive ? <Badge tone="saffron">{daysLeft(profile.trial_ends_at)}d left</Badge> : <Badge>Ended</Badge>}</span> : "—" },
              { label: "Last active", value: profile?.last_active_date ?? "—" },
            ]} />
            <form action={extendTrial} className="flex items-end gap-2">
              <input type="hidden" name="user_id" value={id} />
              <div><Label htmlFor="days">Extend trial by (days)</Label><Input id="days" name="days" type="number" defaultValue={7} min={-365} max={365} className="w-32" /></div>
              <SubmitButton variant="secondary">Extend trial</SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Subscription</CardTitle>{active ? <Badge tone="forest">Active</Badge> : <Badge>None active</Badge>}</CardHeader>
          <CardContent className="space-y-5">
            {active && (
              <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-sm">
                <p className="font-semibold capitalize text-forest-900">{active.plan_id} plan · {active.source}</p>
                <p className="text-forest-800">{formatDate(active.starts_at)} → {formatDate(active.ends_at)} ({daysLeft(active.ends_at)} days left)</p>
                {active.note && <p className="mt-1 text-xs text-forest-700">Note: {active.note}</p>}
                <form action={manualDeactivate} className="mt-3">
                  <input type="hidden" name="subscription_id" value={active.id} /><input type="hidden" name="return" value={ret} />
                  <ConfirmButton confirmLabel="Yes, deactivate">Deactivate access</ConfirmButton>
                </form>
              </div>
            )}
            <form action={manualActivate} className="grid gap-3 rounded-xl border border-ink-200 p-4">
              <p className="text-sm font-semibold text-ink-900">Manually activate a plan</p>
              <input type="hidden" name="user_id" value={id} /><input type="hidden" name="return" value={ret} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label htmlFor="plan_id">Plan</Label><Select id="plan_id" name="plan_id">{PLANS.map((p) => <option key={p.id} value={p.id}>{p.name} – {formatINR(p.price)}</option>)}</Select></div>
                <div><Label htmlFor="note">Note</Label><Input id="note" name="note" placeholder="e.g. Scholarship, offline payment" /></div>
              </div>
              <p className="text-xs text-ink-500">{active ? "The new period starts when the current one ends." : "Access starts immediately."}</p>
              <div><SubmitButton variant="forest" size="sm">Activate</SubmitButton></div>
            </form>
            {subs.length > 0 && (
              <Table className="min-w-0"><thead><tr><Th>Plan</Th><Th>Source</Th><Th>Period</Th><Th>Status</Th></tr></thead>
                <tbody>{subs.map((s) => <tr key={s.id}><Td className="capitalize">{s.plan_id}</Td><Td>{s.source}</Td><Td>{formatDate(s.starts_at)} – {formatDate(s.ends_at)}</Td><Td><Badge tone={s.status === "active" ? "forest" : "neutral"}>{s.status}</Badge></Td></tr>)}</tbody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
        <CardContent className="px-0 pb-0">
          <Table><thead><tr><Th>Date</Th><Th>Plan</Th><Th>Amount</Th><Th>Method</Th><Th>Razorpay</Th><Th>Status</Th><Th>Invoice</Th></tr></thead>
            <tbody>
              {payments.length === 0 && <tr><Td colSpan={7} className="text-center text-ink-500">No payments</Td></tr>}
              {payments.map((p) => <tr key={p.id}><Td>{formatDateTime(p.created_at)}</Td><Td className="capitalize">{p.plan_id}</Td><Td>{formatINR(p.amount / 100)}</Td><Td>{p.method ?? "—"}</Td><Td className="font-mono text-xs">{p.razorpay_payment_id ?? p.razorpay_order_id ?? "—"}</Td><Td><Badge tone={p.status === "paid" ? "forest" : p.status === "failed" ? "red" : "neutral"}>{p.status}</Badge></Td><Td>{p.invoice_number ?? "—"}</Td></tr>)}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent test attempts</CardTitle></CardHeader>
        <CardContent className="px-0 pb-0">
          <Table><thead><tr><Th>Test</Th><Th>Date</Th><Th>Score</Th><Th>Accuracy</Th><Th>Correct / Wrong / Skipped</Th></tr></thead>
            <tbody>
              {attempts.length === 0 && <tr><Td colSpan={5} className="text-center text-ink-500">No attempts yet</Td></tr>}
              {attempts.slice(0, 10).map((a) => <tr key={a.id}><Td className="font-medium text-ink-900">{a.title}</Td><Td>{formatDate(a.submitted_at)}</Td><Td>{a.score} / {a.total_marks} ({a.percentage}%)</Td><Td>{a.accuracy}%</Td><Td>{a.correct} / {a.incorrect} / {a.unattempted}</Td></tr>)}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
