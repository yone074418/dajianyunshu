/**
 * Week 11 Vehicle Finalization Module Verification Script
 *
 * Checks that Day71—Day76 key artifacts exist and the closure loop is intact.
 * Does NOT connect to any database or use real credentials.
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const DOCS = join(ROOT, 'docs')

let passed = 0
let failed = 0
const failures = []

function check(label, condition) {
  if (condition) {
    passed++
    console.log(`  ✅ ${label}`)
  } else {
    failed++
    failures.push(label)
    console.log(`  ❌ ${label}`)
  }
}

function fileExists(rel) {
  return existsSync(join(ROOT, rel))
}

function srcExists(rel) {
  return existsSync(join(SRC, rel))
}

function docsExists(rel) {
  return existsSync(join(DOCS, rel))
}

function fileContains(rel, text) {
  try {
    const fullPath = rel.startsWith('src/') ? join(ROOT, rel) : join(SRC, rel)
    const content = readFileSync(fullPath, 'utf-8')
    return content.includes(text)
  } catch {
    return false
  }
}

console.log('=== Week 11 Vehicle Finalization Module Verification ===\n')

// ── 1. Day71—Day76 verification docs ──

console.log('1. Day71—Day76 verification documents')
check('Day73 verification doc exists', fileExists('docs/day73-trailer-axle-column-assembly-verification.md'))
check('Day74 verification doc exists', fileExists('docs/day74-hydraulic-three-point-selection-verification.md'))
check('Day75 verification doc exists', fileExists('docs/day75-valve-circuit-state-verification.md'))
check('Day76 verification doc exists', fileExists('docs/day76-axle-load-rule-reselection-flow-verification.md'))

// ── 2. Domain modules ──

console.log('\n2. Domain modules')
check('trailerAssembly.ts exists', srcExists('domain/trailerAssembly.ts'))
check('hydraulicSupport.ts exists', srcExists('domain/hydraulicSupport.ts'))
check('hydraulicValveCircuit.ts exists', srcExists('domain/hydraulicValveCircuit.ts'))
check('axleLoadRule.ts exists', srcExists('domain/axleLoadRule.ts'))
check('configurationRules.ts exists', srcExists('domain/configurationRules.ts'))
check('heightClearance.ts exists', srcExists('domain/heightClearance.ts'))
check('slopeTraction.ts exists', srcExists('domain/slopeTraction.ts'))
check('bridgeBearing.ts exists', srcExists('domain/bridgeBearing.ts'))

// ── 3. Key functions ──

console.log('\n3. Key functions')
check('trailerAssembly: validateTrailerAssemblyStep', fileContains('domain/trailerAssembly.ts', 'export function validateTrailerAssemblyStep'))
check('trailerAssembly: applyTrailerAssemblyStep', fileContains('domain/trailerAssembly.ts', 'export function applyTrailerAssemblyStep'))
check('trailerAssembly: completeTrailerAssemblyDraft', fileContains('domain/trailerAssembly.ts', 'export function completeTrailerAssemblyDraft'))
check('hydraulicSupport: selectHydraulicSupportPoint', fileContains('domain/hydraulicSupport.ts', 'export function selectHydraulicSupportPoint'))
check('hydraulicSupport: undoHydraulicSupportPoint', fileContains('domain/hydraulicSupport.ts', 'export function undoHydraulicSupportPoint'))
check('hydraulicSupport: validateThreePointSelection', fileContains('domain/hydraulicSupport.ts', 'export function validateThreePointSelection'))
check('hydraulicValveCircuit: toggleHydraulicValve', fileContains('domain/hydraulicValveCircuit.ts', 'export function toggleHydraulicValve'))
check('hydraulicValveCircuit: calculateRegionCircuitState', fileContains('domain/hydraulicValveCircuit.ts', 'export function calculateRegionCircuitState'))
check('hydraulicValveCircuit: calculateOverallCircuitState', fileContains('domain/hydraulicValveCircuit.ts', 'export function calculateOverallCircuitState'))
check('axleLoadRule: evaluateAxleLoadRule', fileContains('domain/axleLoadRule.ts', 'export function evaluateAxleLoadRule'))
check('axleLoadRule: createReselectionFlowState', fileContains('domain/axleLoadRule.ts', 'export function createReselectionFlowState'))
check('axleLoadRule: recalculateAxleLoadAfterReselection', fileContains('domain/axleLoadRule.ts', 'export function recalculateAxleLoadAfterReselection'))
check('axleLoadRule: confirmFinalVehicleConfiguration', fileContains('domain/axleLoadRule.ts', 'export function confirmFinalVehicleConfiguration'))

// ── 4. Pages ──

console.log('\n4. Pages')
check('TrailerAxleColumnAssemblyPage exists', srcExists('pages/trailer-assembly/TrailerAxleColumnAssemblyPage.tsx'))
check('HydraulicThreePointSelectionPage exists', srcExists('pages/hydraulic-support/HydraulicThreePointSelectionPage.tsx'))
check('HydraulicValveCircuitPage exists', srcExists('pages/hydraulic-valves/HydraulicValveCircuitPage.tsx'))
check('AxleLoadRulePage exists', srcExists('pages/axle-load/AxleLoadRulePage.tsx'))

// ── 5. Routes ──

console.log('\n5. Routes')
check('/student/trailer-assembly route', fileContains('src/app/router.tsx', "path: 'student/trailer-assembly'"))
check('/student/hydraulic-support route', fileContains('src/app/router.tsx', "path: 'student/hydraulic-support'"))
check('/student/hydraulic-valves route', fileContains('src/app/router.tsx', "path: 'student/hydraulic-valves'"))
check('/student/axle-load-check route', fileContains('src/app/router.tsx', "path: 'student/axle-load-check'"))

// ── 6. Tests ──

console.log('\n6. Test files')
check('trailerAssembly.test.ts exists', srcExists('domain/trailerAssembly.test.ts'))
check('hydraulicSupport.test.ts exists', srcExists('domain/hydraulicSupport.test.ts'))
check('hydraulicValveCircuit.test.ts exists', srcExists('domain/hydraulicValveCircuit.test.ts'))
check('axleLoadRule.test.ts exists', srcExists('domain/axleLoadRule.test.ts'))

// ── 7. Closure loop data structures ──

console.log('\n7. Closure loop data structures')
check('TrailerAssemblyResult type', fileContains('domain/trailerAssembly.ts', 'TrailerAssemblyResult'))
check('HydraulicThreePointResult type', fileContains('domain/hydraulicSupport.ts', 'HydraulicThreePointResult'))
check('HydraulicValveCircuitDraft type', fileContains('domain/hydraulicValveCircuit.ts', 'HydraulicValveCircuitDraft'))
check('AxleLoadRuleResult type', fileContains('domain/axleLoadRule.ts', 'AxleLoadRuleResult'))
check('FinalVehicleConfigurationSummary type', fileContains('domain/axleLoadRule.ts', 'FinalVehicleConfigurationSummary'))

// ── 8. Security checks ──

console.log('\n8. Security checks')
check('No .env.local tracked', !fileExists('.env.local'))
check('No SUPABASE_SERVICE_ROLE_KEY in source', !fileContains('domain/trailerAssembly.ts', 'SUPABASE_SERVICE_ROLE_KEY'))

// ── Summary ──

console.log(`\n${'='.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  - ${f}`)
}
console.log(`${'='.repeat(50)}`)

process.exit(failed > 0 ? 1 : 0)
