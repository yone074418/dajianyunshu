import { describe, it, expect } from 'vitest'
import {
  validateRouteRecommendationResult,
  getEditableItemsForObstacle,
  determineSeverity,
  createNotCheckedSummary,
  determineRouteFinalStatus,
  buildRouteRecommendation,
  rankRouteRecommendations,
  formatRouteRecommendationReason,
  type ObstacleConclusionSummary,
} from './routeRecommendation'
import { SURVEY_ROUTES } from './surveyRouteData'
import type { RouteObstacle } from './surveyRoutes'

const mockObstacle: RouteObstacle = {
  id: 'obs_test',
  routeId: 'route_test',
  type: 'height_limit',
  name: '测试限高架',
  description: '测试障碍',
  position: [0, 0, 0],
  riskLevel: 'medium',
  measurementTool: 'height',
  measurementPlaceholders: {},
  teachingNote: '测试教学说明',
  enabled: true,
  order: 0,
}

const passSummary: ObstacleConclusionSummary = {
  routeId: 'route_a_urban_low_bridge',
  obstacleId: 'obs_a1',
  obstacleName: '测试限高架',
  obstacleType: 'height_limit',
  status: 'pass',
  passed: true,
  reason: '通过',
  teachingNote: '测试',
  editableItems: [],
  severity: 'info',
}

const warningSummary: ObstacleConclusionSummary = {
  routeId: 'route_a_urban_low_bridge',
  obstacleId: 'obs_a2',
  obstacleName: '测试弯道',
  obstacleType: 'circular_curve',
  status: 'pass_with_warning',
  passed: true,
  reason: '有警告',
  teachingNote: '测试',
  editableItems: [],
  severity: 'warning',
}

const failSummary: ObstacleConclusionSummary = {
  routeId: 'route_a_urban_low_bridge',
  obstacleId: 'obs_a3',
  obstacleName: '测试坡道',
  obstacleType: 'slope',
  status: 'fail',
  passed: false,
  reason: '不通过',
  teachingNote: '测试',
  editableItems: [
    {
      id: 'select_lower_slope_route',
      label: '选择坡度更小路线',
      category: 'route_selection',
      description: '选择坡度更小的其他路线。',
      enabledInCurrentStep: true,
    },
  ],
  severity: 'error',
}

const blockedSummary: ObstacleConclusionSummary = {
  routeId: 'route_a_urban_low_bridge',
  obstacleId: 'obs_a4',
  obstacleName: '测试桥梁',
  obstacleType: 'bridge',
  status: 'blocked',
  passed: false,
  reason: '缺参数',
  teachingNote: '测试',
  editableItems: [],
  severity: 'blocked',
}

const notCheckedSummary: ObstacleConclusionSummary = {
  routeId: 'route_a_urban_low_bridge',
  obstacleId: 'obs_a5',
  obstacleName: '未检查障碍',
  obstacleType: 'unknown',
  status: 'not_checked',
  passed: false,
  reason: '未检查',
  teachingNote: '测试',
  editableItems: [],
  severity: 'blocked',
}

describe('validateRouteRecommendationResult', () => {
  it('valid result passes', () => {
    const route = SURVEY_ROUTES[0]
    const result = buildRouteRecommendation(route, [passSummary])
    expect(validateRouteRecommendationResult(result).valid).toBe(true)
  })

  it('fails for missing routeId', () => {
    const result = { routeId: '', routeName: 'test' }
    expect(validateRouteRecommendationResult(result).valid).toBe(false)
  })

  it('fails for null input', () => {
    expect(validateRouteRecommendationResult(null).valid).toBe(false)
  })
})

describe('getEditableItemsForObstacle', () => {
  it('returns data_completion for not_checked', () => {
    const items = getEditableItemsForObstacle('height_limit', 'not_checked')
    expect(items.length).toBeGreaterThan(0)
    expect(items[0].category).toBe('data_completion')
  })

  it('returns data_completion for blocked', () => {
    const items = getEditableItemsForObstacle('bridge', 'blocked')
    expect(items.length).toBeGreaterThan(0)
    expect(items[0].category).toBe('data_completion')
  })

  it('returns items for height_limit fail', () => {
    const items = getEditableItemsForObstacle('height_limit', 'fail')
    expect(items.length).toBeGreaterThan(0)
    expect(items.some((i) => i.id === 'select_bypass_route')).toBe(true)
  })

  it('returns items for slope fail', () => {
    const items = getEditableItemsForObstacle('slope', 'fail')
    expect(items.length).toBeGreaterThan(0)
    expect(items.some((i) => i.id === 'select_lower_slope_route')).toBe(true)
  })

  it('returns items for bridge fail', () => {
    const items = getEditableItemsForObstacle('bridge', 'fail')
    expect(items.length).toBeGreaterThan(0)
    expect(items.some((i) => i.id === 'select_higher_load_route')).toBe(true)
  })

  it('returns empty for pass', () => {
    const items = getEditableItemsForObstacle('height_limit', 'pass')
    expect(items.length).toBe(0)
  })
})

