-- Day24: Student and teacher RLS policies
-- Enables row level security for core Day23 tables and isolates student data
-- from other students while allowing teachers to read authorized student scope.

-- ============================================================================
-- 1. Role and scope helper functions
-- ============================================================================

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.role
  from public.profiles as p
  where p.id = auth.uid()
  limit 1
$$;

create or replace function public.is_teacher_for_student(student_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    public.current_user_role() = 'teacher'
    and exists (
      select 1
      from public.teacher_student_scopes as tss
      left join public.profiles as student_profile
        on student_profile.id = student_uuid
      where tss.teacher_id = auth.uid()
        and (
          (tss.scope_type = 'individual' and tss.student_id = student_uuid)
          or (
            tss.scope_type = 'class'
            and tss.class_id is not null
            and tss.class_id = student_profile.class_id
          )
        )
    ),
    false
  )
$$;

create or replace function public.is_attempt_owner(attempt_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.attempts as a
    where a.id = attempt_uuid
      and a.student_id = auth.uid()
  )
$$;

create or replace function public.is_teacher_for_attempt(attempt_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.attempts as a
    where a.id = attempt_uuid
      and public.is_teacher_for_student(a.student_id)
  )
$$;

-- ============================================================================
-- 2. Enable and force RLS on all Day23 core tables
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

alter table public.classes enable row level security;
alter table public.classes force row level security;

alter table public.teacher_student_scopes enable row level security;
alter table public.teacher_student_scopes force row level security;

alter table public.cases enable row level security;
alter table public.cases force row level security;

alter table public.attempts enable row level security;
alter table public.attempts force row level security;

alter table public.attempt_steps enable row level security;
alter table public.attempt_steps force row level security;

alter table public.operation_logs enable row level security;
alter table public.operation_logs force row level security;

alter table public.rule_check_results enable row level security;
alter table public.rule_check_results force row level security;

alter table public.scores enable row level security;
alter table public.scores force row level security;

alter table public.teacher_reviews enable row level security;
alter table public.teacher_reviews force row level security;

alter table public.learning_progress enable row level security;
alter table public.learning_progress force row level security;

alter table public.resources enable row level security;
alter table public.resources force row level security;

alter table public.learning_activities enable row level security;
alter table public.learning_activities force row level security;

alter table public.reports enable row level security;
alter table public.reports force row level security;

-- ============================================================================
-- 3. User, class, and teacher scope policies
-- ============================================================================

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_select_teacher_scope"
on public.profiles
for select
to authenticated
using (public.is_teacher_for_student(id));

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and role in ('student', 'teacher'));

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = public.current_user_role());

create policy "classes_select_teacher"
on public.classes
for select
to authenticated
using (public.current_user_role() = 'teacher');

create policy "teacher_student_scopes_select_teacher_own"
on public.teacher_student_scopes
for select
to authenticated
using (teacher_id = auth.uid() and public.current_user_role() = 'teacher');

-- ============================================================================
-- 4. Public teaching content policies
-- ============================================================================

create policy "cases_select_authenticated"
on public.cases
for select
to authenticated
using (is_active = true);

create policy "resources_select_authenticated"
on public.resources
for select
to authenticated
using (status = 'available');

-- ============================================================================
-- 5. Attempt and step policies
-- ============================================================================

create policy "attempts_select_own" on public.attempts for select to authenticated using (student_id = auth.uid());

create policy "attempts_select_teacher_scope" on public.attempts for select to authenticated using (public.is_teacher_for_student(student_id));

create policy "attempts_insert_own"
on public.attempts
for insert
to authenticated
with check (student_id = auth.uid() and public.current_user_role() = 'student');

create policy "attempts_update_own_unlocked"
on public.attempts
for update
to authenticated
using (student_id = auth.uid() and is_locked = false)
with check (student_id = auth.uid() and is_locked = false);

create policy "attempt_steps_select_own"
on public.attempt_steps
for select
to authenticated
using (public.is_attempt_owner(attempt_id));

create policy "attempt_steps_select_teacher_scope"
on public.attempt_steps
for select
to authenticated
using (public.is_teacher_for_attempt(attempt_id));

create policy "attempt_steps_insert_own"
on public.attempt_steps
for insert
to authenticated
with check (public.is_attempt_owner(attempt_id));

create policy "attempt_steps_update_own"
on public.attempt_steps
for update
to authenticated
using (public.is_attempt_owner(attempt_id))
with check (public.is_attempt_owner(attempt_id));

