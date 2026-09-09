"use client";

import { useActionState } from "react";
import { resetPassword, type ActionResult } from "@/lib/auth/actions";
import { Alert } from "@/components/ui/misc";
import { SubmitButton } from "./submit-button";
import { PasswordInput } from "./password-input";

export function ResetPasswordForm({ token }: { token?: string }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(resetPassword, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-4" noValidate>
      {token && <input type="hidden" name="token" value={token} />}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
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
      <SubmitButton>Set new password</SubmitButton>
    </form>
  );
}
