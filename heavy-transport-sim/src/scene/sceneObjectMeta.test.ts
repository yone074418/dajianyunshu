import { describe, it, expect } from 'vitest'
import { SCENE_OBJECTS } from './sceneObjectMeta'

describe('SCENE_OBJECTS', () => {
  it('should have at least 3 objects', () => {
    expect(SCENE_OBJECTS.length).toBeGreaterThanOrEqual(3)
  })

  it('should have unique ids', () => {
    const ids = SCENE_OBJECTS.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each object should have required fields', () => {
    for (const obj of SCENE_OBJECTS) {
      expect(obj.id).toBeTypeOf('string')
      expect(obj.name).toBeTypeOf('string')
      expect(obj.category).toBeTypeOf('string')
      expect(obj.description).toBeTypeOf('string')
      expect(obj.teachingTip).toBeTypeOf('string')
    }
  })

  it('should include cargo category', () => {
    expect(SCENE_OBJECTS.some((o) => o.category === 'cargo')).toBe(true)
  })

  it('should include vehicle category', () => {
    expect(SCENE_OBJECTS.some((o) => o.category === 'vehicle')).toBe(true)
  })

  it('should include obstacle category', () => {
    expect(SCENE_OBJECTS.some((o) => o.category === 'obstacle')).toBe(true)
  })
})
