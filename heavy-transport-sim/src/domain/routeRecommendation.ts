import { z } from 'zod'
import type { SurveyRoute, RouteObstacle } from './surveyRoutes'

const nonEmptyString = z.string().trim().min(1)

export const OBSTACLE_CONCLUSION_STATUSES = [
  'pass',
  'pass_with_warning',
  'fail',
  'blocked',
  'not_checked',
] as const
export type ObstacleConclusionStatus =
  (typeof OBSTACLE_CONCLUSION_STATUSES)[number]

export const ROUTE_FINAL_STATUSES = [
  'recommended',
  'available_with_warnings',
  'needs_modification',
  'blocked',
  'incomplete',
] as const
export type RouteFinalStatus = (typeof ROUTE_FINAL_STATUSES)[number]

export const MODIFICATION_CATEGORIES = [
  'vehicle_configuration',
  'route_measurement',
  'route_selection',
  'cargo_loading',
  'data_completion',
  'teaching_review',
] as const
export type ModificationCategory = (typeof MODIFICATION_CATEGORIES)[number]

export const routeModificationItemSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  category: z.enum(MODIFICATION_CATEGORIES),
  description: nonEmptyString,
  targetDay: z.number().int().positive().optional(),
  enabledInCurrentStep: z.boolean(),
})

export type RouteModificationItem = z.infer<typeof routeModificationItemSchema>

export const obstacleConclusionSummarySchema = z.object({
  routeId: nonEmptyString,
  obstacleId: nonEmptyString,
  obstacleName: nonEmptyString,
  obstacleType: z.enum([
    'height_limit',
    'circular_curve',
    'right_angle_curve',
    'slope',
    'bridge',
    'narrow_section',
    'unknown',
  ]),
  ruleId: z.string().optional(),
  status: z.enum(OBSTACLE_CONCLUSION_STATUSES),
  passed: z.boolean(),
  reason: nonEmptyString,
  teachingNote: nonEmptyString,
  editableItems: z.array(routeModificationItemSchema),
  severity: z.enum(['info', 'warning', 'error', 'blocked']),
})

export type ObstacleConclusionSummary = z.infer<
  typeof obstacleConclusionSummarySchema
>

export const routeRecommendationResultSchema = z.object({
  routeId: nonEmptyString,
  routeName: nonEmptyString,
  finalStatus: z.enum(ROUTE_FINAL_STATUSES),
  recommended: z.boolean(),
  obstacleSummaries: z.array(obstacleConclusionSummarySchema),
  editableItems: z.array(routeModificationItemSchema),
  passCount: z.number().int().min(0),
  warningCount: z.number().int().min(0),
  failCount: z.number().int().min(0),
  blockedCount: z.number().int().min(0),
  notCheckedCount: z.number().int().min(0),
  summary: nonEmptyString,
  reasons: z.array(nonEmptyString),
  nextAction: nonEmptyString,
  teachingNote: nonEmptyString,
  generatedAt: nonEmptyString,
  engineVersion: nonEmptyString,
})

export type RouteRecommendationResult = z.infer<
  typeof routeRecommendationResultSchema
>

export const TEACHING_NOTE =
  '本路线建议基于教学简化规则汇总，仅用于学习路线勘测与障碍判断流程，不替代真实工程路线推荐或审批。Day69只生成路线建议，不执行车组调整；Day70才做G4前三阶段验收。'

export function validateRouteRecommendationResult(result: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const parsed = routeRecommendationResultSchema.safeParse(result)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : ''
      errors.push(path + issue.message)
    }
    return { valid: false, errors }
  }
  return { valid: true, errors: [] }
}

