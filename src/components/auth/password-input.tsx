"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

function strength(pw: string): { score: number; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  const label = pw.length === 0 ? "" : s <= 1 ? "Weak" : s <= 3 ? "Fair" : "Strong";
  return { score: Math.min(s, 4), label };
}

export function PasswordInput({ id, name, placeholder, autoComplete, showStrength, minLength }: {
  id: string; name: string; placeholder?: string; autoComplete?: string; showStrength?: boolean; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  const st = strength(value);
  const tone = st.score <= 1 ? "bg-red-500" : st.score <= 3 ? "bg-saffron-500" : "bg-forest-500";
  return (
    <div>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className="pr-11"
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-500 hover:text-ink-900"
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1 flex-1 rounded-full bg-ink-100", i < st.score && tone)} />
            ))}
          </div>
          <p className="mt-1 text-xs text-ink-500">
            {st.label} · use 8+ characters with a mix of letters, numbers and symbols
          </p>
        </div>
      )}
    </div>
  );
}
