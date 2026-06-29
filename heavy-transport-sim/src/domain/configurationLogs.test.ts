import { describe, it, expect, beforeEach } from 'vitest'
import {
  configurationChoiceLogSchema,
  createConfigurationChoiceLog,
  LocalConfigurationLogRepository,
  getErrorCount,
  getModificationCount,
  getLastFailedLog,
  getLastModificationLog,
  sortLogsByTime,
  CONFIGURATION_LOG_EVENT_TYPES,
  type ConfigurationChoiceLog,
} from './configurationLogs'

function makeLog(
  overrides: Partial<ConfigurationChoiceLog> = {},
): ConfigurationChoiceLog {
  return {
    id: 'log-test-001',
    studentId: 'student-001',
    attemptId: 'attempt-001',
    caseId: 'case-001',
    stepId: 'simple_configuration',
    eventType: 'combination_selected',
    actionLabel: '选择组合方式',
    resultStatus: 'selected',
    timestamp: new Date().toISOString(),
    sequence: 1000,
    summary: '选择组合方式：半挂车组合',
    ...overrides,
  }
}

describe('Configuration log types and schema', () => {
  it('CONFIGURATION_LOG_EVENT_TYPES contains all required events', () => {
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('combination_selected')
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('combination_changed')
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('tractor_selected')
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('tractor_changed')
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain(
      'trailer_axle_lines_selected',
    )
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain(
      'trailer_axle_lines_changed',
    )
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('trailer_columns_selected')
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('trailer_columns_changed')
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('configuration_checked')
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('configuration_passed')
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('configuration_failed')
    expect(CONFIGURATION_LOG_EVENT_TYPES).toContain('configuration_blocked')
  })

  it('valid log passes schema validation', () => {
    const result = configurationChoiceLogSchema.safeParse(makeLog())
    expect(result.success).toBe(true)
  })

  it('missing studentId fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({ studentId: '' }),
    )
    expect(result.success).toBe(false)
  })

  it('missing attemptId fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({ attemptId: '' }),
    )
    expect(result.success).toBe(false)
  })

  it('missing caseId fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({ caseId: '' }),
    )
    expect(result.success).toBe(false)
  })

  it('invalid eventType fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({
        eventType: 'invalid_event' as ConfigurationChoiceLog['eventType'],
      }),
    )
    expect(result.success).toBe(false)
  })

  it('failed event without reason fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({ resultStatus: 'failed', reason: undefined }),
    )
    expect(result.success).toBe(false)
  })

  it('failed event with empty reason fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({ resultStatus: 'failed', reason: '' }),
    )
    expect(result.success).toBe(false)
  })

  it('blocked event without reason fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({ resultStatus: 'blocked', reason: undefined }),
    )
    expect(result.success).toBe(false)
  })

  it('failed event with reason passes validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({ resultStatus: 'failed', reason: '重量超出范围' }),
    )
    expect(result.success).toBe(true)
  })

  it('change event with same before/after fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({
        resultStatus: 'changed',
        before: 'same-value',
        after: 'same-value',
      }),
    )
    expect(result.success).toBe(false)
  })

  it('change event with different before/after passes validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({
        resultStatus: 'changed',
        eventType: 'combination_changed',
        before: 'combo-a',
        after: 'combo-b',
      }),
    )
    expect(result.success).toBe(true)
  })

  it('negative sequence fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({ sequence: -1 }),
    )
    expect(result.success).toBe(false)
  })

  it('missing summary fails validation', () => {
    const result = configurationChoiceLogSchema.safeParse(
      makeLog({ summary: '' }),
    )
    expect(result.success).toBe(false)
  })
})

describe('createConfigurationChoiceLog', () => {
  it('generates id and sequence', () => {
    const log = createConfigurationChoiceLog({
      studentId: 's1',
      attemptId: 'a1',
      caseId: 'c1',
      stepId: 'simple_configuration',
      eventType: 'combination_selected',
      actionLabel: '选择',
      resultStatus: 'selected',
      timestamp: new Date().toISOString(),
      summary: '选择组合',
    })
    expect(log.id.length).toBeGreaterThan(0)
    expect(log.sequence).toBeGreaterThan(0)
  })
})