export function getEditableItemsForObstacle(
  obstacleType: RouteObstacle['type'],
  status: ObstacleConclusionStatus,
): RouteModificationItem[] {
  const items: RouteModificationItem[] = []

  if (status === 'not_checked' || status === 'blocked') {
    items.push({
      id: `complete_measurement_${obstacleType}`,
      label: '返回路线勘测补充测量',
      category: 'data_completion',
      description: '返回路线勘测页面，完成该障碍的参数测量或信息录入。',
      targetDay: 61,
      enabledInCurrentStep: true,
    })
    return items
  }

  switch (obstacleType) {
    case 'height_limit':
      if (status === 'fail') {
        items.push(
          {
            id: 'adjust_suspension',
            label: '调整悬架高度',
            category: 'vehicle_configuration',
            description: '通过调整悬架高度降低运输总高度。',
            targetDay: 72,
            enabledInCurrentStep: false,
          },
          {
            id: 'lower_loading',
            label: '降低装载高度',
            category: 'cargo_loading',
            description: '调整货物装载位置降低总高度。',
            targetDay: 78,
            enabledInCurrentStep: false,
          },
          {
            id: 'select_bypass_route',
            label: '选择绕行路线',
            category: 'route_selection',
            description: '选择限高更高的其他路线。',
            enabledInCurrentStep: true,
          },
        )
      }
      break

    case 'curve':
      if (status === 'fail') {
        items.push(
          {
            id: 'select_larger_radius_route',
            label: '选择更大半径路线',
            category: 'route_selection',
            description: '选择弯道半径更大或出口更宽的路线。',
            enabledInCurrentStep: true,
          },
          {
            id: 'adjust_vehicle_length',
            label: '调整车组长度',
            category: 'vehicle_configuration',
            description: '通过调整车组配置减小转弯所需空间。',
            targetDay: 71,
            enabledInCurrentStep: false,
          },
        )
      }
      break

    case 'slope':
      if (status === 'fail') {
        items.push(
          {
            id: 'add_tractor',
            label: '增加牵引车数量',
            category: 'vehicle_configuration',
            description: '增加牵引车以提升爬坡能力。',
            targetDay: 72,
            enabledInCurrentStep: false,
          },
          {
            id: 'reduce_total_mass',
            label: '降低总质量',
            category: 'vehicle_configuration',
            description: '减少货物或车组质量降低坡道阻力。',
            targetDay: 71,
            enabledInCurrentStep: false,
          },
          {
            id: 'select_lower_slope_route',
            label: '选择坡度更小路线',
            category: 'route_selection',
            description: '选择坡度更小的其他路线。',
            enabledInCurrentStep: true,
          },
        )
      }
      break

    case 'bridge':
      if (status === 'fail') {
        items.push(
          {
            id: 'select_higher_load_route',
            label: '选择限载更高路线',
            category: 'route_selection',
            description: '选择桥梁限载更高的其他路线。',
            enabledInCurrentStep: true,
          },
          {
            id: 'increase_axle_lines',
            label: '增加轴线分载',
            category: 'vehicle_configuration',
            description: '增加挂车轴线数以分散载荷。',
            targetDay: 73,
            enabledInCurrentStep: false,
          },
          {
            id: 'reduce_transport_mass',
            label: '降低运输总质量',
            category: 'vehicle_configuration',
            description: '减少货物或车组质量降低桥梁荷载。',
            targetDay: 71,
            enabledInCurrentStep: false,
          },
        )
      }
      break

    case 'narrow_section':
      if (status === 'fail') {
        items.push(
          {
            id: 'select_wider_route',
            label: '选择更宽路线',
            category: 'route_selection',
            description: '选择路面宽度更大的其他路线。',
            enabledInCurrentStep: true,
          },
          {
            id: 'reduce_vehicle_width',
            label: '调整车组宽度',
            category: 'vehicle_configuration',
            description: '选择更窄的车辆组合。',
            targetDay: 71,
            enabledInCurrentStep: false,
          },
        )
      }
      break
  }

  return items
}

export function determineSeverity(
  status: ObstacleConclusionStatus,
): 'info' | 'warning' | 'error' | 'blocked' {
  switch (status) {
    case 'pass':
      return 'info'
    case 'pass_with_warning':
      return 'warning'
    case 'fail':
      return 'error'
    case 'blocked':
    case 'not_checked':
      return 'blocked'
  }
}

export function createNotCheckedSummary(
  routeId: string,
  obstacle: RouteObstacle,
): ObstacleConclusionSummary {
  return {
    routeId,
    obstacleId: obstacle.id,
    obstacleName: obstacle.name,
    obstacleType: obstacle.type === 'curve' ? 'circular_curve' : obstacle.type,
    status: 'not_checked',
    passed: false,
    reason: `尚未对"${obstacle.name}"进行规则检查，请先完成参数测量后进行规则校核。`,
    teachingNote: '所有障碍必须完成规则检查后才能形成路线结论。',
    editableItems: getEditableItemsForObstacle(obstacle.type, 'not_checked'),
    severity: 'blocked',
  }
}

