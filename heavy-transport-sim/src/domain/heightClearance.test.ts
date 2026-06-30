import { describe, it, expect } from 'vitest'
import {
  evaluateHeightClearance,
  validateHeightClearanceInput,
  calculateTotalTransportHeight,
  formatHeightClearanceReason,
  type HeightClearanceInput,
} from './heightClearance'

describe('validateHeightClearanceInput', () => {
  const validInput: HeightClearanceInput = {
    routeId: 'route_a',
    obstacleId: 'obs_a1',
    obstacleName: '铁路跨线桥限高架',
    measuredClearanceHeightM: 4.5,
    totalTransportHeightM: 4.2,
    measurementSource: 'height_measurement_result',
  }

  it('valid input passes validation', () => {
    const v = validateHeightClearanceInput(validInput)
    expect(v.valid).toBe(true)
    expect(v.errors).toEqual([])
  })

  it('fails for missing routeId', () => {
    const v = validateHeightClearanceInput({ ...validInput, routeId: '' })
    expect(v.valid).toBe(false)
    expect(v.errors.length).toBeGreaterThan(0)
  })

  it('fails for missing obstacleId', () => {
    const v = validateHeightClearanceInput({ ...validInput, obstacleId: '' })
    expect(v.valid).toBe(false)
  })

  it('fails for missing obstacleName', () => {
    const v = validateHeightClearanceInput({ ...validInput, obstacleName: '' })
    expect(v.valid).toBe(false)
  })

  it('fails for invalid measurementSource', () => {
    const v = validateHeightClearanceInput({
      ...validInput,
      measurementSource: 'invalid' as HeightClearanceInput['measurementSource'],
    })
    expect(v.valid).toBe(false)
  })

  it('fails for null input', () => {
    const v = validateHeightClearanceInput(null)
    expect(v.valid).toBe(false)
  })
})

describe('calculateTotalTransportHeight', () => {
  it('returns totalTransportHeightM when directly provided', () => {
    const h = calculateTotalTransportHeight({
      routeId: 'r1',
      obstacleId: 'o1',
      obstacleName: 'test',
      totalTransportHeightM: 4.5,
      measurementSource: 'manual_input',
    })
    expect(h).toBe(4.5)
  })

  it('computes from cargo + vehicle deck height', () => {
    const h = calculateTotalTransportHeight({
      routeId: 'r1',
      obstacleId: 'o1',
      obstacleName: 'test',
      cargoHeightM: 4.2,
      vehicleDeckHeightM: 1.5,
      measurementSource: 'computed_from_vehicle_and_cargo',
    })
    expect(h).toBeCloseTo(5.7, 5)
  })

  it('returns null when insufficient data', () => {
    const h = calculateTotalTransportHeight({
      routeId: 'r1',
      obstacleId: 'o1',
      obstacleName: 'test',
      measurementSource: 'manual_input',
    })
    expect(h).toBeNull()
  })

  it('returns null when only cargo height given', () => {
    const h = calculateTotalTransportHeight({
      routeId: 'r1',
      obstacleId: 'o1',
      obstacleName: 'test',
      cargoHeightM: 4.2,
      measurementSource: 'manual_input',
    })
    expect(h).toBeNull()
  })
})