describe('LocalConfigurationLogRepository', () => {
  let repo: LocalConfigurationLogRepository

  beforeEach(() => {
    localStorage.clear()
    repo = new LocalConfigurationLogRepository('test-config-logs')
  })

  it('returns empty array when no logs exist', () => {
    expect(repo.getAll()).toEqual([])
  })

  it('adds and retrieves logs', () => {
    const log = makeLog({ id: 'log-1', sequence: 1 })
    repo.add(log)
    const all = repo.getAll()
    expect(all.length).toBe(1)
    expect(all[0].id).toBe('log-1')
  })

  it('filters by attemptId', () => {
    repo.add(makeLog({ id: 'log-1', attemptId: 'a1', sequence: 1 }))
    repo.add(makeLog({ id: 'log-2', attemptId: 'a2', sequence: 2 }))
    expect(repo.getByAttempt('a1').length).toBe(1)
    expect(repo.getByAttempt('a2').length).toBe(1)
  })

  it('sorts by sequence', () => {
    repo.add(makeLog({ id: 'log-2', sequence: 2000 }))
    repo.add(makeLog({ id: 'log-1', sequence: 1000 }))
    const all = repo.getAll()
    expect(all[0].id).toBe('log-1')
    expect(all[1].id).toBe('log-2')
  })

  it('handles localStorage corruption gracefully', () => {
    localStorage.setItem('test-config-logs', 'not-valid-json!!!')
    const result = repo.getAll()
    expect(result).toEqual([])
  })

  it('handles localStorage with non-array content', () => {
    localStorage.setItem('test-config-logs', '{"not": "array"}')
    const result = repo.getAll()
    expect(result).toEqual([])
  })

  it('skips invalid log entries', () => {
    const valid = makeLog({ id: 'valid', sequence: 1 })
    const invalid = { not: 'a-valid-log' }
    localStorage.setItem('test-config-logs', JSON.stringify([valid, invalid]))
    const result = repo.getAll()
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('valid')
  })

  it('persists across reads', () => {
    repo.add(makeLog({ id: 'log-persist', sequence: 1 }))
    const repo2 = new LocalConfigurationLogRepository('test-config-logs')
    expect(repo2.getAll().length).toBe(1)
  })

  it('clear removes all logs', () => {
    repo.add(makeLog({ id: 'log-1', sequence: 1 }))
    repo.clear()
    expect(repo.getAll()).toEqual([])
  })
})

describe('Log statistics', () => {
  it('getErrorCount counts failed and blocked logs', () => {
    const logs = [
      makeLog({ id: '1', resultStatus: 'failed', reason: 'r', sequence: 1 }),
      makeLog({ id: '2', resultStatus: 'passed', sequence: 2 }),
      makeLog({ id: '3', resultStatus: 'blocked', reason: 'r', sequence: 3 }),
      makeLog({ id: '4', resultStatus: 'selected', sequence: 4 }),
    ]
    expect(getErrorCount(logs)).toBe(2)
  })

  it('getErrorCount returns 0 for empty logs', () => {
    expect(getErrorCount([])).toBe(0)
  })

  it('getModificationCount counts changed logs', () => {
    const logs = [
      makeLog({ id: '1', resultStatus: 'selected', sequence: 1 }),
      makeLog({ id: '2', resultStatus: 'changed', sequence: 2 }),
      makeLog({ id: '3', resultStatus: 'changed', sequence: 3 }),
    ]
    expect(getModificationCount(logs)).toBe(2)
  })

  it('getLastFailedLog returns the last failed log', () => {
    const logs = [
      makeLog({ id: '1', resultStatus: 'failed', reason: 'r1', sequence: 1 }),
      makeLog({ id: '2', resultStatus: 'passed', sequence: 2 }),
      makeLog({ id: '3', resultStatus: 'failed', reason: 'r2', sequence: 3 }),
    ]
    expect(getLastFailedLog(logs)?.id).toBe('3')
  })

  it('getLastFailedLog returns null when no failures', () => {
    const logs = [makeLog({ id: '1', resultStatus: 'passed', sequence: 1 })]
    expect(getLastFailedLog(logs)).toBeNull()
  })

  it('getLastModificationLog returns the last changed log', () => {
    const logs = [
      makeLog({ id: '1', resultStatus: 'changed', sequence: 1 }),
      makeLog({ id: '2', resultStatus: 'selected', sequence: 2 }),
      makeLog({ id: '3', resultStatus: 'changed', sequence: 3 }),
    ]
    expect(getLastModificationLog(logs)?.id).toBe('3')
  })
})

describe('sortLogsByTime', () => {
  it('sorts ascending by default', () => {
    const logs = [
      makeLog({ id: 'b', sequence: 2000 }),
      makeLog({ id: 'a', sequence: 1000 }),
    ]
    const sorted = sortLogsByTime(logs)
    expect(sorted[0].id).toBe('a')
    expect(sorted[1].id).toBe('b')
  })

  it('sorts descending when specified', () => {
    const logs = [
      makeLog({ id: 'a', sequence: 1000 }),
      makeLog({ id: 'b', sequence: 2000 }),
    ]
    const sorted = sortLogsByTime(logs, 'desc')
    expect(sorted[0].id).toBe('b')
    expect(sorted[1].id).toBe('a')
  })

  it('handles empty array', () => {
    expect(sortLogsByTime([])).toEqual([])
  })
})
