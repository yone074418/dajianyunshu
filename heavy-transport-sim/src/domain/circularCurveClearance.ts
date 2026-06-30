import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const finiteNumber = z.number().finite()

export const CIRCULAR_CURVE_CLEARANCE_STATUSES = [
  'pass',
  'pass_with_warning',
  'fail',
  'blocked',
] as const
export type CircularCurveClearanceStatus =
  (typeof CIRCULAR_CURVE_CLEARANCE_STATUSES)[number]

export const CIRCULAR_CURVE_CHECK_IDS = [
  'radius_check',
  'effective_width_check',
  'entrance_width_check',
  'exit_width_check',
  'parameter_completeness',
] as const
export type CircularCurveCheckId = (typeof CIRCULAR_CURVE_CHECK_IDS)[number]

export const CIRCULAR_CURVE_MEASUREMENT_SOURCES = [
  'curve_measurement_result',
  'teaching_config',
  'manual_input',
] as const
export type CircularCurveMeasurementSource =
  (typeof CIRCULAR_CURVE_MEASUREMENT_SOURCES)[number]

export const circularCurveClearanceInputSchema = z.object({
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  obstacleName: nonEmptyString,
  curveKind: z.literal('circular_curve'),
  vehicle: z.object({
    vehicleCombinationId: z.string().optional(),
    totalLengthM: finiteNumber.positive(),
    totalWidthM: finiteNumber.positive(),
    minTurningRadiusM: finiteNumber.positive(),
    rearSwingM: finiteNumber.min(0).optional(),
    frontOverhangM: finiteNumber.min(0).optional(),
    steeringMode: z
      .enum(['tractor_trailer', 'self_propelled_axle', 'teaching_simplified'])
      .optional(),
  }),
  curve: z.object({
    radiusM: finiteNumber.positive(),
    angleDeg: finiteNumber.positive().max(180),
    entranceWidthM: finiteNumber.positive(),
    exitWidthM: finiteNumber.positive(),
    effectiveWidthM: finiteNumber.positive().optional(),
  }),
  safetyMarginM: finiteNumber.min(0).optional(),
  measurementSource: z.enum(CIRCULAR_CURVE_MEASUREMENT_SOURCES),
})

export type CircularCurveClearanceInput = z.infer<
  typeof circularCurveClearanceInputSchema
>

export interface CircularCurveCheckResult {
  checkId: CircularCurveCheckId
  status: CircularCurveClearanceStatus
  passed: boolean
  reason: string
  teachingNote: string
  details?: Record<string, unknown>
}

export interface CircularCurveClearanceResult {
  ruleId: 'circular_curve_clearance'
  status: CircularCurveClearanceStatus
  passed: boolean
  obstacleId: string
  obstacleName: string
  requiredWidthM?: number
  radiusMarginM?: number
  widthMarginM?: number
  checks: CircularCurveCheckResult[]
  summary: string
  reasons: string[]
  teachingNote: string
  nextAction: string
  evaluatedAt: string
  engineVersion: string
}

export function validateCircularCurveInput(input: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const parsed = circularCurveClearanceInputSchema.safeParse(input)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}

export function calculateRequiredCircularCurveWidth(
  input: CircularCurveClearanceInput,
): number {
  const safetyMargin = input.safetyMarginM ?? 0
  const swingAmount = Math.max(
    0,
    (input.vehicle.totalLengthM / input.curve.radiusM) * 0.6,
  )
  return input.vehicle.totalWidthM + safetyMargin + swingAmount
}

