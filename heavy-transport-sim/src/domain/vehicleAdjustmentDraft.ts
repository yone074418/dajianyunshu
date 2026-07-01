import { z } from 'zod'
import { evaluateSlopeTraction, type SlopeTractionInput } from './slopeTraction'
import {
  evaluateHeightClearance,
  type HeightClearanceInput,
} from './heightClearance'

const nonEmptyString = z.string().trim().min(1)

export const ADJUSTMENT_TYPES = [
  'increase_tractor_count',
  'adjust_suspension_height',
] as const
export type AdjustmentType = (typeof ADJUSTMENT_TYPES)[number]

export const DRAFT_STATUSES = [
  'draft',
  'recalculated',
  'invalid',
  'blocked',
] as const
export type DraftStatus = (typeof DRAFT_STATUSES)[number]

export const RECALCULATION_STATUSES = [
  'not_run',
  'pass',
  'pass_with_warning',
  'fail',
  'blocked',
] as const
export type RecalculationStatus = (typeof RECALCULATION_STATUSES)[number]

export const LOG_ACTIONS = [
  'view_adjustment_requirement',
  'change_tractor_count',
  'change_suspension_height',
  'reset_adjustment',
  'run_recalculation',
  'recalculation_pass',
  'recalculation_fail',
  'recalculation_blocked',
] as const
export type LogAction = (typeof LOG_ACTIONS)[number]

export const vehicleAdjustmentDraftSchema = z.object({
  id: nonEmptyString,
  routeId: nonEmptyString,
  routeName: nonEmptyString,
  sourceRequirementId: nonEmptyString,
  sourceObstacleId: nonEmptyString,
  sourceRuleId: nonEmptyString,
  adjustmentType: z.enum(ADJUSTMENT_TYPES),
  before: z.object({
    tractorCount: z.number().int().positive().optional(),
    tractionForcePerTractorKN: z.number().positive().optional(),
    effectiveTractionKN: z.number().optional(),
    totalResistanceKN: z.number().optional(),
    suspensionHeightM: z.number().optional(),
    totalTransportHeightM: z.number().positive().optional(),
    measuredClearanceHeightM: z.number().positive().optional(),
    safetyMarginM: z.number().min(0).optional(),
    slopePercent: z.number().min(0).optional(),
    totalMassT: z.number().positive().optional(),
    drivetrainEfficiency: z.number().positive().max(1).optional(),
    rollingResistanceCoefficient: z.number().min(0).optional(),
  }),
  after: z.object({
    tractorCount: z.number().int().positive().optional(),
    suspensionHeightM: z.number().optional(),
    totalTransportHeightM: z.number().positive().optional(),
  }),
  status: z.enum(DRAFT_STATUSES),
  recalculationStatus: z.enum(RECALCULATION_STATUSES),
  recalculationResult: z.any().optional(),
  createdAt: nonEmptyString,
  updatedAt: nonEmptyString,
})

export type VehicleAdjustmentDraft = z.infer<
  typeof vehicleAdjustmentDraftSchema
>

export const vehicleAdjustmentLogSchema = z.object({
  id: nonEmptyString,
  routeId: nonEmptyString,
  requirementId: nonEmptyString,
  action: z.enum(LOG_ACTIONS),
  beforeValue: z.string().optional(),
  afterValue: z.string().optional(),
  ruleId: z.string().optional(),
  resultStatus: z.string().optional(),
  message: nonEmptyString,
  createdAt: nonEmptyString,
})

export type VehicleAdjustmentOperationLog = z.infer<
  typeof vehicleAdjustmentLogSchema
>

export const TRACTOR_COUNT_MIN = 1
export const TRACTOR_COUNT_MAX = 4
export const SUSPENSION_HEIGHT_ADJUST_MIN = -0.5
export const SUSPENSION_HEIGHT_ADJUST_MAX = 0.3
export const SUSPENSION_HEIGHT_STEP = 0.05

export const TEACHING_NOTE =
  '调整后必须重新计算规则，不能直接判定成功。增加牵引车或调整悬架高度后，需点击"重新计算"按钮调用规则引擎判断是否满足要求。'

