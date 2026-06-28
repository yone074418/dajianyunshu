import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLocalStorageHintUsageRepository } from './hintUsage'

const mockStorage = new Map<string, string>()

beforeEach(() => {
  mockStorage.clear()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) =>
    mockStorage.has(key) ? mockStorage.get(key)! : null,
  )
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
    (key: string, value: string) => {
      mockStorage.set(key, value)
    },
  )
})

const repo = createLocalStorageHintUsageRepository()

describe('hintUsage repository', () => {
  it('should return null when no usage exists', async () => {
    const usage = await repo.getUsage('s1', 'a1', 'step1', 'hint1')
    expect(usage).toBeNull()
  })

  it('should increment view count from 0 to 1', async () => {
    const { record, logEvent } = await repo.incrementViewCount({
      studentId: 's1',
      attemptId: 'a1',
      stepId: 'step1',
      hintId: 'hint1',
      stepName: 'Test Step',
      hintTitle: 'Test Hint',
    })
    expect(record.viewCount).toBe(1)
    expect(logEvent.eventType).toBe('hint_viewed')
    expect(logEvent.hintId).toBe('hint1')
  })

  it('should increment view count on repeated call', async () => {
    await repo.incrementViewCount({
      studentId: 's1',
      attemptId: 'a1',
      stepId: 'step1',
      hintId: 'hint1',
      stepName: 'Test Step',
      hintTitle: 'Test Hint',
    })
    const { record } = await repo.incrementViewCount({
      studentId: 's1',
      attemptId: 'a1',
      stepId: 'step1',
      hintId: 'hint1',
      stepName: 'Test Step',
      hintTitle: 'Test Hint',
    })
    expect(record.viewCount).toBe(2)
  })

  it('should write log event on each view', async () => {
    await repo.incrementViewCount({
      studentId: 's1',
      attemptId: 'a1',
      stepId: 'step1',
      hintId: 'hint1',
      stepName: 'Test Step',
      hintTitle: 'Test Hint',
    })
    await repo.incrementViewCount({
      studentId: 's1',
      attemptId: 'a1',
      stepId: 'step1',
      hintId: 'hint1',
      stepName: 'Test Step',
      hintTitle: 'Test Hint',
    })
    const logs = await repo.getLogs('s1', 'a1')
    expect(logs.length).toBe(2)
    expect(logs[0].eventType).toBe('hint_viewed')
    expect(logs[1].eventType).toBe('hint_viewed')
  })

  it('should include required fields in log event', async () => {
    const { logEvent } = await repo.incrementViewCount({
      studentId: 's1',
      attemptId: 'a1',
      stepId: 'step1',
      hintId: 'hint1',
      stepName: 'Test Step',
      hintTitle: 'Test Hint',
      hintLevel: 'basic',
    })
    expect(logEvent.studentId).toBe('s1')
    expect(logEvent.attemptId).toBe('a1')
    expect(logEvent.stepId).toBe('step1')
    expect(logEvent.hintId).toBe('hint1')
    expect(logEvent.timestamp).toBeDefined()
    expect(logEvent.metadata?.hintLevel).toBe('basic')
  })

  it('should isolate different students', async () => {
    await repo.incrementViewCount({
      studentId: 's1',
      attemptId: 'a1',
      stepId: 'step1',
      hintId: 'hint1',
      stepName: 'Test Step',
      hintTitle: 'Test Hint',
    })
    const usage = await repo.getUsage('s2', 'a1', 'step1', 'hint1')
    expect(usage).toBeNull()
  })

  it('should get usage for step', async () => {
    await repo.incrementViewCount({
      studentId: 's1',
      attemptId: 'a1',
      stepId: 'step1',
      hintId: 'hint1',
      stepName: 'Test Step',
      hintTitle: 'Test Hint',
    })
    await repo.incrementViewCount({
      studentId: 's1',
      attemptId: 'a1',
      stepId: 'step1',
      hintId: 'hint2',
      stepName: 'Test Step',
      hintTitle: 'Test Hint 2',
    })
    const usage = await repo.getUsageForStep('s1', 'a1', 'step1')
    expect(usage.length).toBe(2)
  })

  it('should handle corrupted localStorage gracefully', async () => {
    mockStorage.set('heavy-transport-sim:hint-usage:v1:s1:a1', 'not-json')
    const usage = await repo.getUsage('s1', 'a1', 'step1', 'hint1')
    expect(usage).toBeNull()
  })
})
