import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const positionTuple = z.tuple([z.number(), z.number(), z.number()])

export const ROUTE_OBSTACLE_TYPES = [
  'height_limit',
  'curve',
  'slope',
  'bridge',
  'narrow_section',
] as const

export type RouteObstacleType = (typeof ROUTE_OBSTACLE_TYPES)[number]

export const ROUTE_OBSTACLE_TYPE_LABELS: Record<RouteObstacleType, string> = {
  height_limit: '限高障碍',
  curve: '弯道障碍',
  slope: '坡道障碍',
  bridge: '桥梁障碍',
  narrow_section: '狭窄路段',
}

export const MEASUREMENT_TOOL_TYPES = [
  'height',
  'distance',
  'slope',
  'curve',
  'bridge',
  'visual_check',
] as const

export type MeasurementToolType = (typeof MEASUREMENT_TOOL_TYPES)[number]

export const routePointSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  position: positionTuple,
  description: z.string().optional(),
})

export const routeObstacleSchema = z.object({
  id: nonEmptyString,
  routeId: nonEmptyString,
  type: z.enum(ROUTE_OBSTACLE_TYPES),
  name: nonEmptyString,
  description: nonEmptyString,
  position: positionTuple,
  riskLevel: z.enum(['low', 'medium', 'high']),
  measurementTool: z.enum(MEASUREMENT_TOOL_TYPES),
  measurementPlaceholders: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.null()]),
  ),
  teachingNote: nonEmptyString,
  enabled: z.boolean(),
  order: z.number().int().min(0),
})

export const surveyRouteSchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  description: nonEmptyString,
  origin: nonEmptyString,
  destination: nonEmptyString,
  teachingGoal: nonEmptyString,
  points: z.array(routePointSchema).min(2),
  obstacles: z.array(routeObstacleSchema).min(2),
  scenePreset: nonEmptyString,
  enabled: z.boolean(),
  order: z.number().int().min(0),
  version: nonEmptyString,
})

export const surveyRoutesSchema = z
  .array(surveyRouteSchema)
  .min(3)
  .refine(
    (routes) => {
      for (const route of routes) {
        const types = new Set(route.obstacles.map((o) => o.type))
        if (types.size < 2) return false
      }
      return true
    },
    { message: '每条路线必须至少包含两类不同障碍' },
  )

export type RoutePoint = z.infer<typeof routePointSchema>
export type RouteObstacle = z.infer<typeof routeObstacleSchema>
export type SurveyRoute = z.infer<typeof surveyRouteSchema>

export interface SurveyRouteValidationResult {
  success: boolean
  errors: string[]
}

export function validateSurveyRoutes(
  routes: unknown,
): SurveyRouteValidationResult {
  const errors: string[] = []

  const parsed = surveyRoutesSchema.safeParse(routes)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { success: false, errors }
  }

  const validRoutes = parsed.data

  if (validRoutes.length < 3) {
    errors.push(`至少需要3条路线，当前只有${validRoutes.length}条`)
  }

  for (const route of validRoutes) {
    if (route.obstacles.length < 2) {
      errors.push(`路线 "${route.name}" 障碍点数量不足2个`)
    }
    const obstacleTypes = new Set(route.obstacles.map((o) => o.type))
    if (obstacleTypes.size < 2) {
      errors.push(
        `路线 "${route.name}" 只有${obstacleTypes.size}种障碍类型，至少需要2种`,
      )
    }
    for (const obstacle of route.obstacles) {
      if (obstacle.routeId !== route.id) {
        errors.push(
          `障碍 "${obstacle.name}" 的 routeId "${obstacle.routeId}" 与路线 "${route.id}" 不匹配`,
        )
      }
    }
  }

  const allObstacleTypes = new Set(
    validRoutes.flatMap((r) => r.obstacles.map((o) => o.type)),
  )
  if (allObstacleTypes.size < 3) {
    errors.push(`全局只覆盖${allObstacleTypes.size}种障碍类型，建议至少覆盖3种`)
  }

  return { success: errors.length === 0, errors }
}

export function getSurveyRouteById(
  routes: SurveyRoute[],
  id: string,
): SurveyRoute | undefined {
  return routes.find((r) => r.id === id)
}

export function getRouteObstaclesByRouteId(
  routes: SurveyRoute[],
  routeId: string,
): RouteObstacle[] {
  const route = routes.find((r) => r.id === routeId)
  return route?.obstacles ?? []
}

export function getObstacleTypeSummary(route: SurveyRoute): string {
  const types = route.obstacles.map(
    (o) => ROUTE_OBSTACLE_TYPE_LABELS[o.type] ?? o.type,
  )
  return [...new Set(types)].join('、')
}
