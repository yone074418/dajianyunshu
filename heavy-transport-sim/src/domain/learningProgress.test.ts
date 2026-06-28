import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createLocalStorageLearningProgressRepository,
  type LearningProgressRecord,
} from './learningProgress'

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

const repo = createLocalStorageLearningProgressRepository()

const testRecord: LearningProgressRecord = {
  studentId: 'student-001',
  attemptId: 'attempt-001',
  caseId: 'case-001',
  chapterId: 'vehicle-tractor-basics',
  categoryId: 'vehicle',
  readAt: '2026-01-01T00:00:00.000Z',
}

describe('learningProgress repository', () => {
  it('should return empty array when no progress exists', async () => {
    const ids = await repo.getReadChapterIds('student-001', 'attempt-001')
    expect(ids).toEqual([])
  })

  it('should save and retrieve read chapter', async () => {
    await repo.markChapterRead(testRecord)
    const ids = await repo.getReadChapterIds('student-001', 'attempt-001')
    expect(ids).toEqual(['vehicle-tractor-basics'])
  })

  it('should not duplicate chapters on repeated mark', async () => {
    await repo.markChapterRead(testRecord)
    await repo.markChapterRead(testRecord)
    const ids = await repo.getReadChapterIds('student-001', 'attempt-001')
    expect(ids).toEqual(['vehicle-tractor-basics'])
  })

  it('should check if chapter is read', async () => {
    expect(
      await repo.isChapterRead(
        'student-001',
        'attempt-001',
        'vehicle-tractor-basics',
      ),
    ).toBe(false)
    await repo.markChapterRead(testRecord)
    expect(
      await repo.isChapterRead(
        'student-001',
        'attempt-001',
        'vehicle-tractor-basics',
      ),
    ).toBe(true)
  })

  it('should handle corrupted localStorage', async () => {
    mockStorage.set(
      'heavy-transport-sim:learning-progress:v1:student-001:attempt-001',
      'not-json',
    )
    const ids = await repo.getReadChapterIds('student-001', 'attempt-001')
    expect(ids).toEqual([])
  })

  it('should isolate different students', async () => {
    await repo.markChapterRead(testRecord)
    const ids = await repo.getReadChapterIds('student-other', 'attempt-001')
    expect(ids).toEqual([])
  })
})
