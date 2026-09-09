import "server-only";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PRIMARY_KEYS, type Row, type TableName } from "@/lib/types";
import { getSeedData, type SeedData } from "@/data/seed";
import { applyOrderAndPage, matches, type Db, type Insert, type Query } from "./query";

/**
 * Zero-config local backend. Data is seeded from src/data/seed and persisted to
 * .data/demo-db.json so changes survive dev-server restarts. Delete that file to reset.
 */

const DATA_DIR = process.env.DEMO_DATA_DIR ?? path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "demo-db.json");
const SEED_VERSION = 3;

interface DemoDatabase extends SeedData {
  __version: number;
}

const g = globalThis as unknown as { __devbhoomiDemoDb?: DemoDatabase; __devbhoomiSaveTimer?: NodeJS.Timeout };

function load(): DemoDatabase {
  if (g.__devbhoomiDemoDb) return g.__devbhoomiDemoDb;
  let db: DemoDatabase | null = null;
  if (existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(readFileSync(DB_FILE, "utf8")) as DemoDatabase;
      if (parsed.__version === SEED_VERSION) db = parsed;
    } catch {
      db = null;
    }
  }
  if (!db) {
    db = { __version: SEED_VERSION, ...structuredClone(getSeedData()) };
    persistNow(db);
  }
  g.__devbhoomiDemoDb = db;
  return db;
}

function persistNow(db: DemoDatabase) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_FILE, JSON.stringify(db));
  } catch (err) {
    console.warn("[demo-store] failed to persist", err);
  }
}

function schedulePersist() {
  if (g.__devbhoomiSaveTimer) clearTimeout(g.__devbhoomiSaveTimer);
  g.__devbhoomiSaveTimer = setTimeout(() => persistNow(load()), 150);
}

function pk<K extends TableName>(table: K): string {
  return (PRIMARY_KEYS[table] as string | undefined) ?? "id";
}

function tableRows<K extends TableName>(table: K): Row<K>[] {
  const db = load();
  const rows = db[table as keyof SeedData] as unknown as Row<K>[] | undefined;
  if (!rows) throw new Error(`Unknown table ${table}`);
  return rows;
}

const clone = <T,>(v: T): T => structuredClone(v);

export const demoDb: Db = {
  async select(table, q) {
    const rows = tableRows(table).filter((r) => matches(r, q));
    return clone(applyOrderAndPage(rows, q));
  },
  async selectOne(table, q) {
    const rows = await this.select(table, { ...q, limit: 1 });
    return rows[0] ?? null;
  },
  async getById(table, id) {
    const key = pk(table);
    const row = tableRows(table).find((r) => (r as unknown as Record<string, unknown>)[key] === id);
    return row ? clone(row) : null;
  },
  async count(table, q) {
    return tableRows(table).filter((r) => matches(r, q)).length;
  },
  async insert(table, row) {
    const key = pk(table);
    const full = { ...(row as object) } as Record<string, unknown>;
    if (key === "id" && !full.id) full.id = randomUUID();
    if (!("created_at" in full) || !full.created_at) full.created_at = new Date().toISOString();
    tableRows(table).push(full as unknown as Row<typeof table>);
    schedulePersist();
    return clone(full as unknown as Row<typeof table>);
  },
  async insertMany(table, rows) {
    const out = [];
    for (const r of rows) out.push(await this.insert(table, r as Insert<typeof table>));
    return out;
  },
  async update(table, id, patch) {
    const key = pk(table);
    const rows = tableRows(table);
    const idx = rows.findIndex((r) => (r as unknown as Record<string, unknown>)[key] === id);
    if (idx === -1) throw new Error(`${table}: row ${id} not found`);
    rows[idx] = { ...rows[idx], ...patch };
    schedulePersist();
    return clone(rows[idx]);
  },
  async upsert(table, row) {
    const key = pk(table);
    const rows = tableRows(table);
    const id = (row as unknown as Record<string, unknown>)[key] as string;
    const idx = rows.findIndex((r) => (r as unknown as Record<string, unknown>)[key] === id);
    if (idx === -1) rows.push(clone(row));
    else rows[idx] = { ...rows[idx], ...row };
    schedulePersist();
    return clone(row);
  },
  async delete(table, id) {
    const key = pk(table);
    const rows = tableRows(table);
    const idx = rows.findIndex((r) => (r as unknown as Record<string, unknown>)[key] === id);
    if (idx !== -1) rows.splice(idx, 1);
    schedulePersist();
  },
  async deleteWhere(table, q) {
    const rows = tableRows(table);
    const keep = rows.filter((r) => !matches(r, q as Query<typeof r>));
    const removed = rows.length - keep.length;
    rows.splice(0, rows.length, ...keep);
    schedulePersist();
    return removed;
  },
};

/** Reset the demo database back to seed data (admin/dev utility). */
export function resetDemoDb() {
  g.__devbhoomiDemoDb = { __version: SEED_VERSION, ...structuredClone(getSeedData()) };
  persistNow(g.__devbhoomiDemoDb);
}
