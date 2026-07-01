import { describe, it, expect } from 'vitest'
import {
  createVehicleAdjustmentDraft,
  applyTractorCountAdjustment,
  applySuspensionHeightAdjustment,
  resetVehicleAdjustmentDraft,
  recalculateAfterVehicleAdjustment,
  createVehicleAdjustmentOperationLog,
  validateVehicleAdjustmentDraft,
  TRACTOR_COUNT_MIN,
  TRACTOR_COUNT_MAX,
  SUSPENSION_HEIGHT_ADJUST_MIN,
  SUSPENSION_HEIGHT_ADJUST_MAX,
  type VehicleAdjustmentDraft,
} from './vehicleAdjustmentDraft'

function createMockSlopeDraft(
  overrides: Partial<VehicleAdjustmentDraft> = {},
): VehicleAdjustmentDraft {
  return createVehicleAdjustmentDraft({
    routeId: 'route-a',
    routeName: '路线A',
    sourceRequirementId: 'req-slope-1',
    sourceObstacleId: 'obs-slope',
    sourceRuleId: 'slope_traction',
    adjustmentType: 'increase_tractor_count',
    before: {
      tractorCount: 2,
      tractionForcePerTractorKN: 300,
      effectiveTractionKN: 510,
      totalResistanceKN: 600,
      slopePercent: 8,
      totalMassT: 200,
      drivetrainEfficiency: 0.85,
      rollingResistanceCoefficient: 0.015,
    },
    ...overrides,
  })
}

function createMockHeightDraft(
  overrides: Partial<VehicleAdjustmentDraft> = {},
): VehicleAdjustmentDraft {
  return createVehicleAdjustmentDraft({
    routeId: 'route-a',
    routeName: '路线A',
    sourceRequirementId: 'req-height-1',
    sourceObstacleId: 'obs-height',
    sourceRuleId: 'height_clearance',
    adjustmentType: 'adjust_suspension_height',
    before: {
      totalTransportHeightM: 4.5,
      measuredClearanceHeightM: 4.2,
      safetyMarginM: 0.1,
    },
    ...overrides,
  })
}

