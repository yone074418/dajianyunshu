import { describe, it, expect } from 'vitest'
import {
  buildHeightAdjustmentRequirement,
  buildSlopeAdjustmentRequirement,
  buildAxleLoadAdjustmentRequirement,
  mapObstacleConclusionToAdjustmentRequirements,
  mapRouteConclusionToAdjustmentRequirements,
  validateVehicleAdjustmentRequirement,
  validateRouteVehicleAdjustmentSummary,
  TEACHING_NOTE,
  ENGINE_VERSION,
  type VehicleAdjustmentRequirement,
  type RouteVehicleAdjustmentSummary,
} from './vehicleAdjustmentRequirement'
import type {
  ObstacleConclusionSummary,
  RouteRecommendationResult,
} from './routeRecommendation'

function createMockObstacle(
  overrides: Partial<ObstacleConclusionSummary> = {},
): ObstacleConclusionSummary {
  return {
    routeId: 'route-a',
    obstacleId: 'obs-1',
    obstacleName: '测试障碍',
    obstacleType: 'height_limit',
    status: 'pass',
    passed: true,
    reason: '通过',
    teachingNote: '教学说明',
    editableItems: [],
    severity: 'info',
    ...overrides,
  }
}

function createMockRecommendation(
  overrides: Partial<RouteRecommendationResult> = {},
): RouteRecommendationResult {
  return {
    routeId: 'route-a',
    routeName: '路线A',
    finalStatus: 'recommended',
    recommended: true,
    obstacleSummaries: [],
    editableItems: [],
    passCount: 0,
    warningCount: 0,
    failCount: 0,
    blockedCount: 0,
    notCheckedCount: 0,
    summary: '测试摘要',
    reasons: [],
    nextAction: '下一步',
    teachingNote: TEACHING_NOTE,
    generatedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    ...overrides,
  }
}

