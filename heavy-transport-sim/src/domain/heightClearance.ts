import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const finiteNumber = z.number().finite()

export const HEIGHT_CLEARANCE_STATUSES = [
  'pass',
  'pass_with_warning',
  'fail',
  'blocked',
] as const
export type HeightClearanceStatus = (typeof HEIGHT_CLEARANCE_STATUSES)[number]

export const BOUNDARY_CASES = [
  'below_limit',
  'equal_to_limit',
  'over_limit',
  'missing_parameter',
] as const
export type BoundaryCase = (typeof BOUNDARY_CASES)[number]

export const MEASUREMENT_SOURCES = [
  'height_measurement_result',
  'teaching_config',
  'manual_input',
  'computed_from_vehicle_and_cargo',
] as const
export type HeightMeasurementSource = (typeof MEASUREMENT_SOURCES)[number]

export const heightClearanceInputSchema = z.object({
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  obstacleName: nonEmptyString,
  measuredClearanceHeightM: finiteNumber.positive().optional(),
  cargoHeightM: finiteNumber.positive().optional(),
  vehicleDeckHeightM: finiteNumber.min(0).optional(),
  suspensionLiftM: finiteNumber.min(0).optional(),
  safetyMarginM: finiteNumber.min(0).optional(),
  totalTransportHeightM: finiteNumber.positive().optional(),
  measurementSource: z.enum(MEASUREMENT_SOURCES),
})

export type HeightClearanceInput = z.infer<typeof heightClearanceInputSchema>

export interface HeightClearanceRuleResult {
  ruleId: 'height_clearance'
  status: HeightClearanceStatus
  passed: boolean
  obstacleId: string
  obstacleName: string
  clearanceHeightM?: number
  totalTransportHeightM?: number
  safetyMarginM: number
  differenceM?: number
  boundaryCase: BoundaryCase
  reason: string
  teachingNote: string
  nextAction: string
  evaluatedAt: string
  engineVersion: string
}

export function validateHeightClearanceInput(input: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const parsed = heightClearanceInputSchema.safeParse(input)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}

export function calculateTotalTransportHeight(
  input: HeightClearanceInput,
): number | null {
  if (
    input.totalTransportHeightM !== undefined &&
    input.totalTransportHeightM > 0
  ) {
    return input.totalTransportHeightM
  }
  if (
    input.cargoHeightM !== undefined &&
    input.cargoHeightM > 0 &&
    input.vehicleDeckHeightM !== undefined &&
    input.vehicleDeckHeightM >= 0
  ) {
    return input.cargoHeightM + input.vehicleDeckHeightM
  }
  return null
}

