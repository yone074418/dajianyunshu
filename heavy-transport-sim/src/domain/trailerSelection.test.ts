import { describe, it, expect } from 'vitest'
import {
  getAxleLineOptions,
  getColumnOptions,
  getAxleColumnRules,
  getAllowedColumnCounts,
  getAllowedAxleLineCounts,
  isCombinationAllowed,
  getCombinationRule,
  validateTrailerSelection,
  AXLE_LINE_OPTIONS,
  COLUMN_OPTIONS,
  AXLE_COLUMN_RULES,
  trailerAxleLineOptionSchema,
  trailerColumnOptionSchema,
  trailerAxleColumnRuleSchema,
  trailerSelectionSchema,
} from './trailerSelection'

describe('Trailer axle line options', () => {
  it('should return axle line options', () => {
    const options = getAxleLineOptions()
    expect(options.length).toBeGreaterThanOrEqual(4)
  })

  it('should have at least 4 axle line options', () => {
    expect(AXLE_LINE_OPTIONS.length).toBeGreaterThanOrEqual(4)
  })

  it('each option has required fields', () => {
    for (const opt of AXLE_LINE_OPTIONS) {
      expect(opt.id.length).toBeGreaterThan(0)
      expect(opt.axleLines).toBeGreaterThan(0)
      expect(opt.label.length).toBeGreaterThan(0)
      expect(opt.description.length).toBeGreaterThan(0)
      expect(opt.applicableScenarios.length).toBeGreaterThanOrEqual(1)
      expect(typeof opt.enabled).toBe('boolean')
      expect(opt.order).toBeGreaterThanOrEqual(0)
    }
  })

  it('axle lines are positive integers', () => {
    for (const opt of AXLE_LINE_OPTIONS) {
      expect(Number.isInteger(opt.axleLines)).toBe(true)
      expect(opt.axleLines).toBeGreaterThan(0)
    }
  })

  it('all axle line options validate against schema', () => {
    for (const opt of AXLE_LINE_OPTIONS) {
      expect(trailerAxleLineOptionSchema.parse(opt)).toEqual(opt)
    }
  })
})

describe('Trailer column options', () => {
  it('should return column options', () => {
    const options = getColumnOptions()
    expect(options.length).toBeGreaterThanOrEqual(2)
  })

  it('should have at least 2 column options', () => {
    expect(COLUMN_OPTIONS.length).toBeGreaterThanOrEqual(2)
  })

  it('each option has required fields', () => {
    for (const opt of COLUMN_OPTIONS) {
      expect(opt.id.length).toBeGreaterThan(0)
      expect(opt.columns).toBeGreaterThan(0)
      expect(opt.label.length).toBeGreaterThan(0)
      expect(opt.description.length).toBeGreaterThan(0)
      expect(opt.applicableScenarios.length).toBeGreaterThanOrEqual(1)
      expect(typeof opt.enabled).toBe('boolean')
      expect(opt.order).toBeGreaterThanOrEqual(0)
    }
  })

  it('columns are positive integers', () => {
    for (const opt of COLUMN_OPTIONS) {
      expect(Number.isInteger(opt.columns)).toBe(true)
      expect(opt.columns).toBeGreaterThan(0)
    }
  })

  it('all column options validate against schema', () => {
    for (const opt of COLUMN_OPTIONS) {
      expect(trailerColumnOptionSchema.parse(opt)).toEqual(opt)
    }
  })
})

describe('Trailer axle-column rules', () => {
  it('should return rules', () => {
    const rules = getAxleColumnRules()
    expect(rules.length).toBeGreaterThan(0)
  })

  it('should have at least 3 allowed combinations', () => {
    const allowed = AXLE_COLUMN_RULES.filter((r) => r.allowed)
    expect(allowed.length).toBeGreaterThanOrEqual(3)
  })

  it('should have at least 3 disallowed combinations', () => {
    const disallowed = AXLE_COLUMN_RULES.filter((r) => !r.allowed)
    expect(disallowed.length).toBeGreaterThanOrEqual(3)
  })

  it('all rules validate against schema', () => {
    for (const rule of AXLE_COLUMN_RULES) {
      expect(trailerAxleColumnRuleSchema.parse(rule)).toEqual(rule)
    }
  })

  it('disallowed rules have non-empty reason', () => {
    const disallowed = AXLE_COLUMN_RULES.filter((r) => !r.allowed)
    for (const rule of disallowed) {
      expect(rule.reason.length).toBeGreaterThan(0)
    }
  })

  it('allowed rules have non-empty teachingNote', () => {
    const allowed = AXLE_COLUMN_RULES.filter((r) => r.allowed)
    for (const rule of allowed) {
      expect(rule.teachingNote.length).toBeGreaterThan(0)
    }
  })
})

describe('Allowed column counts', () => {
  it('4 axle lines allow 1 column', () => {
    expect(getAllowedColumnCounts(4)).toEqual([1])
  })

  it('6 axle lines allow 1 and 2 columns', () => {
    expect(getAllowedColumnCounts(6)).toEqual([1, 2])
  })

  it('8 axle lines allow 1 and 2 columns', () => {
    expect(getAllowedColumnCounts(8)).toEqual([1, 2])
  })

  it('10 axle lines allow 2 columns', () => {
    expect(getAllowedColumnCounts(10)).toEqual([2])
  })

  it('12 axle lines allow 2 and 3 columns', () => {
    expect(getAllowedColumnCounts(12)).toEqual([2, 3])
  })

  it('16 axle lines allow 2 and 3 columns', () => {
    expect(getAllowedColumnCounts(16)).toEqual([2, 3])
  })
})

