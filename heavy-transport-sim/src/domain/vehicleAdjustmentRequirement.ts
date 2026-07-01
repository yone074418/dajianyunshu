import { z } from 'zod'
import type {
  ObstacleConclusionSummary,
  RouteRecommendationResult,
} from './routeRecommendation'

const nonEmptyString = z.string().trim().min(1)

export const VEHICLE_ADJUSTMENT_CATEGORIES = [
  'height_clearance',
  'slope_traction',
  'axle_load_distribution',
  'route_selection',
  'data_completion',
  'teaching_review',
] as const
export type VehicleAdjustmentCategory =
  (typeof VEHICLE_ADJUSTMENT_CATEGORIES)[number]

export const VEHICLE_ADJUSTMENT_ACTION_TYPES = [
  'lower_transport_height',
  'adjust_suspension_height',
  'increase_tractor_count',
  'reduce_total_mass',
  'increase_axle_lines',
  'increase_trailer_columns',
  'choose_alternative_route',
  'complete_measurement',
  'complete_vehicle_parameter',
  'review_teaching_rule',
] as const
export type VehicleAdjustmentActionType =
  (typeof VEHICLE_ADJUSTMENT_ACTION_TYPES)[number]

export const VEHICLE_ADJUSTMENT_REQUIREMENT_STATUSES = [
  'required',
  'recommended',
  'blocked',
  'not_applicable',
] as const
export type VehicleAdjustmentRequirementStatus =
  (typeof VEHICLE_ADJUSTMENT_REQUIREMENT_STATUSES)[number]

export const vehicleAdjustmentRequirementSchema = z.object({
  id: nonEmptyString,
  routeId: nonEmptyString,
  routeName: nonEmptyString,
  obstacleId: nonEmptyString,
  obstacleName: nonEmptyString,
  sourceRuleId: nonEmptyString,
  sourceStatus: z.enum(['fail', 'blocked', 'pass_with_warning', 'not_checked']),
  category: z.enum(VEHICLE_ADJUSTMENT_CATEGORIES),
  actionType: z.enum(VEHICLE_ADJUSTMENT_ACTION_TYPES),
  status: z.enum(VEHICLE_ADJUSTMENT_REQUIREMENT_STATUSES),
  title: nonEmptyString,
  reason: nonEmptyString,
  suggestedChange: nonEmptyString,
  expectedEffect: nonEmptyString,
  nextStepDay: z.number().int().positive().optional(),
  enabledInDay71: z.boolean(),
  teachingNote: nonEmptyString,
  createdAt: nonEmptyString,
})

export type VehicleAdjustmentRequirement = z.infer<
  typeof vehicleAdjustmentRequirementSchema
>

export const routeVehicleAdjustmentSummarySchema = z.object({
  routeId: nonEmptyString,
  routeName: nonEmptyString,
  sourceRouteFinalStatus: z.enum([
    'recommended',
    'available_with_warnings',
    'needs_modification',
    'blocked',
    'incomplete',
  ]),
  requirements: z.array(vehicleAdjustmentRequirementSchema),
  requiredCount: z.number().int().min(0),
  recommendedCount: z.number().int().min(0),
  blockedCount: z.number().int().min(0),
  hasHeightIssue: z.boolean(),
  hasSlopeIssue: z.boolean(),
  hasAxleLoadIssue: z.boolean(),
  summary: nonEmptyString,
  nextAction: nonEmptyString,
  teachingNote: nonEmptyString,
  generatedAt: nonEmptyString,
  engineVersion: nonEmptyString,
})

export type RouteVehicleAdjustmentSummary = z.infer<
  typeof routeVehicleAdjustmentSummarySchema
>

export const TEACHING_NOTE =
  '本车组调整要求基于教学简化路线结论映射，仅用于学习车组调整决策流程，不替代真实工程车组配置方案。Day71只生成调整要求，不执行调整动作；后续Day72—Day76才实现具体调整交互。'

export const ENGINE_VERSION = '1.0.0'

function createId(parts: string[]): string {
  return parts.filter(Boolean).join('_')
}

type NonPassObstacleStatus = Exclude<
  ObstacleConclusionSummary['status'],
  'pass'
>

function determineRequirementStatus(
  sourceStatus: NonPassObstacleStatus,
): VehicleAdjustmentRequirementStatus {
  switch (sourceStatus) {
    case 'fail':
      return 'required'
    case 'pass_with_warning':
      return 'recommended'
    case 'blocked':
    case 'not_checked':
      return 'blocked'
    default:
      return 'not_applicable'
  }
}

