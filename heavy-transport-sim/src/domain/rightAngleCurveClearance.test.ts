import { describe, it, expect } from 'vitest'
import {
  evaluateRightAngleCurveClearance,
  validateRightAngleCurveInput,
  calculateRequiredExitWidth,
  calculateEntranceWidthMargin,
  calculateExitWidthMargin,
  formatRightAngleCurveReason,
  type RightAngleCurveClearanceInput,
} from './rightAngleCurveClearance'

const baseInput: RightAngleCurveClearanceInput = {
  routeId: 'route_a_urban_right_angle',
  obstacleId: 'obs_a3_right_angle_curve',
  obstacleName: '城西路口直交弯道',
  curveKind: 'right_angle_curve',
  vehicle: {
    totalLengthM: 16,
    totalWidthM: 2.55,
    minTurningRadiusM: 12,
  },
  curve: {
    angleDeg: 90,
    entranceWidthM: 6,
    exitWidthM: 8,
    cornerEffectiveWidthM: 8.5,
  },
  safetyMarginM: 0.3,
  measurementSource: 'curve_measurement_result',
}

describe('validateRightAngleCurveInput', () => {
  it('valid input passes', () => {
    expect(validateRightAngleCurveInput(baseInput).valid).toBe(true)
  })

  it('fails for missing routeId', () => {
    expect(
      validateRightAngleCurveInput({ ...baseInput, routeId: '' }).valid,
    ).toBe(false)
  })

  it('fails for missing obstacleId', () => {
    expect(
      validateRightAngleCurveInput({ ...baseInput, obstacleId: '' }).valid,
    ).toBe(false)
  })

  it('fails for missing obstacleName', () => {
    expect(
      validateRightAngleCurveInput({ ...baseInput, obstacleName: '' }).valid,
    ).toBe(false)
  })

  it('fails for wrong curveKind', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        curveKind:
          'circular_curve' as RightAngleCurveClearanceInput['curveKind'],
      }).valid,
    ).toBe(false)
  })

  it('fails for null input', () => {
    expect(validateRightAngleCurveInput(null).valid).toBe(false)
  })

  it('fails for vehicle totalLengthM <= 0', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        vehicle: { ...baseInput.vehicle, totalLengthM: 0 },
      }).valid,
    ).toBe(false)
  })

  it('fails for vehicle totalWidthM <= 0', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        vehicle: { ...baseInput.vehicle, totalWidthM: -1 },
      }).valid,
    ).toBe(false)
  })

  it('fails for vehicle minTurningRadiusM <= 0', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        vehicle: { ...baseInput.vehicle, minTurningRadiusM: 0 },
      }).valid,
    ).toBe(false)
  })

  it('fails for angleDeg <= 0', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        curve: { ...baseInput.curve, angleDeg: 0 },
      }).valid,
    ).toBe(false)
  })

  it('fails for angleDeg > 180', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        curve: { ...baseInput.curve, angleDeg: 181 },
      }).valid,
    ).toBe(false)
  })

  it('fails for entranceWidthM <= 0', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        curve: { ...baseInput.curve, entranceWidthM: 0 },
      }).valid,
    ).toBe(false)
  })

  it('fails for exitWidthM <= 0', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        curve: { ...baseInput.curve, exitWidthM: -1 },
      }).valid,
    ).toBe(false)
  })

  it('accepts cornerEffectiveWidthM as optional', () => {
    const inputWithoutCorner = {
      angleDeg: baseInput.curve.angleDeg,
      entranceWidthM: baseInput.curve.entranceWidthM,
      exitWidthM: baseInput.curve.exitWidthM,
    }
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        curve: inputWithoutCorner,
      }).valid,
    ).toBe(true)
  })

  it('fails for cornerEffectiveWidthM <= 0 when provided', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        curve: { ...baseInput.curve, cornerEffectiveWidthM: -1 },
      }).valid,
    ).toBe(false)
  })

  it('fails for safetyMarginM < 0', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        safetyMarginM: -0.1,
      }).valid,
    ).toBe(false)
  })

  it('accepts valid measurementSource values', () => {
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        measurementSource: 'teaching_config',
      }).valid,
    ).toBe(true)
    expect(
      validateRightAngleCurveInput({
        ...baseInput,
        measurementSource: 'manual_input',
      }).valid,
    ).toBe(true)
  })
})

