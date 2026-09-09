import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBackend } from "@/lib/env";
import { db } from "@/lib/data";
import type { SessionUser, User } from "@/lib/types";
import { parseSessionToken, SESSION_COOKIE } from "./cookie";

/**
 * Resolve the signed-in user for the current request (memoised per request).
 * Returns null for anonymous or blocked users.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const user = await loadUser();
  if (!user || user.is_blocked) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    email_verified: user.email_verified,
  };
});

async function loadUser(): Promise<User | null> {
  if (getBackend() === "demo") {
    const store = await cookies();
    const userId = parseSessionToken(store.get(SESSION_COOKIE)?.value);
    if (!userId) return null;
    return (await db()).getById("users", userId);
  }
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const row = await (await db()).getById("users", data.user.id);
  if (!row) return null;
  return { ...row, email_verified: Boolean(data.user.email_confirmed_at) };
}

/** Server Components / Server Actions: redirect to login when anonymous. */
export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`);
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/dashboard?error=forbidden");
  return user;
}

/** Route Handlers: return a 401/403 Response instead of redirecting. */
export async function apiUser(): Promise<{ user: SessionUser } | { error: Response }> {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: "Authentication required" }, { status: 401 }) };
  return { user };
}

export async function apiAdmin(): Promise<{ user: SessionUser } | { error: Response }> {
  const res = await apiUser();
  if ("error" in res) return res;
  if (res.user.role !== "admin") return { error: Response.json({ error: "Admin access required" }, { status: 403 }) };
  return res;
}
