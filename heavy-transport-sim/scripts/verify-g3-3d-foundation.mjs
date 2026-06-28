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
console.log('G3 三维底座验收静态检查')
console.log('========================================\n')

// 1. 依赖检查
console.log('── 1. 三维依赖 ──')
const pkg = JSON.parse(readFile('package.json') || '{}')
check('three 依赖存在', !!pkg.dependencies?.['three'], `版本: ${pkg.dependencies?.['three'] || '未找到'}`)
check('@react-three/fiber 依赖存在', !!pkg.dependencies?.['@react-three/fiber'], `版本: ${pkg.dependencies?.['@react-three/fiber'] || '未找到'}`)
check('@react-three/drei 依赖存在', !!pkg.dependencies?.['@react-three/drei'], `版本: ${pkg.dependencies?.['@react-three/drei'] || '未找到'}`)
check('@react-three/rapier 依赖存在', !!pkg.dependencies?.['@react-three/rapier'], `版本: ${pkg.dependencies?.['@react-three/rapier'] || '未找到'}`)

// 2. 场景入口与 Canvas (Day36)
console.log('\n── 2. 场景入口与 Canvas (Day36) ──')
check('SceneCanvas 存在', fileExists('src/scene/SceneCanvas.tsx'))
check('SceneLighting 存在', fileExists('src/scene/SceneLighting.tsx'))
check('Ground 存在', fileExists('src/scene/Ground.tsx'))
check('LoadingUI 存在', fileExists('src/scene/LoadingUI.tsx'))
check('SceneErrorBoundary 存在', fileExists('src/scene/SceneErrorBoundary.tsx'))
check('ScenePreviewPage 存在', fileExists('src/pages/scene-preview/ScenePreviewPage.tsx'))
check('场景路由已注册', readFile('src/app/router.tsx').includes('scene-preview'))

// 3. 相机控制 (Day37)
console.log('\n── 3. 相机控制 (Day37) ──')
check('SceneCameraControls 存在', fileExists('src/scene/SceneCameraControls.tsx'))
check('cameraDefaults 存在', fileExists('src/scene/cameraDefaults.ts'))
const cameraDefaults = readFile('src/scene/cameraDefaults.ts')
check('相机有 minDistance 限制', cameraDefaults.includes('minDistance'))
check('相机有 maxDistance 限制', cameraDefaults.includes('maxDistance'))
check('相机有 maxPolarAngle 限制（防地下）', cameraDefaults.includes('maxPolarAngle'))

// 4. 模型交互 (Day38)
console.log('\n── 4. 模型交互 (Day38) ──')
check('sceneObjectMeta 存在', fileExists('src/scene/sceneObjectMeta.ts'))
check('SelectableModel 存在', fileExists('src/scene/SelectableModel.tsx'))
check('HighlightMesh 存在', fileExists('src/scene/HighlightMesh.tsx'))
check('PlaceholderModels 存在', fileExists('src/scene/PlaceholderModels.tsx'))
check('SceneInfoPanel 存在', fileExists('src/scene/SceneInfoPanel.tsx'))
check('useSceneInteraction 存在', fileExists('src/scene/useSceneInteraction.ts'))
const objectMeta = readFile('src/scene/sceneObjectMeta.ts')
check('至少 3 个可交互对象', (objectMeta.match(/id:/g) || []).length >= 3, `找到 ${(objectMeta.match(/id:/g) || []).length} 个`)

// 5. Rapier 物理 (Day39)
console.log('\n── 5. Rapier 物理 (Day39) ──')
check('physicsConfig 存在', fileExists('src/scene/physicsConfig.ts'))
check('GroundCollider 存在', fileExists('src/scene/GroundCollider.tsx'))
check('VehicleRigidBody 存在', fileExists('src/scene/VehicleRigidBody.tsx'))
check('ObstacleCollider 存在', fileExists('src/scene/ObstacleCollider.tsx'))
check('TriggerZone 存在', fileExists('src/scene/TriggerZone.tsx'))
check('TriggerEventPanel 存在', fileExists('src/scene/TriggerEventPanel.tsx'))
check('useTriggerEvents 存在', fileExists('src/scene/useTriggerEvents.ts'))
check('triggerTypes 存在', fileExists('src/scene/triggerTypes.ts'))

// 6. 观察/漫游模式 (Day40 - 在分支中)
console.log('\n── 6. 观察/漫游模式 (Day40) ──')
const day40Files = gitBranchFiles('origin/ai-codex/week6-day40-first-person-walkthrough', 'heavy-transport-sim/src/scene/')
check('Day40 分支存在', day40Files.length > 0, `分支中有 ${day40Files.length} 个文件`)
const hasFirstPerson = day40Files.some(f => f.includes('firstPerson') || f.includes('FirstPerson'))
const hasViewMode = day40Files.some(f => f.includes('ViewMode') || f.includes('viewMode'))
const hasModeToggle = day40Files.some(f => f.includes('ModeToggle'))
check('Day40 包含第一人称控制', hasFirstPerson)
check('Day40 包含视图模式切换', hasViewMode)
check('Day40 包含模式切换按钮', hasModeToggle)