export function createVehicleAdjustmentDraft(input: {
  routeId: string
  routeName: string
  sourceRequirementId: string
  sourceObstacleId: string
  sourceRuleId: string
  adjustmentType: AdjustmentType
  before: VehicleAdjustmentDraft['before']
}): VehicleAdjustmentDraft {
  const now = new Date().toISOString()
  return {
    id: `draft_${input.routeId}_${input.sourceObstacleId}_${input.adjustmentType}`,
    routeId: input.routeId,
    routeName: input.routeName,
    sourceRequirementId: input.sourceRequirementId,
    sourceObstacleId: input.sourceObstacleId,
    sourceRuleId: input.sourceRuleId,
    adjustmentType: input.adjustmentType,
    before: { ...input.before },
    after: {},
    status: 'draft',
    recalculationStatus: 'not_run',
    createdAt: now,
    updatedAt: now,
  }
}

export function applyTractorCountAdjustment(
  draft: VehicleAdjustmentDraft,
  nextTractorCount: number,
): { draft: VehicleAdjustmentDraft; errors: string[] } {
  const errors: string[] = []

  if (nextTractorCount < TRACTOR_COUNT_MIN) {
    errors.push(`牵引车数量不得低于${TRACTOR_COUNT_MIN}台`)
  }
  if (nextTractorCount > TRACTOR_COUNT_MAX) {
    errors.push(`牵引车数量不得超过${TRACTOR_COUNT_MAX}台`)
  }
  if (!Number.isInteger(nextTractorCount)) {
    errors.push('牵引车数量必须为整数')
  }

  if (errors.length > 0) {
    return { draft, errors }
  }

  const updated: VehicleAdjustmentDraft = {
    ...draft,
    after: {
      ...draft.after,
      tractorCount: nextTractorCount,
    },
    status: 'draft',
    recalculationStatus: 'not_run',
    recalculationResult: undefined,
    updatedAt: new Date().toISOString(),
  }
  return { draft: updated, errors: [] }
}

export function applySuspensionHeightAdjustment(
  draft: VehicleAdjustmentDraft,
  adjustMeters: number,
): { draft: VehicleAdjustmentDraft; errors: string[] } {
  const errors: string[] = []

  if (adjustMeters < SUSPENSION_HEIGHT_ADJUST_MIN) {
    errors.push(`悬架高度调整不得低于${SUSPENSION_HEIGHT_ADJUST_MIN}m`)
  }
  if (adjustMeters > SUSPENSION_HEIGHT_ADJUST_MAX) {
    errors.push(`悬架高度调整不得超过${SUSPENSION_HEIGHT_ADJUST_MAX}m`)
  }

  const currentHeight = draft.before.totalTransportHeightM
  if (currentHeight !== undefined) {
    const newHeight = currentHeight + adjustMeters
    if (newHeight <= 0) {
      errors.push('调整后运输总高度必须为正数')
    }
  }

  if (errors.length > 0) {
    return { draft, errors }
  }

  const currentTotalHeight = draft.before.totalTransportHeightM ?? 0
  const newTotalHeight = currentTotalHeight + adjustMeters

  const updated: VehicleAdjustmentDraft = {
    ...draft,
    after: {
      ...draft.after,
      totalTransportHeightM: Math.round(newTotalHeight * 100) / 100,
    },
    status: 'draft',
    recalculationStatus: 'not_run',
    recalculationResult: undefined,
    updatedAt: new Date().toISOString(),
  }
  return { draft: updated, errors: [] }
}

export function resetVehicleAdjustmentDraft(
  draft: VehicleAdjustmentDraft,
): VehicleAdjustmentDraft {
  return {
    ...draft,
    after: {},
    status: 'draft',
    recalculationStatus: 'not_run',
    recalculationResult: undefined,
    updatedAt: new Date().toISOString(),
  }
}

export function recalculateAfterVehicleAdjustment(
  draft: VehicleAdjustmentDraft,
): VehicleAdjustmentDraft {
  if (draft.adjustmentType === 'increase_tractor_count') {
    return recalculateSlopeTraction(draft)
  }
  if (draft.adjustmentType === 'adjust_suspension_height') {
    return recalculateHeightClearance(draft)
  }
  return {
    ...draft,
    status: 'blocked',
    recalculationStatus: 'blocked',
    updatedAt: new Date().toISOString(),
  }
}

