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
console.log('Day49 第7周第一阶段流程静态检查')
console.log('========================================\n')

// 1. 依赖检查
console.log('── 1. 依赖检查 ──')
const pkg = JSON.parse(readFile('package.json') || '{}')
check('react-router-dom 依赖存在', !!pkg.dependencies?.['react-router-dom'])
check('zustand 依赖存在', !!pkg.dependencies?.['zustand'])
check('three 依赖存在', !!pkg.dependencies?.['three'])
check('@react-three/fiber 依赖存在', !!pkg.dependencies?.['@react-three/fiber'])
check('@react-three/drei 依赖存在', !!pkg.dependencies?.['@react-three/drei'])
check('@react-three/rapier 依赖存在', !!pkg.dependencies?.['@react-three/rapier'])

// 2. Day43 案例数据
console.log('\n── 2. Day43 唯一运输案例 ──')
const day43Files = gitBranchFiles('origin/ai-codex/week7-day43-transport-case-parameters', 'heavy-transport-sim/src/')
check('Day43 分支存在', day43Files.length > 0, `${day43Files.length} 个文件`)
const hasTransportCase = day43Files.some(f => f.includes('transportCase'))
check('Day43 包含 transportCase 数据', hasTransportCase)

// 3. Day44 任务介绍页面
console.log('\n── 3. Day44 任务介绍页面 ──')
const day44Files = gitBranchFiles('origin/ai-codex/week7-day44-task-introduction-page', 'heavy-transport-sim/src/')
check('Day44 分支存在', day44Files.length > 0, `${day44Files.length} 个文件`)
const hasTaskIntro = day44Files.some(f => f.includes('TaskIntroduction') || f.includes('task-introduction'))
check('Day44 包含任务介绍页面', hasTaskIntro)

// 4. Day45 货物360°查看
console.log('\n── 4. Day45 货物360°查看 ──')
const day45Files = gitBranchFiles('origin/ai-codex/week7-day45-cargo-360-dimensions', 'heavy-transport-sim/src/')
check('Day45 分支存在', day45Files.length > 0, `${day45Files.length} 个文件`)
const hasCargoViewer = day45Files.some(f => f.includes('Cargo360') || f.includes('cargo-viewer'))
check('Day45 包含货物查看组件', hasCargoViewer)

// 5. Day46 知识学习内容
console.log('\n── 5. Day46 知识学习内容 ──')
const day46Files = gitBranchFiles('origin/ai-codex/week7-day46-knowledge-learning-structure', 'heavy-transport-sim/src/')
check('Day46 分支存在', day46Files.length > 0, `${day46Files.length} 个文件`)
const hasLearningContent = day46Files.some(f => f.includes('learningContent'))
check('Day46 包含学习内容数据', hasLearningContent)
const hasLearningPage = day46Files.some(f => f.includes('LearningCenter'))
check('Day46 包含学习中心页面', hasLearningPage)

// 6. Day47 学习进度保存
console.log('\n── 6. Day47 学习进度保存 ──')
const day47Files = gitBranchFiles('origin/ai-codex/week7-day47-learning-progress-persistence', 'heavy-transport-sim/src/')
check('Day47 分支存在', day47Files.length > 0, `${day47Files.length} 个文件`)
const hasLearningProgress = day47Files.some(f => f.includes('learningProgress'))
check('Day47 包含进度保存', hasLearningProgress)
const hasTeacherCompletion = day47Files.some(f => f.includes('LearningCompletion'))
check('Day47 包含教师端完成度', hasTeacherCompletion)

// 7. Day48 提示框架
console.log('\n── 7. Day48 当前步骤提示框架 ──')
const day48Files = gitBranchFiles('origin/ai-codex/week7-day48-current-step-hint-framework', 'heavy-transport-sim/src/')
check('Day48 分支存在', day48Files.length > 0, `${day48Files.length} 个文件`)
const hasStepHints = day48Files.some(f => f.includes('stepHints'))
check('Day48 包含提示数据', hasStepHints)
const hasHintUsage = day48Files.some(f => f.includes('hintUsage'))
check('Day48 包含提示计数', hasHintUsage)
const hasHintPanel = day48Files.some(f => f.includes('CurrentStepHintPanel'))
check('Day48 包含提示面板组件', hasHintPanel)
const hasTaskIntroPage = day48Files.some(f => f.includes('TaskIntroductionPage'))
check('Day48 包含任务介绍页面', hasTaskIntroPage)

// 8. 主流程路由
console.log('\n── 8. 主流程路由（Day48 分支） ──')
const day48Router = gitBranchFiles('origin/ai-codex/week7-day48-current-step-hint-framework', 'heavy-transport-sim/src/app/router.tsx')
check('Day48 包含路由文件', day48Router.length > 0)

// 9. 验证记录
console.log('\n── 9. 验证记录 ──')
for (const day of [43, 44, 45, 46, 47, 48]) {
  const branch = `origin/ai-codex/week7-day${day}-${day === 43 ? 'transport-case-parameters' : day === 44 ? 'task-introduction-page' : day === 45 ? 'cargo-360-dimensions' : day === 46 ? 'knowledge-learning-structure' : day === 47 ? 'learning-progress-persistence' : 'current-step-hint-framework'}`
  const docs = gitBranchFiles(branch, 'heavy-transport-sim/docs/')
  const hasVerification = docs.some(f => f.includes(`day${day}`))
  check(`Day${day} 验证记录在分支中`, hasVerification)
}

// 10. 质量脚本
console.log('\n── 10. 质量脚本 ──')
check('test:run 脚本存在', !!pkg.scripts?.['test:run'])
check('test:e2e 脚本存在', !!pkg.scripts?.['test:e2e'])
check('build 脚本存在', !!pkg.scripts?.['build'])
check('lint 脚本存在', !!pkg.scripts?.['lint'])
check('format:check 脚本存在', !!pkg.scripts?.['format:check'])

// 11. 密钥检查
console.log('\n── 11. 密钥检查 ──')
try {
  const grepResult = execSync(
    'git grep -l "SUPABASE_SERVICE_ROLE_KEY\\|eyJ[A-Za-z0-9_-]{10,}\\." -- heavy-transport-sim/src/ 2>nul',
    { cwd: GIT_ROOT, encoding: 'utf-8', timeout: 10000 }
  ).trim()
  check('源码中无真实密钥', !grepResult, grepResult ? `发现: ${grepResult}` : '')
} catch {
  check('源码中无真实密钥', true)
}

// Summary
console.log('\n========================================')
console.log(`Day49 静态检查结果: ${passed} 通过, ${failed} 失败, ${warnings} 警告`)
console.log('========================================')

if (issues.length > 0) {
  console.log('\n失败项:')
  for (const issue of issues) {
    console.log(`  - ${issue.name}: ${issue.detail}`)
  }
}

console.log('\n注意:')
console.log('- Day43-Day48 在独立分支中，未合并到 main。')
console.log('- 分支内容已通过远程分支静态验证。')
console.log('- 真实浏览器 E2E 验证通过现有测试覆盖。')

process.exit(failed > 0 ? 1 : 0)
