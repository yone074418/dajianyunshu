import { describe, it, expect } from 'vitest'
import {
  evaluateSlopeTraction,
  validateSlopeTractionInput,
  calculateEffectiveTractionForce,
  calculateGradeResistance,
  calculateRollingResistance,
  calculateTotalSlopeResistance,
  calculateSlopePercentFromDistances,
  formatSlopeTractionReason,
  type SlopeTractionInput,
} from './slopeTraction'

const baseInput: SlopeTractionInput = {
  routeId: 'route_c_mountain_slope',
  obstacleId: 'obs_c1_mountain_slope',
  obstacleName: '山腰陡坡段',
  slope: {
    slopePercent: 7.5,
  },
  vehicle: {
    totalMassT: 200,
    tractorCount: 2,
    tractionForcePerTractorKN: 300,
    drivetrainEfficiency: 0.85,
    rollingResistanceCoefficient: 0.015,
  },
  safetyFactor: 1.1,
  measurementSource: 'slope_measurement_result',
}

describe('validateSlopeTractionInput', () => {
  it('valid input passes', () => {
    expect(validateSlopeTractionInput(baseInput).valid).toBe(true)
  })

  it('fails for missing routeId', () => {
    expect(
      validateSlopeTractionInput({ ...baseInput, routeId: '' }).valid,
    ).toBe(false)
  })

  it('fails for missing obstacleId', () => {
    expect(
      validateSlopeTractionInput({ ...baseInput, obstacleId: '' }).valid,
    ).toBe(false)
  })

  it('fails for missing obstacleName', () => {
    expect(
      validateSlopeTractionInput({ ...baseInput, obstacleName: '' }).valid,
    ).toBe(false)
  })

  it('fails for null input', () => {
    expect(validateSlopeTractionInput(null).valid).toBe(false)
  })

  it('fails for totalMassT <= 0', () => {
    expect(
      validateSlopeTractionInput({
        ...baseInput,
        vehicle: { ...baseInput.vehicle, totalMassT: 0 },
      }).valid,
    ).toBe(false)
  })

  it('fails for tractorCount <= 0', () => {
    expect(
      validateSlopeTractionInput({
        ...baseInput,
        vehicle: { ...baseInput.vehicle, tractorCount: 0 },
      }).valid,
    ).toBe(false)
  })

  it('fails for tractionForcePerTractorKN <= 0', () => {
    expect(
      validateSlopeTractionInput({
        ...baseInput,
        vehicle: { ...baseInput.vehicle, tractionForcePerTractorKN: -1 },
      }).valid,
    ).toBe(false)
  })

  it('accepts valid measurementSource values', () => {
    expect(
      validateSlopeTractionInput({
        ...baseInput,
        measurementSource: 'teaching_config',
      }).valid,
    ).toBe(true)
    expect(
      validateSlopeTractionInput({
        ...baseInput,
        measurementSource: 'manual_input',
      }).valid,
    ).toBe(true)
  })

  it('accepts slope with horizontal and vertical distances', () => {
    expect(
      validateSlopeTractionInput({
        ...baseInput,
        slope: {
          horizontalDistanceM: 200,
          verticalDistanceM: 15,
        },
      }).valid,
    ).toBe(true)
  })
})

describe('calculateSlopePercentFromDistances', () => {
  it('calculates slope percent correctly', () => {
    expect(calculateSlopePercentFromDistances(200, 15)).toBeCloseTo(7.5, 1)
  })

  it('returns 0 for zero vertical distance', () => {
    expect(calculateSlopePercentFromDistances(200, 0)).toBe(0)
  })

  it('returns null for zero horizontal distance', () => {
    expect(calculateSlopePercentFromDistances(0, 15)).toBeNull()
  })

  it('returns null for negative horizontal distance', () => {
    expect(calculateSlopePercentFromDistances(-100, 15)).toBeNull()
  })

  it('returns null for NaN inputs', () => {
    expect(calculateSlopePercentFromDistances(NaN, 15)).toBeNull()
  })
})

describe('calculateEffectiveTractionForce', () => {
  it('calculates traction force correctly', () => {
    const force = calculateEffectiveTractionForce(baseInput)
    expect(force).toBeCloseTo(510, 0)
  })

  it('uses default efficiency when not provided', () => {
    const input = {
      ...baseInput,
      vehicle: {
        ...baseInput.vehicle,
        drivetrainEfficiency: undefined,
      },
    }
    const force = calculateEffectiveTractionForce(input)
    expect(force).toBeCloseTo(2 * 300 * 0.85, 0)
  })
})

describe('calculateGradeResistance', () => {
  it('calculates grade resistance correctly', () => {
    const resistance = calculateGradeResistance(200, 7.5)
    expect(resistance).toBeCloseTo(147, 0)
  })

  it('returns 0 for zero slope', () => {
    expect(calculateGradeResistance(200, 0)).toBe(0)
  })
})

describe('calculateRollingResistance', () => {
  it('calculates rolling resistance correctly', () => {
    const resistance = calculateRollingResistance(200, 0.015)
    expect(resistance).toBeCloseTo(29.4, 0)
  })

  it('returns 0 for zero coefficient', () => {
    expect(calculateRollingResistance(200, 0)).toBe(0)
  })
})

describe('calculateTotalSlopeResistance', () => {
  it('calculates total resistance with safety factor', () => {
    const total = calculateTotalSlopeResistance(147, 29.4, 1.1)
    expect(total).toBeCloseTo(194.04, 0)
  })

  it('uses safety factor of 1 when not applied', () => {
    const total = calculateTotalSlopeResistance(147, 29.4, 1.0)
    expect(total).toBeCloseTo(176.4, 0)
  })
})

