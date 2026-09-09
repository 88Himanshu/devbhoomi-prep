import { NextResponse, type NextRequest } from "next/server";
import { getBackend } from "@/lib/env";
import { adminDb } from "@/lib/data";
import { startTrialProfile } from "@/lib/auth/actions";

/**
 * Supabase Auth redirect target (email verification, magic links, password reset).
 * Exchanges the PKCE code for a session, ensures the trial profile exists, then redirects.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/dashboard";

  if (getBackend() === "demo" || !code) {
    return NextResponse.redirect(new URL(code ? next : "/login?error=auth", request.url));
  }

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url));
  }
  const store = await adminDb();
  const profile = await store.getById("profiles", data.user.id);
  if (!profile) await startTrialProfile(data.user.id);
  return NextResponse.redirect(new URL(next, request.url));
}