describe('vehicleAdjustmentDraft', () => {
  describe('createVehicleAdjustmentDraft', () => {
    it('创建草稿类型可导入', () => {
      const draft = createMockSlopeDraft()
      expect(draft).toBeDefined()
      expect(draft.id).toBeTruthy()
      expect(draft.routeId).toBe('route-a')
    })

    it('初始状态为draft', () => {
      const draft = createMockSlopeDraft()
      expect(draft.status).toBe('draft')
      expect(draft.recalculationStatus).toBe('not_run')
    })

    it('after初始为空', () => {
      const draft = createMockSlopeDraft()
      expect(draft.after).toEqual({})
    })
  })

  describe('applyTractorCountAdjustment', () => {
    it('修改牵引车数量后状态为待重新计算', () => {
      const draft = createMockSlopeDraft()
      const { draft: updated, errors } = applyTractorCountAdjustment(draft, 3)
      expect(errors.length).toBe(0)
      expect(updated.after.tractorCount).toBe(3)
      expect(updated.status).toBe('draft')
      expect(updated.recalculationStatus).toBe('not_run')
    })

    it('牵引车数量低于最小值时校验失败', () => {
      const draft = createMockSlopeDraft()
      const { errors } = applyTractorCountAdjustment(
        draft,
        TRACTOR_COUNT_MIN - 1,
      )
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('不得低于')
    })

    it('牵引车数量超过最大值时校验失败', () => {
      const draft = createMockSlopeDraft()
      const { errors } = applyTractorCountAdjustment(
        draft,
        TRACTOR_COUNT_MAX + 1,
      )
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('不得超过')
    })

    it('非整数牵引车数量校验失败', () => {
      const draft = createMockSlopeDraft()
      const { errors } = applyTractorCountAdjustment(draft, 2.5)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('整数')
    })
  })

  describe('applySuspensionHeightAdjustment', () => {
    it('修改悬架高度后状态为待重新计算', () => {
      const draft = createMockHeightDraft()
      const { draft: updated, errors } = applySuspensionHeightAdjustment(
        draft,
        -0.3,
      )
      expect(errors.length).toBe(0)
      expect(updated.after.totalTransportHeightM).toBeCloseTo(4.2, 1)
      expect(updated.status).toBe('draft')
      expect(updated.recalculationStatus).toBe('not_run')
    })

    it('悬架高度调整超出下限时校验失败', () => {
      const draft = createMockHeightDraft()
      const { errors } = applySuspensionHeightAdjustment(
        draft,
        SUSPENSION_HEIGHT_ADJUST_MIN - 0.1,
      )
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('不得低于')
    })

    it('悬架高度调整超出上限时校验失败', () => {
      const draft = createMockHeightDraft()
      const { errors } = applySuspensionHeightAdjustment(
        draft,
        SUSPENSION_HEIGHT_ADJUST_MAX + 0.1,
      )
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('不得超过')
    })

    it('调整后运输总高度为负数时校验失败', () => {
      const draft = createMockHeightDraft({
        before: {
          totalTransportHeightM: 0.3,
          measuredClearanceHeightM: 4.0,
          safetyMarginM: 0.1,
        },
      })
      const { errors } = applySuspensionHeightAdjustment(draft, -0.4)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('正数')
    })
  })

  describe('recalculateAfterVehicleAdjustment', () => {
    it('增加牵引车后会调用坡道牵引力规则重新计算', () => {
      const draft = createMockSlopeDraft()
      const { draft: adjusted } = applyTractorCountAdjustment(draft, 3)
      const result = recalculateAfterVehicleAdjustment(adjusted)

      expect(result.status).toBe('recalculated')
      expect(result.recalculationStatus).not.toBe('not_run')
      expect(result.recalculationResult).toBeDefined()
    })

    it('重新计算结果可以是pass', () => {
      const draft = createMockSlopeDraft({
        before: {
          tractorCount: 1,
          tractionForcePerTractorKN: 300,
          slopePercent: 3,
          totalMassT: 100,
          drivetrainEfficiency: 0.85,
          rollingResistanceCoefficient: 0.015,
        },
      })
      const { draft: adjusted } = applyTractorCountAdjustment(draft, 2)
      const result = recalculateAfterVehicleAdjustment(adjusted)

      expect(result.recalculationResult).toBeDefined()
      expect(['pass', 'pass_with_warning']).toContain(
        result.recalculationStatus,
      )
    })

    it('重新计算结果为fail时仍显示不通过', () => {
      const draft = createMockSlopeDraft({
        before: {
          tractorCount: 1,
          tractionForcePerTractorKN: 100,
          slopePercent: 20,
          totalMassT: 500,
          drivetrainEfficiency: 0.85,
          rollingResistanceCoefficient: 0.015,
        },
      })
      const { draft: adjusted } = applyTractorCountAdjustment(draft, 2)
      const result = recalculateAfterVehicleAdjustment(adjusted)

      expect(result.recalculationStatus).toBe('fail')
      expect(result.recalculationResult.passed).toBe(false)
    })

    it('悬架高度调整后会调用高度通过性规则重新计算', () => {
      const draft = createMockHeightDraft()
      const { draft: adjusted } = applySuspensionHeightAdjustment(draft, -0.4)
      const result = recalculateAfterVehicleAdjustment(adjusted)

      expect(result.status).toBe('recalculated')
      expect(result.recalculationStatus).not.toBe('not_run')
      expect(result.recalculationResult).toBeDefined()
    })

    it('悬架调整后仍超限不会被改成成功', () => {
      const draft = createMockHeightDraft({
        before: {
          totalTransportHeightM: 5.0,
          measuredClearanceHeightM: 4.0,
          safetyMarginM: 0.1,
        },
      })
      const { draft: adjusted } = applySuspensionHeightAdjustment(draft, -0.1)
      const result = recalculateAfterVehicleAdjustment(adjusted)

      expect(result.recalculationStatus).toBe('fail')
      expect(result.recalculationResult.passed).toBe(false)
    })

    it('缺参数时阻断重新计算', () => {
      const draft = createVehicleAdjustmentDraft({
        routeId: 'route-a',
        routeName: '路线A',
        sourceRequirementId: 'req-1',
        sourceObstacleId: 'obs-1',
        sourceRuleId: 'slope_traction',
        adjustmentType: 'increase_tractor_count',
        before: {
          tractorCount: 2,
          slopePercent: undefined,
          totalMassT: undefined,
          tractionForcePerTractorKN: undefined,
        },
      })
      const result = recalculateAfterVehicleAdjustment(draft)

      expect(result.status).toBe('blocked')
      expect(result.recalculationStatus).toBe('blocked')
    })
  })

  describe('resetVehicleAdjustmentDraft', () => {
    it('重置后恢复调整前参数', () => {
      const draft = createMockSlopeDraft()
      const { draft: adjusted } = applyTractorCountAdjustment(draft, 4)
      const reset = resetVehicleAdjustmentDraft(adjusted)

      expect(reset.after).toEqual({})
      expect(reset.status).toBe('draft')
      expect(reset.recalculationStatus).toBe('not_run')
      expect(reset.recalculationResult).toBeUndefined()
    })
  })

  describe('createVehicleAdjustmentOperationLog', () => {
    it('记录修改牵引车数量', () => {
      const log = createVehicleAdjustmentOperationLog({
        routeId: 'route-a',
        requirementId: 'req-1',
        action: 'change_tractor_count',
        beforeValue: '2',
        afterValue: '3',
        message: '牵引车数量从2调整为3',
      })
      expect(log.action).toBe('change_tractor_count')
      expect(log.routeId).toBe('route-a')
      expect(log.beforeValue).toBe('2')
      expect(log.afterValue).toBe('3')
    })

    it('记录修改悬架高度', () => {
      const log = createVehicleAdjustmentOperationLog({
        routeId: 'route-a',
        requirementId: 'req-2',
        action: 'change_suspension_height',
        beforeValue: '4.5',
        afterValue: '4.2',
        message: '运输总高度从4.5m调整为4.2m',
      })
      expect(log.action).toBe('change_suspension_height')
    })

    it('记录重新计算', () => {
      const log = createVehicleAdjustmentOperationLog({
        routeId: 'route-a',
        requirementId: 'req-1',
        action: 'run_recalculation',
        ruleId: 'slope_traction',
        resultStatus: 'pass',
        message: '重新计算坡道牵引力规则',
      })
      expect(log.action).toBe('run_recalculation')
      expect(log.ruleId).toBe('slope_traction')
    })

    it('记录重置', () => {
      const log = createVehicleAdjustmentOperationLog({
        routeId: 'route-a',
        requirementId: 'req-1',
        action: 'reset_adjustment',
        message: '重置调整',
      })
      expect(log.action).toBe('reset_adjustment')
    })
  })

  describe('validateVehicleAdjustmentDraft', () => {
    it('有效数据返回valid', () => {
      const draft = createMockSlopeDraft()
      const result = validateVehicleAdjustmentDraft(draft)
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('空id返回错误', () => {
      const draft = { ...createMockSlopeDraft(), id: '' }
      const result = validateVehicleAdjustmentDraft(draft)
      expect(result.valid).toBe(false)
    })

    it('非法adjustmentType返回错误', () => {
      const draft = {
        ...createMockSlopeDraft(),
        adjustmentType: 'invalid',
      }
      const result = validateVehicleAdjustmentDraft(draft)
      expect(result.valid).toBe(false)
    })
  })
})
