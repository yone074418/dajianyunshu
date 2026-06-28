import { describe, it, expect } from 'vitest'
import { SCENE_CAMERA_DEFAULTS } from './cameraDefaults'

describe('SCENE_CAMERA_DEFAULTS', () => {
  it('should have a valid position array', () => {
    expect(SCENE_CAMERA_DEFAULTS.position).toHaveLength(3)
    expect(SCENE_CAMERA_DEFAULTS.position[0]).toBeTypeOf('number')
    expect(SCENE_CAMERA_DEFAULTS.position[1]).toBeTypeOf('number')
    expect(SCENE_CAMERA_DEFAULTS.position[2]).toBeTypeOf('number')
  })

  it('should have a valid target array', () => {
    expect(SCENE_CAMERA_DEFAULTS.target).toHaveLength(3)
  })

  it('should have minDistance > 0', () => {
    expect(SCENE_CAMERA_DEFAULTS.minDistance).toBeGreaterThan(0)
  })

  it('should have maxDistance > minDistance', () => {
    expect(SCENE_CAMERA_DEFAULTS.maxDistance).toBeGreaterThan(
      SCENE_CAMERA_DEFAULTS.minDistance,
    )
  })

  it('should have maxPolarAngle < PI/2 to prevent going underground', () => {
    expect(SCENE_CAMERA_DEFAULTS.maxPolarAngle).toBeLessThan(Math.PI / 2)
  })

  it('should have minPolarAngle > 0', () => {
    expect(SCENE_CAMERA_DEFAULTS.minPolarAngle).toBeGreaterThan(0)
  })

  it('should disable pan by default', () => {
    expect(SCENE_CAMERA_DEFAULTS.enablePan).toBe(false)
  })

  it('should not allow camera to go underground (maxPolarAngle < PI/2)', () => {
    const maxAngle = SCENE_CAMERA_DEFAULTS.maxPolarAngle
    expect(maxAngle).toBeLessThan(Math.PI / 2)
    expect(maxAngle).toBeGreaterThan(0)
  })

  it('should not allow infinite distance (maxDistance is finite)', () => {
    expect(SCENE_CAMERA_DEFAULTS.maxDistance).toBeLessThan(1000)
    expect(Number.isFinite(SCENE_CAMERA_DEFAULTS.maxDistance)).toBe(true)
  })
})
