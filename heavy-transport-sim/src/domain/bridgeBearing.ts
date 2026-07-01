import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const finiteNumber = z.number().finite()

export const BRIDGE_BEARING_STATUSES = [
  'pass',
  'pass_with_warning',
  'fail',
  'blocked',
] as const
export type BridgeBearingStatus = (typeof BRIDGE_BEARING_STATUSES)[number]

export const BRIDGE_BEARING_BOUNDARY_CASES = [
  'load_below_limit',
  'load_equal_to_limit',
  'load_over_limit',
  'axle_load_over_limit',
  'missing_parameter',
  'invalid_parameter',
] as const
export type BridgeBearingBoundaryCase =
  (typeof BRIDGE_BEARING_BOUNDARY_CASES)[number]

export const BRIDGE_BEARING_CHECK_IDS = [
  'total_load_check',
  'single_axle_line_load_check',
  'parameter_completeness',
  'teaching_simplification_notice',
] as const
export type BridgeBearingCheckId = (typeof BRIDGE_BEARING_CHECK_IDS)[number]

export const BRIDGE_BEARING_MEASUREMENT_SOURCES = [
  'bridge_measurement_result',
  'teaching_config',
  'manual_input',
] as const
export type BridgeBearingMeasurementSource =
  (typeof BRIDGE_BEARING_MEASUREMENT_SOURCES)[number]

export const BRIDGE_KINDS = [
  'small_bridge',
  'medium_bridge',
  'large_bridge',
  'culvert_bridge',
  'temporary_bridge',
] as const
export type BridgeKind = (typeof BRIDGE_KINDS)[number]

export const bridgeBearingInputSchema = z.object({
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  obstacleName: nonEmptyString,
  bridge: z.object({
    bridgeName: nonEmptyString,
    bridgeKind: z.enum(BRIDGE_KINDS).optional(),
    loadLimitT: finiteNumber.positive(),
    deckWidthM: finiteNumber.positive().optional(),
    bridgeLengthM: finiteNumber.positive().optional(),
    singleAxleLineLimitT: finiteNumber.positive().optional(),
  }),
  vehicle: z.object({
    vehicleCombinationId: z.string().optional(),
    totalMassT: finiteNumber.positive(),
    cargoMassT: finiteNumber.min(0).optional(),
    tractorMassT: finiteNumber.min(0).optional(),
    trailerMassT: finiteNumber.min(0).optional(),
    axleLines: z.number().int().positive(),
    columns: z.number().int().positive().optional(),
    averageAxleLineLoadT: finiteNumber.positive().optional(),
  }),
  safetyFactor: finiteNumber.positive().optional(),
  measurementSource: z.enum(BRIDGE_BEARING_MEASUREMENT_SOURCES),
})

export type BridgeBearingInput = z.infer<typeof bridgeBearingInputSchema>

export interface BridgeBearingCheckResult {
  checkId: BridgeBearingCheckId
  status: BridgeBearingStatus
  passed: boolean
  reason: string
  teachingNote: string
  details?: Record<string, unknown>
}

export interface BridgeBearingRuleResult {
  ruleId: 'bridge_bearing'
  status: BridgeBearingStatus
  passed: boolean
  obstacleId: string
  obstacleName: string
  bridgeName: string
  loadLimitT?: number
  totalMassT?: number
  averageAxleLineLoadT?: number
  singleAxleLineLimitT?: number
  totalLoadMarginT?: number
  axleLoadMarginT?: number
  boundaryCase: BridgeBearingBoundaryCase
  checks: BridgeBearingCheckResult[]
  summary: string
  reasons: string[]
  teachingSimplificationNotice: string
  nextAction: string
  calculationProcess: string[]
  evaluatedAt: string
  engineVersion: string
}

export function validateBridgeBearingInput(input: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const parsed = bridgeBearingInputSchema.safeParse(input)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}

export function calculateTotalBridgeLoad(
  totalMassT: number,
  safetyFactor: number,
): number {
  return Math.round(totalMassT * safetyFactor * 100) / 100
}

export function calculateAverageAxleLineLoad(
  totalMassT: number,
  axleLines: number,
): number {
  if (axleLines <= 0) return 0
  return Math.round((totalMassT / axleLines) * 100) / 100
}

export function calculateBridgeLoadMargin(
  loadLimitT: number,
  checkedTotalMassT: number,
): number {
  return Math.round((loadLimitT - checkedTotalMassT) * 100) / 100
}

