import { describe, expect, it } from 'vitest'
import {
  transportCaseSchema,
  validateTransportCase,
  UNIQUE_TRANSPORT_CASE,
} from './transportCase'

const validCase = UNIQUE_TRANSPORT_CASE

describe('transport case validation', () => {
  it('accepts the unique transport case', () => {
    expect(() => validateTransportCase(validCase)).not.toThrow()
  })

  it('has a stable case ID', () => {
    expect(validCase.id).toBe('case_heavy_transformer_transport_v1')
  })

  it('has a non-empty case name', () => {
    expect(validCase.name.length).toBeGreaterThan(0)
  })

  it('has a non-empty origin', () => {
    expect(validCase.origin.name.length).toBeGreaterThan(0)
    expect(validCase.origin.type.length).toBeGreaterThan(0)
  })

  it('has a non-empty destination', () => {
    expect(validCase.destination.name.length).toBeGreaterThan(0)
    expect(validCase.destination.type.length).toBeGreaterThan(0)
  })

  it('has valid cargo dimensions', () => {
    expect(validCase.cargo.dimensions.lengthM).toBeGreaterThan(0)
    expect(validCase.cargo.dimensions.widthM).toBeGreaterThan(0)
    expect(validCase.cargo.dimensions.heightM).toBeGreaterThan(0)
  })

  it('has positive cargo weight', () => {
    expect(validCase.cargo.weightT).toBeGreaterThan(0)
  })

  it('has explicit unit', () => {
    expect(validCase.cargo.unit.length).toBeGreaterThan(0)
  })

  it('has at least one objective', () => {
    expect(validCase.objectives.length).toBeGreaterThanOrEqual(1)
  })

  it('has all constraint fields', () => {
    expect(validCase.constraints.height.length).toBeGreaterThan(0)
    expect(validCase.constraints.turning.length).toBeGreaterThan(0)
    expect(validCase.constraints.slope.length).toBeGreaterThan(0)
    expect(validCase.constraints.bridge.length).toBeGreaterThan(0)
    expect(validCase.constraints.axleLoad.length).toBeGreaterThan(0)
    expect(validCase.constraints.lashing.length).toBeGreaterThan(0)
  })

  it('has teaching notes', () => {
    expect(validCase.teachingNotes.length).toBeGreaterThanOrEqual(1)
  })

  it('marks oversize cargo correctly', () => {
    expect(validCase.cargo.isOversizeLength).toBe(true)
    expect(validCase.cargo.isOversizeWidth).toBe(true)
    expect(validCase.cargo.isOversizeHeight).toBe(true)
    expect(validCase.cargo.isOverweight).toBe(true)
  })

  it('rejects case without origin', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { origin: _origin, ...noOrigin } = validCase
    const result = transportCaseSchema.safeParse(noOrigin)
    expect(result.success).toBe(false)
  })

  it('rejects case without destination', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { destination: _dest, ...noDest } = validCase
    const result = transportCaseSchema.safeParse(noDest)
    expect(result.success).toBe(false)
  })

  it('rejects cargo with zero dimensions', () => {
    const bad = {
      ...validCase,
      cargo: {
        ...validCase.cargo,
        dimensions: { lengthM: 0, widthM: 3, heightM: 4 },
      },
    }
    const result = transportCaseSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('rejects cargo with negative weight', () => {
    const bad = { ...validCase, cargo: { ...validCase.cargo, weightT: -1 } }
    const result = transportCaseSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('rejects case with empty objectives', () => {
    const bad = { ...validCase, objectives: [] }
    const result = transportCaseSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('rejects case with invalid status', () => {
    const bad = { ...validCase, status: 'invalid' }
    const result = transportCaseSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })
})
