-- Devbhoomi Prep — core schema
-- Run with: supabase db push   (or paste into the Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users & profiles
-- public.users mirrors auth.users (id, email) and carries app-level fields.
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null unique,
  full_name       text not null default '',
  mobile          text,
  role            text not null default 'student' check (role in ('student','admin')),
  is_blocked      boolean not null default false,
  email_verified  boolean not null default false,
  created_at      timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id            uuid primary key references public.users(id) on delete cascade,
  preferred_exam_id  text,
  education_level    text,
  trial_started_at   timestamptz not null default now(),
  trial_ends_at      timestamptz not null default now() + interval '30 days',
  study_streak_days  int not null default 0,
  last_active_date   date,
  updated_at         timestamptz not null default now()
);

-- Mirror new auth users into public.users and start a trial profile.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare trial_days int := coalesce((select (value->>'trial_days')::int from public.settings where key = 'trial'), 30);
begin
  insert into public.users (id, email, full_name, mobile, email_verified)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'mobile', new.email_confirmed_at is not null)
  on conflict (id) do nothing;
  insert into public.profiles (user_id, trial_started_at, trial_ends_at)
  values (new.id, now(), now() + make_interval(days => trial_days))
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.sync_email_verified() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.users set email_verified = (new.email_confirmed_at is not null), email = new.email where id = new.id;
  return new;
end $$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated after update on auth.users
  for each row execute function public.sync_email_verified();

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table if not exists public.subjects (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  icon        text not null default 'BookOpen',
  sort_order  int not null default 0
);

create table if not exists public.exams (
  id                      text primary key default gen_random_uuid()::text,
  slug                    text not null unique,
  name                    text not null,
  short_name              text not null,
  conducting_body         text not null,
  category                text not null,
  tagline                 text not null default '',
  overview                text not null default '',
  eligibility             jsonb not null default '[]',
  syllabus                jsonb not null default '[]',
  exam_pattern            jsonb not null default '[]',
  study_plan              jsonb not null default '[]',
  important_question_ids  jsonb not null default '[]',
  icon                    text not null default 'Landmark',
  is_featured             boolean not null default false,
  is_active               boolean not null default true,
  sort_order              int not null default 0,
  created_at              timestamptz not null default now()
);

-- books and notes share one shape (see Material in src/lib/types.ts)
create table if not exists public.books (
  id              text primary key default gen_random_uuid()::text,
  kind            text not null default 'book' check (kind = 'book'),
  slug            text not null unique,
  title           text not null,
  description     text not null default '',
  subject_id      text not null references public.subjects(id),
  exam_ids        text[] not null default '{}',
  author          text not null default '',
  language        text not null default 'en' check (language in ('en','hi','bilingual')),
  year            int not null default extract(year from now()),
  pages           int not null default 0,
  file_path       text,
  preview_path    text,
  cover_color     text not null default '#0B3D91',
  source_license  text not null default 'original' check (source_license in ('original','licensed','public_domain','authorized')),
  is_premium      boolean not null default false,
  is_published    boolean not null default true,
  is_featured     boolean not null default false,
  downloads       int not null default 0,
  views           int not null default 0,
  created_at      timestamptz not null default now()
);

create table if not exists public.notes (like public.books including all);
alter table public.notes alter column kind set default 'note';
alter table public.notes drop constraint if exists books_kind_check;
alter table public.notes add constraint notes_kind_check check (kind = 'note');
alter table public.notes add constraint notes_subject_fk foreign key (subject_id) references public.subjects(id);

create table if not exists public.previous_year_papers (
  id                text primary key default gen_random_uuid()::text,
  exam_id           text not null references public.exams(id) on delete cascade,
  subject_id        text references public.subjects(id),
  year              int not null,
  paper_type        text not null default 'prelims' check (paper_type in ('prelims','mains','screening','written','other')),
  title             text not null,
  total_questions   int not null default 0,
  duration_minutes  int,
  language          text not null default 'bilingual',
  file_path         text,
  mock_test_id      text,
  is_premium        boolean not null default false,
  is_published      boolean not null default true,
  downloads         int not null default 0,
  created_at        timestamptz not null default now()
);

