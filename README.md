# Devbhoomi Prep

A production-ready online learning platform for students preparing for **Uttarakhand competitive government exams** (UKPSC, UKSSSC, Uttarakhand Police, Patwari/Lekhpal, VDO, Forest Guard, Group C, Teaching, UTET and more).

Study materials, notes, previous-year papers, a full online mock-test engine with analytics, a personalised student dashboard, a 30-day free trial, Razorpay subscriptions and a complete admin panel.

## Quick start (zero configuration)

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables set the app runs in **demo mode**: a local JSON database seeded with realistic sample data (persisted to `.data/demo-db.json`), cookie sessions, and a local mail outbox at `/dev/outbox`.

| Account | Email | Password |
|---|---|---|
| Student (trial active) | `student@example.com` | `demo1234` |
| Student (yearly subscriber) | `priya@example.com` | `demo1234` |
| Admin | `admin@devbhoomiprep.in` | `demo1234` |

Delete `.data/demo-db.json` (or use Admin → Settings → Reset demo database) to reseed.

## Production setup

1. Create a Supabase project. Run `supabase/migrations/0001_schema.sql` then `0002_rls.sql` in the SQL editor (or `supabase db push`). Seed the catalogue with `supabase/seed.sql` (regenerate with `npm run seed:sql`).
2. Copy `.env.example` to `.env.local` and fill in Supabase URL / anon key / service-role key, a long `SESSION_SECRET`, and Razorpay key id / secret / webhook secret.
3. Point the Razorpay webhook at `https://<your-domain>/api/payments/webhook` (events: `payment.captured`, `payment.failed`, `refund.processed`).
4. Schedule `GET /api/cron/expire-subscriptions` (header `x-cron-secret: $CRON_SECRET`) daily.
5. Promote your first admin: `update public.users set role = 'admin' where email = '<you>'`.
6. `npm run build && npm start`, or deploy to Vercel.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Recharts · Supabase (Postgres, Auth, Storage) · Razorpay · zod

## Structure

```
src/app            routes: (marketing) public · (auth) · (student) · admin · api
src/lib/types.ts   domain types (mirror of the SQL schema)
src/lib/data       db facade: demo JSON store or Supabase (chosen by env)
src/lib/auth       sessions, sign-up/in, verification, reset (both backends)
src/lib/access.ts  premium access: trial OR subscription, per-feature trial settings
src/lib/services   reusable domain logic (catalog, tests, analytics, payments…)
src/components     ui primitives · layout shells · charts · feature components
src/data/seed      deterministic sample data
supabase/          migrations (schema, RLS, storage bucket) and seed.sql
```

See `CLAUDE.md` for conventions.

## Content policy

Only original, licensed, public-domain or explicitly authorised study material may be uploaded. The platform makes no claims about selection outcomes.
