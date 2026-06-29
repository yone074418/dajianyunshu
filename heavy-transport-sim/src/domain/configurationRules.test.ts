import { describe, it, expect } from 'vitest'
import {
  evaluateSimpleConfiguration,
  simpleConfigurationInputSchema,
  getConfigurationRules,
  type SimpleConfigurationInput,
} from './configurationRules'

function makeInput(
  overrides: Partial<SimpleConfigurationInput> = {},
): SimpleConfigurationInput {
  return {
    caseId: 'case_heavy_transformer_transport_v1',
    cargo: {
      lengthM: 8.8,
      widthM: 3.4,
      heightM: 4.2,
      weightT: 168,
    },
    vehicleCombinationId: 'semi_trailer_combination',
    vehicleCombinationType: 'semi_trailer',
    tractorId: 'tractor_8x8_heavy_duty',
    trailerSelection: {
      axleLines: 10,
      columns: 2,
    },
    ...overrides,
  }
}

describe('Configuration rule engine import', () => {
  it('evaluateSimpleConfiguration can be imported and called', () => {
    const result = evaluateSimpleConfiguration(makeInput())
    expect(result).toBeDefined()
    expect(result.status).toBeDefined()
    expect(result.checks).toBeDefined()
  })

  it('getConfigurationRules returns all expected rules', () => {
    const rules = getConfigurationRules()
    expect(rules.length).toBeGreaterThanOrEqual(5)
    const ids = rules.map((r) => r.id)
    expect(ids).toContain('CFG-COMPLETENESS')
    expect(ids).toContain('CFG-WEIGHT')
    expect(ids).toContain('CFG-DIMENSION')
    expect(ids).toContain('CFG-TRACTOR-POWER')
    expect(ids).toContain('CFG-AXLE-COLUMN')
  })
})

describe('Input schema validation', () => {
  it('valid input passes schema validation', () => {
    const result = simpleConfigurationInputSchema.safeParse(makeInput())
    expect(result.success).toBe(true)
  })

  it('empty caseId fails validation', () => {
    const result = simpleConfigurationInputSchema.safeParse(
      makeInput({ caseId: '' }),
    )
    expect(result.success).toBe(false)
  })

  it('zero weight fails validation', () => {
    const result = simpleConfigurationInputSchema.safeParse(
      makeInput({
        cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 0 },
      }),
    )
    expect(result.success).toBe(false)
  })

  it('negative axleLines fails validation', () => {
    const result = simpleConfigurationInputSchema.safeParse(
      makeInput({ trailerSelection: { axleLines: -1, columns: 2 } }),
    )
    expect(result.success).toBe(false)
  })

  it('non-integer columns fails validation', () => {
    const result = simpleConfigurationInputSchema.safeParse(
      makeInput({ trailerSelection: { axleLines: 6, columns: 1.5 } }),
    )
    expect(result.success).toBe(false)
  })
})

describe('Passing configuration', () => {
  it('valid SPMT 16x3 configuration returns passed', () => {
    const input = makeInput({
      cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 100 },
      vehicleCombinationId: 'self_propelled_modular_transporter',
      vehicleCombinationType: 'self_propelled_axle',
      tractorId: 'tractor_8x8_heavy_duty',
      trailerSelection: { axleLines: 16, columns: 3 },
    })
    const result = evaluateSimpleConfiguration(input)
    expect(result.status).toBe('passed')
    expect(result.passed).toBe(true)
    expect(result.summary.length).toBeGreaterThan(0)
    expect(result.nextAction.length).toBeGreaterThan(0)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('semi-trailer 10x2 with 100t cargo returns passed', () => {
    const input = makeInput({
      cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 100 },
      vehicleCombinationId: 'semi_trailer_combination',
      vehicleCombinationType: 'semi_trailer',
      tractorId: 'tractor_8x8_heavy_duty',
      trailerSelection: { axleLines: 10, columns: 2 },
    })
    const result = evaluateSimpleConfiguration(input)
    expect(result.status).toBe('passed')
    expect(result.passed).toBe(true)
  })

  it('full-trailer 4x1 with 30t cargo returns passed', () => {
    const input = makeInput({
      cargo: { lengthM: 6, widthM: 2.5, heightM: 3, weightT: 30 },
      vehicleCombinationId: 'full_trailer_combination',
      vehicleCombinationType: 'full_trailer',
      tractorId: 'tractor_6x6_heavy_duty',
      trailerSelection: { axleLines: 4, columns: 1 },
    })
    const result = evaluateSimpleConfiguration(input)
    expect(result.status).toBe('passed')
  })
})

