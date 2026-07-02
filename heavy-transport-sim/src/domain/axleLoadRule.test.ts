import { describe, it, expect } from 'vitest'
import {
  validateAxleLoadInput,
  calculateTotalTransportMass,
  calculateAverageAxleLineLoad,
  calculateColumnDistributedLoad,
  evaluateAxleLoadRule,
  createReselectionFlowState,
  requestVehicleReselection,
  applyAxleLoadReselection,
  recalculateAxleLoadAfterReselection,
  confirmFinalVehicleConfiguration,
  createAxleLoadOperationLog,
  getTeachingWeightLimitT,
  getAxleLoadStatusDisplayText,
  getReselectionStatusDisplayText,
  axleLoadInputSchema,
  axleLoadRuleResultSchema,
  axleLoadReselectionStateSchema,
  finalVehicleConfigurationSummarySchema,
  axleLoadOperationLogSchema,
  type AxleLoadInput,
} from './axleLoadRule'

// ── Mock input ───────────────────────────────────────────────────────

const mockInput: AxleLoadInput = {
  cargoMassT: 100,
  tractorMassT: 20,
  trailerMassT: 30,
  axleLines: 6,
  columns: 2,
  singleAxleLineLimitT: 25,
  loadDistributionMode: 'teaching_simplified',
  source: 'teaching_config',
}

// ── Schema imports ───────────────────────────────────────────────────

describe('Axle load schemas', () => {
  it('axleLoadInputSchema can be imported', () => {
    expect(axleLoadInputSchema).toBeDefined()
  })

  it('axleLoadRuleResultSchema can be imported', () => {
    expect(axleLoadRuleResultSchema).toBeDefined()
  })

  it('axleLoadReselectionStateSchema can be imported', () => {
    expect(axleLoadReselectionStateSchema).toBeDefined()
  })

  it('finalVehicleConfigurationSummarySchema can be imported', () => {
    expect(finalVehicleConfigurationSummarySchema).toBeDefined()
  })

  it('axleLoadOperationLogSchema can be imported', () => {
    expect(axleLoadOperationLogSchema).toBeDefined()
  })
})

// ── Teaching weight limits ───────────────────────────────────────────

describe('getTeachingWeightLimitT', () => {
  it('returns limit for 6x2', () => {
    expect(getTeachingWeightLimitT(6, 2)).toBe(120)
  })

  it('returns limit for 4x1', () => {
    expect(getTeachingWeightLimitT(4, 1)).toBe(60)
  })

  it('returns null for invalid combination', () => {
    expect(getTeachingWeightLimitT(5, 1)).toBeNull()
  })
})

// ── Validation ───────────────────────────────────────────────────────

describe('validateAxleLoadInput', () => {
  it('passes for valid input', () => {
    expect(validateAxleLoadInput(mockInput).valid).toBe(true)
  })

  it('fails for invalid axleLines', () => {
    expect(validateAxleLoadInput({ ...mockInput, axleLines: 0 }).valid).toBe(
      false,
    )
  })

  it('fails for negative axleLines', () => {
    expect(validateAxleLoadInput({ ...mockInput, axleLines: -1 }).valid).toBe(
      false,
    )
  })

  it('fails for non-integer axleLines', () => {
    expect(validateAxleLoadInput({ ...mockInput, axleLines: 2.5 }).valid).toBe(
      false,
    )
  })

  it('fails for invalid columns', () => {
    expect(validateAxleLoadInput({ ...mockInput, columns: 0 }).valid).toBe(
      false,
    )
  })

  it('fails for negative columns', () => {
    expect(validateAxleLoadInput({ ...mockInput, columns: -1 }).valid).toBe(
      false,
    )
  })

  it('fails for safetyFactor <= 0', () => {
    expect(validateAxleLoadInput({ ...mockInput, safetyFactor: 0 }).valid).toBe(
      false,
    )
  })

  it('fails for negative safetyFactor', () => {
    expect(
      validateAxleLoadInput({ ...mockInput, safetyFactor: -1 }).valid,
    ).toBe(false)
  })

  it('fails for NaN cargoMassT', () => {
    expect(validateAxleLoadInput({ ...mockInput, cargoMassT: NaN }).valid).toBe(
      false,
    )
  })

  it('fails for Infinity cargoMassT', () => {
    expect(
      validateAxleLoadInput({ ...mockInput, cargoMassT: Infinity }).valid,
    ).toBe(false)
  })
})

