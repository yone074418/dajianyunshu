import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const finiteNumber = z.number().finite()

export const SLOPE_TRACTION_STATUSES = [
  'pass',
  'pass_with_warning',
  'fail',
  'blocked',
] as const
export type SlopeTractionStatus = (typeof SLOPE_TRACTION_STATUSES)[number]

export const SLOPE_TRACTION_BOUNDARY_CASES = [
  'traction_greater_than_resistance',
  'traction_equal_to_resistance',
  'traction_less_than_resistance',
  'missing_parameter',
  'invalid_parameter',
] as const
export type SlopeTractionBoundaryCase =
  (typeof SLOPE_TRACTION_BOUNDARY_CASES)[number]

export const SLOPE_TRACTION_CHECK_IDS = [
  'effective_traction_check',
  'grade_resistance_check',
  'rolling_resistance_check',
  'total_resistance_check',
  'parameter_completeness',
] as const
export type SlopeTractionCheckId = (typeof SLOPE_TRACTION_CHECK_IDS)[number]

export const SLOPE_TRACTION_MEASUREMENT_SOURCES = [
  'slope_measurement_result',
  'teaching_config',
  'manual_input',
] as const
export type SlopeTractionMeasurementSource =
  (typeof SLOPE_TRACTION_MEASUREMENT_SOURCES)[number]

export const slopeTractionInputSchema = z.object({
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  obstacleName: nonEmptyString,
  slope: z.object({
    slopePercent: finiteNumber.min(0).optional(),
    slopeAngleDeg: finiteNumber.min(0).optional(),
    horizontalDistanceM: finiteNumber.positive().optional(),
    verticalDistanceM: finiteNumber.min(0).optional(),
  }),
  vehicle: z.object({
    vehicleCombinationId: z.string().optional(),
    totalMassT: finiteNumber.positive(),
    tractorCount: z.number().int().positive(),
    tractionForcePerTractorKN: finiteNumber.positive(),
    drivetrainEfficiency: finiteNumber.positive().max(1).optional(),
    rollingResistanceCoefficient: finiteNumber.min(0).optional(),
  }),
  safetyFactor: finiteNumber.positive().optional(),
  measurementSource: z.enum(SLOPE_TRACTION_MEASUREMENT_SOURCES),
})

export type SlopeTractionInput = z.infer<typeof slopeTractionInputSchema>

export interface SlopeTractionCheckResult {
  checkId: SlopeTractionCheckId
  status: SlopeTractionStatus
  passed: boolean
  reason: string
  teachingNote: string
  details?: Record<string, unknown>
}

export interface SlopeTractionRuleResult {
  ruleId: 'slope_traction'
  status: SlopeTractionStatus
  passed: boolean
  obstacleId: string
  obstacleName: string
  slopePercent?: number
  totalMassT?: number
  effectiveTractionKN?: number
  gradeResistanceKN?: number
  rollingResistanceKN?: number
  totalResistanceKN?: number
  tractionMarginKN?: number
  boundaryCase: SlopeTractionBoundaryCase
  checks: SlopeTractionCheckResult[]
  summary: string
  reasons: string[]
  teachingNote: string
  nextAction: string
  calculationProcess: string[]
  evaluatedAt: string
  engineVersion: string
}

export function validateSlopeTractionInput(input: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const parsed = slopeTractionInputSchema.safeParse(input)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}

export function calculateSlopePercentFromDistances(
  horizontalDistanceM: number,
  verticalDistanceM: number,
): number | null {
  if (horizontalDistanceM <= 0 || !isFinite(horizontalDistanceM)) return null
  if (verticalDistanceM < 0 || !isFinite(verticalDistanceM)) return null
  return Math.round((verticalDistanceM / horizontalDistanceM) * 10000) / 100
}

export function calculateEffectiveTractionForce(
  input: SlopeTractionInput,
): number {
  const efficiency = input.vehicle.drivetrainEfficiency ?? 0.85
  return (
    input.vehicle.tractorCount *
    input.vehicle.tractionForcePerTractorKN *
    efficiency
  )
}

export function calculateGradeResistance(
  totalMassT: number,
  slopePercent: number,
): number {
  const g = 9.8
  return Math.round(totalMassT * g * (slopePercent / 100) * 100) / 100
}