describe('Allowed axle line counts', () => {
  it('1 column allows 4, 6, 8 axle lines', () => {
    expect(getAllowedAxleLineCounts(1)).toEqual([4, 6, 8])
  })

  it('2 columns allows 6, 8, 10, 12, 16 axle lines', () => {
    expect(getAllowedAxleLineCounts(2)).toEqual([6, 8, 10, 12, 16])
  })

  it('3 columns allows 12, 16 axle lines', () => {
    expect(getAllowedAxleLineCounts(3)).toEqual([12, 16])
  })
})

describe('Combination allowed check', () => {
  it('4+1 is allowed', () => {
    expect(isCombinationAllowed(4, 1)).toBe(true)
  })

  it('6+2 is allowed', () => {
    expect(isCombinationAllowed(6, 2)).toBe(true)
  })

  it('12+3 is allowed', () => {
    expect(isCombinationAllowed(12, 3)).toBe(true)
  })

  it('4+2 is not allowed', () => {
    expect(isCombinationAllowed(4, 2)).toBe(false)
  })

  it('4+3 is not allowed', () => {
    expect(isCombinationAllowed(4, 3)).toBe(false)
  })

  it('6+3 is not allowed', () => {
    expect(isCombinationAllowed(6, 3)).toBe(false)
  })

  it('10+1 is not allowed', () => {
    expect(isCombinationAllowed(10, 1)).toBe(false)
  })

  it('12+1 is not allowed', () => {
    expect(isCombinationAllowed(12, 1)).toBe(false)
  })

  it('16+1 is not allowed', () => {
    expect(isCombinationAllowed(16, 1)).toBe(false)
  })
})

describe('Get combination rule', () => {
  it('returns rule for valid combination', () => {
    const rule = getCombinationRule(4, 1)
    expect(rule).toBeDefined()
    expect(rule!.allowed).toBe(true)
  })

  it('returns disallowed rule with reason', () => {
    const rule = getCombinationRule(4, 3)
    expect(rule).toBeDefined()
    expect(rule!.allowed).toBe(false)
    expect(rule!.reason.length).toBeGreaterThan(0)
  })

  it('returns undefined for non-existent combination', () => {
    const rule = getCombinationRule(99, 99)
    expect(rule).toBeUndefined()
  })
})

describe('Validate trailer selection', () => {
  it('valid selection passes', () => {
    const result = validateTrailerSelection({ axleLines: 4, columns: 1 })
    expect(result.success).toBe(true)
    expect(result.selection).toEqual({ axleLines: 4, columns: 1 })
  })

  it('valid selection 6+2 passes', () => {
    const result = validateTrailerSelection({ axleLines: 6, columns: 2 })
    expect(result.success).toBe(true)
  })

  it('valid selection 12+3 passes', () => {
    const result = validateTrailerSelection({ axleLines: 12, columns: 3 })
    expect(result.success).toBe(true)
  })

  it('disallowed combination 4+3 fails', () => {
    const result = validateTrailerSelection({ axleLines: 4, columns: 3 })
    expect(result.success).toBe(false)
    expect(result.error).toContain('不支持')
  })

  it('disallowed combination 6+3 fails', () => {
    const result = validateTrailerSelection({ axleLines: 6, columns: 3 })
    expect(result.success).toBe(false)
    expect(result.error!.length).toBeGreaterThan(0)
  })

  it('disallowed combination 10+1 fails', () => {
    const result = validateTrailerSelection({ axleLines: 10, columns: 1 })
    expect(result.success).toBe(false)
    expect(result.error!.length).toBeGreaterThan(0)
  })

  it('disallowed combination 12+1 fails', () => {
    const result = validateTrailerSelection({ axleLines: 12, columns: 1 })
    expect(result.success).toBe(false)
    expect(result.error!.length).toBeGreaterThan(0)
  })

  it('disallowed combination 16+1 fails', () => {
    const result = validateTrailerSelection({ axleLines: 16, columns: 1 })
    expect(result.success).toBe(false)
    expect(result.error!.length).toBeGreaterThan(0)
  })

  it('non-existent axle line fails', () => {
    const result = validateTrailerSelection({ axleLines: 99, columns: 1 })
    expect(result.success).toBe(false)
    expect(result.error).toContain('不在可选范围内')
  })

  it('non-existent column fails', () => {
    const result = validateTrailerSelection({ axleLines: 6, columns: 99 })
    expect(result.success).toBe(false)
    expect(result.error).toContain('不在可选范围内')
  })

  it('zero axle lines fails', () => {
    const result = validateTrailerSelection({ axleLines: 0, columns: 1 })
    expect(result.success).toBe(false)
  })

  it('negative columns fails', () => {
    const result = validateTrailerSelection({ axleLines: 6, columns: -1 })
    expect(result.success).toBe(false)
  })

  it('non-integer axle lines fails', () => {
    const result = validateTrailerSelection({ axleLines: 4.5, columns: 1 })
    expect(result.success).toBe(false)
  })
})

describe('Schema validation', () => {
  it('trailerSelectionSchema validates valid input', () => {
    const result = trailerSelectionSchema.safeParse({
      axleLines: 6,
      columns: 2,
    })
    expect(result.success).toBe(true)
  })

  it('trailerSelectionSchema rejects zero', () => {
    const result = trailerSelectionSchema.safeParse({
      axleLines: 0,
      columns: 1,
    })
    expect(result.success).toBe(false)
  })

  it('trailerSelectionSchema rejects negative', () => {
    const result = trailerSelectionSchema.safeParse({
      axleLines: 6,
      columns: -1,
    })
    expect(result.success).toBe(false)
  })

  it('trailerSelectionSchema rejects non-integer', () => {
    const result = trailerSelectionSchema.safeParse({
      axleLines: 4.5,
      columns: 1,
    })
    expect(result.success).toBe(false)
  })
})
