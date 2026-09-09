import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PRIMARY_KEYS, type Row, type TableName } from "@/lib/types";
import type { Db, Query } from "./query";

/** Supabase (PostgREST) implementation of the Db facade. */
export function createSupabaseDb(supabase: SupabaseClient): Db {
  // PostgREST typings are generated per-project; we type at the facade boundary instead.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as unknown as { from: (t: string) => any };
  const pk = (table: TableName) => (PRIMARY_KEYS[table] as string | undefined) ?? "id";

  function build<K extends TableName>(table: K, q?: Query<Row<K>>, head = false) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let b: any = client.from(table).select("*", head ? { count: "exact", head: true } : undefined);
    if (!q) return b;
    if (q.eq) for (const [k, v] of Object.entries(q.eq)) b = b.eq(k, v);
    if (q.in) for (const [k, v] of Object.entries(q.in)) b = b.in(k, v as unknown[]);
    if (q.ilike) for (const [k, v] of Object.entries(q.ilike)) b = b.ilike(k, `%${v}%`);
    if (q.gte) for (const [k, v] of Object.entries(q.gte)) b = b.gte(k, v);
    if (q.lte) for (const [k, v] of Object.entries(q.lte)) b = b.lte(k, v);
    if (q.isNull) for (const [k, v] of Object.entries(q.isNull)) b = v ? b.is(k, null) : b.not(k, "is", null);
    if (q.contains) for (const [k, v] of Object.entries(q.contains)) b = b.contains(k, [v]);
    if (q.search && q.search.term.trim()) {
      const term = q.search.term.replace(/[,%()]/g, " ").trim();
      b = b.or(q.search.columns.map((c) => `${String(c)}.ilike.%${term}%`).join(","));
    }
    if (q.order) for (const o of q.order) b = b.order(String(o.column), { ascending: o.ascending !== false });
    if (q.limit !== undefined || q.offset !== undefined) {
      const from = q.offset ?? 0;
      const to = from + (q.limit ?? 1000) - 1;
      b = b.range(from, to);
    }
    return b;
  }

  const unwrap = <T,>(res: { data: T | null; error: { message: string } | null }): T => {
    if (res.error) throw new Error(res.error.message);
    return res.data as T;
  };

  return {
    async select(table, q) {
      return unwrap(await build(table, q));
    },
    async selectOne(table, q) {
      const rows = unwrap<Row<typeof table>[]>(await build(table, { ...q, limit: 1 }));
      return rows[0] ?? null;
    },
    async getById(table, id) {
      const res = await client.from(table).select("*").eq(pk(table), id).maybeSingle();
      return unwrap(res);
    },
    async count(table, q) {
      const res = await build(table, q, true);
      if (res.error) throw new Error(res.error.message);
      return res.count ?? 0;
    },
    async insert(table, row) {
      return unwrap(await client.from(table).insert(row).select("*").single());
    },
    async insertMany(table, rows) {
      if (!rows.length) return [];
      return unwrap(await client.from(table).insert(rows).select("*"));
    },
    async update(table, id, patch) {
      return unwrap(await client.from(table).update(patch).eq(pk(table), id).select("*").single());
    },
    async upsert(table, row) {
      return unwrap(await client.from(table).upsert(row, { onConflict: pk(table) }).select("*").single());
    },
    async delete(table, id) {
      unwrap(await client.from(table).delete().eq(pk(table), id));
    },
    async deleteWhere(table, q) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let b: any = client.from(table).delete({ count: "exact" });
      if (q.eq) for (const [k, v] of Object.entries(q.eq)) b = b.eq(k, v);
      if (q.in) for (const [k, v] of Object.entries(q.in)) b = b.in(k, v as unknown[]);
      const res = await b;
      if (res.error) throw new Error(res.error.message);
      return res.count ?? 0;
    },
  };
}
