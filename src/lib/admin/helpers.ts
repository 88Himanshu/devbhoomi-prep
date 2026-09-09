import "server-only";
import { redirect } from "next/navigation";
import type { z } from "zod";

export interface ActionState {
  ok: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const toastUrl = (path: string, kind: "ok" | "err", msg: string) =>
  `${path}${path.includes("?") ? "&" : "?"}toast=${encodeURIComponent(`${kind}:${msg}`)}`;

export function toastRedirect(path: string, kind: "ok" | "err", msg: string): never {
  redirect(toastUrl(path, kind, msg));
}

export function zodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.length ? issue.path.map(String).join(".") : "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const fail = (fieldErrors: Record<string, string>): ActionState => ({ ok: false, fieldErrors });
export const failMsg = (error: string): ActionState => ({ ok: false, error });

/* FormData readers */
export const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export const opt = (fd: FormData, k: string) => (str(fd, k) ? str(fd, k) : null);
export const num = (fd: FormData, k: string, fallback = 0) => { const v = Number(str(fd, k)); return Number.isFinite(v) && str(fd, k) !== "" ? v : fallback; };
export const optNum = (fd: FormData, k: string) => (str(fd, k) === "" ? null : Number(str(fd, k)));
export const bool = (fd: FormData, k: string) => { const v = fd.get(k); return v === "on" || v === "true" || v === "1"; };
export const list = (fd: FormData, k: string) => fd.getAll(k).map(String).filter(Boolean);
export const lines = (fd: FormData, k: string) => str(fd, k).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
export const csvList = (fd: FormData, k: string) => str(fd, k).split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

export function json<T>(fd: FormData, k: string, schema: z.ZodType<T>): { ok: true; value: T } | { ok: false; error: string } {
  const raw = str(fd, k);
  if (!raw) return { ok: true, value: schema.parse([]) };
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch (e) { return { ok: false, error: `Invalid JSON: ${e instanceof Error ? e.message : ""}` }; }
  const res = schema.safeParse(parsed);
  if (!res.success) return { ok: false, error: res.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).slice(0, 3).join("; ") };
  return { ok: true, value: res.data };
}

export const pageParams = (sp: Record<string, string | string[] | undefined>, size = 20) => {
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  return { page, pageSize: size, offset: (page - 1) * size };
};

export const sp1 = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