function recalculateSlopeTraction(
  draft: VehicleAdjustmentDraft,
): VehicleAdjustmentDraft {
  const tractorCount = draft.after.tractorCount ?? draft.before.tractorCount
  const slopePercent = draft.before.slopePercent
  const totalMassT = draft.before.totalMassT
  const tractionForce = draft.before.tractionForcePerTractorKN
  const efficiency = draft.before.drivetrainEfficiency
  const rollingCoeff = draft.before.rollingResistanceCoefficient

  if (
    tractorCount === undefined ||
    slopePercent === undefined ||
    totalMassT === undefined ||
    tractionForce === undefined
  ) {
    return {
      ...draft,
      status: 'blocked',
      recalculationStatus: 'blocked',
      recalculationResult: undefined,
      updatedAt: new Date().toISOString(),
    }
  }

  const input: SlopeTractionInput = {
    routeId: draft.routeId,
    obstacleId: draft.sourceObstacleId,
    obstacleName: draft.sourceObstacleId,
    slope: { slopePercent },
    vehicle: {
      totalMassT,
      tractorCount,
      tractionForcePerTractorKN: tractionForce,
      drivetrainEfficiency: efficiency,
      rollingResistanceCoefficient: rollingCoeff,
    },
    measurementSource: 'manual_input',
  }

  const result = evaluateSlopeTraction(input)

  let recalculationStatus: RecalculationStatus
  if (result.status === 'pass') recalculationStatus = 'pass'
  else if (result.status === 'pass_with_warning')
    recalculationStatus = 'pass_with_warning'
  else if (result.status === 'fail') recalculationStatus = 'fail'
  else recalculationStatus = 'blocked'

  return {
    ...draft,
    status: 'recalculated',
    recalculationStatus,
    recalculationResult: result,
    updatedAt: new Date().toISOString(),
  }
}

function recalculateHeightClearance(
  draft: VehicleAdjustmentDraft,
): VehicleAdjustmentDraft {
  const totalTransportHeightM =
    draft.after.totalTransportHeightM ?? draft.before.totalTransportHeightM
  const measuredClearanceHeightM = draft.before.measuredClearanceHeightM
  const safetyMarginM = draft.before.safetyMarginM

  if (
    totalTransportHeightM === undefined ||
    measuredClearanceHeightM === undefined
  ) {
    return {
      ...draft,
      status: 'blocked',
      recalculationStatus: 'blocked',
      recalculationResult: undefined,
      updatedAt: new Date().toISOString(),
    }
  }

  const input: HeightClearanceInput = {
    routeId: draft.routeId,
    obstacleId: draft.sourceObstacleId,
    obstacleName: draft.sourceObstacleId,
    measuredClearanceHeightM,
    totalTransportHeightM,
    safetyMarginM,
    measurementSource: 'manual_input',
  }

  const result = evaluateHeightClearance(input)

  let recalculationStatus: RecalculationStatus
  if (result.status === 'pass') recalculationStatus = 'pass'
  else if (result.status === 'pass_with_warning')
    recalculationStatus = 'pass_with_warning'
  else if (result.status === 'fail') recalculationStatus = 'fail'
  else recalculationStatus = 'blocked'

  return {
    ...draft,
    status: 'recalculated',
    recalculationStatus,
    recalculationResult: result,
    updatedAt: new Date().toISOString(),
  }
}

export function createVehicleAdjustmentOperationLog(input: {
  routeId: string
  requirementId: string
  action: LogAction
  beforeValue?: string
  afterValue?: string
  ruleId?: string
  resultStatus?: string
  message: string
}): VehicleAdjustmentOperationLog {
  return {
    id: `log_${input.routeId}_${input.requirementId}_${input.action}_${Date.now()}`,
    routeId: input.routeId,
    requirementId: input.requirementId,
    action: input.action,
    beforeValue: input.beforeValue,
    afterValue: input.afterValue,
    ruleId: input.ruleId,
    resultStatus: input.resultStatus,
    message: input.message,
    createdAt: new Date().toISOString(),
  }
}

export function validateVehicleAdjustmentDraft(draft: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const parsed = vehicleAdjustmentDraftSchema.safeParse(draft)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}