-- ============================================================================
-- 6. Logs and rule check policies
-- ============================================================================

create policy "operation_logs_select_own" on public.operation_logs for select to authenticated using (student_id = auth.uid());

create policy "operation_logs_select_teacher_scope" on public.operation_logs for select to authenticated using (public.is_teacher_for_student(student_id));

create policy "operation_logs_insert_own"
on public.operation_logs
for insert
to authenticated
with check (student_id = auth.uid() and public.is_attempt_owner(attempt_id));

create policy "rule_check_results_select_own"
on public.rule_check_results
for select
to authenticated
using (public.is_attempt_owner(attempt_id));

create policy "rule_check_results_select_teacher_scope"
on public.rule_check_results
for select
to authenticated
using (public.is_teacher_for_attempt(attempt_id));

create policy "rule_check_results_insert_own"
on public.rule_check_results
for insert
to authenticated
with check (public.is_attempt_owner(attempt_id));

-- ============================================================================
-- 7. Scoring and teacher review policies
-- ============================================================================

create policy "scores_select_teacher_scope"
on public.scores
for select
to authenticated
using (public.is_teacher_for_attempt(attempt_id));

create policy "teacher_reviews_select_teacher_scope"
on public.teacher_reviews
for select
to authenticated
using (teacher_id = auth.uid() and public.is_teacher_for_attempt(attempt_id));

create policy "teacher_reviews_insert_teacher_scope"
on public.teacher_reviews
for insert
to authenticated
with check (teacher_id = auth.uid() and public.is_teacher_for_attempt(attempt_id));

create policy "teacher_reviews_update_teacher_own"
on public.teacher_reviews
for update
to authenticated
using (teacher_id = auth.uid() and status <> 'locked')
with check (teacher_id = auth.uid() and public.is_teacher_for_attempt(attempt_id));

-- ============================================================================
-- 8. Learning and report policies
-- ============================================================================

create policy "learning_progress_select_own"
on public.learning_progress
for select
to authenticated
using (student_id = auth.uid());

create policy "learning_progress_select_teacher_scope"
on public.learning_progress
for select
to authenticated
using (public.is_teacher_for_student(student_id));

create policy "learning_progress_insert_own"
on public.learning_progress
for insert
to authenticated
with check (student_id = auth.uid());

create policy "learning_progress_update_own"
on public.learning_progress
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "learning_activities_select_own"
on public.learning_activities
for select
to authenticated
using (student_id = auth.uid());

create policy "learning_activities_select_teacher_scope"
on public.learning_activities
for select
to authenticated
using (status = 'submitted' and public.is_teacher_for_student(student_id));

create policy "learning_activities_insert_own"
on public.learning_activities
for insert
to authenticated
with check (student_id = auth.uid());

create policy "learning_activities_update_own_draft"
on public.learning_activities
for update
to authenticated
using (student_id = auth.uid() and status = 'draft')
with check (student_id = auth.uid());

create policy "reports_select_own"
on public.reports
for select
to authenticated
using (student_id = auth.uid());

create policy "reports_select_teacher_scope"
on public.reports
for select
to authenticated
using (status = 'submitted' and public.is_teacher_for_student(student_id));

create policy "reports_insert_own"
on public.reports
for insert
to authenticated
with check (student_id = auth.uid());

create policy "reports_update_own_draft"
on public.reports
for update
to authenticated
using (student_id = auth.uid() and status = 'draft')
with check (student_id = auth.uid());

-- ============================================================================
-- 9. Minimal authenticated grants
-- ============================================================================

grant usage on schema public to authenticated;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_teacher_for_student(uuid) to authenticated;
grant execute on function public.is_attempt_owner(uuid) to authenticated;
grant execute on function public.is_teacher_for_attempt(uuid) to authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select on public.classes to authenticated;
grant select on public.teacher_student_scopes to authenticated;
grant select on public.cases to authenticated;
grant select, insert, update on public.attempts to authenticated;
grant select, insert, update on public.attempt_steps to authenticated;
grant select, insert on public.operation_logs to authenticated;
grant select, insert on public.rule_check_results to authenticated;
grant select on public.scores to authenticated;
grant select, insert, update on public.teacher_reviews to authenticated;
grant select, insert, update on public.learning_progress to authenticated;
grant select on public.resources to authenticated;
grant select, insert, update on public.learning_activities to authenticated;
grant select, insert, update on public.reports to authenticated;