export function evaluateHeightClearance(
  input: HeightClearanceInput,
): HeightClearanceRuleResult {
  const now = new Date().toISOString()
  const version = '1.0.0'
  const safetyMargin = input.safetyMarginM ?? 0

  const base: Omit<
    HeightClearanceRuleResult,
    'status' | 'passed' | 'boundaryCase' | 'reason' | 'nextAction'
  > = {
    ruleId: 'height_clearance',
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    safetyMarginM: safetyMargin,
    teachingNote:
      '本规则为教学简化规则，仅用于判断运输总高度是否超过限高障碍净空高度，不替代真实工程限高校核。',
    evaluatedAt: now,
    engineVersion: version,
  }

  if (
    input.measuredClearanceHeightM === undefined ||
    input.measuredClearanceHeightM === null
  ) {
    return {
      ...base,
      status: 'blocked',
      passed: false,
      boundaryCase: 'missing_parameter',
      reason: `缺少限高测量值，无法判断限高障碍"${input.obstacleName}"是否可通过。请先完成高度测量或补充限高参数。`,
      nextAction: '请完成高度测量或从教学配置中获取限高值。',
    }
  }

  if (
    input.measuredClearanceHeightM <= 0 ||
    !isFinite(input.measuredClearanceHeightM)
  ) {
    return {
      ...base,
      clearanceHeightM: input.measuredClearanceHeightM,
      status: 'blocked',
      passed: false,
      boundaryCase: 'missing_parameter',
      reason: `限高测量值 ${input.measuredClearanceHeightM} m 无效，必须为正数。`,
      nextAction: '请重新进行高度测量，确保限高值为正数。',
    }
  }

  const totalHeight = calculateTotalTransportHeight(input)

  if (totalHeight === null || totalHeight <= 0 || !isFinite(totalHeight)) {
    return {
      ...base,
      clearanceHeightM: input.measuredClearanceHeightM,
      status: 'blocked',
      passed: false,
      boundaryCase: 'missing_parameter',
      reason: `缺少运输总高度，无法判断限高障碍"${input.obstacleName}"是否可通过。请提供货物高度和车辆平台高度，或直接输入运输总高度。`,
      nextAction:
        '请提供货物高度（Day43）和车辆平台高度，或直接输入运输总高度。',
    }
  }

  if (safetyMargin < 0 || !isFinite(safetyMargin)) {
    return {
      ...base,
      clearanceHeightM: input.measuredClearanceHeightM,
      totalTransportHeightM: totalHeight,
      status: 'blocked',
      passed: false,
      boundaryCase: 'missing_parameter',
      reason: `安全余量 ${safetyMargin} m 无效，不能为负数。`,
      nextAction: '请将安全余量设置为 0 或正数。',
    }
  }

  const effectiveClearance = input.measuredClearanceHeightM - safetyMargin
  const diff = effectiveClearance - totalHeight

  if (totalHeight < effectiveClearance) {
    return {
      ...base,
      clearanceHeightM: input.measuredClearanceHeightM,
      totalTransportHeightM: totalHeight,
      differenceM: Math.round(diff * 100) / 100,
      status: 'pass',
      passed: true,
      boundaryCase: 'below_limit',
      reason: `当前限高 ${input.measuredClearanceHeightM.toFixed(2)} m，安全余量 ${safetyMargin.toFixed(2)} m，可用限高 ${effectiveClearance.toFixed(2)} m，运输总高度 ${totalHeight.toFixed(2)} m，余量 ${Math.abs(diff).toFixed(2)} m，可通过该限高障碍。`,
      nextAction: '可通过，继续后续路线勘测。',
    }
  }

  if (Math.abs(diff) < 0.001) {
    return {
      ...base,
      clearanceHeightM: input.measuredClearanceHeightM,
      totalTransportHeightM: totalHeight,
      differenceM: 0,
      status: 'pass_with_warning',
      passed: true,
      boundaryCase: 'equal_to_limit',
      reason: `当前限高 ${input.measuredClearanceHeightM.toFixed(2)} m，安全余量 ${safetyMargin.toFixed(2)} m，可用限高 ${effectiveClearance.toFixed(2)} m，运输总高度 ${totalHeight.toFixed(2)} m，处于边界值。教学规则判定为可通过，但建议保留安全余量。`,
      nextAction: '边界可通过，建议检查是否可降低装载高度以保留安全余量。',
    }
  }

  return {
    ...base,
    clearanceHeightM: input.measuredClearanceHeightM,
    totalTransportHeightM: totalHeight,
    differenceM: Math.round(diff * 100) / 100,
    status: 'fail',
    passed: false,
    boundaryCase: 'over_limit',
    reason: `当前限高 ${input.measuredClearanceHeightM.toFixed(2)} m，安全余量 ${safetyMargin.toFixed(2)} m，可用限高 ${effectiveClearance.toFixed(2)} m，运输总高度 ${totalHeight.toFixed(2)} m，超出 ${Math.abs(diff).toFixed(2)} m，不能通过该限高障碍。建议降低装载高度、调整车组高度或选择绕行路线。`,
    nextAction: '请降低装载高度、调整悬架高度或选择其他绕行路线。',
  }
}

export function formatHeightClearanceReason(
  result: HeightClearanceRuleResult,
): string {
  return result.reason
}
