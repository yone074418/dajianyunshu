import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const src = resolve(root, 'src')
const docs = resolve(root, 'docs')

let passed = 0
let failed = 0
const failures = []

function check(label, condition) {
  if (condition) {
    passed++
    console.log(`  ✓ ${label}`)
  } else {
    failed++
    failures.push(label)
    console.log(`  ✗ ${label}`)
  }
}

function fileExists(p) {
  return existsSync(resolve(root, p))
}

function srcExists(p) {
  return existsSync(resolve(src, p))
}

function docsExists(p) {
  return existsSync(resolve(docs, p))
}

function fileContains(filePath, ...strings) {
  try {
    const content = readFileSync(resolve(root, filePath), 'utf-8')
    return strings.every((s) => content.includes(s))
  } catch {
    return false
  }
}

console.log('\n=== Day70 G4 前三阶段静态验证 ===\n')

// 1. 检查 Day43—Day69 验证记录是否存在
console.log('1. 前置验证记录检查')
check('Day43 运输案例参数验证记录', docsExists('day43-transport-case-parameters-verification.md'))
check('Day44 任务介绍页面验证记录', docsExists('day44-task-introduction-page-verification.md'))
check('Day45 货物360查看验证记录', docsExists('day45-cargo-360-dimensions-verification.md'))
check('Day46 知识学习结构验证记录', docsExists('day46-knowledge-learning-structure-verification.md'))
check('Day47 学习进度持久化验证记录', docsExists('day47-learning-progress-persistence-verification.md'))
check('Day48 当前步骤提示框架验证记录', docsExists('day48-current-step-hint-framework-verification.md'))
check('Day49 第一阶段流程验收记录', docsExists('day49-first-stage-flow-acceptance.md'))
check('Day50 车辆组合数据验证记录', docsExists('day50-vehicle-combination-data-verification.md'))
check('Day51 组合选择动画验证记录', docsExists('day51-combination-selection-animation-verification.md'))
check('Day52 牵引车参数比较验证记录', docsExists('day52-tractor-parameters-comparison-verification.md'))
check('Day53 挂车轴线纵列选择验证记录', docsExists('day53-trailer-axle-column-selection-verification.md'))
check('Day54 简单配车规则引擎验证记录', docsExists('day54-simple-configuration-rule-engine-verification.md'))
check('Day55 配车选择日志验证记录', docsExists('day55-configuration-choice-logs-verification.md'))
check('Day56 简单配车模块验收记录', docsExists('day56-simple-configuration-module-acceptance.md'))
check('Day57 路线勘测场景障碍验证记录', docsExists('day57-route-survey-scenes-obstacles-verification.md'))
check('Day58 路线切换导航障碍列表验证记录', docsExists('day58-route-switch-navigation-obstacle-list-verification.md'))
check('Day59 距离高度测量工具验证记录', docsExists('day59-distance-height-measurement-tools-verification.md'))
check('Day60 坡度测量工具验证记录', docsExists('day60-slope-measurement-tool-verification.md'))
check('Day63 路线勘测工具验收记录', docsExists('day63-route-survey-tools-acceptance.md'))
check('Day64 高度通过性规则验证记录', docsExists('day64-height-clearance-rule-verification.md'))
check('Day65 圆弧弯道通过性规则验证记录', docsExists('day65-circular-curve-clearance-rule-verification.md'))

// 2. 检查任务案例数据
console.log('\n2. 任务与货物介绍检查')
check('transportCase.ts 存在', srcExists('domain/transportCase.ts'))
check('transportData.ts 存在', srcExists('domain/transportData.ts'))
check('任务案例包含货物参数', fileContains('src/domain/transportCase.ts', 'cargo', 'weight', 'length'))
check('task-introduction 页面存在', srcExists('pages/task-introduction'))

// 3. 检查配车数据和规则
console.log('\n3. 简单配车检查')
check('vehicleCombinations.ts 存在', srcExists('domain/vehicleCombinations.ts'))
check('tractors.ts 存在', srcExists('domain/tractors.ts'))
check('trailerSelection.ts 存在', srcExists('domain/trailerSelection.ts'))
check('configurationRules.ts 存在', srcExists('domain/configurationRules.ts'))
check('configurationLogs.ts 存在', srcExists('domain/configurationLogs.ts'))
check('vehicle-combinations 页面存在', srcExists('pages/vehicle-combinations'))
check('tractor 页面存在', srcExists('pages/tractors'))
check('trailer-selection 页面存在', srcExists('pages/trailer-selection'))
check('配车规则引擎包含通过/不通过判断', fileContains('src/domain/configurationRules.ts', 'pass', 'fail', 'reason'))
check('配车日志模块存在', fileContains('src/domain/configurationLogs.ts', 'selected', 'CONFIGURATION_LOG_EVENT_TYPES'))

