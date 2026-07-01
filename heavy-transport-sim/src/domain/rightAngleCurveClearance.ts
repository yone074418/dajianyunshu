import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const finiteNumber = z.number().finite()

export const RIGHT_ANGLE_CURVE_CLEARANCE_STATUSES = [
  'pass',
  'pass_with_warning',
  'fail',
  'blocked',
] as const
export type RightAngleCurveClearanceStatus =
  (typeof RIGHT_ANGLE_CURVE_CLEARANCE_STATUSES)[number]

export const RIGHT_ANGLE_CURVE_CHECK_IDS = [
  'exit_width_check',
  'entrance_width_check',
  'corner_width_check',
  'angle_check',
  'parameter_completeness',
] as const
export type RightAngleCurveCheckId =
  (typeof RIGHT_ANGLE_CURVE_CHECK_IDS)[number]

export const RIGHT_ANGLE_CURVE_MEASUREMENT_SOURCES = [
  'curve_measurement_result',
  'teaching_config',
  'manual_input',
] as const
export type RightAngleCurveMeasurementSource =
  (typeof RIGHT_ANGLE_CURVE_MEASUREMENT_SOURCES)[number]

export const rightAngleCurveClearanceInputSchema = z.object({
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  obstacleName: nonEmptyString,
  curveKind: z.literal('right_angle_curve'),
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
    angleDeg: finiteNumber.positive().max(180),
    entranceWidthM: finiteNumber.positive(),
    exitWidthM: finiteNumber.positive(),
    cornerEffectiveWidthM: finiteNumber.positive().optional(),
    innerClearanceM: finiteNumber.min(0).optional(),
    outerClearanceM: finiteNumber.min(0).optional(),
  }),
  safetyMarginM: finiteNumber.min(0).optional(),
  measurementSource: z.enum(RIGHT_ANGLE_CURVE_MEASUREMENT_SOURCES),
})

export type RightAngleCurveClearanceInput = z.infer<
  typeof rightAngleCurveClearanceInputSchema
>

export interface RightAngleCurveCheckResult {
  checkId: RightAngleCurveCheckId
  status: RightAngleCurveClearanceStatus
  passed: boolean
  reason: string
  teachingNote: string
  details?: Record<string, unknown>
}

export interface RightAngleCurveClearanceResult {
  ruleId: 'right_angle_curve_clearance'
  status: RightAngleCurveClearanceStatus
  passed: boolean
  obstacleId: string
  obstacleName: string
  requiredExitWidthM?: number
  requiredEntranceWidthM?: number
  exitWidthMarginM?: number
  entranceWidthMarginM?: number
  checks: RightAngleCurveCheckResult[]
  summary: string
  reasons: string[]
  teachingNote: string
  nextAction: string
  evaluatedAt: string
  engineVersion: string
}

export function validateRightAngleCurveInput(input: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const parsed = rightAngleCurveClearanceInputSchema.safeParse(input)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}

export function calculateRequiredExitWidth(
  input: RightAngleCurveClearanceInput,
): number {
  const safetyMargin = input.safetyMarginM ?? 0
  const swingAmount = Math.max(
    0,
    (input.vehicle.totalLengthM / input.vehicle.minTurningRadiusM) * 0.8,
  )
  return input.vehicle.totalWidthM + safetyMargin + swingAmount
}

export function calculateEntranceWidthMargin(
  input: RightAngleCurveClearanceInput,
): number {
  const safetyMargin = input.safetyMarginM ?? 0
  return input.curve.entranceWidthM - (input.vehicle.totalWidthM + safetyMargin)
}

export function calculateExitWidthMargin(
  input: RightAngleCurveClearanceInput,
): number {
  const requiredExitWidth = calculateRequiredExitWidth(input)
  return input.curve.exitWidthM - requiredExitWidth
}

