#!/usr/bin/env node
/**
 * Builds the static showcase site (GitHub Pages) without touching the full app.
 *
 *  1. Temporarily moves server-only routes out of src/app (API, auth, student, admin, proxy).
 *  2. Overlays static-site/src/** onto src/** (client-side filtered lists, notice pages, static header…),
 *     backing up any file it replaces.
 *  3. Runs `next build` with output: "export" (see next.config.ts) into ./out.
 *  4. Restores everything, even if the build fails.
 *
 * Usage: npm run build:static            (basePath "" – for local preview)
 *        NEXT_PUBLIC_BASE_PATH=/devbhoomi-prep npm run build:static   (GitHub Pages)
 */
import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const app = path.join(root, "src");
const overlay = path.join(root, "static-site/src");
const backup = path.join(root, ".static-backup");

/** Server-dependent routes that do not exist on the static site. */
const EXCLUDE = [
  "src/app/api",
  "src/app/(auth)",
  "src/app/(student)",
  "src/app/admin",
  "src/app/auth",
  "src/app/checkout",
  "src/app/dev",
  "src/app/tests",
  "src/app/(marketing)/contact/actions.ts",
  "src/app/(marketing)/contact/contact-form.tsx",
  "src/proxy.ts",
];

const moved = []; // [from, to]
function moveAway(rel) {
  const from = path.join(root, rel);
  if (!existsSync(from)) return;
  const to = path.join(backup, rel);
  mkdirSync(path.dirname(to), { recursive: true });
  renameSync(from, to);
  moved.push([from, to]);
}

const overlaid = []; // files copied in (to delete on restore)
function overlayDir(src, dest) {
  for (const entry of readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    if (statSync(s).isDirectory()) {
      mkdirSync(d, { recursive: true });
      overlayDir(s, d);
    } else {
      if (existsSync(d)) moveAway(path.relative(root, d));
      cpSync(s, d);
      overlaid.push(d);
    }
  }
}

function restore() {
  for (const f of overlaid) rmSync(f, { force: true });
  for (const [from, to] of moved.reverse()) {
    mkdirSync(path.dirname(from), { recursive: true });
    renameSync(to, from);
  }
  rmSync(backup, { recursive: true, force: true });
  // remove empty dirs the overlay may have created
  for (const f of overlaid) {
    let dir = path.dirname(f);
    while (dir.startsWith(app) && dir !== app && existsSync(dir) && readdirSync(dir).length === 0) {
      rmSync(dir, { recursive: true });
      dir = path.dirname(dir);
    }
  }
}

if (existsSync(backup)) {
  console.error("Found a stale .static-backup directory from an interrupted run. Restore it manually before building.");
  process.exit(1);
}

let code = 1;
try {
  for (const rel of EXCLUDE) moveAway(rel);
  if (existsSync(overlay)) overlayDir(overlay, app);
  rmSync(path.join(root, "out"), { recursive: true, force: true });
  // Stale route types from a previous `next dev` reference routes that are excluded here.
  rmSync(path.join(root, ".next/dev/types"), { recursive: true, force: true });
  rmSync(path.join(root, ".next/types"), { recursive: true, force: true });
  const env = {
    ...process.env,
    NEXT_PUBLIC_STATIC_SITE: "1",
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4173",
    DEMO_DATA_DIR: path.join(root, ".static-backup-data"),
  };
  const res = spawnSync("npx", ["next", "build"], { stdio: "inherit", env, cwd: root });
  code = res.status ?? 1;
  if (code === 0) {
    writeFileSync(path.join(root, "out", ".nojekyll"), "");
    console.log("\nStatic site written to ./out");
  }
} finally {
  restore();
  rmSync(path.join(root, ".static-backup-data"), { recursive: true, force: true });
}
process.exit(code);
