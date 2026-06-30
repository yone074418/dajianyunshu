import { z } from 'zod'
import { SURVEY_ROUTES } from './surveyRouteData'
import type { RouteObstacle } from './surveyRoutes'

const nonEmptyString = z.string().trim().min(1)
const positionTuple = z.tuple([z.number(), z.number(), z.number()])

export const MEASUREMENT_TOOL_TYPES_DAY59 = ['distance', 'height'] as const
export type MeasurementToolTypeDay59 =
  (typeof MEASUREMENT_TOOL_TYPES_DAY59)[number]

export const MEASUREMENT_TOOL_TYPES_ALL = [
  'distance',
  'height',
  'slope',
  'bridge',
] as const
export type MeasurementToolTypeAll = (typeof MEASUREMENT_TOOL_TYPES_ALL)[number]

export const BRIDGE_KINDS = [
  'small_bridge',
  'medium_bridge',
  'large_bridge',
  'culvert_bridge',
  'temporary_bridge',
] as const
export type BridgeKind = (typeof BRIDGE_KINDS)[number]

export const BRIDGE_KIND_LABELS: Record<BridgeKind, string> = {
  small_bridge: '小型桥梁',
  medium_bridge: '中型桥梁',
  large_bridge: '大型桥梁',
  culvert_bridge: '涵洞桥',
  temporary_bridge: '临时桥梁',
}

export const BRIDGE_PARAMETER_SOURCES = [
  'field_sign',
  'survey_document',
  'teacher_provided',
  'teaching_config',
  'manual_input',
] as const
export type BridgeParameterSource = (typeof BRIDGE_PARAMETER_SOURCES)[number]

export const BRIDGE_PARAMETER_SOURCE_LABELS: Record<
  BridgeParameterSource,
  string
> = {
  field_sign: '现场标牌',
  survey_document: '资料查询',
  teacher_provided: '教师给定',
  teaching_config: '教学配置',
  manual_input: '手动录入',
}

export const BRIDGE_DECK_CONDITIONS = [
  'good',
  'normal',
  'poor',
  'unknown',
] as const
export type BridgeDeckCondition = (typeof BRIDGE_DECK_CONDITIONS)[number]

export const BRIDGE_DECK_CONDITION_LABELS: Record<BridgeDeckCondition, string> =
  {
    good: '良好',
    normal: '一般',
    poor: '较差',
    unknown: '未知',
  }

export const BRIDGE_LOAD_LIMIT_MIN = 5
export const BRIDGE_LOAD_LIMIT_MAX = 500
export const BRIDGE_DECK_WIDTH_MIN = 3
export const BRIDGE_DECK_WIDTH_MAX = 30
export const BRIDGE_LENGTH_MIN = 5
export const BRIDGE_LENGTH_MAX = 3000
export const BRIDGE_CLEARANCE_MIN = 2
export const BRIDGE_CLEARANCE_MAX = 15
export const BRIDGE_LANE_COUNT_MIN = 1
export const BRIDGE_LANE_COUNT_MAX = 8

export const measurementPointSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  position: positionTuple,
})

export type MeasurementPoint = z.infer<typeof measurementPointSchema>

export const measurementTargetSchema = z.object({
  id: nonEmptyString,
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  targetType: z.enum([
    'clearance_height',
    'road_width',
    'obstacle_distance',
    'shoulder_distance',
    'bridge_info',
  ]),
  label: nonEmptyString,
  description: nonEmptyString,
  supportedTools: z
    .array(z.enum(['distance', 'height', 'slope', 'bridge']))
    .min(1),
  suggestedPointPairs: z
    .array(
      z.object({
        id: nonEmptyString,
        label: nonEmptyString,
        pointA: positionTuple,
        pointB: positionTuple,
      }),
    )
    .optional(),
  bridgeKind: z.enum(BRIDGE_KINDS).optional(),
  presetBridgeParams: z
    .object({
      bridgeName: z.string().optional(),
      bridgeKind: z.enum(BRIDGE_KINDS).optional(),
      deckWidthM: z.number().positive().optional(),
      bridgeLengthM: z.number().positive().optional(),
      loadLimitT: z.number().positive().optional(),
    })
    .optional(),
})

