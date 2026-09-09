"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type ActionResult } from "@/lib/auth/actions";
import { Field, Input, Select } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "./submit-button";
import { PasswordInput } from "./password-input";

const EDUCATION = ["10th Pass", "12th Pass", "Graduate", "Post Graduate", "Diploma / ITI", "Other"];

export function SignupForm({ exams }: { exams: { id: string; name: string }[] }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(signUp, null);
  const fe = state?.fieldErrors ?? {};
  if (state?.ok && state.message) {
    return <Alert tone="success" title="Almost there">{state.message}</Alert>;
  }
  return (
    <form action={action} className="grid gap-4" noValidate>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Full name" htmlFor="full_name" error={fe.full_name}>
        <Input id="full_name" name="full_name" autoComplete="name" placeholder="e.g. Aarav Rawat" required />
      </Field>
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>
      <Field label="Mobile number" htmlFor="mobile" error={fe.mobile} hint="10-digit Indian mobile number">
        <Input id="mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel" placeholder="98370 12345" required />
      </Field>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="At least 8 characters" showStrength minLength={8} />
        {fe.password && <p className="mt-1.5 text-xs text-red-600">{fe.password}</p>}
      </div>
      <div>
        <label htmlFor="confirm_password" className="mb-1.5 block text-sm font-medium text-ink-700">Confirm password</label>
        <PasswordInput id="confirm_password" name="confirm_password" autoComplete="new-password" placeholder="Re-enter password" />
        {fe.confirm_password && <p className="mt-1.5 text-xs text-red-600">{fe.confirm_password}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preferred exam (optional)" htmlFor="preferred_exam_id">
          <Select id="preferred_exam_id" name="preferred_exam_id" defaultValue="">
            <option value="">Select exam</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
        </Field>
        <Field label="Education level (optional)" htmlFor="education_level">
          <Select id="education_level" name="education_level" defaultValue="">
            <option value="">Select level</option>
            {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
          </Select>
        </Field>
      </div>
      <div className="rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
        <span className="font-semibold">Your 30-day free trial starts instantly.</span> No card required.
      </div>
      <SubmitButton>Create account & start free trial</SubmitButton>
      <p className="text-center text-xs text-ink-500">
        By signing up you agree to our <Link href="/terms" className="font-medium text-brand-700 hover:underline">Terms</Link> and{" "}
        <Link href="/privacy-policy" className="font-medium text-brand-700 hover:underline">Privacy Policy</Link>.
      </p>
    </form>
  );
}
