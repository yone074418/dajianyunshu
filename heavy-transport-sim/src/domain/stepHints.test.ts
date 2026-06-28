import { describe, it, expect } from 'vitest'
import {
  STEP_HINTS,
  STEP_IDS,
  STEP_NAMES,
  stepHintsArraySchema,
  getHintsForStep,
  getHintById,
  validateStepHints,
} from './stepHints'

describe('stepHints data', () => {
  it('should have hints for all 6 stages', () => {
    for (const stepId of STEP_IDS) {
      const hints = getHintsForStep(stepId)
      expect(hints.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should have stable step IDs', () => {
    expect(STEP_IDS).toHaveLength(6)
    expect(STEP_IDS[0]).toBe('stage_1_task_intro')
    expect(STEP_IDS[5]).toBe('stage_6_transport')
  })

  it('should have step names for all IDs', () => {
    for (const id of STEP_IDS) {
      expect(STEP_NAMES[id].length).toBeGreaterThan(0)
    }
  })

  it('should have non-empty titles for all hints', () => {
    for (const hint of STEP_HINTS) {
      expect(hint.title.length).toBeGreaterThan(0)
    }
  })

  it('should have non-empty content for all hints', () => {
    for (const hint of STEP_HINTS) {
      expect(hint.content.length).toBeGreaterThan(0)
    }
  })

  it('should have valid levels for all hints', () => {
    for (const hint of STEP_HINTS) {
      expect(['basic', 'detail', 'warning']).toContain(hint.level)
    }
  })

  it('should have unique hint IDs', () => {
    const ids = STEP_HINTS.map((h) => h.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('stepHints validation', () => {
  it('should validate all hints with Zod', () => {
    expect(() => validateStepHints(STEP_HINTS)).not.toThrow()
  })

  it('should reject hint without stepId', () => {
    const bad = [{ ...STEP_HINTS[0], stepId: '' }]
    const result = stepHintsArraySchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject hint without content', () => {
    const bad = [{ ...STEP_HINTS[0], content: '' }]
    const result = stepHintsArraySchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject hint with invalid level', () => {
    const bad = [{ ...STEP_HINTS[0], level: 'invalid' }]
    const result = stepHintsArraySchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject empty array', () => {
    const result = stepHintsArraySchema.safeParse([])
    expect(result.success).toBe(false)
  })
})

describe('stepHints accessors', () => {
  it('should get hints for task intro', () => {
    const hints = getHintsForStep('stage_1_task_intro')
    expect(hints.length).toBeGreaterThanOrEqual(2)
    expect(hints[0].stepId).toBe('stage_1_task_intro')
  })

  it('should sort hints by displayOrder', () => {
    const hints = getHintsForStep('stage_1_task_intro')
    for (let i = 1; i < hints.length; i++) {
      expect(hints[i].displayOrder).toBeGreaterThanOrEqual(
        hints[i - 1].displayOrder,
      )
    }
  })

  it('should get hint by id', () => {
    const hint = getHintById('hint-task-intro-1')
    expect(hint).toBeDefined()
    expect(hint!.title).toBe('了解货物参数')
  })

  it('should return undefined for unknown hint', () => {
    expect(getHintById('nonexistent')).toBeUndefined()
  })
})