describe('vehicleAdjustmentRequirement', () => {
  describe('buildHeightAdjustmentRequirement', () => {
    it('高度fail生成降低运输高度建议', () => {
      const requirements = buildHeightAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-height',
        obstacleName: '限高桥洞',
        sourceStatus: 'fail',
      })

      expect(requirements.length).toBeGreaterThanOrEqual(1)
      const lowerHeight = requirements.find(
        (r) => r.actionType === 'lower_transport_height',
      )
      expect(lowerHeight).toBeDefined()
      expect(lowerHeight!.status).toBe('required')
      expect(lowerHeight!.category).toBe('height_clearance')
      expect(lowerHeight!.routeId).toBe('route-a')
      expect(lowerHeight!.obstacleId).toBe('obs-height')
      expect(lowerHeight!.sourceRuleId).toBe('height_clearance')
    })

    it('高度fail生成悬架高度调整建议并标记Day72', () => {
      const requirements = buildHeightAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-height',
        obstacleName: '限高桥洞',
        sourceStatus: 'fail',
      })

      const suspension = requirements.find(
        (r) => r.actionType === 'adjust_suspension_height',
      )
      expect(suspension).toBeDefined()
      expect(suspension!.nextStepDay).toBe(72)
      expect(suspension!.enabledInDay71).toBe(false)
    })

    it('高度pass_with_warning生成recommended建议', () => {
      const requirements = buildHeightAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-height',
        obstacleName: '限高桥洞',
        sourceStatus: 'pass_with_warning',
      })

      expect(requirements.length).toBeGreaterThanOrEqual(1)
      for (const req of requirements) {
        expect(req.status).toBe('recommended')
      }
    })

    it('高度blocked生成补充测量建议', () => {
      const requirements = buildHeightAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-height',
        obstacleName: '限高桥洞',
        sourceStatus: 'blocked',
      })

      expect(requirements.length).toBe(1)
      expect(requirements[0].actionType).toBe('complete_measurement')
      expect(requirements[0].status).toBe('blocked')
      expect(requirements[0].enabledInDay71).toBe(true)
    })

    it('高度not_checked生成补充测量建议', () => {
      const requirements = buildHeightAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-height',
        obstacleName: '限高桥洞',
        sourceStatus: 'not_checked',
      })

      expect(requirements.length).toBe(1)
      expect(requirements[0].actionType).toBe('complete_measurement')
      expect(requirements[0].status).toBe('blocked')
    })
  })

  describe('buildSlopeAdjustmentRequirement', () => {
    it('坡度fail生成增加牵引车建议并标记Day72', () => {
      const requirements = buildSlopeAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-slope',
        obstacleName: '陡坡',
        sourceStatus: 'fail',
      })

      const addTractor = requirements.find(
        (r) => r.actionType === 'increase_tractor_count',
      )
      expect(addTractor).toBeDefined()
      expect(addTractor!.status).toBe('required')
      expect(addTractor!.category).toBe('slope_traction')
      expect(addTractor!.nextStepDay).toBe(72)
      expect(addTractor!.enabledInDay71).toBe(false)
    })

    it('坡度fail生成降低总质量建议', () => {
      const requirements = buildSlopeAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-slope',
        obstacleName: '陡坡',
        sourceStatus: 'fail',
      })

      const reduceMass = requirements.find(
        (r) => r.actionType === 'reduce_total_mass',
      )
      expect(reduceMass).toBeDefined()
      expect(reduceMass!.status).toBe('required')
    })

    it('坡度fail生成换路线建议', () => {
      const requirements = buildSlopeAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-slope',
        obstacleName: '陡坡',
        sourceStatus: 'fail',
      })

      const altRoute = requirements.find(
        (r) => r.actionType === 'choose_alternative_route',
      )
      expect(altRoute).toBeDefined()
      expect(altRoute!.enabledInDay71).toBe(true)
    })

    it('坡度blocked生成补充坡度测量建议', () => {
      const requirements = buildSlopeAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-slope',
        obstacleName: '陡坡',
        sourceStatus: 'blocked',
      })

      expect(requirements.length).toBe(1)
      expect(requirements[0].actionType).toBe('complete_measurement')
      expect(requirements[0].status).toBe('blocked')
    })
  })

  describe('buildAxleLoadAdjustmentRequirement', () => {
    it('轴载fail生成增加轴线数建议并标记Day73', () => {
      const requirements = buildAxleLoadAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-bridge',
        obstacleName: '桥梁',
        sourceStatus: 'fail',
      })

      const addAxle = requirements.find(
        (r) => r.actionType === 'increase_axle_lines',
      )
      expect(addAxle).toBeDefined()
      expect(addAxle!.status).toBe('required')
      expect(addAxle!.category).toBe('axle_load_distribution')
      expect(addAxle!.nextStepDay).toBe(73)
      expect(addAxle!.enabledInDay71).toBe(false)
    })

    it('轴载fail生成增加纵列分载建议并标记Day73', () => {
      const requirements = buildAxleLoadAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-bridge',
        obstacleName: '桥梁',
        sourceStatus: 'fail',
      })

      const addColumn = requirements.find(
        (r) => r.actionType === 'increase_trailer_columns',
      )
      expect(addColumn).toBeDefined()
      expect(addColumn!.nextStepDay).toBe(73)
      expect(addColumn!.enabledInDay71).toBe(false)
    })

    it('桥梁限载缺失生成补充桥梁信息建议', () => {
      const requirements = buildAxleLoadAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-bridge',
        obstacleName: '桥梁',
        sourceStatus: 'blocked',
      })

      expect(requirements.length).toBe(1)
      expect(requirements[0].actionType).toBe('complete_measurement')
      expect(requirements[0].status).toBe('blocked')
      expect(requirements[0].sourceRuleId).toBe('bridge_bearing')
    })

    it('轴载pass_with_warning生成recommended建议', () => {
      const requirements = buildAxleLoadAdjustmentRequirement({
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-bridge',
        obstacleName: '桥梁',
        sourceStatus: 'pass_with_warning',
      })

      expect(requirements.length).toBeGreaterThanOrEqual(1)
      for (const req of requirements) {
        expect(req.status).toBe('recommended')
      }
    })
  })

  describe('mapObstacleConclusionToAdjustmentRequirements', () => {
    it('pass状态不生成调整建议', () => {
      const obstacle = createMockObstacle({ status: 'pass' })
      const requirements = mapObstacleConclusionToAdjustmentRequirements(
        'route-a',
        '路线A',
        obstacle,
      )
      expect(requirements.length).toBe(0)
    })

    it('height_limit fail生成高度相关建议', () => {
      const obstacle = createMockObstacle({
        obstacleType: 'height_limit',
        status: 'fail',
      })
      const requirements = mapObstacleConclusionToAdjustmentRequirements(
        'route-a',
        '路线A',
        obstacle,
      )
      expect(requirements.length).toBeGreaterThanOrEqual(1)
      expect(requirements.some((r) => r.category === 'height_clearance')).toBe(
        true,
      )
    })

    it('slope fail生成坡度相关建议', () => {
      const obstacle = createMockObstacle({
        obstacleType: 'slope',
        status: 'fail',
      })
      const requirements = mapObstacleConclusionToAdjustmentRequirements(
        'route-a',
        '路线A',
        obstacle,
      )
      expect(requirements.length).toBeGreaterThanOrEqual(1)
      expect(requirements.some((r) => r.category === 'slope_traction')).toBe(
        true,
      )
    })

    it('bridge fail生成轴载相关建议', () => {
      const obstacle = createMockObstacle({
        obstacleType: 'bridge',
        status: 'fail',
      })
      const requirements = mapObstacleConclusionToAdjustmentRequirements(
        'route-a',
        '路线A',
        obstacle,
      )
      expect(requirements.length).toBeGreaterThanOrEqual(1)
      expect(
        requirements.some((r) => r.category === 'axle_load_distribution'),
      ).toBe(true)
    })

    it('circular_curve类型不生成调整建议', () => {
      const obstacle = createMockObstacle({
        obstacleType: 'circular_curve',
        status: 'fail',
      })
      const requirements = mapObstacleConclusionToAdjustmentRequirements(
        'route-a',
        '路线A',
        obstacle,
      )
      expect(requirements.length).toBe(0)
    })
  })

  describe('mapRouteConclusionToAdjustmentRequirements', () => {
    it('无问题路线显示暂无调整要求', () => {
      const recommendation = createMockRecommendation({
        obstacleSummaries: [
          createMockObstacle({ status: 'pass' }),
          createMockObstacle({
            obstacleId: 'obs-2',
            status: 'pass',
          }),
        ],
      })
      const summary = mapRouteConclusionToAdjustmentRequirements(recommendation)

      expect(summary.requirements.length).toBe(0)
      expect(summary.requiredCount).toBe(0)
      expect(summary.recommendedCount).toBe(0)
      expect(summary.blockedCount).toBe(0)
      expect(summary.hasHeightIssue).toBe(false)
      expect(summary.hasSlopeIssue).toBe(false)
      expect(summary.hasAxleLoadIssue).toBe(false)
      expect(summary.summary).toContain('暂无车组调整要求')
    })

    it('fail路线生成required调整建议', () => {
      const recommendation = createMockRecommendation({
        obstacleSummaries: [
          createMockObstacle({
            obstacleType: 'height_limit',
            status: 'fail',
          }),
        ],
      })
      const summary = mapRouteConclusionToAdjustmentRequirements(recommendation)

      expect(summary.requiredCount).toBeGreaterThanOrEqual(1)
      expect(summary.hasHeightIssue).toBe(true)
      expect(summary.sourceRouteFinalStatus).toBe('recommended')
    })

    it('warning路线生成recommended调整建议', () => {
      const recommendation = createMockRecommendation({
        obstacleSummaries: [
          createMockObstacle({
            obstacleType: 'slope',
            status: 'pass_with_warning',
          }),
        ],
      })
      const summary = mapRouteConclusionToAdjustmentRequirements(recommendation)

      expect(summary.recommendedCount).toBeGreaterThanOrEqual(1)
      expect(summary.hasSlopeIssue).toBe(true)
    })

    it('blocked路线生成blocked调整建议', () => {
      const recommendation = createMockRecommendation({
        obstacleSummaries: [
          createMockObstacle({
            obstacleType: 'bridge',
            status: 'blocked',
          }),
        ],
      })
      const summary = mapRouteConclusionToAdjustmentRequirements(recommendation)

      expect(summary.blockedCount).toBeGreaterThanOrEqual(1)
      expect(summary.hasAxleLoadIssue).toBe(true)
    })

    it('三条路线都能生成summary', () => {
      const routes = [
        createMockRecommendation({
          routeId: 'route-a',
          routeName: '路线A',
          obstacleSummaries: [createMockObstacle({ status: 'pass' })],
        }),
        createMockRecommendation({
          routeId: 'route-b',
          routeName: '路线B',
          obstacleSummaries: [
            createMockObstacle({
              routeId: 'route-b',
              obstacleType: 'slope',
              status: 'fail',
            }),
          ],
        }),
        createMockRecommendation({
          routeId: 'route-c',
          routeName: '路线C',
          obstacleSummaries: [
            createMockObstacle({
              routeId: 'route-c',
              obstacleType: 'bridge',
              status: 'blocked',
            }),
          ],
        }),
      ]

      for (const route of routes) {
        const summary = mapRouteConclusionToAdjustmentRequirements(route)
        expect(summary.routeId).toBe(route.routeId)
        expect(summary.routeName).toBe(route.routeName)
        expect(summary.summary).toBeTruthy()
        expect(summary.nextAction).toBeTruthy()
      }
    })

    it('每条建议包含来源障碍和来源规则', () => {
      const recommendation = createMockRecommendation({
        obstacleSummaries: [
          createMockObstacle({
            obstacleId: 'obs-height-1',
            obstacleName: '限高桥洞',
            obstacleType: 'height_limit',
            status: 'fail',
          }),
        ],
      })
      const summary = mapRouteConclusionToAdjustmentRequirements(recommendation)

      for (const req of summary.requirements) {
        expect(req.obstacleId).toBe('obs-height-1')
        expect(req.obstacleName).toBe('限高桥洞')
        expect(req.sourceRuleId).toBeTruthy()
        expect(req.reason).toContain('限高桥洞')
      }
    })

    it('每条建议包含后续处理日', () => {
      const recommendation = createMockRecommendation({
        obstacleSummaries: [
          createMockObstacle({
            obstacleType: 'slope',
            status: 'fail',
          }),
        ],
      })
      const summary = mapRouteConclusionToAdjustmentRequirements(recommendation)

      const withDay = summary.requirements.filter((r) => r.nextStepDay)
      expect(withDay.length).toBeGreaterThanOrEqual(1)
      for (const req of withDay) {
        expect([72, 73, 76]).toContain(req.nextStepDay)
      }
    })

    it('hasHeightIssue/hasSlopeIssue/hasAxleLoadIssue计算正确', () => {
      const recommendation = createMockRecommendation({
        obstacleSummaries: [
          createMockObstacle({
            obstacleType: 'height_limit',
            status: 'fail',
          }),
          createMockObstacle({
            obstacleId: 'obs-slope',
            obstacleType: 'slope',
            status: 'fail',
          }),
          createMockObstacle({
            obstacleId: 'obs-bridge',
            obstacleType: 'bridge',
            status: 'fail',
          }),
        ],
      })
      const summary = mapRouteConclusionToAdjustmentRequirements(recommendation)

      expect(summary.hasHeightIssue).toBe(true)
      expect(summary.hasSlopeIssue).toBe(true)
      expect(summary.hasAxleLoadIssue).toBe(true)
    })
  })

  describe('validateVehicleAdjustmentRequirement', () => {
    it('有效数据返回valid', () => {
      const req: VehicleAdjustmentRequirement = {
        id: 'test-id',
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-1',
        obstacleName: '障碍',
        sourceRuleId: 'height_clearance',
        sourceStatus: 'fail',
        category: 'height_clearance',
        actionType: 'lower_transport_height',
        status: 'required',
        title: '降低高度',
        reason: '原因',
        suggestedChange: '建议',
        expectedEffect: '效果',
        enabledInDay71: false,
        teachingNote: TEACHING_NOTE,
        createdAt: new Date().toISOString(),
      }
      const result = validateVehicleAdjustmentRequirement(req)
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('空id返回错误', () => {
      const req = {
        id: '',
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-1',
        obstacleName: '障碍',
        sourceRuleId: 'height_clearance',
        sourceStatus: 'fail',
        category: 'height_clearance',
        actionType: 'lower_transport_height',
        status: 'required',
        title: '降低高度',
        reason: '原因',
        suggestedChange: '建议',
        expectedEffect: '效果',
        enabledInDay71: false,
        teachingNote: TEACHING_NOTE,
        createdAt: new Date().toISOString(),
      }
      const result = validateVehicleAdjustmentRequirement(req)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('非法category返回错误', () => {
      const req = {
        id: 'test-id',
        routeId: 'route-a',
        routeName: '路线A',
        obstacleId: 'obs-1',
        obstacleName: '障碍',
        sourceRuleId: 'height_clearance',
        sourceStatus: 'fail',
        category: 'invalid_category',
        actionType: 'lower_transport_height',
        status: 'required',
        title: '降低高度',
        reason: '原因',
        suggestedChange: '建议',
        expectedEffect: '效果',
        enabledInDay71: false,
        teachingNote: TEACHING_NOTE,
        createdAt: new Date().toISOString(),
      }
      const result = validateVehicleAdjustmentRequirement(req)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('category'))).toBe(true)
    })
  })

  describe('validateRouteVehicleAdjustmentSummary', () => {
    it('有效数据返回valid', () => {
      const summary: RouteVehicleAdjustmentSummary = {
        routeId: 'route-a',
        routeName: '路线A',
        sourceRouteFinalStatus: 'recommended',
        requirements: [],
        requiredCount: 0,
        recommendedCount: 0,
        blockedCount: 0,
        hasHeightIssue: false,
        hasSlopeIssue: false,
        hasAxleLoadIssue: false,
        summary: '测试',
        nextAction: '下一步',
        teachingNote: TEACHING_NOTE,
        generatedAt: new Date().toISOString(),
        engineVersion: ENGINE_VERSION,
      }
      const result = validateRouteVehicleAdjustmentSummary(summary)
      expect(result.valid).toBe(true)
    })

    it('负数requiredCount返回错误', () => {
      const summary = {
        routeId: 'route-a',
        routeName: '路线A',
        sourceRouteFinalStatus: 'recommended',
        requirements: [],
        requiredCount: -1,
        recommendedCount: 0,
        blockedCount: 0,
        hasHeightIssue: false,
        hasSlopeIssue: false,
        hasAxleLoadIssue: false,
        summary: '测试',
        nextAction: '下一步',
        teachingNote: TEACHING_NOTE,
        generatedAt: new Date().toISOString(),
        engineVersion: ENGINE_VERSION,
      }
      const result = validateRouteVehicleAdjustmentSummary(summary)
      expect(result.valid).toBe(false)
    })
  })
})