// 4. 检查三条路线数据
console.log('\n4. 路线勘测检查')
check('surveyRoutes.ts 存在', srcExists('domain/surveyRoutes.ts'))
check('surveyRouteData.ts 存在', srcExists('domain/surveyRouteData.ts'))
check('route-survey 页面存在', srcExists('pages/route-survey'))
check('三条路线数据存在', fileContains('src/domain/surveyRouteData.ts', 'route_a', 'route_b', 'route_c'))
check('五类障碍覆盖：限高', fileContains('src/domain/surveyRouteData.ts', 'height_limit'))
check('五类障碍覆盖：弯道', fileContains('src/domain/surveyRouteData.ts', 'curve'))
check('五类障碍覆盖：坡道', fileContains('src/domain/surveyRouteData.ts', 'slope'))
check('五类障碍覆盖：桥梁', fileContains('src/domain/surveyRouteData.ts', 'bridge'))
check('五类障碍覆盖：狭窄路段', fileContains('src/domain/surveyRouteData.ts', 'narrow_section'))

// 5. 检查测量工具模块
console.log('\n5. 测量工具检查')
check('measurements.ts 存在', srcExists('domain/measurements.ts'))
check('测量模块包含距离测量', fileContains('src/domain/measurements.ts', 'distance', 'calculateHorizontalDistance'))
check('测量模块包含高度测量', fileContains('src/domain/measurements.ts', 'height', 'calculateVerticalDistance'))
check('测量模块包含坡度测量', fileContains('src/domain/measurements.ts', 'slope', 'calculateSlopePercent'))
check('测量模块包含弯道参数', fileContains('src/domain/measurements.ts', 'curve', 'createCurveParameterResult'))
check('测量模块包含桥梁信息', fileContains('src/domain/measurements.ts', 'bridge', 'createBridgeInfoMeasurementResult'))

// 6. 检查五类路线规则模块
console.log('\n6. 路线通行规则检查')
check('高度通过性规则存在', srcExists('domain/heightClearance.ts'))
check('圆弧弯道通过性规则存在', srcExists('domain/circularCurveClearance.ts'))
check('高度规则包含evaluate函数', fileContains('src/domain/heightClearance.ts', 'evaluateHeightClearance'))
check('圆弧弯道规则包含evaluate函数', fileContains('src/domain/circularCurveClearance.ts', 'evaluateCircularCurveClearance'))

// Day66-Day68 规则（待合并）
console.log('\n6b. Day66-Day68 规则检查（待合并）')
const hasRightAngle = srcExists('domain/rightAngleCurveClearance.ts')
const hasSlopeTraction = srcExists('domain/slopeTraction.ts')
const hasBridgeBearing = srcExists('domain/bridgeBearing.ts')
check('直交弯道规则存在（Day66待合并）', hasRightAngle)
check('坡道牵引力规则存在（Day67待合并）', hasSlopeTraction)
check('桥梁承载规则存在（Day68待合并）', hasBridgeBearing)
if (!hasRightAngle) console.log('  ⚠ 直交弯道规则尚未合并到main（Day66 worktree中已实现）')
if (!hasSlopeTraction) console.log('  ⚠ 坡道牵引力规则尚未合并到main（Day67 worktree中已实现）')
if (!hasBridgeBearing) console.log('  ⚠ 桥梁承载规则尚未合并到main（Day68 worktree中已实现）')

// 7. 检查路线建议汇总模块（Day69，待合并）
console.log('\n7. 路线建议汇总检查（Day69待合并）')
const hasRouteRecommendation = srcExists('domain/routeRecommendation.ts')
check('路线建议模块存在（Day69待合并）', hasRouteRecommendation)
if (hasRouteRecommendation) {
  check('路线建议包含buildRouteRecommendation', fileContains('src/domain/routeRecommendation.ts', 'buildRouteRecommendation'))
  check('路线建议包含rankRouteRecommendations', fileContains('src/domain/routeRecommendation.ts', 'rankRouteRecommendations'))
  check('路线建议包含TEACHING_NOTE', fileContains('src/domain/routeRecommendation.ts', 'TEACHING_NOTE'))
} else {
  console.log('  ⚠ 路线建议模块尚未合并到main（Day69 worktree中已实现）')
}

// 8. 检查 stores
console.log('\n8. 状态管理检查')
check('route-survey store 存在', srcExists('stores/route-survey'))
check('configuration store 存在', srcExists('stores/configuration'))
check('combinationSelection store 存在', srcExists('stores/combinationSelection.ts'))

// 9. 检查 package.json 脚本
console.log('\n9. package.json 脚本检查')
check('test:run 脚本存在', fileContains('package.json', '"test:run"'))
check('test:e2e 脚本存在', fileContains('package.json', '"test:e2e"'))
check('build 脚本存在', fileContains('package.json', '"build"'))
check('lint 脚本存在', fileContains('package.json', '"lint"'))
check('format:check 脚本存在', fileContains('package.json', '"format:check"'))

// 10. 检查没有 .env.local 被 Git 跟踪
console.log('\n10. 安全检查')
check('没有 .env.local 文件', !fileExists('.env.local'))
check('没有 .env 文件', !fileExists('.env'))

console.log(`\n=== 验证结果 ===`)
console.log(`通过: ${passed}`)
console.log(`失败: ${failed}`)
console.log(`总计: ${passed + failed}`)

if (failures.length > 0) {
  console.log('\n失败项:')
  failures.forEach((f) => console.log(`  - ${f}`))
}

console.log(`\nG4 静态检查: ${failed === 0 ? '通过' : '未通过'}`)

process.exit(failed > 0 ? 1 : 0)
