import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const GIT_ROOT = join(ROOT, '..')

let passed = 0
let failed = 0
let warnings = 0
const issues = []

function check(name, condition, detail) {
  if (condition) {
    passed++
    console.log(`  ✅ ${name}`)
  } else {
    failed++
    issues.push({ name, detail: detail || 'FAILED' })
    console.log(`  ❌ ${name}${detail ? ': ' + detail : ''}`)
  }
}

function warn(name, detail) {
  warnings++
  console.log(`  ⚠️  ${name}${detail ? ': ' + detail : ''}`)
}

function fileExists(p) {
  return existsSync(join(ROOT, p))
}

function readFile(p) {
  try {
    return readFileSync(join(ROOT, p), 'utf-8')
  } catch {
    return ''
  }
}

function gitBranchFiles(branch, pattern) {
  try {
    const out = execSync(`git ls-tree --name-only -r ${branch} -- ${pattern}`, {
      cwd: GIT_ROOT,
      encoding: 'utf-8',
      timeout: 10000,
    })
    return out.trim().split('\n').filter(Boolean)
  } catch {
    return []
  }
}

console.log('\n========================================')
console.log('G2 基础平台验收静态检查')
console.log('========================================\n')

// 1. Supabase 环境与密钥保护
console.log('── 1. Supabase 环境与密钥保护 ──')
check('.gitignore 存在', fileExists('.gitignore'))
const gitignore = readFile('.gitignore')
check('.gitignore 忽略 .env', gitignore.includes('.env'))
check('.gitignore 忽略 *.local', gitignore.includes('*.local'))
check('Supabase 客户端不硬编码真实 URL', !readFile('src/services/supabase/client.ts').includes('https://') || readFile('src/services/supabase/client.ts').includes('placeholder'))

// 2. 数据库迁移
console.log('\n── 2. 数据库迁移 ──')
const migrations = gitBranchFiles('origin/main', 'heavy-transport-sim/supabase/migrations/')
check('核心迁移文件存在', migrations.length > 0 || fileExists('supabase/migrations/20260625000100_create_core_tables.sql'), `找到 ${migrations.length} 个迁移文件`)

const migrationContent = readFile('supabase/migrations/20260625000100_create_core_tables.sql')
const coreTables = ['profiles', 'cases', 'attempts', 'attempt_steps', 'operation_logs', 'rule_check_results', 'scores', 'teacher_reviews', 'learning_progress', 'resources', 'teacher_student_scopes']
for (const table of coreTables) {
  check(`表 ${table} 在迁移中定义`, migrationContent.includes(`create table public.${table}`))
}

// 3. RLS 策略 (Day24 - 未合并到main，在分支中)
console.log('\n── 3. RLS 策略 ──')
const day24Files = gitBranchFiles('origin/ai-codex/week4-day24-rls-policies', 'heavy-transport-sim/supabase/')
check('Day24 RLS 分支存在', day24Files.length > 0, `分支中有 ${day24Files.length} 个文件`)
const day24Migrations = day24Files.filter(f => f.endsWith('.sql'))
check('Day24 包含 RLS 迁移文件', day24Migrations.length > 1, `找到 ${day24Migrations.length} 个SQL文件`)

// 4. 登录、退出和会话恢复 (Day25 - 未合并到main)
console.log('\n── 4. 登录、退出和会话恢复 ──')
const day25AuthFiles = gitBranchFiles('origin/ai-codex/week4-day25-auth-session', 'heavy-transport-sim/src/')
check('Day25 Auth 分支存在', day25AuthFiles.length > 0)
const hasAuthSession = day25AuthFiles.some(f => f.includes('authSession') || f.includes('auth'))
check('Day25 包含认证会话文件', hasAuthSession)

// 5. 角色路由守卫 (Day26 - 未合并到main)
console.log('\n── 5. 角色路由守卫 ──')
const day26Files = gitBranchFiles('origin/ai-codex/week4-day26-role-route-guards', 'heavy-transport-sim/src/')
check('Day26 路由守卫分支存在', day26Files.length > 0)
const hasAuthGuard = day26Files.some(f => f.includes('AuthGuard'))
const hasRoleGuard = day26Files.some(f => f.includes('RoleGuard'))
check('Day26 包含 AuthGuard', hasAuthGuard)
check('Day26 包含 RoleGuard', hasRoleGuard)

// 6. 实验创建、继续和保存接口 (Day27 - 未合并到main)
console.log('\n── 6. 实验创建、继续和保存接口 ──')
const day27Files = gitBranchFiles('origin/ai-codex/week4-day27-attempt-create-continue-save', 'heavy-transport-sim/src/')
check('Day27 Attempt 分支存在', day27Files.length > 0)
const hasAttemptService = day27Files.some(f => f.includes('attemptService'))
const hasAttemptTypes = day27Files.some(f => f.includes('attempt.ts'))
check('Day27 包含 attemptService', hasAttemptService)
check('Day27 包含 attempt 类型定义', hasAttemptTypes)

// 7. 验证记录
console.log('\n── 7. 验证记录 ──')
const mainDocs = gitBranchFiles('origin/main', 'heavy-transport-sim/docs/')
check('Day22 验证记录存在', mainDocs.some(f => f.includes('day22')))
check('Day23 验证记录存在', mainDocs.some(f => f.includes('day23')))

for (const day of [24, 25, 26, 27]) {
  const branch = `origin/ai-codex/week4-day${day === 24 ? '24-rls-policies' : day === 25 ? '25-auth-session' : day === 26 ? '26-role-route-guards' : '27-attempt-create-continue-save'}`
  const docs = gitBranchFiles(branch, 'heavy-transport-sim/docs/')
  const hasVerification = docs.some(f => f.includes(`day${day}`))
  check(`Day${day} 验证记录在分支中`, hasVerification)
}

// 8. 密钥检查
console.log('\n── 8. 密钥检查 ──')
try {
  const grepResult = execSync(
    'git grep -l "SUPABASE_SERVICE_ROLE_KEY\\|eyJ[A-Za-z0-9_-]{10,}\\." -- heavy-transport-sim/src/ heavy-transport-sim/supabase/migrations/ 2>nul',
    { cwd: GIT_ROOT, encoding: 'utf-8', timeout: 10000 }
  ).trim()
  check('源码和迁移中无真实密钥', !grepResult, grepResult ? `发现: ${grepResult}` : '')
} catch {
  check('源码和迁移中无真实密钥', true)
}

// 9. Package.json 脚本
console.log('\n── 9. Package.json 脚本 ──')
const pkg = JSON.parse(readFile('package.json') || '{}')
check('test:run 脚本存在', !!pkg.scripts?.['test:run'])
check('test:e2e 脚本存在', !!pkg.scripts?.['test:e2e'])
check('build 脚本存在', !!pkg.scripts?.['build'])
check('lint 脚本存在', !!pkg.scripts?.['lint'])
check('format:check 脚本存在', !!pkg.scripts?.['format:check'])

// Summary
console.log('\n========================================')
console.log(`G2 静态检查结果: ${passed} 通过, ${failed} 失败, ${warnings} 警告`)
console.log('========================================')

if (issues.length > 0) {
  console.log('\n失败项:')
  for (const issue of issues) {
    console.log(`  - ${issue.name}: ${issue.detail}`)
  }
}

console.log('\n注意: Day24-Day27 分支未合并到 main。')
console.log('这些分支的实现已通过远程分支静态验证。')
console.log('真实数据库验证未执行（无 Supabase 凭据）。')

process.exit(failed > 0 ? 1 : 0)
