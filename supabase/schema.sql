create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  focus text,
  main_cue text,
  plan_json jsonb not null default '{}'::jsonb,
  booking_link text,
  created_at timestamptz not null default now()
);

create table if not exists public.magic_links (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.completion_reports (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  magic_link_id uuid references public.magic_links(id) on delete set null,
  completed boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists students_coach_id_idx on public.students(coach_id);
create index if not exists plans_coach_id_idx on public.plans(coach_id);
create index if not exists plans_student_id_idx on public.plans(student_id);
create index if not exists magic_links_token_hash_idx on public.magic_links(token_hash);
create index if not exists magic_links_plan_id_idx on public.magic_links(plan_id);
create index if not exists completion_reports_plan_id_idx on public.completion_reports(plan_id);

alter table public.students enable row level security;
alter table public.plans enable row level security;
alter table public.magic_links enable row level security;
alter table public.completion_reports enable row level security;

drop policy if exists "Coaches manage own students" on public.students;
create policy "Coaches manage own students"
  on public.students
  for all
  to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

drop policy if exists "Coaches manage own plans" on public.plans;
create policy "Coaches manage own plans"
  on public.plans
  for all
  to authenticated
  using (coach_id = auth.uid())
  with check (
    coach_id = auth.uid()
    and exists (
      select 1
      from public.students
      where students.id = plans.student_id
        and students.coach_id = auth.uid()
    )
  );

drop policy if exists "Coaches read own magic links" on public.magic_links;
create policy "Coaches read own magic links"
  on public.magic_links
  for select
  to authenticated
  using (coach_id = auth.uid());

drop policy if exists "Coaches read own completion reports" on public.completion_reports;
create policy "Coaches read own completion reports"
  on public.completion_reports
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.plans
      where plans.id = completion_reports.plan_id
        and plans.coach_id = auth.uid()
    )
  );
