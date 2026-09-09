"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/misc";

type Msg = { raw: string; tone: "success" | "error"; text: string };

function parse(raw: string): Msg {
  const [kind, ...rest] = raw.split(":");
  return { raw, tone: kind === "err" ? "error" : "success", text: rest.join(":") || (kind === "err" ? "Something went wrong" : "Saved") };
}

/** Reads ?toast=ok:Message | err:Message set by server actions after redirect. */
export function Toast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("toast");
  const [msg, setMsg] = useState<Msg | null>(null);
  // Derive state from the URL param (React's "adjust state on prop change" pattern);
  // the message outlives the param so it stays visible after the URL is cleaned.
  if (raw && msg?.raw !== raw) setMsg(parse(raw));

  useEffect(() => {
    if (!raw) return;
    const next = new URLSearchParams(params.toString());
    next.delete("toast");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 6000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;
  return (
    <div className="mb-4">
      <Alert tone={msg.tone}>{msg.text}</Alert>
    </div>
  );
}
