import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✓ ${label}`);
  passed++;
}

function fail(label, detail) {
  console.error(`  ✗ ${label}`);
  if (detail) console.error(`    ${detail}`);
  failed++;
}

function info(label) {
  console.log(`  ℹ ${label}`);
}

// 1. Check migrations directory exists
console.log('\n[1] Migrations directory');
const migrationsDir = resolve(projectRoot, 'supabase', 'migrations');
if (existsSync(migrationsDir)) {
  ok('supabase/migrations/ directory exists');
} else {
  fail('supabase/migrations/ directory not found');
  process.exit(1);
}

// 2. Check at least one .sql file
console.log('\n[2] Migration files');
const sqlFiles = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
if (sqlFiles.length > 0) {
  ok(`Found ${sqlFiles.length} SQL file(s): ${sqlFiles.join(', ')}`);
} else {
  fail('No .sql migration files found');
}

// 3. Read all migration content
let allSql = '';
for (const f of sqlFiles) {
  allSql += readFileSync(resolve(migrationsDir, f), 'utf-8') + '\n';
}

// 4. Check no secrets
console.log('\n[3] Secret leak check');
const secretPatterns = [
  { pattern: /SUPABASE_SERVICE_ROLE_KEY/i, name: 'service role key' },
  { pattern: /JWT_SECRET/i, name: 'JWT secret' },
  { pattern: /DATABASE_PASSWORD/i, name: 'database password' },
  { pattern: /postgres:\/\/[^\s]+@[^\s]+/, name: 'PostgreSQL connection string' },
  { pattern: /postgresql:\/\/[^\s]+@[^\s]+/, name: 'PostgreSQL connection string' },
  { pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./, name: 'JWT token' },
];
for (const { pattern, name } of secretPatterns) {
  if (pattern.test(allSql)) {
    fail(`Migration contains ${name}`);
  } else {
    ok(`No ${name} found`);
  }
}

// 5. Check core tables
console.log('\n[4] Core table coverage');
const coreTables = [
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
for (const table of coreTables) {
  const regex = new RegExp(`create\\s+table\\s+(?:public\\.)?${table}\\b`, 'i');
  if (regex.test(allSql)) {
    ok(`Table ${table} found`);
  } else {
    fail(`Table ${table} not found in migrations`);
  }
}

// 6. Check key status constraints
console.log('\n[5] Status/constraint coverage');
const constraints = [
  { name: 'attempt status CHECK', pattern: /not_started.*in_progress.*completed/i },
  { name: 'step status CHECK', pattern: /locked.*available.*in_progress.*passed/i },
  { name: 'event_type CHECK', pattern: /action.*hint.*error.*retry/i },
  { name: 'rule_check status CHECK', pattern: /passed.*failed.*warning.*missing_input/i },
  { name: 'score status CHECK', pattern: /pending.*generating.*completed.*failed/i },
  { name: 'review status CHECK', pattern: /draft.*submitted/i },
  { name: 'learning status CHECK', pattern: /unread.*reading.*completed/i },
  { name: 'resource status CHECK', pattern: /available.*missing.*loading_failed/i },
  { name: 'six phases CHECK or constraint', pattern: /check\s*\(step_number\s+between\s+1\s+and\s+6\)/i },
  { name: 'updated_at trigger function', pattern: /handle_updated_at/i },
  { name: 'pgcrypto extension', pattern: /pgcrypto/i },
  { name: 'gen_random_uuid()', pattern: /gen_random_uuid\(\)/i },
];
for (const { name, pattern } of constraints) {
  if (pattern.test(allSql)) {
    ok(`${name} present`);
  } else {
    fail(`${name} not found`);
  }
}

// 7. Check no RLS policies
console.log('\n[6] RLS policy check');
if (/create\s+policy/i.test(allSql)) {
  info('WARNING: RLS policy found in migration — Day23 should not create RLS (Day24 responsibility)');
} else {
  ok('No RLS policies created (correct for Day23)');
}

// 8. Check no real .env.local tracked
console.log('\n[7] Git tracking check');
try {
  const tracked = execSync('git ls-files --error-unmatch .env .env.local', {
    cwd: projectRoot,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
  if (tracked) {
    fail('.env or .env.local is tracked by Git');
  } else {
    ok('.env and .env.local are not tracked');
  }
} catch {
  ok('.env and .env.local are not tracked (git returned empty)');
}

// 9. Check no real Supabase connection attempt
console.log('\n[8] Migration execution mode');
if (/supabase\s+db\s+push/.test(allSql)) {
  info('Migration references supabase CLI push');
}
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  info('Real Supabase credentials detected — would need CLI for actual migration');
} else {
  info('No real Supabase credentials — static migration check only');
  ok('Static migration validation completed (no real database connection)');
}

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\nVerification FAILED.');
  process.exit(1);
} else {
  console.log('\nVerification PASSED.');
}