describe('evaluateSlopeTraction', () => {
  it('returns pass when traction exceeds resistance', () => {
    const r = evaluateSlopeTraction(baseInput)
    expect(r.status).toBe('pass')
    expect(r.passed).toBe(true)
    expect(r.effectiveTractionKN).toBeGreaterThan(r.totalResistanceKN!)
  })

  it('returns pass_with_warning when traction equals resistance', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      vehicle: {
        ...baseInput.vehicle,
        totalMassT: 346.94,
        tractorCount: 1,
        tractionForcePerTractorKN: 300,
        drivetrainEfficiency: 0.85,
        rollingResistanceCoefficient: 0,
      },
      safetyFactor: 1.0,
    })
    expect(r.status).toBe('pass_with_warning')
    expect(r.passed).toBe(true)
    expect(r.boundaryCase).toBe('traction_equal_to_resistance')
  })

  it('returns fail when traction is less than resistance', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      vehicle: {
        ...baseInput.vehicle,
        totalMassT: 500,
        tractorCount: 1,
        tractionForcePerTractorKN: 200,
      },
    })
    expect(r.status).toBe('fail')
    expect(r.passed).toBe(false)
    expect(r.boundaryCase).toBe('traction_less_than_resistance')
  })

  it('returns blocked when slopePercent missing', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      slope: {},
    })
    expect(r.status).toBe('blocked')
    expect(r.boundaryCase).toBe('missing_parameter')
  })

  it('calculates slopePercent from distances when not provided', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      slope: {
        horizontalDistanceM: 200,
        verticalDistanceM: 15,
      },
    })
    expect(r.slopePercent).toBeCloseTo(7.5, 1)
    expect(r.status).not.toBe('blocked')
  })

  it('returns blocked when totalMassT missing', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalMassT: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when tractorCount missing', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, tractorCount: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when tractionForcePerTractorKN missing', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, tractionForcePerTractorKN: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked for drivetrainEfficiency of 0', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, drivetrainEfficiency: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked for drivetrainEfficiency > 1', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, drivetrainEfficiency: 1.5 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked for negative rollingResistanceCoefficient', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, rollingResistanceCoefficient: -0.01 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked for safetyFactor of 0', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      safetyFactor: 0,
    })
    expect(r.status).toBe('blocked')
  })

  it('handles NaN without producing NaN in output', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      slope: { slopePercent: NaN },
    })
    expect(r.status).toBe('blocked')
    expect(isNaN(r.effectiveTractionKN ?? 0)).toBe(false)
  })

  it('handles Infinity gracefully', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      slope: { slopePercent: Infinity },
    })
    expect(r.status).toBe('blocked')
  })

  it('every result has summary, reasons, teachingNote, nextAction', () => {
    const r = evaluateSlopeTraction(baseInput)
    expect(r.summary).toBeTruthy()
    expect(r.reasons).toBeDefined()
    expect(r.teachingNote).toBeTruthy()
    expect(r.nextAction).toBeTruthy()
  })

  it('every result has calculationProcess', () => {
    const r = evaluateSlopeTraction(baseInput)
    expect(r.calculationProcess).toBeDefined()
    expect(r.calculationProcess.length).toBeGreaterThan(0)
  })

  it('displays effectiveTractionKN in result', () => {
    const r = evaluateSlopeTraction(baseInput)
    expect(r.effectiveTractionKN).toBeDefined()
    expect(r.effectiveTractionKN).toBeGreaterThan(0)
  })

  it('displays gradeResistanceKN in result', () => {
    const r = evaluateSlopeTraction(baseInput)
    expect(r.gradeResistanceKN).toBeDefined()
    expect(r.gradeResistanceKN).toBeGreaterThanOrEqual(0)
  })

  it('displays totalResistanceKN in result', () => {
    const r = evaluateSlopeTraction(baseInput)
    expect(r.totalResistanceKN).toBeDefined()
    expect(r.totalResistanceKN).toBeGreaterThan(0)
  })

  it('displays tractionMarginKN in result', () => {
    const r = evaluateSlopeTraction(baseInput)
    expect(r.tractionMarginKN).toBeDefined()
  })

  it('does not implement Day68 bridge load rule', () => {
    const r = evaluateSlopeTraction(baseInput)
    expect(r.ruleId).toBe('slope_traction')
    expect(r.ruleId).not.toBe('bridge_load')
  })

  it('handles slope of 0 correctly', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      slope: { slopePercent: 0 },
    })
    expect(r.gradeResistanceKN).toBe(0)
    expect(r.status).toBe('pass')
  })
})

describe('formatSlopeTractionReason', () => {
  it('returns summary string', () => {
    const r = evaluateSlopeTraction(baseInput)
    expect(formatSlopeTractionReason(r)).toBe(r.summary)
  })

  it('returns fail summary for fail case', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      vehicle: {
        ...baseInput.vehicle,
        totalMassT: 500,
        tractorCount: 1,
        tractionForcePerTractorKN: 200,
      },
    })
    const formatted = formatSlopeTractionReason(r)
    expect(formatted).toContain('不足')
  })

  it('returns blocked summary for missing params', () => {
    const r = evaluateSlopeTraction({
      ...baseInput,
      slope: {},
    })
    const formatted = formatSlopeTractionReason(r)
    expect(formatted).toContain('缺少')
  })
})
