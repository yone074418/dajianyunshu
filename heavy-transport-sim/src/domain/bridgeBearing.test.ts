import { describe, it, expect } from 'vitest'
import {
  evaluateBridgeBearing,
  validateBridgeBearingInput,
  calculateTotalBridgeLoad,
  calculateAverageAxleLineLoad,
  calculateBridgeLoadMargin,
  calculateAxleLoadMargin,
  formatBridgeBearingReason,
  DEFAULT_SINGLE_AXLE_LINE_LIMIT_T,
  type BridgeBearingInput,
} from './bridgeBearing'

const baseInput: BridgeBearingInput = {
  routeId: 'route_a_urban_bridge',
  obstacleId: 'obs_a4_bridge',
  obstacleName: '东港大桥',
  bridge: {
    bridgeName: '东港大桥',
    bridgeKind: 'medium_bridge',
    loadLimitT: 220,
    deckWidthM: 12,
    bridgeLengthM: 150,
    singleAxleLineLimitT: 18,
  },
  vehicle: {
    totalMassT: 180,
    cargoMassT: 168,
    tractorMassT: 8,
    trailerMassT: 4,
    axleLines: 12,
    columns: 3,
  },
  safetyFactor: 1.1,
  measurementSource: 'bridge_measurement_result',
}

describe('validateBridgeBearingInput', () => {
  it('valid input passes', () => {
    expect(validateBridgeBearingInput(baseInput).valid).toBe(true)
  })

  it('fails for missing routeId', () => {
    expect(
      validateBridgeBearingInput({ ...baseInput, routeId: '' }).valid,
    ).toBe(false)
  })

  it('fails for missing obstacleId', () => {
    expect(
      validateBridgeBearingInput({ ...baseInput, obstacleId: '' }).valid,
    ).toBe(false)
  })

  it('fails for missing obstacleName', () => {
    expect(
      validateBridgeBearingInput({ ...baseInput, obstacleName: '' }).valid,
    ).toBe(false)
  })

  it('fails for missing bridgeName', () => {
    expect(
      validateBridgeBearingInput({
        ...baseInput,
        bridge: { ...baseInput.bridge, bridgeName: '' },
      }).valid,
    ).toBe(false)
  })

  it('fails for null input', () => {
    expect(validateBridgeBearingInput(null).valid).toBe(false)
  })

  it('fails for loadLimitT <= 0', () => {
    expect(
      validateBridgeBearingInput({
        ...baseInput,
        bridge: { ...baseInput.bridge, loadLimitT: 0 },
      }).valid,
    ).toBe(false)
  })

  it('fails for totalMassT <= 0', () => {
    expect(
      validateBridgeBearingInput({
        ...baseInput,
        vehicle: { ...baseInput.vehicle, totalMassT: 0 },
      }).valid,
    ).toBe(false)
  })

  it('fails for axleLines <= 0', () => {
    expect(
      validateBridgeBearingInput({
        ...baseInput,
        vehicle: { ...baseInput.vehicle, axleLines: 0 },
      }).valid,
    ).toBe(false)
  })

  it('accepts valid measurementSource values', () => {
    expect(
      validateBridgeBearingInput({
        ...baseInput,
        measurementSource: 'teaching_config',
      }).valid,
    ).toBe(true)
    expect(
      validateBridgeBearingInput({
        ...baseInput,
        measurementSource: 'manual_input',
      }).valid,
    ).toBe(true)
  })
})

describe('calculateTotalBridgeLoad', () => {
  it('calculates with safety factor', () => {
    expect(calculateTotalBridgeLoad(180, 1.1)).toBeCloseTo(198, 0)
  })

  it('uses safety factor of 1', () => {
    expect(calculateTotalBridgeLoad(180, 1.0)).toBeCloseTo(180, 0)
  })
})

describe('calculateAverageAxleLineLoad', () => {
  it('calculates correctly', () => {
    expect(calculateAverageAxleLineLoad(180, 12)).toBeCloseTo(15, 0)
  })

  it('returns 0 for zero axleLines', () => {
    expect(calculateAverageAxleLineLoad(180, 0)).toBe(0)
  })
})

describe('calculateBridgeLoadMargin', () => {
  it('calculates positive margin', () => {
    expect(calculateBridgeLoadMargin(220, 198)).toBeCloseTo(22, 0)
  })

  it('calculates negative margin', () => {
    expect(calculateBridgeLoadMargin(180, 210)).toBeCloseTo(-30, 0)
  })
})

describe('calculateAxleLoadMargin', () => {
  it('calculates positive margin', () => {
    expect(calculateAxleLoadMargin(18, 15)).toBeCloseTo(3, 0)
  })

  it('calculates negative margin', () => {
    expect(calculateAxleLoadMargin(18, 20)).toBeCloseTo(-2, 0)
  })
})