export type MeasurementTarget = z.infer<typeof measurementTargetSchema>

export const measurementResultSchema = z.object({
  id: nonEmptyString,
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  targetId: nonEmptyString,
  targetLabel: nonEmptyString,
  toolType: z.enum(['distance', 'height']),
  points: z.tuple([measurementPointSchema, measurementPointSchema]),
  value: z.number().positive(),
  unit: z.literal('m'),
  valueLabel: nonEmptyString,
  measuredAt: nonEmptyString,
  source: z.enum(['manual_point_selection', 'preset_point_pair']),
})

export type MeasurementResult = z.infer<typeof measurementResultSchema>

export interface MeasurementValidationResult {
  success: boolean
  errors: string[]
}

export function calculateDistance(
  pointA: [number, number, number],
  pointB: [number, number, number],
): number {
  const dx = pointB[0] - pointA[0]
  const dy = pointB[1] - pointA[1]
  const dz = pointB[2] - pointA[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function calculateHeight(
  pointA: [number, number, number],
  pointB: [number, number, number],
): number {
  return Math.abs(pointB[1] - pointA[1])
}

export function validateMeasurementResult(
  result: unknown,
): MeasurementValidationResult {
  const errors: string[] = []
  const parsed = measurementResultSchema.safeParse(result)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { success: false, errors }
  }

  const data = parsed.data
  const [pA, pB] = data.points
  const same =
    pA.position[0] === pB.position[0] &&
    pA.position[1] === pB.position[1] &&
    pA.position[2] === pB.position[2]
  if (same) {
    errors.push('起点和终点不能相同')
  }

  const routeExists = SURVEY_ROUTES.some((r) => r.id === data.routeId)
  if (!routeExists) {
    errors.push(`路线 "${data.routeId}" 不存在`)
  } else {
    const route = SURVEY_ROUTES.find((r) => r.id === data.routeId)
    const obsExists = route?.obstacles.some((o) => o.id === data.obstacleId)
    if (!obsExists) {
      errors.push(`障碍 "${data.obstacleId}" 不属于路线 "${data.routeId}"`)
    }
  }

  return { success: errors.length === 0, errors }
}

function generateId(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createDistanceResult(
  routeId: string,
  obstacleId: string,
  target: MeasurementTarget,
  pointA: MeasurementPoint,
  pointB: MeasurementPoint,
): MeasurementResult | { error: string } {
  if (
    pointA.position[0] === pointB.position[0] &&
    pointA.position[1] === pointB.position[1] &&
    pointA.position[2] === pointB.position[2]
  ) {
    return { error: '起点和终点不能相同' }
  }

  const posA = pointA.position as [number, number, number]
  const posB = pointB.position as [number, number, number]
  const value = calculateDistance(posA, posB)
  if (value <= 0) {
    return { error: '计算结果无效' }
  }

  return {
    id: generateId(),
    routeId,
    obstacleId,
    targetId: target.id,
    targetLabel: target.label,
    toolType: 'distance',
    points: [pointA, pointB],
    value: Math.round(value * 100) / 100,
    unit: 'm',
    valueLabel: `${Math.round(value * 100) / 100} m`,
    measuredAt: new Date().toISOString(),
    source: 'manual_point_selection',
  }
}

export function createHeightResult(
  routeId: string,
  obstacleId: string,
  target: MeasurementTarget,
  pointA: MeasurementPoint,
  pointB: MeasurementPoint,
): MeasurementResult | { error: string } {
  if (
    pointA.position[0] === pointB.position[0] &&
    pointA.position[1] === pointB.position[1] &&
    pointA.position[2] === pointB.position[2]
  ) {
    return { error: '起点和终点不能相同' }
  }

  const posA = pointA.position as [number, number, number]
  const posB = pointB.position as [number, number, number]
  const value = calculateHeight(posA, posB)
  if (value <= 0) {
    return { error: '高度差为零，请选择上下不同的点' }
  }

  return {
    id: generateId(),
    routeId,
    obstacleId,
    targetId: target.id,
    targetLabel: target.label,
    toolType: 'height',
    points: [pointA, pointB],
    value: Math.round(value * 100) / 100,
    unit: 'm',
    valueLabel: `${Math.round(value * 100) / 100} m`,
    measuredAt: new Date().toISOString(),
    source: 'manual_point_selection',
  }
}

export function getMeasurementTargetsForObstacle(
  routeId: string,
  obstacle: RouteObstacle,
): MeasurementTarget[] {
  const targets: MeasurementTarget[] = []

  if (obstacle.type === 'height_limit') {
    targets.push({
      id: `target_${obstacle.id}_clearance`,
      routeId,
      obstacleId: obstacle.id,
      targetType: 'clearance_height',
      label: `${obstacle.name} - 净高`,
      description: `测量${obstacle.name}的实际净空高度`,
      supportedTools: ['height'],
      suggestedPointPairs: [
        {
          id: `sp_${obstacle.id}_ground`,
          label: '地面点 → 限高架底部',
          pointA: [obstacle.position[0], 0, obstacle.position[2]],
          pointB: obstacle.position,
        },
      ],
    })
  }

  if (obstacle.type === 'narrow_section') {
    targets.push({
      id: `target_${obstacle.id}_road_width`,
      routeId,
      obstacleId: obstacle.id,
      targetType: 'road_width',
      label: `${obstacle.name} - 有效宽度`,
      description: `测量${obstacle.name}处道路的有效通行宽度`,
      supportedTools: ['distance'],
      suggestedPointPairs: [
        {
          id: `sp_${obstacle.id}_sides`,
          label: '左侧路缘 → 右侧路缘',
          pointA: [
            obstacle.position[0] - 3,
            obstacle.position[1],
            obstacle.position[2],
          ],
          pointB: [
            obstacle.position[0] + 3,
            obstacle.position[1],
            obstacle.position[2],
          ],
        },
      ],
    })
  }

  if (obstacle.type === 'bridge') {
    targets.push({
      id: `target_${obstacle.id}_span`,
      routeId,
      obstacleId: obstacle.id,
      targetType: 'obstacle_distance',
      label: `${obstacle.name} - 桥梁跨度`,
      description: `测量${obstacle.name}的桥梁跨度`,
      supportedTools: ['distance'],
      suggestedPointPairs: [
        {
          id: `sp_${obstacle.id}_abutments`,
          label: '桥头 → 桥尾',
          pointA: [
            obstacle.position[0] - 20,
            obstacle.position[1],
            obstacle.position[2],
          ],
          pointB: [
            obstacle.position[0] + 20,
            obstacle.position[1],
            obstacle.position[2],
          ],
        },
      ],
    })
    const bridgeKind: BridgeKind =
      (obstacle.measurementPlaceholders?.bridgeKind as BridgeKind) ??
      'medium_bridge'
    targets.push({
      id: `target_${obstacle.id}_bridge_info`,
      routeId,
      obstacleId: obstacle.id,
      targetType: 'bridge_info',
      label: `${obstacle.name} - 桥梁信息`,
      description: `查看${obstacle.name}的基础信息并录入限载值`,
      supportedTools: ['bridge'],
      bridgeKind,
      presetBridgeParams: {
        bridgeName: obstacle.name,
        bridgeKind,
        deckWidthM:
          typeof obstacle.measurementPlaceholders?.deckWidth === 'number'
            ? obstacle.measurementPlaceholders.deckWidth
            : undefined,
        bridgeLengthM:
          typeof obstacle.measurementPlaceholders?.bridgeLength === 'number'
            ? obstacle.measurementPlaceholders.bridgeLength
            : undefined,
        loadLimitT:
          typeof obstacle.measurementPlaceholders?.bridgeLoadCapacity ===
          'number'
            ? obstacle.measurementPlaceholders.bridgeLoadCapacity
            : undefined,
      },
    })
  }

  if (obstacle.type === 'curve') {
    targets.push({
      id: `target_${obstacle.id}_road_width`,
      routeId,
      obstacleId: obstacle.id,
      targetType: 'road_width',
      label: `${obstacle.name} - 弯道宽度`,
      description: `测量${obstacle.name}处弯道路面宽度`,
      supportedTools: ['distance'],
      suggestedPointPairs: [
        {
          id: `sp_${obstacle.id}_inner_outer`,
          label: '内侧路缘 → 外侧路缘',
          pointA: [
            obstacle.position[0],
            obstacle.position[1],
            obstacle.position[2] - 4,
          ],
          pointB: [
            obstacle.position[0],
            obstacle.position[1],
            obstacle.position[2] + 4,
          ],
        },
      ],
    })
  }

  if (obstacle.type === 'slope') {
    targets.push({
      id: `target_${obstacle.id}_height_diff`,
      routeId,
      obstacleId: obstacle.id,
      targetType: 'clearance_height',
      label: `${obstacle.name} - 高差`,
      description: `测量${obstacle.name}的起点与终点高差`,
      supportedTools: ['height'],
      suggestedPointPairs: [
        {
          id: `sp_${obstacle.id}_base_top`,
          label: '坡底 → 坡顶',
          pointA: [obstacle.position[0] - 50, 0, obstacle.position[2]],
          pointB: obstacle.position,
        },
      ],
    })
    targets.push({
      id: `target_${obstacle.id}_slope`,
      routeId,
      obstacleId: obstacle.id,
      targetType: 'shoulder_distance',
      label: `${obstacle.name} - 坡度`,
      description: `测量${obstacle.name}的水平距离和垂直高差，计算坡度百分比`,
      supportedTools: ['slope'],
      suggestedPointPairs: [
        {
          id: `sp_${obstacle.id}_slope_points`,
          label: '坡底起点 → 坡顶终点',
          pointA: [obstacle.position[0] - 50, 0, obstacle.position[2]],
          pointB: obstacle.position,
        },
      ],
    })
  }

  return targets
}

export function getAllMeasurementTargets(routeId: string): MeasurementTarget[] {
  const route = SURVEY_ROUTES.find((r) => r.id === routeId)
  if (!route) return []
  return route.obstacles.flatMap((obs) =>
    getMeasurementTargetsForObstacle(routeId, obs),
  )
}

export const slopeMeasurementResultSchema = z.object({
  id: nonEmptyString,
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  targetId: nonEmptyString,
  targetLabel: nonEmptyString,
  toolType: z.literal('slope'),
  points: z.tuple([measurementPointSchema, measurementPointSchema]),
  horizontalDistanceM: z.number().positive(),
  verticalDistanceM: z.number().min(0),
  slopePercent: z.number().min(0),
  slopeAngleDeg: z.number().min(0).optional(),
  unit: z.literal('%'),
  processText: nonEmptyString,
  valueLabel: nonEmptyString,
  measuredAt: nonEmptyString,
  source: z.enum(['manual_point_selection', 'preset_point_pair']),
})

export type SlopeMeasurementResult = z.infer<
  typeof slopeMeasurementResultSchema
>

export function calculateHorizontalDistance(
  pointA: [number, number, number],
  pointB: [number, number, number],
): number {
  const dx = pointB[0] - pointA[0]
  const dz = pointB[2] - pointA[2]
  return Math.sqrt(dx * dx + dz * dz)
}

export function calculateVerticalDistance(
  pointA: [number, number, number],
  pointB: [number, number, number],
): number {
  return Math.abs(pointB[1] - pointA[1])
}

export function calculateSlopePercent(
  horizontalDistanceM: number,
  verticalDistanceM: number,
): number {
  if (horizontalDistanceM <= 0) return 0
  return (verticalDistanceM / horizontalDistanceM) * 100
}

export function calculateSlopeAngleDeg(
  horizontalDistanceM: number,
  verticalDistanceM: number,
): number {
  if (horizontalDistanceM <= 0) return 0
  return (Math.atan(verticalDistanceM / horizontalDistanceM) * 180) / Math.PI
}

export function createSlopeMeasurementResult(
  routeId: string,
  obstacleId: string,
  targetId: string,
  targetLabel: string,
  pointA: MeasurementPoint,
  pointB: MeasurementPoint,
): SlopeMeasurementResult | { error: string } {
  const posA = pointA.position as [number, number, number]
  const posB = pointB.position as [number, number, number]

  const same = posA[0] === posB[0] && posA[1] === posB[1] && posA[2] === posB[2]
  if (same) {
    return { error: '起点和终点不能相同' }
  }

  const hDist = calculateHorizontalDistance(posA, posB)
  if (hDist <= 0) {
    return { error: '水平距离为零，无法计算坡度' }
  }

  const vDist = calculateVerticalDistance(posA, posB)
  const slopePct = calculateSlopePercent(hDist, vDist)
  const slopeAngle = calculateSlopeAngleDeg(hDist, vDist)

  const hRounded = Math.round(hDist * 100) / 100
  const vRounded = Math.round(vDist * 100) / 100
  const pctRounded = Math.round(slopePct * 100) / 100
  const angleRounded = Math.round(slopeAngle * 100) / 100

  const processText = [
    `水平距离：${hRounded} m`,
    `垂直距离：${vRounded} m`,
    `计算过程：${vRounded} ÷ ${hRounded} × 100 = ${pctRounded}%`,
    `坡度结果：${pctRounded}%（约 ${angleRounded}°）`,
  ].join('\n')

  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    routeId,
    obstacleId,
    targetId,
    targetLabel,
    toolType: 'slope',
    points: [pointA, pointB],
    horizontalDistanceM: hRounded,
    verticalDistanceM: vRounded,
    slopePercent: pctRounded,
    slopeAngleDeg: angleRounded,
    unit: '%',
    processText,
    valueLabel: `${pctRounded}%`,
    measuredAt: new Date().toISOString(),
    source: 'manual_point_selection',
  }
}

export function validateSlopeMeasurementResult(
  result: unknown,
): MeasurementValidationResult {
  const errors: string[] = []
  const parsed = slopeMeasurementResultSchema.safeParse(result)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { success: false, errors }
  }

  const data = parsed.data
  const [pA, pB] = data.points
  const same =
    pA.position[0] === pB.position[0] &&
    pA.position[1] === pB.position[1] &&
    pA.position[2] === pB.position[2]
  if (same) {
    errors.push('起点和终点不能相同')
  }

  if (data.horizontalDistanceM <= 0) {
    errors.push('水平距离必须大于0')
  }

  const routeExists = SURVEY_ROUTES.some((r) => r.id === data.routeId)
  if (!routeExists) {
    errors.push(`路线 "${data.routeId}" 不存在`)
  } else {
    const route = SURVEY_ROUTES.find((r) => r.id === data.routeId)
    const obsExists = route?.obstacles.some((o) => o.id === data.obstacleId)
    if (!obsExists) {
      errors.push(`障碍 "${data.obstacleId}" 不属于路线 "${data.routeId}"`)
    }
  }

  return { success: errors.length === 0, errors }
}

