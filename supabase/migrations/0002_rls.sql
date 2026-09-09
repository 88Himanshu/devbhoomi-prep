-- Row Level Security. Admin writes go through the service-role key (bypasses RLS)
-- from server code guarded by requireAdmin(); students only touch their own rows.

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.exams enable row level security;
alter table public.books enable row level security;
alter table public.notes enable row level security;
alter table public.previous_year_papers enable row level security;
alter table public.questions enable row level security;
alter table public.mock_tests enable row level security;
alter table public.mock_test_questions enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_answers enable row level security;
alter table public.bookmarks enable row level security;
alter table public.study_progress enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.announcements enable row level security;
alter table public.settings enable row level security;

-- Own-row access
create policy "users: read own or admin" on public.users for select using (id = auth.uid() or public.is_admin());
create policy "users: update own name" on public.users for update using (id = auth.uid()) with check (id = auth.uid() and role = 'student');
create policy "profiles: own" on public.profiles for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

-- Public catalogue (published rows readable by everyone; premium gating is enforced in app code)
create policy "subjects: public read" on public.subjects for select using (true);
create policy "exams: public read" on public.exams for select using (is_active or public.is_admin());
create policy "books: public read" on public.books for select using (is_published or public.is_admin());
create policy "notes: public read" on public.notes for select using (is_published or public.is_admin());
create policy "papers: public read" on public.previous_year_papers for select using (is_published or public.is_admin());
create policy "mock_tests: public read" on public.mock_tests for select using (is_published or public.is_admin());
create policy "mtq: auth read" on public.mock_test_questions for select using (auth.uid() is not null);
create policy "questions: auth read" on public.questions for select using (auth.uid() is not null);
create policy "announcements: public read" on public.announcements for select using (is_active or public.is_admin());
create policy "settings: public read" on public.settings for select using (true);

-- Admin catalogue writes
create policy "subjects: admin write" on public.subjects for all using (public.is_admin()) with check (public.is_admin());
create policy "exams: admin write" on public.exams for all using (public.is_admin()) with check (public.is_admin());
create policy "books: admin write" on public.books for all using (public.is_admin()) with check (public.is_admin());
create policy "notes: admin write" on public.notes for all using (public.is_admin()) with check (public.is_admin());
create policy "papers: admin write" on public.previous_year_papers for all using (public.is_admin()) with check (public.is_admin());
create policy "questions: admin write" on public.questions for all using (public.is_admin()) with check (public.is_admin());
create policy "mock_tests: admin write" on public.mock_tests for all using (public.is_admin()) with check (public.is_admin());
create policy "mtq: admin write" on public.mock_test_questions for all using (public.is_admin()) with check (public.is_admin());
create policy "announcements: admin write" on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy "settings: admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- Student activity
create policy "attempts: own" on public.test_attempts for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());
create policy "answers: own" on public.test_answers for all
  using (exists (select 1 from public.test_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.test_attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "bookmarks: own" on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progress: own" on public.study_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Billing: read-only for students; all writes come from the service role (verified server-side)
create policy "payments: read own" on public.payments for select using (user_id = auth.uid() or public.is_admin());
create policy "subscriptions: read own" on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());

-- Storage bucket for materials (private; files served through /api/files with access checks)
insert into storage.buckets (id, name, public) values ('materials', 'materials', false) on conflict (id) do nothing;
create policy "materials: admin manage" on storage.objects for all
  using (bucket_id = 'materials' and public.is_admin()) with check (bucket_id = 'materials' and public.is_admin());