export function determineRouteFinalStatus(
  obstacleSummaries: ObstacleConclusionSummary[],
): RouteFinalStatus {
  const hasNotChecked = obstacleSummaries.some(
    (s) => s.status === 'not_checked',
  )
  const hasBlocked = obstacleSummaries.some((s) => s.status === 'blocked')
  const hasFail = obstacleSummaries.some((s) => s.status === 'fail')
  const hasWarning = obstacleSummaries.some(
    (s) => s.status === 'pass_with_warning',
  )

  if (hasNotChecked || hasBlocked) {
    return 'incomplete'
  }

  if (hasFail) {
    const hasModifiableFail = obstacleSummaries.some(
      (s) =>
        s.status === 'fail' &&
        s.editableItems.some((item) => item.enabledInCurrentStep),
    )
    if (hasModifiableFail) {
      return 'needs_modification'
    }
    return 'blocked'
  }

  if (hasWarning) {
    return 'available_with_warnings'
  }

  return 'recommended'
}

export function buildRouteRecommendation(
  route: SurveyRoute,
  obstacleSummaries: ObstacleConclusionSummary[],
): RouteRecommendationResult {
  const passCount = obstacleSummaries.filter((s) => s.status === 'pass').length
  const warningCount = obstacleSummaries.filter(
    (s) => s.status === 'pass_with_warning',
  ).length
  const failCount = obstacleSummaries.filter((s) => s.status === 'fail').length
  const blockedCount = obstacleSummaries.filter(
    (s) => s.status === 'blocked',
  ).length
  const notCheckedCount = obstacleSummaries.filter(
    (s) => s.status === 'not_checked',
  ).length

  const finalStatus = determineRouteFinalStatus(obstacleSummaries)
  const allEditableItems = obstacleSummaries.flatMap((s) => s.editableItems)
  const uniqueEditableItems = allEditableItems.filter(
    (item, index, self) => self.findIndex((i) => i.id === item.id) === index,
  )

  const reasons: string[] = []
  if (passCount > 0) reasons.push(`${passCount}个障碍通过`)
  if (warningCount > 0) reasons.push(`${warningCount}个障碍有警告`)
  if (failCount > 0) reasons.push(`${failCount}个障碍不通过`)
  if (blockedCount > 0) reasons.push(`${blockedCount}个障碍参数不足`)
  if (notCheckedCount > 0) reasons.push(`${notCheckedCount}个障碍未检查`)

  let summary: string
  let nextAction: string
  let recommended: boolean

  switch (finalStatus) {
    case 'recommended':
      summary = `路线"${route.name}"所有障碍检查通过，推荐使用该路线。`
      nextAction = '可选择该路线进入车组确定阶段。'
      recommended = true
      break
    case 'available_with_warnings':
      summary = `路线"${route.name}"可通过，但存在${warningCount}个警告项，建议检查后使用。`
      nextAction = '检查警告项后可选择该路线，或考虑其他路线。'
      recommended = true
      break
    case 'needs_modification':
      summary = `路线"${route.name}"存在${failCount}个不通过障碍，需要调整车组或配置后重新校核。`
      nextAction = '返回车组调整或选择其他路线。'
      recommended = false
      break
    case 'blocked':
      summary = `路线"${route.name}"存在不可修改的障碍问题，建议选择其他路线。`
      nextAction = '请选择其他路线。'
      recommended = false
      break
    case 'incomplete':
      summary = `路线"${route.name}"存在${notCheckedCount + blockedCount}个未完成检查的障碍，请先完成所有障碍的规则检查。`
      nextAction = '返回路线勘测完成所有障碍的参数测量和规则检查。'
      recommended = false
      break
  }

  return {
    routeId: route.id,
    routeName: route.name,
    finalStatus,
    recommended,
    obstacleSummaries,
    editableItems: uniqueEditableItems,
    passCount,
    warningCount,
    failCount,
    blockedCount,
    notCheckedCount,
    summary,
    reasons,
    nextAction,
    teachingNote: TEACHING_NOTE,
    generatedAt: new Date().toISOString(),
    engineVersion: '1.0.0',
  }
}

export function rankRouteRecommendations(
  recommendations: RouteRecommendationResult[],
): RouteRecommendationResult[] {
  const statusPriority: Record<RouteFinalStatus, number> = {
    recommended: 0,
    available_with_warnings: 1,
    needs_modification: 2,
    incomplete: 3,
    blocked: 4,
  }

  return [...recommendations].sort((a, b) => {
    const statusDiff =
      statusPriority[a.finalStatus] - statusPriority[b.finalStatus]
    if (statusDiff !== 0) return statusDiff

    const failDiff = a.failCount - b.failCount
    if (failDiff !== 0) return failDiff

    const warningDiff = a.warningCount - b.warningCount
    if (warningDiff !== 0) return warningDiff

    return a.blockedCount - b.blockedCount
  })
}

export function formatRouteRecommendationReason(
  result: RouteRecommendationResult,
): string {
  return result.summary
}