export function buildHeightAdjustmentRequirement(input: {
  routeId: string
  routeName: string
  obstacleId: string
  obstacleName: string
  sourceStatus: NonPassObstacleStatus
}): VehicleAdjustmentRequirement[] {
  const requirements: VehicleAdjustmentRequirement[] = []
  const status = determineRequirementStatus(input.sourceStatus)
  const now = new Date().toISOString()

  if (
    input.sourceStatus === 'not_checked' ||
    input.sourceStatus === 'blocked'
  ) {
    requirements.push({
      id: createId([
        input.routeId,
        input.obstacleId,
        'height',
        'complete_measurement',
      ]),
      routeId: input.routeId,
      routeName: input.routeName,
      obstacleId: input.obstacleId,
      obstacleName: input.obstacleName,
      sourceRuleId: 'height_clearance',
      sourceStatus: input.sourceStatus,
      category: 'data_completion',
      actionType: 'complete_measurement',
      status: 'blocked',
      title: '补充高度测量数据',
      reason: `"${input.obstacleName}"尚未完成高度通过性检查，缺少限高或运输总高度参数。`,
      suggestedChange: '返回路线勘测页面，完成该限高障碍的参数测量。',
      expectedEffect: '获取限高数据后可进行高度通过性规则校核。',
      enabledInDay71: true,
      teachingNote: TEACHING_NOTE,
      createdAt: now,
    })
    return requirements
  }

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'height',
      'lower_transport_height',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'height_clearance',
    sourceStatus: input.sourceStatus,
    category: 'height_clearance',
    actionType: 'lower_transport_height',
    status,
    title: '降低运输总高度',
    reason: `"${input.obstacleName}"高度通过性检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，运输总高度可能超过限高。`,
    suggestedChange: '尝试降低货物装载高度或调整车组底盘高度。',
    expectedEffect: '降低运输总高度后可能满足限高要求。',
    enabledInDay71: false,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'height',
      'adjust_suspension_height',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'height_clearance',
    sourceStatus: input.sourceStatus,
    category: 'height_clearance',
    actionType: 'adjust_suspension_height',
    status,
    title: '调整悬架高度',
    reason: `"${input.obstacleName}"高度通过性检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，可通过调整悬架降低运输高度。`,
    suggestedChange: '调整悬架高度以降低运输总高度，将由Day72实现调整交互。',
    expectedEffect: '悬架调整后可降低运输总高度，提高通过性。',
    nextStepDay: 72,
    enabledInDay71: false,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'height',
      'choose_alternative_route',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'height_clearance',
    sourceStatus: input.sourceStatus,
    category: 'route_selection',
    actionType: 'choose_alternative_route',
    status,
    title: '选择限高更大的路线',
    reason: `"${input.obstacleName}"高度通过性检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，当前路线限高条件不足。`,
    suggestedChange: '选择限高更高的其他路线。',
    expectedEffect: '选择限高更大的路线可避免高度超限问题。',
    enabledInDay71: true,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  return requirements
}

export function buildSlopeAdjustmentRequirement(input: {
  routeId: string
  routeName: string
  obstacleId: string
  obstacleName: string
  sourceStatus: NonPassObstacleStatus
}): VehicleAdjustmentRequirement[] {
  const requirements: VehicleAdjustmentRequirement[] = []
  const status = determineRequirementStatus(input.sourceStatus)
  const now = new Date().toISOString()

  if (
    input.sourceStatus === 'not_checked' ||
    input.sourceStatus === 'blocked'
  ) {
    requirements.push({
      id: createId([
        input.routeId,
        input.obstacleId,
        'slope',
        'complete_measurement',
      ]),
      routeId: input.routeId,
      routeName: input.routeName,
      obstacleId: input.obstacleId,
      obstacleName: input.obstacleName,
      sourceRuleId: 'slope_traction',
      sourceStatus: input.sourceStatus,
      category: 'data_completion',
      actionType: 'complete_measurement',
      status: 'blocked',
      title: '补充坡度测量数据',
      reason: `"${input.obstacleName}"尚未完成坡道牵引力检查，缺少坡度或车辆牵引力参数。`,
      suggestedChange: '返回路线勘测页面，完成该坡道的坡度测量。',
      expectedEffect: '获取坡度数据后可进行牵引力规则校核。',
      enabledInDay71: true,
      teachingNote: TEACHING_NOTE,
      createdAt: now,
    })
    return requirements
  }

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'slope',
      'increase_tractor_count',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'slope_traction',
    sourceStatus: input.sourceStatus,
    category: 'slope_traction',
    actionType: 'increase_tractor_count',
    status,
    title: '增加牵引车数量',
    reason: `"${input.obstacleName}"坡道牵引力检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，当前牵引力不足以克服坡道阻力。`,
    suggestedChange: '增加牵引车数量以提升爬坡能力，将由Day72实现调整交互。',
    expectedEffect: '增加牵引车后可提升总牵引力，满足坡道通行要求。',
    nextStepDay: 72,
    enabledInDay71: false,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'slope',
      'reduce_total_mass',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'slope_traction',
    sourceStatus: input.sourceStatus,
    category: 'slope_traction',
    actionType: 'reduce_total_mass',
    status,
    title: '降低运输总质量',
    reason: `"${input.obstacleName}"坡道牵引力检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，降低总质量可减小坡道阻力。`,
    suggestedChange: '尝试减少货物或车组质量以降低坡道阻力。',
    expectedEffect: '降低总质量后坡道阻力减小，更容易满足牵引力要求。',
    enabledInDay71: false,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'slope',
      'choose_alternative_route',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'slope_traction',
    sourceStatus: input.sourceStatus,
    category: 'route_selection',
    actionType: 'choose_alternative_route',
    status,
    title: '选择坡度更小的路线',
    reason: `"${input.obstacleName}"坡道牵引力检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，当前路线坡度过大。`,
    suggestedChange: '选择坡度更小的其他路线。',
    expectedEffect: '选择坡度更小的路线可降低牵引力要求。',
    enabledInDay71: true,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  return requirements
}

