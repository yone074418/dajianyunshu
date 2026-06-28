import { describe, it, expect } from 'vitest'
import { SCENE_PHYSICS_CONFIG } from './physicsConfig'

describe('SCENE_PHYSICS_CONFIG', () => {
  it('should have gravity pointing downward', () => {
    expect(SCENE_PHYSICS_CONFIG.gravity[0]).toBe(0)
    expect(SCENE_PHYSICS_CONFIG.gravity[1]).toBeLessThan(0)
    expect(SCENE_PHYSICS_CONFIG.gravity[2]).toBe(0)
  })

  it('should use variable timeStep', () => {
    expect(SCENE_PHYSICS_CONFIG.timeStep).toBe('vary')
  })

  it('should have debug disabled by default', () => {
    expect(SCENE_PHYSICS_CONFIG.debug).toBe(false)
  })
})
