import { describe, it, expect } from 'vitest'
import {
  getTractors,
  getTractorById,
  getTractorByDriveType,
  validateTractors,
  TRACTORS,
  tractorSchema,
  tractorsSchema,
} from './tractors'

describe('Tractor data', () => {
  it('should return 2 tractors', () => {
    const tractors = getTractors()
    expect(tractors).toHaveLength(2)
  })

  it('should contain 6x6 tractor', () => {
    const t = getTractorById('tractor_6x6_heavy_duty')
    expect(t).toBeDefined()
    expect(t!.driveType).toBe('6x6')
    expect(t!.name).toBe('6x6 重型牵引车')
  })

  it('should contain 8x8 tractor', () => {
    const t = getTractorById('tractor_8x8_heavy_duty')
    expect(t).toBeDefined()
    expect(t!.driveType).toBe('8x8')
    expect(t!.name).toBe('8x8 重型牵引车')
  })

  it('should have stable IDs', () => {
    expect(TRACTORS[0].id).toBe('tractor_6x6_heavy_duty')
    expect(TRACTORS[1].id).toBe('tractor_8x8_heavy_duty')
  })

  it('should have valid drive types', () => {
    for (const t of TRACTORS) {
      expect(['6x6', '8x8']).toContain(t.driveType)
    }
  })

  it('should have different parameters for 6x6 and 8x8', () => {
    const t6 = getTractorById('tractor_6x6_heavy_duty')!
    const t8 = getTractorById('tractor_8x8_heavy_duty')!
    expect(t6.dimensions.lengthM).not.toBe(t8.dimensions.lengthM)
    expect(t6.weights.curbWeightT).not.toBe(t8.weights.curbWeightT)
    expect(t6.power.enginePowerKw).not.toBe(t8.power.enginePowerKw)
  })

  it('should get tractor by drive type', () => {
    expect(getTractorByDriveType('6x6')!.id).toBe('tractor_6x6_heavy_duty')
    expect(getTractorByDriveType('8x8')!.id).toBe('tractor_8x8_heavy_duty')
  })
})

describe('Tractor dimension parameters', () => {
  it('should have complete dimensions for 6x6', () => {
    const d = TRACTORS[0].dimensions
    expect(d.lengthM).toBeGreaterThan(0)
    expect(d.widthM).toBeGreaterThan(0)
    expect(d.heightM).toBeGreaterThan(0)
    expect(d.wheelbaseM).toBeGreaterThan(0)
    expect(d.trackWidthM).toBeGreaterThan(0)
    expect(d.minTurningRadiusM).toBeGreaterThan(0)
  })

  it('should have complete dimensions for 8x8', () => {
    const d = TRACTORS[1].dimensions
    expect(d.lengthM).toBeGreaterThan(0)
    expect(d.widthM).toBeGreaterThan(0)
    expect(d.heightM).toBeGreaterThan(0)
    expect(d.wheelbaseM).toBeGreaterThan(0)
    expect(d.trackWidthM).toBeGreaterThan(0)
    expect(d.minTurningRadiusM).toBeGreaterThan(0)
  })

  it('8x8 should be larger than 6x6 in most dimensions', () => {
    const d6 = TRACTORS[0].dimensions
    const d8 = TRACTORS[1].dimensions
    expect(d8.lengthM).toBeGreaterThan(d6.lengthM)
    expect(d8.wheelbaseM).toBeGreaterThan(d6.wheelbaseM)
    expect(d8.minTurningRadiusM).toBeGreaterThan(d6.minTurningRadiusM)
  })
})

describe('Tractor weight parameters', () => {
  it('should have complete weights for 6x6', () => {
    const w = TRACTORS[0].weights
    expect(w.curbWeightT).toBeGreaterThan(0)
    expect(w.grossWeightT).toBeGreaterThan(0)
    expect(w.maxTractionMassT).toBeGreaterThan(0)
    expect(w.fifthWheelLoadT).toBeGreaterThan(0)
    expect(w.axleLoadDescription.length).toBeGreaterThan(0)
  })

  it('should have complete weights for 8x8', () => {
    const w = TRACTORS[1].weights
    expect(w.curbWeightT).toBeGreaterThan(0)
    expect(w.grossWeightT).toBeGreaterThan(0)
    expect(w.maxTractionMassT).toBeGreaterThan(0)
    expect(w.fifthWheelLoadT).toBeGreaterThan(0)
    expect(w.axleLoadDescription.length).toBeGreaterThan(0)
  })

  it('8x8 should be heavier and have higher traction capacity', () => {
    const w6 = TRACTORS[0].weights
    const w8 = TRACTORS[1].weights
    expect(w8.curbWeightT).toBeGreaterThan(w6.curbWeightT)
    expect(w8.maxTractionMassT).toBeGreaterThan(w6.maxTractionMassT)
  })
})