export const bridgeInfoMeasurementResultSchema = z.object({
  id: nonEmptyString,
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  targetId: nonEmptyString,
  targetLabel: nonEmptyString,
  toolType: z.literal('bridge'),
  bridgeName: nonEmptyString,
  bridgeKind: z.enum(BRIDGE_KINDS),
  loadLimitT: z.number().min(BRIDGE_LOAD_LIMIT_MIN).max(BRIDGE_LOAD_LIMIT_MAX),
  deckWidthM: z.number().min(BRIDGE_DECK_WIDTH_MIN).max(BRIDGE_DECK_WIDTH_MAX),
  bridgeLengthM: z.number().min(BRIDGE_LENGTH_MIN).max(BRIDGE_LENGTH_MAX),
  clearanceHeightM: z
    .number()
    .min(BRIDGE_CLEARANCE_MIN)
    .max(BRIDGE_CLEARANCE_MAX)
    .optional(),
  laneCount: z
    .number()
    .int()
    .min(BRIDGE_LANE_COUNT_MIN)
    .max(BRIDGE_LANE_COUNT_MAX)
    .optional(),
  deckCondition: z.enum(BRIDGE_DECK_CONDITIONS).optional(),
  allowMeeting: z.boolean().optional(),
  source: z.enum(BRIDGE_PARAMETER_SOURCES),
  valueLabel: nonEmptyString,
  measuredAt: nonEmptyString,
  notes: z.string().optional(),
})