export function calculateRollingResistance(
  totalMassT: number,
  rollingResistanceCoefficient: number,
): number {
  const g = 9.8
  return Math.round(totalMassT * g * rollingResistanceCoefficient * 100) / 100
}

export function calculateTotalSlopeResistance(
  gradeResistanceKN: number,
  rollingResistanceKN: number,
  safetyFactor: number,
): number {
  return (
    Math.round((gradeResistanceKN + rollingResistanceKN) * safetyFactor * 100) /
    100
  )
}

export function evaluateSlopeTraction(
  input: SlopeTractionInput,
): SlopeTractionRuleResult {
  const now = new Date().toISOString()
  const version = '1.0.0'
  const checks: SlopeTractionCheckResult[] = []
  const reasons: string[] = []
  const process: string[] = []

  const base: Omit<
    SlopeTractionRuleResult,
    'status' | 'passed' | 'summary' | 'nextAction' | 'boundaryCase'
  > = {
    ruleId: 'slope_traction',
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    checks,
    reasons,
    teachingNote:
      '本规则为教学简化规则，基于车辆总质量、牵引车数量和单车牵引力与坡道参数进行比较，不替代真实车辆动力学仿真或工程牵引校核。',
    calculationProcess: process,
    evaluatedAt: now,
    engineVersion: version,
  }

  // Determine slope percent
  let slopePercent: number | undefined = input.slope.slopePercent
  if (
    slopePercent === undefined &&
    input.slope.horizontalDistanceM !== undefined &&
    input.slope.verticalDistanceM !== undefined
  ) {
    slopePercent = calculateSlopePercentFromDistances(
      input.slope.horizontalDistanceM,
      input.slope.verticalDistanceM,
    )
    if (slopePercent !== null) {
      process.push(
        `坡度计算：${input.slope.verticalDistanceM} m ÷ ${input.slope.horizontalDistanceM} m × 100 = ${slopePercent}%`,
      )
    }
  }

  // Parameter completeness check
  const missingParams: string[] = []
  if (slopePercent === undefined || slopePercent === null)
    missingParams.push('坡度百分比')
  if (!input.vehicle.totalMassT || input.vehicle.totalMassT <= 0)
    missingParams.push('总质量')
  if (!input.vehicle.tractorCount || input.vehicle.tractorCount <= 0)
    missingParams.push('牵引车数量')
  if (
    !input.vehicle.tractionForcePerTractorKN ||
    input.vehicle.tractionForcePerTractorKN <= 0
  )
    missingParams.push('单车牵引力')

  if (missingParams.length > 0) {
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: `缺少以下参数：${missingParams.join('、')}。无法进行坡道牵引力判断。`,
      teachingNote: '所有必填参数必须齐全才能进行教学简化判断。',
    })
    reasons.push(`缺少参数：${missingParams.join('、')}`)
    return {
      ...base,
      boundaryCase: 'missing_parameter',
      status: 'blocked',
      passed: false,
      summary: `缺少${missingParams.join('、')}，无法判断坡道牵引力是否满足。请先完成坡度测量或补充车辆参数。`,
      nextAction: `请补充以下参数：${missingParams.join('、')}。`,
    }
  }

  // NaN/Infinity safety check
  if (
    !isFinite(slopePercent) ||
    !isFinite(input.vehicle.totalMassT) ||
    !isFinite(input.vehicle.tractorCount) ||
    !isFinite(input.vehicle.tractionForcePerTractorKN)
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
      summary: '输入参数无效，无法判断坡道牵引力是否满足。',
      nextAction: '请检查并修正输入参数。',
    }
  }

  // Validate optional parameters
  const efficiency = input.vehicle.drivetrainEfficiency ?? 0.85
  const rollingCoeff = input.vehicle.rollingResistanceCoefficient ?? 0.015
  const safetyFactor = input.safetyFactor ?? 1.0

  if (efficiency <= 0 || efficiency > 1) {
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: `传动效率 ${efficiency} 无效，必须大于0且小于等于1。`,
      teachingNote: '传动效率通常在0.7-0.9之间。',
    })
    reasons.push('传动效率参数无效')
    return {
      ...base,
      boundaryCase: 'invalid_parameter',
      status: 'blocked',
      passed: false,
      summary: '传动效率参数无效，无法计算有效牵引力。',
      nextAction: '请将传动效率设置为0到1之间的值。',
    }
  }

  if (rollingCoeff < 0) {
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: `滚动阻力系数 ${rollingCoeff} 无效，不能为负数。`,
      teachingNote: '滚动阻力系数通常在0.01-0.02之间。',
    })
    reasons.push('滚动阻力系数参数无效')
    return {
      ...base,
      boundaryCase: 'invalid_parameter',
      status: 'blocked',
      passed: false,
      summary: '滚动阻力系数参数无效，无法计算滚动阻力。',
      nextAction: '请将滚动阻力系数设置为0或正数。',
    }
  }

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
      summary: '安全系数参数无效，无法计算校核阻力。',
      nextAction: '请将安全系数设置为大于0的值。',
    }
  }

  // Calculate forces
  const effectiveTraction = calculateEffectiveTractionForce(input)
  const gradeResistance = calculateGradeResistance(
    input.vehicle.totalMassT,
    slopePercent,
  )
  const rollingResistance = calculateRollingResistance(
    input.vehicle.totalMassT,
    rollingCoeff,
  )
  const totalResistance = calculateTotalSlopeResistance(
    gradeResistance,
    rollingResistance,
    safetyFactor,
  )
  const margin = Math.round((effectiveTraction - totalResistance) * 100) / 100

  process.push(
    `有效牵引力 = ${input.vehicle.tractorCount} × ${input.vehicle.tractionForcePerTractorKN} kN × ${efficiency} = ${effectiveTraction.toFixed(2)} kN`,
  )
  process.push(
    `坡道阻力 = ${input.vehicle.totalMassT} t × 9.8 × ${slopePercent}% / 100 = ${gradeResistance.toFixed(2)} kN`,
  )
  process.push(
    `滚动阻力 = ${input.vehicle.totalMassT} t × 9.8 × ${rollingCoeff} = ${rollingResistance.toFixed(2)} kN`,
  )
  process.push(
    `总阻力 = (${gradeResistance.toFixed(2)} + ${rollingResistance.toFixed(2)}) × ${safetyFactor} = ${totalResistance.toFixed(2)} kN`,
  )
  process.push(
    `牵引力余量 = ${effectiveTraction.toFixed(2)} - ${totalResistance.toFixed(2)} = ${margin.toFixed(2)} kN`,
  )

  // Check effective traction
  checks.push({
    checkId: 'effective_traction_check',
    status: 'pass',
    passed: true,
    reason: `有效牵引力 ${effectiveTraction.toFixed(2)} kN（${input.vehicle.tractorCount}台牵引车 × ${input.vehicle.tractionForcePerTractorKN} kN × 效率${efficiency}）。`,
    teachingNote: '有效牵引力是牵引车数量、单车牵引力和传动效率的乘积。',
    details: {
      tractorCount: input.vehicle.tractorCount,
      tractionForcePerTractorKN: input.vehicle.tractionForcePerTractorKN,
      drivetrainEfficiency: efficiency,
      effectiveTractionKN: effectiveTraction,
    },
  })

  // Check grade resistance
  checks.push({
    checkId: 'grade_resistance_check',
    status: slopePercent > 0 ? 'pass' : 'pass',
    passed: true,
    reason: `坡道阻力 ${gradeResistance.toFixed(2)} kN（坡度 ${slopePercent}%）。`,
    teachingNote: '坡道阻力由总质量、重力加速度和坡度百分比决定。',
    details: {
      slopePercent,
      totalMassT: input.vehicle.totalMassT,
      gradeResistanceKN: gradeResistance,
    },
  })

  // Check rolling resistance
  checks.push({
    checkId: 'rolling_resistance_check',
    status: 'pass',
    passed: true,
    reason: `滚动阻力 ${rollingResistance.toFixed(2)} kN（滚动阻力系数 ${rollingCoeff}）。`,
    teachingNote: '滚动阻力由总质量、重力加速度和滚动阻力系数决定。',
    details: {
      rollingResistanceCoefficient: rollingCoeff,
      rollingResistanceKN: rollingResistance,
    },
  })

  // Check total resistance vs traction
  if (margin > 0.001) {
    checks.push({
      checkId: 'total_resistance_check',
      status: 'pass',
      passed: true,
      reason: `有效牵引力 ${effectiveTraction.toFixed(2)} kN 大于校核总阻力 ${totalResistance.toFixed(2)} kN，余量 ${margin.toFixed(2)} kN。`,
      teachingNote: '牵引力满足要求，有足够余量。',
      details: {
        effectiveTractionKN: effectiveTraction,
        totalResistanceKN: totalResistance,
        marginKN: margin,
      },
    })
    return {
      ...base,
      boundaryCase: 'traction_greater_than_resistance',
      slopePercent,
      totalMassT: input.vehicle.totalMassT,
      effectiveTractionKN: effectiveTraction,
      gradeResistanceKN: gradeResistance,
      rollingResistanceKN: rollingResistance,
      totalResistanceKN: totalResistance,
      tractionMarginKN: margin,
      status: 'pass',
      passed: true,
      summary: `当前有效牵引力 ${effectiveTraction.toFixed(2)} kN，总阻力 ${totalResistance.toFixed(2)} kN，牵引力余量 ${margin.toFixed(2)} kN。按教学简化规则，该坡道牵引力满足要求。`,
      nextAction: '牵引力满足要求，可继续路线勘测。',
    }
  }

  if (Math.abs(margin) < 0.001) {
    checks.push({
      checkId: 'total_resistance_check',
      status: 'pass_with_warning',
      passed: true,
      reason: `有效牵引力 ${effectiveTraction.toFixed(2)} kN 等于校核总阻力 ${totalResistance.toFixed(2)} kN，处于边界值。`,
      teachingNote: '边界值情况下建议保留牵引力余量。',
      details: {
        effectiveTractionKN: effectiveTraction,
        totalResistanceKN: totalResistance,
        marginKN: 0,
      },
    })
    return {
      ...base,
      boundaryCase: 'traction_equal_to_resistance',
      slopePercent,
      totalMassT: input.vehicle.totalMassT,
      effectiveTractionKN: effectiveTraction,
      gradeResistanceKN: gradeResistance,
      rollingResistanceKN: rollingResistance,
      totalResistanceKN: totalResistance,
      tractionMarginKN: 0,
      status: 'pass_with_warning',
      passed: true,
      summary: `当前有效牵引力 ${effectiveTraction.toFixed(2)} kN 等于校核总阻力 ${totalResistance.toFixed(2)} kN，处于边界值。教学规则判定为满足，但建议保留余量。`,
      nextAction: '边界满足，建议检查是否可增加牵引力或降低载荷以保留余量。',
    }
  }

  // Traction less than resistance
  checks.push({
    checkId: 'total_resistance_check',
    status: 'fail',
    passed: false,
    reason: `有效牵引力 ${effectiveTraction.toFixed(2)} kN 小于校核总阻力 ${totalResistance.toFixed(2)} kN，牵引力不足 ${Math.abs(margin).toFixed(2)} kN。`,
    teachingNote: '牵引力不足时，车辆无法克服坡道阻力和滚动阻力。',
    details: {
      effectiveTractionKN: effectiveTraction,
      totalResistanceKN: totalResistance,
      marginKN: margin,
    },
  })
  reasons.push(
    `牵引力不足：有效牵引力 ${effectiveTraction.toFixed(2)} kN，需要 ${totalResistance.toFixed(2)} kN。`,
  )

  return {
    ...base,
    boundaryCase: 'traction_less_than_resistance',
    slopePercent,
    totalMassT: input.vehicle.totalMassT,
    effectiveTractionKN: effectiveTraction,
    gradeResistanceKN: gradeResistance,
    rollingResistanceKN: rollingResistance,
    totalResistanceKN: totalResistance,
    tractionMarginKN: margin,
    status: 'fail',
    passed: false,
    summary: `当前有效牵引力 ${effectiveTraction.toFixed(2)} kN，小于校核总阻力 ${totalResistance.toFixed(2)} kN，牵引力不足 ${Math.abs(margin).toFixed(2)} kN。建议增加牵引车数量、降低总质量、选择坡度更小的路线或重新配置车组。`,
    nextAction: '请增加牵引车数量、降低总质量或选择坡度更小的路线。',
  }
}

export function formatSlopeTractionReason(
  result: SlopeTractionRuleResult,
): string {
  return result.summary
}
