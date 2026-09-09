"use client";

import { useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/misc";
import type { ActionState } from "@/lib/admin/helpers";

/**
 * Form wrapper around useActionState. Children are uncontrolled inputs rendered by the
 * server; on validation errors the form re-renders in place so typed values are kept.
 */
export function ActionForm({ action, children, submitLabel = "Save", className, secondary, variant = "primary" }: {
  action: (prev: ActionState | null, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  secondary?: ReactNode;
  variant?: "primary" | "danger" | "forest" | "outline" | "saffron";
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const errors = state?.fieldErrors ? Object.entries(state.fieldErrors) : [];
  return (
    <form action={formAction} className={className}>
      {state?.error && <Alert tone="error" className="mb-4">{state.error}</Alert>}
      {state?.message && state.ok && <Alert tone="success" className="mb-4">{state.message}</Alert>}
      {errors.length > 0 && (
        <Alert tone="error" title="Please fix the following" className="mb-4">
          <ul className="list-disc pl-4">
            {errors.map(([k, v]) => <li key={k}><span className="font-medium">{k.replace(/_/g, " ")}</span>: {v}</li>)}
          </ul>
        </Alert>
      )}
      {children}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending} variant={variant}>{submitLabel}</Button>
        {secondary}
      </div>
    </form>
  );
}

export function FieldErr({ state, name }: { state: ActionState | null; name: string }) {
  const msg = state?.fieldErrors?.[name];
  return msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null;
}
