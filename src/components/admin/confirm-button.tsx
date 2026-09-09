"use client";

import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Two-step destructive action inside a <form action={serverAction}>.
 * First click reveals Confirm / Cancel; Confirm submits the form.
 */
export function ConfirmButton({ children, confirmLabel = "Confirm", variant = "danger", size = "sm", ...props }: ButtonProps & { confirmLabel?: string; children: ReactNode }) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();
  if (!armed) {
    return (
      <Button type="button" variant={variant} size={size} onClick={() => setArmed(true)} {...props}>
        {children}
      </Button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <Button type="submit" variant={variant} size={size} loading={pending}>{confirmLabel}</Button>
      <Button type="button" variant="ghost" size={size} onClick={() => setArmed(false)}>Cancel</Button>
    </span>
  );
}

export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending} {...props}>{children}</Button>;
}
