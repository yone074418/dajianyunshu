import { describe, it, expect } from 'vitest'
import {
  VEHICLE_COMBINATIONS,
  VEHICLE_COMBINATION_TYPES,
  vehicleCombinationsSchema,
  validateVehicleCombinations,
  getVehicleCombinations,
  getVehicleCombinationById,
} from './vehicleCombinations'

describe('vehicle combinations data', () => {
  it('should have exactly 3 combinations', () => {
    expect(VEHICLE_COMBINATIONS).toHaveLength(3)
  })

  it('should have all required combination types', () => {
    const types = VEHICLE_COMBINATIONS.map((c) => c.type)
    expect(types).toEqual([...VEHICLE_COMBINATION_TYPES])
  })

  it('should have stable order', () => {
    expect(VEHICLE_COMBINATIONS[0].type).toBe('full_trailer')
    expect(VEHICLE_COMBINATIONS[1].type).toBe('semi_trailer')
    expect(VEHICLE_COMBINATIONS[2].type).toBe('self_propelled_axle')
  })

  it('should have unique IDs', () => {
    const ids = VEHICLE_COMBINATIONS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should have non-empty names', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.name.length).toBeGreaterThan(0)
    }
  })

  it('should have non-empty descriptions', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.description.length).toBeGreaterThan(0)
    }
  })

  it('should have applicable scenarios', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.applicableScenarios.length).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('vehicle combination parameters', () => {
  it('should have valid weight ranges', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.parameters.cargoWeightRangeT.min).toBeGreaterThan(0)
      expect(c.parameters.cargoWeightRangeT.max).toBeGreaterThan(
        c.parameters.cargoWeightRangeT.min,
      )
    }
  })

  it('should have valid length ranges', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.parameters.cargoLengthRangeM.min).toBeGreaterThan(0)
      expect(c.parameters.cargoLengthRangeM.max).toBeGreaterThan(
        c.parameters.cargoLengthRangeM.min,
      )
    }
  })

  it('should have valid width ranges', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.parameters.cargoWidthRangeM.min).toBeGreaterThan(0)
      expect(c.parameters.cargoWidthRangeM.max).toBeGreaterThan(
        c.parameters.cargoWidthRangeM.min,
      )
    }
  })

  it('should have valid height ranges', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.parameters.cargoHeightRangeM.min).toBeGreaterThan(0)
      expect(c.parameters.cargoHeightRangeM.max).toBeGreaterThan(
        c.parameters.cargoHeightRangeM.min,
      )
    }
  })

  it('should have non-empty parameter descriptions', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.parameters.loadCapacityDescription.length).toBeGreaterThan(0)
      expect(c.parameters.turningDescription.length).toBeGreaterThan(0)
      expect(c.parameters.stabilityDescription.length).toBeGreaterThan(0)
    }
  })

  it('should have valid complexity levels', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(['low', 'medium', 'high']).toContain(
        c.parameters.operationComplexity,
      )
    }
  })

  it('should have valid route adaptability levels', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(['low', 'medium', 'high']).toContain(
        c.parameters.routeAdaptability,
      )
    }
  })

  it('should have valid tractor dependency levels', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(['low', 'medium', 'high']).toContain(
        c.parameters.tractorDependency,
      )
    }
  })
})

describe('vehicle combination advantages and disadvantages', () => {
  it('should have at least 3 advantages per combination', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.advantages.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('should have at least 3 disadvantages per combination', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.disadvantages.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('should have unique advantages per combination', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(new Set(c.advantages).size).toBe(c.advantages.length)
    }
  })

  it('should have unique disadvantages per combination', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(new Set(c.disadvantages).size).toBe(c.disadvantages.length)
    }
  })
})

describe('vehicle combination demo config', () => {
  it('should have demo config for all combinations', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.demoConfig).toBeDefined()
    }
  })

  it('should have non-empty demoId', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.demoConfig.demoId.length).toBeGreaterThan(0)
    }
  })

  it('should have camera preset', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.demoConfig.cameraPreset.position).toHaveLength(3)
      expect(c.demoConfig.cameraPreset.target).toHaveLength(3)
    }
  })

  it('should have component layout', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.demoConfig.componentLayout.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should have animation steps', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.demoConfig.animationSteps.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should have key teaching points', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      expect(c.demoConfig.keyTeachingPoints.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should have valid animation step durations', () => {
    for (const c of VEHICLE_COMBINATIONS) {
      for (const step of c.demoConfig.animationSteps) {
        expect(step.durationMs).toBeGreaterThan(0)
      }
    }
  })
})

describe('vehicle combinations validation', () => {
  it('should validate all combinations with Zod', () => {
    expect(() =>
      validateVehicleCombinations(VEHICLE_COMBINATIONS),
    ).not.toThrow()
  })

  it('should reject array missing full trailer', () => {
    const bad = VEHICLE_COMBINATIONS.filter((c) => c.type !== 'full_trailer')
    const result = vehicleCombinationsSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject array missing semi trailer', () => {
    const bad = VEHICLE_COMBINATIONS.filter((c) => c.type !== 'semi_trailer')
    const result = vehicleCombinationsSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject array missing self propelled axle', () => {
    const bad = VEHICLE_COMBINATIONS.filter(
      (c) => c.type !== 'self_propelled_axle',
    )
    const result = vehicleCombinationsSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject combination with empty advantages', () => {
    const bad = [{ ...VEHICLE_COMBINATIONS[0], advantages: [] }]
    const result = vehicleCombinationsSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject combination with empty demo config layout', () => {
    const bad = [
      {
        ...VEHICLE_COMBINATIONS[0],
        demoConfig: {
          ...VEHICLE_COMBINATIONS[0].demoConfig,
          componentLayout: [],
        },
      },
    ]
    const result = vehicleCombinationsSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject empty array', () => {
    const result = vehicleCombinationsSchema.safeParse([])
    expect(result.success).toBe(false)
  })
})

describe('vehicle combinations accessors', () => {
  it('should get all combinations', () => {
    expect(getVehicleCombinations()).toHaveLength(3)
  })

  it('should get combination by id', () => {
    const c = getVehicleCombinationById('full_trailer_combination')
    expect(c).toBeDefined()
    expect(c!.name).toBe('全挂车组合')
  })

  it('should return undefined for unknown id', () => {
    expect(getVehicleCombinationById('nonexistent')).toBeUndefined()
  })
})
