"use client";

import { useState } from "react";
import { Textarea, Label } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export function JsonField({ name, label, initial, example, rows = 10, hint }: { name: string; label: string; initial: unknown; example: string; rows?: number; hint?: string }) {
  const [value, setValue] = useState(() => JSON.stringify(initial ?? [], null, 2));
  const [err, setErr] = useState<string | null>(null);
  function format() {
    try { setValue(JSON.stringify(JSON.parse(value), null, 2)); setErr(null); } catch (e) { setErr(e instanceof Error ? e.message : "Invalid JSON"); }
  }
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label className="mb-0">{label}</Label>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setValue(example)}>Insert example</Button>
          <Button type="button" variant="ghost" size="sm" onClick={format}>Format</Button>
        </div>
      </div>
      <Textarea name={name} value={value} onChange={(e) => setValue(e.target.value)} rows={rows} className="font-mono text-xs" spellCheck={false} />
      {hint && !err && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
      {err && <p className="mt-1.5 text-xs text-red-600">{err}</p>}
    </div>
  );
}