describe('determineSeverity', () => {
  it('returns info for pass', () => {
    expect(determineSeverity('pass')).toBe('info')
  })

  it('returns warning for pass_with_warning', () => {
    expect(determineSeverity('pass_with_warning')).toBe('warning')
  })

  it('returns error for fail', () => {
    expect(determineSeverity('fail')).toBe('error')
  })

  it('returns blocked for blocked', () => {
    expect(determineSeverity('blocked')).toBe('blocked')
  })

  it('returns blocked for not_checked', () => {
    expect(determineSeverity('not_checked')).toBe('blocked')
  })
})

describe('createNotCheckedSummary', () => {
  it('creates not_checked summary', () => {
    const summary = createNotCheckedSummary('route_a', mockObstacle)
    expect(summary.status).toBe('not_checked')
    expect(summary.passed).toBe(false)
    expect(summary.severity).toBe('blocked')
    expect(summary.reason).toContain('尚未')
  })

  it('includes editable items', () => {
    const summary = createNotCheckedSummary('route_a', mockObstacle)
    expect(summary.editableItems.length).toBeGreaterThan(0)
  })
})

describe('determineRouteFinalStatus', () => {
  it('returns recommended when all pass', () => {
    expect(determineRouteFinalStatus([passSummary])).toBe('recommended')
  })

  it('returns available_with_warnings when has warning', () => {
    expect(determineRouteFinalStatus([passSummary, warningSummary])).toBe(
      'available_with_warnings',
    )
  })

  it('returns needs_modification when has modifiable fail', () => {
    expect(determineRouteFinalStatus([passSummary, failSummary])).toBe(
      'needs_modification',
    )
  })

  it('returns blocked when has non-modifiable fail', () => {
    const nonModifiableFail: ObstacleConclusionSummary = {
      ...failSummary,
      editableItems: [
        {
          id: 'test',
          label: 'test',
          category: 'vehicle_configuration',
          description: 'test',
          enabledInCurrentStep: false,
        },
      ],
    }
    expect(determineRouteFinalStatus([passSummary, nonModifiableFail])).toBe(
      'blocked',
    )
  })

  it('returns incomplete when has not_checked', () => {
    expect(determineRouteFinalStatus([passSummary, notCheckedSummary])).toBe(
      'incomplete',
    )
  })

  it('returns incomplete when has blocked', () => {
    expect(determineRouteFinalStatus([passSummary, blockedSummary])).toBe(
      'incomplete',
    )
  })
})

describe('buildRouteRecommendation', () => {
  it('builds recommendation for route with all pass', () => {
    const route = SURVEY_ROUTES[0]
    const result = buildRouteRecommendation(route, [passSummary])
    expect(result.routeId).toBe(route.id)
    expect(result.routeName).toBe(route.name)
    expect(result.finalStatus).toBe('recommended')
    expect(result.recommended).toBe(true)
    expect(result.passCount).toBe(1)
    expect(result.failCount).toBe(0)
    expect(result.summary).toBeTruthy()
    expect(result.reasons.length).toBeGreaterThan(0)
    expect(result.nextAction).toBeTruthy()
    expect(result.teachingNote).toBeTruthy()
    expect(result.generatedAt).toBeTruthy()
  })

  it('builds recommendation for route with fail', () => {
    const route = SURVEY_ROUTES[0]
    const result = buildRouteRecommendation(route, [passSummary, failSummary])
    expect(result.finalStatus).toBe('needs_modification')
    expect(result.recommended).toBe(false)
    expect(result.failCount).toBe(1)
  })

  it('builds recommendation for route with not_checked', () => {
    const route = SURVEY_ROUTES[0]
    const result = buildRouteRecommendation(route, [
      passSummary,
      notCheckedSummary,
    ])
    expect(result.finalStatus).toBe('incomplete')
    expect(result.recommended).toBe(false)
    expect(result.notCheckedCount).toBe(1)
  })

  it('collects editable items from all obstacles', () => {
    const route = SURVEY_ROUTES[0]
    const result = buildRouteRecommendation(route, [passSummary, failSummary])
    expect(result.editableItems.length).toBeGreaterThan(0)
  })

  it('calculates counts correctly', () => {
    const route = SURVEY_ROUTES[0]
    const result = buildRouteRecommendation(route, [
      passSummary,
      warningSummary,
      failSummary,
      blockedSummary,
      notCheckedSummary,
    ])
    expect(result.passCount).toBe(1)
    expect(result.warningCount).toBe(1)
    expect(result.failCount).toBe(1)
    expect(result.blockedCount).toBe(1)
    expect(result.notCheckedCount).toBe(1)
  })
})