export function calculateAxleLoadMargin(
  singleAxleLineLimitT: number,
  averageAxleLineLoadT: number,
): number {
  return Math.round((singleAxleLineLimitT - averageAxleLineLoadT) * 100) / 100
}

export const TEACHING_SIMPLIFICATION_NOTICE =
  '本结果为虚拟仿真实验中的教学简化判断，仅用于学习桥梁限载与车辆荷载关系，不替代真实桥梁结构验算、检测报告或通行审批。'

export const DEFAULT_SINGLE_AXLE_LINE_LIMIT_T = 18

export function evaluateBridgeBearing(
  input: BridgeBearingInput,
): BridgeBearingRuleResult {
  const now = new Date().toISOString()
  const version = '1.0.0'
  const checks: BridgeBearingCheckResult[] = []
  const reasons: string[] = []
  const process: string[] = []

  const base: Omit<
    BridgeBearingRuleResult,
    'status' | 'passed' | 'summary' | 'nextAction' | 'boundaryCase'
  > = {
    ruleId: 'bridge_bearing',
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    bridgeName: input.bridge.bridgeName,
    checks,
    reasons,
    teachingSimplificationNotice: TEACHING_SIMPLIFICATION_NOTICE,
    calculationProcess: process,
    evaluatedAt: now,
    engineVersion: version,
  }

  // Parameter completeness check
  const missingParams: string[] = []
  if (!input.bridge.bridgeName) missingParams.push('桥梁名称')
  if (!input.bridge.loadLimitT || input.bridge.loadLimitT <= 0)
    missingParams.push('桥梁限载')
  if (!input.vehicle.totalMassT || input.vehicle.totalMassT <= 0)
    missingParams.push('运输总质量')
  if (!input.vehicle.axleLines || input.vehicle.axleLines <= 0)
    missingParams.push('轴线数')

  if (missingParams.length > 0) {
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: `缺少以下参数：${missingParams.join('、')}。无法进行桥梁承载教学判断。`,
      teachingNote: '所有必填参数必须齐全才能进行教学简化判断。',
    })
    reasons.push(`缺少参数：${missingParams.join('、')}`)
    return {
      ...base,
      boundaryCase: 'missing_parameter',
      status: 'blocked',
      passed: false,
      summary: `缺少${missingParams.join('、')}，无法进行桥梁承载教学判断。请先完成桥梁信息查看和限载输入。`,
      nextAction: `请补充以下参数：${missingParams.join('、')}。`,
    }
  }

  // NaN/Infinity safety check
  if (
    !isFinite(input.bridge.loadLimitT) ||
    !isFinite(input.vehicle.totalMassT) ||
    !isFinite(input.vehicle.axleLines)
  ) {
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: '输入参数包含非有限数值（NaN或Infinity），无法进行判断。',
      teachingNote: '所有参数必须为有限数值。',
    })
    reasons.push('输入参数包含非有限数值')
    return {
      ...base,
      boundaryCase: 'invalid_parameter',
      status: 'blocked',
      passed: false,
      summary: '输入参数无效，无法进行桥梁承载教学判断。',
      nextAction: '请检查并修正输入参数。',
    }
  }

  // Validate optional parameters
  const safetyFactor = input.safetyFactor ?? 1.0
  const singleAxleLineLimitT =
    input.bridge.singleAxleLineLimitT ?? DEFAULT_SINGLE_AXLE_LINE_LIMIT_T

  if (safetyFactor <= 0) {
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: `安全系数 ${safetyFactor} 无效，必须大于0。`,
      teachingNote: '安全系数通常在1.0-1.2之间。',
    })
    reasons.push('安全系数参数无效')
    return {
      ...base,
      boundaryCase: 'invalid_parameter',
      status: 'blocked',
      passed: false,
      summary: '安全系数参数无效，无法计算校核总质量。',
      nextAction: '请将安全系数设置为大于0的值。',
    }
  }

  // Calculate values
  const checkedTotalMassT = calculateTotalBridgeLoad(
    input.vehicle.totalMassT,
    safetyFactor,
  )
  const averageAxleLineLoadT =
    input.vehicle.averageAxleLineLoadT ??
    calculateAverageAxleLineLoad(
      input.vehicle.totalMassT,
      input.vehicle.axleLines,
    )
  const totalLoadMarginT = calculateBridgeLoadMargin(
    input.bridge.loadLimitT,
    checkedTotalMassT,
  )
  const axleLoadMarginT = calculateAxleLoadMargin(
    singleAxleLineLimitT,
    averageAxleLineLoadT,
  )

  process.push(
    `校核总质量 = ${input.vehicle.totalMassT} t × ${safetyFactor} = ${checkedTotalMassT.toFixed(2)} t`,
  )
  process.push(
    `平均单轴线载荷 = ${input.vehicle.totalMassT} t ÷ ${input.vehicle.axleLines} 轴线 = ${averageAxleLineLoadT.toFixed(2)} t/轴线`,
  )
  process.push(
    `总质量余量 = ${input.bridge.loadLimitT} t - ${checkedTotalMassT.toFixed(2)} t = ${totalLoadMarginT.toFixed(2)} t`,
  )
  process.push(
    `轴线载荷余量 = ${singleAxleLineLimitT} t - ${averageAxleLineLoadT.toFixed(2)} t = ${axleLoadMarginT.toFixed(2)} t`,
  )

  // Teaching simplification notice check
  checks.push({
    checkId: 'teaching_simplification_notice',
    status: 'pass',
    passed: true,
    reason: TEACHING_SIMPLIFICATION_NOTICE,
    teachingNote: TEACHING_SIMPLIFICATION_NOTICE,
  })

  // Total load check
  if (totalLoadMarginT > 0.001) {
    checks.push({
      checkId: 'total_load_check',
      status: 'pass',
      passed: true,
      reason: `校核总质量 ${checkedTotalMassT.toFixed(2)} t 低于桥梁限载 ${input.bridge.loadLimitT.toFixed(2)} t，余量 ${totalLoadMarginT.toFixed(2)} t。`,
      teachingNote: '总质量满足桥梁限载要求。',
      details: {
        loadLimitT: input.bridge.loadLimitT,
        checkedTotalMassT,
        totalLoadMarginT,
      },
    })
  } else if (Math.abs(totalLoadMarginT) < 0.001) {
    checks.push({
      checkId: 'total_load_check',
      status: 'pass_with_warning',
      passed: true,
      reason: `校核总质量 ${checkedTotalMassT.toFixed(2)} t 等于桥梁限载 ${input.bridge.loadLimitT.toFixed(2)} t，处于边界值。`,
      teachingNote: '边界值情况下建议保留更大安全余量。',
      details: {
        loadLimitT: input.bridge.loadLimitT,
        checkedTotalMassT,
        totalLoadMarginT: 0,
      },
    })
  } else {
    checks.push({
      checkId: 'total_load_check',
      status: 'fail',
      passed: false,
      reason: `校核总质量 ${checkedTotalMassT.toFixed(2)} t 超过桥梁限载 ${input.bridge.loadLimitT.toFixed(2)} t，超出 ${Math.abs(totalLoadMarginT).toFixed(2)} t。`,
      teachingNote: '总质量超过桥梁限载时不能通过。',
      details: {
        loadLimitT: input.bridge.loadLimitT,
        checkedTotalMassT,
        totalLoadMarginT,
      },
    })
    reasons.push(
      `总质量超限：校核后 ${checkedTotalMassT.toFixed(2)} t，限载 ${input.bridge.loadLimitT.toFixed(2)} t。`,
    )
  }

  // Single axle line load check
  if (axleLoadMarginT > 0.001) {
    checks.push({
      checkId: 'single_axle_line_load_check',
      status: 'pass',
      passed: true,
      reason: `平均单轴线载荷 ${averageAxleLineLoadT.toFixed(2)} t/轴线 低于教学单轴线限值 ${singleAxleLineLimitT.toFixed(2)} t/轴线，余量 ${axleLoadMarginT.toFixed(2)} t。`,
      teachingNote: '轴线载荷满足教学限值要求。',
      details: {
        singleAxleLineLimitT,
        averageAxleLineLoadT,
        axleLoadMarginT,
      },
    })
  } else if (Math.abs(axleLoadMarginT) < 0.001) {
    checks.push({
      checkId: 'single_axle_line_load_check',
      status: 'pass_with_warning',
      passed: true,
      reason: `平均单轴线载荷 ${averageAxleLineLoadT.toFixed(2)} t/轴线 等于教学单轴线限值 ${singleAxleLineLimitT.toFixed(2)} t/轴线，处于边界值。`,
      teachingNote: '边界值情况下建议降低轴线载荷。',
      details: {
        singleAxleLineLimitT,
        averageAxleLineLoadT,
        axleLoadMarginT: 0,
      },
    })
  } else {
    checks.push({
      checkId: 'single_axle_line_load_check',
      status: 'fail',
      passed: false,
      reason: `平均单轴线载荷 ${averageAxleLineLoadT.toFixed(2)} t/轴线 超过教学单轴线限值 ${singleAxleLineLimitT.toFixed(2)} t/轴线，超出 ${Math.abs(axleLoadMarginT).toFixed(2)} t。`,
      teachingNote: '轴线载荷超过教学限值时不能通过。',
      details: {
        singleAxleLineLimitT,
        averageAxleLineLoadT,
        axleLoadMarginT,
      },
    })
    reasons.push(
      `轴线载荷超限：平均 ${averageAxleLineLoadT.toFixed(2)} t/轴线，限值 ${singleAxleLineLimitT.toFixed(2)} t/轴线。`,
    )
  }

  // Determine overall status
  const hasFail = checks.some(
    (c) =>
      c.status === 'fail' && c.checkId !== 'teaching_simplification_notice',
  )
  const hasWarning = checks.some(
    (c) =>
      c.status === 'pass_with_warning' &&
      c.checkId !== 'teaching_simplification_notice',
  )

  let overallStatus: BridgeBearingStatus
  let summary: string
  let nextAction: string
  let boundaryCase: BridgeBearingBoundaryCase

  if (hasFail) {
    overallStatus = 'fail'
    boundaryCase = checks.find(
      (c) => c.checkId === 'single_axle_line_load_check' && c.status === 'fail',
    )
      ? 'axle_load_over_limit'
      : 'load_over_limit'
    summary = `当前桥梁限载 ${input.bridge.loadLimitT.toFixed(2)} t，校核后总质量 ${checkedTotalMassT.toFixed(2)} t${totalLoadMarginT < 0 ? `，超过限载 ${Math.abs(totalLoadMarginT).toFixed(2)} t` : ''}；平均单轴线载荷 ${averageAxleLineLoadT.toFixed(2)} t/轴线${axleLoadMarginT < 0 ? `，超过限值 ${Math.abs(axleLoadMarginT).toFixed(2)} t` : ''}。按教学简化规则，不能通过该桥梁。建议选择限载更高的路线、降低总质量或重新配置车组。`
    nextAction = '请选择限载更高的路线、降低总质量或增加轴线数。'
  } else if (hasWarning) {
    overallStatus = 'pass_with_warning'
    boundaryCase = 'load_equal_to_limit'
    summary = `当前桥梁限载 ${input.bridge.loadLimitT.toFixed(2)} t，校核后总质量 ${checkedTotalMassT.toFixed(2)} t${Math.abs(totalLoadMarginT) < 0.001 ? '，处于边界值' : ''}；平均单轴线载荷 ${averageAxleLineLoadT.toFixed(2)} t/轴线${Math.abs(axleLoadMarginT) < 0.001 ? '，处于边界值' : ''}。教学规则判定为边界满足，但建议保留更大安全余量。`
    nextAction = '边界满足，建议检查是否可降低载荷以保留余量。'
  } else {
    overallStatus = 'pass'
    boundaryCase = 'load_below_limit'
    summary = `当前桥梁限载 ${input.bridge.loadLimitT.toFixed(2)} t，运输总质量 ${input.vehicle.totalMassT.toFixed(2)} t，校核后总质量 ${checkedTotalMassT.toFixed(2)} t，仍低于限载；平均单轴线载荷 ${averageAxleLineLoadT.toFixed(2)} t/轴线，低于教学单轴线限值 ${singleAxleLineLimitT.toFixed(2)} t/轴线。按教学简化规则，桥梁承载检查满足。`
    nextAction = '桥梁承载满足要求，可继续路线勘测。'
  }

  return {
    ...base,
    loadLimitT: input.bridge.loadLimitT,
    totalMassT: input.vehicle.totalMassT,
    averageAxleLineLoadT,
    singleAxleLineLimitT,
    totalLoadMarginT,
    axleLoadMarginT,
    boundaryCase,
    status: overallStatus,
    passed: !hasFail,
    summary,
    nextAction,
  }
}

export function formatBridgeBearingReason(
  result: BridgeBearingRuleResult,
): string {
  return result.summary
}
