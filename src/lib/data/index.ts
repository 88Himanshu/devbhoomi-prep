import "server-only";
import { getBackend } from "@/lib/env";
import type { Db } from "./query";

export type { Db, Query, Insert } from "./query";

/**
 * User-scoped database (RLS applies in Supabase mode).
 * Use `adminDb()` for trusted server work: webhooks, admin mutations, cross-user analytics.
 */
export async function db(): Promise<Db> {
  if (getBackend() === "demo") {
    const { demoDb } = await import("./demo-store");
    return demoDb;
  }
  const [{ createSupabaseDb }, { createSupabaseServerClient }] = await Promise.all([
    import("./supabase-db"),
    import("@/lib/supabase/server"),
  ]);
  return createSupabaseDb(await createSupabaseServerClient());
}

export async function adminDb(): Promise<Db> {
  if (getBackend() === "demo") {
    const { demoDb } = await import("./demo-store");
    return demoDb;
  }
  const [{ createSupabaseDb }, { createSupabaseAdminClient }] = await Promise.all([
    import("./supabase-db"),
    import("@/lib/supabase/server"),
  ]);
  return createSupabaseDb(createSupabaseAdminClient());
}