describe('rankRouteRecommendations', () => {
  it('ranks recommended first', () => {
    const route = SURVEY_ROUTES[0]
    const recommended = buildRouteRecommendation(route, [passSummary])
    const incomplete = buildRouteRecommendation(route, [notCheckedSummary])
    const ranked = rankRouteRecommendations([incomplete, recommended])
    expect(ranked[0].finalStatus).toBe('recommended')
  })

  it('ranks available_with_warnings second', () => {
    const route = SURVEY_ROUTES[0]
    const warning = buildRouteRecommendation(route, [warningSummary])
    const needsMod = buildRouteRecommendation(route, [failSummary])
    const ranked = rankRouteRecommendations([needsMod, warning])
    expect(ranked[0].finalStatus).toBe('available_with_warnings')
  })

  it('ranks blocked last', () => {
    const route = SURVEY_ROUTES[0]
    const nonModifiableFail: ObstacleConclusionSummary = {
      ...failSummary,
      editableItems: [
        {
          id: 'test_item',
          label: '测试项',
          category: 'vehicle_configuration',
          description: '测试',
          enabledInCurrentStep: false,
        },
      ],
    }
    const blocked = buildRouteRecommendation(route, [nonModifiableFail])
    const incomplete = buildRouteRecommendation(route, [notCheckedSummary])
    const ranked = rankRouteRecommendations([blocked, incomplete])
    expect(ranked[0].finalStatus).toBe('incomplete')
    expect(ranked[1].finalStatus).toBe('blocked')
  })
})

describe('formatRouteRecommendationReason', () => {
  it('returns summary string', () => {
    const route = SURVEY_ROUTES[0]
    const result = buildRouteRecommendation(route, [passSummary])
    expect(formatRouteRecommendationReason(result)).toBe(result.summary)
  })
})

describe('Three routes recommendation', () => {
  it('all three routes can generate recommendations', () => {
    for (const route of SURVEY_ROUTES) {
      const obstacleSummaries = route.obstacles.map((obs) =>
        createNotCheckedSummary(route.id, obs),
      )
      const result = buildRouteRecommendation(route, obstacleSummaries)
      expect(result.routeId).toBe(route.id)
      expect(result.routeName).toBe(route.name)
      expect(result.obstacleSummaries.length).toBe(route.obstacles.length)
    }
  })

  it('each route shows obstacle list', () => {
    for (const route of SURVEY_ROUTES) {
      const obstacleSummaries = route.obstacles.map((obs) =>
        createNotCheckedSummary(route.id, obs),
      )
      const result = buildRouteRecommendation(route, obstacleSummaries)
      expect(result.obstacleSummaries.length).toBeGreaterThan(0)
    }
  })
})

describe('Teaching note', () => {
  it('every result includes teaching note', () => {
    const route = SURVEY_ROUTES[0]
    const result = buildRouteRecommendation(route, [passSummary])
    expect(result.teachingNote).toContain('教学简化规则')
    expect(result.teachingNote).toContain('Day69')
    expect(result.teachingNote).toContain('Day70')
  })

  it('does not implement Day70 G4 verification', () => {
    const route = SURVEY_ROUTES[0]
    const result = buildRouteRecommendation(route, [passSummary])
    expect(result.teachingNote).not.toContain('自动验收')
    expect(result.teachingNote).not.toContain('自动评分')
  })
})
