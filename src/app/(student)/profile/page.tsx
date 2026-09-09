import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Crown, KeyRound, LogOut, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAccess } from "@/lib/access";
import { signOut } from "@/lib/auth/actions";
import { isDemoMode } from "@/lib/env";
import { db } from "@/lib/data";
import { getExams } from "@/lib/services/catalog";
import { getPlan, formatINR } from "@/lib/plans";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader, Progress, Table, Td, Th } from "@/components/ui/misc";
import { ProfileForm, ChangePasswordForm } from "./forms";

export const metadata: Metadata = { title: "Profile & subscription", robots: { index: false } };

const paymentTone = (s: string) => (s === "paid" ? "forest" : s === "failed" ? "red" : s === "refunded" ? "saffron" : "neutral") as "forest" | "red" | "saffron" | "neutral";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const store = await db();
  const [access, exams, userRow, profile, payments, subscriptions] = await Promise.all([
    getAccess(),
    getExams(),
    store.getById("users", user.id),
    store.getById("profiles", user.id),
    store.select("payments", { eq: { user_id: user.id }, order: [{ column: "created_at", ascending: false }] }),
    store.select("subscriptions", { eq: { user_id: user.id }, order: [{ column: "created_at", ascending: false }] }),
  ]);
  const sub = access.subscription;
  const plan = sub ? getPlan(sub.plan_id) : null;
  const now = new Date();
  const daysLeft = sub ? Math.max(0, Math.ceil((new Date(sub.ends_at).getTime() - now.getTime()) / 86_400_000)) : 0;

  return (
    <div className="grid gap-6">
      <PageHeader title="Profile & subscription" description="Manage your details, plan and payment history." />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2"><UserRound className="h-4 w-4 text-brand-700" aria-hidden="true" /> Your details</CardTitle>
              <CardDescription>Member since {formatDate(userRow?.created_at)} · {user.email_verified ? "Email verified" : "Email not verified"}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaults={{
                full_name: user.full_name,
                email: user.email,
                mobile: userRow?.mobile ?? "",
                preferred_exam_id: profile?.preferred_exam_id ?? "",
                education_level: profile?.education_level ?? "",
              }}
              exams={exams.map((e) => ({ id: e.id, name: e.name }))}
            />
          </CardContent>
        </Card>

        <Card className={access.subscriptionActive ? "border-forest-200" : access.trialActive ? "border-saffron-200" : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Crown className="h-4 w-4 text-brand-700" aria-hidden="true" /> Subscription</CardTitle>
            {access.isAdmin ? <Badge tone="brand">Admin</Badge> : access.subscriptionActive ? <Badge tone="forest">Active</Badge> : access.trialActive ? <Badge tone="saffron">Free trial</Badge> : <Badge>Free plan</Badge>}
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            {access.isAdmin && <p className="text-ink-700">Admin accounts have full access to all content.</p>}
            {!access.isAdmin && sub && plan && (
              <>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <dt className="text-ink-500">Plan</dt><dd className="font-semibold text-ink-900">{plan.name} · {formatINR(plan.price)}</dd>
                  <dt className="text-ink-500">Started</dt><dd className="text-ink-900">{formatDate(sub.starts_at)}</dd>
                  <dt className="text-ink-500">Ends on</dt><dd className="text-ink-900">{formatDate(sub.ends_at)}</dd>
                  <dt className="text-ink-500">Days left</dt><dd className="text-ink-900">{daysLeft}</dd>
                  <dt className="text-ink-500">Source</dt><dd className="text-ink-900 capitalize">{sub.source === "manual" ? "Activated by admin" : "Razorpay"}</dd>
                </dl>
                <Progress value={100 - (daysLeft / plan.duration_days) * 100} tone="forest" label="Subscription period used" />
                <p className="text-xs text-ink-500">Premium ends automatically on {formatDate(sub.ends_at)}. Extend anytime — new time is added after the current period.</p>
                <ButtonLink href="/pricing" variant="outline" size="sm">Extend subscription</ButtonLink>
              </>
            )}
            {!access.isAdmin && !sub && access.trialActive && (
              <>
                <p className="font-semibold text-ink-900">Your free trial ends in {access.trialDaysLeft} {access.trialDaysLeft === 1 ? "day" : "days"}.</p>
                <p className="text-ink-700">Trial started {formatDate(profile?.trial_started_at)} · ends {formatDate(access.trialEndsAt)}. Upgrade to keep premium access after that.</p>
                <ButtonLink href="/pricing" variant="saffron" size="sm">Upgrade to Premium</ButtonLink>
              </>
            )}
            {!access.isAdmin && !sub && !access.trialActive && (
              <>
                <p className="font-semibold text-ink-900">No active subscription</p>
                <p className="text-ink-700">Your free trial ended on {formatDate(access.trialEndsAt)}. Free content remains available; premium books, papers and tests are locked.</p>
                <ButtonLink href="/pricing" size="sm">See plans from ₹199/month</ButtonLink>
              </>
            )}
            {subscriptions.filter((s) => s.id !== sub?.id).length > 0 && (
              <details className="text-xs text-ink-500">
                <summary className="cursor-pointer font-medium">Past subscriptions</summary>
                <ul className="mt-2 space-y-1">
                  {subscriptions.filter((s) => s.id !== sub?.id).map((s) => (
                    <li key={s.id}>{getPlan(s.plan_id).name} · {formatDate(s.starts_at)} – {formatDate(s.ends_at)} · <span className="capitalize">{s.status}</span></li>
                  ))}
                </ul>
              </details>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-brand-700" aria-hidden="true" /> Payment history</CardTitle>
            <CardDescription>Receipts for every transaction on your account.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-ink-500">No payments yet.</p>
          ) : (
            <Table>
              <thead>
                <tr><Th>Date</Th><Th>Plan</Th><Th>Amount</Th><Th>Status</Th><Th>Method</Th><Th>Invoice</Th><Th className="text-right">Receipt</Th></tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <Td>{formatDateTime(p.paid_at ?? p.created_at)}</Td>
                    <Td>{getPlan(p.plan_id).name}</Td>
                    <Td className="font-semibold text-ink-900">{formatINR(p.amount / 100)}</Td>
                    <Td><Badge tone={paymentTone(p.status)} className="capitalize">{p.status}</Badge>{p.refund_status && <span className="ml-1 text-xs text-ink-500">({p.refund_status})</span>}</Td>
                    <Td className="uppercase">{p.method ?? "—"}</Td>
                    <Td>{p.invoice_number ?? "—"}</Td>
                    <Td className="text-right">{p.status === "paid" || p.status === "refunded" ? <Link href={`/profile/receipt/${p.id}`} className="font-semibold text-brand-700 hover:underline">View</Link> : <span className="text-ink-500">—</span>}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-brand-700" aria-hidden="true" /> Change password</CardTitle>
          </CardHeader>
          <CardContent><ChangePasswordForm demo={isDemoMode()} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><LogOut className="h-4 w-4 text-brand-700" aria-hidden="true" /> Session</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm text-ink-700">
            <p>Sign out of Devbhoomi Prep on this device.</p>
            <form action={signOut}><Button type="submit" variant="outline">Sign out</Button></form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
