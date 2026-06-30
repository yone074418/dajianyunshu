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
  'curve',
] as const
export type MeasurementToolTypeAll = (typeof MEASUREMENT_TOOL_TYPES_ALL)[number]

export const CURVE_OBSTACLE_KINDS = [
  'circular_curve',
  'right_angle_curve',
  'compound_curve',
] as const
export type CurveObstacleKind = (typeof CURVE_OBSTACLE_KINDS)[number]

export const CURVE_OBSTACLE_KIND_LABELS: Record<CurveObstacleKind, string> = {
  circular_curve: '圆弧弯道',
  right_angle_curve: '直交弯道',
  compound_curve: '复合弯道',
}

export const CURVE_MEASUREMENT_SOURCES = [
  'manual_input',
  'preset_point_pair',
  'teaching_config',
] as const
export type CurveMeasurementSource = (typeof CURVE_MEASUREMENT_SOURCES)[number]

export const CURVE_MEASUREMENT_SOURCE_LABELS: Record<
  CurveMeasurementSource,
  string
> = {
  manual_input: '手动录入',
  preset_point_pair: '预设点位计算',
  teaching_config: '教学配置',
}

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
    'curve_parameters',
  ]),
  label: nonEmptyString,
  description: nonEmptyString,
  supportedTools: z
    .array(z.enum(['distance', 'height', 'slope', 'curve']))
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
  curveKind: z.enum(CURVE_OBSTACLE_KINDS).optional(),
  presetCurveParams: z
    .object({
      radiusM: z.number().positive().optional(),
      angleDeg: z.number().positive().max(180).optional(),
      entranceWidthM: z.number().positive().optional(),
      exitWidthM: z.number().positive().optional(),
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
  }

  if (obstacle.type === 'curve') {
    const curveKind: CurveObstacleKind =
      (obstacle.measurementPlaceholders?.curveKind as CurveObstacleKind) ??
      'circular_curve'
    const presetRadius =
      typeof obstacle.measurementPlaceholders?.innerRadius === 'number'
        ? obstacle.measurementPlaceholders.innerRadius
        : undefined
    const presetAngle =
      typeof obstacle.measurementPlaceholders?.curveAngleDeg === 'number'
        ? obstacle.measurementPlaceholders.curveAngleDeg
        : undefined
    const presetEntrance =
      typeof obstacle.measurementPlaceholders?.entranceWidth === 'number'
        ? obstacle.measurementPlaceholders.entranceWidth
        : undefined
    const presetExit =
      typeof obstacle.measurementPlaceholders?.exitWidth === 'number'
        ? obstacle.measurementPlaceholders.exitWidth
        : undefined
    targets.push({
      id: `target_${obstacle.id}_curve_params`,
      routeId,
      obstacleId: obstacle.id,
      targetType: 'curve_parameters',
      label: `${obstacle.name} - 弯道参数`,
      description: `测量${obstacle.name}的弯道半径、夹角、入口宽度和出口宽度`,
      supportedTools: ['curve'],
      curveKind,
      presetCurveParams: {
        radiusM: presetRadius,
        angleDeg: presetAngle,
        entranceWidthM: presetEntrance,
        exitWidthM: presetExit,
      },
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

export const curveParameterMeasurementResultSchema = z.object({
  id: nonEmptyString,
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  targetId: nonEmptyString,
  targetLabel: nonEmptyString,
  toolType: z.literal('curve'),
  curveKind: z.enum(CURVE_OBSTACLE_KINDS),
  radiusM: z.number().positive(),
  angleDeg: z.number().positive().max(180),
  entranceWidthM: z.number().positive(),
  exitWidthM: z.number().positive(),
  effectiveWidthM: z.number().positive().optional(),
  innerClearanceM: z.number().min(0).optional(),
  outerClearanceM: z.number().min(0).optional(),
  source: z.enum(CURVE_MEASUREMENT_SOURCES),
  valueLabel: nonEmptyString,
  measuredAt: nonEmptyString,
  notes: z.string().optional(),
})

export type CurveParameterMeasurementResult = z.infer<
  typeof curveParameterMeasurementResultSchema
>

export function createCurveParameterResult(input: {
  routeId: string
  obstacleId: string
  targetId: string
  targetLabel: string
  curveKind: CurveObstacleKind
  radiusM: number
  angleDeg: number
  entranceWidthM: number
  exitWidthM: number
  effectiveWidthM?: number
  innerClearanceM?: number
  outerClearanceM?: number
  source: CurveMeasurementSource
  notes?: string
}): CurveParameterMeasurementResult | { error: string } {
  const validationErrors: string[] = []
  if (!input.routeId) validationErrors.push('routeId 不能为空')
  if (!input.obstacleId) validationErrors.push('obstacleId 不能为空')
  if (!input.targetId) validationErrors.push('targetId 不能为空')
  if (!input.targetLabel) validationErrors.push('targetLabel 不能为空')
  if (input.radiusM <= 0) validationErrors.push('半径必须大于 0')
  if (input.angleDeg <= 0 || input.angleDeg > 180)
    validationErrors.push('夹角必须大于 0 且小于等于 180')
  if (input.entranceWidthM <= 0) validationErrors.push('入口宽度必须大于 0')
  if (input.exitWidthM <= 0) validationErrors.push('出口宽度必须大于 0')
  if (validationErrors.length > 0) return { error: validationErrors.join('; ') }

  const routeExists = SURVEY_ROUTES.some((r) => r.id === input.routeId)
  if (!routeExists) return { error: `路线 "${input.routeId}" 不存在` }
  const route = SURVEY_ROUTES.find((r) => r.id === input.routeId)
  const obsExists = route?.obstacles.some((o) => o.id === input.obstacleId)
  if (!obsExists)
    return {
      error: `障碍 "${input.obstacleId}" 不属于路线 "${input.routeId}"`,
    }

  const rd = Math.round(input.radiusM * 100) / 100
  const ag = Math.round(input.angleDeg * 100) / 100
  const ew = Math.round(input.entranceWidthM * 100) / 100
  const xw = Math.round(input.exitWidthM * 100) / 100
  const kindLabel =
    CURVE_OBSTACLE_KIND_LABELS[input.curveKind] ?? input.curveKind

  return {
    id: `curve-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    routeId: input.routeId,
    obstacleId: input.obstacleId,
    targetId: input.targetId,
    targetLabel: input.targetLabel,
    toolType: 'curve',
    curveKind: input.curveKind,
    radiusM: rd,
    angleDeg: ag,
    entranceWidthM: ew,
    exitWidthM: xw,
    effectiveWidthM: input.effectiveWidthM
      ? Math.round(input.effectiveWidthM * 100) / 100
      : undefined,
    innerClearanceM: input.innerClearanceM
      ? Math.round(input.innerClearanceM * 100) / 100
      : undefined,
    outerClearanceM: input.outerClearanceM
      ? Math.round(input.outerClearanceM * 100) / 100
      : undefined,
    source: input.source,
    valueLabel: `${kindLabel} 半径${rd}m 夹角${ag}° 入口${ew}m 出口${xw}m`,
    measuredAt: new Date().toISOString(),
    notes: input.notes,
  }
}

export function validateCurveParameterMeasurementResult(
  result: unknown,
): MeasurementValidationResult {
  const errors: string[] = []
  const parsed = curveParameterMeasurementResultSchema.safeParse(result)
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
      if (obs && obs.type !== 'curve') {
        errors.push(
          `障碍 "${data.obstacleId}" 不是弯道类型，不能提交弯道测量结果`,
        )
      }
    }
  }

  return { success: errors.length === 0, errors }
}

export function formatCurveParameterSummary(
  result: CurveParameterMeasurementResult,
): string {
  const kindLabel =
    CURVE_OBSTACLE_KIND_LABELS[result.curveKind] ?? result.curveKind
  const sourceLabel =
    CURVE_MEASUREMENT_SOURCE_LABELS[result.source] ?? result.source
  const lines = [
    `弯道类型：${kindLabel}`,
    `半径：${result.radiusM} m`,
    `夹角：${result.angleDeg}°`,
    `入口宽度：${result.entranceWidthM} m`,
    `出口宽度：${result.exitWidthM} m`,
  ]
  if (result.effectiveWidthM !== undefined)
    lines.push(`有效宽度：${result.effectiveWidthM} m`)
  if (result.innerClearanceM !== undefined)
    lines.push(`内侧障碍距离：${result.innerClearanceM} m`)
  if (result.outerClearanceM !== undefined)
    lines.push(`外侧障碍距离：${result.outerClearanceM} m`)
  lines.push(`参数来源：${sourceLabel}`)
  lines.push(`测量时间：${result.measuredAt}`)
  if (result.notes) lines.push(`备注：${result.notes}`)
  return lines.join('\n')
}
