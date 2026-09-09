"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/auth/actions";
import { updateProfile, changePassword } from "./actions";
import { Field, Input, Select } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";

const EDUCATION = ["10th Pass", "12th Pass", "Graduate", "Post Graduate", "Diploma / ITI", "Other"];

export function ProfileForm({ defaults, exams }: {
  defaults: { full_name: string; email: string; mobile: string; preferred_exam_id: string; education_level: string };
  exams: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateProfile, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-4" noValidate>
      {state?.ok && state.message && <Alert tone="success">{state.message}</Alert>}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="full_name" error={fe.full_name}>
          <Input id="full_name" name="full_name" defaultValue={defaults.full_name} autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="email" hint="Contact support to change your email">
          <Input id="email" value={defaults.email} disabled readOnly />
        </Field>
        <Field label="Mobile number" htmlFor="mobile" error={fe.mobile}>
          <Input id="mobile" name="mobile" type="tel" defaultValue={defaults.mobile} autoComplete="tel" />
        </Field>
        <Field label="Preferred exam" htmlFor="preferred_exam_id" error={fe.preferred_exam_id}>
          <Select id="preferred_exam_id" name="preferred_exam_id" defaultValue={defaults.preferred_exam_id}>
            <option value="">Not set</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
        </Field>
        <Field label="Education level" htmlFor="education_level" error={fe.education_level}>
          <Select id="education_level" name="education_level" defaultValue={defaults.education_level}>
            <option value="">Not set</option>
            {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
          </Select>
        </Field>
      </div>
      <div><Button type="submit" loading={pending}>Save changes</Button></div>
    </form>
  );
}

export function ChangePasswordForm({ demo }: { demo: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(changePassword, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-4" noValidate>
      {state?.ok && state.message && <Alert tone="success">{state.message}</Alert>}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {demo && (
        <div>
          <label htmlFor="current_password" className="mb-1.5 block text-sm font-medium text-ink-700">Current password</label>
          <PasswordInput id="current_password" name="current_password" autoComplete="current-password" placeholder="Current password" />
          {fe.current_password && <p className="mt-1.5 text-xs text-red-600">{fe.current_password}</p>}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">New password</label>
          <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="At least 8 characters" showStrength minLength={8} />
          {fe.password && <p className="mt-1.5 text-xs text-red-600">{fe.password}</p>}
        </div>
        <div>
          <label htmlFor="confirm_password" className="mb-1.5 block text-sm font-medium text-ink-700">Confirm new password</label>
          <PasswordInput id="confirm_password" name="confirm_password" autoComplete="new-password" placeholder="Re-enter password" />
          {fe.confirm_password && <p className="mt-1.5 text-xs text-red-600">{fe.confirm_password}</p>}
        </div>
      </div>
      <div><Button type="submit" variant="outline" loading={pending}>Change password</Button></div>
    </form>
  );
}
