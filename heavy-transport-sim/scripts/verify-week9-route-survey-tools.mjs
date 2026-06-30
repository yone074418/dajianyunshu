import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

let passed = 0
let failed = 0
const results = []

function check(name, ok, detail = '') {
  if (ok) {
    passed++
    results.push(`  ✅ ${name}${detail ? ': ' + detail : ''}`)
  } else {
    failed++
    results.push(`  ❌ ${name}${detail ? ': ' + detail : ''}`)
  }
}

function fileExists(rel) {
  return existsSync(join(root, rel))
}

function fileContains(rel, pattern) {
  if (!fileExists(rel)) return false
  const content = readFileSync(join(root, rel), 'utf-8')
  return content.includes(pattern)
}

console.log('Day63 周工具验收静态检查')
console.log('='.repeat(50))

// 1. Check Day57-Day62 verification docs
console.log('\n1. 前置验证记录检查')
check('Day57 验证记录', fileExists('docs/day57-route-survey-scenes-obstacles-verification.md'))
check('Day58 验证记录', fileExists('docs/day58-route-switch-navigation-obstacle-list-verification.md'))
check('Day59 验证记录', fileExists('docs/day59-distance-height-measurement-tools-verification.md'))
check('Day60 验证记录', fileExists('docs/day60-slope-measurement-tool-verification.md'))
check('Day61 验证记录', fileExists('docs/day61-curve-parameter-measurement-verification.md'))
check('Day62 验证记录', fileExists('docs/day62-bridge-info-load-limit-input-verification.md'))

// 2. Check route data
console.log('\n2. 路线数据检查')
const routeData = 'src/domain/surveyRouteData.ts'
check('路线数据文件存在', fileExists(routeData))
check('路线A存在', fileContains(routeData, "id: 'route_a_urban_low_bridge'"))
check('路线B存在', fileContains(routeData, "id: 'route_b_industrial_direct'"))
check('路线C存在', fileContains(routeData, "id: 'route_c_mountain_slope'"))

// 3. Check five obstacle types
console.log('\n3. 五类障碍覆盖检查')
check('限高障碍 height_limit', fileContains(routeData, "type: 'height_limit'"))
check('狭窄路段 narrow_section', fileContains(routeData, "type: 'narrow_section'"))
check('坡道障碍 slope', fileContains(routeData, "type: 'slope'"))
check('弯道障碍 curve', fileContains(routeData, "type: 'curve'"))
check('桥梁障碍 bridge', fileContains(routeData, "type: 'bridge'"))

// 4. Check route survey page
console.log('\n4. 路线勘测页面检查')
const page = 'src/pages/route-survey/RouteSurveyPage.tsx'
check('路线勘测页面存在', fileExists(page))
check('路线导航组件', fileContains(page, 'RouteNavCard'))
check('障碍列表组件', fileContains(page, 'ObstacleListItem'))
check('测量面板组件', fileContains(page, 'MeasurementPanel'))

// 5. Check measurement tools
console.log('\n5. 测量工具检查')
const meas = 'src/domain/measurements.ts'
check('测量模块存在', fileExists(meas))
check('距离计算函数', fileContains(meas, 'export function calculateDistance'))
check('高度计算函数', fileContains(meas, 'export function calculateHeight'))
check('坡度计算函数', fileContains(meas, 'export function calculateSlopePercent'))
check('弯道参数创建函数', fileContains(meas, 'export function createCurveParameterResult'))
check('桥梁信息创建函数', fileContains(meas, 'export function createBridgeInfoMeasurementResult'))

// 6. Check measurement draft store
console.log('\n6. 测量草稿 Store 检查')
const store = 'src/stores/route-survey/routeSurveyStore.ts'
check('Store 文件存在', fileExists(store))
check('upsertMeasurementDraft 函数', fileContains(store, 'upsertMeasurementDraft'))
check('bridge 类型支持', fileContains(store, "'bridge'"))
check('curve 类型支持', fileContains(store, "'curve'"))

// 7. Check UI elements for each tool
console.log('\n7. 测量工具 UI 检查')
check('高度测量结果显示', fileContains(page, 'measurement-value'))
check('距离测量结果显示', fileContains(page, 'measurement-result'))
check('坡度计算过程显示', fileContains(page, 'measurement-process'))
check('弯道半径输入', fileContains(page, 'curve-radius-input'))
check('弯道夹角输入', fileContains(page, 'curve-angle-input'))
check('弯道入口宽度输入', fileContains(page, 'curve-entrance-input'))
check('弯道出口宽度输入', fileContains(page, 'curve-exit-input'))
check('桥梁限载输入', fileContains(page, 'bridge-load-limit-input'))
check('桥梁信息卡片', fileContains(page, 'bridge-info-card'))
check('清除测量按钮', fileContains(page, 'btn-clear-measurement'))
check('重测弯道按钮', fileContains(page, 'btn-retake-curve'))
check('重填桥梁按钮', fileContains(page, 'btn-clear-bridge'))

// 8. Check test files
console.log('\n8. 测试文件检查')
check('测量模块测试', fileExists('src/domain/measurements.test.ts'))
check('路线页面测试', fileExists('src/pages/route-survey/RouteSurveyPage.test.tsx'))
check('Store 测试', fileExists('src/stores/route-survey/routeSurveyStore.test.ts'))

// 9. Check package.json scripts
console.log('\n9. 脚本检查')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'))
check('test:run 脚本', !!pkg.scripts?.['test:run'])
check('test:e2e 脚本', !!pkg.scripts?.['test:e2e'])
check('build 脚本', !!pkg.scripts?.['build'])
check('lint 脚本', !!pkg.scripts?.['lint'])
check('format:check 脚本', !!pkg.scripts?.['format:check'])

// 10. Check no secrets
console.log('\n10. 安全检查')
check('无 .env.local 被跟踪', !fileExists('.env.local'))

// Summary
console.log('\n' + '='.repeat(50))
console.log(`结果: ${passed} 通过, ${failed} 失败`)
console.log('='.repeat(50))

results.forEach((r) => console.log(r))

if (failed > 0) {
  console.log(`\n⚠️ ${failed} 项检查未通过`)
  process.exit(1)
} else {
  console.log('\n✅ 所有静态检查通过')
}
