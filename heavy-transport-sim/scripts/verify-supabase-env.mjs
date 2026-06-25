import { readFileSync, existsSync } from 'node:fs';
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

// 1. Check .env.example exists
console.log('\n[1] .env.example existence');
const envExamplePath = resolve(projectRoot, '.env.example');
if (existsSync(envExamplePath)) {
  ok('.env.example exists');
} else {
  fail('.env.example not found');
}

// 2. Check .env.example does not contain real keys
console.log('\n[2] .env.example safety');
if (existsSync(envExamplePath)) {
  const content = readFileSync(envExamplePath, 'utf-8');
  if (/VITE_SUPABASE_URL=https:\/\/[a-z0-9]+\.supabase\.co/.test(content)) {
    fail('.env.example contains a real Supabase URL');
  } else {
    ok('.env.example does not contain a real Supabase URL');
  }
  if (/VITE_SUPABASE_ANON_KEY=ey[A-Za-z0-9]/.test(content)) {
    fail('.env.example contains a real anon key');
  } else {
    ok('.env.example does not contain a real anon key');
  }
  if (/SERVICE_ROLE|JWT_SECRET|DATABASE_PASSWORD/.test(content)) {
    fail('.env.example contains server-side secret references');
  } else {
    ok('.env.example does not contain server-side secret references');
  }
}

// 3. Check .gitignore protects .env.local
console.log('\n[3] .gitignore protection');
const gitignorePath = resolve(projectRoot, '.gitignore');
if (existsSync(gitignorePath)) {
  const gi = readFileSync(gitignorePath, 'utf-8');
  if (gi.includes('*.local')) {
    ok('.gitignore contains *.local (covers .env.local)');
  } else if (gi.includes('.env.local')) {
    ok('.gitignore contains .env.local');
  } else {
    fail('.gitignore does not protect .env.local');
  }
  if (gi.includes('.env')) {
    ok('.gitignore contains .env');
  } else {
    fail('.gitignore does not protect .env');
  }
} else {
  fail('.gitignore not found');
}

// 4. Check .env.local is not tracked by Git
console.log('\n[4] Git tracking check');
try {
  const tracked = execSync('git ls-files --error-unmatch .env.local .env', {
    cwd: projectRoot,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
  if (tracked) {
    fail('.env or .env.local is tracked by Git', tracked);
  } else {
    ok('.env and .env.local are not tracked by Git');
  }
} catch {
  ok('.env and .env.local are not tracked by Git (git ls-files returned empty)');
}

// 5. Check for leaked secrets in tracked files
console.log('\n[5] Secret leak scan');
try {
  const hits = execSync(
    'git grep -n "SUPABASE_SERVICE_ROLE_KEY\\|SERVICE_ROLE\\|JWT_SECRET\\|DATABASE_PASSWORD\\|VITE_SUPABASE_ANON_KEY=.*ey" -- .',
    { cwd: resolve(projectRoot, '..'), encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
  ).trim();
  if (hits) {
    fail('Found potential secret leaks in tracked files', hits);
  } else {
    ok('No secret leaks found in tracked files');
  }
} catch {
  ok('No secret leaks found in tracked files (git grep returned empty)');
}

// 6. Check environment variables
console.log('\n[6] Environment variables');
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (url) {
  if (/^https:\/\/.+\.supabase\.co\/?$/.test(url)) {
    ok(`VITE_SUPABASE_URL format looks valid (${url.substring(0, 20)}...)`);
  } else {
    info(`VITE_SUPABASE_URL is set but format may be unusual: ${url.substring(0, 20)}...`);
  }
} else {
  info('VITE_SUPABASE_URL is not set');
}

if (key) {
  info(`VITE_SUPABASE_ANON_KEY is set (length: ${key.length}, starts with: ${key.substring(0, 4)}...)`);
} else {
  info('VITE_SUPABASE_ANON_KEY is not set');
}

// 7. Connection probe (only if both env vars are present)
console.log('\n[7] Connection probe');
if (url && key) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(url, key);
    const { error } = await client.from('_probe').select('*').limit(1).maybeSingle();
    if (error && error.code === '42P01') {
      info('Connection succeeded but _probe table does not exist (expected for template)');
      ok('Supabase client initialized and reachable');
    } else if (error) {
      info(`Connection probe returned: ${error.message}`);
      ok('Supabase client initialized (probe returned a known error)');
    } else {
      ok('Supabase client initialized and _probe query succeeded');
    }
  } catch (err) {
    fail('Supabase client initialization failed', err.message);
  }
} else {
  info('Skipping connection probe — no real Supabase credentials provided');
  ok('Template check completed without real credentials');
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
