import { describe, it, expect } from 'vitest'
import { FIRST_PERSON_CONFIG } from './firstPersonConfig'

describe('FIRST_PERSON_CONFIG', () => {
  it('should have a valid defaultPosition', () => {
    expect(FIRST_PERSON_CONFIG.defaultPosition).toHaveLength(3)
    expect(FIRST_PERSON_CONFIG.defaultPosition[0]).toBeTypeOf('number')
    expect(FIRST_PERSON_CONFIG.defaultPosition[1]).toBeTypeOf('number')
    expect(FIRST_PERSON_CONFIG.defaultPosition[2]).toBeTypeOf('number')
  })

  it('should have defaultPosition Y >= minHeight', () => {
    expect(FIRST_PERSON_CONFIG.defaultPosition[1]).toBeGreaterThanOrEqual(
      FIRST_PERSON_CONFIG.minHeight,
    )
  })

  it('should have minHeight > 0', () => {
    expect(FIRST_PERSON_CONFIG.minHeight).toBeGreaterThan(0)
  })

  it('should have moveSpeed > 0', () => {
    expect(FIRST_PERSON_CONFIG.moveSpeed).toBeGreaterThan(0)
  })

  it('should have maxDistanceFromOrigin > 0', () => {
    expect(FIRST_PERSON_CONFIG.maxDistanceFromOrigin).toBeGreaterThan(0)
  })

  it('should have boundary min < max for X', () => {
    expect(FIRST_PERSON_CONFIG.boundary.minX).toBeLessThan(
      FIRST_PERSON_CONFIG.boundary.maxX,
    )
  })

  it('should have boundary min < max for Z', () => {
    expect(FIRST_PERSON_CONFIG.boundary.minZ).toBeLessThan(
      FIRST_PERSON_CONFIG.boundary.maxZ,
    )
  })

  it('should have symmetric boundaries', () => {
    expect(FIRST_PERSON_CONFIG.boundary.minX).toBe(
      -FIRST_PERSON_CONFIG.boundary.maxX,
    )
    expect(FIRST_PERSON_CONFIG.boundary.minZ).toBe(
      -FIRST_PERSON_CONFIG.boundary.maxZ,
    )
  })
})