describe('calculateRequiredExitWidth', () => {
  it('calculates width with swing amount', () => {
    const w = calculateRequiredExitWidth(baseInput)
    expect(w).toBeGreaterThan(baseInput.vehicle.totalWidthM)
    const expectedSwing = (16 / 12) * 0.8
    expect(w).toBeCloseTo(2.55 + 0.3 + expectedSwing, 1)
  })

  it('includes safety margin when provided', () => {
    const w1 = calculateRequiredExitWidth(baseInput)
    const w2 = calculateRequiredExitWidth({
      ...baseInput,
      safetyMarginM: 0.5,
    })
    expect(w2).toBeCloseTo(w1 + 0.2, 2)
  })

  it('uses default safety margin of 0 when not provided', () => {
    const inputWithoutMargin = { ...baseInput, safetyMarginM: undefined }
    const w = calculateRequiredExitWidth(inputWithoutMargin)
    const expectedSwing = (16 / 12) * 0.8
    expect(w).toBeCloseTo(2.55 + expectedSwing, 1)
  })
})

describe('calculateEntranceWidthMargin', () => {
  it('returns positive margin when entrance is wide enough', () => {
    const margin = calculateEntranceWidthMargin(baseInput)
    expect(margin).toBeGreaterThan(0)
  })

  it('returns negative margin when entrance is too narrow', () => {
    const margin = calculateEntranceWidthMargin({
      ...baseInput,
      curve: { ...baseInput.curve, entranceWidthM: 2 },
    })
    expect(margin).toBeLessThan(0)
  })
})

describe('calculateExitWidthMargin', () => {
  it('returns positive margin when exit is wide enough', () => {
    const margin = calculateExitWidthMargin(baseInput)
    expect(margin).toBeGreaterThan(0)
  })

  it('returns negative margin when exit is too narrow', () => {
    const margin = calculateExitWidthMargin({
      ...baseInput,
      curve: { ...baseInput.curve, exitWidthM: 3 },
    })
    expect(margin).toBeLessThan(0)
  })
})