export function evaluateRightAngleCurveClearance(
  input: RightAngleCurveClearanceInput,
): RightAngleCurveClearanceResult {
  const now = new Date().toISOString()
  const version = '1.0.0'
  const checks: RightAngleCurveCheckResult[] = []
  const reasons: string[] = []

  const base: Omit<
    RightAngleCurveClearanceResult,
    'status' | 'passed' | 'summary' | 'nextAction'
  > = {
    ruleId: 'right_angle_curve_clearance',
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    checks,
    reasons,
    evaluatedAt: now,
    engineVersion: version,
    teachingNote:
      '本规则为教学简化规则，基于车辆总长、总宽和最小转弯半径与直交弯道参数进行比较，不替代真实车辆扫掠轨迹分析。',
  }

  // Parameter completeness check
  const missingParams: string[] = []
  if (!input.vehicle.totalLengthM || input.vehicle.totalLengthM <= 0)
    missingParams.push('车辆总长')
  if (!input.vehicle.totalWidthM || input.vehicle.totalWidthM <= 0)
    missingParams.push('车辆总宽')
  if (!input.vehicle.minTurningRadiusM || input.vehicle.minTurningRadiusM <= 0)
    missingParams.push('最小转弯半径')
  if (!input.curve.angleDeg || input.curve.angleDeg <= 0)
    missingParams.push('弯道夹角')
  if (!input.curve.entranceWidthM || input.curve.entranceWidthM <= 0)
    missingParams.push('入口宽度')
  if (!input.curve.exitWidthM || input.curve.exitWidthM <= 0)
    missingParams.push('出口宽度')

  if (missingParams.length > 0) {
    checks.push({
      checkId: 'parameter_completeness',
      status: 'blocked',
      passed: false,
      reason: `缺少以下参数：${missingParams.join('、')}。无法进行直交弯道通过性判断。`,
      teachingNote: '所有必填参数必须齐全才能进行教学简化判断。',
    })
    reasons.push(`缺少参数：${missingParams.join('、')}`)
    return {
      ...base,
      status: 'blocked',
      passed: false,
      summary: `缺少${missingParams.join('、')}，无法判断直交弯道是否可通过。请先完成弯道参数测量或补充车辆参数。`,
      nextAction: `请补充以下参数：${missingParams.join('、')}。`,
    }
  }

  // NaN/Infinity safety check
  if (
    !isFinite(input.vehicle.totalLengthM) ||
    !isFinite(input.vehicle.totalWidthM) ||
    !isFinite(input.vehicle.minTurningRadiusM) ||
    !isFinite(input.curve.angleDeg) ||
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
      summary: '输入参数无效，无法判断直交弯道是否可通过。',
      nextAction: '请检查并修正输入参数。',
    }
  }

  const requiredExitWidth = calculateRequiredExitWidth(input)
  const safetyMargin = input.safetyMarginM ?? 0
  const requiredEntranceWidth = input.vehicle.totalWidthM + safetyMargin

  // Angle check - typical right angle is 90 degrees
  const angleDiff = Math.abs(input.curve.angleDeg - 90)
  if (angleDiff > 10) {
    checks.push({
      checkId: 'angle_check',
      status: 'fail',
      passed: false,
      reason: `弯道夹角 ${input.curve.angleDeg.toFixed(1)}° 偏离直交弯道范围（80°-100°）过大，差距 ${angleDiff.toFixed(1)}°。此弯道可能不是标准直交弯道。`,
      teachingNote:
        '直交弯道典型夹角为90°，教学规则适用于80°-100°范围内的弯道。',
      details: {
        angleDeg: input.curve.angleDeg,
        deviationFrom90: angleDiff,
      },
    })
    reasons.push(
      `夹角偏离直交范围：需要80°-100°，实际 ${input.curve.angleDeg.toFixed(1)}°。`,
    )
  } else if (angleDiff > 5) {
    checks.push({
      checkId: 'angle_check',
      status: 'pass_with_warning',
      passed: true,
      reason: `弯道夹角 ${input.curve.angleDeg.toFixed(1)}° 略偏离标准直交角度（90°），偏差 ${angleDiff.toFixed(1)}°。教学规则判定为可用，但建议注意实际转弯难度。`,
      teachingNote: '夹角偏离90°较大时，实际转弯难度可能增加。',
      details: {
        angleDeg: input.curve.angleDeg,
        deviationFrom90: angleDiff,
      },
    })
  } else {
    checks.push({
      checkId: 'angle_check',
      status: 'pass',
      passed: true,
      reason: `弯道夹角 ${input.curve.angleDeg.toFixed(1)}° 在直交弯道标准范围内。`,
      teachingNote: '夹角满足直交弯道要求。',
      details: {
        angleDeg: input.curve.angleDeg,
        deviationFrom90: angleDiff,
      },
    })
  }

  // Exit width check
  const exitWidthDiff = input.curve.exitWidthM - requiredExitWidth
  if (exitWidthDiff < -0.001) {
    checks.push({
      checkId: 'exit_width_check',
      status: 'fail',
      passed: false,
      reason: `出口宽度 ${input.curve.exitWidthM.toFixed(2)} m 小于教学简化所需最小出口宽度 ${requiredExitWidth.toFixed(2)} m（车辆宽度 ${input.vehicle.totalWidthM.toFixed(2)} m + 转弯外摆量 ${((input.vehicle.totalLengthM / input.vehicle.minTurningRadiusM) * 0.8).toFixed(2)} m + 安全余量 ${safetyMargin.toFixed(2)} m），差距 ${Math.abs(exitWidthDiff).toFixed(2)} m。`,
      teachingNote:
        '教学简化所需出口宽度基于车辆宽度加转弯外摆量和安全余量计算，不替代真实扫掠轨迹分析。',
      details: {
        exitWidthM: input.curve.exitWidthM,
        requiredExitWidthM: requiredExitWidth,
        marginM: exitWidthDiff,
      },
    })
    reasons.push(
      `出口宽度不足：需要 ${requiredExitWidth.toFixed(2)} m，实际 ${input.curve.exitWidthM.toFixed(2)} m。`,
    )
  } else if (Math.abs(exitWidthDiff) < 0.001) {
    checks.push({
      checkId: 'exit_width_check',
      status: 'pass_with_warning',
      passed: true,
      reason: `出口宽度 ${input.curve.exitWidthM.toFixed(2)} m 等于教学简化所需最小出口宽度 ${requiredExitWidth.toFixed(2)} m，处于边界值。教学规则判定为可通过，但建议保留余量。`,
      teachingNote: '边界值情况下建议保留宽度余量。',
      details: {
        exitWidthM: input.curve.exitWidthM,
        requiredExitWidthM: requiredExitWidth,
        marginM: 0,
      },
    })
  } else {
    checks.push({
      checkId: 'exit_width_check',
      status: 'pass',
      passed: true,
      reason: `出口宽度 ${input.curve.exitWidthM.toFixed(2)} m 大于教学简化所需最小出口宽度 ${requiredExitWidth.toFixed(2)} m，余量 ${exitWidthDiff.toFixed(2)} m。`,
      teachingNote: '出口宽度满足要求。',
      details: {
        exitWidthM: input.curve.exitWidthM,
        requiredExitWidthM: requiredExitWidth,
        marginM: exitWidthDiff,
      },
    })
  }

  // Entrance width check
  const entranceWidthDiff = input.curve.entranceWidthM - requiredEntranceWidth
  if (entranceWidthDiff < -0.001) {
    checks.push({
      checkId: 'entrance_width_check',
      status: 'fail',
      passed: false,
      reason: `入口宽度 ${input.curve.entranceWidthM.toFixed(2)} m 小于所需入口宽度 ${requiredEntranceWidth.toFixed(2)} m（车辆宽度 ${input.vehicle.totalWidthM.toFixed(2)} m + 安全余量 ${safetyMargin.toFixed(2)} m），差距 ${Math.abs(entranceWidthDiff).toFixed(2)} m。`,
      teachingNote: '入口宽度不足可能导致车辆无法进入弯道。',
      details: {
        entranceWidthM: input.curve.entranceWidthM,
        requiredEntranceWidthM: requiredEntranceWidth,
        marginM: entranceWidthDiff,
      },
    })
    reasons.push(
      `入口宽度不足：需要 ${requiredEntranceWidth.toFixed(2)} m，实际 ${input.curve.entranceWidthM.toFixed(2)} m。`,
    )
  } else if (Math.abs(entranceWidthDiff) < 0.001) {
    checks.push({
      checkId: 'entrance_width_check',
      status: 'pass_with_warning',
      passed: true,
      reason: `入口宽度 ${input.curve.entranceWidthM.toFixed(2)} m 等于所需入口宽度 ${requiredEntranceWidth.toFixed(2)} m，处于边界值。`,
      teachingNote: '边界值情况下建议保留入口宽度余量。',
      details: {
        entranceWidthM: input.curve.entranceWidthM,
        requiredEntranceWidthM: requiredEntranceWidth,
        marginM: 0,
      },
    })
  } else {
    checks.push({
      checkId: 'entrance_width_check',
      status: 'pass',
      passed: true,
      reason: `入口宽度 ${input.curve.entranceWidthM.toFixed(2)} m 满足车辆进入要求（需要 ${requiredEntranceWidth.toFixed(2)} m，余量 ${entranceWidthDiff.toFixed(2)} m）。`,
      teachingNote: '入口宽度满足要求。',
      details: {
        entranceWidthM: input.curve.entranceWidthM,
        requiredEntranceWidthM: requiredEntranceWidth,
        marginM: entranceWidthDiff,
      },
    })
  }

  // Corner effective width check (if provided)
  if (input.curve.cornerEffectiveWidthM !== undefined) {
    const cornerWidthDiff =
      input.curve.cornerEffectiveWidthM - requiredExitWidth
    if (cornerWidthDiff < -0.001) {
      checks.push({
        checkId: 'corner_width_check',
        status: 'fail',
        passed: false,
        reason: `转角有效宽度 ${input.curve.cornerEffectiveWidthM.toFixed(2)} m 小于所需最小出口宽度 ${requiredExitWidth.toFixed(2)} m，差距 ${Math.abs(cornerWidthDiff).toFixed(2)} m。`,
        teachingNote: '转角有效宽度不足可能导致车辆转弯时空间不够。',
        details: {
          cornerEffectiveWidthM: input.curve.cornerEffectiveWidthM,
          requiredExitWidthM: requiredExitWidth,
          marginM: cornerWidthDiff,
        },
      })
      reasons.push(
        `转角有效宽度不足：需要 ${requiredExitWidth.toFixed(2)} m，实际 ${input.curve.cornerEffectiveWidthM.toFixed(2)} m。`,
      )
    } else if (Math.abs(cornerWidthDiff) < 0.001) {
      checks.push({
        checkId: 'corner_width_check',
        status: 'pass_with_warning',
        passed: true,
        reason: `转角有效宽度 ${input.curve.cornerEffectiveWidthM.toFixed(2)} m 等于所需最小出口宽度 ${requiredExitWidth.toFixed(2)} m，处于边界值。`,
        teachingNote: '边界值情况下建议保留转角宽度余量。',
        details: {
          cornerEffectiveWidthM: input.curve.cornerEffectiveWidthM,
          requiredExitWidthM: requiredExitWidth,
          marginM: 0,
        },
      })
    } else {
      checks.push({
        checkId: 'corner_width_check',
        status: 'pass',
        passed: true,
        reason: `转角有效宽度 ${input.curve.cornerEffectiveWidthM.toFixed(2)} m 大于所需最小出口宽度 ${requiredExitWidth.toFixed(2)} m，余量 ${cornerWidthDiff.toFixed(2)} m。`,
        teachingNote: '转角有效宽度满足要求。',
        details: {
          cornerEffectiveWidthM: input.curve.cornerEffectiveWidthM,
          requiredExitWidthM: requiredExitWidth,
          marginM: cornerWidthDiff,
        },
      })
    }
  }

  // Determine overall status
  const hasFail = checks.some((c) => c.status === 'fail')
  const hasWarning = checks.some((c) => c.status === 'pass_with_warning')

  let overallStatus: RightAngleCurveClearanceStatus
  let summary: string
  let nextAction: string

  if (hasFail) {
    const failReasons = checks
      .filter((c) => c.status === 'fail')
      .map((c) => c.reason)
    overallStatus = 'fail'
    summary = `当前直交弯道不通过。${reasons.length > 0 ? reasons.join(' ') : failReasons.join(' ')}建议选择出口更宽的路线、调整车组方案或重新规划绕行。`
    nextAction = '请选择出口更宽或转角更大的路线，或调整车组方案。'
  } else if (hasWarning) {
    overallStatus = 'pass_with_warning'
    summary = `当前直交弯道可通过，但存在边界情况。${reasons.length > 0 ? reasons.join(' ') : '所有检查均通过（含边界值）。'}建议保留安全余量。`
    nextAction = '可通过，建议检查是否可增加安全余量。'
  } else {
    overallStatus = 'pass'
    summary = `当前直交弯道出口宽度 ${input.curve.exitWidthM.toFixed(2)} m，教学简化所需最小出口宽度 ${requiredExitWidth.toFixed(2)} m，余量 ${exitWidthDiff.toFixed(2)} m；入口宽度满足车辆进入要求，判定为可通过。`
    nextAction = '可通过，继续后续路线勘测。'
  }

  return {
    ...base,
    status: overallStatus,
    passed: !hasFail,
    requiredExitWidthM: Math.round(requiredExitWidth * 100) / 100,
    requiredEntranceWidthM: Math.round(requiredEntranceWidth * 100) / 100,
    exitWidthMarginM: Math.round(exitWidthDiff * 100) / 100,
    entranceWidthMarginM: Math.round(entranceWidthDiff * 100) / 100,
    summary,
    nextAction,
  }
}

export function formatRightAngleCurveReason(
  result: RightAngleCurveClearanceResult,
): string {
  return result.summary
}
