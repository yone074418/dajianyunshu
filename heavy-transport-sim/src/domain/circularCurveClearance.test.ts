import { describe, it, expect } from 'vitest'
import {
  evaluateCircularCurveClearance,
  validateCircularCurveInput,
  calculateRequiredCircularCurveWidth,
  formatCircularCurveReason,
  type CircularCurveClearanceInput,
} from './circularCurveClearance'

const baseInput: CircularCurveClearanceInput = {
  routeId: 'route_a_urban_low_bridge',
  obstacleId: 'obs_a2_ring_road_curve',
  obstacleName: '城西环岛右转弯道',
  curveKind: 'circular_curve',
  vehicle: {
    totalLengthM: 16,
    totalWidthM: 2.55,
    minTurningRadiusM: 12,
  },
  curve: {
    radiusM: 25,
    angleDeg: 90,
    entranceWidthM: 6,
    exitWidthM: 5.5,
  },
  measurementSource: 'curve_measurement_result',
}

describe('validateCircularCurveInput', () => {
  it('valid input passes', () => {
    expect(validateCircularCurveInput(baseInput).valid).toBe(true)
  })

  it('fails for missing routeId', () => {
    expect(
      validateCircularCurveInput({ ...baseInput, routeId: '' }).valid,
    ).toBe(false)
  })

  it('fails for wrong curveKind', () => {
    expect(
      validateCircularCurveInput({
        ...baseInput,
        curveKind:
          'right_angle_curve' as CircularCurveClearanceInput['curveKind'],
      }).valid,
    ).toBe(false)
  })

  it('fails for null input', () => {
    expect(validateCircularCurveInput(null).valid).toBe(false)
  })
})

describe('calculateRequiredCircularCurveWidth', () => {
  it('calculates width with swing amount', () => {
    const w = calculateRequiredCircularCurveWidth(baseInput)
    expect(w).toBeGreaterThan(baseInput.vehicle.totalWidthM)
    const expectedSwing = (16 / 25) * 0.6
    expect(w).toBeCloseTo(2.55 + expectedSwing, 1)
  })

  it('includes safety margin when provided', () => {
    const w1 = calculateRequiredCircularCurveWidth(baseInput)
    const w2 = calculateRequiredCircularCurveWidth({
      ...baseInput,
      safetyMarginM: 0.5,
    })
    expect(w2).toBeCloseTo(w1 + 0.5, 2)
  })
})

describe('evaluateCircularCurveClearance', () => {
  it('returns pass when radius and width sufficient', () => {
    const r = evaluateCircularCurveClearance(baseInput)
    expect(r.status).toBe('pass')
    expect(r.passed).toBe(true)
    expect(r.radiusMarginM).toBeGreaterThan(0)
    expect(r.widthMarginM).toBeGreaterThan(0)
  })

  it('returns pass_with_warning when radius equals min turning radius', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, minTurningRadiusM: 25 },
    })
    expect(r.status).toBe('pass_with_warning')
    expect(r.passed).toBe(true)
  })

  it('returns fail when radius too small', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, radiusM: 10 },
    })
    expect(r.status).toBe('fail')
    expect(r.passed).toBe(false)
    expect(r.checks.find((c) => c.checkId === 'radius_check')?.status).toBe(
      'fail',
    )
  })

  it('returns fail when effective width insufficient', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalWidthM: 3.5, totalLengthM: 20 },
      curve: { ...baseInput.curve, entranceWidthM: 2.5, exitWidthM: 2.5 },
    })
    expect(r.status).toBe('fail')
    expect(r.passed).toBe(false)
  })

  it('returns fail when entrance width insufficient', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalWidthM: 3.5, totalLengthM: 20 },
      curve: { ...baseInput.curve, entranceWidthM: 2, exitWidthM: 8 },
    })
    expect(r.status).toBe('fail')
    const entranceCheck = r.checks.find(
      (c) => c.checkId === 'entrance_width_check',
    )
    expect(entranceCheck?.passed).toBe(false)
  })

  it('returns fail when exit width insufficient', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalWidthM: 3.5, totalLengthM: 20 },
      curve: { ...baseInput.curve, entranceWidthM: 8, exitWidthM: 2 },
    })
    expect(r.status).toBe('fail')
    const exitCheck = r.checks.find((c) => c.checkId === 'exit_width_check')
    expect(exitCheck?.passed).toBe(false)
  })

  it('returns blocked when vehicle totalLengthM missing', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalLengthM: 0 },
    })
    expect(r.status).toBe('blocked')
    expect(r.reasons.some((s) => s.includes('车辆总长'))).toBe(true)
  })

  it('returns blocked when vehicle totalWidthM missing', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalWidthM: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when minTurningRadiusM missing', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, minTurningRadiusM: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when curve radiusM missing', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, radiusM: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when entranceWidthM missing', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, entranceWidthM: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when exitWidthM missing', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, exitWidthM: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('handles NaN without producing NaN in output', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalLengthM: NaN },
    })
    expect(r.status).toBe('blocked')
    expect(isNaN(r.requiredWidthM ?? 0)).toBe(false)
  })

  it('handles Infinity gracefully', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, radiusM: Infinity },
    })
    expect(r.status).toBe('blocked')
  })

  it('every result has summary, reasons, teachingNote, nextAction', () => {
    const r = evaluateCircularCurveClearance(baseInput)
    expect(r.summary).toBeTruthy()
    expect(r.reasons).toBeDefined()
    expect(r.teachingNote).toBeTruthy()
    expect(r.nextAction).toBeTruthy()
  })

  it('uses effectiveWidthM when provided', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      curve: {
        ...baseInput.curve,
        effectiveWidthM: 10,
        entranceWidthM: 4,
        exitWidthM: 4,
      },
    })
    expect(r.status).toBe('pass')
    expect(r.widthMarginM).toBeGreaterThan(0)
  })

  it('falls back to min(entrance, exit) when effectiveWidthM missing', () => {
    const r = evaluateCircularCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, entranceWidthM: 8, exitWidthM: 7 },
    })
    expect(r.status).toBe('pass')
  })
})

describe('formatCircularCurveReason', () => {
  it('returns summary string', () => {
    const r = evaluateCircularCurveClearance(baseInput)
    expect(formatCircularCurveReason(r)).toBe(r.summary)
  })
})