export type BridgeInfoMeasurementResult = z.infer<
  typeof bridgeInfoMeasurementResultSchema
>

export function createBridgeInfoMeasurementResult(input: {
  routeId: string
  obstacleId: string
  targetId: string
  targetLabel: string
  bridgeName: string
  bridgeKind: BridgeKind
  loadLimitT: number
  deckWidthM: number
  bridgeLengthM: number
  clearanceHeightM?: number
  laneCount?: number
  deckCondition?: BridgeDeckCondition
  allowMeeting?: boolean
  source: BridgeParameterSource
  notes?: string
}): BridgeInfoMeasurementResult | { error: string } {
  const errs: string[] = []
  if (!input.routeId) errs.push('routeId 不能为空')
  if (!input.obstacleId) errs.push('obstacleId 不能为空')
  if (!input.targetId) errs.push('targetId 不能为空')
  if (!input.targetLabel) errs.push('targetLabel 不能为空')
  if (!input.bridgeName) errs.push('桥梁名称不能为空')
  if (
    input.loadLimitT === undefined ||
    input.loadLimitT === null ||
    isNaN(input.loadLimitT)
  )
    errs.push('限载值不能为空')
  else if (input.loadLimitT < BRIDGE_LOAD_LIMIT_MIN)
    errs.push(`限载值不能小于 ${BRIDGE_LOAD_LIMIT_MIN}t`)
  else if (input.loadLimitT > BRIDGE_LOAD_LIMIT_MAX)
    errs.push(`限载值不能大于 ${BRIDGE_LOAD_LIMIT_MAX}t`)
  if (
    input.deckWidthM === undefined ||
    input.deckWidthM === null ||
    isNaN(input.deckWidthM)
  )
    errs.push('桥面宽度不能为空')
  else if (input.deckWidthM < BRIDGE_DECK_WIDTH_MIN)
    errs.push(`桥面宽度不能小于 ${BRIDGE_DECK_WIDTH_MIN}m`)
  else if (input.deckWidthM > BRIDGE_DECK_WIDTH_MAX)
    errs.push(`桥面宽度不能大于 ${BRIDGE_DECK_WIDTH_MAX}m`)
  if (
    input.bridgeLengthM === undefined ||
    input.bridgeLengthM === null ||
    isNaN(input.bridgeLengthM)
  )
    errs.push('桥梁长度不能为空')
  else if (input.bridgeLengthM < BRIDGE_LENGTH_MIN)
    errs.push(`桥梁长度不能小于 ${BRIDGE_LENGTH_MIN}m`)
  else if (input.bridgeLengthM > BRIDGE_LENGTH_MAX)
    errs.push(`桥梁长度不能大于 ${BRIDGE_LENGTH_MAX}m`)
  if (errs.length > 0) return { error: errs.join('; ') }

  const routeExists = SURVEY_ROUTES.some((r) => r.id === input.routeId)
  if (!routeExists) return { error: `路线 "${input.routeId}" 不存在` }
  const route = SURVEY_ROUTES.find((r) => r.id === input.routeId)
  const obsExists = route?.obstacles.some((o) => o.id === input.obstacleId)
  if (!obsExists)
    return {
      error: `障碍 "${input.obstacleId}" 不属于路线 "${input.routeId}"`,
    }
  const obs = route?.obstacles.find((o) => o.id === input.obstacleId)
  if (obs && obs.type !== 'bridge')
    return {
      error: `障碍 "${input.obstacleId}" 不是桥梁类型，不能提交桥梁信息`,
    }

  const ld = Math.round(input.loadLimitT * 100) / 100
  const dw = Math.round(input.deckWidthM * 100) / 100
  const bl = Math.round(input.bridgeLengthM * 100) / 100
  const srcLabel = BRIDGE_PARAMETER_SOURCE_LABELS[input.source] ?? input.source

  return {
    id: `bridge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    routeId: input.routeId,
    obstacleId: input.obstacleId,
    targetId: input.targetId,
    targetLabel: input.targetLabel,
    toolType: 'bridge',
    bridgeName: input.bridgeName,
    bridgeKind: input.bridgeKind,
    loadLimitT: ld,
    deckWidthM: dw,
    bridgeLengthM: bl,
    clearanceHeightM: input.clearanceHeightM
      ? Math.round(input.clearanceHeightM * 100) / 100
      : undefined,
    laneCount: input.laneCount,
    deckCondition: input.deckCondition,
    allowMeeting: input.allowMeeting,
    source: input.source,
    valueLabel: `${input.bridgeName} 限载${ld}t 桥宽${dw}m 桥长${bl}m 来源:${srcLabel}`,
    measuredAt: new Date().toISOString(),
    notes: input.notes,
  }
}

export function validateBridgeInfoMeasurementResult(
  result: unknown,
): MeasurementValidationResult {
  const errors: string[] = []
  const parsed = bridgeInfoMeasurementResultSchema.safeParse(result)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { success: false, errors }
  }

  const data = parsed.data
  const routeExists = SURVEY_ROUTES.some((r) => r.id === data.routeId)
  if (!routeExists) {
    errors.push(`路线 "${data.routeId}" 不存在`)
  } else {
    const route = SURVEY_ROUTES.find((r) => r.id === data.routeId)
    const obsExists = route?.obstacles.some((o) => o.id === data.obstacleId)
    if (!obsExists) {
      errors.push(`障碍 "${data.obstacleId}" 不属于路线 "${data.routeId}"`)
    } else {
      const obs = route?.obstacles.find((o) => o.id === data.obstacleId)
      if (obs && obs.type !== 'bridge') {
        errors.push(`障碍 "${data.obstacleId}" 不是桥梁类型，不能提交桥梁信息`)
      }
    }
  }

  return { success: errors.length === 0, errors }
}

export function formatBridgeInfoSummary(
  result: BridgeInfoMeasurementResult,
): string {
  const kindLabel = BRIDGE_KIND_LABELS[result.bridgeKind] ?? result.bridgeKind
  const srcLabel =
    BRIDGE_PARAMETER_SOURCE_LABELS[result.source] ?? result.source
  const lines = [
    `桥梁名称：${result.bridgeName}`,
    `桥梁类型：${kindLabel}`,
    `限载值：${result.loadLimitT} t`,
    `桥面宽度：${result.deckWidthM} m`,
    `桥梁长度：${result.bridgeLengthM} m`,
  ]
  if (result.clearanceHeightM !== undefined)
    lines.push(`桥下净空：${result.clearanceHeightM} m`)
  if (result.laneCount !== undefined) lines.push(`车道数：${result.laneCount}`)
  if (result.deckCondition !== undefined)
    lines.push(
      `桥面状况：${BRIDGE_DECK_CONDITION_LABELS[result.deckCondition] ?? result.deckCondition}`,
    )
  if (result.allowMeeting !== undefined)
    lines.push(`允许会车：${result.allowMeeting ? '是' : '否'}`)
  lines.push(`参数来源：${srcLabel}`)
  lines.push(`测量时间：${result.measuredAt}`)
  if (result.notes) lines.push(`备注：${result.notes}`)
  return lines.join('\n')
}