describe('Cargo weight rule', () => {
  it('overweight cargo returns failed', () => {
    const input = makeInput({
      cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 200 },
      vehicleCombinationId: 'semi_trailer_combination',
      vehicleCombinationType: 'semi_trailer',
      tractorId: 'tractor_8x8_heavy_duty',
      trailerSelection: { axleLines: 6, columns: 2 },
    })
    const result = evaluateSimpleConfiguration(input)
    expect(result.status).toBe('failed')
    const weightCheck = result.checks.find((c) => c.ruleId === 'CFG-WEIGHT')
    expect(weightCheck).toBeDefined()
    expect(weightCheck!.status).toBe('failed')
    expect(weightCheck!.reason).toContain('200t')
    expect(weightCheck!.reason).toContain('超')
  })

  it('cargo within weight limit returns passed', () => {
    const input = makeInput({
      cargo: { lengthM: 6, widthM: 3, heightM: 3.5, weightT: 50 },
      trailerSelection: { axleLines: 8, columns: 2 },
    })
    const result = evaluateSimpleConfiguration(input)
    const weightCheck = result.checks.find((c) => c.ruleId === 'CFG-WEIGHT')
    expect(weightCheck!.status).toBe('passed')
  })
})

describe('Cargo dimension rule', () => {
  it('oversized cargo returns failed', () => {
    const input = makeInput({
      cargo: { lengthM: 20, widthM: 5, heightM: 6, weightT: 100 },
      vehicleCombinationId: 'semi_trailer_combination',
      vehicleCombinationType: 'semi_trailer',
      tractorId: 'tractor_8x8_heavy_duty',
      trailerSelection: { axleLines: 10, columns: 2 },
    })
    const result = evaluateSimpleConfiguration(input)
    const dimCheck = result.checks.find((c) => c.ruleId === 'CFG-DIMENSION')
    expect(dimCheck).toBeDefined()
    expect(dimCheck!.status).toBe('failed')
    expect(dimCheck!.reason.length).toBeGreaterThan(0)
  })

  it('cargo within dimension limits returns passed', () => {
    const input = makeInput({
      cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 100 },
      vehicleCombinationId: 'semi_trailer_combination',
      vehicleCombinationType: 'semi_trailer',
      tractorId: 'tractor_8x8_heavy_duty',
      trailerSelection: { axleLines: 10, columns: 2 },
    })
    const result = evaluateSimpleConfiguration(input)
    const dimCheck = result.checks.find((c) => c.ruleId === 'CFG-DIMENSION')
    expect(dimCheck!.status).toBe('passed')
  })
})

describe('Tractor power rule', () => {
  it('6x6 tractor with heavy cargo returns failed', () => {
    const input = makeInput({
      cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 168 },
      vehicleCombinationId: 'self_propelled_modular_transporter',
      vehicleCombinationType: 'self_propelled_axle',
      tractorId: 'tractor_6x6_heavy_duty',
      trailerSelection: { axleLines: 16, columns: 3 },
    })
    const result = evaluateSimpleConfiguration(input)
    const tractorCheck = result.checks.find(
      (c) => c.ruleId === 'CFG-TRACTOR-POWER',
    )
    expect(tractorCheck).toBeDefined()
    expect(tractorCheck!.status).toBe('failed')
    expect(tractorCheck!.reason).toContain('168t')
    expect(tractorCheck!.reason).toContain('80t')
  })

  it('8x8 tractor with 100t cargo returns passed', () => {
    const input = makeInput({
      cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 100 },
      tractorId: 'tractor_8x8_heavy_duty',
      trailerSelection: { axleLines: 10, columns: 2 },
    })
    const result = evaluateSimpleConfiguration(input)
    const tractorCheck = result.checks.find(
      (c) => c.ruleId === 'CFG-TRACTOR-POWER',
    )
    expect(tractorCheck!.status).toBe('passed')
  })

  it('unknown tractor returns failed', () => {
    const input = makeInput({ tractorId: 'tractor_unknown' })
    const result = evaluateSimpleConfiguration(input)
    const tractorCheck = result.checks.find(
      (c) => c.ruleId === 'CFG-TRACTOR-POWER',
    )
    expect(tractorCheck!.status).toBe('failed')
    expect(tractorCheck!.reason).toContain('未找到')
  })
})

describe('Trailer axle-column legality rule', () => {
  it('illegal 4x2 combination returns failed', () => {
    const input = makeInput({
      cargo: { lengthM: 6, widthM: 3, heightM: 3, weightT: 30 },
      vehicleCombinationId: 'full_trailer_combination',
      vehicleCombinationType: 'full_trailer',
      tractorId: 'tractor_6x6_heavy_duty',
      trailerSelection: { axleLines: 4, columns: 2 },
    })
    const result = evaluateSimpleConfiguration(input)
    const axleCheck = result.checks.find((c) => c.ruleId === 'CFG-AXLE-COLUMN')
    expect(axleCheck).toBeDefined()
    expect(axleCheck!.status).toBe('failed')
    expect(axleCheck!.reason.length).toBeGreaterThan(0)
  })

  it('illegal 10x1 combination returns failed', () => {
    const input = makeInput({
      cargo: { lengthM: 8, widthM: 3, heightM: 4, weightT: 80 },
      vehicleCombinationId: 'semi_trailer_combination',
      vehicleCombinationType: 'semi_trailer',
      tractorId: 'tractor_8x8_heavy_duty',
      trailerSelection: { axleLines: 10, columns: 1 },
    })
    const result = evaluateSimpleConfiguration(input)
    const axleCheck = result.checks.find((c) => c.ruleId === 'CFG-AXLE-COLUMN')
    expect(axleCheck!.status).toBe('failed')
  })

  it('legal 6x2 combination returns passed', () => {
    const input = makeInput({
      cargo: { lengthM: 8, widthM: 3, heightM: 3.5, weightT: 80 },
      trailerSelection: { axleLines: 6, columns: 2 },
    })
    const result = evaluateSimpleConfiguration(input)
    const axleCheck = result.checks.find((c) => c.ruleId === 'CFG-AXLE-COLUMN')
    expect(axleCheck!.status).toBe('passed')
  })
})

