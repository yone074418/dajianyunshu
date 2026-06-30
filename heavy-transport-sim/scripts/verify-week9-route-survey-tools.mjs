import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

let passed = 0
let failed = 0
const results = []

function check(name, ok, detail = '') {
  if (ok) {
    passed++
    results.push(`  PASS ${name}${detail ? ': ' + detail : ''}`)
  } else {
    failed++
    results.push(`  FAIL ${name}${detail ? ': ' + detail : ''}`)
  }
}

function fileExists(rel) {
  return existsSync(join(root, rel))
}

function readFile(rel) {
  return readFileSync(join(root, rel), 'utf-8')
}

function fileContains(rel, pattern) {
  if (!fileExists(rel)) return false
  return readFile(rel).includes(pattern)
}

function isGitTracked(relFromPackageRoot) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', relFromPackageRoot], {
      cwd: root,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

console.log('Day63 route survey tool acceptance check')
console.log('='.repeat(50))

console.log('\n1. Prior day baseline checks')
check(
  'Day57 verification record',
  fileExists('docs/day57-route-survey-scenes-obstacles-verification.md'),
)
check(
  'Day58 verification record',
  fileExists('docs/day58-route-switch-navigation-obstacle-list-verification.md'),
)
check(
  'Day59 verification record',
  fileExists('docs/day59-distance-height-measurement-tools-verification.md'),
)
check(
  'Day60 verification record',
  fileExists('docs/day60-slope-measurement-tool-verification.md'),
)
check(
  'Day61 curve measurement implemented',
  fileContains('src/domain/measurements.ts', 'createCurveParameterResult') &&
    fileContains('src/pages/route-survey/RouteSurveyPage.tsx', 'curve-radius-input') &&
    fileContains('src/pages/route-survey/RouteSurveyPage.test.tsx', 'btn-save-curve'),
)
check(
  'Day62 bridge input implemented',
  fileContains('src/domain/measurements.ts', 'createBridgeInfoMeasurementResult') &&
    fileContains('src/pages/route-survey/RouteSurveyPage.tsx', 'bridge-load-limit-input') &&
    fileContains('src/pages/route-survey/RouteSurveyPage.test.tsx', 'btn-save-bridge'),
)

console.log('\n2. Route data checks')
const routeData = 'src/domain/surveyRouteData.ts'
check('Route data file exists', fileExists(routeData))
check('Route A exists', fileContains(routeData, "id: 'route_a_urban_low_bridge'"))
check('Route B exists', fileContains(routeData, "id: 'route_b_industrial_direct'"))
check('Route C exists', fileContains(routeData, "id: 'route_c_mountain_slope'"))

console.log('\n3. Five obstacle type coverage')
check('height_limit obstacle', fileContains(routeData, "type: 'height_limit'"))
check('narrow_section obstacle', fileContains(routeData, "type: 'narrow_section'"))
check('slope obstacle', fileContains(routeData, "type: 'slope'"))
check('curve obstacle', fileContains(routeData, "type: 'curve'"))
check('bridge obstacle', fileContains(routeData, "type: 'bridge'"))

console.log('\n4. Route survey page checks')
const page = 'src/pages/route-survey/RouteSurveyPage.tsx'
check('Route survey page exists', fileExists(page))
check('Route navigation component', fileContains(page, 'RouteNavCard'))
check('Obstacle list component', fileContains(page, 'ObstacleListItem'))
check('Measurement panel component', fileContains(page, 'MeasurementPanel'))

console.log('\n5. Measurement tool checks')
const meas = 'src/domain/measurements.ts'
check('Measurement module exists', fileExists(meas))
check('Distance calculation function', fileContains(meas, 'export function calculateDistance'))
check('Height calculation function', fileContains(meas, 'export function calculateHeight'))
check('Slope calculation function', fileContains(meas, 'export function calculateSlopePercent'))
check('Curve parameter function', fileContains(meas, 'export function createCurveParameterResult'))
check(
  'Bridge information function',
  fileContains(meas, 'export function createBridgeInfoMeasurementResult'),
)

console.log('\n6. Measurement draft store checks')
const store = 'src/stores/route-survey/routeSurveyStore.ts'
check('Store file exists', fileExists(store))
check('upsertMeasurementDraft function', fileContains(store, 'upsertMeasurementDraft'))
check('bridge type support', fileContains(store, "'bridge'"))
check('curve type support', fileContains(store, "'curve'"))

console.log('\n7. Measurement UI checks')
check('Height measurement result display', fileContains(page, 'measurement-value'))
check('Distance measurement result display', fileContains(page, 'measurement-result'))
check('Slope process display', fileContains(page, 'measurement-process'))
check('Curve radius input', fileContains(page, 'curve-radius-input'))
check('Curve angle input', fileContains(page, 'curve-angle-input'))
check('Curve entrance width input', fileContains(page, 'curve-entrance-input'))
check('Curve exit width input', fileContains(page, 'curve-exit-input'))
check('Bridge load limit input', fileContains(page, 'bridge-load-limit-input'))
check('Bridge information card', fileContains(page, 'bridge-info-card'))
check('Clear measurement button', fileContains(page, 'btn-clear-measurement'))
check('Retake curve button', fileContains(page, 'btn-retake-curve'))
check('Clear bridge button', fileContains(page, 'btn-clear-bridge'))

console.log('\n8. Day64-Day65 integrated rule checks')
check('Height clearance rule module', fileExists('src/domain/heightClearance.ts'))
check('Height clearance panel', fileContains(page, 'height-clearance-panel'))
check('Circular curve rule module', fileExists('src/domain/circularCurveClearance.ts'))
check('Circular curve panel', fileContains(page, 'circular-curve-panel'))

console.log('\n9. Test file checks')
check('Measurement module tests', fileExists('src/domain/measurements.test.ts'))
check('Route page tests', fileExists('src/pages/route-survey/RouteSurveyPage.test.tsx'))
check('Store tests', fileExists('src/stores/route-survey/routeSurveyStore.test.ts'))
check('Day63 acceptance tests', fileExists('tests/unit/day63-route-survey-tools-acceptance.test.tsx'))
check('Day64 rule tests', fileExists('src/domain/heightClearance.test.ts'))
check('Day65 rule tests', fileExists('src/domain/circularCurveClearance.test.ts'))

console.log('\n10. Package script checks')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'))
check('test:run script', Boolean(pkg.scripts?.['test:run']))
check('test:e2e script', Boolean(pkg.scripts?.['test:e2e']))
check('build script', Boolean(pkg.scripts?.['build']))
check('lint script', Boolean(pkg.scripts?.['lint']))
check('format:check script', Boolean(pkg.scripts?.['format:check']))
check('verify:week9 script', Boolean(pkg.scripts?.['verify:week9']))

console.log('\n11. Secret tracking check')
check('No tracked .env.local', !isGitTracked('.env.local'))

console.log('\n' + '='.repeat(50))
console.log(`Result: ${passed} passed, ${failed} failed`)
console.log('='.repeat(50))

results.forEach((result) => console.log(result))

if (failed > 0) {
  console.log(`\n${failed} check(s) failed`)
  process.exit(1)
}

console.log('\nAll static checks passed')