export function evaluateCircularCurveClearance(
  input: CircularCurveClearanceInput,
): CircularCurveClearanceResult {
  const now = new Date().toISOString()
  const version = '1.0.0'
  const checks: CircularCurveCheckResult[] = []
  const reasons: string[] = []

  const base: Omit<
    CircularCurveClearanceResult,
    'status' | 'passed' | 'summary' | 'nextAction'
  > = {
    ruleId: 'circular_curve_clearance',
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    checks,
    reasons,
    evaluatedAt: now,
    engineVersion: version,
    teachingNote:
      '本规则为教学简化规则，基于车辆总长、总宽和最小转弯半径与弯道参数进行比较，不替代真实车辆扫掠轨迹分析。',
  }

  // Parameter completeness check
  const missingParams: string[] = []
  if (!input.vehicle.totalLengthM || input.vehicle.totalLengthM <= 0)
    missingParams.push('车辆总长')
  if (!input.vehicle.totalWidthM || input.vehicle.totalWidthM <= 0)
    missingParams.push('车辆总宽')
  if (!input.vehicle.minTurningRadiusM || input.vehicle.minTurningRadiusM <= 0)
    missingParams.push('最小转弯半径')
  if (!input.curve.radiusM || input.curve.radiusM <= 0)
    missingParams.push('弯道半径')
  if (!input.curve.entranceWidthM || input.curve.entranceWidthM <= 0)
    missingParams.push('入口宽度')
  if (!input.curve.exitWidthM || input.curve.exitWidthM <= 0)
    missingParams.push('出口宽度')

  if (missingParams.length > 0) {
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: `缺少以下参数：${missingParams.join('、')}。无法进行圆弧弯道通过性判断。`,
      teachingNote: '所有必填参数必须齐全才能进行教学简化判断。',
    })
    reasons.push(`缺少参数：${missingParams.join('、')}`)
    return {
      ...base,
      status: 'blocked',
      passed: false,
      summary: `缺少${missingParams.join('、')}，无法判断圆弧弯道是否可通过。请先补充车辆参数和弯道参数。`,
      nextAction: `请补充以下参数：${missingParams.join('、')}。`,
    }
  }

  // NaN/Infinity safety check
  if (
    !isFinite(input.vehicle.totalLengthM) ||
    !isFinite(input.vehicle.totalWidthM) ||
    !isFinite(input.vehicle.minTurningRadiusM) ||
    !isFinite(input.curve.radiusM) ||
    !isFinite(input.curve.entranceWidthM) ||
    !isFinite(input.curve.exitWidthM)
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
      status: 'blocked',
      passed: false,
      summary: '输入参数无效，无法判断圆弧弯道是否可通过。',
      nextAction: '请检查并修正输入参数。',
    }
  }

  const requiredWidth = calculateRequiredCircularCurveWidth(input)
  const effectiveWidth =
    input.curve.effectiveWidthM ??
    Math.min(input.curve.entranceWidthM, input.curve.exitWidthM)
  const safetyMargin = input.safetyMarginM ?? 0

  // Radius check
  const radiusDiff = input.curve.radiusM - input.vehicle.minTurningRadiusM
  if (radiusDiff < -0.001) {
    checks.push({
      checkId: 'radius_check',
      status: 'fail',
      passed: false,
      reason: `弯道半径 ${input.curve.radiusM.toFixed(2)} m 小于车辆最小转弯半径 ${input.vehicle.minTurningRadiusM.toFixed(2)} m，差距 ${Math.abs(radiusDiff).toFixed(2)} m。`,
      teachingNote:
        '车辆最小转弯半径是车辆能够完成转弯的最小弯道半径，小于该值车辆无法转弯。',
      details: {
        curveRadiusM: input.curve.radiusM,
        minTurningRadiusM: input.vehicle.minTurningRadiusM,
        marginM: radiusDiff,
      },
    })
    reasons.push(
      `弯道半径不足：需要 ${input.vehicle.minTurningRadiusM.toFixed(2)} m，实际 ${input.curve.radiusM.toFixed(2)} m。`,
    )
  } else if (Math.abs(radiusDiff) < 0.001) {
    checks.push({
      checkId: 'radius_check',
      status: 'pass_with_warning',
      passed: true,
      reason: `弯道半径 ${input.curve.radiusM.toFixed(2)} m 等于车辆最小转弯半径 ${input.vehicle.minTurningRadiusM.toFixed(2)} m，处于边界值。教学规则判定为可通过，但建议保留余量。`,
      teachingNote: '边界值情况下建议保留安全余量。',
      details: {
        curveRadiusM: input.curve.radiusM,
        minTurningRadiusM: input.vehicle.minTurningRadiusM,
        marginM: 0,
      },
    })
  } else {
    checks.push({
      checkId: 'radius_check',
      status: 'pass',
      passed: true,
      reason: `弯道半径 ${input.curve.radiusM.toFixed(2)} m 大于车辆最小转弯半径 ${input.vehicle.minTurningRadiusM.toFixed(2)} m，余量 ${radiusDiff.toFixed(2)} m。`,
      teachingNote: '半径满足要求。',
      details: {
        curveRadiusM: input.curve.radiusM,
        minTurningRadiusM: input.vehicle.minTurningRadiusM,
        marginM: radiusDiff,
      },
    })
  }

  // Effective width check
  const widthDiff = effectiveWidth - requiredWidth
  if (widthDiff < -0.001) {
    checks.push({
      checkId: 'effective_width_check',
      status: 'fail',
      passed: false,
      reason: `弯道有效宽度 ${effectiveWidth.toFixed(2)} m 小于教学简化所需宽度 ${requiredWidth.toFixed(2)} m（车辆宽度 ${input.vehicle.totalWidthM.toFixed(2)} m + 外摆量 ${((input.vehicle.totalLengthM / input.curve.radiusM) * 0.6).toFixed(2)} m + 安全余量 ${safetyMargin.toFixed(2)} m），差距 ${Math.abs(widthDiff).toFixed(2)} m。`,
      teachingNote:
        '教学简化所需宽度基于车辆宽度加外摆量和安全余量计算，不替代真实扫掠轨迹分析。',
      details: {
        effectiveWidthM: effectiveWidth,
        requiredWidthM: requiredWidth,
        marginM: widthDiff,
      },
    })
    reasons.push(
      `有效宽度不足：需要 ${requiredWidth.toFixed(2)} m，实际 ${effectiveWidth.toFixed(2)} m。`,
    )
  } else if (Math.abs(widthDiff) < 0.001) {
    checks.push({
      checkId: 'effective_width_check',
      status: 'pass_with_warning',
      passed: true,
      reason: `弯道有效宽度 ${effectiveWidth.toFixed(2)} m 等于教学简化所需宽度 ${requiredWidth.toFixed(2)} m，处于边界值。`,
      teachingNote: '边界值情况下建议保留宽度余量。',
      details: {
        effectiveWidthM: effectiveWidth,
        requiredWidthM: requiredWidth,
        marginM: 0,
      },
    })
  } else {
    checks.push({
      checkId: 'effective_width_check',
      status: 'pass',
      passed: true,
      reason: `弯道有效宽度 ${effectiveWidth.toFixed(2)} m 大于教学简化所需宽度 ${requiredWidth.toFixed(2)} m，余量 ${widthDiff.toFixed(2)} m。`,
      teachingNote: '宽度满足要求。',
      details: {
        effectiveWidthM: effectiveWidth,
        requiredWidthM: requiredWidth,
        marginM: widthDiff,
      },
    })
  }

  // Entrance width check
  const entranceDiff = input.curve.entranceWidthM - requiredWidth
  if (entranceDiff < -0.001) {
    checks.push({
      checkId: 'entrance_width_check',
      status: 'fail',
      passed: false,
      reason: `入口宽度 ${input.curve.entranceWidthM.toFixed(2)} m 小于所需宽度 ${requiredWidth.toFixed(2)} m。`,
      teachingNote: '入口宽度不足可能导致车辆无法进入弯道。',
      details: {
        entranceWidthM: input.curve.entranceWidthM,
        requiredWidthM: requiredWidth,
      },
    })
    reasons.push(
      `入口宽度不足：需要 ${requiredWidth.toFixed(2)} m，实际 ${input.curve.entranceWidthM.toFixed(2)} m。`,
    )
  } else {
    checks.push({
      checkId: 'entrance_width_check',
      status: 'pass',
      passed: true,
      reason: `入口宽度 ${input.curve.entranceWidthM.toFixed(2)} m 满足要求。`,
      teachingNote: '入口宽度满足要求。',
    })
  }

  // Exit width check
  const exitDiff = input.curve.exitWidthM - requiredWidth
  if (exitDiff < -0.001) {
    checks.push({
      checkId: 'exit_width_check',
      status: 'fail',
      passed: false,
      reason: `出口宽度 ${input.curve.exitWidthM.toFixed(2)} m 小于所需宽度 ${requiredWidth.toFixed(2)} m。`,
      teachingNote: '出口宽度不足可能导致车辆无法驶出弯道。',
      details: {
        exitWidthM: input.curve.exitWidthM,
        requiredWidthM: requiredWidth,
      },
    })
    reasons.push(
      `出口宽度不足：需要 ${requiredWidth.toFixed(2)} m，实际 ${input.curve.exitWidthM.toFixed(2)} m。`,
    )
  } else {
    checks.push({
      checkId: 'exit_width_check',
      status: 'pass',
      passed: true,
      reason: `出口宽度 ${input.curve.exitWidthM.toFixed(2)} m 满足要求。`,
      teachingNote: '出口宽度满足要求。',
    })
  }

  // Determine overall status
  const hasFail = checks.some((c) => c.status === 'fail')
  const hasWarning = checks.some((c) => c.status === 'pass_with_warning')

  let overallStatus: CircularCurveClearanceStatus
  let summary: string
  let nextAction: string

  if (hasFail) {
    overallStatus = 'fail'
    summary = `当前圆弧弯道不通过。${reasons.join(' ')}建议选择半径更大的路线、调整车组方案或重新规划绕行。`
    nextAction = '请选择半径更大或宽度更宽的路线，或调整车组方案。'
  } else if (hasWarning) {
    overallStatus = 'pass_with_warning'
    summary = `当前圆弧弯道可通过，但存在边界情况。${reasons.length > 0 ? reasons.join(' ') : '所有检查均通过（含边界值）。'}建议保留安全余量。`
    nextAction = '可通过，建议检查是否可增加安全余量。'
  } else {
    overallStatus = 'pass'
    summary = `当前圆弧弯道半径 ${input.curve.radiusM.toFixed(2)} m，大于车辆最小转弯半径 ${input.vehicle.minTurningRadiusM.toFixed(2)} m；弯道有效宽度 ${effectiveWidth.toFixed(2)} m，大于教学简化所需宽度 ${requiredWidth.toFixed(2)} m，判定为可通过。`
    nextAction = '可通过，继续后续路线勘测。'
  }

  return {
    ...base,
    status: overallStatus,
    passed: !hasFail,
    requiredWidthM: Math.round(requiredWidth * 100) / 100,
    radiusMarginM: Math.round(radiusDiff * 100) / 100,
    widthMarginM: Math.round(widthDiff * 100) / 100,
    summary,
    nextAction,
  }
}

export function formatCircularCurveReason(
  result: CircularCurveClearanceResult,
): string {
  return result.summary
}