describe('Missing parameters', () => {
  it('empty combinationId returns blocked or failed', () => {
    const input = makeInput({ vehicleCombinationId: '' })
    const result = evaluateSimpleConfiguration(input)
    expect(result.status === 'blocked' || result.status === 'failed').toBe(true)
    expect(result.passed).toBe(false)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('empty tractorId returns blocked or failed', () => {
    const input = makeInput({ tractorId: '' })
    const result = evaluateSimpleConfiguration(input)
    expect(result.status === 'blocked' || result.status === 'failed').toBe(true)
    expect(result.passed).toBe(false)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('zero cargo weight returns blocked', () => {
    const input = {
      caseId: 'case_1',
      cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 0 },
      vehicleCombinationId: 'semi_trailer_combination',
      vehicleCombinationType: 'semi_trailer',
      tractorId: 'tractor_8x8_heavy_duty',
      trailerSelection: { axleLines: 10, columns: 2 },
    }
    const result = evaluateSimpleConfiguration(input)
    expect(result.status).toBe('blocked')
    expect(result.passed).toBe(false)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('null input returns blocked', () => {
    const result = evaluateSimpleConfiguration(null)
    expect(result.status).toBe('blocked')
    expect(result.passed).toBe(false)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('undefined input returns blocked', () => {
    const result = evaluateSimpleConfiguration(undefined)
    expect(result.status).toBe('blocked')
    expect(result.passed).toBe(false)
  })

  it('completely empty object returns blocked', () => {
    const result = evaluateSimpleConfiguration({})
    expect(result.status).toBe('blocked')
    expect(result.passed).toBe(false)
  })
})

describe('Check result structure', () => {
  it('every check has ruleId, status, reason, teachingNote', () => {
    const result = evaluateSimpleConfiguration(makeInput())
    for (const check of result.checks) {
      expect(check.ruleId.length).toBeGreaterThan(0)
      expect(['passed', 'failed', 'blocked']).toContain(check.status)
      expect(check.reason.length).toBeGreaterThan(0)
      expect(check.teachingNote.length).toBeGreaterThan(0)
      expect(['info', 'warning', 'error']).toContain(check.severity)
    }
  })

  it('passed result has summary and nextAction', () => {
    const input = makeInput({
      cargo: { lengthM: 6, widthM: 2.5, heightM: 3, weightT: 30 },
      vehicleCombinationId: 'full_trailer_combination',
      vehicleCombinationType: 'full_trailer',
      tractorId: 'tractor_6x6_heavy_duty',
      trailerSelection: { axleLines: 4, columns: 1 },
    })
    const result = evaluateSimpleConfiguration(input)
    expect(result.status).toBe('passed')
    expect(result.summary.length).toBeGreaterThan(0)
    expect(result.nextAction.length).toBeGreaterThan(0)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('failed result includes modification suggestions in nextAction', () => {
    const input = makeInput({
      cargo: { lengthM: 8.8, widthM: 3.4, heightM: 4.2, weightT: 200 },
      vehicleCombinationId: 'semi_trailer_combination',
      vehicleCombinationType: 'semi_trailer',
      tractorId: 'tractor_6x6_heavy_duty',
      trailerSelection: { axleLines: 4, columns: 1 },
    })
    const result = evaluateSimpleConfiguration(input)
    expect(result.status).toBe('failed')
    expect(result.nextAction.length).toBeGreaterThan(0)
  })

  it('Day53 trailer validation is reused or consistent', () => {
    const illegalInput = makeInput({
      cargo: { lengthM: 6, widthM: 3, heightM: 3, weightT: 30 },
      vehicleCombinationId: 'full_trailer_combination',
      vehicleCombinationType: 'full_trailer',
      tractorId: 'tractor_6x6_heavy_duty',
      trailerSelection: { axleLines: 4, columns: 2 },
    })
    const result = evaluateSimpleConfiguration(illegalInput)
    const axleCheck = result.checks.find((c) => c.ruleId === 'CFG-AXLE-COLUMN')
    expect(axleCheck!.status).toBe('failed')
    expect(axleCheck!.reason).toContain('4轴线')
    expect(axleCheck!.reason).toContain('2纵列')
  })
})