export function buildAxleLoadAdjustmentRequirement(input: {
  routeId: string
  routeName: string
  obstacleId: string
  obstacleName: string
  sourceStatus: NonPassObstacleStatus
}): VehicleAdjustmentRequirement[] {
  const requirements: VehicleAdjustmentRequirement[] = []
  const status = determineRequirementStatus(input.sourceStatus)
  const now = new Date().toISOString()

  if (
    input.sourceStatus === 'not_checked' ||
    input.sourceStatus === 'blocked'
  ) {
    requirements.push({
      id: createId([
        input.routeId,
        input.obstacleId,
        'bridge',
        'complete_measurement',
      ]),
      routeId: input.routeId,
      routeName: input.routeName,
      obstacleId: input.obstacleId,
      obstacleName: input.obstacleName,
      sourceRuleId: 'bridge_bearing',
      sourceStatus: input.sourceStatus,
      category: 'axle_load_distribution',
      actionType: 'complete_measurement',
      status: 'blocked',
      title: '补充桥梁信息',
      reason: `"${input.obstacleName}"尚未完成桥梁承载检查，缺少桥梁限载或车辆参数。`,
      suggestedChange: '返回路线勘测页面，完成该桥梁的限载信息录入。',
      expectedEffect: '获取桥梁限载数据后可进行承载规则校核。',
      enabledInDay71: true,
      teachingNote: TEACHING_NOTE,
      createdAt: now,
    })
    return requirements
  }

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'bridge',
      'increase_axle_lines',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'bridge_bearing',
    sourceStatus: input.sourceStatus,
    category: 'axle_load_distribution',
    actionType: 'increase_axle_lines',
    status,
    title: '增加挂车轴线数',
    reason: `"${input.obstacleName}"桥梁承载检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，增加轴线数可分散载荷。`,
    suggestedChange: '增加挂车轴线数以分散载荷，将由Day73或Day76实现调整交互。',
    expectedEffect: '增加轴线数后单轴线载荷降低，可能满足桥梁限载要求。',
    nextStepDay: 73,
    enabledInDay71: false,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'bridge',
      'increase_trailer_columns',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'bridge_bearing',
    sourceStatus: input.sourceStatus,
    category: 'axle_load_distribution',
    actionType: 'increase_trailer_columns',
    status,
    title: '增加纵列分载',
    reason: `"${input.obstacleName}"桥梁承载检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，增加纵列数可优化分载。`,
    suggestedChange: '增加挂车纵列数以优化分载，将由Day73或Day76实现调整交互。',
    expectedEffect: '增加纵列数后载荷分布更均匀，可能满足桥梁限载要求。',
    nextStepDay: 73,
    enabledInDay71: false,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'bridge',
      'reduce_total_mass',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'bridge_bearing',
    sourceStatus: input.sourceStatus,
    category: 'axle_load_distribution',
    actionType: 'reduce_total_mass',
    status,
    title: '降低运输总质量',
    reason: `"${input.obstacleName}"桥梁承载检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，降低总质量可减少桥梁荷载。`,
    suggestedChange: '尝试减少货物或车组质量以降低桥梁荷载。',
    expectedEffect: '降低总质量后桥梁荷载减小，更容易满足限载要求。',
    enabledInDay71: false,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  requirements.push({
    id: createId([
      input.routeId,
      input.obstacleId,
      'bridge',
      'choose_alternative_route',
    ]),
    routeId: input.routeId,
    routeName: input.routeName,
    obstacleId: input.obstacleId,
    obstacleName: input.obstacleName,
    sourceRuleId: 'bridge_bearing',
    sourceStatus: input.sourceStatus,
    category: 'route_selection',
    actionType: 'choose_alternative_route',
    status,
    title: '选择限载更高的路线',
    reason: `"${input.obstacleName}"桥梁承载检查${input.sourceStatus === 'fail' ? '不通过' : '存在警告'}，当前路线桥梁限载不足。`,
    suggestedChange: '选择桥梁限载更高的其他路线。',
    expectedEffect: '选择限载更高的路线可避免桥梁超载问题。',
    enabledInDay71: true,
    teachingNote: TEACHING_NOTE,
    createdAt: now,
  })

  return requirements
}

