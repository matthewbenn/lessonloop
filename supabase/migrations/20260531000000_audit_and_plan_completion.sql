create schema if not exists private;

do $$
begin
  create type public.plan_completion_state as enum ('pending', 'completed');
exception
  when duplicate_object then null;
end $$;

alter table public.students
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

alter table public.plans
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists due_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists completion_state public.plan_completion_state not null default 'pending';

alter table public.magic_links
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

update public.students
set created_by = coach_id
where created_by is null;

update public.students
set updated_at = created_at
where updated_at is null;

update public.plans
set created_by = coach_id
where created_by is null;

update public.plans
set updated_at = created_at
where updated_at is null;

update public.magic_links
set created_by = coach_id
where created_by is null;

update public.magic_links
set updated_at = created_at
where updated_at is null;

with first_completion as (
  select plan_id, min(created_at) as completed_at
  from public.completion_reports
  where completed is true
  group by plan_id
)
update public.plans
set completion_state = 'completed',
    completed_at = coalesce(public.plans.completed_at, first_completion.completed_at)
from first_completion
where public.plans.id = first_completion.plan_id
  and public.plans.completion_state = 'pending';

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.set_created_by_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.created_by is null and auth.uid() is not null then
    new.created_by = auth.uid();
  end if;

  return new;
end;
$$;

create or replace function private.complete_plan_from_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completed is true then
    update public.plans
    set completion_state = 'completed',
        completed_at = coalesce(completed_at, now())
    where id = new.plan_id
      and completion_state = 'pending';
  end if;

  return new;
end;
$$;

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
  before insert or update on public.students
  for each row execute function private.set_updated_at();

drop trigger if exists set_plans_updated_at on public.plans;
create trigger set_plans_updated_at
  before insert or update on public.plans
  for each row execute function private.set_updated_at();

drop trigger if exists set_magic_links_updated_at on public.magic_links;
create trigger set_magic_links_updated_at
  before insert or update on public.magic_links
  for each row execute function private.set_updated_at();

drop trigger if exists set_students_created_by on public.students;
create trigger set_students_created_by
  before insert on public.students
  for each row execute function private.set_created_by_from_auth();

drop trigger if exists set_plans_created_by on public.plans;
create trigger set_plans_created_by
  before insert on public.plans
  for each row execute function private.set_created_by_from_auth();

drop trigger if exists set_magic_links_created_by on public.magic_links;
create trigger set_magic_links_created_by
  before insert on public.magic_links
  for each row execute function private.set_created_by_from_auth();

drop trigger if exists complete_plan_from_report on public.completion_reports;
create trigger complete_plan_from_report
  after insert or update of completed on public.completion_reports
  for each row execute function private.complete_plan_from_report();

create index if not exists students_created_by_idx on public.students(created_by);
create index if not exists plans_created_by_idx on public.plans(created_by);
create index if not exists plans_completion_state_idx on public.plans(completion_state);
create index if not exists plans_due_at_idx on public.plans(due_at);
create index if not exists magic_links_created_by_idx on public.magic_links(created_by);

create or replace view public.plans_with_overdue
with (security_invoker = true) as
select
  plans.*,
  (
    plans.completion_state = 'pending'
    and plans.due_at is not null
    and plans.due_at < now()
  ) as is_overdue
from public.plans;

grant select on public.plans_with_overdue to authenticated;

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
