import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const migrationsDir = resolve(projectRoot, 'supabase', 'migrations');

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  OK ${label}`);
  passed++;
}

function fail(label, detail) {
  console.error(`  FAIL ${label}`);
  if (detail) console.error(`    ${detail}`);
  failed++;
}

function info(label) {
  console.log(`  INFO ${label}`);
}

function normalizeSql(sql) {
  return sql.replace(/\s+/g, ' ').toLowerCase();
}

function assertPattern(label, sql, pattern) {
  if (pattern.test(sql)) {
    ok(label);
  } else {
    fail(label);
  }
}

console.log('\n[1] Day24 migration file');
if (!existsSync(migrationsDir)) {
  fail('supabase/migrations directory exists');
  process.exit(1);
}

const migrationFile = readdirSync(migrationsDir).find(file =>
  /^\d{14}_enable_rls_policies\.sql$/.test(file),
);

if (migrationFile) {
  ok(`Found Day24 RLS migration: ${migrationFile}`);
} else {
  fail('Found Day24 RLS migration named *_enable_rls_policies.sql');
}

const migrationPath = migrationFile ? resolve(migrationsDir, migrationFile) : null;
const migrationSql = migrationPath ? readFileSync(migrationPath, 'utf-8') : '';
const normalizedSql = normalizeSql(migrationSql);

console.log('\n[2] Secret leak check');
const secretPatterns = [
  { pattern: /SUPABASE_SERVICE_ROLE_KEY/i, name: 'service role key' },
  { pattern: /JWT_SECRET/i, name: 'JWT secret' },
  { pattern: /DATABASE_PASSWORD/i, name: 'database password' },
  { pattern: /postgres:\/\/[^\s]+@[^\s]+/i, name: 'PostgreSQL connection string' },
  { pattern: /postgresql:\/\/[^\s]+@[^\s]+/i, name: 'PostgreSQL connection string' },
  { pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./, name: 'JWT token' },
];

for (const { pattern, name } of secretPatterns) {
  if (pattern.test(migrationSql)) {
    fail(`Migration contains ${name}`);
  } else {
    ok(`No ${name} found`);
  }
}

console.log('\n[3] RLS enabled table coverage');
const rlsTables = [
  'profiles',
  'classes',
  'teacher_student_scopes',
  'cases',
  'attempts',
  'attempt_steps',
  'operation_logs',
  'rule_check_results',
  'scores',
  'teacher_reviews',
  'learning_progress',
  'resources',
  'learning_activities',
  'reports',
];

for (const table of rlsTables) {
  assertPattern(
    `${table} has RLS enabled`,
    normalizedSql,
    new RegExp(`alter table public\\.${table} enable row level security`, 'i'),
  );
  assertPattern(
    `${table} has RLS forced`,
    normalizedSql,
    new RegExp(`alter table public\\.${table} force row level security`, 'i'),
  );
}

console.log('\n[4] Student and teacher isolation policies');
const policyChecks = [
  {
    label: 'attempts has student self-read policy',
    pattern:
      /create policy "attempts_select_own" on public\.attempts for select to authenticated using \(student_id = auth\.uid\(\)\)/i,
  },
  {
    label: 'attempts has teacher authorized-read policy',
    pattern:
      /create policy "attempts_select_teacher_scope" on public\.attempts for select to authenticated using \(public\.is_teacher_for_student\(student_id\)\)/i,
  },
  {
    label: 'scores has no student select policy',
    pattern: /create policy "scores_select_teacher_scope" on public\.scores for select to authenticated using/i,
  },
  {
    label: 'operation_logs has student self-read policy',
    pattern:
      /create policy "operation_logs_select_own" on public\.operation_logs for select to authenticated using \(student_id = auth\.uid\(\)\)/i,
  },
  {
    label: 'operation_logs has teacher authorized-read policy',
    pattern:
      /create policy "operation_logs_select_teacher_scope" on public\.operation_logs for select to authenticated using \(public\.is_teacher_for_student\(student_id\)\)/i,
  },
];

for (const { label, pattern } of policyChecks) {
  assertPattern(label, normalizedSql, pattern);
}

if (/create policy "[^"]*operation_logs[^"]*" on public\.operation_logs for (update|delete)/i.test(normalizedSql)) {
  fail('operation_logs has no authenticated UPDATE or DELETE policy');
} else {
  ok('operation_logs has no authenticated UPDATE or DELETE policy');
}

if (/create policy "[^"]*scores[^"]*student[^"]*" on public\.scores for select/i.test(normalizedSql)) {
  fail('scores has no student SELECT policy');
} else {
  ok('scores has no student SELECT policy');
}

console.log('\n[5] Helper function safety');
assertPattern(
  'current_user_role helper uses security definer',
  normalizedSql,
  /create or replace function public\.current_user_role\(\).*security definer/i,
);
assertPattern(
  'is_teacher_for_student helper uses security definer',
  normalizedSql,
  /create or replace function public\.is_teacher_for_student\(student_uuid uuid\).*security definer/i,
);
assertPattern(
  'helper functions set a constrained search_path',
  normalizedSql,
  /set search_path = public, pg_temp/i,
);
assertPattern(
  'policies use auth.uid()',
  normalizedSql,
  /auth\.uid\(\)/i,
);
assertPattern(
  'policies use profiles.role via current_user_role()',
  normalizedSql,
  /public\.current_user_role\(\)/i,
);

console.log('\n[6] Git tracking safety');
try {
  const tracked = execSync('git ls-files --error-unmatch .env .env.local', {
    cwd: projectRoot,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
  if (tracked) {
    fail('.env or .env.local is tracked by Git', tracked);
  } else {
    ok('.env and .env.local are not tracked');
  }
} catch {
  ok('.env and .env.local are not tracked');
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\nVerification FAILED.');
  process.exit(1);
}

console.log('\nVerification PASSED.');