describe('Tractor power parameters', () => {
  it('should have complete power for 6x6', () => {
    const p = TRACTORS[0].power
    expect(p.enginePowerKw).toBeGreaterThan(0)
    expect(p.maxTorqueNm).toBeGreaterThan(0)
    expect(p.driveType).toBe('6x6')
    expect(p.lowSpeedTractionDescription.length).toBeGreaterThan(0)
    expect(p.gradeabilityDescription.length).toBeGreaterThan(0)
    expect(p.brakingAssistDescription.length).toBeGreaterThan(0)
  })

  it('should have complete power for 8x8', () => {
    const p = TRACTORS[1].power
    expect(p.enginePowerKw).toBeGreaterThan(0)
    expect(p.maxTorqueNm).toBeGreaterThan(0)
    expect(p.driveType).toBe('8x8')
    expect(p.lowSpeedTractionDescription.length).toBeGreaterThan(0)
    expect(p.gradeabilityDescription.length).toBeGreaterThan(0)
    expect(p.brakingAssistDescription.length).toBeGreaterThan(0)
  })

  it('8x8 should be more powerful than 6x6', () => {
    const p6 = TRACTORS[0].power
    const p8 = TRACTORS[1].power
    expect(p8.enginePowerKw).toBeGreaterThan(p6.enginePowerKw)
    expect(p8.maxTorqueNm).toBeGreaterThan(p6.maxTorqueNm)
  })
})

describe('Tractor metadata', () => {
  it('should have advantages (at least 2)', () => {
    for (const t of TRACTORS) {
      expect(t.advantages.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('should have disadvantages (at least 2)', () => {
    for (const t of TRACTORS) {
      expect(t.disadvantages.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('should have teaching tips', () => {
    for (const t of TRACTORS) {
      expect(t.teachingTips.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should have applicable scenarios', () => {
    for (const t of TRACTORS) {
      expect(t.applicableScenarios.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should reference compatible combination types', () => {
    for (const t of TRACTORS) {
      expect(t.compatibleCombinationTypes.length).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('Tractor Zod validation', () => {
  it('should validate all tractors', () => {
    const result = validateTractors(TRACTORS)
    expect(result).toHaveLength(2)
  })

  it('should fail when 6x6 is missing', () => {
    const only8 = TRACTORS.filter((t) => t.driveType === '8x8')
    expect(() => tractorsSchema.parse(only8)).toThrow()
  })

  it('should fail when 8x8 is missing', () => {
    const only6 = TRACTORS.filter((t) => t.driveType === '6x6')
    expect(() => tractorsSchema.parse(only6)).toThrow()
  })

  it('should fail when dimension is 0', () => {
    const bad = structuredClone(TRACTORS)
    bad[0].dimensions.lengthM = 0
    expect(() => tractorsSchema.parse(bad)).toThrow()
  })

  it('should fail when dimension is negative', () => {
    const bad = structuredClone(TRACTORS)
    bad[0].dimensions.widthM = -1
    expect(() => tractorsSchema.parse(bad)).toThrow()
  })

  it('should fail when weight is 0', () => {
    const bad = structuredClone(TRACTORS)
    bad[1].weights.curbWeightT = 0
    expect(() => tractorsSchema.parse(bad)).toThrow()
  })

  it('should fail when weight is negative', () => {
    const bad = structuredClone(TRACTORS)
    bad[1].weights.grossWeightT = -5
    expect(() => tractorsSchema.parse(bad)).toThrow()
  })

  it('should fail when power is 0', () => {
    const bad = structuredClone(TRACTORS)
    bad[0].power.enginePowerKw = 0
    expect(() => tractorsSchema.parse(bad)).toThrow()
  })

  it('should fail when power is negative', () => {
    const bad = structuredClone(TRACTORS)
    bad[1].power.maxTorqueNm = -100
    expect(() => tractorsSchema.parse(bad)).toThrow()
  })

  it('should fail when driveType is invalid', () => {
    const bad = structuredClone(TRACTORS)
    bad[0].driveType = '4x4' as unknown as '6x6'
    expect(() => tractorsSchema.parse(bad)).toThrow()
  })

  it('should validate individual tractor schema', () => {
    for (const t of TRACTORS) {
      expect(tractorSchema.parse(t)).toEqual(t)
    }
  })
})
