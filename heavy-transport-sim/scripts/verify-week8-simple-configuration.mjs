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

console.log('\n=== Day56 周模块静态验证 ===\n')

console.log('1. Day50 车辆组合数据')
check('vehicleCombinations.ts 存在', srcExists('domain/vehicleCombinations.ts'))
check('全挂组合数据', fileContains('src/domain/vehicleCombinations.ts', 'full_trailer_combination'))
check('半挂组合数据', fileContains('src/domain/vehicleCombinations.ts', 'semi_trailer_combination'))
check('自行式轴线车组合数据', fileContains('src/domain/vehicleCombinations.ts', 'self_propelled_modular_transporter'))
check('三类组合有 demoConfig', fileContains('src/domain/vehicleCombinations.ts', 'demoConfig'))
check('三类组合有 advantages', fileContains('src/domain/vehicleCombinations.ts', 'advantages'))
check('三类组合有 disadvantages', fileContains('src/domain/vehicleCombinations.ts', 'disadvantages'))
check('数据有 Zod schema 校验', fileContains('src/domain/vehicleCombinations.ts', 'vehicleCombinationSchema'))

console.log('\n2. Day51 组合选择与动画')
check('VehicleCombinationPage 存在', srcExists('pages/vehicle-combinations/VehicleCombinationPage.tsx'))
check('组合选择 store 存在', srcExists('stores/combinationSelection.ts'))
check('动画步骤数据存在', fileContains('src/domain/vehicleCombinations.ts', 'animationSteps'))

console.log('\n3. Day52 牵引车参数')
check('tractors.ts 存在', srcExists('domain/tractors.ts'))
check('6x6 牵引车数据', fileContains('src/domain/tractors.ts', 'tractor_6x6_heavy_duty'))
check('8x8 牵引车数据', fileContains('src/domain/tractors.ts', 'tractor_8x8_heavy_duty'))
check('尺寸参数存在', fileContains('src/domain/tractors.ts', 'dimensions'))
check('重量参数存在', fileContains('src/domain/tractors.ts', 'weights'))
check('动力参数存在', fileContains('src/domain/tractors.ts', 'power'))
check('TractorComparisonPage 存在', srcExists('pages/tractors/TractorComparisonPage.tsx'))

console.log('\n4. Day53 挂车轴线纵列选择')
check('trailerSelection.ts 存在', srcExists('domain/trailerSelection.ts'))
check('轴线数选项存在', fileContains('src/domain/trailerSelection.ts', 'AXLE_LINE_OPTIONS'))
check('纵列数选项存在', fileContains('src/domain/trailerSelection.ts', 'COLUMN_OPTIONS'))
check('合法组合规则存在', fileContains('src/domain/trailerSelection.ts', 'AXLE_COLUMN_RULES'))
check('非法组合有原因', fileContains('src/domain/trailerSelection.ts', 'allowed: false'))
check('validateTrailerSelection 存在', fileContains('src/domain/trailerSelection.ts', 'validateTrailerSelection'))
check('TrailerSelectionPage 存在', srcExists('pages/trailer-selection/TrailerSelectionPage.tsx'))

console.log('\n5. Day54 简单配车规则引擎')
check('configurationRules.ts 存在', srcExists('domain/configurationRules.ts'))
check('规则引擎可调用', fileContains('src/domain/configurationRules.ts', 'evaluateSimpleConfiguration'))
check('输入 schema 存在', fileContains('src/domain/configurationRules.ts', 'simpleConfigurationInputSchema'))
check('输出类型存在', fileContains('src/domain/configurationRules.ts', 'SimpleConfigurationEvaluationResult'))
check('重量适配规则', fileContains('src/domain/configurationRules.ts', 'CFG-WEIGHT'))
check('尺寸适配规则', fileContains('src/domain/configurationRules.ts', 'CFG-DIMENSION'))
check('牵引车动力规则', fileContains('src/domain/configurationRules.ts', 'CFG-TRACTOR-POWER'))
check('挂车合法性规则', fileContains('src/domain/configurationRules.ts', 'CFG-AXLE-COLUMN'))
check('完整性规则', fileContains('src/domain/configurationRules.ts', 'CFG-COMPLETENESS'))
check('ConfigurationRulePage 存在', srcExists('pages/configuration-rules/ConfigurationRulePage.tsx'))

console.log('\n6. Day55 配车日志与教师端时间线')
check('configurationLogs.ts 存在', srcExists('domain/configurationLogs.ts'))
check('configurationLogStore 存在', srcExists('stores/configuration/configurationLogStore.ts'))
check('ConfigurationTimelinePage 存在', srcExists('pages/teacher/ConfigurationTimelinePage.tsx'))
check('日志 schema 存在', fileContains('src/domain/configurationLogs.ts', 'configurationChoiceLogSchema'))
check('localStorage repository 存在', fileContains('src/domain/configurationLogs.ts', 'LocalConfigurationLogRepository'))
check('错误次数统计', fileContains('src/domain/configurationLogs.ts', 'getErrorCount'))
check('修改次数统计', fileContains('src/domain/configurationLogs.ts', 'getModificationCount'))

console.log('\n7. 路由结构')
check('组合选择路由', fileContains('src/app/router.tsx', 'vehicle-combinations'))
check('牵引车对比路由', fileContains('src/app/router.tsx', 'tractors'))
check('挂车选择路由', fileContains('src/app/router.tsx', 'trailer-selection'))
check('规则检查路由', fileContains('src/app/router.tsx', 'configuration-rules'))
check('教师时间线路由', fileContains('src/app/router.tsx', 'configuration-timeline'))

console.log('\n8. 测试文件')
check('vehicleCombinations 测试', srcExists('domain/vehicleCombinations.test.ts'))
check('tractors 测试', srcExists('domain/tractors.test.ts'))
check('trailerSelection 测试', srcExists('domain/trailerSelection.test.ts'))
check('configurationRules 测试', srcExists('domain/configurationRules.test.ts'))
check('configurationLogs 测试', srcExists('domain/configurationLogs.test.ts'))
check('configurationLogStore 测试', srcExists('stores/configuration/configurationLogStore.test.ts'))
check('ConfigurationTimelinePage 测试', srcExists('pages/teacher/ConfigurationTimelinePage.test.tsx'))
check('ConfigurationRulePage 测试', srcExists('pages/configuration-rules/ConfigurationRulePage.test.tsx'))

console.log('\n9. 密钥检查')
check('无 .env.local 被跟踪', !fileExists('.env.local'))
check('无 service role key', !fileContains('src/domain/vehicleCombinations.ts', 'SUPABASE_SERVICE_ROLE_KEY'))

console.log('\n10. Day50-55 验证记录')
check('Day50 验证记录', docsExists('day50-vehicle-combination-data-verification.md'))
check('Day51 验证记录', docsExists('day51-combination-selection-animation-verification.md'))
check('Day52 验证记录', docsExists('day52-tractor-parameters-comparison-verification.md'))
check('Day53 验证记录', docsExists('day53-trailer-axle-column-selection-verification.md'))
check('Day54 验证记录', docsExists('day54-simple-configuration-rule-engine-verification.md'))
check('Day55 验证记录', docsExists('day55-configuration-choice-logs-verification.md'))

console.log(`\n=== 结果: ${passed} 通过, ${failed} 失败 ===`)
if (failures.length > 0) {
  console.log('\n失败项:')
  failures.forEach((f) => console.log(`  - ${f}`))
}
console.log('')
process.exit(failed > 0 ? 1 : 0)