-- Question bank. Options are stored inline (A–D) because every exam in scope
-- is 4-option MCQ; this keeps CSV import, test delivery and grading single-table.
create table if not exists public.questions (
  id              text primary key default gen_random_uuid()::text,
  text            text not null,
  option_a        text not null,
  option_b        text not null,
  option_c        text not null,
  option_d        text not null,
  correct_option  char(1) not null check (correct_option in ('A','B','C','D')),
  explanation     text not null default '',
  subject_id      text not null references public.subjects(id),
  exam_id         text references public.exams(id) on delete set null,
  year            int,
  difficulty      text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  marks           numeric(5,2) not null default 1,
  negative_marks  numeric(5,2) not null default 0.25,
  language        text not null default 'en',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists public.mock_tests (
  id                text primary key default gen_random_uuid()::text,
  slug              text not null unique,
  title             text not null,
  description       text not null default '',
  exam_id           text not null references public.exams(id) on delete cascade,
  subject_id        text references public.subjects(id),
  difficulty        text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  duration_minutes  int not null default 60,
  total_marks       numeric(7,2) not null default 0,
  negative_marks    numeric(5,2) not null default 0.25,
  question_count    int not null default 0,
  is_premium        boolean not null default false,
  is_published      boolean not null default true,
  is_pyp            boolean not null default false,
  attempts_count    int not null default 0,
  created_at        timestamptz not null default now()
);

create table if not exists public.mock_test_questions (
  id            text primary key default gen_random_uuid()::text,
  mock_test_id  text not null references public.mock_tests(id) on delete cascade,
  question_id   text not null references public.questions(id) on delete cascade,
  sort_order    int not null default 0,
  unique (mock_test_id, question_id)
);

-- ---------------------------------------------------------------------------
-- Student activity
-- ---------------------------------------------------------------------------
create table if not exists public.test_attempts (
  id                  text primary key default gen_random_uuid()::text,
  user_id             uuid not null references public.users(id) on delete cascade,
  mock_test_id        text references public.mock_tests(id) on delete set null,
  title               text not null,
  exam_id             text not null,
  subject_id          text,
  status              text not null default 'in_progress' check (status in ('in_progress','submitted')),
  question_ids        jsonb not null default '[]',
  config              jsonb,
  duration_minutes    int not null,
  started_at          timestamptz not null default now(),
  submitted_at        timestamptz,
  time_taken_seconds  int,
  total_questions     int not null default 0,
  attempted           int not null default 0,
  correct             int not null default 0,
  incorrect           int not null default 0,
  unattempted         int not null default 0,
  score               numeric(7,2) not null default 0,
  total_marks         numeric(7,2) not null default 0,
  percentage          numeric(5,2) not null default 0,
  accuracy            numeric(5,2) not null default 0,
  percentile          numeric(5,2),
  created_at          timestamptz not null default now()
);

create table if not exists public.test_answers (
  id                  text primary key default gen_random_uuid()::text,
  attempt_id          text not null references public.test_attempts(id) on delete cascade,
  question_id         text not null references public.questions(id) on delete cascade,
  selected_option     char(1) check (selected_option in ('A','B','C','D')),
  is_correct          boolean,
  marked_for_review   boolean not null default false,
  time_spent_seconds  int not null default 0,
  updated_at          timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table if not exists public.bookmarks (
  id          text primary key default gen_random_uuid()::text,
  user_id     uuid not null references public.users(id) on delete cascade,
  item_type   text not null check (item_type in ('book','note','question','mock_test')),
  item_id     text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create table if not exists public.study_progress (
  id                text primary key default gen_random_uuid()::text,
  user_id           uuid not null references public.users(id) on delete cascade,
  item_type         text not null check (item_type in ('book','note','exam')),
  item_id           text not null,
  progress_percent  int not null default 0 check (progress_percent between 0 and 100),
  last_position     int,
  seconds_spent     int not null default 0,
  updated_at        timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

-- ---------------------------------------------------------------------------
-- Billing
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id                    text primary key default gen_random_uuid()::text,
  user_id               uuid not null references public.users(id) on delete cascade,
  plan_id               text not null check (plan_id in ('monthly','quarterly','yearly')),
  amount                int not null,             -- paise
  currency              text not null default 'INR',
  receipt               text not null,
  razorpay_order_id     text unique,
  razorpay_payment_id   text unique,
  razorpay_signature    text,
  status                text not null default 'created' check (status in ('created','paid','failed','refunded')),
  method                text,
  failure_reason        text,
  refund_status         text,
  invoice_number        text unique,
  paid_at               timestamptz,
  created_at            timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id          text primary key default gen_random_uuid()::text,
  user_id     uuid not null references public.users(id) on delete cascade,
  plan_id     text not null check (plan_id in ('monthly','quarterly','yearly')),
  status      text not null default 'active' check (status in ('active','expired','cancelled')),
  source      text not null default 'razorpay' check (source in ('razorpay','manual')),
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz not null,
  payment_id  text references public.payments(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CMS
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id          text primary key default gen_random_uuid()::text,
  type        text not null default 'announcement' check (type in ('banner','announcement')),
  title       text not null,
  body        text not null default '',
  link_url    text,
  link_label  text,
  is_active   boolean not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.settings (
  key         text primary key,
  value       jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_books_subject on public.books(subject_id);
create index if not exists idx_books_exam_ids on public.books using gin(exam_ids);
create index if not exists idx_books_search on public.books using gin(to_tsvector('simple', title || ' ' || description));
create index if not exists idx_notes_subject on public.notes(subject_id);
create index if not exists idx_notes_exam_ids on public.notes using gin(exam_ids);
create index if not exists idx_papers_exam_year on public.previous_year_papers(exam_id, year desc);
create index if not exists idx_questions_subject on public.questions(subject_id, difficulty);
create index if not exists idx_questions_exam on public.questions(exam_id);
create index if not exists idx_mtq_test on public.mock_test_questions(mock_test_id, sort_order);
create index if not exists idx_mock_tests_exam on public.mock_tests(exam_id, is_published);
create index if not exists idx_attempts_user on public.test_attempts(user_id, created_at desc);
create index if not exists idx_attempts_test on public.test_attempts(mock_test_id, status);
create index if not exists idx_answers_attempt on public.test_answers(attempt_id);
create index if not exists idx_bookmarks_user on public.bookmarks(user_id, item_type);
create index if not exists idx_progress_user on public.study_progress(user_id, updated_at desc);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id, status, ends_at desc);
create index if not exists idx_payments_user on public.payments(user_id, created_at desc);
create index if not exists idx_announcements_active on public.announcements(is_active, type);
