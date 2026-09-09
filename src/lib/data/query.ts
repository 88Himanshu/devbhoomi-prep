import type { Row, TableName } from "@/lib/types";

/**
 * Backend-agnostic query description. Both the demo (JSON) store and the
 * Supabase adapter implement exactly this surface, so all domain code is
 * written once against `Db`.
 */
export interface Query<T> {
  /** Equality filters (AND). */
  eq?: Partial<T>;
  /** `column IN (...)` filters (AND). */
  in?: { [K in keyof T]?: T[K][] };
  /** Case-insensitive substring match per column (AND). */
  ilike?: { [K in keyof T]?: string };
  gte?: Partial<T>;
  lte?: Partial<T>;
  /** `column IS NULL` / `IS NOT NULL` */
  isNull?: { [K in keyof T]?: boolean };
  /** Array column contains value (Postgres `@>`), e.g. exam_ids contains 'exam_ukpsc'. */
  contains?: { [K in keyof T]?: unknown };
  /** Case-insensitive search term across several columns (OR). */
  search?: { columns: (keyof T)[]; term: string };
  order?: { column: keyof T; ascending?: boolean }[];
  limit?: number;
  offset?: number;
}

export type Insert<K extends TableName> = Omit<Row<K>, "id" | "created_at"> &
  Partial<Pick<Row<K>, Extract<"id" | "created_at", keyof Row<K>>>>;

export interface Db {
  select<K extends TableName>(table: K, q?: Query<Row<K>>): Promise<Row<K>[]>;
  selectOne<K extends TableName>(table: K, q: Query<Row<K>>): Promise<Row<K> | null>;
  getById<K extends TableName>(table: K, id: string): Promise<Row<K> | null>;
  count<K extends TableName>(table: K, q?: Query<Row<K>>): Promise<number>;
  insert<K extends TableName>(table: K, row: Insert<K>): Promise<Row<K>>;
  insertMany<K extends TableName>(table: K, rows: Insert<K>[]): Promise<Row<K>[]>;
  update<K extends TableName>(table: K, id: string, patch: Partial<Row<K>>): Promise<Row<K>>;
  /** Insert or replace by primary key (used for profiles/settings and idempotent writes). */
  upsert<K extends TableName>(table: K, row: Row<K>): Promise<Row<K>>;
  delete<K extends TableName>(table: K, id: string): Promise<void>;
  deleteWhere<K extends TableName>(table: K, q: Query<Row<K>>): Promise<number>;
}

/** Evaluate a Query against an in-memory row (shared by demo store and tests). */
export function matches<T extends object>(row: T, q?: Query<T>): boolean {
  if (!q) return true;
  const r = row as Record<string, unknown>;
  if (q.eq) for (const [k, v] of Object.entries(q.eq)) if (r[k] !== v) return false;
  if (q.in) for (const [k, arr] of Object.entries(q.in)) if (!(arr as unknown[]).includes(r[k])) return false;
  if (q.ilike)
    for (const [k, v] of Object.entries(q.ilike))
      if (!String(r[k] ?? "").toLowerCase().includes(String(v).toLowerCase())) return false;
  if (q.gte) for (const [k, v] of Object.entries(q.gte)) if (!((r[k] as never) >= (v as never))) return false;
  if (q.lte) for (const [k, v] of Object.entries(q.lte)) if (!((r[k] as never) <= (v as never))) return false;
  if (q.isNull)
    for (const [k, v] of Object.entries(q.isNull)) {
      const isNull = r[k] === null || r[k] === undefined;
      if (isNull !== v) return false;
    }
  if (q.contains)
    for (const [k, v] of Object.entries(q.contains)) {
      const col = r[k];
      if (!Array.isArray(col) || !col.includes(v)) return false;
    }
  if (q.search && q.search.term.trim()) {
    const term = q.search.term.toLowerCase();
    const hit = q.search.columns.some((c) => String(r[c as string] ?? "").toLowerCase().includes(term));
    if (!hit) return false;
  }
  return true;
}

export function applyOrderAndPage<T extends object>(rows: T[], q?: Query<T>): T[] {
  let out = rows;
  if (q?.order?.length) {
    const orders = q.order;
    out = [...out].sort((a, b) => {
      for (const o of orders) {
        const av = (a as Record<string, unknown>)[o.column as string] as never;
        const bv = (b as Record<string, unknown>)[o.column as string] as never;
        if (av === bv) continue;
        const cmp = av > bv ? 1 : -1;
        return o.ascending === false ? -cmp : cmp;
      }
      return 0;
    });
  }
  const offset = q?.offset ?? 0;
  if (offset) out = out.slice(offset);
  if (q?.limit !== undefined) out = out.slice(0, q.limit);
  return out;
}