describe('evaluateHeightClearance', () => {
  const baseInput: HeightClearanceInput = {
    routeId: 'route_a_urban_low_bridge',
    obstacleId: 'obs_a1_railway_bridge',
    obstacleName: '铁路跨线桥限高架',
    measurementSource: 'height_measurement_result',
  }

  it('returns pass when transport height below clearance', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 4.5,
      totalTransportHeightM: 4.2,
    })
    expect(r.status).toBe('pass')
    expect(r.passed).toBe(true)
    expect(r.boundaryCase).toBe('below_limit')
    expect(r.differenceM).toBeGreaterThan(0)
    expect(r.reason).toContain('可通过')
  })

  it('returns pass_with_warning when equal to limit', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 4.5,
      totalTransportHeightM: 4.5,
    })
    expect(r.status).toBe('pass_with_warning')
    expect(r.passed).toBe(true)
    expect(r.boundaryCase).toBe('equal_to_limit')
    expect(r.reason).toContain('边界值')
  })

  it('returns fail when transport height over limit', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 4.5,
      totalTransportHeightM: 4.6,
    })
    expect(r.status).toBe('fail')
    expect(r.passed).toBe(false)
    expect(r.boundaryCase).toBe('over_limit')
    expect(r.differenceM).toBeLessThan(0)
    expect(r.reason).toContain('超出')
    expect(r.reason).toContain('不能通过')
  })

  it('returns blocked when clearance height missing', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      totalTransportHeightM: 4.2,
    })
    expect(r.status).toBe('blocked')
    expect(r.passed).toBe(false)
    expect(r.boundaryCase).toBe('missing_parameter')
    expect(r.reason).toContain('缺少限高测量值')
  })

  it('returns blocked when total height missing and cannot compute', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 4.5,
    })
    expect(r.status).toBe('blocked')
    expect(r.passed).toBe(false)
    expect(r.boundaryCase).toBe('missing_parameter')
    expect(r.reason).toContain('缺少运输总高度')
  })

  it('computes total height from cargo + vehicle when not direct', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 6.0,
      cargoHeightM: 4.2,
      vehicleDeckHeightM: 1.5,
    })
    expect(r.status).toBe('pass')
    expect(r.totalTransportHeightM).toBeCloseTo(5.7, 1)
  })

  it('safety margin affects effective clearance', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 4.5,
      totalTransportHeightM: 4.3,
      safetyMarginM: 0.3,
    })
    expect(r.status).toBe('fail')
    expect(r.boundaryCase).toBe('over_limit')
    expect(r.reason).toContain('安全余量')
  })

  it('safety margin 0 does not reduce clearance', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 4.5,
      totalTransportHeightM: 4.3,
      safetyMarginM: 0,
    })
    expect(r.status).toBe('pass')
  })

  it('returns blocked for clearance height <= 0', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 0,
      totalTransportHeightM: 4.2,
    })
    expect(r.status).toBe('blocked')
    expect(r.reason).toContain('无效')
  })

  it('returns blocked for negative clearance height', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: -1,
      totalTransportHeightM: 4.2,
    })
    expect(r.status).toBe('blocked')
  })

  it('returns blocked for total height <= 0', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 4.5,
      totalTransportHeightM: 0,
    })
    expect(r.status).toBe('blocked')
  })

  it('handles NaN without producing NaN in output', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: NaN,
      totalTransportHeightM: 4.2,
    })
    expect(r.status).toBe('blocked')
    expect(isNaN(r.safetyMarginM)).toBe(false)
  })

  it('handles Infinity gracefully', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: Infinity,
      totalTransportHeightM: 4.2,
    })
    expect(r.status).toBe('blocked')
  })

  it('fail result contains difference value', () => {
    const r = evaluateHeightClearance({
      ...baseInput,
      measuredClearanceHeightM: 4.5,
      totalTransportHeightM: 4.7,
    })
    expect(r.differenceM).toBeDefined()
    expect(r.differenceM!).toBeLessThan(0)
  })

  it('every result has reason, teachingNote, nextAction', () => {
    const inputs: HeightClearanceInput[] = [
      { ...baseInput, measuredClearanceHeightM: 5, totalTransportHeightM: 4 },
      {
        ...baseInput,
        measuredClearanceHeightM: 4.5,
        totalTransportHeightM: 4.5,
      },
      { ...baseInput, measuredClearanceHeightM: 4, totalTransportHeightM: 5 },
      { ...baseInput, totalTransportHeightM: 4 },
    ]
    for (const inp of inputs) {
      const r = evaluateHeightClearance(inp)
      expect(r.reason).toBeTruthy()
      expect(r.teachingNote).toBeTruthy()
      expect(r.nextAction).toBeTruthy()
    }
  })
})

describe('formatHeightClearanceReason', () => {
  it('returns the reason string', () => {
    const r = evaluateHeightClearance({
      routeId: 'r1',
      obstacleId: 'o1',
      obstacleName: 'test',
      measuredClearanceHeightM: 4.5,
      totalTransportHeightM: 4.2,
      measurementSource: 'manual_input',
    })
    expect(formatHeightClearanceReason(r)).toBe(r.reason)
  })
})