describe('evaluateRightAngleCurveClearance', () => {
  it('returns pass when exit width and entrance width sufficient', () => {
    const r = evaluateRightAngleCurveClearance(baseInput)
    expect(r.status).toBe('pass')
    expect(r.passed).toBe(true)
    expect(r.exitWidthMarginM).toBeGreaterThan(0)
    expect(r.entranceWidthMarginM).toBeGreaterThan(0)
  })

  it('returns pass_with_warning when exit width equals required width', () => {
    const requiredWidth = calculateRequiredExitWidth(baseInput)
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, exitWidthM: requiredWidth },
    })
    expect(r.status).toBe('pass_with_warning')
    expect(r.passed).toBe(true)
  })

  it('returns fail when exit width insufficient', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, exitWidthM: 3 },
    })
    expect(r.status).toBe('fail')
    expect(r.passed).toBe(false)
    expect(r.checks.find((c) => c.checkId === 'exit_width_check')?.status).toBe(
      'fail',
    )
  })

  it('returns fail when entrance width insufficient', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, entranceWidthM: 2 },
    })
    expect(r.status).toBe('fail')
    expect(r.passed).toBe(false)
    const entranceCheck = r.checks.find(
      (c) => c.checkId === 'entrance_width_check',
    )
    expect(entranceCheck?.passed).toBe(false)
  })

  it('returns pass_with_warning when entrance width equals required width', () => {
    const requiredEntranceWidth =
      baseInput.vehicle.totalWidthM + (baseInput.safetyMarginM ?? 0)
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, entranceWidthM: requiredEntranceWidth },
    })
    const entranceCheck = r.checks.find(
      (c) => c.checkId === 'entrance_width_check',
    )
    expect(entranceCheck?.status).toBe('pass_with_warning')
  })

  it('returns fail when corner effective width insufficient', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, cornerEffectiveWidthM: 3 },
    })
    expect(r.status).toBe('fail')
    expect(r.passed).toBe(false)
    const cornerCheck = r.checks.find((c) => c.checkId === 'corner_width_check')
    expect(cornerCheck?.passed).toBe(false)
  })

  it('returns pass_with_warning when corner effective width equals required width', () => {
    const requiredWidth = calculateRequiredExitWidth(baseInput)
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, cornerEffectiveWidthM: requiredWidth },
    })
    const cornerCheck = r.checks.find((c) => c.checkId === 'corner_width_check')
    expect(cornerCheck?.status).toBe('pass_with_warning')
  })

  it('skips corner check when cornerEffectiveWidthM not provided', () => {
    const curveWithoutCorner = {
      angleDeg: baseInput.curve.angleDeg,
      entranceWidthM: baseInput.curve.entranceWidthM,
      exitWidthM: baseInput.curve.exitWidthM,
    }
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: curveWithoutCorner,
    })
    const cornerCheck = r.checks.find(
      (c) => c.checkId === 'corner_width_check',
    )
    expect(cornerCheck).toBeUndefined()
  })

  it('returns pass when angle is 90 degrees', () => {
    const r = evaluateRightAngleCurveClearance(baseInput)
    const angleCheck = r.checks.find((c) => c.checkId === 'angle_check')
    expect(angleCheck?.status).toBe('pass')
  })

  it('returns pass_with_warning when angle deviates slightly from 90', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, angleDeg: 84 },
    })
    const angleCheck = r.checks.find((c) => c.checkId === 'angle_check')
    expect(angleCheck?.status).toBe('pass_with_warning')
  })

  it('returns fail when angle deviates significantly from 90', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, angleDeg: 75 },
    })
    expect(r.status).toBe('fail')
    const angleCheck = r.checks.find((c) => c.checkId === 'angle_check')
    expect(angleCheck?.status).toBe('fail')
  })

  it('returns blocked when vehicle totalLengthM missing', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalLengthM: 0 },
    })
    expect(r.status).toBe('blocked')
    expect(r.reasons.some((s) => s.includes('车辆总长'))).toBe(true)
  })

  it('returns blocked when vehicle totalWidthM missing', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalWidthM: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when minTurningRadiusM missing', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, minTurningRadiusM: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when angleDeg missing', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, angleDeg: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when entranceWidthM missing', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, entranceWidthM: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked when exitWidthM missing', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, exitWidthM: 0 },
    })
    expect(r.status).toBe('blocked')
  })

  it('handles NaN without producing NaN in output', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalLengthM: NaN },
    })
    expect(r.status).toBe('blocked')
    expect(isNaN(r.requiredExitWidthM ?? 0)).toBe(false)
  })

  it('handles Infinity gracefully', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, exitWidthM: Infinity },
    })
    expect(r.status).toBe('blocked')
  })

  it('every result has summary, reasons, teachingNote, nextAction', () => {
    const r = evaluateRightAngleCurveClearance(baseInput)
    expect(r.summary).toBeTruthy()
    expect(r.reasons).toBeDefined()
    expect(r.teachingNote).toBeTruthy()
    expect(r.nextAction).toBeTruthy()
  })

  it('every result has checks array', () => {
    const r = evaluateRightAngleCurveClearance(baseInput)
    expect(r.checks).toBeDefined()
    expect(Array.isArray(r.checks)).toBe(true)
    expect(r.checks.length).toBeGreaterThan(0)
  })

  it('every check has reason and teachingNote', () => {
    const r = evaluateRightAngleCurveClearance(baseInput)
    for (const check of r.checks) {
      expect(check.reason).toBeTruthy()
      expect(check.teachingNote).toBeTruthy()
    }
  })

  it('does not implement Day67 slope traction rule', () => {
    const r = evaluateRightAngleCurveClearance(baseInput)
    expect(r.ruleId).toBe('right_angle_curve_clearance')
    expect(r.ruleId).not.toBe('slope_traction')
  })

  it('returns blocked for multiple missing params', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalLengthM: 0, totalWidthM: 0 },
    })
    expect(r.status).toBe('blocked')
    expect(r.reasons.some((s) => s.includes('车辆总长'))).toBe(true)
    expect(r.reasons.some((s) => s.includes('车辆总宽'))).toBe(true)
  })
})

describe('formatRightAngleCurveReason', () => {
  it('returns summary string', () => {
    const r = evaluateRightAngleCurveClearance(baseInput)
    expect(formatRightAngleCurveReason(r)).toBe(r.summary)
  })

  it('returns fail summary for fail case', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      curve: { ...baseInput.curve, exitWidthM: 3 },
    })
    const formatted = formatRightAngleCurveReason(r)
    expect(formatted).toContain('不通过')
  })

  it('returns blocked summary for missing params', () => {
    const r = evaluateRightAngleCurveClearance({
      ...baseInput,
      vehicle: { ...baseInput.vehicle, totalWidthM: 0 },
    })
    const formatted = formatRightAngleCurveReason(r)
    expect(formatted).toContain('缺少')
  })
})
