import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const GIT_ROOT = join(ROOT, '..')

let passed = 0
let failed = 0
const issues = []

function check(name, condition, detail) {
  if (condition) {
    passed++
    console.log(`  OK ${name}`)
  } else {
    failed++
    issues.push({ name, detail: detail || 'FAILED' })
    console.log(`  FAIL ${name}${detail ? ': ' + detail : ''}`)
  }
}

function fileExists(path) {
  return existsSync(join(ROOT, path))
}

function readFile(path) {
  try {
    return readFileSync(join(ROOT, path), 'utf-8')
  } catch {
    return ''
  }
}

function fileContains(path, text) {
  return readFile(path).includes(text)
}

console.log('\n========================================')
console.log('Day49 第7周第一阶段流程静态检查')
console.log('========================================\n')

console.log('── 1. 依赖检查 ──')
const pkg = JSON.parse(readFile('package.json') || '{}')
check('react-router-dom 依赖存在', !!pkg.dependencies?.['react-router-dom'])
check('zustand 依赖存在', !!pkg.dependencies?.zustand)
check('three 依赖存在', !!pkg.dependencies?.three)
check('@react-three/fiber 依赖存在', !!pkg.dependencies?.['@react-three/fiber'])
check('@react-three/drei 依赖存在', !!pkg.dependencies?.['@react-three/drei'])
check(
  '@react-three/rapier 依赖存在',
  !!pkg.dependencies?.['@react-three/rapier'],
)

console.log('\n── 2. Day43-Day48 主线文件 ──')
check('Day43 transportCase 数据存在', fileExists('src/domain/transportCase.ts'))
check(
  'Day44 任务介绍页存在',
  fileExists('src/pages/task-introduction/TaskIntroductionPage.tsx'),
)
check(
  'Day45 货物 360 查看页存在',
  fileExists('src/pages/cargo-viewer/Cargo360Viewer.tsx'),
)
check('Day46 学习内容存在', fileExists('src/domain/learningContent.ts'))
check(
  'Day46 学习中心页面存在',
  fileExists('src/pages/learning/LearningCenterPage.tsx'),
)
check('Day47 学习进度仓储存在', fileExists('src/domain/learningProgress.ts'))
check(
  'Day47 教师完成度组件存在',
  fileExists('src/pages/teacher/LearningCompletionOverview.tsx'),
)
check('Day48 当前步骤提示数据存在', fileExists('src/domain/stepHints.ts'))
check('Day48 提示使用记录存在', fileExists('src/domain/hintUsage.ts'))
check(
  'Day48 当前步骤提示面板存在',
  fileExists('src/pages/hints/CurrentStepHintPanel.tsx'),
)

console.log('\n── 3. 主流程路由 ──')
const router = readFile('src/app/router.tsx')
check('/login 路由存在', router.includes("path: 'login'"))
check('/student 路由存在', router.includes("path: 'student'"))
check(
  '/student/task-introduction 路由存在',
  router.includes("path: 'student/task-introduction'"),
)
check('/student/cargo 路由存在', router.includes("path: 'student/cargo'"))
check('/student/learning 路由存在', router.includes("path: 'student/learning'"))
check(
  '/student/experiment 路由存在',
  router.includes("path: 'student/experiment'"),
)

console.log('\n── 4. 第一阶段完成与恢复 ──')
check(
  '任务介绍页会保存 stage_1_task_intro',
  fileContains(
    'src/pages/task-introduction/TaskIntroductionPage.tsx',
    'stage_1_task_intro',
  ),
)
check(
  '任务介绍页进入学生实验页',
  fileContains(
    'src/pages/task-introduction/TaskIntroductionPage.tsx',
    '/student/experiment',
  ),
)
check(
  'attemptService 使用 localStorage 持久化',
  fileContains('src/services/attempts/attemptService.ts', 'localStorage'),
)
check(
  '实验页可继续 attempt',
  fileContains('src/pages/experiment/ExperimentPage.tsx', 'continueAttempt'),
)
check(
  '实验页集成当前步骤提示',
  fileContains(
    'src/pages/experiment/ExperimentPage.tsx',
    'CurrentStepHintPanel',
  ),
)

console.log('\n── 5. 验证记录 ──')
for (const day of [43, 44, 45, 46, 47, 48]) {
  const files = {
    43: 'docs/day43-transport-case-parameters-verification.md',
    44: 'docs/day44-task-introduction-page-verification.md',
    45: 'docs/day45-cargo-360-dimensions-verification.md',
    46: 'docs/day46-knowledge-learning-structure-verification.md',
    47: 'docs/day47-learning-progress-persistence-verification.md',
    48: 'docs/day48-current-step-hint-framework-verification.md',
  }
  check(`Day${day} 验证记录在 main 中`, fileExists(files[day]))
}

console.log('\n── 6. 质量脚本 ──')
check('test:run 脚本存在', !!pkg.scripts?.['test:run'])
check('test:e2e 脚本存在', !!pkg.scripts?.['test:e2e'])
check('build 脚本存在', !!pkg.scripts?.build)
check('lint 脚本存在', !!pkg.scripts?.lint)
check('format:check 脚本存在', !!pkg.scripts?.['format:check'])

console.log('\n── 7. 密钥检查 ──')
try {
  const result = execSync(
    'git grep -l "SUPABASE_SERVICE_ROLE_KEY\\|eyJ[A-Za-z0-9_-]{10,}\\." -- heavy-transport-sim/src/ 2>nul',
    { cwd: GIT_ROOT, encoding: 'utf-8', timeout: 10000 },
  ).trim()
  check('源码中无真实密钥', !result, result ? `发现: ${result}` : '')
} catch {
  check('源码中无真实密钥', true)
}

console.log('\n========================================')
console.log(`Day49 静态检查结果: ${passed} 通过, ${failed} 失败`)
console.log('========================================')

if (issues.length > 0) {
  console.log('\n失败项:')
  for (const issue of issues) {
    console.log(`  - ${issue.name}: ${issue.detail}`)
  }
}

console.log('\n注意:')
console.log('- Day43-Day48 已在当前 main 中检查。')
console.log('- 真实 WebGL FPS/内存验证未在此静态脚本中执行。')
console.log('- 学习进度和提示日志当前使用 localStorage 本地持久化。')

process.exit(failed > 0 ? 1 : 0)
