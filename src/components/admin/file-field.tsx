"use client";

import { useRef, useState } from "react";
import { FileUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/form";

/**
 * Uploads via /api/admin/upload (route handler, so large PDFs bypass the server-action
 * body limit) and stores the returned storage key in a hidden input `name`.
 */
export function FileField({ name, label, folder, accept = "application/pdf", initialKey, hint }: {
  name: string; label: string; folder: "books" | "notes" | "papers" | "misc"; accept?: string; initialKey?: string | null; hint?: string;
}) {
  const [key, setKey] = useState<string>(initialKey ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = (await res.json()) as { key?: string; error?: string };
      if (!res.ok || !json.key) throw new Error(json.error ?? "Upload failed");
      setKey(json.key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={key} />
      <div className="flex flex-wrap items-center gap-2">
        <input ref={input} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
        <Button type="button" variant="outline" size="sm" loading={busy} onClick={() => input.current?.click()}>
          <FileUp className="h-4 w-4" aria-hidden="true" /> {key ? "Replace file" : "Upload file"}
        </Button>
        {key && (
          <>
            <a href={`/api/files/${key}`} target="_blank" rel="noreferrer" className="max-w-xs truncate text-sm text-brand-700 underline">{key}</a>
            <button type="button" onClick={() => setKey("")} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label="Remove file"><Trash2 className="h-4 w-4" /></button>
          </>
        )}
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
