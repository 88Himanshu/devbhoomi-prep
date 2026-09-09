"use client";

import { useActionState } from "react";
import { forgotPassword, type ActionResult } from "@/lib/auth/actions";
import { Field, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "./submit-button";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<ActionResult | null, FormData>(forgotPassword, null);
  if (state?.ok) return <Alert tone="success" title="Check your email">{state.message}</Alert>;
  return (
    <form action={action} className="grid gap-4" noValidate>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Email" htmlFor="email" error={state?.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>
      <SubmitButton>Send reset link</SubmitButton>
    </form>
  );
}
