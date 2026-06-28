import { describe, it, expect } from 'vitest'
import { clampFirstPersonPosition } from './firstPersonBoundary'
import { FIRST_PERSON_CONFIG } from './firstPersonConfig'

describe('clampFirstPersonPosition', () => {
  it('should not modify position within bounds', () => {
    const pos: [number, number, number] = [0, 1.7, 0]
    expect(clampFirstPersonPosition(pos)).toEqual([0, 1.7, 0])
  })

  it('should clamp X below minX', () => {
    const pos: [number, number, number] = [-30, 1.7, 0]
    const result = clampFirstPersonPosition(pos)
    expect(result[0]).toBe(FIRST_PERSON_CONFIG.boundary.minX)
  })

  it('should clamp X above maxX', () => {
    const pos: [number, number, number] = [30, 1.7, 0]
    const result = clampFirstPersonPosition(pos)
    expect(result[0]).toBe(FIRST_PERSON_CONFIG.boundary.maxX)
  })

  it('should clamp Z below minZ', () => {
    const pos: [number, number, number] = [0, 1.7, -30]
    const result = clampFirstPersonPosition(pos)
    expect(result[2]).toBe(FIRST_PERSON_CONFIG.boundary.minZ)
  })

  it('should clamp Z above maxZ', () => {
    const pos: [number, number, number] = [0, 1.7, 30]
    const result = clampFirstPersonPosition(pos)
    expect(result[2]).toBe(FIRST_PERSON_CONFIG.boundary.maxZ)
  })

  it('should clamp Y below minHeight', () => {
    const pos: [number, number, number] = [0, 0.5, 0]
    const result = clampFirstPersonPosition(pos)
    expect(result[1]).toBe(FIRST_PERSON_CONFIG.minHeight)
  })

  it('should not clamp Y above minHeight', () => {
    const pos: [number, number, number] = [0, 5, 0]
    const result = clampFirstPersonPosition(pos)
    expect(result[1]).toBe(5)
  })

  it('should clamp all axes simultaneously', () => {
    const pos: [number, number, number] = [-50, 0.1, 50]
    const result = clampFirstPersonPosition(pos)
    expect(result[0]).toBe(FIRST_PERSON_CONFIG.boundary.minX)
    expect(result[1]).toBe(FIRST_PERSON_CONFIG.minHeight)
    expect(result[2]).toBe(FIRST_PERSON_CONFIG.boundary.maxZ)
  })

  it('should prevent going underground', () => {
    const pos: [number, number, number] = [0, -5, 0]
    const result = clampFirstPersonPosition(pos)
    expect(result[1]).toBeGreaterThanOrEqual(FIRST_PERSON_CONFIG.minHeight)
  })

  it('should prevent going infinitely far', () => {
    const pos: [number, number, number] = [100, 1.7, 100]
    const result = clampFirstPersonPosition(pos)
    expect(result[0]).toBeLessThanOrEqual(FIRST_PERSON_CONFIG.boundary.maxX)
    expect(result[0]).toBeGreaterThanOrEqual(FIRST_PERSON_CONFIG.boundary.minX)
    expect(result[2]).toBeLessThanOrEqual(FIRST_PERSON_CONFIG.boundary.maxZ)
    expect(result[2]).toBeGreaterThanOrEqual(FIRST_PERSON_CONFIG.boundary.minZ)
  })
})