// ── Calculation functions ────────────────────────────────────────────

describe('calculateTotalTransportMass', () => {
  it('calculates from components', () => {
    expect(calculateTotalTransportMass(mockInput)).toBe(150)
  })

  it('uses totalTransportMassT if provided', () => {
    expect(
      calculateTotalTransportMass({
        ...mockInput,
        totalTransportMassT: 200,
      }),
    ).toBe(200)
  })

  it('handles missing optional masses', () => {
    const input: AxleLoadInput = {
      cargoMassT: 100,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    expect(calculateTotalTransportMass(input)).toBe(100)
  })
})

describe('calculateAverageAxleLineLoad', () => {
  it('calculates correctly', () => {
    expect(calculateAverageAxleLineLoad(150, 6)).toBe(25)
  })

  it('applies safety factor', () => {
    expect(calculateAverageAxleLineLoad(150, 6, 1.1)).toBe(27.5)
  })
})

describe('calculateColumnDistributedLoad', () => {
  it('calculates correctly', () => {
    expect(calculateColumnDistributedLoad(150, 6, 2)).toBe(12.5)
  })
})

// ── Rule evaluation: pass ────────────────────────────────────────────

describe('evaluateAxleLoadRule - pass', () => {
  it('returns pass when load below limit', () => {
    const input: AxleLoadInput = {
      cargoMassT: 50,
      tractorMassT: 10,
      trailerMassT: 15,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(input)
    expect(result.status).toBe('pass')
    expect(result.passed).toBe(true)
    expect(result.canConfirmVehicle).toBe(true)
    expect(result.mustReturnToModify).toBe(false)
    expect(result.boundaryCase).toBe('load_below_limit')
  })

  it('calculates average axle line load correctly', () => {
    const input: AxleLoadInput = {
      cargoMassT: 50,
      tractorMassT: 10,
      trailerMassT: 15,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(input)
    expect(result.averageAxleLineLoadT).toBe(12.5)
    expect(result.totalTransportMassT).toBe(75)
  })
})

// ── Rule evaluation: boundary ────────────────────────────────────────

describe('evaluateAxleLoadRule - boundary', () => {
  it('returns pass_with_warning when load equals limit', () => {
    const input: AxleLoadInput = {
      cargoMassT: 120,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 20,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(input)
    // total=120, avg=120/6=20, limit=20 → boundary
    expect(result.status).toBe('pass_with_warning')
    expect(result.passed).toBe(true)
    expect(result.canConfirmVehicle).toBe(true)
    expect(result.boundaryCase).toBe('load_equal_to_limit')
  })
})

// ── Rule evaluation: fail ────────────────────────────────────────────

describe('evaluateAxleLoadRule - fail', () => {
  it('returns fail when load over limit', () => {
    const input: AxleLoadInput = {
      cargoMassT: 200,
      tractorMassT: 20,
      trailerMassT: 30,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(input)
    expect(result.status).toBe('fail')
    expect(result.passed).toBe(false)
    expect(result.canConfirmVehicle).toBe(false)
    expect(result.mustReturnToModify).toBe(true)
    expect(result.boundaryCase).toBe('load_over_limit')
  })

  it('shows calculation process', () => {
    const input: AxleLoadInput = {
      cargoMassT: 200,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(input)
    expect(result.calculationProcess.length).toBeGreaterThan(0)
    expect(result.calculationProcess.some((p) => p.includes('超载'))).toBe(true)
  })

  it('shows modification suggestion', () => {
    const input: AxleLoadInput = {
      cargoMassT: 200,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(input)
    expect(result.nextAction).toContain('返回修改')
  })
})

// ── Rule evaluation: blocked ─────────────────────────────────────────

describe('evaluateAxleLoadRule - blocked', () => {
  it('returns blocked for invalid axleLines', () => {
    const input: AxleLoadInput = {
      cargoMassT: 100,
      axleLines: 0,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(input)
    expect(result.status).toBe('blocked')
    expect(result.canConfirmVehicle).toBe(false)
  })

  it('returns blocked for invalid columns', () => {
    const input: AxleLoadInput = {
      cargoMassT: 100,
      axleLines: 6,
      columns: 0,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(input)
    expect(result.status).toBe('blocked')
    expect(result.canConfirmVehicle).toBe(false)
  })

  it('returns blocked for invalid singleAxleLineLimitT', () => {
    const input: AxleLoadInput = {
      cargoMassT: 100,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: -1,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(input)
    expect(result.status).toBe('blocked')
    expect(result.canConfirmVehicle).toBe(false)
  })

  it('NaN does not produce NaN in result', () => {
    const input: AxleLoadInput = {
      cargoMassT: 100,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
      safetyFactor: 1.0,
    }
    const result = evaluateAxleLoadRule(input)
    expect(Number.isNaN(result.averageAxleLineLoadT)).toBe(false)
  })
})

// ── Reselection flow ─────────────────────────────────────────────────

describe('createReselectionFlowState', () => {
  it('creates state with needs_modification for fail', () => {
    const failInput: AxleLoadInput = {
      cargoMassT: 200,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(failInput)
    const state = createReselectionFlowState({
      ruleResult: result,
      axleLines: 6,
      columns: 2,
      totalTransportMassT: 200,
    })
    expect(state.status).toBe('needs_modification')
    expect(state.canConfirmVehicle).toBe(false)
  })

  it('creates state with ready_to_confirm for pass', () => {
    const result = evaluateAxleLoadRule(mockInput)
    const state = createReselectionFlowState({
      ruleResult: result,
      axleLines: 6,
      columns: 2,
      totalTransportMassT: 150,
    })
    expect(state.status).toBe('ready_to_confirm')
    expect(state.canConfirmVehicle).toBe(true)
  })
})

describe('requestVehicleReselection', () => {
  it('sets status to needs_modification', () => {
    const result = evaluateAxleLoadRule(mockInput)
    let state = createReselectionFlowState({
      ruleResult: result,
      axleLines: 6,
      columns: 2,
      totalTransportMassT: 150,
    })
    state = requestVehicleReselection(state, '超载需修改')
    expect(state.status).toBe('needs_modification')
    expect(state.canConfirmVehicle).toBe(false)
  })
})

describe('applyAxleLoadReselection', () => {
  it('sets status to pending_recalculation', () => {
    const result = evaluateAxleLoadRule(mockInput)
    let state = createReselectionFlowState({
      ruleResult: result,
      axleLines: 6,
      columns: 2,
      totalTransportMassT: 150,
    })
    state = applyAxleLoadReselection(state, { axleLines: 8 })
    expect(state.status).toBe('pending_recalculation')
    expect(state.after.axleLines).toBe(8)
    expect(state.canConfirmVehicle).toBe(false)
  })
})

describe('recalculateAxleLoadAfterReselection', () => {
  it('recalculates and passes when axle lines increased', () => {
    const failInput: AxleLoadInput = {
      cargoMassT: 200,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const failResult = evaluateAxleLoadRule(failInput)
    let state = createReselectionFlowState({
      ruleResult: failResult,
      axleLines: 6,
      columns: 2,
      totalTransportMassT: 200,
    })
    state = applyAxleLoadReselection(state, { axleLines: 8 })

    const { state: newState, result } = recalculateAxleLoadAfterReselection(
      state,
      {
        cargoMassT: 200,
        singleAxleLineLimitT: 25,
        loadDistributionMode: 'teaching_simplified',
        source: 'teaching_config',
      },
    )
    expect(result.passed).toBe(true)
    expect(newState.status).toBe('ready_to_confirm')
    expect(newState.canConfirmVehicle).toBe(true)
  })

  it('recalculates and still fails when still overloaded', () => {
    const failInput: AxleLoadInput = {
      cargoMassT: 300,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const failResult = evaluateAxleLoadRule(failInput)
    let state = createReselectionFlowState({
      ruleResult: failResult,
      axleLines: 6,
      columns: 2,
      totalTransportMassT: 300,
    })
    state = applyAxleLoadReselection(state, { axleLines: 8 })

    const { state: newState, result } = recalculateAxleLoadAfterReselection(
      state,
      {
        cargoMassT: 300,
        singleAxleLineLimitT: 25,
        loadDistributionMode: 'teaching_simplified',
        source: 'teaching_config',
      },
    )
    expect(result.passed).toBe(false)
    expect(newState.status).toBe('needs_modification')
    expect(newState.canConfirmVehicle).toBe(false)
  })
})

// ── Confirm final vehicle ────────────────────────────────────────────

describe('confirmFinalVehicleConfiguration', () => {
  it('generates summary when passed', () => {
    const result = evaluateAxleLoadRule(mockInput)
    const state = createReselectionFlowState({
      ruleResult: result,
      axleLines: 6,
      columns: 2,
      totalTransportMassT: 150,
    })
    const { summary, state: newState } = confirmFinalVehicleConfiguration(state)
    expect(summary.confirmed).toBe(true)
    expect(summary.axleLines).toBe(6)
    expect(summary.columns).toBe(2)
    expect(newState.status).toBe('confirmed')
  })

  it('throws when not passed', () => {
    const failInput: AxleLoadInput = {
      cargoMassT: 200,
      axleLines: 6,
      columns: 2,
      singleAxleLineLimitT: 25,
      loadDistributionMode: 'teaching_simplified',
      source: 'teaching_config',
    }
    const result = evaluateAxleLoadRule(failInput)
    const state = createReselectionFlowState({
      ruleResult: result,
      axleLines: 6,
      columns: 2,
      totalTransportMassT: 200,
    })
    expect(() => confirmFinalVehicleConfiguration(state)).toThrow()
  })
})

// ── Operation log ────────────────────────────────────────────────────

describe('Axle load operation log', () => {
  it('creates log with required fields', () => {
    const log = createAxleLoadOperationLog({
      action: 'run_axle_load_rule',
      message: '执行轴线载荷规则。',
    })
    expect(log.id).toBeDefined()
    expect(log.action).toBe('run_axle_load_rule')
    expect(log.createdAt).toBeDefined()
  })

  it('evaluateAxleLoadRule produces valid result', () => {
    const result = evaluateAxleLoadRule(mockInput)
    expect(result.ruleId).toBe('axle_load')
    expect(result.engineVersion).toBeDefined()
  })
})

// ── Display helpers ──────────────────────────────────────────────────

describe('Display helpers', () => {
  it('getAxleLoadStatusDisplayText returns Chinese', () => {
    expect(getAxleLoadStatusDisplayText('pass')).toBe('通过')
    expect(getAxleLoadStatusDisplayText('fail')).toBe('超载')
    expect(getAxleLoadStatusDisplayText('blocked')).toBe('阻塞')
  })

  it('getReselectionStatusDisplayText returns Chinese', () => {
    expect(getReselectionStatusDisplayText('needs_modification')).toBe(
      '需要修改',
    )
    expect(getReselectionStatusDisplayText('confirmed')).toBe('已确认')
  })
})

// ── Teaching simplification notice ───────────────────────────────────

describe('Teaching simplification', () => {
  it('result includes teaching notice', () => {
    const result = evaluateAxleLoadRule(mockInput)
    expect(result.teachingSimplificationNotice).toContain('教学简化')
  })

  it('result includes engine version', () => {
    const result = evaluateAxleLoadRule(mockInput)
    expect(result.engineVersion).toContain('axle-load')
  })
})
