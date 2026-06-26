# Supabase Migrations

This directory contains PostgreSQL migration files for the heavy transport simulation database.

## Migration Files

| File | Description |
|------|-------------|
| `20260625000100_create_core_tables.sql` | Creates all core tables, indexes, constraints, and trigger functions |

## Core Tables

1. `profiles` — user profiles linked to Supabase Auth
2. `classes` — class/course groups
3. `teacher_student_scopes` — teacher authorization over students
4. `cases` — experiment case configurations
5. `attempts` — student experiment attempts
6. `attempt_steps` — six-phase step records per attempt
7. `operation_logs` — immutable operation event logs
8. `rule_check_results` — rule engine check results with snapshots
9. `scores` — system-generated scores with version tracking
10. `teacher_reviews` — teacher evaluations
11. `learning_progress` — student knowledge learning progress
12. `resources` — teaching resource metadata
13. `learning_activities` — async learning activities (questions/discussions)
14. `reports` — pre-lab and post-lab reports

## Running Migrations

### Supabase CLI

```bash
supabase db push
```

### Manual

Run the SQL file against your Supabase PostgreSQL database via the SQL Editor or `psql`.

## Notes

- Day23: Table creation only. No RLS policies (Day24).
- No real data inserted. No seed scripts.
- All UUIDs use `gen_random_uuid()` via `pgcrypto` extension.
- `updated_at` columns are maintained by trigger function `handle_updated_at()`.
