"use client";

import { useState, useTransition } from "react";
import { resendVerification } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function ResendVerificationButton({ size = "sm", variant = "outline" }: { size?: "sm" | "md"; variant?: "outline" | "primary" }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        size={size}
        variant={variant}
        loading={pending}
        onClick={() => start(async () => { const r = await resendVerification(); setMsg(r.message ?? r.error ?? null); })}
      >
        Resend verification email
      </Button>
      {msg && <span className="text-xs text-ink-700">{msg}</span>}
    </div>
  );
}