export function mapObstacleConclusionToAdjustmentRequirements(
  routeId: string,
  routeName: string,
  obstacle: ObstacleConclusionSummary,
): VehicleAdjustmentRequirement[] {
  if (obstacle.status === 'pass') {
    return []
  }

  switch (obstacle.obstacleType) {
    case 'height_limit':
      return buildHeightAdjustmentRequirement({
        routeId,
        routeName,
        obstacleId: obstacle.obstacleId,
        obstacleName: obstacle.obstacleName,
        sourceStatus: obstacle.status,
      })
    case 'slope':
      return buildSlopeAdjustmentRequirement({
        routeId,
        routeName,
        obstacleId: obstacle.obstacleId,
        obstacleName: obstacle.obstacleName,
        sourceStatus: obstacle.status,
      })
    case 'bridge':
      return buildAxleLoadAdjustmentRequirement({
        routeId,
        routeName,
        obstacleId: obstacle.obstacleId,
        obstacleName: obstacle.obstacleName,
        sourceStatus: obstacle.status,
      })
    default:
      return []
  }
}

export function mapRouteConclusionToAdjustmentRequirements(
  recommendation: RouteRecommendationResult,
): RouteVehicleAdjustmentSummary {
  const allRequirements: VehicleAdjustmentRequirement[] = []

  for (const obstacle of recommendation.obstacleSummaries) {
    const requirements = mapObstacleConclusionToAdjustmentRequirements(
      recommendation.routeId,
      recommendation.routeName,
      obstacle,
    )
    allRequirements.push(...requirements)
  }

  const requiredCount = allRequirements.filter(
    (r) => r.status === 'required',
  ).length
  const recommendedCount = allRequirements.filter(
    (r) => r.status === 'recommended',
  ).length
  const blockedCount = allRequirements.filter(
    (r) => r.status === 'blocked',
  ).length

  const hasHeightIssue = allRequirements.some(
    (r) => r.category === 'height_clearance',
  )
  const hasSlopeIssue = allRequirements.some(
    (r) => r.category === 'slope_traction',
  )
  const hasAxleLoadIssue = allRequirements.some(
    (r) => r.category === 'axle_load_distribution',
  )

  let summary: string
  let nextAction: string

  if (allRequirements.length === 0) {
    summary = `路线"${recommendation.routeName}"所有障碍检查通过，暂无车组调整要求。`
    nextAction = '可选择该路线进入车组确定阶段。'
  } else if (requiredCount > 0) {
    summary = `路线"${recommendation.routeName}"存在${requiredCount}个必须调整的车组要求，${blockedCount}个需补充数据的要求。`
    nextAction = '请根据调整要求修改车组配置或选择其他路线。'
  } else if (recommendedCount > 0) {
    summary = `路线"${recommendation.routeName}"存在${recommendedCount}个建议调整的车组要求。`
    nextAction = '建议检查调整要求，可选择调整或继续使用当前路线。'
  } else {
    summary = `路线"${recommendation.routeName}"存在${blockedCount}个需补充数据的要求。`
    nextAction = '请先补充缺失的测量数据或车辆参数。'
  }

  return {
    routeId: recommendation.routeId,
    routeName: recommendation.routeName,
    sourceRouteFinalStatus: recommendation.finalStatus,
    requirements: allRequirements,
    requiredCount,
    recommendedCount,
    blockedCount,
    hasHeightIssue,
    hasSlopeIssue,
    hasAxleLoadIssue,
    summary,
    nextAction,
    teachingNote: TEACHING_NOTE,
    generatedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
  }
}

export function validateVehicleAdjustmentRequirement(requirement: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const parsed = vehicleAdjustmentRequirementSchema.safeParse(requirement)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}

export function validateRouteVehicleAdjustmentSummary(summary: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const parsed = routeVehicleAdjustmentSummarySchema.safeParse(summary)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}