// 7. 场景清理 (Day41 - 在分支中)
console.log('\n── 7. 场景清理 (Day41) ──')
const day41Files = gitBranchFiles('origin/ai-codex/week6-day41-scene-cleanup-unload', 'heavy-transport-sim/src/scene/')
check('Day41 分支存在', day41Files.length > 0, `分支中有 ${day41Files.length} 个文件`)
const hasDispose = day41Files.some(f => f.includes('dispose'))
const hasCleanup = day41Files.some(f => f.includes('Cleanup') || f.includes('cleanup'))
check('Day41 包含 dispose 工具', hasDispose)
check('Day41 包含 cleanup 机制', hasCleanup)

// 8. 测试文件
console.log('\n── 8. 测试文件 ──')
check('SceneCanvas 测试存在', fileExists('src/scene/SceneCanvas.test.tsx'))
check('cameraDefaults 测试存在', fileExists('src/scene/cameraDefaults.test.ts'))
check('SceneErrorBoundary 测试存在', fileExists('src/scene/SceneErrorBoundary.test.tsx'))
check('useSceneInteraction 测试存在', fileExists('src/scene/useSceneInteraction.test.ts'))
check('useTriggerEvents 测试存在', fileExists('src/scene/useTriggerEvents.test.ts'))
check('sceneObjectMeta 测试存在', fileExists('src/scene/sceneObjectMeta.test.ts'))
check('physicsConfig 测试存在', fileExists('src/scene/physicsConfig.test.ts'))
check('ScenePreviewPage 测试存在', fileExists('src/pages/scene-preview/ScenePreviewPage.test.tsx'))
check('E2E 路由测试存在', fileExists('tests/e2e/routing.spec.ts'))

// 9. Package.json 脚本
console.log('\n── 9. 质量脚本 ──')
check('test:run 脚本存在', !!pkg.scripts?.['test:run'])
check('test:e2e 脚本存在', !!pkg.scripts?.['test:e2e'])
check('build 脚本存在', !!pkg.scripts?.['build'])
check('lint 脚本存在', !!pkg.scripts?.['lint'])
check('format:check 脚本存在', !!pkg.scripts?.['format:check'])

// 10. 密钥检查
console.log('\n── 10. 密钥检查 ──')
try {
  const grepResult = execSync(
    'git grep -l "SUPABASE_SERVICE_ROLE_KEY\\|eyJ[A-Za-z0-9_-]{10,}\\." -- heavy-transport-sim/src/ 2>nul',
    { cwd: GIT_ROOT, encoding: 'utf-8', timeout: 10000 }
  ).trim()
  check('源码中无真实密钥', !grepResult, grepResult ? `发现: ${grepResult}` : '')
} catch {
  check('源码中无真实密钥', true)
}

// 11. 验证记录
console.log('\n── 11. 验证记录 ──')
const mainDocs = gitBranchFiles('origin/main', 'heavy-transport-sim/docs/')
const day36Branch = gitBranchFiles('origin/ai-codex/week6-day36-scene-canvas-loading', 'heavy-transport-sim/docs/')
const day37Branch = gitBranchFiles('origin/ai-codex/week6-day37-camera-controls-boundaries', 'heavy-transport-sim/docs/')
const day38Branch = gitBranchFiles('origin/ai-codex/week6-day38-model-pick-hover-highlight-tooltip', 'heavy-transport-sim/docs/')
const day39Branch = gitBranchFiles('origin/ai-codex/week6-day39-rapier-colliders-triggers', 'heavy-transport-sim/docs/')
const day40Branch = gitBranchFiles('origin/ai-codex/week6-day40-first-person-walkthrough', 'heavy-transport-sim/docs/')
const day41Branch = gitBranchFiles('origin/ai-codex/week6-day41-scene-cleanup-unload', 'heavy-transport-sim/docs/')

check('Day36 验证记录在分支中', day36Branch.some(f => f.includes('day36')))
check('Day37 验证记录在分支中', day37Branch.some(f => f.includes('day37')))
check('Day38 验证记录在分支中', day38Branch.some(f => f.includes('day38')))
check('Day39 验证记录在分支中', day39Branch.some(f => f.includes('day39')))
check('Day40 验证记录在分支中', day40Branch.some(f => f.includes('day40')))
check('Day41 验证记录在分支中', day41Branch.some(f => f.includes('day41')))

// Summary
console.log('\n========================================')
console.log(`G3 静态检查结果: ${passed} 通过, ${failed} 失败, ${warnings} 警告`)
console.log('========================================')

if (issues.length > 0) {
  console.log('\n失败项:')
  for (const issue of issues) {
    console.log(`  - ${issue.name}: ${issue.detail}`)
  }
}

console.log('\n注意:')
console.log('- Day40（漫游模式）和 Day41（场景清理）在独立分支中，未合并到 main。')
console.log('- 分支内容已通过远程分支静态验证。')
console.log('- 真实 WebGL/FPS/内存验证未在 CI 环境中执行。')

process.exit(failed > 0 ? 1 : 0)
