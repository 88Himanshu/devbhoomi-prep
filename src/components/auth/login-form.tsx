"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type ActionResult } from "@/lib/auth/actions";
import { Field, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "./submit-button";
import { PasswordInput } from "./password-input";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(signIn, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Email" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-ink-700">Password</label>
          <Link href="/forgot-password" className="text-xs font-medium text-brand-700 hover:underline">Forgot password?</Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Your password" />
        {fe.password && <p className="mt-1.5 text-xs text-red-600">{fe.password}</p>}
      </div>
      <SubmitButton>Log in</SubmitButton>
      <p className="text-center text-xs text-ink-500">You stay signed in on this device for 30 days.</p>
    </form>
  );
}
