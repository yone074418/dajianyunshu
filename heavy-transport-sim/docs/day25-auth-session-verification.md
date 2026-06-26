# Day25 Auth Session Verification

## 1. Task Source

- Date: 2026-06-26
- Source: repository root `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md`
- Original task: Day25, implement login, logout, and session recovery.
- Acceptance standard: after page refresh the app keeps the user logged in; invalid sessions return to the login page.

## 2. Design Basis

- `docs/用户与场景.md`
- `docs/通用功能与页面清单.md`
- `docs/数据库实体关系设计.md`
- `heavy-transport-sim/supabase/migrations/20260625000100_create_core_tables.sql`
- `heavy-transport-sim/supabase/migrations/20260626000200_enable_rls_policies.sql`
- `heavy-transport-sim/docs/day24-rls-policies-verification.md`
- `heavy-transport-sim/src/services/supabase/client.ts`
- `heavy-transport-sim/src/app/router.tsx`
- `heavy-transport-sim/src/pages/login/LoginPage.tsx`
- `heavy-transport-sim/src/pages/student/StudentPage.tsx`
- `heavy-transport-sim/src/pages/teacher/TeacherPage.tsx`

## 3. Login, Logout, And Session Recovery Flow

The app uses Supabase Auth as the source of truth:

1. Protected routes call `supabase.auth.getSession()`.
2. If no session exists, the route redirects to `/login`.
3. If a session exists, the app reads the current user's row from `public.profiles` with the authenticated Supabase client.
4. If profile loading fails, the profile is missing, or the role is unknown, the app treats the session as invalid and redirects to `/login`.
5. Login uses `supabase.auth.signInWithPassword({ email, password })`, then reads `profiles` through the current session before routing.
6. Logout calls `supabase.auth.signOut()` and returns to `/login`.

This keeps Day24 RLS intact because profile reads use the current user's authenticated Supabase session and do not use service-role credentials or real keys.

## 4. Role Routing Rules

| `profiles.role` | Login/session recovery destination |
| --- | --- |
| `student` | `/student` |
| `teacher` | `/teacher` |
| `admin` | `/login` with conservative handling because the admin console is not implemented |

The Day25 route handling is intentionally minimal. It restores and redirects known roles, and prevents unauthenticated access to student and teacher pages. Full role route guard behavior remains Day26.

## 5. Invalid Session Handling

The app returns to `/login` when:

- Supabase returns no current session.
- `getSession()` returns an error.
- The current user's `profiles` row cannot be read.
- The `profiles.role` value is missing or outside `student`, `teacher`, and `admin`.
- The user signs out.

## 6. Test Coverage

Updated tests cover:

- No session when visiting a protected page redirects to `/login`.
- A `student` profile restores session access to `/student`.
- A `teacher` profile restores session access to `/teacher`.
- Logout calls Supabase `signOut()` and returns to `/login`.
- Profile loading failure returns to `/login`.

Playwright routing tests were updated so unauthenticated `/student`, `/teacher`, and `/` visits expect `/login`, matching Day25 protected-route behavior.

## 7. Verification Commands And Results

| Command | Result |
| --- | --- |
| `npm run verify:supabase-env` | Passed: 9 passed, 0 failed. No real Supabase credentials were present, so the connection probe was skipped. |
| `npm run verify:db-migrations` | Passed: 36 passed, 0 failed. Static migration validation completed. The Day24 RLS migration warning is expected for the Day25 branch. |
| `npm run verify:rls-policies` | Passed: 48 passed, 0 failed. |
| `npm run format:check` | Passed: all matched files use Prettier code style. |
| `npm run lint` | Passed: ESLint completed with 0 errors and 0 warnings. |
| `npm run test:run` | Passed: 3 test files, 21 tests. |
| `npm run build` | Passed: `tsc -b && vite build`, 80 modules transformed. A parallel verification run produced one transient Vite emitted-file-name error; rerunning `npm run build` by itself passed. |
| `npm run test:e2e` | Passed with elevated permissions: 7 Playwright tests passed. The first normal-sandbox run timed out during browser process execution, so it was rerun with elevated permissions as required. |

## 8. Not Implemented Boundaries

- Full role route guard and 403 behavior remain Day26.
- Experiment creation, continuation, and persistence APIs remain Day27.
- Admin backend pages are not implemented in Day25.
- Student registration, password reset, account locking, and account provisioning are outside Day25.
- No real Supabase keys, service-role keys, `.env`, or `.env.local` files were added.

## 9. Acceptance Conclusion

Day25 acceptance is satisfied at the application routing level: Supabase session recovery keeps authenticated student and teacher users on their role pages after refresh, and missing, invalid, or unreadable sessions return to `/login`.
