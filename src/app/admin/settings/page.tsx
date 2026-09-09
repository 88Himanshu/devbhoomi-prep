import Link from "next/link";
import { adminDb } from "@/lib/data";
import { getBackend, isDemoMode, isRazorpayConfigured } from "@/lib/env";
import { DEFAULT_TRIAL } from "@/lib/access";
import type { TrialSettings } from "@/lib/types";
import { resetDemoDatabase, saveSiteSettings, saveTrialSettings } from "@/lib/admin/cms";
import { PageHeader, Alert } from "@/components/ui/misc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/form";
import { ActionForm } from "@/components/admin/action-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { KeyValue, Toggle } from "@/components/admin/shared";

export const metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  const store = await adminDb();
  const [trialRow, siteRow] = await Promise.all([store.getById("settings", "trial"), store.getById("settings", "site")]);
  const trial: TrialSettings = { ...DEFAULT_TRIAL, ...((trialRow?.value as Partial<TrialSettings>) ?? {}) };
  const site = (siteRow?.value ?? {}) as Record<string, string>;
  const features: { key: keyof Omit<TrialSettings, "trial_days">; label: string; hint: string }[] = [
    { key: "books", label: "Premium books", hint: "Read & download premium books" },
    { key: "notes", label: "Premium notes", hint: "Read & download premium notes" },
    { key: "papers", label: "Premium previous-year papers", hint: "View, download and attempt" },
    { key: "mock_tests", label: "Premium mock tests", hint: "Attempt premium tests" },
    { key: "solutions", label: "Detailed solutions", hint: "Explanations after a test" },
    { key: "analytics", label: "Performance analytics", hint: "Charts & weak-subject insights" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Free-trial policy, support details and environment." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Free trial</CardTitle></CardHeader>
          <CardContent>
            <ActionForm action={saveTrialSettings} submitLabel="Save trial settings">
              <Field label="Trial length (days)" htmlFor="trial_days" hint="Applies to new sign-ups; existing trials keep their end date."><Input id="trial_days" name="trial_days" type="number" min={0} max={365} defaultValue={trial.trial_days} className="w-32" /></Field>
              <p className="mb-2 mt-4 text-sm font-medium text-ink-700">Premium features unlocked during the trial</p>
              <div className="grid gap-2">
                {features.map((f) => <Toggle key={f.key} name={f.key} label={f.label} hint={f.hint} defaultChecked={trial[f.key]} />)}
              </div>
            </ActionForm>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Support & contact</CardTitle></CardHeader>
            <CardContent>
              <ActionForm action={saveSiteSettings} submitLabel="Save site settings">
                <div className="space-y-3">
                  <Field label="Support email" htmlFor="support_email"><Input id="support_email" name="support_email" type="email" defaultValue={site.support_email ?? ""} /></Field>
                  <Field label="Support phone" htmlFor="support_phone"><Input id="support_phone" name="support_phone" defaultValue={site.support_phone ?? ""} /></Field>
                  <Field label="Address" htmlFor="address"><Input id="address" name="address" defaultValue={site.address ?? ""} /></Field>
                </div>
              </ActionForm>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Environment</CardTitle><Badge tone={isDemoMode() ? "saffron" : "forest"}>{getBackend()} mode</Badge></CardHeader>
            <CardContent className="space-y-4">
              <KeyValue items={[
                { label: "Database", value: isDemoMode() ? "Local JSON (.data/demo-db.json)" : "Supabase Postgres" },
                { label: "Auth", value: isDemoMode() ? "Signed cookie sessions" : "Supabase Auth" },
                { label: "Razorpay", value: isRazorpayConfigured() ? "Live keys configured" : "Sandbox (simulated checkout)" },
              ]} />
              {isDemoMode() && (
                <>
                  <Alert tone="info">Demo mode: verification and reset emails are written to <Link href="/dev/outbox" className="underline">/dev/outbox</Link>. Set Supabase keys in <code>.env.local</code> for production.</Alert>
                  <form action={resetDemoDatabase}><ConfirmButton confirmLabel="Yes, reset everything">Reset demo database</ConfirmButton><p className="mt-2 text-xs text-ink-500">Discards all changes and reloads the seed data.</p></form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
