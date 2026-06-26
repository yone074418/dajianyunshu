-- Day23: Core data tables migration
-- Based on docs/数据库实体关系设计.md
-- Creates all core tables, enums, indexes, and constraints for the heavy transport simulation system.

-- ============================================================================
-- 0. Extensions
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. Helper: updated_at trigger function
-- ============================================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 2. profiles (用户扩展信息)
-- ============================================================================

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  student_id    varchar(50) unique,
  display_name  varchar(100) not null,
  role          varchar(20) not null default 'student'
                check (role in ('student', 'teacher', 'admin')),
  avatar_url    text,
  phone         varchar(30),
  class_id      uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 3. classes (班级/课程)
-- ============================================================================

create table public.classes (
  id            uuid primary key default gen_random_uuid(),
  name          varchar(100) not null,
  code          varchar(50),
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger classes_updated_at
  before update on public.classes
  for each row execute function public.handle_updated_at();

-- Add FK from profiles.class_id → classes.id
alter table public.profiles
  add constraint profiles_class_id_fkey
  foreign key (class_id) references public.classes(id) on delete set null;

-- ============================================================================
-- 4. teacher_student_scopes (教师授权学生范围)
-- ============================================================================

create table public.teacher_student_scopes (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references public.profiles(id) on delete cascade,
  student_id    uuid references public.profiles(id) on delete cascade,
  class_id      uuid references public.classes(id) on delete cascade,
  scope_type    varchar(20) not null default 'individual'
                check (scope_type in ('individual', 'class')),
  created_at    timestamptz not null default now(),

  constraint tss_teacher_student_unique unique (teacher_id, student_id)
);

create index idx_tss_teacher on public.teacher_student_scopes(teacher_id);
create index idx_tss_student on public.teacher_student_scopes(student_id);

-- ============================================================================
-- 5. cases (实验案例)
-- ============================================================================

create table public.cases (
  id                      uuid primary key default gen_random_uuid(),
  name                    varchar(200) not null,
  description             text not null,
  origin                  varchar(200) not null,
  destination             varchar(200) not null,
  transport_requirements  jsonb,
  cargo_name              varchar(100) not null,
  cargo_weight_kg         numeric(10,2) not null,
  cargo_length_m          numeric(8,2) not null,
  cargo_width_m           numeric(8,2) not null,
  cargo_height_m          numeric(8,2) not null,
  cargo_center_of_gravity jsonb not null,
  cargo_model_url         text,
  route_config            jsonb not null,
  rule_version            varchar(20) not null default 'v1.0',
  weight_version          varchar(20) not null default 'v1.0',
  is_active               boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create trigger cases_updated_at
  before update on public.cases
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 6. attempts (实验尝试)
-- ============================================================================

create table public.attempts (
  id                    uuid primary key default gen_random_uuid(),
  student_id            uuid not null references public.profiles(id) on delete restrict,
  case_id               uuid not null references public.cases(id) on delete restrict,
  current_step          integer not null default 1 check (current_step between 1 and 6),
  status                varchar(30) not null default 'not_started'
                        check (status in ('not_started','in_progress','paused','completed','failed','abandoned','readonly')),
  start_time            timestamptz,
  completed_time        timestamptz,
  total_duration_seconds integer,
  error_count           integer not null default 0,
  hint_count            integer not null default 0,
  retry_count           integer not null default 0,
  attempt_number        integer not null default 1,
  is_locked             boolean not null default false,
  client_id             varchar(100),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint attempts_student_client_unique unique (student_id, client_id)
);

create trigger attempts_updated_at
  before update on public.attempts
  for each row execute function public.handle_updated_at();

create index idx_attempts_student on public.attempts(student_id);
create index idx_attempts_case on public.attempts(case_id);
create index idx_attempts_status on public.attempts(status);

-- ============================================================================
-- 7. attempt_steps (六阶段步骤)
-- ============================================================================

create table public.attempt_steps (
  id                  uuid primary key default gen_random_uuid(),
  attempt_id          uuid not null references public.attempts(id) on delete cascade,
  step_number         integer not null check (step_number between 1 and 6),
  step_name           varchar(100) not null,
  status              varchar(30) not null default 'locked'
                      check (status in ('locked','available','in_progress','passed','failed','invalidated','readonly')),
  enter_time          timestamptz,
  completed_time      timestamptz,
  duration_seconds    integer,
  error_count         integer not null default 0,
  hint_count          integer not null default 0,
  retry_count         integer not null default 0,
  is_passed           boolean not null default false,
  is_invalidated      boolean not null default false,
  invalidated_reason  text,
  step_data_snapshot  jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint attempt_steps_attempt_step_unique unique (attempt_id, step_number)
);

create trigger attempt_steps_updated_at
  before update on public.attempt_steps
  for each row execute function public.handle_updated_at();

create index idx_attempt_steps_attempt on public.attempt_steps(attempt_id);

-- ============================================================================
-- 8. operation_logs (操作日志)
-- ============================================================================

create table public.operation_logs (
  id                  uuid primary key default gen_random_uuid(),
  attempt_id          uuid not null references public.attempts(id) on delete cascade,
  attempt_step_id     uuid references public.attempt_steps(id) on delete set null,
  student_id          uuid not null references public.profiles(id) on delete restrict,
  step_number         integer not null check (step_number between 1 and 6),
  event_type          varchar(30) not null
                      check (event_type in ('action','hint','error','retry','rollback','save','submit','rule_check','system_exception','network_event')),
  action_name         varchar(100) not null,
  input_snapshot      jsonb,
  output_snapshot     jsonb,
  is_success          boolean,
  error_type          varchar(50)
                      check (error_type is null or error_type in ('business_error','rule_not_pass','technical_exception','network_error','resource_load_failed')),
  error_message       text,
  hint_type           varchar(20),
  rule_id             varchar(20),
  rule_check_result_id uuid,
  client_timestamp    timestamptz,
  server_timestamp    timestamptz not null default now(),
  client_id           varchar(100),
  client_status       varchar(20) default 'online'
                      check (client_status in ('online','offline','pending_retry')),
  network_status      varchar(20) default 'connected',
  save_status         varchar(20) not null default 'saved'
                      check (save_status in ('saved','pending','failed')),
  is_retry            boolean not null default false,
  retry_sequence      integer not null default 0,
  metadata            jsonb,
  created_at          timestamptz not null default now(),

  constraint operation_logs_client_id_unique unique (client_id)
);

create index idx_op_logs_attempt on public.operation_logs(attempt_id, created_at);
create index idx_op_logs_student on public.operation_logs(student_id, attempt_id);
create index idx_op_logs_step on public.operation_logs(attempt_step_id);

-- ============================================================================
-- 9. rule_check_results (规则检查结果)
-- ============================================================================

create table public.rule_check_results (
  id                    uuid primary key default gen_random_uuid(),
  attempt_id            uuid not null references public.attempts(id) on delete cascade,
  attempt_step_id       uuid references public.attempt_steps(id) on delete set null,
  step_number           integer not null check (step_number between 1 and 6),
  rule_id               varchar(20) not null,
  rule_version          varchar(20) not null default 'v1.0',
  status                varchar(20) not null
                        check (status in ('passed','failed','warning','missing_input','not_applicable','config_incomplete')),
  input_data            jsonb not null,
  output_data           jsonb not null,
  result_value          numeric,
  result_unit           varchar(30),
  threshold_value       numeric,
  threshold_unit        varchar(30),
  is_passed             boolean not null default false,
  conclusion            text,
  error_message         text,
  recovery_target       text,
  is_invalidated        boolean not null default false,
  invalidated_by_rule   varchar(50),
  client_id             varchar(100),
  created_at            timestamptz not null default now()
);

create index idx_rule_results_attempt on public.rule_check_results(attempt_id, rule_id);
create index idx_rule_results_step on public.rule_check_results(attempt_step_id);

-- ============================================================================
-- 10. scores (系统评分与综合成绩)
-- ============================================================================

create table public.scores (
  id                  uuid primary key default gen_random_uuid(),
  attempt_id          uuid not null references public.attempts(id) on delete cascade,
  version             varchar(20) not null default 'v1.0',
  status              varchar(20) not null default 'pending'
                      check (status in ('pending','generating','completed','failed','reviewed','locked')),
  total_score         numeric(5,2),
  dimension_a_score   numeric(5,2),
  dimension_b_score   numeric(5,2),
  dimension_c_score   numeric(5,2),
  dimension_d_score   numeric(5,2),
  rule_items          jsonb,
  teacher_items       jsonb,
  weight_version      varchar(20) not null default 'v1.0',
  error_message       text,
  calculated_at       timestamptz,
  is_locked           boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint scores_attempt_version_unique unique (attempt_id, version)
);

create trigger scores_updated_at
  before update on public.scores
  for each row execute function public.handle_updated_at();

create index idx_scores_attempt on public.scores(attempt_id);

-- ============================================================================
-- 11. teacher_reviews (教师评价)
-- ============================================================================

create table public.teacher_reviews (
  id                uuid primary key default gen_random_uuid(),
  attempt_id        uuid not null references public.attempts(id) on delete cascade,
  teacher_id        uuid not null references public.profiles(id) on delete restrict,
  status            varchar(20) not null default 'draft'
                    check (status in ('draft','submitted','returned','locked')),
  items             jsonb not null,
  overall_comment   text,
  submitted_at      timestamptz,
  score_version     varchar(20),
  is_retractable    boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint teacher_reviews_attempt_teacher_unique unique (attempt_id, teacher_id)
);

create trigger teacher_reviews_updated_at
  before update on public.teacher_reviews
  for each row execute function public.handle_updated_at();

create index idx_teacher_reviews_attempt on public.teacher_reviews(attempt_id);
create index idx_teacher_reviews_teacher on public.teacher_reviews(teacher_id);

-- ============================================================================
-- 12. learning_progress (知识学习进度)
-- ============================================================================

create table public.learning_progress (
  id                    uuid primary key default gen_random_uuid(),
  student_id            uuid not null references public.profiles(id) on delete cascade,
  resource_id           uuid,
  chapter_id            varchar(50) not null,
  chapter_title         varchar(200),
  status                varchar(20) not null default 'unread'
                        check (status in ('unread','reading','completed')),
  progress_percent      integer not null default 0 check (progress_percent between 0 and 100),
  total_duration_seconds integer not null default 0,
  last_position         text,
  note_count            integer not null default 0,
  notes                 jsonb,
  is_from_experiment    boolean not null default false,
  experiment_context    jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint learning_progress_student_chapter_unique unique (student_id, chapter_id)
);

create trigger learning_progress_updated_at
  before update on public.learning_progress
  for each row execute function public.handle_updated_at();

create index idx_learning_progress_student on public.learning_progress(student_id);

-- ============================================================================
-- 13. resources (教学资源元数据)
-- ============================================================================

create table public.resources (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid references public.cases(id) on delete set null,
  resource_type   varchar(30) not null
                  check (resource_type in ('model_3d','document','image','video','texture','audio')),
  name            varchar(200) not null,
  description     text,
  file_path       text not null,
  file_size_bytes integer,
  file_format     varchar(20),
  thumbnail_url   text,
  status          varchar(20) not null default 'available'
                  check (status in ('available','missing','loading_failed','deprecated')),
  version         varchar(20) not null default 'v1.0',
  tags            jsonb,
  metadata        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger resources_updated_at
  before update on public.resources
  for each row execute function public.handle_updated_at();

create index idx_resources_case on public.resources(case_id);

-- Add FK from learning_progress.resource_id → resources.id
alter table public.learning_progress
  add constraint learning_progress_resource_id_fkey
  foreign key (resource_id) references public.resources(id) on delete set null;

-- ============================================================================
-- 14. learning_activities (异步学习活动) — PCR-006 supplement
-- ============================================================================

create table public.learning_activities (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles(id) on delete cascade,
  case_id       uuid references public.cases(id) on delete set null,
  activity_type varchar(30) not null check (activity_type in ('question','discussion')),
  title         varchar(200) not null,
  content       text not null,
  status        varchar(20) not null default 'draft'
                check (status in ('draft','submitted')),
  parent_id     uuid references public.learning_activities(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger learning_activities_updated_at
  before update on public.learning_activities
  for each row execute function public.handle_updated_at();

create index idx_learning_activities_student on public.learning_activities(student_id);
create index idx_learning_activities_parent on public.learning_activities(parent_id);

-- ============================================================================
-- 15. reports (学习报告) — PCR-006 supplement
-- ============================================================================

create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles(id) on delete cascade,
  case_id       uuid references public.cases(id) on delete set null,
  attempt_id    uuid references public.attempts(id) on delete set null,
  report_type   varchar(30) not null check (report_type in ('pre_lab','post_lab')),
  title         varchar(200) not null,
  content       text not null,
  status        varchar(20) not null default 'draft'
                check (status in ('draft','submitted')),
  submitted_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger reports_updated_at
  before update on public.reports
  for each row execute function public.handle_updated_at();

create index idx_reports_student on public.reports(student_id);
create index idx_reports_attempt on public.reports(attempt_id);