describe('evaluateBridgeBearing', () => {
  it('returns pass when load below limit', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.status).toBe('pass')
    expect(r.passed).toBe(true)
    expect(r.totalLoadMarginT).toBeGreaterThan(0)
    expect(r.axleLoadMarginT).toBeGreaterThan(0)
  })

  it('returns pass_with_warning when total load equals limit', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      bridge: { ...baseInput.bridge, loadLimitT: 198 },
      safetyFactor: 1.0,
      vehicle: { ...baseInput.vehicle, totalMassT: 198 },
    })
    expect(r.status).toBe('pass_with_warning')
    expect(r.passed).toBe(true)
    expect(r.boundaryCase).toBe('load_equal_to_limit')
  })

  it('returns fail when total load over limit', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      bridge: { ...baseInput.bridge, loadLimitT: 150 },
    })
    expect(r.status).toBe('fail')
    expect(r.passed).toBe(false)
    expect(r.boundaryCase).toBe('load_over_limit')
  })

  it('returns pass_with_warning when axle load equals limit', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalMassT: 216, axleLines: 12 },
      bridge: { ...baseInput.bridge, singleAxleLineLimitT: 18 },
      safetyFactor: 1.0,
    })
    expect(r.status).toBe('pass_with_warning')
    expect(r.passed).toBe(true)
  })

  it('returns fail when axle load over limit', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalMassT: 300, axleLines: 12 },
      safetyFactor: 1.0,
    })
    expect(r.status).toBe('fail')
    expect(r.passed).toBe(false)
    expect(r.boundaryCase).toBe('axle_load_over_limit')
  })

  it('returns blocked when loadLimitT missing', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      bridge: { ...baseInput.bridge, loadLimitT: 0 },
    })
    expect(r.status).toBe('blocked')
    expect(r.boundaryCase).toBe('missing_parameter')
  })

  it('returns blocked when totalMassT missing', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalMassT: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when axleLines missing', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, axleLines: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when bridgeName missing', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      bridge: { ...baseInput.bridge, bridgeName: '' },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked for safetyFactor of 0', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      safetyFactor: 0,
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked for negative safetyFactor', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      safetyFactor: -1,
    })
    expect(r.status).toBe('blocked')
  })

  it('uses default singleAxleLineLimitT when not provided', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      bridge: { ...baseInput.bridge, singleAxleLineLimitT: undefined },
    })
    expect(r.singleAxleLineLimitT).toBe(DEFAULT_SINGLE_AXLE_LINE_LIMIT_T)
  })

  it('safety factor affects checked total mass', () => {
    const r1 = evaluateBridgeBearing({ ...baseInput, safetyFactor: 1.0 })
    const r2 = evaluateBridgeBearing({ ...baseInput, safetyFactor: 1.2 })
    expect(r2.totalLoadMarginT!).toBeLessThan(r1.totalLoadMarginT!)
  })

  it('handles NaN without producing NaN in output', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      bridge: { ...baseInput.bridge, loadLimitT: NaN },
    })
    expect(r.status).toBe('blocked')
    expect(isNaN(r.loadLimitT ?? 0)).toBe(false)
  })

  it('handles Infinity gracefully', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      bridge: { ...baseInput.bridge, loadLimitT: Infinity },
    })
    expect(r.status).toBe('blocked')
  })

  it('every result has summary, reasons, teachingSimplificationNotice, nextAction', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.summary).toBeTruthy()
    expect(r.reasons).toBeDefined()
    expect(r.teachingSimplificationNotice).toBeTruthy()
    expect(r.nextAction).toBeTruthy()
  })

  it('every result has calculationProcess', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.calculationProcess).toBeDefined()
    expect(r.calculationProcess.length).toBeGreaterThan(0)
  })

  it('every result includes teaching simplification notice', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.teachingSimplificationNotice).toContain('教学简化判断')
    expect(r.teachingSimplificationNotice).toContain('不替代真实桥梁结构验算')
  })

  it('displays loadLimitT in result', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.loadLimitT).toBe(220)
  })

  it('displays totalMassT in result', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.totalMassT).toBe(180)
  })

  it('displays averageAxleLineLoadT in result', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.averageAxleLineLoadT).toBeDefined()
    expect(r.averageAxleLineLoadT).toBeGreaterThan(0)
  })

  it('displays totalLoadMarginT in result', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.totalLoadMarginT).toBeDefined()
  })

  it('displays axleLoadMarginT in result', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.axleLoadMarginT).toBeDefined()
  })

  it('does not implement Day69 route suggestion', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(r.ruleId).toBe('bridge_bearing')
    expect(r.ruleId).not.toBe('route_suggestion')
  })

  it('uses averageAxleLineLoadT from input when provided', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, averageAxleLineLoadT: 14 },
    })
    expect(r.averageAxleLineLoadT).toBe(14)
  })
})

describe('formatBridgeBearingReason', () => {
  it('returns summary string', () => {
    const r = evaluateBridgeBearing(baseInput)
    expect(formatBridgeBearingReason(r)).toBe(r.summary)
  })

  it('returns fail summary for over limit case', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      bridge: { ...baseInput.bridge, loadLimitT: 150 },
    })
    const formatted = formatBridgeBearingReason(r)
    expect(formatted).toContain('不能通过')
  })

  it('returns blocked summary for missing params', () => {
    const r = evaluateBridgeBearing({
      ...baseInput,
      bridge: { ...baseInput.bridge, loadLimitT: 0 },
    })
    const formatted = formatBridgeBearingReason(r)
    expect(formatted).toContain('缺少')
  })
})
