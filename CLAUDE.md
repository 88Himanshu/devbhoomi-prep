@AGENTS.md

# Devbhoomi Prep — project conventions

Uttarakhand competitive-exam preparation platform. Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4, Recharts, Supabase, Razorpay.

## Run
- `npm run dev` → http://localhost:3000 in **demo mode** (no env needed). Demo accounts: `student@example.com` / `admin@devbhoomiprep.in`, password `demo1234`.
- Demo data persists to `.data/demo-db.json`; delete it (or POST /api/admin/reset in dev) to reseed. Demo emails: `/dev/outbox`.
- Production: copy `.env.example` → `.env.local`, run `supabase/migrations/*.sql`, seed with `npm run seed:sql`.
- Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Architecture (read before adding features)
- `src/lib/types.ts` — all domain types + `Tables` map. **Single source of truth.** Mirrors `supabase/migrations/0001_schema.sql`.
- `src/lib/data` — `db()` (user-scoped, RLS) and `adminDb()` (service role). Query facade in `query.ts`; never import `@supabase/*` from feature code.
- `src/lib/auth/session.ts` — `getSessionUser()`, `requireUser()`, `requireAdmin()`, `apiUser()`, `apiAdmin()`.
- `src/lib/auth/actions.ts` — sign-up / sign-in / sign-out / forgot / reset / verify (server actions for both backends).
- `src/lib/access.ts` — `getAccess()` → `AccessState` (`isPremium`, `canAccess(feature)`, trial days), `apiRequirePremium(feature)`. **Enforce premium on the server (page + API), then mirror in UI with `<PremiumLock/>` / `<PremiumBadge/>`.**
- `src/lib/services/*` — reusable reads/writes (catalog, bookmarks, subscriptions, tests…). Put cross-page logic here, not in pages.
- `src/lib/storage.ts` — `putObject/getObject/fileUrl` (local `.data/uploads` or Supabase Storage). Files are served via `/api/files/[...key]` with access checks.
- `src/lib/plans.ts` — pricing plans (static config).
- `src/components/ui` — Button, ButtonLink, Card*, Badge/PremiumBadge, Input/Select/Field, Progress, Stat, Alert, EmptyState, PremiumLock, Avatar, Tabs, Dialog, Table/Th/Td, Container, PageHeader, SectionHeading, Breadcrumbs.
- `src/components/layout` — SiteHeader/SiteFooter (marketing + student), AppShell sidebar, MobileBottomNav (students, mobile), TrialSidebarCard.
- `src/components/charts` — Recharts wrappers (use these; don't hand-roll chart colours).

## Routes
- `(marketing)` public pages with header/footer: `/`, `/exams`, `/exams/[slug]`, `/books`, `/notes`, `/previous-year-papers`, `/mock-tests`, `/pricing`, `/search`, legal pages.
- `(auth)` centered card: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`.
- `(student)` requires login, sidebar shell: `/dashboard`, `/analytics`, `/bookmarks`, `/profile`, `/tests/*`.
- `/admin/*` requires admin role. `/api/*` route handlers return JSON; use `apiUser()/apiAdmin()/apiRequirePremium()`.

## Rules
- Next 16: `params`/`searchParams`/`cookies()` are async. Use `PageProps<'/route'>` helpers. `proxy.ts` (not middleware) does optimistic redirects only.
- Validate every mutation with zod. Never trust client-side payment status; Razorpay is verified in `/api/payments/verify` + webhook.
- Only original/licensed/public-domain material; no copyrighted commercial books. No "100% selection"-style claims.
- Design: white base, deep blue (`brand-*`), forest green (`forest-*`), restrained saffron accent. Rounded cards, subtle shadows, minimal animation.
- Mobile first; everything must work at 360px width.
