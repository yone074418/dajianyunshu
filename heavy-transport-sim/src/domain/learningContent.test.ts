import { describe, it, expect } from 'vitest'
import {
  LEARNING_CATEGORIES,
  LEARNING_CATEGORY_IDS,
  learningContentSchema,
  validateLearningContent,
  getLearningCategories,
  getLearningCategoryById,
  getLearningChapterById,
} from './learningContent'

describe('learning content structure', () => {
  it('should have exactly 5 categories', () => {
    expect(LEARNING_CATEGORIES).toHaveLength(5)
  })

  it('should have all required category IDs', () => {
    const ids = LEARNING_CATEGORIES.map((c) => c.id)
    expect(ids).toEqual([...LEARNING_CATEGORY_IDS])
  })

  it('should have stable category order', () => {
    expect(LEARNING_CATEGORIES[0].id).toBe('vehicle')
    expect(LEARNING_CATEGORIES[1].id).toBe('route')
    expect(LEARNING_CATEGORIES[2].id).toBe('loading')
    expect(LEARNING_CATEGORIES[3].id).toBe('lashing')
    expect(LEARNING_CATEGORIES[4].id).toBe('safety')
  })

  it('should have non-empty titles for all categories', () => {
    for (const cat of LEARNING_CATEGORIES) {
      expect(cat.title.length).toBeGreaterThan(0)
    }
  })

  it('should have non-empty descriptions for all categories', () => {
    for (const cat of LEARNING_CATEGORIES) {
      expect(cat.description.length).toBeGreaterThan(0)
    }
  })

  it('should have at least 1 chapter per category', () => {
    for (const cat of LEARNING_CATEGORIES) {
      expect(cat.chapters.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should have objectives for all categories', () => {
    for (const cat of LEARNING_CATEGORIES) {
      expect(cat.objectives.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should have enabled flag for all categories', () => {
    for (const cat of LEARNING_CATEGORIES) {
      expect(cat.enabled).toBe(true)
    }
  })

  it('should have version for all categories', () => {
    for (const cat of LEARNING_CATEGORIES) {
      expect(cat.version.length).toBeGreaterThan(0)
    }
  })
})

describe('learning chapters', () => {
  it('should have non-empty titles for all chapters', () => {
    for (const cat of LEARNING_CATEGORIES) {
      for (const ch of cat.chapters) {
        expect(ch.title.length).toBeGreaterThan(0)
      }
    }
  })

  it('should have non-empty summaries for all chapters', () => {
    for (const cat of LEARNING_CATEGORIES) {
      for (const ch of cat.chapters) {
        expect(ch.summary.length).toBeGreaterThan(0)
      }
    }
  })

  it('should have learning objectives for all chapters', () => {
    for (const cat of LEARNING_CATEGORIES) {
      for (const ch of cat.chapters) {
        expect(ch.learningObjectives.length).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('should have key concepts for all chapters', () => {
    for (const cat of LEARNING_CATEGORIES) {
      for (const ch of cat.chapters) {
        expect(ch.keyConcepts.length).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('should have non-empty content for all chapters', () => {
    for (const cat of LEARNING_CATEGORIES) {
      for (const ch of cat.chapters) {
        expect(ch.content.length).toBeGreaterThan(0)
      }
    }
  })

  it('should have related experiment stages for all chapters', () => {
    for (const cat of LEARNING_CATEGORIES) {
      for (const ch of cat.chapters) {
        expect(ch.relatedExperimentStages.length).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('should have positive estimated minutes for all chapters', () => {
    for (const cat of LEARNING_CATEGORIES) {
      for (const ch of cat.chapters) {
        expect(ch.estimatedMinutes).toBeGreaterThan(0)
      }
    }
  })
})

describe('learning content validation', () => {
  it('should validate all categories with Zod', () => {
    expect(() => validateLearningContent(LEARNING_CATEGORIES)).not.toThrow()
  })

  it('should reject array missing vehicle category', () => {
    const bad = LEARNING_CATEGORIES.filter((c) => c.id !== 'vehicle')
    const result = learningContentSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject array missing route category', () => {
    const bad = LEARNING_CATEGORIES.filter((c) => c.id !== 'route')
    const result = learningContentSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject array missing loading category', () => {
    const bad = LEARNING_CATEGORIES.filter((c) => c.id !== 'loading')
    const result = learningContentSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject array missing lashing category', () => {
    const bad = LEARNING_CATEGORIES.filter((c) => c.id !== 'lashing')
    const result = learningContentSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject array missing safety category', () => {
    const bad = LEARNING_CATEGORIES.filter((c) => c.id !== 'safety')
    const result = learningContentSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it('should reject empty array', () => {
    const result = learningContentSchema.safeParse([])
    expect(result.success).toBe(false)
  })
})

describe('learning content accessors', () => {
  it('should get all categories', () => {
    expect(getLearningCategories()).toHaveLength(5)
  })

  it('should get category by id', () => {
    const cat = getLearningCategoryById('vehicle')
    expect(cat).toBeDefined()
    expect(cat!.title).toBe('车辆知识')
  })

  it('should return undefined for unknown category', () => {
    expect(getLearningCategoryById('unknown' as 'vehicle')).toBeUndefined()
  })

  it('should get chapter by id', () => {
    const result = getLearningChapterById('vehicle-tractor-basics')
    expect(result).toBeDefined()
    expect(result!.chapter.title).toBe('牵引车基础')
    expect(result!.category.id).toBe('vehicle')
  })

  it('should return undefined for unknown chapter', () => {
    expect(getLearningChapterById('nonexistent')).toBeUndefined()
  })
})
