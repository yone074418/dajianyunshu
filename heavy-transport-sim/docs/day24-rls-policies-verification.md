# Day24 RLS Policies Verification

## 1. Task Source

- Date: 2026-06-26
- Source: repository root `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md`
- Original task: Day24, configure student and teacher RLS policies.
- Acceptance standard: students cannot read other students' `attempts` and `scores`.

## 2. Design Basis

- `docs/数据库实体关系设计.md`
- `heavy-transport-sim/supabase/migrations/20260625000100_create_core_tables.sql`
- `heavy-transport-sim/docs/day23-core-db-migrations-verification.md`
- `heavy-transport-sim/scripts/verify-db-migrations.mjs`
- `heavy-transport-sim/scripts/verify-supabase-env.mjs`

The design document marks `scores` student visibility as pending publication confirmation and states that student scores are not visible by default. Day24 therefore takes the conservative path: no student `scores` select policy is created. Teachers may read scores only for students authorized by `teacher_student_scopes`.

## 3. Migration Scope

- Added migration: `supabase/migrations/20260626000200_enable_rls_policies.sql`
- Did not change Day23 table structure.
- Added helper functions in the migration:
  - `public.current_user_role()`
  - `public.is_teacher_for_student(student_uuid uuid)`
  - `public.is_attempt_owner(attempt_uuid uuid)`
  - `public.is_teacher_for_attempt(attempt_uuid uuid)`
- Helper functions use `security definer` and `set search_path = public, pg_temp`.

## 4. RLS Table Coverage

RLS is enabled and forced on:

`profiles`, `classes`, `teacher_student_scopes`, `cases`, `attempts`, `attempt_steps`, `operation_logs`, `rule_check_results`, `scores`, `teacher_reviews`, `learning_progress`, `resources`, `learning_activities`, `reports`.

## 5. Student Permission Matrix

| Table group | Student access |
| --- | --- |
| `profiles` | Read and update own profile only; role must remain unchanged. |
| `cases`, `resources` | Read active or available teaching metadata. |
| `attempts` | Read, insert, and update own unlocked attempts only. |
| `attempt_steps` | Read, insert, and update rows belonging to own attempts. |
| `operation_logs` | Read and insert own logs only; no update/delete grant or policy. |
| `rule_check_results` | Read and insert results for own attempts. |
| `scores` | No student select policy by default. |
| `teacher_reviews` | No student policy in Day24. |
| `learning_progress` | Read, insert, and update own progress. |
| `learning_activities`, `reports` | Read own rows; insert own rows; update own drafts. |

## 6. Teacher Permission Matrix

| Table group | Teacher access |
| --- | --- |
| `profiles` | Read students authorized by `teacher_student_scopes`. |
| `classes` | Read class metadata. |
| `teacher_student_scopes` | Read own authorization rows. |
| `attempts` | Read authorized student attempts only. |
| `attempt_steps`, `rule_check_results` | Read rows through authorized attempts only. |
| `operation_logs` | Read authorized student logs only; cannot update/delete original logs. |
| `scores` | Read authorized student scores only. |
| `teacher_reviews` | Read, insert, and update own reviews for authorized attempts. |
| `learning_progress` | Read authorized student progress. |
| `learning_activities`, `reports` | Read authorized submitted rows only. |

## 7. Verification Commands And Results

### Static Day24 Verification

Command:

```bash
npm run verify:rls-policies
```

Result:

```text
Results: 48 passed, 0 failed
Verification PASSED.
```

The script verifies:

- RLS is enabled and forced for all 14 tables.
- `attempts` has a student self-read policy.
- `attempts` has a teacher authorized-read policy.
- `scores` has no student select policy.
- `operation_logs` has no authenticated update/delete policy.
- No service role key, JWT secret, database password, connection string, or JWT token is present in the migration.

### Temporary PostgreSQL Execution

Docker was available. A temporary `postgres:16-alpine` container was used with a minimal Supabase-compatible baseline:

```sql
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create role authenticated;
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
```

Day23 and Day24 migrations executed successfully with `psql -v ON_ERROR_STOP=1`.

Post-migration object checks:

```text
rls_forced_tables=14
policies=38
```

Sample RLS data test:

```text
student1_attempts=1
student1_scores=0
student1_logs=1
student2_attempts=1
student2_scores=0
teacher_attempts=1
teacher_scores=1
teacher_logs=1
teacher operation_logs update: ERROR permission denied for table operation_logs
```

The sample database contained two students and one teacher authorized for only the first student. Counts confirm that students see only their own `attempts`, students see no `scores`, and the teacher sees only the authorized student's protected data.

## 8. Not Implemented Boundaries

- Login, logout, and session recovery remain Day25.
- Role route guards remain Day26.
- Experiment creation, continuation, and persistence API flows remain Day27.
- Student score publication, review, appeal, and final release workflows are not implemented; `scores` remains hidden from students by default.
- Business APIs and UI flows must still enforce field-level constraints such as profile role immutability beyond the database RLS baseline.

## 9. Acceptance Conclusion

Day24 acceptance is satisfied at the database policy level: a student cannot read other students' `attempts`, and students cannot read `scores` by default. Teachers can read attempts, logs, and scores only for students in `teacher_student_scopes`, and ordinary authenticated users cannot update or delete original `operation_logs`.
